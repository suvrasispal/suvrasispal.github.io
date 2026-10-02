# The Pint Bar — brand deployment package

## Contents
- `index.html` — brand asset page (static, no build step). Every section has SVG downloads.
- `favicon.svg` — simplified mark, referenced by index.html.
- `svg/` — all production assets, numbered to match the page sections.
- `The Pint Bar Logo.dc.html` — the working design source.

## Deploy
Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, S3, cPanel). Entry point is `index.html`; all paths are relative, so it also works from a subfolder or straight off disk.

## Asset index
| File | Use |
| --- | --- |
| svg/01-lockup-horizontal.svg | Primary signature, light grounds |
| svg/01-lockup-horizontal-reversed.svg | Primary signature, dark grounds |
| svg/02-lockup-stacked.svg | Square formats, light grounds |
| svg/02-lockup-stacked-reversed.svg | Square formats, dark grounds |
| svg/03-mark-full-colour.svg | Standalone tankard mark |
| svg/03-icon-circle.svg | Social avatar (export 512×512) |
| svg/03-icon-app-tile.svg | App / touch icon (export 180×180) |
| svg/03-icon-favicon.svg, favicon.svg | Favicon, 32px and below |
| svg/04-mono-green.svg | One-colour, cellar green |
| svg/04-mono-cream-reversed.svg | One-colour, reversed |
| svg/04-on-brass.svg | Mark on brass ground |
| svg/04-outline-etch.svg / -cream.svg | Etch, foil, emboss, single plate |
| svg/05-palette.svg | Colour specification |
| svg/06-typography.svg | Type specimen |
| svg/07-in-use-*.svg | Signage, menu cover, glassware |
| svg/08-endorsement-oyo.svg / -reversed.svg | OYO Entertainment endorsement, standalone |

## Colours
Cellar Green #12332A · Brass #D89A2E · Bitter Amber #C8811E · Head Cream #F3ECDD

## Type
Bodoni Moda SemiBold (wordmark, headlines) · Barlow Condensed Medium (tagline, menus, signage) · Jost Medium (OYO ENTERTAINMENT endorsement line, caps, +0.44em tracking). All free on Google Fonts.

## Note on the lockup SVGs
The wordmark in the lockup files is live text with a webfont `@import`, so it renders correctly in browsers. Before sending files to a printer, sign maker or embroiderer, open them in Illustrator/Affinity and convert the text to outlines — otherwise the type will substitute. The mark-only and icon files are pure vector paths and need no conversion.

## Reversed artwork
Reversed and on-brass files ship on **transparency** — no baked background — so they can sit on any dark ground or photograph. Place them only on cellar green, near-black, or a suitably dark image; contrast must stay at 4.5:1 or better.

## Trademark
The mark is original artwork. A UK trade-mark clearance search on the wordmark "The Pint Bar" is still recommended before registration or signage spend.
