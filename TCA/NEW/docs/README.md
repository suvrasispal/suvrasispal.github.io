# The Confidence Academy — website

Single-page site for The Confidence Academy: Get Britain Moving CIC.
Static, no build step, no dependencies. Upload the folder and it runs.

---

## Deploy

Copy everything at the top level of this folder to your web root. That is it.

```
index.html            → https://confidenceacademy.uk/
favicon.ico           → https://confidenceacademy.uk/favicon.ico
site.webmanifest      → https://confidenceacademy.uk/site.webmanifest
```

Works as-is on Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any
shared host. No server-side code, no environment variables, no database.

**Requires an internet connection at page load** — fonts come from Google
Fonts and photography from Unsplash's CDN. See *Self-hosting* below if you
would rather serve those yourself.

---

## File map

| Path | What it is |
|---|---|
| `index.html` | The entire site — markup, CSS and JS in one file |
| `favicon.ico` | Multi-resolution icon (16–256px) |
| `favicon-16/32/48.png` | Browser tab icons |
| `apple-touch-icon.png` | iOS home screen, 180px, flattened (no alpha) |
| `icon-192.png`, `icon-512.png` | PWA / Android |
| `icon-512-maskable.png` | Android adaptive icon, wider safe zone |
| `site.webmanifest` | PWA manifest, theme colour `#00247D` |
| `robots.txt` | Permissive; update the sitemap URL when one exists |
| `assets/logo-primary.svg` | Official logo, unmodified — for print and social |
| `assets/running.png` | Runner artwork the favicons are generated from |
| `tools/generate_favicon.py` | Regenerates the whole icon set (needs Pillow) |
| `tools/download-images.py` | Pulls the photography local so nothing loads from Unsplash |
| `assets/images/` | Empty until you run the script above |
| `docs/PHOTOGRAPHY.md` | Image sources and licence record (not shown on site) |
| `docs/OUTSTANDING-ITEMS.md` | **Read before launch** — unconfirmed content |
| `docs/design-reference.pdf` | Full-page layout render (photos omitted — rendered offline) |

---

## Sections

`#about` · `#benefits` · `#deposit` · `#events` · `#blog` · `#waitlist` ·
`#team` · `#contact`

Navigation is anchor-based with smooth scrolling and an IntersectionObserver
scroll-spy that marks the active section. Removing a section means removing
its nav entry too, or the spy will track a target that no longer exists.

---

## Common edits

**Add an event** — duplicate one `<article class="card event">` block in
`#events`. Each has a photo header, a category label, meta rows and a CTA.

**Add a blog post** — duplicate one `<article class="card post">` block in
`#blog`. The link sits on the `<h3>`; an invisible overlay stretches it
across the whole card.

**Swap a photograph** — replace the `src` and the `alt`, then update
`docs/PHOTOGRAPHY.md` so the licence record stays accurate. Visible credits
were removed at the client's request; see that file for the implications.

**Change a brand colour** — edit the custom properties in `:root` at the top
of the `<style>` block. Nothing is hard-coded downstream.

**Regenerate icons** — `python3 tools/generate_favicon.py assets/running.png .`
Then paste the new base64 from `favicon-32.datauri.txt` over the inline
`<link rel="icon" ... href="data:image/png;base64,...">` in `index.html`,
and delete the `.txt`.

---

## Full-bleed sections and parallax

Hero, About us, Benefits, Join the waitlist and Contact each carry an
edge-to-edge background photograph. The markup is the same everywhere:

```html
<section class="section section-feature on-dark" id="...">
  <div class="section-media" aria-hidden="true">
    <img data-parallax src="..." alt="" loading="lazy">
    <span class="wash wash-navy"></span>
  </div>
  <div class="wrap"> ...content... </div>
</section>
```

Three washes, picked by how the section reads:

| Class | Used by | What it does |
|---|---|---|
| `wash-navy` | Join the waitlist | Flat Royal Blue at 88%; add `on-dark` to the section for white type |

Sections carrying `on-dark` invert their type to white. Any light surface
inside one — the waitlist form card, the benefit cards — opts back out via
the `.on-dark .card` and `.on-dark .form-shell` rules. Add a new light card
type inside a dark section and it will need the same treatment, or its text
will render white on white.

| `wash-about` | About us | White veil settling onto Cloud, 96.5% down to 80%. Dark type on a light surface, which reads better for low vision than white on dark |
| `wash-light` | Blog | Near-white where the heading sits, opening up below so the photograph reads behind the post cards |
| `wash-royal` | Benefits | Royal Blue graded 82% to 66%, lighter than `wash-navy` so the photo reads. Add `on-dark` for white type. Do not take it below 66%: white type drops under 4.5:1 where the picture blows out |
| `wash-fade` | Contact | Solid white at the top, dissolving downward so the image merges into the page |

**Swapping a section image** — change the `src`. The wash handles contrast,
so a darker or busier photograph will not break legibility.

**Card label colours need extra specificity.** `.card p{color:var(--slate)}`
is 0,2,0 and silently beats any plain `.event-kind` or `.post-cat` rule at
0,1,0 — a colour set there computes as slate and looks like nothing happened.
Both are written as `.event-top p.event-kind` and `.post p.post-cat` for that
reason. Check the computed colour in devtools after changing either.

**Event card headers** use a different pattern to the section washes. The
photograph runs completely untinted, then stops at a hard cut where a Royal
Blue block at 72% carries the category and title, with a 3px red hairline
closing it along the bottom edge. At 72% the picture still reads through the
block while white type holds 5.98:1 against a blown-out photograph; below
roughly 66% it would fall under 4.5:1. The block is not a fixed-height band — it is built from the
`.event-kind` and `h3` elements themselves, bled to the card edges with
negative margins, so a two-line title grows the block rather than
overflowing it. Both need `margin-bottom:0`, or the generic `.card h3`
margin reopens a sliver of photograph beneath.

**Held headlines.** In About us and Join the waitlist the left column is
`position: sticky` above 900px, so the headline stays put while the column
beside it scrolls. It pins at `nav height + 32px`. Both are single rules:

```css
#about .section-head,
#waitlist .section-head{position:sticky;top:calc(var(--nav-h) + 32px)}
```

**Parallax** is transform-based, not `background-attachment: fixed`, which
janks badly on iOS. It runs only on wide viewports with a fine pointer, is
throttled through `requestAnimationFrame`, and switches off entirely under
`prefers-reduced-motion`. To remove it, delete the `data-parallax` attributes;
the layout is unaffected.

Nine layers carry it: the six full-bleed sections at the default 58px of
travel, and the three event card images at `data-parallax="22"` because a
300px card cannot absorb 58px of movement. The value on the attribute is the
travel in pixels. Frames are oversized to match — 126% height on section
media, 120% on event cards — so the movement never exposes an edge.

**Parallax and the pinned headlines do not conflict.** The transform is
applied to the `<img>` inside `.section-media`; the sticky headline lives in
the sibling content `<div>`. A `transform` only creates a containing block
for `position: sticky` when it sits on an *ancestor* of the sticky element,
and these are separate branches of the tree. Verified in-browser: the
headline holds at 116px through its full travel while every layer moves.

Deposit-refund model, Events and Our Team have no background photography, so
there is nothing to parallax in those sections — the event card images move
instead.

**`overflow-x` is `clip`, not `hidden`.** `hidden` creates a scroll container
and silently breaks `position: sticky` on the waitlist column. Don't change
it back.

---

## Wiring up the waitlist form

The form validates in the browser and shows a success state, but **submits
nowhere**. Nothing is stored or emailed until you connect it.

In `index.html`, find `form.addEventListener('submit', ...)`. After the
validation block and before `shell.classList.add('done')`, POST to your
endpoint — Formspree, Netlify Forms, or your own handler.

Fields: `fname`, `phone`, `email`, `session`, `day`, `area`, `notes`,
`consent`. Every field except `notes` and `area` is required — `area` was
made mandatory at the client's request.

Because this collects names, emails and phone numbers from UK residents, it
needs a privacy notice and a lawful basis under UK GDPR before it goes live.
The consent checkbox is present but a linked privacy policy is not.

---

## Accessibility

Built to the standard in the brand book §12.

- Body text never below 16px; line height 1.5+
- Semantic landmarks, one `<h1>`, ordered heading levels
- Visible two-tone focus ring that survives light and dark backgrounds
- Touch targets 44px minimum
- Colour is never the only signal — the "coming soon" social icons pair a
  dashed border with a text label, form errors pair colour with a message
- `prefers-reduced-motion` disables scroll reveal, hover lifts and the
  animated refund coin
- Alt text on every content image; decorative images marked `aria-hidden`
- Skip link to main content

Worth re-testing with a screen reader after any content change.

---

## Self-hosting fonts and images

Currently `fonts.googleapis.com` and `images.unsplash.com` are third-party
requests. To remove them:

1. Download Sora, Inter and Space Mono, serve them locally, and replace the
   `<link>` with `@font-face` rules.
2. Run `python3 tools/download-images.py` from the folder containing
   `index.html`. It fetches all nine photographs at the exact sizes the page
   requests, saves them to `assets/images/` under readable filenames, and
   repoints every `src`. The original is kept as `index.html.cdn-backup`, and
   nothing is rewritten unless every download succeeds — a partial failure
   leaves the working CDN version untouched. Re-running is safe.

   The images could not be bundled into this package directly: the build
   environment blocks outbound requests to `images.unsplash.com`, so the
   script has to be run somewhere with normal internet access. It needs only
   the Python standard library.

   Keep `docs/PHOTOGRAPHY.md` with the files — the licence applies whether or
   not a credit is displayed.

This improves privacy and removes two external points of failure.

---

## Browser support

Modern evergreen browsers. Uses `aspect-ratio`, CSS custom properties,
`IntersectionObserver` and `<details>`. No IE11 support and none intended.
