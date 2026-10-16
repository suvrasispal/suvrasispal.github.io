# ADDA Slough website — developer documentation

This folder documents the ADDA Slough website for developers. It is not needed by visitors; it is safe to upload or leave off the server.

## What the site is
A static website for Adda Slough (registered charity 1183906): home, about, events and past-event archive, Durga Pujo 2026 registration, charity (Adda Aid), media coverage, Adda Live, contact, sign-in, legal pages and site search. There is no build step and no database — every page is a plain file that a standard web server can serve.

## Documents
| File | Read it when |
|---|---|
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | You need to understand the folder structure and how pages are put together |
| [DEPLOYMENT.md](DEPLOYMENT.md) | You are publishing the site to a live server |
| [ASSETS.md](ASSETS.md) | You need to know which images are local and which load from the Adda media server |
| [MEDIA_SOURCES.md](MEDIA_SOURCES.md) | You need the full list of external image/video URLs |
| [MAINTENANCE.md](MAINTENANCE.md) | You are changing text, images, events, sponsors or videos |
| [CHECKLIST.md](CHECKLIST.md) | You want to confirm a deployment is healthy |
| ../server/LIVE-STREAMING.md | You are setting up real Adda Live streaming (Cloudflare + Amazon IVS) |

## Quick deploy
1. Upload **everything inside `adda-slough-website/`** to your web root (e.g. `public_html/`), keeping the folder structure.
2. Visit your domain — `index.html` opens the home page.
3. Run through [CHECKLIST.md](CHECKLIST.md).

Full instructions for cPanel/Apache/Nginx, Netlify, Vercel, GitHub Pages and Cloudflare Pages are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Requirements
- Any static web host. HTTPS is strongly recommended (the Adda Live camera check needs it).
- Visitors need an internet connection: most event, family, charity and media images load from `media.adda-slough.org`.
- Cloudflare Pages is only required for real Adda Live broadcasting.

## Known open items
1. Contact and Registration forms validate input but are not yet connected to a back end (no emails are sent).
2. Optional clean URLs (e.g. `/events` → `Events.dc.html`) need host rewrite rules — see DEPLOYMENT.md.
3. Change the Adda Live test sign-in (`addaslough` / `1441`) before any public stream.
