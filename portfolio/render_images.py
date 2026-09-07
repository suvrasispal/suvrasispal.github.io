"""Render each project slide as a complete page, at high resolution.

Every page in the source PDF is 1024.5 x 576 pt — exactly 16:9. So using whole
pages gives identical proportions across all 65 images for free: no canvas
padding, no letterboxing, and no risk of distortion, because nothing is ever
stretched to fit a shape it wasn't.

Source is rendered at 320 DPI (4554 px across). Output is 3840 px wide, which
holds ~270 ppi over the page — at or above the median resolution of the
artwork embedded in the PDF, so text and UI detail survive intact.
"""

import os

from PIL import Image

SRC = "/home/claude/pages_full"      # 320 DPI page renders
OUT = "/home/claude/site/assets"

PAGES = range(6, 71)

FULL_W, FULL_Q = 3840, 92            # viewer image
THUMB_W, THUMB_Q = 1800, 84          # card image — sharp on 2x displays

os.makedirs(f"{OUT}/full", exist_ok=True)
os.makedirs(f"{OUT}/thumb", exist_ok=True)

ratios = set()

for n in PAGES:
    page = Image.open(f"{SRC}/p-{n:02d}.jpg").convert("RGB")
    ratios.add(round(page.width / page.height, 3))

    full = page.copy()
    full.thumbnail((FULL_W, FULL_W), Image.LANCZOS)
    full.save(f"{OUT}/full/s{n:02d}.jpg", "JPEG", quality=FULL_Q,
              optimize=True, progressive=True)

    thumb = page.copy()
    thumb.thumbnail((THUMB_W, THUMB_W), Image.LANCZOS)
    thumb.save(f"{OUT}/thumb/s{n:02d}.jpg", "JPEG", quality=THUMB_Q,
               optimize=True, progressive=True)

print("rendered", len(list(PAGES)), "full pages")
print("distinct aspect ratios across all images:", ratios)
