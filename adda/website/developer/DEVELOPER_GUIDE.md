# Developer guide

## Folder structure
```
adda-slough-website/            ← web root (upload the contents of this folder)
├── index.html                  Entry point; forwards to Home.dc.html
├── *.dc.html                   One file per page (see "Pages" below)
├── SiteHeader.dc.html          Shared header: navigation, mega-menu, search, Adda Live dot
├── SiteFooter.dc.html          Shared footer
├── AidYear.dc.html             Shared template for Adda Aid 2020/2021/2022 pages
├── Coverage.dc.html            Shared template for Media, Print and Digital pages
├── EventArchive.dc.html        Shared template for Festivals, Cultural and Sports pages
├── Legal.dc.html               Shared template for Terms and Privacy
├── support.js                  Page runtime — required by every page
├── .nojekyll                   Required for GitHub Pages; harmless elsewhere
├── css/
│   ├── modernist.css           Base design system (type, spacing, buttons, cards)
│   └── theme.css               ADDA colours, button + link hover states, overrides
├── js/
│   ├── site.js                 Site data: navigation, events archive, family, search index + search
│   ├── live.js                 Adda Live client logic
│   ├── img-fallback.js         Safety net for local images (see ASSETS.md)
│   ├── imageslot.js            Drag-and-drop image slot component
│   └── offline-bundle.js       Generated copy of all pages; used ONLY when opened from a folder (file://)
├── data/imageslots.json        Images stored for image slots
├── images/                     Unsplash banner photographs + favicons (local)
├── assets/images/              ADDA-owned local images (logo, About photo, Durga Pujo pandal, Nexyra logo)
│   └── sponsors/               Sponsor logos (local)
├── scripts/build-offline-bundle.mjs   Regenerates js/offline-bundle.js
├── functions/api/              Adda Live API (Cloudflare Pages Functions only)
├── server/                     Adda Live setup: schema.sql, seed-test-admin.sql, create-admin.mjs, LIVE-STREAMING.md
├── wrangler.toml               Cloudflare Pages configuration
└── developer/                  This documentation
```

## How a page works
Each `*.dc.html` file is a complete HTML document:
1. `<head>` loads the favicons, `js/img-fallback.js`, (on file:// only) `js/offline-bundle.js`, then `support.js`.
2. `<x-dc>` holds the page template — HTML with **inline styles** and `{{ name }}` placeholders.
3. A `<script type="text/x-dc" data-dc-script>` block at the bottom holds a small `class Component` whose `renderVals()` returns the values the placeholders read (lists, text, handlers).
4. `<dc-import name="SiteHeader">` / `<dc-import name="SiteFooter">` pull in the shared header and footer files; shared templates (AidYear, Coverage, EventArchive, Legal) are pulled in the same way with a prop such as `view="print"`.
5. `<sc-for>` repeats markup for each item in a list; `<sc-if>` shows markup conditionally.

`support.js` fetches the imported `.dc.html` files at runtime. Browsers block that on `file://`, which is why `js/offline-bundle.js` exists — it serves those files from memory when the site is opened straight from a folder. Web servers never load it.

## Where content lives
| Content | File |
|---|---|
| Navigation, past-events archive (festivals, cultural, sports), event write-ups, ADDA Family, search index | `js/site.js` |
| Home slideshow, upcoming events, promotions, sponsors marquee | `Home.dc.html` (script block) |
| Upcoming events, Bhog packages, category cards | `Events.dc.html` |
| About text, ADDA Family grid | `About.dc.html` |
| Single past-event page (`Event.dc.html?id=<event-id>`) | `Event.dc.html` + data from `js/site.js` |
| Charity overview / Adda Aid years | `Charity.dc.html`, `AidYear.dc.html` |
| Print and digital coverage (incl. ABP News video) | `Coverage.dc.html` |
| Durga Pujo 2026 registration | `Registration.dc.html` |
| Colours, hover states | `css/theme.css` |

## Image path constants
External media is addressed through one base URL per file, so moving the media host means changing a single line per file:

| File | Constant | Value |
|---|---|---|
| js/site.js | `M` | `https://media.adda-slough.org/public/images/` |
| Home.dc.html | `M` | same |
| Events.dc.html | `M` | same (plus three static `<img>` tags in the template) |
| About.dc.html | `P` | `…/images/org/people/` |
| Charity.dc.html | `C` | `…/images/charities/` |
| AidYear.dc.html | inline | `…/images/charities/adda-aid-<year>.jpg` |
| Coverage.dc.html | `MP` | `…/images/media/print/` (plus the ABP News video URL under `…/public/videos/`) |
| Registration.dc.html | inline | `…/images/promotions/durga-pujo-2026-1.jpg` |

Local assets are always written as relative paths (`assets/images/…`, `images/…`).

## Pages
Home · About · Events · Festivals · Cultural & Other · Sports & Leisure · Event (past event, `?id=`) · Registration (Durga Pujo 2026) · Charity · Adda Aid 2022/2021/2020 · Media · Print · Digital · Live (Adda Live) · LiveWalkthrough (organiser guide) · Contact · Sign in · Terms · Privacy · Search

## Styling rules
- Styles are inline on each element. Only `@font-face`, keyframes and body resets live in `<style>` blocks; site-wide colours and hover states live in `css/theme.css`.
- Buttons use `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-marigold`; hover turns sky blue (`--adda-sky`) with navy text.
- Text links hover to marigold (`--color-accent-2-700` on light grounds, `--color-accent-2` on dark heroes/footer).
- Corners are square throughout; don't add border-radius.

## Adda Live
See `server/LIVE-STREAMING.md`. On a plain host the Live page shows "Not live right now" and the test organiser sign-in works locally; real broadcasting requires Cloudflare Pages + Amazon IVS.
