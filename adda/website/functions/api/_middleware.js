/**
 * Adda Live API: Cloudflare Pages middleware that answers every /api/* request (no next(), so no route files are needed).
 *
 * Viewers get read-only endpoints (status, archive). Everything that starts, confirms or ends a
 * stream checks an admin session server-side; hiding buttons in the UI is not the protection.
 * Media runs on an Amazon IVS low-latency channel: the admin's browser broadcasts with the IVS
 * Web Broadcast SDK, viewers watch with the IVS Player, and IVS auto-records each stream to S3.
 * A fresh stream key is minted per stream, given only to the admin who started it, and deleted
 * when the stream ends, so a leaked key stops working.
 */

const SESSION_COOKIE = '__Host-adda_admin';
const SESSION_TTL = 12 * 3600 * 1000;
const LOGIN_WINDOW = 15 * 60 * 1000;
const LOGIN_MAX = 8;
const PBKDF2_MAX_ITER = 100000; // Workers WebCrypto limit
const CHECK_EVERY = 30 * 1000;  // how often a status request may ask IVS whether the channel is broadcasting
const SIGNAL_GRACE = 90 * 1000; // how long a live stream may be silent before it is ended
const START_GRACE = 120 * 1000; // how long a started stream may take to connect
const DUMMY_HASH = 'pbkdf2-sha256$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000';

const enc = new TextEncoder();
const now = () => Date.now();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (h) => Uint8Array.from((h.match(/../g) || []).map((x) => parseInt(x, 16)));
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const randomToken = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); };
const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0;
};

const BASE_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' };
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });
const err = (status, code, message, extra) => json({ error: { code, message } }, status, extra);
const httpError = (status, code, message) => Object.assign(new Error(message), { status, code, expose: true });

/* ---------- routing ---------- */

const ID = '([A-Za-z0-9_-]{1,40})';
const ROUTES = [
  { method: 'GET', re: /^\/live\/status$/, fn: liveStatus },
  { method: 'GET', re: /^\/live\/archive$/, fn: liveArchive },
  { method: 'GET', re: /^\/auth\/me$/, fn: me },
  { method: 'POST', re: /^\/auth\/login$/, fn: login },
  { method: 'POST', re: /^\/auth\/logout$/, fn: logout },
  { method: 'POST', re: /^\/live\/start$/, fn: startStream, auth: true },
  { method: 'POST', re: new RegExp('^/live/streams/' + ID + '/live$'), fn: confirmLive, auth: true },
  { method: 'POST', re: new RegExp('^/live/streams/' + ID + '/end$'), fn: endByAdmin, auth: true },
  { method: 'POST', re: /^\/live\/ivs-events$/, fn: ivsEvents, hook: true }
];

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
  try {
    if (!env.DB) return err(503, 'not_configured', 'The live service is not configured yet.');
    const route = ROUTES.find((r) => r.method === request.method && r.re.test(path));
    if (!route) return ROUTES.some((r) => r.re.test(path)) ? err(405, 'method_not_allowed', 'Method not allowed.') : err(404, 'not_found', 'Unknown endpoint.');
    if (request.method !== 'GET' && !route.hook && !sameOrigin(request, env, url)) return err(403, 'forbidden', 'Request blocked.');
    let admin = null;
    if (route.auth) {
      admin = await currentAdmin(request, env);
      if (!admin) return err(401, 'unauthenticated', 'Sign in as an organiser to do this.');
    }
    return await route.fn({ request, env, url, admin, params: path.match(route.re).slice(1) });
  } catch (e) {
    if (e && e.expose) return err(e.status, e.code, e.message);
    console.error(e && e.stack ? e.stack : e);
    return err(500, 'server_error', 'Something went wrong. Please try again.');
  }
}

// CSRF: state-changing requests must come from our own pages (Origin check + custom header,
// which a cross-site form cannot send). The session cookie is also SameSite=Strict.
function sameOrigin(request, env, url) {
  const allowed = (env.SITE_ORIGIN || url.origin).split(',').map((s) => s.trim());
  return allowed.includes(request.headers.get('origin') || '') && request.headers.get('x-adda-request') === '1';
}

async function readJson(request, max = 8192) {
  const text = await request.text();
  if (text.length > max) throw httpError(413, 'too_large', 'Request too large.');
  if (!text) return {};
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : {}; } catch (e) { throw httpError(400, 'bad_json', 'Invalid request.'); }
}

/* ---------- auth ---------- */

function getCookie(request, name) {
  for (const part of (request.headers.get('cookie') || '').split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}
const sessionCookie = (value, maxAgeSec) => `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSec}`;

async function currentAdmin(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return (await env.DB.prepare('SELECT a.id, a.name, a.username FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token_hash = ? AND s.expires_at > ? AND a.disabled = 0')
    .bind(await sha256(token), now()).first()) || null;
}

async function pbkdf2(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations }, key, 256));
}
async function verifyPassword(password, stored) {
  const [scheme, iter, salt, hash] = String(stored || '').split('$');
  const n = parseInt(iter, 10);
  if (scheme !== 'pbkdf2-sha256' || !n || n > PBKDF2_MAX_ITER || !salt || !hash) return false;
  return safeEqual(await pbkdf2(password, salt, n), hash);
}

async function login({ request, env }) {
  const body = await readJson(request);
  const userId = String(body.userId || body.email || '').trim().toLowerCase().slice(0, 200);
  const password = String(body.password || '').slice(0, 500);
  const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
  const t = now();
  await env.DB.prepare('DELETE FROM login_attempts WHERE at < ?').bind(t - LOGIN_WINDOW).run();
  const tries = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND at > ?').bind(ip, t - LOGIN_WINDOW).first();
  if (tries && tries.n >= LOGIN_MAX) return err(429, 'rate_limited', 'Too many sign-in attempts. Wait 15 minutes and try again.');
  const row = userId ? await env.DB.prepare('SELECT * FROM admins WHERE (username = ?1 OR email = ?1) AND disabled = 0').bind(userId).first() : null;
  const ok = await verifyPassword(password, row ? row.pass_hash : DUMMY_HASH); // same work whether or not the email exists
  if (!row || !ok) {
    await env.DB.prepare('INSERT INTO login_attempts (ip, at) VALUES (?, ?)').bind(ip, t).run();
    return err(401, 'invalid_credentials', 'User ID or password is incorrect.');
  }
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(t).run();
  const token = randomToken(32);
  await env.DB.prepare('INSERT INTO sessions (token_hash, admin_id, created_at, expires_at, ip) VALUES (?, ?, ?, ?, ?)').bind(await sha256(token), row.id, t, t + SESSION_TTL, ip).run();
  return json({ admin: { id: row.id, name: row.name } }, 200, { 'set-cookie': sessionCookie(token, SESSION_TTL / 1000) });
}

async function logout({ request, env }) {
  const token = getCookie(request, SESSION_COOKIE);
  if (token && /^[0-9a-f]{64}$/.test(token)) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}

async function me({ request, env }) {
  const admin = await currentAdmin(request, env);
  if (!admin) return json({ admin: null, active: null });
  const row = await activeRow(env);
  return json({
    admin: { id: admin.id, name: admin.name },
    active: row ? { id: row.id, title: row.title, status: row.status, startedAt: row.went_live_at || row.started_at, isOwner: row.started_by === admin.id } : null
  });
}

/* ---------- streams ---------- */

const activeRow = (env) => env.DB.prepare("SELECT * FROM streams WHERE status IN ('starting','live') ORDER BY started_at DESC LIMIT 1").first();
const getRow = (env, id) => env.DB.prepare('SELECT * FROM streams WHERE id = ?').bind(id).first();
const cleanTitle = (t) => String(t || '').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, '').replace(/\s+/g, ' ').trim();

function publicStream(r, env) {
  let playbackUrl = null;
  if (r.status === 'live') playbackUrl = env.IVS_PLAYBACK_URL || null;
  else if (r.status === 'archived' && r.recording_prefix && env.RECORDINGS_BASE_URL)
    playbackUrl = env.RECORDINGS_BASE_URL.replace(/\/+$/, '') + '/' + r.recording_prefix.replace(/^\/+/, '') + '/media/hls/master.m3u8';
  const started = r.went_live_at || r.started_at;
  return {
    id: r.id, title: r.title, status: r.status, startedAt: started, endedAt: r.ended_at || null,
    durationMs: r.duration_ms != null ? r.duration_ms : (r.ended_at ? r.ended_at - started : null),
    playbackUrl
  };
}

async function liveStatus({ env }) {
  let row = await activeRow(env);
  if (row) row = await reconcile(env, row);
  return json({ live: row && row.status === 'live' ? publicStream(row, env) : null, serverTime: now() });
}

async function liveArchive({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM streams WHERE status IN ('ended','archived') ORDER BY started_at DESC LIMIT 100").all();
  return json({ streams: (results || []).map((r) => publicStream(r, env)) }, 200, { 'cache-control': 'public, max-age=30' });
}

// Keeps the LIVE indicator honest if the organiser's browser closes or loses signal.
async function reconcile(env, row) {
  const t = now();
  if (!ivsConfigured(env) || t - (row.checked_at || 0) < CHECK_EVERY) return row;
  await env.DB.prepare('UPDATE streams SET checked_at = ? WHERE id = ?').bind(t, row.id).run();
  let broadcasting = false;
  try {
    const r = await ivs(env, 'GetStream', { channelArn: env.IVS_CHANNEL_ARN });
    broadcasting = !!(r.stream && r.stream.state === 'LIVE');
  } catch (e) {
    if (e.status !== 404) { console.warn('GetStream failed:', e.message); return row; } // 404 = ChannelNotBroadcasting
  }
  if (broadcasting) {
    await env.DB.prepare("UPDATE streams SET status = 'live', went_live_at = COALESCE(went_live_at, ?), last_seen_at = ? WHERE id = ?").bind(t, t, row.id).run();
    return { ...row, status: 'live', went_live_at: row.went_live_at || t, last_seen_at: t };
  }
  const since = row.last_seen_at || row.started_at;
  if (t - since > (row.last_seen_at ? SIGNAL_GRACE : START_GRACE)) {
    await finish(env, row, row.last_seen_at ? 'signal-lost' : 'never-connected', row.last_seen_at || t);
    return { ...row, status: 'ended' };
  }
  return row;
}

// Ends a stream: 'starting' streams that never connected are marked failed (kept out of the
// archive); live ones become 'archived' if the recording has already finished, else 'ended'.
async function finish(env, row, reason, at) {
  const failed = row.status === 'starting' && !row.went_live_at ? 'failed' : null;
  await env.DB.prepare(
    "UPDATE streams SET status = CASE WHEN ?1 IS NOT NULL THEN ?1 WHEN recording_prefix IS NOT NULL AND duration_ms IS NOT NULL THEN 'archived' ELSE 'ended' END, ended_at = ?2, ended_reason = ?3 WHERE id = ?4 AND status IN ('starting','live')"
  ).bind(failed, at, reason, row.id).run();
  if (ivsConfigured(env)) await revokeIngest(env).catch((e) => console.error('Revoking ingest failed:', e.message));
}

async function startStream({ request, env, admin }) {
  requireIvs(env);
  const title = cleanTitle((await readJson(request)).title);
  if (title.length < 3 || title.length > 80) return err(400, 'invalid_title', 'Enter a title between 3 and 80 characters.');
  const active = await activeRow(env);
  if (active) {
    if (active.status === 'starting' && active.started_by === admin.id) await finish(env, active, 'replaced', now());
    else return err(409, 'already_live', active.started_by === admin.id ? 'You already have a stream running. End it before starting another.' : 'Another organiser is already streaming. Only one stream can run at a time.');
  }
  const id = 'st_' + randomToken(9);
  const t = now();
  await env.DB.prepare("INSERT INTO streams (id, title, status, started_by, started_at, checked_at) VALUES (?, ?, 'starting', ?, ?, ?)").bind(id, title, admin.id, t, t).run();
  const { results: act } = await env.DB.prepare("SELECT id FROM streams WHERE status IN ('starting','live') ORDER BY started_at, id").all();
  if (act.length > 1 && act[0].id !== id) { // another organiser won a simultaneous start
    await env.DB.prepare("UPDATE streams SET status = 'failed', ended_at = ?, ended_reason = 'conflict' WHERE id = ?").bind(now(), id).run();
    return err(409, 'already_live', 'Another organiser is already streaming. Only one stream can run at a time.');
  }
  let streamKey;
  try { streamKey = await issueIngestKey(env); } catch (e) {
    console.error('Issuing stream key failed:', e.message);
    await env.DB.prepare("UPDATE streams SET status = 'failed', ended_at = ?, ended_reason = 'ingest-error' WHERE id = ?").bind(now(), id).run();
    return err(502, 'ingest_unavailable', 'The streaming service couldn’t be reached. Please try again in a minute.');
  }
  return json({ stream: { id, title, status: 'starting' }, ingest: { endpoint: env.IVS_INGEST_ENDPOINT, streamKey } });
}

async function ownedRow(env, admin, id) {
  const row = await getRow(env, id);
  if (!row) throw httpError(404, 'not_found', 'Stream not found.');
  if (row.started_by !== admin.id) throw httpError(403, 'not_owner', 'Only the organiser who started this stream can control it.');
  return row;
}

async function confirmLive({ env, admin, params }) {
  const row = await ownedRow(env, admin, params[0]);
  if (row.status !== 'starting' && row.status !== 'live') return err(409, 'not_active', 'This stream has already ended.');
  const t = now();
  await env.DB.prepare("UPDATE streams SET status = 'live', went_live_at = COALESCE(went_live_at, ?), last_seen_at = ? WHERE id = ?").bind(t, t, row.id).run();
  return json({ stream: publicStream({ ...row, status: 'live', went_live_at: row.went_live_at || t }, env) });
}

async function endByAdmin({ request, env, admin, params }) {
  const row = await ownedRow(env, admin, params[0]);
  const reason = (await readJson(request)).reason === 'failed' ? 'broadcast-failed' : 'ended-by-organiser';
  if (row.status === 'starting' || row.status === 'live') await finish(env, row, reason, now());
  return json({ stream: publicStream(await getRow(env, row.id), env) });
}

// Amazon EventBridge -> API destination. Authenticated with a shared secret header.
async function ivsEvents({ request, env }) {
  if (!env.HOOK_SECRET || !safeEqual(request.headers.get('x-adda-hook-secret') || '', env.HOOK_SECRET)) return err(401, 'unauthenticated', 'Not allowed.');
  const ev = await readJson(request, 64 * 1024);
  if (ev.source !== 'aws.ivs' || !(ev.resources || []).includes(env.IVS_CHANNEL_ARN)) return json({ ignored: true });
  const d = ev.detail || {};
  const t = Date.parse(ev.time) || now();
  if (ev['detail-type'] === 'IVS Stream State Change') {
    const row = await activeRow(env);
    if (!row) return json({ ok: true });
    if (d.event_name === 'Stream Start')
      await env.DB.prepare("UPDATE streams SET status = 'live', went_live_at = COALESCE(went_live_at, ?), last_seen_at = ?, ivs_stream_id = COALESCE(ivs_stream_id, ?) WHERE id = ?").bind(t, t, d.stream_id || null, row.id).run();
    else if (d.event_name === 'Stream End') // starts the grace period; reconcile() ends it if the signal doesn't return
      await env.DB.prepare('UPDATE streams SET last_seen_at = ? WHERE id = ?').bind(t, row.id).run();
  } else if (ev['detail-type'] === 'IVS Recording State Change') {
    let row = d.stream_id ? await env.DB.prepare('SELECT * FROM streams WHERE ivs_stream_id = ?').bind(d.stream_id).first() : null;
    if (!row) row = await env.DB.prepare("SELECT * FROM streams WHERE status IN ('starting','live') OR (status = 'ended' AND ended_at > ?) ORDER BY started_at DESC LIMIT 1").bind(t - 6 * 3600 * 1000).first();
    if (!row) return json({ ok: true, unmatched: true });
    const prefix = d.recording_s3_key_prefix || null;
    if (d.recording_status === 'Recording Start')
      await env.DB.prepare('UPDATE streams SET recording_prefix = COALESCE(recording_prefix, ?), ivs_stream_id = COALESCE(ivs_stream_id, ?) WHERE id = ?').bind(prefix, d.stream_id || null, row.id).run();
    else if (d.recording_status === 'Recording End')
      await env.DB.prepare("UPDATE streams SET recording_prefix = COALESCE(recording_prefix, ?), duration_ms = ?, status = CASE WHEN status = 'ended' THEN 'archived' ELSE status END WHERE id = ?").bind(prefix, Number(d.recording_duration_ms) || null, row.id).run();
  }
  return json({ ok: true });
}

/* ---------- Amazon IVS (SigV4-signed control-plane calls) ---------- */

const IVS_VARS = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'IVS_CHANNEL_ARN', 'IVS_INGEST_ENDPOINT', 'IVS_PLAYBACK_URL'];
const ivsConfigured = (env) => IVS_VARS.every((k) => !!env[k]);
function requireIvs(env) { if (!ivsConfigured(env)) throw httpError(503, 'not_configured', 'The streaming service is not configured yet.'); }

async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(data));
}

async function ivs(env, action, payload) {
  const region = env.AWS_REGION, host = `ivs.${region}.amazonaws.com`, body = JSON.stringify(payload);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const day = amzDate.slice(0, 8);
  const canonical = ['POST', '/' + action, '', 'content-type:application/json', 'host:' + host, 'x-amz-date:' + amzDate, '', 'content-type;host;x-amz-date', await sha256(body)].join('\n');
  const scope = `${day}/${region}/ivs/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256(canonical)].join('\n');
  let key = await hmac('AWS4' + env.AWS_SECRET_ACCESS_KEY, day);
  key = await hmac(key, region); key = await hmac(key, 'ivs'); key = await hmac(key, 'aws4_request');
  const signature = hex(await hmac(key, toSign));
  const res = await fetch(`https://${host}/${action}`, {
    method: 'POST', body,
    headers: { 'content-type': 'application/json', 'x-amz-date': amzDate, authorization: `AWS4-HMAC-SHA256 Credential=${env.AWS_ACCESS_KEY_ID}/${scope}, SignedHeaders=content-type;host;x-amz-date, Signature=${signature}` }
  });
  const text = await res.text();
  let data = {}; try { data = text ? JSON.parse(text) : {}; } catch (e) { /* non-JSON error body */ }
  if (!res.ok) throw Object.assign(new Error(`IVS ${action} ${res.status}: ${data.message || data.Message || text.slice(0, 200)}`), { status: res.status });
  return data;
}

async function deleteKeys(env) {
  const { streamKeys = [] } = await ivs(env, 'ListStreamKeys', { channelArn: env.IVS_CHANNEL_ARN });
  for (const k of streamKeys) await ivs(env, 'DeleteStreamKey', { arn: k.arn });
}
async function issueIngestKey(env) {
  await deleteKeys(env); // IVS allows one key per channel; replacing it invalidates any older key
  const { streamKey } = await ivs(env, 'CreateStreamKey', { channelArn: env.IVS_CHANNEL_ARN });
  return streamKey.value;
}
async function revokeIngest(env) {
  try { await ivs(env, 'StopStream', { channelArn: env.IVS_CHANNEL_ARN }); } catch (e) { if (e.status !== 404) throw e; }
  await deleteKeys(env);
}
