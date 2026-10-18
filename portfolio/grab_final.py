import base64, os
from PIL import Image
from playwright.sync_api import sync_playwright
B="http://localhost:8856"; OUT="/home/claude/tca2_out"; W,Hh=3840,2159
GREY=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==")
def save(pg,name):
    raw=f"{OUT}/{name}.png"; pg.screenshot(path=raw)
    im=Image.open(raw).convert("RGB")
    if im.size!=(W,Hh):
        im=im.crop((0,0,W,min(Hh,im.height)))
        if im.size!=(W,Hh): im=im.resize((W,Hh),Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg","JPEG",quality=92,optimize=True,progressive=True); os.remove(raw)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1920,"height":1080}, device_scale_factor=2)
    for pat in ("https://images.unsplash.com/**","https://source.unsplash.com/**","https://plus.unsplash.com/**"):
        pg.route(pat, lambda r: r.fulfill(status=200, content_type="image/png", body=GREY))
    # print: switch to a pull-up banner template, which is portrait and visually distinct
    pg.goto(f"{B}/print/", wait_until="networkidle", timeout=90000); pg.wait_for_timeout(3500)
    tabs=pg.evaluate("[...document.querySelectorAll('button,[role=tab],a,li')].map(e=>e.textContent.trim()).filter(t=>/banner|vertical|flyer|template/i.test(t)).slice(0,10)")
    print("print tabs:", tabs)
    pg.evaluate("""(()=>{const el=[...document.querySelectorAll('button,[role=tab],a,li')]
      .find(e=>/vertical ladder|pull-up|banner/i.test(e.textContent)); if(el) el.click();})()""")
    pg.wait_for_timeout(1800); save(pg,"prn_banner"); print("  prn_banner")
    b.close()
