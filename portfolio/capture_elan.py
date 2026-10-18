"""Capture the two ÉlanPro screens for the portfolio.

Both apps are installable PWAs built at phone width, so each screen is captured
on a phone viewport and seated whole on the portfolio's standard 3840 x 2159
canvas, with nothing cropped and nothing stretched. The canvas takes each app's own
background colour, so the customer screen sits on its pink and the admin screen
on its blue.

React and Babel are served from local copies of the exact versions the apps
request; unpkg is unreachable from this environment.
"""

import os

from PIL import Image, ImageDraw, ImageFilter
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8824"
VEND = "/home/claude/vendor/serve"
OUT = "/home/claude/elan_out"
W, H = 3840, 2159

os.makedirs(OUT, exist_ok=True)

MAP = {
    "https://unpkg.com/react@18.3.1/umd/react.production.min.js": "react.production.min.js",
    "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": "react-dom.production.min.js",
    "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js": "babel.min.js",
}

SHOTS = [
    ("elan01", f"{BASE}/customer/", "customer booking home"),
    ("elan02", f"{BASE}/admin/", "admin staff sign-in"),
]


def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1],
                                           radius=radius, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def compose(shot, bg):
    canvas = Image.new("RGBA", (W, H), bg + (255,))
    ph_h = int(H * 0.86)
    ph_w = round(shot.width * ph_h / shot.height)
    ph = rounded(shot.resize((ph_w, ph_h), Image.LANCZOS), 54)
    x, y = (W - ph_w) // 2, (H - ph_h) // 2

    pad = 40
    sh = Image.new("RGBA", (ph_w + pad * 2, ph_h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad, pad + 14, pad + ph_w, pad + ph_h + 14], radius=54,
        fill=(20, 22, 31, 96))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(42)), (x - pad, y - pad))
    canvas.alpha_composite(ph, (x, y))
    return canvas.convert("RGB")


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 430, "height": 932}, device_scale_factor=3)

    def route(r):
        f = MAP.get(r.request.url)
        if f:
            r.fulfill(status=200, content_type="application/javascript",
                      body=open(f"{VEND}/{f}").read())
        else:
            r.continue_()

    pg.route("https://unpkg.com/**", route)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))

    for sid, url, note in SHOTS:
        pg.goto(url, wait_until="networkidle", timeout=90000)
        pg.wait_for_timeout(4000)
        raw = f"{OUT}/{sid}_raw.png"
        pg.screenshot(path=raw)
        shot = Image.open(raw).convert("RGB")
        # Tint the canvas from the app's own accent so each screen sits on its
        # brand rather than on an arbitrary grey, and so a white-backed app
        # doesn't vanish into a white page.
        accent = pg.evaluate("""(()=>{
          const btns=[...document.querySelectorAll('button,a')];
          for(const b of btns){
            const c=getComputedStyle(b).backgroundColor;
            const m=c.match(/\\d+/g);
            if(!m) continue;
            const [r,g,bl]=m.map(Number);
            if(Math.max(r,g,bl)-Math.min(r,g,bl)>45) return [r,g,bl];
          }
          return [120,120,120];
        })()""")
        bg = tuple(round(c * 0.07 + 255 * 0.93) for c in accent)
        compose(shot, bg).save(f"{OUT}/{sid}.jpg", "JPEG", quality=92,
                               optimize=True, progressive=True)
        os.remove(raw)
        print(f"  {sid}  {note:26s} bg={bg}")

    print("page errors:", errs[:3] or "none")
    b.close()

print("sizes:", {Image.open(f"{OUT}/{f}").size for f in os.listdir(OUT) if f.endswith(".jpg")})
