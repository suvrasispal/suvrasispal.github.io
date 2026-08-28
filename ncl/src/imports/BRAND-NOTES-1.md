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

## Gradient variant
A fourth colourway carries the gradient from the original web artwork on the
letterform, with both lines of type in white. It is the closest thing in the
set to how the logo currently appears on the site.

| Stop | Colour |
|---|---|
| 0 | #A78BFA |
| 0.39 | #7C3AED |
| 1 | #3B82F6 |

The axis is 45 degrees, running corner to corner across the letterform
bounding box: `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="130" y2="130"`
on the 120 x 140 grid. Because the grid is 0.857 wide-to-tall and the source
artwork was 0.863, the ramp lands within 0.15 percent of its original position
at every corner. The 0.39 stop is what keeps the middle of the letter dark
violet rather than washing straight from lilac to blue, so do not simplify this
to a two-stop gradient.

Both halves of the cut letterform reference the same gradient in the same user
space, so the ramp reads as continuous across the gap.

The hairline stays flat #9333EA. It sits on the deep-violet middle of the ramp
and would disappear if it were gradient-filled too.

CONSULTING is white here rather than blue. The gradient already spends the
brand's violet and blue on the letterform, so a blue subline reads as a fourth
colour competing with the mark instead of as hierarchy. Hierarchy in this
colourway comes from size and tracking alone.

Dark backgrounds only. The gradient's light end is #A78BFA at roughly 1.9:1
against white, and the white type disappears outright. For light backgrounds
use the on-light files.

## Typography
Geometric neo-grotesque. Files reference Hanken Grotesk, falling back to Neue
Haas Grotesk Display and Helvetica Neue. Hanken Grotesk is free and available
on Google Fonts.

The two derived numbers below were solved against the previous face and depend
on its metrics, so re-check them once Hanken Grotesk is rendering. The size of
51 assumes a cap-height ratio of 0.727; if Hanken Grotesk differs, the NEXYRA
cap-top moves by 51 x the difference. The CONSULTING-to-NEXYRA width ratio of
0.81 assumes the previous advance widths. Both lines are placed by baseline, so
the baselines themselves do not move whatever the face: only the cap-top of
NEXYRA and the two line widths are affected.

The wordmark is always two lines, NEXYRA over CONSULTING. There is no
single-line setting; the two words on one line put CONSULTING at roughly
1.6 times the width of NEXYRA, which reads as the subline dominating the name.

One wordmark serves both lockups. The two configurations differ only in where
the monogram sits, so the type is identical between them.

| | Value |
|---|---|
| NEXYRA | 51, weight 500, +5.33 tracking (0.105 em) |
| CONSULTING | 16.1, weight 400, +9.67 tracking (0.60 em) |
| Baseline interval | 26.9 |

51 is not a free choice. The two-line block, measured from the NEXYRA cap-top
to the CONSULTING baseline, is (0.727 + 0.5273) x size. Setting that equal to
the monogram's 63.98-unit letterform height solves to 51.0. Everything else is
the system's existing ratio against NEXYRA size and was carried over unchanged:
CONSULTING at 0.3159, baseline interval at 0.5273, NEXYRA tracking at 0.105 em,
CONSULTING tracking at 0.60 em of its own size.

CONSULTING is tracked at 0.60 em, deliberately short of the maximum. Past
roughly 0.78 em it grows wider than NEXYRA above it and the hierarchy inverts.
At the current setting it sits at 0.81 of the NEXYRA width, so the relationship
holds with room to spare.

Convert the text to outlines before final handoff so the wordmark cannot
re-flow on a machine without the font installed.

## Balance
The wordmark is positioned against the monogram, not against the canvas.

Horizontal lockup, 400 x 104. Because the type block and the letterform are now
the same height, the wordmark sits flush: the NEXYRA cap-top lands on the
monogram's top edge at y 20 and the CONSULTING baseline lands on its bottom
edge at y 84. Nothing floats. The wordmark starts at x 138, which is 35.5 units
from the hairline tip, the same gap-to-type-size ratio the set has always used.

Vertical lockup, 292 x 226. The monogram is centred above the wordmark at 0.73
scale. That scale is derived, not picked: it holds the hairline span at 0.55 of
the NEXYRA ink width, the mark-to-wordmark proportion the set already had. The
gap from the bottom of the letterform to the NEXYRA cap-top is 20 units.

When tracking is applied to centred text the trailing space after the last
letter is included in the advance width, so the glyphs drift left. The vertical
lockup compensates by setting each anchor half a tracking value right of the
146 centre: 148.7 for NEXYRA, 150.8 for CONSULTING. If you change the tracking,
shift the anchor by half the change.

## Clear space
One stem width (26 units, about 22 percent of the letter height) on all sides.
Measure from the hairline tips, not the letterform.

## Minimum sizes
Horizontal lockup: 165 px wide.
Vertical lockup: 120 px wide.
Monogram with hairline: 40 px tall.

CONSULTING is the limit in both lockups, not the mark. At the sizes above its
cap height lands near 6.5 px, which is the floor for a 0.60 em tracked line
before the letters stop grouping into a word.

The 4-unit hairline and 9-unit gap are deliberately fine. Below roughly 40 px
the gap starts to close up on screen. If you need a favicon that survives at
16 and 32 px, ask for a small-size variant with the cut widened and the
external hairlines trimmed. That is the only case where the geometry above
should change.

## Files
Nineteen SVGs. Five colourways across three configurations, plus four app icons.

Monogram: on-light, on-dark, gradient, mono black, mono white.
Horizontal lockup: on-light, on-dark, gradient, mono black, mono white.
Vertical lockup: on-light, on-dark, gradient, mono black, mono white.
App icons at 512 x 512: violet, blue, black and white tiles.

"on-light" sits on white or pale backgrounds, "on-dark" is the reversed version
for black or near-black, and "gradient" is the site-matching colourway, which is
also dark-background only. The mono files are single-colour throughout for
one-colour print, engraving, embroidery and anywhere the brand colours cannot
be reproduced.

Between the two dark-background options: on-dark is the more durable choice for
anything that has to survive reproduction, since a flat white letterform holds
up in print, at small sizes and under compression. Reach for the gradient files
where the artwork is rendered once and rendered well, which in practice means
screen.

The monograms and app icons carry no type and are unchanged.

Earlier single-line lockups, which set NEXYRA and CONSULTING side by side, have
been withdrawn. Stacking them removed the only thing that made that variant
distinct, so keeping both would have meant two filenames for one design.
