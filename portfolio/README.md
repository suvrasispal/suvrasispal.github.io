# Suvrasis Pal — portfolio

Static site rebuilt from your Canva deck. No build step, no dependencies, no framework.
Open `index.html` in a browser and it runs.

```
index.html          the whole page
preview.html        self-contained single file (see below)
css/style.css       all styling
js/main.js          the slide viewer
assets/thumb/       card images (65 slides, ~820px)
assets/full/        viewer images (65 slides, ~1600px)
assets/portrait.jpg your About photo
assets/favicon.svg  browser tab icon
```

## Two ways to open this

**`index.html`** is the real site. It needs `css/`, `js/` and `assets/` sitting next to it —
that's normal for a website, and it's what you upload to a host. If you open `index.html`
on its own, detached from those folders, you get unstyled text and no images, because the
browser has nothing to load.

**`preview.html`** is the same page with the stylesheet, the script and every image baked
into one file. Nothing external, so it renders anywhere — email it, drop it in a message,
open it straight from Downloads. Images are compressed to keep it around 4 MB, so it's for
viewing and sharing, not for hosting. Host the folder.

Total: about 11 MB. Everything came out of `Suvrasis_Pal.pdf` at original resolution —
no screenshots, no re-compression of already-compressed images.

## The contact form

Posts to Web3Forms, so there is no backend to run. The access key is already in
`index.html` — `6a434485-55fa-4f55-9dba-e4066a8c6835`. Messages go to whichever address
that key was registered with.

The key is public by design: it identifies the destination inbox and grants no account
access. That is how Web3Forms is built to work, so it is safe sitting in the HTML.

Behaviour: validates on blur and on submit, shows per-field errors, refuses to send until
the fields are valid, blocks duplicate submissions while a send is in flight, and reports
both API errors and network failures distinctly. A hidden `botcheck` honeypot filters bots.
To change the subject line of the emails you receive, edit the hidden `subject` input.

**Send yourself one test message** once the site is live. The form was verified end to end
against an intercepted endpoint, but the real Web3Forms round trip could not be exercised
from the build environment, so a single live send is worth doing to confirm delivery and to
check your spam folder.

## Two things to add

**1. Your email in the contact list.** The form handles messages, but there is still no
visible address next to your LinkedIn. If you want one shown, uncomment this row in
`index.html` and replace the address in *both* places — the `mailto:` and the visible text:

```html
<!-- Add your email: uncomment this line and replace both addresses below.
<li><a href="mailto:you@yourdomain.com"><span>Email</span><span>you@yourdomain.com&nbsp;↗</span></a></li>
-->
```

**2. Project years.** The deck doesn't date the projects, so I left years off rather than
guess. Each project's meta line currently reads `CLIENT — DISCIPLINE`. To add a year,
edit the second `<span>` in that project's `work__meta`, e.g.
`<span>2025 · Concept · AI product design</span>`.

## Project images

Every page in the source PDF is 1024.5 x 576 pt — exactly 16:9. Each project image is a
complete page, rendered whole. Nothing is cropped, so every image shares one shape and one
size (3840 x 2159) and the cards line up without any padding or letterboxing.

Pages are rasterised at 320 DPI and output at 3840 px wide, which holds about 270 ppi
across the page — at or above the median resolution of the artwork embedded in the PDF, so
UI text and fine detail stay sharp. Card images are 1800 px so they stay crisp on 2x
displays.

Re-run `render_images.py` to regenerate. To change resolution, edit `FULL_W` and `THUMB_W`
at the top of that file.

## The 16 projects

In page order: THE LINE (NEOM), Verve Mobile Banking, Nexyra, Lloyd's Travel,
Project Verdant, Leukoplast Design System, IQOS Marketing Email, Puramino Email
Templates, All Things Beauty, HSBC Financial Planning, Meta Lead Solution Training
Guide, Capital Ability Network, China Vista Strategy, HP Campaigns & Digital Ads,
Shaped by the early web, Logo Design.

Four run full-width as featured pieces: THE LINE, Lloyd's Travel, All Things Beauty,
and the early-web archive. To change which, add or remove `work__item--wide` on the
`<article>`.

To reorder or remove a project, move or delete its whole `<article class="work__item">`
block. Nothing else references it.

## Links that are already live

Six real hyperlinks were extracted from the PDF and wired up:

- Verve — `https://verve.figma.site/`
- Nexyra — `https://nexyra.figma.site/`
- Lloyd's Travel — three Figma prototypes (Concepts 01, 02, 03)
- LinkedIn — `https://www.linkedin.com/in/suvrasis/`

These would have been lost with any screenshot-based approach.

## How the slide viewer works

Each project card is a button carrying `data-gallery="s06,s07,s08..."`. Clicking it opens
the viewer, which loads matching files from `assets/full/`. Arrow keys, swipe, and the
on-screen arrows page through; Escape closes; "Full size" opens the raw JPEG, which is
useful on a phone where the denser slides get small.

To change which slides belong to a project, edit that card's `data-gallery` list. The
numbers map to the original PDF pages — `s06` is page 6.

## Replacing an image

Drop a new file into both `assets/thumb/` and `assets/full/` using the same filename.
Thumbs are ~820px wide, full ~1600px, both 16:9. If you only replace the full version the
card will still show the old thumb.

## Putting it online

Drag the whole folder onto [Netlify Drop](https://app.netlify.com/drop). It's live in
seconds and you can attach a custom domain afterwards. Vercel and GitHub Pages work the
same way. Upload the folder intact so the `css/`, `js/` and `assets/` paths resolve.

Once you have a domain, uncomment the canonical tag near the top of `index.html` and put
your real URL in it. Also update `og:image` if you'd rather a different slide showed in
link previews — it currently points at `assets/full/s06.jpg`.

## Design notes

Ultramarine and mustard on cool grey. Display type is Bricolage Grotesque set wide, body
is Newsreader, metadata is DM Mono. A sans display over a serif body is the reverse of the
usual arrangement, and it's most of the reason this doesn't read as a template. The one
loud moment is the hero, where your surname is set in outline; everything after it stays
quiet so the work carries the page.

Fonts load from Google Fonts, so the page needs a connection to look exactly right — the
fallback stack (Helvetica / Georgia) is close but not identical. To self-host, download
the three families and swap the `<link>` in `index.html` for `@font-face` rules.

Verified in a headless browser at 1440px and 390px: no console errors, no horizontal
overflow, viewer working on both. Keyboard focus is visible throughout, the viewer traps
focus while open, and `prefers-reduced-motion` disables the transitions.

## Regenerating

`build_preview.py` rebuilds `preview.html` from the folder. Run it after any change to
`index.html`, the CSS or the JS, or just delete `preview.html` once the site is hosted.

`build_site.py` generates `index.html` from a Python list of projects near the top of the
file. If you're comfortable editing Python, changing content there and re-running
`python3 build_site.py` is easier than hand-editing 16 repeated HTML blocks. If not,
ignore it and edit `index.html` directly — the generator is a convenience, not a
dependency.
