import os, base64
from PIL import Image
from playwright.sync_api import sync_playwright
B="http://localhost:8862"; V="/home/claude/vendor/serve"; OUT="/home/claude/nex_out"; W,Hh=3840,2159
os.makedirs(OUT, exist_ok=True)
MAP={"react@18.3.1/umd/react.production.min.js":"react.production.min.js",
 "react-dom@18.3.1/umd/react-dom.production.min.js":"react-dom.production.min.js",
 "@babel/standalone@7.29.0/babel.min.js":"babel.min.js"}
def route(r):
    for k,f in MAP.items():
        if k in r.request.url: return r.fulfill(status=200, content_type="application/javascript", body=open(f"{V}/{f}").read())
    r.continue_()
def save(pg,name,y=0):
    pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(900)
    raw=f"{OUT}/{name}.png"; pg.screenshot(path=raw)
    im=Image.open(raw).convert("RGB")
    if im.size!=(W,Hh):
        im=im.crop((0,0,W,min(Hh,im.height)))
        if im.size!=(W,Hh): im=im.resize((W,Hh),Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg","JPEG",quality=92,optimize=True,progressive=True); os.remove(raw)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1920,"height":1080}, device_scale_factor=2)
    pg.route("https://unpkg.com/**", route)
    for pat in ("https://cdn.simpleicons.org/**","https://images.unsplash.com/**","https://cdn.sheetjs.com/**","https://cdnjs.cloudflare.com/**"):
        pg.route(pat, lambda r: r.abort())
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:80]))
    def load(u):
        pg.goto(u, wait_until="networkidle", timeout=60000); pg.wait_for_timeout(3000)
        pg.evaluate("""async()=>{const H=document.body.scrollHeight;for(let y=0;y<H;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,35));}window.scrollTo(0,0);}""")
        pg.wait_for_timeout(600)
    # NEXCut customer + business
    load(f"{B}/nexcut_production/product/customers.html"); save(pg,"cut_cust",200); print("cut_cust")
    load(f"{B}/nexcut_production/product/business.html"); save(pg,"cut_biz",200); print("cut_biz")
    # NEXDrive product + app
    load(f"{B}/nexdrive_production/product/index.html"); save(pg,"drive_prod",200); print("drive_prod")
    load(f"{B}/nexdrive_production/index.html"); save(pg,"drive_app",0); print("drive_app")
    # NEXTime product + app
    load(f"{B}/nextime/public/nextime/index.html"); save(pg,"time_prod",200); print("time_prod")
    load(f"{B}/nextime/public/nextime/app.html"); save(pg,"time_app",0); print("time_app")
    # NEXHR: seed demo session via platform.js, then app
    pg.goto(f"{B}/NexHR/login.html", wait_until="networkidle", timeout=60000); pg.wait_for_timeout(2500)
    pg.evaluate("""async()=>{ const pf=await import(new URL('assets/js/platform.js', location.href).href); pf.demoSession(); }""")
    pg.wait_for_timeout(800)
    load(f"{B}/NexHR/app.html"); save(pg,"hr_app",0); print("hr_app")
    print("errors:", errs[:5] or "none")
    b.close()
print("sizes:", {Image.open(f"{OUT}/{f}").size for f in os.listdir(OUT) if f.endswith('.jpg')})
