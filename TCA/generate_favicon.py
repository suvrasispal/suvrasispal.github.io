#!/usr/bin/env python3
"""
Generate the full favicon set for The Confidence Academy from the runner artwork.

The source art is a navy silhouette with red motion streaks on transparency.
At favicon sizes (16-32px) a navy figure on a white page disappears, and the
red streaks turn to noise. So the icon is built as a navy plate with the runner
knocked out in white: same brand colours, but a silhouette that stays readable
in a browser tab and works on light and dark tab bars alike.

Usage:
    python3 generate_favicon.py [source.png] [output_dir]

Defaults to running.png in the current directory, writing alongside it.

Requires: Pillow  (pip install Pillow)
"""

import sys
import os
import numpy as np
from PIL import Image, ImageDraw

# TCA brand palette — do not substitute.
NAVY = (0, 36, 125, 255)
WHITE = (255, 255, 255, 255)

# Corner radius as a fraction of icon width, for the standard plate icons.
RADIUS = 0.18
# Padding around the figure, as a fraction of icon width.
PAD = 0.10
# Android maskable icons are cropped by the OS, so they need a bigger safe zone.
MASKABLE_PAD = 0.22


def load_figure(path):
    """Return the runner silhouette alone, with the red streaks removed."""
    src = Image.open(path).convert("RGBA")
    a = np.array(src)
    r, g, b, alpha = (a[..., i].astype(int) for i in range(4))

    # Streaks are the red pixels; drop them so only the figure remains.
    red = (alpha > 40) & (r > 120) & (g < 110) & (b < 110)
    a[red] = [0, 0, 0, 0]

    fig = Image.fromarray(a)
    bbox = fig.split()[3].getbbox()
    if bbox is None:
        raise ValueError(f"No visible artwork found in {path}")
    return fig.crop(bbox)


def knockout(fig):
    """Recolour the silhouette to solid white, preserving its alpha edges."""
    a = np.array(fig)
    mask = a[..., 3] > 0
    a[mask, 0:3] = [255, 255, 255]
    return Image.fromarray(a)


def rounded_mask(side, radius_frac):
    mask = Image.new("L", (side, side), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, side - 1, side - 1], radius=int(side * radius_frac), fill=255
    )
    return mask


def build(fig_white, side, pad=PAD, radius=RADIUS):
    """Compose one icon: navy plate + centred white runner."""
    inner = int(side * (1 - pad * 2))
    art = fig_white.copy()
    art.thumbnail((inner, inner), Image.LANCZOS)

    plate = Image.new("RGBA", (side, side), NAVY)
    plate.paste(art, ((side - art.width) // 2, (side - art.height) // 2), art)

    if radius > 0:
        plate.putalpha(rounded_mask(side, radius))
    return plate


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "running.png"
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(src))
    os.makedirs(out, exist_ok=True)

    fig = knockout(load_figure(src))

    def w(img, name):
        path = os.path.join(out, name)
        img.save(path, optimize=True)
        print(f"  {name:<28} {img.size[0]}x{img.size[1]}  {os.path.getsize(path):>7,} bytes")

    print(f"Source: {src}\nWriting to: {out}\n")

    # Browser tab icons
    w(build(fig, 16, pad=0.06), "favicon-16.png")
    w(build(fig, 32, pad=0.08), "favicon-32.png")
    w(build(fig, 48, pad=0.08), "favicon-48.png")

    # iOS home screen — no alpha, no rounding (iOS applies its own mask).
    apple = build(fig, 180, pad=0.12, radius=0)
    apple = Image.alpha_composite(Image.new("RGBA", apple.size, WHITE), apple)
    w(apple.convert("RGB"), "apple-touch-icon.png")

    # PWA / Android
    w(build(fig, 192), "icon-192.png")
    w(build(fig, 512), "icon-512.png")
    w(build(fig, 512, pad=MASKABLE_PAD, radius=0), "assets/icon-512-maskable.png")

    # Multi-resolution .ico for legacy browsers and Windows shortcuts
    ico_path = os.path.join(out, "assets/favicon.ico")
    build(fig, 256).save(ico_path, format="ICO",
                         sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"  {'favicon.ico':<28} multi-size   {os.path.getsize(ico_path):>7,} bytes")

    # Base64 data URI for the 32px icon, so index.html carries a working
    # icon even when opened as a standalone file with no sibling assets.
    import base64
    b64 = base64.b64encode(open(os.path.join(out, "assets/favicon-32.png"), "rb").read()).decode()
    uri_path = os.path.join(out, "favicon-32.datauri.txt")
    with open(uri_path, "w") as f:
        f.write("data:image/png;base64," + b64)
    print(f"  {'favicon-32.datauri.txt':<28} {len(b64):>7,} chars")

    print("\nDone.")


if __name__ == "__main__":
    main()
