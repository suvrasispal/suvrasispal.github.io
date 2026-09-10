# TCA Events & Marketing Calendar — Deployment Package

A marketing planning dashboard for The Confidence Academy, covering
**September 2026 – December 2027**. The page itself is one file; a small
`assets/` folder carries the logo and browser-tab favicons alongside it:

```
index.html            <- deploy this file (+ the assets/ folder below it)
assets/
  tca-logo.webp        <- logo shown in the page header (embedded inline too)
  tca-logo-original.png
  favicon/             <- browser-tab / home-screen icons (see §4)
data/
  events.json          <- the event list, human-readable
source/                <- how index.html and the favicons were generated
```

## 1. Deploy it

`index.html` plus the `assets/` folder is all you need — no build step, no
server, no dependencies:

- **Drag-and-drop hosting** — Netlify Drop (app.netlify.com/drop), Vercel, or
  Cloudflare Pages: drag the whole `tca-marketing-calendar` folder onto the
  upload page and you'll get a live URL in seconds.
- **GitHub Pages** — push this folder to a repo and enable Pages on the
  `main` branch; it serves `index.html` at the site root automatically.
- **Your existing website / web host** — upload the folder via FTP/SFTP or
  your hosting control panel, e.g. `yourdomain.com/calendar/index.html`, or
  replace your host's default `index.html` to serve it at the domain root.
- **Internal/intranet** — also works opened directly from disk
  (double-click `index.html`) or from a shared network drive.

Keep `index.html` and `assets/` in the same relative position to each other
— the favicon links inside `index.html` point to `assets/favicon/...`.

## 2. How data is saved

This exported package isn't connected to Claude's hosted database, so it
falls back to your **browser's local storage**:

- Every status change, ticked task, note and assignee is saved automatically
  in the browser that made the change.
- Reopening the page in the *same browser* later shows everything exactly as
  you left it.
- Opening it in a **different browser or device** starts from a fresh
  "Not Started" state for everyone, because local storage is per-browser —
  it is not shared between people.

**If you need everyone on the team to see the same live, shared data**
(ticking a box on one laptop shows up on everyone else's), you have two options:

1. **Easiest: keep using the Claude-hosted version.** The version built for
   you inside Claude already has this — every visitor reads and writes the
   same shared, realtime store automatically. Use this export only for
   cases where the calendar needs to live on your own domain.
2. **Add a small backend of your own.** The `persist()` and `loadLocalState()`
   functions near the top of the `<script>` block in `index.html` (search
   for `LS_KEY`) are the only two places that touch storage — point them at
   a lightweight backend instead of `localStorage` (Firebase, Supabase, or
   a simple REST endpoint all work well) if you want shared sync on your
   own infrastructure.

Local storage also means: don't clear your browser's site data for this
page, and note that opening the file with `file://` directly (rather than
through a real `http(s)://` host) works in most browsers, but some strict
privacy settings block local storage for `file://` pages — hosting it
anywhere (even the free options above) avoids that.

## 3. Updating the event calendar

**Quick edit (no tools needed):** open `index.html` in a text editor, search
for `const EVENTS_RAW = `, and edit the JSON array directly. Every event has
this shape:

```json
{
  "id": "halloween-2026",
  "name": "Halloween",
  "date": "2026-10-31",
  "category": "seasonal",
  "priority": "high",
  "description": "...",
  "requirements": "...",
  "tasks": ["Event concept approved", "..."],
  "notes": ""
}
```

Valid `category` values: `seasonal`, `fitness`, `mental-health`, `family`,
`youth`, `awareness`, `tca`, `community`, `other`. Valid `priority` values:
`high`, `medium`, `low`. Save the file and re-upload/redeploy it.

**Maintainable edit (recommended for bigger changes):** the `source/` and
`data/` folders regenerate `index.html` cleanly instead of hand-editing a
250KB file:

```
data/events.json          <- the full event list, human-readable
source/template.html      <- the page's HTML/CSS/JS content (the <head>/<body>
                              wrapper and favicon <link> tags are added by
                              build.sh, not stored here — see the /HEAD
                              marker comment near the top of the <style> block;
                              don't remove that comment)
source/gen_events.py      <- the Python script originally used to
                              research-derive and generate data/events.json
                              (useful as a reference for how dates like
                              Easter-linked holidays, bank holidays, etc.
                              were calculated)
source/build.sh            <- rebuilds ../index.html as a full standalone
                              HTML document from template.html +
                              ../data/events.json + ../assets/tca-logo.webp
                              + ../assets/favicon/*
```

To rebuild after editing `data/events.json` (requires Python 3, no other
dependencies):

```bash
cd source
bash build.sh
```

This regenerates `index.html` in the folder above. Re-deploy that file
(and `assets/`, if you haven't already).

## 4. Brand assets & favicon

- `assets/tca-logo.webp` — the compressed logo shown in the page header
  (embedded inline as a `data:` URI, so `index.html` still works even if
  this file goes missing — but keep it for `build.sh` to re-embed on future
  rebuilds).
- `assets/tca-logo-original.png` — the original full-resolution logo file,
  kept for future edits or other materials.
- `assets/favicon/` — a full browser-tab / home-screen icon set generated
  from TCA's runner mark:
  - `favicon.ico` (16/32/48px, classic browser tab icon)
  - `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`
  - `favicon-192x192.png`, `favicon-512x512.png` (Android/PWA)
  - `apple-touch-icon.png` (180×180, iOS "Add to Home Screen")
  - `site.webmanifest` (lets mobile devices pick up the icon set and brand colour)

**To regenerate the favicon set** — e.g. if the runner mark artwork changes —
replace `source/favicon-src/runner-mark.png` with the new artwork, then run:

```bash
cd source
python3 generate_favicons.py favicon-src/runner-mark.png ../assets/favicon
bash build.sh
```

`generate_favicons.py` auto-crops the source image to its opaque content,
pads it back out to a square canvas with a small margin, and re-renders
every required size with high-quality downsampling — so it works with any
transparent-background PNG mark, not just this one. Requires Python 3 and
Pillow (`pip install pillow` if it's not already installed).

The dashboard follows The Confidence Academy's brand guidelines (Royal Blue
`#00247D` / Red `#CF142B` / Gold `#FFB81C` / Sky Blue `#4A90D9`, Sora/Inter/
Space Mono typefaces, the 115° brand gradient, 8px spacing grid) and adapts
automatically to the visitor's light or dark mode preference.

## 5. Browser support

Works in current versions of Chrome, Edge, Safari and Firefox on desktop and
tablet (the layout is responsive down to phone widths too). Uses modern but
widely-supported CSS (`color-mix()`, CSS Grid) — if you need to support very
old browsers, test first.

## 6. What's inside, briefly

A single-page dashboard with: an overview of upcoming/action-required/
in-progress/completed events, a month and year calendar view, chronological
Upcoming/Tasks/Campaigns/Completed lists, category and text search filtering,
and a per-event detail panel with a status tracker, an editable task
checklist (completion % updates live), notes, and an assignee field. Every
event auto-calculates its 14-day marketing-preparation deadline and flags
itself under "Action Required" as that window opens.
