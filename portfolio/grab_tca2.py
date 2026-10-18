import base64, os
from PIL import Image
from playwright.sync_api import sync_playwright
B="http://localhost:8855"; OUT="/home/claude/tca2_out"; W,Hh=3840,2159
os.makedirs(OUT, exist_ok=True)
GREY=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==")

def save(pg,name):
    raw=f"{OUT}/{name}.png"; pg.screenshot(path=raw)
    im=Image.open(raw).convert("RGB")
    if im.size!=(W,Hh):
        im=im.crop((0,0,W,min(Hh,im.height)))
        if im.size!=(W,Hh): im=im.resize((W,Hh),Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg","JPEG",quality=92,optimize=True,progressive=True); os.remove(raw)

with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={"width":1920,"height":1080}, device_scale_factor=2)
    for pat in ("https://images.unsplash.com/**","https://source.unsplash.com/**","https://plus.unsplash.com/**"):
        pg.route(pat, lambda r: r.fulfill(status=200, content_type="image/png", body=GREY))
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:120]))

    # ---- SOCIAL: Facebook (focus), then Instagram + the overview ----
    pg.goto(f"{B}/social/", wait_until="networkidle", timeout=90000); pg.wait_for_timeout(3500)
    pg.evaluate("""async()=>{const H=document.body.scrollHeight;
      for(let y=0;y<H;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}window.scrollTo(0,0);}""")
    pg.wait_for_timeout(800)
    # Facebook panel — frame it from its heading
    pg.evaluate("""(()=>{const h=[...document.querySelectorAll('h2,h3')].find(e=>/Facebook/i.test(e.textContent));
      if(h) window.scrollTo(0, Math.max(0, h.getBoundingClientRect().top+scrollY-70));})()""")
    pg.wait_for_timeout(1200); save(pg,"soc_fb"); print("  soc_fb")
    # Instagram
    pg.evaluate("""(()=>{const h=[...document.querySelectorAll('h2,h3')].find(e=>/Instagram/i.test(e.textContent));
      if(h) window.scrollTo(0, Math.max(0, h.getBoundingClientRect().top+scrollY-70));})()""")
    pg.wait_for_timeout(1200); save(pg,"soc_ig"); print("  soc_ig")
    # overview / top with editor controls
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(800); save(pg,"soc_top"); print("  soc_top")

    # ---- PRINT: flyers, banners, and a template close-up ----
    pg.goto(f"{B}/print/", wait_until="networkidle", timeout=90000); pg.wait_for_timeout(3500)
    save(pg,"prn_main"); print("  prn_main")
    # click through to a flyer template if the UI offers tabs
    for label in ("A5 flyers","Pull-up banners"):
        pg.evaluate(f"""(()=>{{const el=[...document.querySelectorAll('button,a,[role=tab],li,h2,h3')]
          .find(e=>new RegExp('^\\\\s*{label}','i').test(e.textContent)); if(el) el.scrollIntoView({{block:'center'}});}})()""")
        pg.wait_for_timeout(1000)
    save(pg,"prn_templates"); print("  prn_templates")
    print("errors:", errs[:4] or "none")
    b.close()
print("sizes:", {Image.open(f"{OUT}/{f}").size for f in os.listdir(OUT) if f.endswith('.jpg')})
