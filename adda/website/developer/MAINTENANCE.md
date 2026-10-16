# Maintenance guide

Edit files in any text editor (VS Code recommended). After editing a `.dc.html` file, run `node scripts/build-offline-bundle.mjs` so the folder (file://) version stays in sync — web servers don't need it.

## Change page text
Open the page's `.dc.html` file and edit the text inside the `<x-dc>` template. Lists (events, promotions, family, sponsors) live in the script block at the bottom of the file or in `js/site.js` — see DEVELOPER_GUIDE.md › "Where content lives".

## Add a past event
1. Upload its poster to the media server at `images/events/<category>/<sub>/<event-id>.jpg`, e.g. `images/events/festivals/durga-pujo/durga-pujo-2026.jpg`.
2. In `js/site.js`, add `['<event-id>', 'Title']` to the matching `ev('…', [ … ])` list (newest first).
3. Optional write-up: add `EVENT_TEXT['<event-id>'] = { date: '…', text: ['Paragraph', '## Heading', '…'] };`
4. The event appears on its archive page, in search, and at `Event.dc.html?id=<event-id>`.

## Change upcoming events / promotions / home slideshow
Edit the `SLIDES`, `events` and `promos` arrays in `Home.dc.html`, and the matching blocks in `Events.dc.html`. Image paths are `M + '<path on media server>'`.

## Add or replace an ADDA Family photo
Upload to `images/org/people/` on the media server, then add `['file.jpg', 'Names']` to `FAMILY` in **both** `js/site.js` and `About.dc.html`.

## Sponsors (local)
1. Save the logo to `assets/images/sponsors/` with a lowercase-hyphenated filename.
2. Add `['file.jpg', 'Sponsor name']` to `SPONSORS` in `Home.dc.html`.

## Replace a video
Upload to the media server under `videos/…` and update the `video:` URL in `Coverage.dc.html` (`DIGITAL` list).

## Change colours or hover effects
Edit `css/theme.css`. Brand colours are CSS variables at the top (`--adda-navy`, `--adda-sky`, `--adda-marigold`…). Button hover = sky blue; text-link hover = marigold.

## If the media server moves
Change the base URL constants listed in DEVELOPER_GUIDE.md › "Image path constants" (one line per file), and the three static image tags in `Events.dc.html`, the one in `Registration.dc.html` and `Coverage.dc.html`. A search for `media.adda-slough.org` finds every occurrence.

## Rules
- Lowercase, hyphenated file names; no spaces or special characters.
- Relative paths for local files (`assets/images/…`, `images/…`) — never absolute paths like `/Users/…` or `C:\…`.
- Keep Unsplash credits visible where shown.
- Keep alt text meaningful for every content image.
- Don't rename page files without updating links in `js/site.js` (`P` map) and in templates.
