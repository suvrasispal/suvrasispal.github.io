# Assets: local vs live

## Local assets (inside the package)
These files ship with the website and use relative paths. Do not replace them with external URLs.

| Asset | Path | Used on |
|---|---|---|
| Adda logo | `assets/images/addalogo.png` | Header, footer (every page) |
| About Adda Slough photo | `assets/images/about-slough.jpg` | Home → About section |
| Durga Pujo pandal photo | `assets/images/durga-pujo-pandal.jpg` | Events hero. Not available on the media server, so it stays local. |
| Nexyra logo | `assets/images/nexyra-logo-white.svg` | Footer credit |
| Our Sponsors logos (17) | `assets/images/sponsors/*.jpg|png` | Home → sponsors marquee |
| Unsplash photographs (10) | `images/*.jpg` | Page heroes and section photos (credits are shown on each page) |
| Favicons | `images/favicon-32.png`, `-48`, `-180`, `-512` | Browser tab / home-screen icon |

## Live assets (Adda media server)
All other ADDA images and videos load directly from **https://media.adda-slough.org/public/** — event posters, past-event photos, ADDA Family photos, promotions, home slideshow banners, charity images, press clippings and the ABP News video. The full list with the pages they appear on is in [MEDIA_SOURCES.md](MEDIA_SOURCES.md).

Path pattern: `https://media.adda-slough.org/public/images/<section>/<…>/<file>` and `https://media.adda-slough.org/public/videos/<section>/<…>/<file>`.

## What changed in this release
- Every ADDA image/video that exists on the media server is now linked to its live URL instead of a local copy.
- Local duplicates removed: `assets/images/events/`, `assets/images/org/`, `assets/images/promotions/`, `assets/videos/`.
- `scripts/fetch-all-assets.sh` / `.ps1` removed — they downloaded live media into `assets/`, which the pages no longer use.

## Safety net
`js/img-fallback.js` loads first on every page. If a **local** image under `assets/images/` fails to load, it retries the same path on the media server. It has no effect on images that already use live URLs, and it can be left in place.

## Adding a new image
- ADDA event/media content: upload it to the media server and reference the live URL (see MAINTENANCE.md).
- Logo, sponsors, partner logos or stock photography: put it in `assets/images/` (or `images/` for stock), use a lowercase-hyphenated filename, and reference it with a relative path.
