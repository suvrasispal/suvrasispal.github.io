# Adda Live: architecture and setup

## 1. Assessment of the current site

The Adda website is a **static site**: HTML pages, CSS and JavaScript, uploaded to any static host. It has:

- no server code and no database (all content is in `js/site.js` or in the pages);
- no working authentication (the Sign in, Contact and Registration forms validate in the browser but aren’t connected to a back end);
- no media server or video CDN.

So the current site **can’t do live streaming on its own**. Live video needs an ingest server that accepts the camera feed, transcoding, a CDN to deliver it to many viewers, storage for recordings, and a back end that decides who may start a stream. Hiding a button in a static page is not security, because anyone can call an endpoint directly.

## 2. Recommended architecture

```
 Organiser's browser                 Cloudflare Pages (same domain as the site)          Amazon Web Services
 ───────────────────                 ──────────────────────────────────────────          ───────────────────
 Live.dc.html + js/live.js  ──HTTPS──▶ /api/*  functions/api/_middleware.js ──SigV4─▶  IVS control API
   camera ▶ IVS Web Broadcast SDK       • admin login, session cookie                    (stream keys, stop, status)
        └───────── WebRTC ingest ───────────────────────────────────────────────────▶  IVS low-latency channel
                                        D1 database (server/schema.sql)                         │ auto-record
 Viewers' browsers                      • admins, sessions, streams                         ▼
   IVS Player ◀──────────── HLS (2–5 s latency) ─────────────────────────────────────  IVS playback CDN
   recordings ◀──────────── HLS ────────────────────────────── CloudFront ◀───────── S3 bucket (recordings)
                                        /api/live/ivs-events ◀── EventBridge (stream + recording events)
```

| Need | Choice | Why |
| --- | --- | --- |
| Streaming platform | **Amazon IVS, low-latency channel** | Managed ingest, transcoding and global CDN; pay per hour used; no servers to run. |
| Browser ingest | **IVS Web Broadcast SDK** (WebRTC to IVS) | Organisers stream straight from a phone or laptop browser. OBS/RTMPS also works with the same channel. |
| Playback | **IVS Player SDK** (HLS) | Works on all modern browsers including iPhone; scales to any audience. |
| Recordings | **IVS auto-record to S3, served by CloudFront** | Every stream is saved automatically for the archive. |
| Back end, auth, stream management | **Cloudflare Pages Functions** | Runs on the same domain as the site, so the admin cookie is first-party and `SameSite=Strict`. |
| Database | **Cloudflare D1** | Titles, status, timings, recording paths, organisers and sessions. |

**Why not Cloudflare Stream?** Its browser (WHIP/WebRTC) ingest still can’t be recorded or played as HLS, so there would be no archive. **Why not YouTube Live embeds?** Possible as a fallback, but streams would sit on YouTube’s branding and terms, and starting a stream from the Adda site needs YouTube API approval.

## 3. Security model (enforced on the server)

- **Admins only.** `POST /api/live/start`, `/live/streams/:id/live` and `/live/streams/:id/end` reject any request without a valid organiser session (`401`). Viewer endpoints (`/live/status`, `/live/archive`) are read-only.
- **Owner only.** Confirming or ending a stream also checks that the session belongs to the organiser who started it (`403` otherwise).
- **Sessions.** Passwords are stored as PBKDF2-SHA256 hashes. Sign-in creates a random 256-bit token; only its SHA-256 is stored. The cookie is `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`, 12 hours. Sign-in is rate-limited per IP (8 failures per 15 minutes).
- **CSRF.** Every state-changing request must carry the site’s `Origin` and an `x-adda-request` header that a cross-site form can’t send.
- **Stream keys.** Viewers never see an ingest key. A new key is created for each stream, returned once to the organiser who started it, and deleted (and the broadcast force-stopped) when the stream ends. A copied key stops working afterwards.
- **IVS credentials** live only in Cloudflare secrets. The IAM user can touch only the one channel.
- **Webhook.** `/api/live/ivs-events` accepts only requests with the shared `x-adda-hook-secret` and only events for the configured channel.
- **Stale streams.** If the organiser’s browser closes or loses signal, the API checks IVS and ends the stream after 90 seconds without video, so the green LIVE dot never shows for a dead stream.

## 4. Stream lifecycle

1. Organiser signs in (Adda Live › Organiser sign-in) and clicks **Start streaming**.
2. They enter the title (“What is this stream for?”), then the camera check runs: permission prompt, camera detection and selection, live preview, microphone check. Nothing is sent yet.
3. **Start streaming** → `POST /live/start` (row `starting`, fresh key) → browser connects to IVS → `POST /live/streams/:id/live` (row `live`). The menu dot and the Live page update for everyone within 15 seconds.
4. **End streaming** → `POST /live/streams/:id/end` → IVS stopped, key deleted, row `ended`.
5. EventBridge sends *Recording End* → row `archived` with its S3 path, and it becomes playable under Previous streams.

## 5. Setup (about an hour, once)

### AWS (region `eu-west-1`, Ireland)
1. **S3 bucket** for recordings (e.g. `adda-live-recordings`). Block public access. Don’t use KMS encryption, because IVS recording doesn’t support it.
2. **IVS recording configuration** pointing at the bucket. Thumbnails optional.
3. **IVS channel**: type *Low latency*, *Basic* (up to 720p, cheapest) or *Standard* (1080p, multiple qualities), authorisation **off** (public playback), attach the recording configuration. Note the **Channel ARN**, **Ingest server** and **Playback URL**.
4. **CloudFront distribution** for the bucket with Origin Access Control, plus a response-headers policy allowing CORS `GET` from `https://adda-slough.org`.
5. **IAM user** `adda-live-api` with an access key and only this policy:
   ```json
   { "Version": "2012-10-17", "Statement": [{ "Effect": "Allow",
     "Action": ["ivs:CreateStreamKey", "ivs:DeleteStreamKey", "ivs:ListStreamKeys", "ivs:StopStream", "ivs:GetStream"],
     "Resource": ["arn:aws:ivs:eu-west-1:ACCOUNT_ID:channel/CHANNEL_ID", "arn:aws:ivs:eu-west-1:ACCOUNT_ID:stream-key/*"] }] }
   ```
6. **EventBridge**: create a *Connection* (API key auth, header `x-adda-hook-secret`, value = a long random string), an *API destination* `POST https://adda-slough.org/api/live/ivs-events`, and a rule:
   ```json
   { "source": ["aws.ivs"], "detail-type": ["IVS Stream State Change", "IVS Recording State Change"], "resources": ["<Channel ARN>"] }
   ```

### Cloudflare
1. Host the site on **Cloudflare Pages** (free). If the site must stay on its current host, put the domain behind Cloudflare and route `/api/*` to the Pages project instead; the API has to stay on the same domain as the pages.
2. `npx wrangler d1 create adda-live`, then put the `database_id` in `wrangler.toml`.
3. `npx wrangler d1 execute adda-live --remote --file=server/schema.sql`
4. Fill in the `[vars]` in `wrangler.toml` with the IVS and CloudFront values above.
5. `npx wrangler pages secret put AWS_ACCESS_KEY_ID`, then the same for `AWS_SECRET_ACCESS_KEY` and `HOOK_SECRET` (the EventBridge value).
6. Add organisers: `node server/create-admin.mjs "Name" userid > admin.sql`, then `npx wrangler d1 execute adda-live --remote --file=admin.sql`, then delete `admin.sql`. To revoke one: `UPDATE admins SET disabled = 1 WHERE username = '…'`. The test organiser (`addaslough` / `1441`) can be added with `--file=server/seed-test-admin.sql`; replace or disable it before the first public stream.
7. Deploy from the website folder: `npx wrangler pages deploy .` (or connect the GitHub repository in Cloudflare Pages: build command empty, output directory `/`).

### Check before the first event
- Signed out: Adda Live shows “Not live right now”. There’s no Start button, and `curl -X POST https://adda-slough.org/api/live/start` returns `403` or `401`.
- Signed in on a phone: start a test stream, watch it from another device, and check the green dot in the menu. End it, wait for the recording to appear under Previous streams, then play it.
- Close the organiser’s tab mid-stream: within about two minutes the dot goes and the stream is marked ended.

## 6. Operating notes
- Browser streaming suits a phone or laptop at the venue. For a multi-camera pujo production, stream from OBS (or a hardware encoder) to the same channel’s RTMPS ingest. Admins still start and end the stream on the website, which issues the key.
- Keep the organiser’s device plugged in, on reliable Wi-Fi or 5G, with this page open. The page keeps the screen awake while live.
- One stream at a time. Recordings stay in S3 until you delete them. Add an S3 lifecycle rule if storage costs matter.
- Costs: IVS charges per hour of input plus per hour of viewing, and S3/CloudFront charge for storage and delivery. Check current AWS pricing for your expected audience.
