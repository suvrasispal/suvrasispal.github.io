#!/usr/bin/env python3
"""
TCA logo asset generator.

Takes the official TCA runner mark (running.png) and produces:
  1. A trimmed, transparent-background PNG sized for use in the email
     signature (email clients render actual pixel size, so we export a
     handful of fixed sizes rather than relying on CSS scaling).
  2. A full favicon set (favicon.ico multi-size, plus standalone PNGs)
     for use on the confidenceacademy.uk website / signature tool.

Usage:
    python3 generate_assets.py
Requires:
    pip install Pillow --break-system-packages
"""

from PIL import Image
import os

SRC = os.path.join(os.path.dirname(__file__), "running.png")
OUT = os.path.dirname(__file__)


def trim(im: Image.Image) -> Image.Image:
    """Crop away fully-transparent padding around the artwork."""
    alpha = im.getchannel("A")
    bbox = alpha.getbbox()
    return im.crop(bbox) if bbox else im


def square_canvas(im: Image.Image, pad_ratio: float = 0.08) -> Image.Image:
    """Place the trimmed artwork centered on a transparent square canvas
    with a small padding margin, so favicons don't look cropped."""
    w, h = im.size
    side = max(w, h)
    pad = int(side * pad_ratio)
    canvas_size = side + pad * 2
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    x = (canvas_size - w) // 2
    y = (canvas_size - h) // 2
    canvas.paste(im, (x, y), im)
    return canvas


def main():
    original = Image.open(SRC).convert("RGBA")
    trimmed = trim(original)

    # --- Signature logo (transparent PNG, retina-ready fixed sizes) -----
    # Email clients don't reliably scale images via CSS, so we bake exact
    # pixel dimensions. Height-anchored at 96px @2x (48px displayed) is a
    # sensible default sizing for a signature next to ~34px of text.
    sig_heights_2x = {
        "logo-signature@2x": 192,   # displayed height ~96px
        "logo-signature": 96,       # displayed height ~48px
    }
    for name, target_h in sig_heights_2x.items():
        ratio = target_h / trimmed.height
        target_w = round(trimmed.width * ratio)
        resized = trimmed.resize((target_w, target_h), Image.LANCZOS)
        resized.save(os.path.join(OUT, f"{name}.png"))
        print(f"wrote {name}.png ({target_w}x{target_h})")

    # --- Favicon set ------------------------------------------------------
    favicon_source = square_canvas(trimmed, pad_ratio=0.10)

    png_sizes = [16, 32, 48, 96, 180, 192, 512]
    for size in png_sizes:
        icon = favicon_source.resize((size, size), Image.LANCZOS)
        fname = f"favicon-{size}x{size}.png"
        icon.save(os.path.join(OUT, fname))
        print(f"wrote {fname}")

    # apple-touch-icon (no transparency — Apple flattens it onto black,
    # so we composite onto white to match the brand's white-card logo rule)
    apple = favicon_source.resize((180, 180), Image.LANCZOS)
    apple_flat = Image.new("RGBA", apple.size, (255, 255, 255, 255))
    apple_flat.paste(apple, (0, 0), apple)
    apple_flat.convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"))
    print("wrote apple-touch-icon.png")

    # Multi-resolution .ico (16/32/48) for legacy browser tabs
    ico_sizes = [16, 32, 48]
    ico_frames = [favicon_source.resize((s, s), Image.LANCZOS) for s in ico_sizes]
    ico_frames[0].save(
        os.path.join(OUT, "favicon.ico"),
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
    )
    print("wrote favicon.ico (16/32/48)")


if __name__ == "__main__":
    main()
