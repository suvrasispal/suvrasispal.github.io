# TCA Events & Marketing Calendar — Deployment Package

A self-contained marketing planning dashboard for The Confidence Academy,
covering **September 2026 – December 2027**. Everything the app needs
(styles, script, event data, logo) is baked into one file:

```
index.html   <- deploy this file. That's it. No build step, no server, no dependencies.
```

## 1. Deploy it

`index.html` is a single static file, so any of these work:

- **Drag-and-drop hosting** — Netlify Drop (app.netlify.com/drop), Vercel, or
  Cloudflare Pages: drag the whole `tca-marketing-calendar` folder (or just
  `index.html`) onto the upload page and you'll get a live URL in seconds.
- **GitHub Pages** — push this folder to a repo and enable Pages on the
  `main` branch. Rename `index.html` stays as-is (GitHub Pages serves
  `index.html` automatically at the repo/site root).
- **Your existing website / web host** — upload `index.html` via FTP/SFTP or
  your hosting control panel into any folder, e.g.
  `yourdomain.com/calendar/index.html`, or replace your host's default
  `index.html` to serve it at the domain root.
- **Internal/intranet** — it also works opened directly from disk
  (double-click `index.html`) or from a shared network drive, with the one
  caveat noted below.

No build tools, frameworks, API keys or environment variables are required.

## 2. How data is saved

This exported package is not connected to Claude's hosted database, so it
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
through a real `http(s)://` host) works in most browsers but some strict
privacy settings block local storage for `file://` pages — hosting it
anywhere (even the free options above) avoids that.

## 3. Updating the event calendar

You have two ways to change what events appear, their dates, categories,
descriptions or task checklists:

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
`data/` folders let you regenerate `index.html` cleanly instead of hand-editing
a 200KB file:

```
data/events.json     <- the full event list, human-readable
source/template.html <- the page's HTML/CSS/JS, with __EVENTS_JSON__ and
                         __LOGO_SRC__ placeholders instead of embedded data
source/gen_events.py <- the Python script originally used to research-derive
                         and generate data/events.json (useful as a reference
                         for how dates like Easter-linked holidays, bank
                         holidays, etc. were calculated)
source/build.sh       <- rebuilds ../index.html from template.html +
                         ../data/events.json + ../assets/tca-logo.webp
```

To rebuild after editing `data/events.json` (requires Python 3, no other
dependencies):

```bash
cd source
bash build.sh
```

This regenerates `index.html` in the folder above. Re-deploy that file.

## 4. Brand assets

- `assets/tca-logo.webp` — the compressed logo actually embedded in
  `index.html` (used via a `data:` URI so the page stays one file).
- `assets/tca-logo-original.png` — the original full-resolution logo file,
  kept here in case you need it for other materials or want to swap in an
  updated version (replace it, then re-export/compress and update
  `source/build.sh`'s reference, or just re-run `build.sh` after replacing
  `assets/tca-logo.webp` directly).

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
