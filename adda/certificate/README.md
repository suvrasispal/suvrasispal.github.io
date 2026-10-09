# Adda · Certificate Generator

Static web app that fills in an A4 landscape Durga Puja certificate and exports it as a PDF. No build step, no server code.

## Structure

```
adda-certificate/
├── index.html              App entry
├── css/
│   ├── modernist.css       Design-system tokens + UI components (buttons, inputs, tags)
│   └── app.css             App layout + certificate styles
├── js/
│   └── app.js              Form binding, sponsor uploads, preview scaling, PDF export
├── assets/
│   ├── images/             adda-logo.png, durga-face.png, medal-gold.png
│   └── ornaments/          corner-*, edge-*, divider.png, ribbon.png
└── README.md
```

## Deploy

Upload the whole `adda-certificate/` folder to any static host (Netlify, Vercel, GitHub Pages, cPanel, S3, etc.). `index.html` is the entry point.

To run locally, serve the folder over HTTP (opening the file directly via `file://` blocks the PDF font embedding):

```
cd adda-certificate
python3 -m http.server 8080
# open http://localhost:8080
```

## External dependencies (CDN, loaded at runtime)

- Google Fonts: Archivo (UI), Forum, Ovo, Yellowtail (certificate)
- html-to-image 1.11.11 — renders the certificate to a canvas
- jsPDF 2.5.1 — writes the A4 landscape PDF

An internet connection is required for fonts and PDF export.

## Editing

- Certificate layout: `css/app.css` (`.cert*`, `.c-*`, `.medal*` rules). The certificate is a fixed 1123 × 794 px canvas (A4 at 96 dpi).
- Default text: the `value` attributes in `index.html` and `state` in `js/app.js`.
- Artwork: replace files in `assets/` keeping the same names.
