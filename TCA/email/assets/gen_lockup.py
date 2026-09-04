#!/usr/bin/env python3
from PIL import Image
import os

BASE = os.path.dirname(__file__)
SRC = os.path.join(BASE, "lockup.png")
OUT = BASE

def trim(im):
    alpha = im.getchannel("A")
    bbox = alpha.getbbox()
    return im.crop(bbox) if bbox else im

im = Image.open(SRC).convert("RGBA")
trimmed = trim(im)
w0, h0 = trimmed.size
ratio = w0 / h0
print("trimmed", trimmed.size, "ratio", ratio)

targets = {
    # name: (display_height, retina_multiplier)
    "lockup-login": (116, 2),     # login card logo
    "lockup-header": (46, 2),     # app header banner logo
    "lockup-signature": (72, 2),  # "Full lockup" option inside the email signature
}

for name, (disp_h, mult) in targets.items():
    px_h = disp_h * mult
    px_w = round(px_h * ratio)
    resized = trimmed.resize((px_w, px_h), Image.LANCZOS)
    path = os.path.join(OUT, f"{name}@2x.png")
    resized.save(path)
    print(f"wrote {name}@2x.png {px_w}x{px_h} (display {round(px_w/mult)}x{disp_h})")
