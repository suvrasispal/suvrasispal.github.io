# The Confidence Academy — Brand Book & Design System

Deployment package. **Version 1.3** (HTML) — *Get Britain Moving*.

---

## Contents

| File | Purpose |
|---|---|
| `index.html` | The brand book. Entry point — 13 sections, sticky left navigation. |
| `logo-primary.svg` | Primary logo lockup. **Required** by `index.html`. |
| `favicon.svg` | Temporary TCA monogram. See *Known gap* below. |
| `TCA-Brand-Book-Design-System-v1.2.pdf` | Printable A4 edition, 15 pages, clickable contents + bookmarks. |

---

## Deploying

It is a static site. No build step, no dependencies, no server-side code.

**Keep all files in the same directory.** `index.html` references
`logo-primary.svg` and `favicon.svg` by relative path; separating them breaks
the logo (though it degrades to a styled text fallback rather than a broken
image icon).

### Any static host

Upload the folder as-is. Works on Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3 + CloudFront, or any Apache/nginx docroot.

```
# local preview
python3 -m http.server 8000
# then open http://localhost:8000
```

### Recommended headers

```
Content-Type: text/html; charset=utf-8     # index.html
Content-Type: image/svg+xml                # .svg
Cache-Control: public, max-age=3600        # index.html
Cache-Control: public, max-age=31536000    # .svg, .pdf (immutable, versioned)
```

Serve over **HTTPS** — Google Fonts and the reference photography are loaded
over `https://` and will be blocked as mixed content on an `http://` page.

---

## Before you go public — read this

### 1. The reference photography is hotlinked to Unsplash

`index.html` makes **11 requests to `images.unsplash.com`**. These are
third-party stock images, hotlinked rather than self-hosted. That means:

- the page depends on Unsplash staying up and keeping those photo IDs live;
- Unsplash sees traffic from your users;
- the images are creative *direction*, not licensed brand assets.

The book itself states these are placeholders: *"replace with commissioned
photography of real members before shipping any of this to production."*

If a photo ever 404s, the page degrades gracefully — a labelled dashed panel
appears with the alt text, not a broken-image icon.

**Recommended:** self-host commissioned photography in an `img/` folder and
update the `src` attributes.

### 2. Google Fonts is a third-party dependency

Sora, Inter and Space Mono load from `fonts.googleapis.com` /
`fonts.gstatic.com` (3 requests). The page renders immediately regardless —
fonts load non-render-blocking and every rule has a full system fallback
stack. If your organisation blocks Google Fonts, or you need GDPR-clean
self-hosting, download the families and serve them locally.

### 3. Known gap — the app icon / favicon

`favicon.svg` is a plain **TCA monogram, not the trademark**. Section 03 of
the book records why: the runner and wordmark overlap in the registered
artwork, so a clean icon-only crop is not possible without redrawing a
registered mark. A true icon-only lockup should be commissioned from the
original designer. Until then this monogram is the sanctioned stand-in.

There is also **no reversed (light-on-dark) logo version**. If the brand needs
to appear on a dark surface, have one produced properly rather than
approximating it.

---

## Accessibility

Accessibility is one of the four brand pillars, so the book holds itself to
its own standard.

- Body text never below 16px; line height 1.5 minimum.
- All navigation and cover text meets **WCAG 2.1 AA** — Ink `#0B1C39` on
  Sky Blue `#4A90D9` measures **5.07:1** (AA requires 4.5:1).
- Visible keyboard focus states (`:focus-visible`).
- `prefers-reduced-motion` respected.
- Every image carries alt text; no image is decorative-only without a label.

---

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses CSS Grid,
custom properties, and `:has()` for one cosmetic divider rule — where `:has()`
is unsupported the nav simply shows one extra divider line, which is harmless.

Fully responsive: the sidebar becomes a stacked block below 900px.

Printing `index.html` uses a dedicated A4 print stylesheet — the sidebar is
hidden and cards are kept from splitting across pages. For a polished printed
artefact, use the supplied PDF instead.

---

## Version note

The HTML is **v1.3** (Sky Blue navigation and cover treatment). The bundled
PDF is **v1.2** and still carries the earlier dark Ink cover; its content,
structure and section order are otherwise identical. Regenerate the PDF if
you need the two to match visually.

One open item: section 04 states Sky Blue is used at roughly 5% of a screen.
Since v1.3 makes Sky Blue the navigation and cover surface, that stated
percentage no longer reflects the design and should be updated.
