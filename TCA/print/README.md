# TCA Print Studio — deployment package

Admin-only flyer and pull-up banner templates for The Confidence Academy: Get Britain Moving CIC. Drop this folder onto any static host and open it — there is no build step, no server code and no dependencies.

---

## Quick start

**Locally:** open `index.html` in a browser.

**Deployed:** copy the folder contents to a directory on your host, for example alongside the existing pages so it sits at `…/TCA/print/`. It is a static site, so GitHub Pages, Netlify, Vercel, S3, or ordinary shared hosting all work unchanged.

Log in with the username and password issued to the marketing team.

---

## Contents

```
tca-print-studio/
├── index.html                  the studio — self-contained, ~500KB
├── favicon.ico                 16/24/32/48/64 in one file
├── favicon.svg                 scalable
├── favicon-16x16.png           …32, 192, 512
├── apple-touch-icon.png        180px, on a white card for iOS
├── icon-192-maskable.png       Android adaptive icon
├── site.webmanifest            installable-app metadata
├── robots.txt                  disallows indexing
├── .htaccess                   commented stub for real Apache auth
├── README.md                   this file
├── brand/
│   └── logo-primary.svg        the source logo everything is built from
├── tools/
│   ├── set-admin-login.py      change the admin username and password
│   └── make-favicon.py         rebuild the icon set from a new logo
└── print-files/                ready-to-send sample exports
    ├── TCA-A5-flyer-A-148x210mm-print.pdf        + 300dpi JPG
    ├── TCA-A5-flyer-B-148x210mm-print.pdf        + 300dpi JPG
    ├── TCA-pullup-banner-A-850x2000mm-print.pdf  + 100dpi JPG
    ├── TCA-pullup-banner-B-850x2000mm-print.pdf  + 100dpi JPG
    └── TCA-A5-flyer-A-148x210mm-300dpi-layered.psd
```

`index.html` carries its own fonts, logo, QR encoder, PDF writer and PSD writer, so it keeps working offline and needs nothing from the network. The favicon files are duplicated inside it as data URIs, which is why the tab icon still appears if someone opens the HTML on its own.

---

## Admin access

The studio opens on an **Admin access** screen: TCA logo, username, password with a Show toggle, and a Log in button, with the brand colour bar down the left of the page and across the top of the card. Nothing is rendered until sign-in — no templates, no panel, no artwork. The session ends when the tab closes, and there is a **Log out** button in the top bar.

### Changing the credentials

```
python3 tools/set-admin-login.py index.html NEWUSERNAME
```

It prompts for the password without echoing it, stores a SHA-256 hash so the password never appears in the file, and writes an `index.html.bak` backup. Requires Python 3, no packages.

### Security — please read

The check runs in the browser, so **it is a deterrent, not real access control.** Anyone who opens `index.html` in a text editor or dev tools can see the credential block and work around the gate. Hashing stops the password being read; it does not stop a determined person reaching the tool.

That is fine for keeping a working tool out of the way of people who should not be editing print artwork. It is not enough if the folder is published publicly and the contents are genuinely confidential. For real protection, put it behind something that authenticates on the server:

- **Apache / shared hosting** — uncomment the block in `.htaccess` and create a `.htpasswd` file.
- **Netlify** — password-protect the site, or use Netlify Identity.
- **Cloudflare** — put the path behind Cloudflare Access.
- **GitHub Pages** — has no access control at all; use a private repo with another host, or one of the above.

Also worth knowing: because `index.html` is entirely self-contained, anyone given a copy can keep using it offline indefinitely. Distribution is the real control, not the login.

---

## The four templates

| | A5 Flyer A | A5 Flyer B | Banner A | Banner B |
|---|---|---|---|---|
| Approach | Typography + gradient panel | Photograph + flat scrim | Typography + vertical ladder | Photograph + scrim, QR on the dark panel |
| Trim | 148 × 210mm | 148 × 210mm | 850 × 2000mm | 850 × 2000mm |
| Bleed | 3mm | 3mm | 20mm | 20mm |
| Safe margin | 8mm | 8mm | 50mm | 50mm |
| QR | 25mm | 30mm | 236mm | 216mm |

The two variations in each format are different compositions, not recolours.

**Editing:** click any text on the artwork to edit in place, or use the left panel. Photographs can be uploaded, replaced, zoomed and repositioned by dragging. The QR destination is a single field and the code redraws instantly. The tick box at the top of the page shows bleed, trim, safe area, the banner cassette keep-out and the comfortable eye/scan height band; guides never appear in exports.

**Downloads, per template:** JPG at full bleed · print PDF with correct MediaBox/BleedBox/TrimBox and vector crop marks · layered PSD · editable SVG with live text.

### Why the PSD has rasterised text

The PSD is real and layered — hide, move, recolour or remask any element in Photoshop. What a browser cannot write is Photoshop's own text and shape-layer object model, so type arrives as pixels on its own layer. To re-typeset rather than re-position, use **Download editable SVG**: it opens in Illustrator, Affinity Designer or Inkscape with live text and the same named layers.

### Colour

Exports are **RGB**. A browser has no colour-management engine, so an unprofiled CMYK conversion here would be worse than the one your printer performs. Send the PDF as RGB and ask them to convert with their own profile (UK litho is usually FOGRA39 / ISO Coated v2; large format is press-specific). Reference values: Royal Blue `#00247D`, Red `#CF142B`, Gold `#FFB81C`, Sky `#4A90D9`, Ink `#0B1C39`. Check a proof rather than a screen.

### Banner keep-out zones

The bottom **150mm** disappears into the roller cassette and the top **40mm** goes into the rail. Both templates run flat colour through those areas so a cut anywhere in them is invisible, and no text or QR sits inside them. If your printer wants a longer bottom leader, raise the bleed to 100–150mm in the Print setup panel rather than moving the artwork.

### Image resolution checks

Uploads are measured against the size they actually print at, and re-checked whenever you zoom:

| | Good for print | Acceptable with caution | Too low |
|---|---|---|---|
| A5 | ≥ 300 DPI | 200–299 DPI | < 200 DPI |
| Banner | ≥ 150 DPI | 100–149 DPI | < 100 DPI |

A low-resolution image is never blocked — you get the warning and decide.

---

## Logo and favicons

`brand/logo-primary.svg` is embedded in `index.html` and placed unaltered — never recoloured, redrawn, rotated, stretched or cropped. The Logo panel reports its effective resolution at the size each template places it: about **656 DPI** on the A5 flyers, about **93 DPI** on the banners.

93 DPI is fine for a pull-up viewed from a metre or more and matches the 100 DPI the banner artwork is supplied at. Worth knowing, though: the supplied file is a 1213 × 660px raster inside an SVG wrapper rather than true vector, so it cannot be enlarged further. If TCA has the original vector logo (AI, EPS or a true vector PDF), uploading it in the Logo panel removes the ceiling — worth doing before a large banner run.

To rebuild the icons after a logo change:

```
python3 tools/make-favicon.py brand/logo-primary.svg .
```

It scales the logo proportionally and centres it on a square canvas with about 7% clear space. Colours and artwork are untouched. Note that a wide lockup inevitably blurs at 16px; the brand book permits a plain "TCA" monogram as a favicon stand-in if you would prefer one for the small sizes.

---

## Copy TCA needs to confirm before printing

- **The refund amount.** The site's FAQ still flags this as open: the working model is a £10 deposit with £8 returned and £2 retained. **Nothing in these templates claims a full refund** — the wording is "your deposit is returned". If a retention is confirmed, state it on the flyer and at the point of payment.
- **Facebook and YouTube** are listed as coming soon. The icons are included and the handles are editable, so clear them until the accounts exist. TikTok `@.confidence.academy` and Instagram `@confidence.academy.uk` are live.
- **Illness and cancellation policy** is not yet published, so nothing is claimed about it.
- **Session dates and venues** are still to be confirmed; no template states one. The QR points at the waitlist so the flyer does not go out of date.
- **Social icons** are drawn to the brand's own icon rules rather than copied from each platform. For a large run, swap in the official assets from each platform's brand centre.

The deposit sequence used — pay £10–£45, attend and be marked in, deposit returned by bank transfer, back within 24 hours — is taken from the live site, not assumed.

---

## Before you send to print

1. Turn the guides on and confirm nothing important crosses the green safe line.
2. Scan the QR with a phone from the distance people will actually stand.
3. Check any uploaded photo reads "Good for print".
4. Open the PDF and confirm the trim size in Document Properties, and that crop marks are present.
5. Confirm the refund wording with TCA.
