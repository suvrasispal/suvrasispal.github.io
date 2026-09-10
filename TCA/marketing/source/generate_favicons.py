#!/usr/bin/env python3
"""
Generate a full favicon set for The Confidence Academy dashboard from the
brand's "runner" mark (a transparent PNG).

Usage:
    python3 generate_favicons.py <source_image.png> <output_dir>

Produces, inside <output_dir>:
    favicon.ico              (multi-resolution: 16, 32, 48 px)
    favicon-16x16.png
    favicon-32x32.png
    favicon-48x48.png
    favicon-192x192.png      (Android / PWA)
    favicon-512x512.png      (Android / PWA, splash)
    apple-touch-icon.png     (180x180, iOS home screen)
    site.webmanifest         (so mobile "add to home screen" picks up the icons)

The source mark is auto-cropped to its opaque content, padded back out to a
square canvas with a small margin (so it isn't touching the edges once
squashed down to 16x16), then resized with high-quality downsampling for
each target size. Re-run this script any time the logo/mark artwork changes.
"""
import sys
import os
import json
from PIL import Image

TARGET_SIZES = [16, 32, 48, 192, 512]
APPLE_TOUCH_SIZE = 180
ICO_SIZES = [16, 32, 48]
MARGIN_RATIO = 0.06  # breathing room around the mark on the square canvas


def load_and_square(src_path, margin_ratio=MARGIN_RATIO):
    im = Image.open(src_path).convert("RGBA")

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    w, h = im.size
    side = max(w, h)
    margin = int(side * margin_ratio)
    canvas_size = side + margin * 2

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    paste_x = (canvas_size - w) // 2
    paste_y = (canvas_size - h) // 2
    canvas.paste(im, (paste_x, paste_y), im)
    return canvas


def make_favicons(src_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    squared = load_and_square(src_path)

    png_paths = {}
    for size in TARGET_SIZES:
        resized = squared.resize((size, size), Image.LANCZOS)
        fname = f"favicon-{size}x{size}.png"
        resized.save(os.path.join(out_dir, fname))
        png_paths[size] = fname
        print(f"  wrote {fname}")

    apple = squared.resize((APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE), Image.LANCZOS)
    # iOS ignores transparency on home-screen icons and fills it with black,
    # so flatten onto white to match the brand's "light backgrounds only" rule.
    apple_flat = Image.new("RGBA", apple.size, (255, 255, 255, 255))
    apple_flat.paste(apple, (0, 0), apple)
    apple_flat.convert("RGB").save(os.path.join(out_dir, "apple-touch-icon.png"))
    print("  wrote apple-touch-icon.png")

    ico_frames = [squared.resize((s, s), Image.LANCZOS) for s in ICO_SIZES]
    ico_frames[0].save(
        os.path.join(out_dir, "favicon.ico"),
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=ico_frames[1:],
    )
    print("  wrote favicon.ico")

    manifest = {
        "name": "The Confidence Academy — Marketing Calendar",
        "short_name": "TCA Calendar",
        "icons": [
            {"src": png_paths[192], "sizes": "192x192", "type": "image/png"},
            {"src": png_paths[512], "sizes": "512x512", "type": "image/png"},
        ],
        "theme_color": "#00247D",
        "background_color": "#F4F6FB",
        "display": "standalone",
    }
    with open(os.path.join(out_dir, "site.webmanifest"), "w") as f:
        json.dump(manifest, f, indent=2)
    print("  wrote site.webmanifest")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    make_favicons(sys.argv[1], sys.argv[2])
    print("Done.")
