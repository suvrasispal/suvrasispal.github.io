# TCA Events & Marketing Calendar — Deployment Package

A living, self-updating marketing planning dashboard for The Confidence
Academy. It always shows a **rolling 12 months starting today** — open it in
September 2026 and it covers Sept 2026–Sept 2027; open the same file in
January 2029 and it covers Jan 2029–Jan 2030, automatically, with nothing to
reset each year (see §3). The page itself is one file; a small `assets/`
folder carries the logo and browser-tab favicons alongside it:

```
index.html            <- deploy this file (+ the assets/ folder below it)
assets/
  tca-logo.webp        <- logo shown in the page header (embedded inline too)
  tca-logo-original.png
  favicon/             <- browser-tab / home-screen icons (see §4)
data/
  event_templates.json <- the event list, human-readable (see §3)
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

- Every status change, task assignment, note, and any event you add, edit or
  delete is saved automatically in the browser that made the change.
- Reopening the page in the *same browser* later shows everything exactly as
  you left it.
- Opening it in a **different browser or device** starts from the original
  seed calendar for everyone, because local storage is per-browser — it is
  not shared between people.

**If you need everyone on the team to see the same live, shared data**
(ticking a box on one laptop shows up on everyone else's), you have two options:

1. **Easiest: keep using the Claude-hosted version.** The version built for
   you inside Claude already has this — every visitor reads and writes the
   same shared, realtime store automatically, **as long as it's opened
   through the Claude app/website itself** (the artifact link/card, opened
   inside claude.ai). Copying that link out and opening it as a bare URL in
   a fresh browser tab currently can't reach that shared store — that's a
   current platform limitation on Claude's side, not something this
   dashboard can work around. Use this export only for cases where the
   calendar needs to live on your own domain.
2. **Add a small backend of your own.** `persist()`/`loadLocalState()` (task
   and status data, search for `LS_KEY`) and `persistTemplate()`/
   `loadLocalTemplates()` (added/edited/deleted events, search for
   `TEMPLATE_LS_KEY`) are the only places that touch storage — point them at
   a lightweight backend instead of `localStorage` (Firebase, Supabase, or
   a simple REST endpoint all work well) if you want shared sync on your
   own infrastructure.

Local storage also means: don't clear your browser's site data for this
page, and note that opening the file with `file://` directly (rather than
through a real `http(s)://` host) works in most browsers, but some strict
privacy settings block local storage for `file://` pages — hosting it
anywhere (even the free options above) avoids that.

## 3. The recurring calendar engine — how events stay current with no annual reset

Nothing in this dashboard is a hand-typed date for a specific year. Instead,
every event is a **template** describing *how it recurs*, and the page works
out the actual dates for the current 12-month window every time it loads:

- **Repeats every year, same date** — Halloween (31 Oct), Christmas Day (25
  Dec), and most UN/awareness days.
- **Repeats every year, same weekday pattern** — Black Friday (4th Friday of
  November), UK bank holidays (1st/last Monday of a month), Father's Day
  (3rd Sunday of June), and similar.
- **Easter-linked** — Easter Sunday, Mothering Sunday, Shrove Tuesday: these
  move every year and are computed from the actual date of Easter (via the
  standard algorithm), not copied from the previous year.
- **Lunar-calendar** — Diwali, Chinese New Year, Eid al-Fitr, Eid al-Adha:
  pre-populated with real published dates out to the early 2030s (Eid dates
  are approximate until confirmed by official moon sighting each year —
  the app flags this on the event).
- **One-off** — a specific event that happens once and never repeats.

So on any given day, the dashboard shows **today through 12 months from
today** — the small "📅 Upcoming 12 Months" banner on the Dashboard and
Calendar always says exactly which window is showing, and it updates itself
as time passes (leave a tab open overnight or across a weekend and it
catches up automatically; the Calendar view can't be scrolled past the
current window, since nothing is generated beyond it).

**Managing events day-to-day (no file editing needed):** as an admin
("Viewing as" → Ray (Founder & Director), Head of Brand & Digital, or Head
of Events in the top bar), use the
**+ Add Event** button on the
Dashboard (or **+ Add TCA Campaign** on the Campaigns page) to create a new
event — name, category, priority, description, tasks, and how it repeats
(same date every year / same weekday pattern every year / one-off). Open any
event's detail panel to **✏️ Edit event** or **🗑️ Delete event** at any
time; editing takes effect immediately everywhere that event appears, and
deleting removes it (and all its future occurrences, if it repeats). The
handful of seed events with an Easter-linked or lunar-calendar date show a
note that their date is calculated automatically rather than editable —
everything else about them (name, category, tasks, etc.) can still be
changed freely.

**Bulk / offline editing:** `data/event_templates.json` holds the same
templates in human-readable form, each shaped like:

```json
{
  "id": "halloween",
  "name": "Halloween",
  "category": "seasonal",
  "priority": "high",
  "description": "...",
  "requirements": "...",
  "tasks": ["Event concept approved", "..."],
  "recurrence": { "type": "annual-fixed", "month": 10, "day": 31 }
}
```

Valid `category` values: `seasonal`, `fitness`, `mental-health`, `family`,
`youth`, `awareness`, `tca`, `community`, `other`. Valid `priority` values:
`high`, `medium`, `low`. Valid `recurrence.type` values: `annual-fixed`
(`month`+`day`), `annual-nthweekday` (`month`+`weekday`[0=Mon..6=Sun]+`nth`[1-4
or -1 for "last"]), `annual-easter` (`offsetDays` from Easter Sunday),
`annual-lunar` (a `dates` map of `"year": "YYYY-MM-DD"`), or `one-off`
(a fixed `date`). After editing, rebuild `index.html`:

```bash
cd source
bash build.sh
```

This regenerates `index.html` in the folder above from `template.html` +
`../data/event_templates.json` + the logo/favicons. Re-deploy that file (and
`assets/`, if you haven't already). `source/gen_events.py` is kept as a
reference for how the original seed events' dates and task lists were
researched.

Adding/editing/deleting events **in the running dashboard** (via + Add
Event / Edit / Delete) saves to the same browser storage described in §2 —
it does not touch `data/event_templates.json` on disk, so the two stay in
sync only if you either manage events exclusively through the UI, or
exclusively by hand-editing the JSON and rebuilding; mixing both without a
shared backend (see §2) can leave different browsers with different sets of
admin-added events.

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

## 6. Task assignment (for administrators & team members)

Every task on every event can be handed to a named team member, tracked
through its own status, and reviewed before it counts as done:

- **The roles.** Both the **"Viewing as"** switcher in the top bar and every
  **Team Member / Assign Task** field throughout the dashboard use the exact
  same fixed list of nine roles, so there's never a mismatch between who you
  can "view as" and who you can assign a task to:
  Ray (Founder & Director), COO, Head of Research & Fundraising, Head of
  Brand & Digital, Head of Events, Fundraising Lead, Digital & IT Lead,
  Creative Lead, Other. **Ray (Founder & Director)**, **Head of Brand &
  Digital**, and **Head of Events** carry admin-level controls (marked 👑
  in the switcher) — add/edit/delete events, assign or reassign tasks, and
  approve/send back/complete/reopen work. Everyone else can view the full
  calendar, every event's status, and every task's assignment, but can't
  add/edit events, assign tasks, or approve work. (To change who counts as
  an admin, edit the `ADMIN_ROLES` array next to `TEAM_MEMBERS` in
  `template.html` and rebuild.)
- **Assigning:** open the **Tasks** view (or an event's detail panel),
  expand an event, and click **Assign Task** on any task line. Pick a role
  from the list or type a new one, add an optional note/instruction, then
  confirm with **Assign Task**. Click **Reassign** any time to hand it to
  someone else, or **Unassign** to clear it. Assigned/unassigned tasks are
  shown live wherever that task appears — the Tasks list, the event's detail
  panel, the relevant Upcoming/Campaigns/Completed event card, and the
  assignee's own **My Tasks** page all match, and update the instant an
  admin makes a change — nothing needs a page reload.
- **The "Viewing as" switcher** in the top bar simulates who's looking at
  the dashboard (there's no real login) — choose an admin role to manage
  assignments, or another role to see the dashboard the way that team
  member would. Team members get a **My Tasks** page listing only what's
  assigned to them, with **Start task** and **Submit for approval** buttons;
  admins see a **Team Task Board** (via the same "My Tasks" nav item)
  grouping every assigned task by person, plus the most urgent unassigned
  ones.
- **On the event cards** (Dashboard, Upcoming, Campaigns, Completed): if an
  event's tasks are all assigned to the same person, the card shows a quiet
  "Assigned to: <role>" line under the date. If tasks are split across
  different people, the card instead lists each task with its assignee
  ("🎨 Main Banner — Head of Brand & Digital"), showing the first three and
  a "+N more" note if there are more than that — all without needing to open
  the event.
- **Status workflow:** Not Started → Assigned → In Progress → Submitted →
  Completed. A team member's **Submit for approval** does *not* mark a task
  done by itself — it shows the admin "Submitted" so they can **Approve** it
  (or **Send back** for more work). Admins can also **Mark complete** or
  **Reopen** a task directly at any time.
- The Dashboard's **Task Assignment Overview** (admin view) totals assigned,
  unassigned, in-progress, awaiting-review, completed and overdue tasks
  across the whole calendar; team members instead see a small banner
  showing how many open tasks are theirs, linking straight to My Tasks.
- This is layered on top of the existing per-event **Project Status**
  workflow (Not Started → … → Completed) and its auto-logic — an event
  still automatically moves to "Completed" once every one of its tasks is
  Completed, exactly as before.

## 7. Export to Excel

The **⬇️ Export to Excel** button in the top bar (next to the save-status
pill) generates a point-in-time `.xlsx` snapshot of the entire calendar —
useful for sharing with people who don't use the dashboard, or for keeping
an offline record — with two sheets:

- **Events** — one row per event: name, category, priority, date, how it
  recurs, prep-start date, Project Status, tasks completed/total, %
  complete, everyone currently assigned to its tasks, the campaign lead,
  and notes.
- **Tasks** — one row per individual task across every event: which event
  it belongs to, the task, its own status, who it's assigned to, any note,
  and when it was last updated.

This is a **snapshot, not a live link** — it captures the data at the
moment you click the button, using the [SheetJS](https://sheetjs.com/)
library loaded from cdnjs (so it needs an internet connection the first
time, to fetch that library). For data that stays continuously up to date
across everyone's browser, that's what the save-status pill and §2 are
about — this export is for getting a copy *out* of the dashboard, not a
second copy that stays in sync with it. Click it again any time you want a
fresh snapshot.

## 8. What's inside, briefly

A single-page dashboard that always covers a rolling 12 months from today
(see §3), with: an overview of upcoming/action-required/in-progress/completed
events, a month and year calendar view clamped to that same window,
chronological Upcoming/Tasks/Campaigns/Completed lists, category and text
search filtering, per-task assignment with its own approval workflow and a
"My Tasks" page (see §6), one-click Excel export of every event and task
(see §7), full admin add/edit/delete for events and TCA campaigns with a
plain-language recurrence picker (see §3), and a per-event detail panel
with a status tracker, the same assignable task list, notes, and a
campaign-lead field. Every event auto-calculates its 14-day
marketing-preparation deadline and flags itself under "Action Required" as
that window opens — and because dates are computed, not stored, this keeps
happening every year with nothing to reset each January.
