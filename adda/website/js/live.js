/* Adda Live: browser client for the live-streaming API (functions/api).
   Shared by SiteHeader (LIVE indicator) and Live.dc.html (player, archive, organiser controls).
   Emits `adda-live` on window with the current state whenever it changes. */
(function () {
  if (window.AddaLive) return;
  const API = (window.ADDA_LIVE_API || '/api').replace(/\/$/, '');
  const SDK = {
    player: 'https://player.live-video.net/1.48.0/amazon-ivs-player.min.js',
    broadcast: 'https://web-broadcast.live-video.net/1.28.0/amazon-ivs-web-broadcast.js'
  };
  const POLL_MS = 15000;
  // Test sign-in: works ONLY while the live service (/api) isn't deployed, so organisers can try the
  // flow and camera on any device. It unlocks no server action (start() refuses in test mode), and is
  // ignored automatically once the real service answers, when server-side auth takes over.
  const TEST_KEY = 'adda-live-test-admin';
  const TEST_HASH = 'b672726464fbaa8b4ee143f61fcf33b068fcebab927ad12b50609583dbd43610';
  const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const testAdmin = () => { try { return sessionStorage.getItem(TEST_KEY) === '1' ? { id: 'test', name: 'addaslough', test: true } : null; } catch (e) { return null; } };
  const setTest = (on) => { try { if (on) sessionStorage.setItem(TEST_KEY, '1'); else sessionStorage.removeItem(TEST_KEY); } catch (e) {} };
  const state = { ready: false, available: null, live: null, admin: null, active: null, adminChecked: false, preview: false };
  let preview = null;
  const get = () => (preview ? { ...state, ...preview, ready: true, adminChecked: true, preview: true } : { ...state });
  const emit = () => window.dispatchEvent(new CustomEvent('adda-live', { detail: get() }));
  const fail = (code, message, status) => Object.assign(new Error(message), { code, status: status || 0 });

  async function call(path, opts) {
    opts = opts || {};
    const method = opts.method || 'GET';
    const headers = {};
    if (method !== 'GET') headers['x-adda-request'] = '1';
    if (opts.body) headers['content-type'] = 'application/json';
    let res;
    try { res = await fetch(API + path, { method, headers, credentials: 'same-origin', cache: 'no-store', body: opts.body ? JSON.stringify(opts.body) : undefined }); }
    catch (e) { if (location.protocol === 'file:') throw fail('unavailable', 'The live service isn’t available when the site is opened from a folder.'); throw fail('network', 'Can’t reach the live service. Check your connection and try again.'); }
    if (!(res.headers.get('content-type') || '').includes('application/json')) throw fail('unavailable', 'The live service isn’t connected to this website yet.', res.status);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw fail((data.error && data.error.code) || 'error', (data.error && data.error.message) || 'Something went wrong. Please try again.', res.status);
    return data;
  }

  async function refresh() {
    try { const s = await call('/live/status'); state.available = true; state.live = s.live || null; }
    catch (e) { state.available = false; state.live = null; }
    state.ready = true; emit(); return get();
  }
  async function refreshMe() {
    try { const m = await call('/auth/me'); state.admin = m.admin || null; state.active = m.active || null; setTest(false); }
    catch (e) { state.admin = e.code === 'unavailable' ? testAdmin() : null; state.active = null; }
    state.adminChecked = true; emit(); return get();
  }

  let timer = null, watchers = 0;
  const onVis = () => { if (!document.hidden) refresh(); };
  function watch() {
    watchers++;
    if (!timer) {
      refresh(); refreshMe();
      timer = setInterval(() => { if (!document.hidden) refresh(); }, POLL_MS);
      document.addEventListener('visibilitychange', onVis);
    }
    let done = false;
    return () => { if (done) return; done = true; if (--watchers <= 0) { clearInterval(timer); timer = null; document.removeEventListener('visibilitychange', onVis); } };
  }

  const scripts = {};
  function loadScript(src) {
    if (!scripts[src]) scripts[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = resolve; s.onerror = () => { delete scripts[src]; reject(fail('sdk', 'A streaming component didn’t load. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
    return scripts[src];
  }

  /* ----- camera + microphone ----- */
  const AUDIO = { echoCancellation: false, noiseSuppression: false, autoGainControl: false }; // keep music and dhak natural
  const media = {
    supported: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext),
    async cameras() {
      const all = await navigator.mediaDevices.enumerateDevices();
      return all.filter((d) => d.kind === 'videoinput').map((d, i) => ({ id: d.deviceId, label: d.label || 'Camera ' + (i + 1) }));
    },
    async open(deviceId) {
      const video = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
      if (deviceId) video.deviceId = { exact: deviceId }; else video.facingMode = { ideal: 'environment' };
      try { return { stream: await navigator.mediaDevices.getUserMedia({ video, audio: AUDIO }), mic: true }; }
      catch (e) {
        if (e && (e.name === 'NotFoundError' || e.name === 'NotReadableError')) { // camera may be fine and only the mic missing or busy
          try { return { stream: await navigator.mediaDevices.getUserMedia({ video }), mic: false }; } catch (e2) { throw e2; }
        }
        throw e;
      }
    },
    explain(e) {
      const n = e && e.name;
      if (!window.isSecureContext) return { title: 'Camera needs a secure connection', body: 'Browsers only allow camera access on pages served over https.', steps: ['Open this page at its https:// address, then try again.'] };
      if (!navigator.mediaDevices || n === 'Unsupported') return { title: 'This browser can’t use a camera', body: 'Streaming from the website needs a current browser.', steps: ['Use the latest Chrome, Edge or Safari (desktop, Android or iPhone).'] };
      if (n === 'NotAllowedError' || n === 'SecurityError') return { title: 'Camera access is blocked', body: 'Your browser or device is not allowing this page to use the camera and microphone.', steps: ['Click the camera or padlock icon in the address bar and set Camera and Microphone to Allow.', 'iPhone or iPad: Settings › Safari › Camera and Microphone › Allow.', 'Android: Chrome › Settings › Site settings › Camera › allow this site.', 'Mac: System Settings › Privacy & Security › Camera › turn on your browser.', 'Then press Try again.'] };
      if (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'DevicesNotFoundError') return { title: 'No camera found', body: 'We couldn’t detect a camera on this device.', steps: ['Connect a camera, or use a phone or laptop with a built-in camera.', 'If it’s a USB camera, unplug it, plug it back in and wait a few seconds.', 'Then press Try again.'] };
      if (n === 'NotReadableError' || n === 'TrackStartError' || n === 'AbortError') return { title: 'The camera is busy', body: 'Another app or tab is using the camera.', steps: ['Close Zoom, Teams, FaceTime or other tabs that use the camera.', 'Then press Try again.'] };
      return { title: 'The camera couldn’t start', body: (e && e.message) || 'Unknown error.', steps: ['Reload the page and try again.', 'If it keeps happening, try Chrome, Edge or Safari.'] };
    }
  };

  /* ----- broadcasting (organisers) ----- */
  async function broadcast({ ingest, mediaStream, onState }) {
    await loadScript(SDK.broadcast);
    const B = window.IVSBroadcastClient;
    if (!B) throw fail('sdk', 'The streaming component didn’t load. Try again.');
    if (B.isSupported && !B.isSupported()) throw fail('unsupported', 'This browser can’t stream. Use the latest Chrome, Edge or Safari.');
    const vt = mediaStream.getVideoTracks()[0];
    if (!vt) throw fail('no_camera', 'No camera is selected.');
    const s = vt.getSettings ? vt.getSettings() : {};
    const portrait = (s.height || 0) > (s.width || 0);
    const client = B.create({ streamConfig: portrait ? B.BASIC_PORTRAIT : B.BASIC_LANDSCAPE, ingestEndpoint: ingest.endpoint });
    const ev = B.BroadcastClientEvents || {};
    if (onState && ev.CONNECTION_STATE_CHANGE) client.on(ev.CONNECTION_STATE_CHANGE, (st) => onState(String(st).toLowerCase()));
    if (onState && ev.ERROR) client.on(ev.ERROR, () => onState('error'));
    await client.addVideoInputDevice(new MediaStream([vt]), 'camera', { index: 0 });
    const at = mediaStream.getAudioTracks()[0];
    if (at) await client.addAudioInputDevice(new MediaStream([at]), 'mic');
    await client.startBroadcast(ingest.streamKey);
    let lock = null;
    try { if (navigator.wakeLock) lock = await navigator.wakeLock.request('screen'); } catch (e) { /* optional */ }
    return {
      stop() { try { client.stopBroadcast(); } catch (e) {} if (lock) { lock.release().catch(() => {}); lock = null; } },
      dispose() { this.stop(); try { client.delete && client.delete(); } catch (e) {} }
    };
  }

  /* ----- playback (everyone) ----- */
  async function play(videoEl, url, opts) {
    const live = !!(opts && opts.live), on = (opts && opts.onState) || (() => {});
    let P = null;
    try { await loadScript(SDK.player); P = window.IVSPlayer; } catch (e) { P = null; }
    if (P && P.isPlayerSupported) {
      const player = P.create();
      player.attachHTMLVideoElement(videoEl);
      const S = P.PlayerState || {}, E = P.PlayerEventType || {};
      let retry = null;
      if (S.PLAYING) player.addEventListener(S.PLAYING, () => on('playing'));
      if (S.BUFFERING) player.addEventListener(S.BUFFERING, () => on('buffering'));
      if (S.ENDED) player.addEventListener(S.ENDED, () => on('ended'));
      if (E.ERROR) player.addEventListener(E.ERROR, () => {
        on('error');
        if (live) { clearTimeout(retry); retry = setTimeout(() => { player.load(url); player.play(); }, 5000); }
      });
      on('buffering');
      player.setAutoplay(true);
      player.load(url);
      return { destroy() { clearTimeout(retry); try { player.pause(); player.delete(); } catch (e) {} } };
    }
    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      const h = { playing: () => on('playing'), waiting: () => on('buffering'), error: () => on('error'), ended: () => on('ended') };
      Object.keys(h).forEach((k) => videoEl.addEventListener(k, h[k]));
      videoEl.src = url; videoEl.play().catch(() => {});
      return { destroy() { Object.keys(h).forEach((k) => videoEl.removeEventListener(k, h[k])); videoEl.removeAttribute('src'); videoEl.load(); } };
    }
    throw fail('unsupported', 'This browser can’t play the stream. Try Chrome, Edge, Firefox or Safari.');
  }

  window.AddaLive = {
    get, watch, refresh, refreshMe, media, broadcast, play,
    archive: () => call('/live/archive'),
    async login(userId, password) {
      try { const r = await call('/auth/login', { method: 'POST', body: { userId, password } }); setTest(false); await refreshMe(); return r; }
      catch (e) {
        if (e.code !== 'unavailable') throw e;
        if ((await sha(String(userId).trim().toLowerCase() + ':' + password)) !== TEST_HASH) throw fail('invalid_credentials', 'User ID or password is incorrect.', 401);
        setTest(true); state.admin = testAdmin(); state.adminChecked = true; emit();
        return { admin: state.admin, test: true };
      }
    },
    logout: () => { setTest(false); return call('/auth/logout', { method: 'POST' }).catch(() => {}).then(() => { state.admin = null; state.active = null; emit(); }); },
    start: (title) => (state.admin && state.admin.test
      ? Promise.reject(fail('test_mode', 'Your camera works on this device. Going live needs the streaming service connected first (see server/LIVE-STREAMING.md); until then this sign-in is for testing only.'))
      : call('/live/start', { method: 'POST', body: { title } })),
    confirm: (id) => call('/live/streams/' + encodeURIComponent(id) + '/live', { method: 'POST' }),
    end: (id, reason) => call('/live/streams/' + encodeURIComponent(id) + '/end', { method: 'POST', body: { reason: reason || 'admin' } }),
    // Design-review only: Live.dc.html sets this from its `preview` prop so reviewers can see each state.
    // The deployed page never passes the prop, so visitors always get real data.
    setPreview(p) { preview = p || null; emit(); }
  };
  window.dispatchEvent(new Event('adda-live-ready'));
})();
