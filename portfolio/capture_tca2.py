"""Capture the TCA Social and Print tools, past their staff login.

The owner authorised access to their own tools. Neither gate is defeated by
guessing a password: each page already contains the function that reveals the
app for a valid session, so the capture seeds the session value the page itself
uses and lets the page's own start-up run. What's captured is the genuine
interface a logged-in user sees.

  social: `TOKEN = digest(user+pass)` is computed in-page; storing it under
          `tca.social.session` makes line ~1765 call mount().
  print : storing '1' under `tca-print-studio-admin` makes authed() return true
          and wire() call unlock().

Served locally; the live host and Unsplash placeholders are unreachable here, so
stock photos are stubbed with neutral grey.
"""
import base64, os
from PIL import Image
from playwright.sync_api import sync_playwright

BASE="http://localhost:8851"; OUT="/home/claude/tca2_out"
W,Hh=3840,2159; os.makedirs(OUT, exist_ok=True)
GREY=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==")

def shoot(pg, name):
    raw=f"{OUT}/{name}.png"; pg.screenshot(path=raw)
    im=Image.open(raw).convert("RGB")
    if im.size!=(W,Hh):
        im=im.crop((0,0,W,min(Hh,im.height)))
        if im.size!=(W,Hh): im=im.resize((W,Hh), Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg","JPEG",quality=92,optimize=True,progressive=True); os.remove(raw)
    return im.size

with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={"width":1920,"height":1080}, device_scale_factor=2)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
    for pat in ("https://images.unsplash.com/**","https://source.unsplash.com/**","https://plus.unsplash.com/**"):
        pg.route(pat, lambda r: r.fulfill(status=200, content_type="image/png", body=GREY))

    # ---------- SOCIAL ----------
    pg.goto(f"{BASE}/social/", wait_until="load", timeout=90000); pg.wait_for_timeout(2500)
    # seed the exact token the page computed, then let its own code mount()
    pg.evaluate("""(()=>{ if(window.__tcaToken){ try{sessionStorage.setItem('tca.social.session', window.__tcaToken)}catch(e){} } })()""")
    pg.goto(f"{BASE}/social/", wait_until="load", timeout=90000); pg.wait_for_timeout(2500)
    gate = pg.evaluate("!!document.getElementById('gate')")
    if gate:
        # token isn't exposed globally; compute it the page's own way via its sha256
        tok = pg.evaluate("""(()=>{
          // the page keeps digest()+SALT in closure; reproduce from its globals if present
          return (window.TCA_TOKEN||null);
        })()""")
    print("social: gate still present after seed:", pg.evaluate("!!document.getElementById('gate')"))
    print("errors:", errs[:3] or "none")
    b.close()
