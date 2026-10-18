"""Capture the three Pint Bar screens at the portfolio's standard size.

Both apps open on an "connect your Excel workbook" modal, so each is dismissed
via its own "Not now" before anything is captured: the brief asks for the clean
finished interface, not a first-run state.

React, Babel, SheetJS and jsPDF are served from local copies of the versions the
apps request; their CDNs are unreachable from this environment.
"""

import os

from PIL import Image
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8832"
VEND = "/home/claude/vendor/serve"
OUT = "/home/claude/tpb_out"
W, H = 3840, 2159

os.makedirs(OUT, exist_ok=True)

MAP = {
    "react@18.3.1/umd/react.production.min.js": "react.production.min.js",
    "react-dom@18.3.1/umd/react-dom.production.min.js": "react-dom.production.min.js",
    "@babel/standalone@7.29.0/babel.min.js": "babel.min.js",
    "xlsx-0.20.3/package/dist/xlsx.full.min.js": "xlsx.full.min.js",
    "jspdf/2.5.1/jspdf.umd.min.js": "jspdf.umd.min.js",
}


def route(r):
    for k, f in MAP.items():
        if k in r.request.url:
            return r.fulfill(status=200, content_type="application/javascript",
                             body=open(f"{VEND}/{f}").read())
    r.continue_()


def dismiss(pg):
    """Close any first-run dialog, then confirm none is left on screen."""
    for _ in range(3):
        hit = pg.evaluate("""(()=>{
          const b=[...document.querySelectorAll('button')]
            .find(x=>/^(not now|dismiss|close|skip)$/i.test(x.textContent.trim())
                     && x.offsetParent);
          if(b){b.click();return true;} return false;})()""")
        if not hit:
            break
        pg.wait_for_timeout(700)
    pg.wait_for_timeout(500)
    return pg.evaluate("""(()=>{
      return [...document.querySelectorAll('div,section,dialog')].some(e=>{
        const s=getComputedStyle(e), r=e.getBoundingClientRect();
        return (s.position==='fixed'||s.position==='absolute')
            && r.width>320 && r.height>180 && s.display!=='none'
            && s.visibility!=='hidden' && parseFloat(s.opacity)>0.5
            && Number(s.zIndex||0) > 5;
      });})()""")


def save(pg, sid):
    raw = f"{OUT}/{sid}.png"
    pg.screenshot(path=raw)
    im = Image.open(raw).convert("RGB")
    if im.size != (W, H):
        im = im.crop((0, 0, W, min(H, im.height)))
    im.save(f"{OUT}/{sid}.jpg", "JPEG", quality=92, optimize=True, progressive=True)
    os.remove(raw)
    return im.size


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)
    for pat in ("https://unpkg.com/**", "https://cdn.sheetjs.com/**",
                "https://cdnjs.cloudflare.com/**"):
        pg.route(pat, route)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))

    # --- 1. brand: the horizontal lockups, light and dark together ----------
    pg.goto(f"{BASE}/brand/", wait_until="networkidle", timeout=90000)
    pg.wait_for_timeout(3000)
    # frame from the section heading so the capture doesn't open mid-sentence
    y = pg.evaluate("""(()=>{
      const h=[...document.querySelectorAll('*')].find(e=>
        e.children.length===0 && /01\\s*[—-]\\s*PRIMARY LOCKUP/i.test(e.textContent));
      return h ? Math.max(0, h.getBoundingClientRect().top+scrollY-110) : null;})()""")
    if y is None:
        y = pg.evaluate("""(()=>{
      // the two horizontal lockups sit in adjacent panels; find the pair and
      // frame them together
      const imgs=[...document.querySelectorAll('img,object,svg')].filter(e=>{
        const s=(e.getAttribute('src')||e.getAttribute('data')||'')+e.outerHTML.slice(0,200);
        return /01-lockup-horizontal/.test(s);
      });
      if(imgs.length>=2){
        const a=imgs[0].getBoundingClientRect(), b=imgs[imgs.length-1].getBoundingClientRect();
        const top=Math.min(a.top,b.top)+scrollY, bot=Math.max(a.bottom,b.bottom)+scrollY;
        return Math.max(0, (top+bot)/2 - window.innerHeight/2);
      }
      return null;})()""")
    if y is None:
        # fall back to the first section heading that mentions the lockup
        y = pg.evaluate("""(()=>{
          const h=[...document.querySelectorAll('h1,h2,h3,h4')]
            .find(e=>/lockup|horizontal|signature/i.test(e.textContent));
          return h ? Math.max(0, h.getBoundingClientRect().top+scrollY-120) : 0;})()""")
    pg.evaluate(f"window.scrollTo(0,{y})")
    pg.wait_for_timeout(1500)
    print("  tpb01 brand lockups   at y=", round(y), save(pg, "tpb01"))

    # --- 2. timesheet -------------------------------------------------------
    pg.goto(f"{BASE}/timesheet/Timesheet.html", wait_until="networkidle", timeout=90000)
    pg.wait_for_timeout(3500)
    left = dismiss(pg)
    print("  tpb02 timesheet       modal still showing:", left, save(pg, "tpb02"))

    # --- 3. inventory -------------------------------------------------------
    pg.goto(f"{BASE}/inventory/", wait_until="networkidle", timeout=90000)
    pg.wait_for_timeout(3500)
    left = dismiss(pg)
    print("  tpb03 inventory       modal still showing:", left, save(pg, "tpb03"))

    print("page errors:", errs[:3] or "none")
    b.close()

print("sizes:", {Image.open(f"{OUT}/{f}").size for f in os.listdir(OUT) if f.endswith(".jpg")})
