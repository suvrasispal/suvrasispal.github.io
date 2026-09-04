#!/usr/bin/env python3
"""
make-favicon.py — build the full favicon set from the official TCA logo.

The logo is never recoloured, redrawn, cropped or stretched. It is scaled
proportionally and centred inside a square canvas, which is the only change
a square icon format allows.

Usage:
    python3 make-favicon.py [path/to/logo-primary.svg] [output-dir]

Defaults to ./logo-primary.svg and ./favicon/.

Requires Pillow:  pip install pillow
"""

import base64
import io
import os
import re
import sys

from PIL import Image

# Transparent icons: every modern browser handles these correctly.
TRANSPARENT = [16, 32, 48, 64, 96, 128, 192, 256, 512]
# iOS ignores transparency and composites onto black, so these get the brand
# white card the guidelines already require behind the logo.
ON_WHITE = [(180, "apple-touch-icon.png"), (192, "icon-192-maskable.png")]
# Sizes packed into favicon.ico
ICO_SIZES = [16, 24, 32, 48, 64]

# Padding as a fraction of the square edge. The brand book asks for clear
# space of at least the height of the word "THE"; ~7% reads correctly at
# icon sizes without shrinking the mark into illegibility.
PAD = 0.07


def load_logo(path):
    """Return the logo as an RGBA image, from an SVG wrapper or a raster file."""
    if path.lower().endswith(".svg"):
        markup = open(path, "r", encoding="utf-8").read()
        m = re.search(r"base64,\s*([A-Za-z0-9+/=\s]+?)[\"']", markup)
        if not m:
            raise SystemExit(
                "This SVG has no embedded raster image. Rasterise it first "
                "(e.g. with cairosvg) and pass the PNG to this script."
            )
        data = base64.b64decode(re.sub(r"\s+", "", m.group(1)))
        img = Image.open(io.BytesIO(data))
    else:
        img = Image.open(path)
    return img.convert("RGBA")


def square(logo, size, background=None):
    """Scale the logo proportionally and centre it on a square canvas."""
    inner = int(round(size * (1 - PAD * 2)))
    w, h = logo.size
    scale = min(inner / w, inner / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    # LANCZOS keeps edges clean at small sizes; colours are untouched.
    small = logo.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    canvas.alpha_composite(small, ((size - nw) // 2, (size - nh) // 2))
    return canvas


def svg_favicon(logo_path, out_path):
    """A square SVG icon that re-wraps the original artwork untouched."""
    markup = open(logo_path, "r", encoding="utf-8").read()
    m = re.search(r"base64,\s*([A-Za-z0-9+/=\s]+?)[\"']", markup)
    vb = re.search(r'viewBox="([^"]+)"', markup)
    if not (m and vb):
        return False
    _, _, vw, vh = [float(v) for v in vb.group(1).split()]
    edge = max(vw, vh)
    pad = edge * PAD * 2
    box = edge + pad
    x, y = (box - vw) / 2, (box - vh) / 2
    data = re.sub(r"\s+", "", m.group(1))
    open(out_path, "w", encoding="utf-8").write(
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        'viewBox="0 0 {b:.0f} {b:.0f}" width="{b:.0f}" height="{b:.0f}">'
        "<title>The Confidence Academy</title>"
        '<image x="{x:.2f}" y="{y:.2f}" width="{w:.0f}" height="{h:.0f}" '
        'xlink:href="data:image/png;base64,{d}"/></svg>'.format(
            b=box, x=x, y=y, w=vw, h=vh, d=data
        )
    )
    return True


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "logo-primary.svg"
    out = sys.argv[2] if len(sys.argv) > 2 else "favicon"
    if not os.path.exists(src):
        raise SystemExit("Logo not found: " + src)
    os.makedirs(out, exist_ok=True)

    logo = load_logo(src)
    print("source logo: {}x{}px, aspect {:.3f}".format(*logo.size, logo.width / logo.height))

    for s in TRANSPARENT:
        p = os.path.join(out, "favicon-{0}x{0}.png".format(s))
        square(logo, s).save(p, optimize=True)
        print("  ", os.path.basename(p))

    white = (255, 255, 255, 255)
    for s, name in ON_WHITE:
        p = os.path.join(out, name)
        square(logo, s, background=white).convert("RGB").save(p, optimize=True)
        print("  ", name, "(white card — iOS ignores transparency)")

    ico = os.path.join(out, "favicon.ico")
    frames = [square(logo, s) for s in ICO_SIZES]
    frames[-1].save(ico, format="ICO", sizes=[(s, s) for s in ICO_SIZES])
    print("   favicon.ico", ICO_SIZES)

    if svg_favicon(src, os.path.join(out, "favicon.svg")):
        print("   favicon.svg (scalable, original artwork re-wrapped)")

    html = os.path.join(out, "head-snippet.html")
    open(html, "w", encoding="utf-8").write(
        '<link rel="icon" href="/favicon.ico" sizes="any">\n'
        '<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n'
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n'
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n'
        '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n'
    )
    print("   head-snippet.html (paste into any site's <head>)")
    print("\nDone —", out + "/")


if __name__ == "__main__":
    main()
