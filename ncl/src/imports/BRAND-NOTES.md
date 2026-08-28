# Nexyra Consulting — logo asset notes

## Concept
"Hairline into gap." A thin diagonal rule crosses the monogram at a 1:2 slope.
Outside the letterform it is a drawn 4-unit hairline; where it reaches the
letter it opens into a cut through all three strokes of the N.

The hairline does not sit on the centreline of the cut. It runs along the
cut's upper edge, so the drawn line and the top edge of the opening are one
continuous contour. That relationship is the whole idea of the mark and should
not be "corrected" by centring the line.

## Geometry
Letterform on a 120 x 140 unit grid, stems 26 units. The cut runs from
(-40, 120) to (160, 22) with a 10-unit vertical separation, giving roughly 9
units measured perpendicular. Hairlines run from (-30, 115) to (-2, 101) on the
left and (122, 41) to (150, 27) on the right, 4 units wide with round caps.
Full mark including hairlines spans 180 units wide against a 120-unit letter.

These values are taken verbatim from the approved monogram. Do not redraw them.

## Colour
| Role | Light backgrounds | Dark backgrounds |
|---|---|---|
| Letterform / NEXYRA | #000000 | #FFFFFF |
| Hairline | #9333EA | #9333EA |
| CONSULTING | #2563EB | #2563EB |

Each brand colour has one job. Violet carries the hairline, which is the
signature element. Blue carries the CONSULTING subline, setting up hierarchy
under NEXYRA. The letterform stays neutral so the two never compete.

Blue on black is the tightest pairing in the set, roughly 3.7:1. Acceptable for
a wordmark at logo size, below the 4.5:1 threshold for body text. Do not reuse
that pairing for small running copy.

## Typography
Geometric neo-grotesque. Files reference Inter Tight, falling back to Neue Haas
Grotesk Display and Helvetica Neue. Inter Tight is free and close enough to ship.

NEXYRA: 38 units, weight 500, +4 tracking (about 0.11 em).
CONSULTING: 12 units, weight 400, +7.2 tracking (0.60 em), 20 units below.

CONSULTING is tracked at 0.60 em in both lockups. Because the two lockups set
the subline at different sizes (12 units horizontal, 11 units stacked), the
tracking is expressed as a ratio and the absolute values differ: 7.2 and 6.6.
Matching the numbers rather than the ratio would make the two look different.

0.60 em is deliberately short of the maximum. Past roughly 0.78 em the subline
grows wider than NEXYRA above it and the hierarchy inverts, which is the one
thing tracking a subline is supposed to avoid.

When tracking is applied to centred text, the trailing space after the last
letter is included in the advance width, so the glyphs drift left. The stacked
lockup compensates by setting the anchor at 123.3 rather than 120. If you
change the tracking, shift the anchor by half the change.

Convert the text to outlines before final handoff so the wordmark cannot
re-flow on a machine without the font installed.

## Clear space
One stem width (26 units, about 22 percent of the letter height) on all sides.
Measure from the hairline tips, not the letterform.

## Minimum sizes
Horizontal lockup: 130 px wide.
Monogram with hairline: 40 px tall.

The 4-unit hairline and 9-unit gap are deliberately fine. Below roughly 40 px
the gap starts to close up on screen. If you need a favicon that survives at
16 and 32 px, ask for a small-size variant with the cut widened and the
external hairlines trimmed. That is the only case where the geometry above
should change.

## Files
Monogram: on-light, on-dark, mono black, mono white.
Horizontal lockup: on-light, on-dark, mono black, mono white.
Stacked lockup: on-light, on-dark, mono black, mono white.
App icons at 512 x 512: violet, blue, black and white tiles.

"on-light" sits on white or pale backgrounds, "on-dark" is the reversed version
for black or near-black. The mono files are single-colour throughout for
one-colour print, engraving, embroidery and anywhere the brand colours cannot
be reproduced.
