"""Build one combined TCA image: the desktop landing page with the mobile view
alongside it.

Output matches every other project image exactly — 3840 x 2159 — so the card
grid is unaffected.
"""

import os

from PIL import Image, ImageDraw, ImageFilter
from playwright.sync_api import sync_playwright

NEW = "file:///home/claude/tcasite/TCA/NEW/index.html"
TMP = "/home/claude/tca_combo"
OUT = "/home/claude/site/assets"
W, H = 3840, 2159
BG = (238, 241, 246)          # light neutral so both screens read clearly

os.makedirs(TMP, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()

    # desktop landing page
    d = b.new_page(viewport={"width": 1680, "height": 1050}, device_scale_factor=2)
    d.goto(NEW, wait_until="load", timeout=90000)
    d.wait_for_timeout(3000)
    d.screenshot(path=f"{TMP}/desk.png")

    # mobile landing page
    m = b.new_page(viewport={"width": 420, "height": 900}, device_scale_factor=3)
    m.goto(NEW, wait_until="load", timeout=90000)
    m.wait_for_timeout(3000)
    m.screenshot(path=f"{TMP}/mob.png")

    b.close()


def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1],
                                           radius=radius, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def drop(canvas, im, xy, blur=38, spread=26, alpha=92):
    """Soft shadow beneath a pasted element."""
    x, y = xy
    sh = Image.new("RGBA", (im.width + spread * 2, im.height + spread * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [spread, spread + 10, spread + im.width, spread + im.height + 10],
        radius=28, fill=(12, 18, 40, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(sh, (x - spread, y - spread))
    canvas.alpha_composite(im, (x, y))


canvas = Image.new("RGBA", (W, H), BG + (255,))

# --- desktop, occupying the left three-quarters -----------------------------
desk = Image.open(f"{TMP}/desk.png").convert("RGB")
dw = 2620
dh = round(desk.height * dw / desk.width)
desk = rounded(desk.resize((dw, dh), Image.LANCZOS), 22)
dx, dy = 150, (H - dh) // 2
drop(canvas, desk, (dx, dy))

# --- mobile, overlapping the desktop's lower-right ---------------------------
mob = Image.open(f"{TMP}/mob.png").convert("RGB")
mh = 1580
mw = round(mob.width * mh / mob.height)
mob = rounded(mob.resize((mw, mh), Image.LANCZOS), 46)
mx = dx + dw - round(mw * 0.55)
my = dy + dh - mh + 210
drop(canvas, mob, (mx, my), blur=46, spread=32, alpha=105)

canvas.convert("RGB").save(f"{OUT}/full/tca01.jpg", "JPEG", quality=92,
                           optimize=True, progressive=True)

thumb = canvas.convert("RGB")
thumb.thumbnail((1800, 1800), Image.LANCZOS)
thumb.save(f"{OUT}/thumb/tca01.jpg", "JPEG", quality=84,
           optimize=True, progressive=True)

print("desktop:", (dw, dh), "at", (dx, dy))
print("mobile :", (mw, mh), "at", (mx, my))
print("canvas :", Image.open(f"{OUT}/full/tca01.jpg").size)
