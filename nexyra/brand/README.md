# Nexyra Consulting — Brand Guidelines Website

A self-contained, static brand guidelines site: the full identity (foundation, logo system, colour, typography, grid, design system, applications) with downloadable logo and font assets.

No build step, no framework, no external services. Unzip and upload.

---

## Folder structure

```
nexyra-brand-guidelines/
├── index.html                     Single-page guidelines site
├── README.md
├── css/
│   ├── fonts.css                  @font-face declarations (self-hosted)
│   └── styles.css                 Design tokens + all component styles
├── js/
│   └── main.js                    Scroll-spy for the top nav (progressive enhancement)
├── fonts/
│   ├── hanken-grotesk-latin-normal.woff2
│   ├── hanken-grotesk-latin-ext-normal.woff2
│   ├── hanken-grotesk-latin-italic.woff2
│   ├── hanken-grotesk-latin-ext-italic.woff2
│   ├── hanken-grotesk-webfonts.zip    Complete font package offered on the site
│   └── OFL.txt                        SIL Open Font License 1.1
├── icons/                         37 interface icon SVGs + nexyra-icons.zip + README.txt
├── logos/                         19 approved logo SVGs (see below)
└── assets/
    └── favicon.svg                App icon, violet
```

---

## How to deploy

1. Upload the contents of this folder to the web root (or any subdirectory) of any standard web server — Apache, nginx, IIS, S3 + CloudFront, Netlify, Vercel, GitHub Pages, SharePoint static hosting.
2. No configuration, database, environment variables or build step are required.
3. Every path in the site is relative, so the package works at a domain root (`https://brand.nexyra.co.uk/`) or in a subfolder (`https://nexyra.co.uk/brand/`) without edits.
4. Recommended server settings (optional): serve `.woff2` as `font/woff2`, `.svg` as `image/svg+xml`, and set a long `Cache-Control` on `/fonts/`, `/logos/` and `/css/`.
5. To preview locally, open `index.html` directly, or run `python3 -m http.server` in this folder and visit `http://localhost:8000`.

---

## Fonts

**Hanken Grotesk** — the brand face. Sets the wordmark, all headings, all interface labels and all body copy.

- Self-hosted in `/fonts/` as WOFF2. No Google Fonts or other external font service is contacted at runtime.
- Supplied as the **variable** font: one file per unicode subset covers weights **100–900**, declared with `font-weight: 100 900`. Brand weights in active use are 300, 400, 500, 600, 700, plus roman italics.
- Split by unicode range (latin / latin-ext, roman / italic) so an English-language page downloads ~34 KB.
- Declared in `css/fonts.css` with `font-display: swap`.
- Font stack: `'Hanken Grotesk', 'Neue Haas Grotesk Display', 'Helvetica Neue', Arial, sans-serif`.

**Neue Haas Grotesk Display** — named in the logo SVGs as the first fallback. Commercially licensed, so it is **not** distributed here; license it per seat from the foundry if you want it as the substitute. **Helvetica Neue / Arial** are the system fallbacks.

The Typography section of the site links each individual font file plus `hanken-grotesk-webfonts.zip` (all four WOFF2 files + the licence).

---

## Logo assets

All 19 approved SVGs live in `/logos/` and are linked from Section 02 (view + download) and Section 08 (asset index). Artwork was **not** redrawn — geometry, proportions, gradient stops and colours are exactly as supplied; only C2PA metadata was stripped to reduce file size.

| Group | Files |
| --- | --- |
| Horizontal lock-up (primary) | `lockup-horizontal-gradient.svg`, `-on-light`, `-on-dark`, `-mono-black`, `-mono-white` |
| Vertical lock-up (secondary) | `lockup-vertical-gradient.svg`, `-on-light`, `-on-dark`, `-mono-black`, `-mono-white` |
| Monogram | `monogram-gradient.svg`, `-on-light`, `-on-dark`, `-mono-black`, `-mono-white` |
| App icon (512 px, radius 112) | `app-icon-violet.svg`, `app-icon-blue.svg`, `app-icon-black.svg`, `app-icon-white.svg` |

Usage rules — clear space, minimum sizes, misuse — are documented on the site and are normative.

---

## Brand specification (source of truth)

Colour: `#A78BFA` Violet Light · `#7C3AED` Violet (primary) · `#9333EA` Purple · `#2563EB` Blue (secondary) · `#3B82F6` Blue Light · gradient `135°, #A78BFA 0% → #7C3AED 39% → #3B82F6 100%`. Neutrals: `#0A0A0F` Ink · `#1A1A24` Ink Raised · `#4A4A5A` Slate · `#6B6B7B` Slate Light · `#E7E7EC` Line · `#F7F7F9` Mist · `#FFFFFF` White.

All of the above are declared once as custom properties at the top of `css/styles.css` — change a token there and it propagates through the whole site. No colour, font, spacing value or logo variation outside the supplied guidelines has been introduced.

---

## Licensing & attribution

- **Hanken Grotesk** — SIL Open Font License 1.1 (Alfredo Marco Pradil). Full text in `fonts/OFL.txt`. Free to bundle and self-host, including commercially; the font itself may not be sold on its own.
- **Neue Haas Grotesk Display** — commercial licence required, not included.
- **Icons** — the 37 icons in `/icons/` are drawn to the Lucide specification (ISC licence): 24 × 24 grid, 1.5 px stroke, round caps and joins, `currentColor` stroke. Downloadable as a set from Section 06.
- **Logo artwork and brand content** — © Nexyra Consulting Ltd. All rights reserved.

---

## Technical notes

- Plain semantic HTML5, one stylesheet plus one font stylesheet, one small vanilla-JS file. No dependencies, no tracking, no cookies.
- `js/main.js` only adds scroll-spy highlighting in the top navigation; the site is fully usable with JavaScript disabled.
- Responsive from 320 px upward: fluid grids collapse via `auto-fit` / `minmax`, gutters and section padding step down under 720 px, and the top nav links hide on small screens (contents list remains).
- Accessibility: 2 px violet `:focus-visible` rings on all interactive elements, body copy at 4.5:1 or better, decorative logo images carry empty `alt`.
- `index.html` carries `<meta name="robots" content="noindex">` — remove it if the guidelines should be publicly indexed.

Questions on usage: hello@nexyraconsulting.co.uk
