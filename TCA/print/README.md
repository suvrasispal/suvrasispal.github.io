# TCA promotional print templates

Four production-ready templates for The Confidence Academy: Get Britain Moving CIC — two A5 flyers and two 850 × 2000mm pull-up banners, built to brand guidelines v1.2 and the copy published on the TCA site.

Everything is driven by **`tca-print-studio.html`**. Open it in a browser (Chrome, Edge, Safari or Firefox); it needs no server, no install and no internet connection except to fetch the official logo. The PDFs, JPGs and the PSD in this folder are sample exports produced by the same engine, so you can hand them to a printer today.

---

## 1. What's in the file

| | A5 Flyer A | A5 Flyer B | Banner A | Banner B |
|---|---|---|---|---|
| Approach | Typography + gradient panel | Photograph + flat scrim | Typography + vertical ladder | Photograph + scrim, QR on the dark panel |
| Trim | 148 × 210mm | 148 × 210mm | 850 × 2000mm | 850 × 2000mm |
| Bleed | 3mm | 3mm | 20mm | 20mm |
| Safe margin | 8mm | 8mm | 50mm | 50mm |
| QR | 25mm | 30mm | 236mm | 216mm |

The two variations in each format are different compositions, not colour swaps: one is type-led with the signature 115° Royal Blue → Red panel, the other is image-led with a flat solid scrim behind the headline.

## 2. Editing

- **Click any text on the artwork** to edit it in place, or use the fields in the left panel. Both stay in sync.
- **Photographs**: upload, replace, remove, zoom, and reposition with sliders or by dragging directly on the artwork. Drag-and-drop onto the canvas works too.
- **QR destination** is a single field. The code is generated inside the file and redraws instantly — no external service, no tracking pixel.
- **Logo**: the official `logo-primary.svg` you supplied is **embedded in the file** (1213 × 660px) and placed unaltered — never recoloured, redrawn, rotated, stretched or cropped. Nothing is downloaded, so the studio works offline and exports are identical every time. You can still upload a replacement in the Logo panel.
- The tick box at the top of the page — *Show safe margins and platform keep-out zones* — overlays bleed, trim, safe area, the banner cassette keep-out and the comfortable eye/scan height band. Guides are never included in JPG or PDF exports, and arrive in the PSD as a hidden layer.

## 3. Downloads

Each template offers four:

- **JPG** — full bleed at the chosen resolution.
- **Print PDF** — correct MediaBox, BleedBox and TrimBox, vector crop marks in 100% K, and a slug line outside the trim recording the specification.
- **Layered PSD** — a genuine 8BPS file: RGB, 8-bit, RLE compressed, one named layer per design element, guides included but switched off.
- **Editable SVG** — vector, with live text and the same named layers.

### Why the PSD has rasterised text

The PSD is real and layered — you can hide, move, recolour and remask any element in Photoshop. What a browser cannot write is Photoshop's own text and shape-layer object model, so type arrives as pixels on its own layer rather than as editable type. This is a hard limit of the format, not a shortcut.

If you need to re-typeset rather than re-position, use **Download editable SVG**. It opens in Illustrator, Affinity Designer or Inkscape with live text, real vector geometry and the same layer names, and Photoshop imports it as vector smart objects. That is the closest practical editable source format.

## 4. Logo and favicons

The supplied logo is embedded directly in `tca-print-studio.html` as the original artwork — no network request, no substitution. The Logo panel shows its effective resolution at the size each template places it:

| Template | Placed width | Effective resolution |
|---|---|---|
| A5 flyers | 44–47mm | ~656 DPI — ample |
| Pull-up banners | 330mm | ~93 DPI |

93 DPI is fine for a pull-up banner viewed from a metre or more, and it matches the 100 DPI the banner artwork is supplied at. It is worth knowing, though, that the supplied file is a 1213 × 660px raster inside an SVG wrapper rather than true vector artwork, so it cannot be enlarged beyond that. If TCA has the original vector logo (AI, EPS or a true vector PDF), uploading it in the Logo panel removes the ceiling entirely and is worth doing before a large banner run.

### Favicons

`make-favicon.py` builds the whole icon set from the same file. Run it again any time the logo changes:

```
python3 make-favicon.py favicon/source-logo-primary.svg favicon/
```

It scales the logo proportionally and centres it on a square canvas with ~7% clear space. Colours, proportions and artwork are untouched — the only change is the square canvas a favicon format demands.

The `favicon/` folder contains:

- `favicon.ico` — 16, 24, 32, 48 and 64px in one file
- `favicon.svg` — scalable, the original artwork re-wrapped square
- `favicon-16x16.png` through `favicon-512x512.png` — transparent
- `apple-touch-icon.png` (180px) and `icon-192-maskable.png` — on a white card, because iOS ignores transparency and would otherwise composite the navy artwork onto black
- `head-snippet.html` — the `<link>` tags to paste into any site's `<head>`
- `source-logo-primary.svg` — the file everything was generated from

The 32px and 16px icons are already embedded in the studio, so the browser tab shows the TCA mark.

One honest note: the logo is a wide lockup — wordmark, tagline and runner. Squeezed into a 16px square it becomes a coloured smudge, which is unavoidable for any full lockup at that size. The brand book anticipates this and permits a plain "TCA" monogram as a favicon stand-in. You asked for the exact logo, so that is what these are; say the word if you'd like a monogram variant for the small sizes.

## 5. Colour

Exports are **RGB**. A browser has no colour-management engine, so an unprofiled CMYK conversion here would be worse than the one your printer performs. Send the PDF as RGB and ask them to convert with their own profile, or convert in Acrobat or Affinity to whichever profile they name — UK litho is usually FOGRA39 / ISO Coated v2; large format is press-specific.

Reference values: Royal Blue `#00247D`, Red `#CF142B`, Gold `#FFB81C`, Sky `#4A90D9`, Ink `#0B1C39`. Ask for a proof rather than trusting a screen.

## 6. Banner keep-out zones

The bottom **150mm** disappears into the roller cassette and the top **40mm** goes into the rail. Both templates run a flat colour field through those areas so a cut anywhere in them is invisible, and no text or QR sits inside them. The guides also mark **900–1600mm from the floor**, which is eye height — the headline and the QR both sit inside that band.

If your printer asks for a longer bottom leader to wrap onto the roller, raise the bleed value to 100–150mm in the Print setup panel rather than moving the artwork down.

## 7. Image resolution checks

Uploads are measured against the size they actually print at, not their pixel count in isolation, and re-checked whenever you zoom:

| | Good for print | Acceptable with caution | Too low |
|---|---|---|---|
| A5 | ≥ 300 DPI | 200–299 DPI | < 200 DPI |
| Banner | ≥ 150 DPI | 100–149 DPI | < 100 DPI |

A low-resolution image is never blocked — you get the warning and decide.

## 8. Copy TCA needs to confirm before printing

- **The refund amount.** The site's own FAQ still flags this as open: the working model discussed is a £10 deposit with £8 returned and £2 retained toward costs. **Nothing in these templates claims a full refund** — the wording throughout is "your deposit is returned". If a retention is confirmed, state it on the flyer and at the point of payment.
- **Facebook and YouTube** are listed on the site as coming soon. The icons are included as requested and the handles are editable, so clear them or remove the accounts until they exist. TikTok `@.confidence.academy` and Instagram `@confidence.academy.uk` are live.
- **Illness and cancellation policy** is not yet published, so nothing is claimed about it.
- **Session dates and venues** are still to be confirmed; no template states one. The QR points at the waitlist form so the flyer never goes out of date.
- **Social icons** are drawn to the brand's own icon rules (24-unit grid, flat single colour) rather than copied from each platform. For a large run, swap in the official assets from each platform's brand centre.

The deposit sequence used — pay a deposit of £10–£45, attend and be marked in, deposit returned by bank transfer, back within 24 hours of the session attended — is taken from the live site, not assumed.

## 9. Before you send to print

1. Turn the guides on and confirm nothing important crosses the green safe line.
2. Scan the QR with a phone from the distance people will actually stand.
3. Check any uploaded photo reads "Good for print".
4. Open the PDF and confirm the trim size in Document Properties, and that crop marks are present.
5. Confirm the refund wording with TCA.

---

## Files in this folder

- `tca-print-studio.html` — the editor. Everything else is generated from it.
- `TCA-A5-flyer-A-148x210mm-print.pdf` / `-bleed-300dpi.jpg`
- `TCA-A5-flyer-B-148x210mm-print.pdf` / `-bleed-300dpi.jpg`
- `TCA-pullup-banner-A-850x2000mm-print.pdf` / `-bleed-100dpi.jpg`
- `TCA-pullup-banner-B-850x2000mm-print.pdf` / `-bleed-100dpi.jpg`
- `TCA-A5-flyer-A-148x210mm-300dpi-layered.psd` — sample layered PSD
- `favicon/` — the complete favicon set, plus the source logo
- `make-favicon.py` — regenerates that set from any updated logo

The banner samples are supplied at 100 DPI at full size, which is a normal large-format working resolution. Re-export at 150 DPI from the studio if your printer asks for it. All sample exports use the official logo you supplied.
