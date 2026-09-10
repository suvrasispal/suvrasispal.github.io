# Nexyra Consulting — Social Media Templates

Three fully branded, independently-designed social post templates — **Facebook**, **Instagram** and **LinkedIn** — built from the [Nexyra Consulting Brand Guidelines & Design System](https://suvrasispal.github.io/nexyra/brand/) v1.0. Each platform has its own browser-based editor (upload a photo or video, reposition/zoom it, edit the copy, export) plus a matching, fully-layered Photoshop file.

This is a working tool, not a mockup: open a template, drop in your own image or video, drag and zoom it into place, edit the headline/body/CTA, and export a real JPG, PNG or MP4 at the correct dimensions — entirely in the browser, with nothing uploaded to a server.

## Quick start

```bash
python3 serve.py        # or: npx serve .  /  any static file server
```

Then open **http://127.0.0.1:8000/** for the dashboard, or jump straight into a template:

- `facebook/index.html` — 1200 × 630 px
- `instagram/index.html` — 1080 × 1080 px
- `linkedin/index.html` — 1200 × 627 px

**Use `serve.py`, not a plain `python3 -m http.server`, if you want to test MP4 export locally.** MP4 export uses `SharedArrayBuffer`, which browsers only expose on a "cross-origin isolated" page — that needs two response headers (`Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`) that most simple static servers don't send by default. `serve.py` adds them. Everything else (upload, drag, zoom, text editing, JPG/PNG export) works with any static server, including opening the files directly.

## Deploying

Deploy the folder as-is to any static host. For MP4 export to work in production, the host needs to send the same two headers as above on every response:

- **Netlify** or **Cloudflare Pages** — the included `_headers` file already does this.
- **Vercel** — the included `vercel.json` already does this.
- **GitHub Pages** — cannot set custom response headers, so MP4 export will automatically fall back to a WebM download instead (see [Browser support](#browser-support-and-fallbacks) below). Everything else works unchanged. If you need MP4 on GitHub Pages, put Cloudflare in front of it, or host on Netlify/Vercel instead.

## What's included

```
nexyra-social-templates/
├── index.html                       Dashboard — preview, edit, and download PSD for all three templates
├── serve.py                         Local dev server with the headers MP4 export needs
├── _headers / vercel.json           Same headers, for Netlify/Cloudflare Pages and Vercel deploys
│
├── facebook/index.html              Facebook editor  (1200×630 — full-bleed photo + bottom scrim)
├── instagram/index.html             Instagram editor (1080×1080 — photo top / ink panel bottom)
├── linkedin/index.html              LinkedIn editor  (1200×627 — professional split panel)
│
├── assets/
│   ├── css/brand.css                 Design tokens (colour, type, spacing) + shared editor UI styles
│   ├── js/nexyra-editor.js           The editor engine: upload, crop/zoom, text-lock, JPG/PNG/MP4 export
│   ├── fonts/                        Hanken Grotesk, self-hosted (woff2, OFL-licensed)
│   ├── logos/                        Official Nexyra lockup (PNG) + app icon (favicon); legacy monogram SVGs kept for reference
│   ├── icons/icons.js                Small Lucide-style icon set used in the editor UI
│   ├── images/                       Dashboard preview thumbnails
│   └── vendor/                       html2canvas + ffmpeg.wasm, vendored locally (no CDN dependency)
│
├── psd/
│   ├── Nexyra_Facebook_Template.psd
│   ├── Nexyra_Instagram_Template.psd
│   ├── Nexyra_LinkedIn_Template.psd
│   ├── generate_psds.js              The script that builds the three PSDs above (Node + ag-psd + node-canvas)
│   └── fonts-ttf/                    TTF builds of Hanken Grotesk, used only by generate_psds.js
│
└── README.md
```

Each editor page is self-contained (it only reaches into `../assets/`), so a template folder can be copied out and hosted on its own if you ever want just one platform.

## Editing a template

Open any of the three editors and you'll see the live template on the left and a control panel on the right.

- **Media** — click *Upload Image* or *Upload Video* (or drag a file straight onto the photo), then drag inside the photo to reposition it and use the zoom slider or scroll wheel to crop. *Reset Position* re-centres and re-fits it. The template's own layout, logo and colours never move — only the crop window's content changes.
- **Branding** — click *Change Logo* to swap in your own logo image (PNG, JPG, WebP or SVG); it keeps the exact position and height the Nexyra lockup uses in that template, so the rest of the layout never shifts. *Reset Logo* restores the default Nexyra lockup.
- **Text** — click directly on the headline, supporting text or CTA to edit it in place. Font, weight, colour and position stay locked to the brand system; only the words change. Long copy shrinks slightly to keep fitting its box rather than breaking the layout.
- **Export** — choose JPG or PNG and click *Download Image*. If you've uploaded a video, a *Download MP4* button appears too.
- **PSD** — the *Download PSD* button/link (top bar and dashboard) gives you the editable Photoshop source for that template.

Supported uploads: JPG, PNG, WebP for images; MP4, WebM, MOV, OGG for video (whatever your browser can decode — all modern browsers play MP4/H.264 natively).

## How MP4 export works

Everything runs client-side, so a video you upload never leaves your browser:

1. The template's brand chrome (logo, overlays, text, CTA) is rendered once to a transparent-holed overlay image.
2. A hidden canvas draws your cropped video frame plus that overlay, in real time, for one loop of the video.
3. `MediaRecorder` captures that canvas as WebM.
4. [`ffmpeg.wasm`](https://github.com/ffmpegwasm/ffmpeg.wasm) (loaded on demand, not on page load) transcodes the WebM to a standard H.264 MP4 in the browser.

Keep the browser tab focused and in the foreground while an MP4 export is running — like any real-time screen/canvas capture, backgrounding the tab can starve it of frames.

### Browser support and fallbacks

- JPG/PNG export and all editing works in any modern browser.
- MP4 export needs `MediaRecorder` and `SharedArrayBuffer` (i.e. a cross-origin-isolated page — see [Deploying](#deploying)). If either is unavailable, the app automatically downloads a WebM file instead — still a fully valid, high-quality video, just note that it's WebM rather than MP4 (all modern browsers, VLC, and most editors open WebM directly; convert with `ffmpeg -i in.webm out.mp4` if you specifically need an MP4 file).

## The Photoshop files

Each PSD is generated programmatically (see `psd/generate_psds.js`) rather than by hand, using [ag-psd](https://github.com/Agamnentzar/ag-psd) so the layer structure is real, valid PSD data — verified by re-opening and re-compositing every layer independently, not just visually inspected.

Each file is organised into named, nested layer groups mirroring the brief:

```
Logo              (Monogram, Wordmark)
Background        (Photo, Ink Fill)
Overlay Elements  (scrims / tints / duotone / divider, per template)
Shapes / Decorative Elements
Text              (Eyebrow badge, Headline, Supporting text)
CTA               (Background, Label + Arrow)
Other Brand Elements  (URL label; the Strategy/Design/Build segmented control on LinkedIn)
```

**One honest limitation:** these are image layers, not live Photoshop type layers — there was no reliable way to generate editable Adobe text-engine data outside of Photoshop itself. Every text element is still on its own clearly-named layer at the correct position, colour and (Hanken Grotesk-matched) size, so replacing it is a normal "hide this layer, add a live type layer in the same spot" step, not a redesign. The **Photo** layer in each file is a tasteful placeholder, not a real photo — swap it for your own image the same way.

## Image & type credits

- **Default photos** in the live web templates are hot-linked from Unsplash under the [Unsplash License](https://unsplash.com/license) (free to use, no permission required):
  - Facebook default — photo by [Vitaly Gariev](https://unsplash.com/@silverkblack)
  - Instagram default — photo by [Dhony Koswara](https://unsplash.com/@dhony24)
  - LinkedIn default — photo by [Vitaly Gariev](https://unsplash.com/@silverkblack)

  These are placeholders only — the whole point of the editor is to replace them with your own media. They're linked rather than bundled so the credit stays live and no image binary needed to be re-hosted.
- **Typeface**: [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) by Alfredo Marco Pradil, SIL Open Font License 1.1. Self-hosted from `assets/fonts` per the brand guideline's "self-hosted, no external font service" rule.
- **Logo**: the dashboard header and all three templates use the official Nexyra horizontal lockup (`assets/logos/nexyra-lockup-horizontal-white.png`) and the official app icon as the favicon (`assets/logos/nexyra-appicon-violet-1200.png`), both supplied directly by the client. The earlier hand-drawn monogram SVGs are still in `assets/logos/` for reference but are no longer used anywhere in the templates.

## Known limitations & things to check before shipping

- PSD text layers are rasterised, not live type (see above).
- The dashboard's preview thumbnails and the PSDs' placeholder photo use a brand-coloured abstract gradient rather than a real photo, so the deliverable doesn't imply stock imagery that isn't actually licensed for redistribution in a static thumbnail.
- MP4 export requires the page to be cross-origin isolated in production (see Deploying) or it will fall back to WebM.
- Tested in Chromium via Playwright for upload → drag → zoom → text edit → JPG/PNG export → MP4 export, on all three templates. If you hit a browser-specific issue (older Safari versions have had rough edges with `MediaRecorder` canvas capture), the JPG/PNG path has no such dependency and will always work.
