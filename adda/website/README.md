# ADDA Slough website

A ready-to-upload website. **This folder is the website root**: `index.html` is at the top and every file sits in its own folder. There's no build step.

## Folder layout

```
adda-slough-website/
├── index.html              Start page (opens Home.dc.html)
├── Home.dc.html …          One file per page (list below)
├── SiteHeader.dc.html      Shared header: navigation, search, Adda Live dot
├── SiteFooter.dc.html      Shared footer
├── AidYear, Coverage, EventArchive, Legal (.dc.html)   Shared page templates
├── support.js              Page runtime (needed by every page)
├── .nojekyll               Keep it: needed by GitHub Pages
├── css/                    modernist.css (design system), theme.css (ADDA colours)
├── js/                     site.js (site data + search), live.js (Adda Live), img-fallback.js,
│                           imageslot.js, offline-bundle.js (only used when opened from a folder)
├── data/                   imageslots.json
├── images/                 Banner photographs (Unsplash) + favicons
├── assets/images/          Local Adda images: logo, About photo, pandal photo, Nexyra logo, sponsors
├── scripts/                build-offline-bundle.mjs
├── developer/              Developer documentation (start with developer/README.md)
├── functions/api/          Adda Live server code (runs only on Cloudflare Pages)
├── server/                 Adda Live setup: schema.sql, seed-test-admin.sql, create-admin.mjs, LIVE-STREAMING.md
└── wrangler.toml           Cloudflare Pages settings (Adda Live)
```

## Deploy

### Any web host (cPanel, Apache, Nginx, Netlify, Vercel…)
Upload **everything in this folder** to the web root (e.g. `public_html/`), keeping the folders. Visit your domain and `index.html` opens the home page.

### GitHub Pages
1. Create a repository and upload the contents of this folder (so `index.html` is at the top of the repository). Include `.nojekyll`.
2. Go to **Settings › Pages › Build and deployment**, choose *Deploy from a branch*, branch `main`, folder `/ (root)`, then save.
3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two. Add your domain under *Custom domain* if needed.

### Cloudflare Pages (needed for real Adda Live streaming)
Connect the same GitHub repository (build command: none; output directory: `/`), or run `npx wrangler pages deploy .` here. Then follow **server/LIVE-STREAMING.md**.

### Opening on your computer
Double-click `index.html`. The pages, header and footer work offline from the folder, but the browser still needs internet for the page engine and most images. Adda Live runs in test mode: sign in on Member sign-in with **addaslough / 1441** to try the organiser screens and camera check. Real streaming needs a live server (see below).

## Adda Live
- On any host, Adda Live shows “Not live right now”. The test organiser sign-in lets you try the screens and camera on phones and laptops. The camera needs **https** (or a file opened from your computer).
- Real broadcasting, the green LIVE dot and recordings need Cloudflare Pages + Amazon IVS: see **server/LIVE-STREAMING.md**.
- Change the test password (`addaslough` / `1441`) before any public stream.
- `server/` contains no passwords or keys (those are set as Cloudflare secrets). It's safe to upload, but you may leave it off a plain web host.

## Editing pages
Edit any `.dc.html` file in a text editor. If you also want the site to work when opened from a folder, run `node scripts/build-offline-bundle.mjs` afterwards. Web servers don't need this step.

## Images
ADDA event, family, charity, promotion and press images (and the ABP News video) load directly from https://media.adda-slough.org/public/. Kept locally: the Adda logo, About photo, Durga Pujo pandal photo, Nexyra logo, sponsor logos (`assets/images/`) and Unsplash banner photos (`images/`, keep the credits shown on each page). Details: **developer/ASSETS.md**.

## Pages
Home · About · Events · Festivals, Cultural & Other, Sports & Leisure · Past event (Event.dc.html?id=…) · Durga Pujo 2026 registration · Charity, Adda Aid 2022/2021/2020 · Media, Print, Digital · Adda Live · Contact · Member sign-in · Terms · Privacy · Search

## Still to do
1. Contact and Registration forms validate but aren't yet connected to a back end.
2. Optional clean URLs: add host rewrites, e.g. /events → /Events.dc.html.
