# The Confidence Academy — Social Post Templates

Internal brand templates for Facebook, Instagram, LinkedIn, TikTok and YouTube,
built from Brand guidelines v1.2. Edit copy in the browser, drop in your own
photo or video, preview it, and export a JPG or an MP4 — or push one piece of
content across all five formats at once.

© 2026 The Confidence Academy · Internal use only.

---

## Deploying

The whole thing is static — HTML, images and PSDs. There is no build step, no
package install and no server-side runtime. Nothing is fetched from another
host: the brand lock-up is embedded in the page, so the only outbound requests
are the Google Fonts stylesheet and the Unsplash placeholder photography, both
of which you replace with your own material anyway.

**Any static host.** Upload the contents of this folder so that `index.html`
sits at the root of the site. That's it. Works on Netlify, Vercel, Cloudflare
Pages, GitHub Pages, S3 + CloudFront, or any Apache or nginx directory.

**Drag-and-drop hosts.** Drag the whole `tca-social-templates` folder onto the
deploy area. Keep the folder structure — `index.html` looks for `assets/`, the
favicons and `site.webmanifest` beside it.

**Straight off disk.** Double-click `index.html`. Everything works, including
JPG and video export, because the logo travels inside the page rather than being
loaded as a separate file. Only the web fonts and the stock photography need a
connection.

Nothing in `deploy/` or `tools/` needs to be uploaded — they're for you, not the
browser. Delete them from the upload if you'd rather keep the site minimal.

---

## Signing in

The landing page asks for credentials:

| | |
|---|---|
| Username | `TCAsocial` |
| Password | `admingbm` |

Five wrong attempts trigger a short lockout. A successful sign-in lasts for the
browser tab; **Log out** in the toolbar ends it.

To change the credentials, generate new digests and paste them over the two
`AUTH` values near the bottom of `index.html`:

```bash
python3 tools/tca_assets.py hash NewUsername NewPassword
```

---

## Please read this before putting it on a public URL

The sign-in runs in the browser, because a static site has nowhere else to run
it. The credentials are stored as salted SHA-256 digests rather than plain text,
and until you sign in the templates markup sits in an inert `<template>` element
so none of it loads. That stops casual access and it stops search engines and
passers-by. **It does not stop anyone who opens the page source.**

If this is going anywhere publicly reachable, add access control at the web
server so the request is refused before any of the page is sent. That is a
five-minute change and it is the real lock:

- **Apache** — uncomment the Basic-auth block in `deploy/apache.htaccess`.
- **nginx** — uncomment the `auth_basic` lines in `deploy/nginx.conf.example`.
- **Netlify** — turn on Visitor access password protection in site settings.
- **Cloudflare Pages / Vercel** — use the platform's built-in password
  protection or an Access policy.

With host-level auth in front, the in-page sign-in becomes a second, cosmetic
door, which is fine. Without it, treat the URL as effectively public and don't
put anything confidential behind it.

Serve over HTTPS either way.

---

## What's in the folder

```
tca-social-templates/
├── index.html              the whole application: sign-in + five templates
├── logo-primary.svg        the brand lock-up as supplied
├── logo-primary.png        the same artwork, sized for screen and embedded in index.html
├── site.webmanifest        icon and theme metadata
├── robots.txt              asks search engines not to index it
├── favicon.ico             plus favicon-16/32/48/192/512 and apple-touch-icon
├── assets/
│   └── TCA-*.psd           five layered Photoshop files, one per template
├── deploy/                 example host configs — not uploaded
│   ├── apache.htaccess
│   ├── netlify_headers
│   └── nginx.conf.example
└── tools/
    ├── tca_assets.py       favicon + logo generator, and credential hasher
    └── favicon-source-running.png   the artwork the favicons are cut from
```

### About the logo

`index.html` carries the lock-up inline as a data URI rather than linking to a
file or a remote host. That means one copy for the sign-in screen, the page
masthead and all five template logo cards; no extra request; and — the reason it
matters — canvas exports keep working when the page is opened from the file
system, where a browser would otherwise refuse to export an image that had
loaded a local file.

`logo-primary.svg` is kept alongside for any other use. It's an SVG wrapper
around an embedded raster, which is why the page uses the PNG the tool extracts
from it. The PSD logo cards use the same artwork.

To regenerate after a logo update:

```bash
python3 tools/tca_assets.py logo logo-primary.svg --outdir .
```

Then paste the contents of `logo-datauri.txt` over the `TCA_LOGO` constant near
the top of `index.html`.

---

## Using the templates

- **Text** — click any headline, supporting line, badge, stat or button and type
  over it. Enter breaks a headline where you want it.
- **Media** — *Upload photo or video* on TikTok and YouTube, *Replace photo*
  elsewhere, or drag a file onto any template. **Crop focus** slides the frame
  along whichever axis the crop has slack on.
- **Export** — the download button follows what you uploaded: a JPG for a still,
  an MP4 or WebM for a video. Everything renders at full export size, not the
  reduced size shown on screen.
- **Replicate to all** — pushes the current template's copy and media to the
  other four. Each keeps its own dimensions, type sizes and crop; headlines are
  re-broken to fit rather than copied line for line. Nothing downloads
  automatically, and there's an Undo.
- **Guides** — the toggle at the top shows safe margins and each platform's UI
  keep-out zones.

Full notes, including the PSD layer structure and the deliberate deviations from
the brand tokens, are at the bottom of the page itself.

---

## Regenerating the favicons

The icons are cut from `tools/favicon-source-running.png` — the running figure,
at its original colours. The generator trims the transparent margin and centres
the mark in a square so it stays legible at 16px; nothing is recoloured.

```bash
python3 tools/tca_assets.py icons tools/favicon-source-running.png --outdir .
```

Produces the multi-size `.ico`, PNGs at 16/32/48/192/512, and a 180px Apple
touch icon flattened onto white, since iOS renders transparency as black and the
artwork is drawn on white. Requires Pillow.
