#!/usr/bin/env python3
"""
Generate the favicon set for The Confidence Academy from the runner artwork.

The artwork is used exactly as supplied - navy silhouette with red motion
streaks, unaltered. It is trimmed to its visible bounds, centred in a square
and placed on a white background so it stays visible on light and dark
browser chrome alike. No recolouring, no inversion, no dark plate.

Usage:
    python3 generate_favicon.py [source.png] [output_dir]

Defaults to running.png in the current directory, writing alongside it.

Requires: Pillow  (pip install Pillow)
"""

import sys
import os
import base64
from PIL import Image

WHITE = (255, 255, 255, 255)

# Padding around the artwork, as a fraction of icon width. Kept tight so the
# figure occupies as many pixels as possible at 16-32px.
PAD = 0.03
# Android maskable icons get cropped by the OS, so they need a bigger safe zone.
MASKABLE_PAD = 0.20


def load_artwork(path):
    """Load the artwork and trim any transparent margin. Colours untouched."""
    src = Image.open(path).convert("RGBA")
    bbox = src.split()[3].getbbox()
    if bbox is None:
        raise ValueError(f"No visible artwork found in {path}")
    return src.crop(bbox)


def build(art, side, pad=PAD):
    """Compose one icon: white square + centred artwork, original colours."""
    inner = max(1, int(side * (1 - pad * 2)))
    a = art.copy()
    a.thumbnail((inner, inner), Image.LANCZOS)

    plate = Image.new("RGBA", (side, side), WHITE)
    plate.paste(a, ((side - a.width) // 2, (side - a.height) // 2), a)
    return plate


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "running.png"
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(src))
    os.makedirs(out, exist_ok=True)

    art = load_artwork(src)

    def w(img, name):
        path = os.path.join(out, name)
        img.save(path, optimize=True)
        print(f"  {name:<28} {img.size[0]}x{img.size[1]}  {os.path.getsize(path):>7,} bytes")

    print(f"Source: {src}\nWriting to: {out}\n")

    # Browser tab icons
    w(build(art, 16), "assets/favicon-16.png")
    w(build(art, 32), "assets/favicon-32.png")
    w(build(art, 48), "assets/favicon-48.png")

    # iOS home screen - flattened, no alpha (iOS renders transparency as black)
    w(build(art, 180, pad=0.08).convert("RGB"), "apple-touch-icon.png")

    # PWA / Android
    w(build(art, 192), "icon-192.png")
    w(build(art, 512), "icon-512.png")
    w(build(art, 512, pad=MASKABLE_PAD).convert("RGB"), "icon-512-maskable.png")

    # Multi-resolution .ico for legacy browsers and Windows shortcuts
    ico = os.path.join(out, "assets/favicon.ico")
    build(art, 256).save(ico, format="ICO",
                         sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"  {'favicon.ico':<28} multi-size   {os.path.getsize(ico):>7,} bytes")

    # Base64 data URI for the 32px icon, so index.html carries a working icon
    # even when opened as a standalone file with no sibling assets present.
    b64 = base64.b64encode(open(os.path.join(out, "assets/favicon-32.png"), "rb").read()).decode()
    with open(os.path.join(out, "favicon-32.datauri.txt"), "w") as f:
        f.write("data:image/png;base64," + b64)
    print(f"  {'favicon-32.datauri.txt':<28} {len(b64):>7,} chars")

    print("\nDone.")


if __name__ == "__main__":
    main()
