# The Confidence Academy — Social Post Templates

Internal brand templates for Facebook, Instagram, LinkedIn, TikTok and YouTube,
built from Brand guidelines v1.2. Edit copy in the browser, drop in your own
photo or video, preview it, and export a JPG or an MP4 — or push one piece of
content across all five formats at once.

© 2026 The Confidence Academy · Internal use only.

---

## Deploying

The whole thing is static — HTML, images and PSDs. There is no build step, no
package install, no server-side runtime and no sign-in. Opening the page puts
you straight into the templates.

Nothing of yours is fetched from another host: the brand lock-up is embedded in
the page itself, so the only outbound requests are the Google Fonts stylesheet
and the Unsplash placeholder photography — and the placeholders are meant to be
replaced with your own material anyway.

**Any static host.** Upload the contents of this folder so that `index.html`
sits at the root of the site. That's it. Works on Netlify, Vercel, Cloudflare
Pages, GitHub Pages, S3 + CloudFront, or any Apache or nginx directory.

**Drag-and-drop hosts.** Drag the whole `tca-social-templates` folder onto the
deploy area. Keep the folder structure — `index.html` looks for `assets/`, the
favicons and `site.webmanifest` beside it.

**Straight off disk.** Double-click `index.html`. Everything works, including
JPG and video export, because the logo travels inside the page rather than
loading as a separate file. Only the web fonts and the stock photography need a
connection.

Nothing in `deploy/` or `tools/` needs to be uploaded — they're for you, not the
browser. Delete them from the upload if you'd rather keep the site minimal.

---

## There is no access control in this page

Worth being plain about, because the previous version had a sign-in screen and
this one doesn't. **Anyone who can reach the URL can open the templates, edit
them and download the PSDs.** The page does not check anything, and the
`noindex` in `robots.txt` is a polite request to search engines, not a lock.

That's completely fine for a private network, an internal wiki link, or a laptop.
If it goes on a public URL and you want it restricted, put the check at the web
server, where it happens before any of the page is sent. Each file in `deploy/`
has the change ready to uncomment:

- **Apache** — the Basic-auth block in `deploy/apache.htaccess`, after
  `htpasswd -c /etc/apache2/tca.htpasswd yourname`.
- **nginx** — the `auth_basic` lines in `deploy/nginx.conf.example`.
- **Netlify** — Visitor access password protection in site settings.
- **Cloudflare Pages / Vercel** — the platform's password protection or an
  Access policy.

This is genuinely stronger than the sign-in screen that used to be here, which
ran in the browser and could be bypassed by anyone reading the page source.
Serve over HTTPS either way.

---

## What's in the folder

```
tca-social-templates/
├── index.html              the whole application — five templates, no login
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
    ├── tca_assets.py       favicon and logo generator
    └── favicon-source-running.png   the artwork the favicons are cut from
```

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

## Regenerating the brand assets

Both commands need Pillow (`pip install Pillow`).

**Logo.** `logo-primary.svg` is an SVG wrapper around an embedded raster, so the
tool pulls the image straight out of it, sizes it for screen and palettises it —
flat brand artwork reduces to 32 colours with no visible change, which is what
makes it small enough to live inside the page.

```bash
python3 tools/tca_assets.py logo logo-primary.svg --outdir .
```

Then paste the contents of `logo-datauri.txt` over the `TCA_LOGO` constant near
the top of `index.html`. That one copy feeds the masthead and all five template
logo cards. The PSDs use the same artwork.

**Favicons.** Cut from the running figure at its original colours. The generator
trims the transparent margin and centres the mark in a square so it stays legible
at 16px; nothing is recoloured.

```bash
python3 tools/tca_assets.py icons tools/favicon-source-running.png --outdir .
```

Produces the multi-size `.ico`, PNGs at 16/32/48/192/512, and a 180px Apple touch
icon flattened onto white — iOS renders transparency as black, and the artwork is
drawn on white.
