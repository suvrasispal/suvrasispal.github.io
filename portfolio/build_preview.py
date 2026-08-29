"""Builds preview.html — one file, no external dependencies.

The folder build (index.html + css/ + js/ + assets/) is the real deliverable.
This exists so the page can be opened or shared as a single file and still
render completely.
"""

import base64
import io
import json
import os
import re

from PIL import Image

ROOT = "/home/claude/site"
ASSETS = os.path.join(ROOT, "assets")

html = open(os.path.join(ROOT, "index.html")).read()
css = open(os.path.join(ROOT, "css", "style.css")).read()
js = open(os.path.join(ROOT, "js", "main.js")).read()


def datauri(pil, quality):
    buf = io.BytesIO()
    pil.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def slide(sid, width, quality):
    """Downsample the already-cropped asset — never the raw page scan."""
    im = Image.open(f"{ASSETS}/full/{sid}.jpg").convert("RGB")
    im.thumbnail((width, width), Image.LANCZOS)
    return datauri(im, quality)


# --- gallery images, keyed by slide id -------------------------------------
ids = sorted({s for g in re.findall(r'data-gallery="([^"]+)"', html)
              for s in g.split(",")})
gallery = {sid: slide(sid, 1200, 66) for sid in ids}

# --- card thumbnails (smaller — they only ever render at card size) ---------
for m in set(re.findall(r'src="assets/thumb/(s\d+)\.jpg"', html)):
    html = html.replace('src="assets/thumb/%s.jpg"' % m,
                        'src="%s"' % slide(m, 900, 68))

# --- portrait ---------------------------------------------------------------
por = Image.open(os.path.join(ROOT, "assets", "portrait.jpg")).convert("RGB")
por.thumbnail((520, 520), Image.LANCZOS)
html = html.replace('src="assets/portrait.jpg"', 'src="%s"' % datauri(por, 78))

# --- favicon ----------------------------------------------------------------
fav = base64.b64encode(open(os.path.join(ROOT, "assets", "favicon.svg"), "rb").read()).decode()
html = html.replace('href="assets/favicon.svg"', 'href="data:image/svg+xml;base64,%s"' % fav)
html = re.sub(r'<meta property="og:image"[^>]*>\n?', "", html)

# --- inline css + js --------------------------------------------------------
html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n%s\n</style>" % css)
html = html.replace(
    '<script src="js/main.js"></script>',
    "<script>window.__IMG = %s;</script>\n<script>\n%s\n</script>"
    % (json.dumps(gallery), js),
)

# the only surviving "assets/" should be the fallback path inside srcFor(),
# which never fires because window.__IMG covers every id
leftover = re.findall(r'(?:src|href)="(?:assets|css|js)/[^"]*"', html)
assert not leftover, "unresolved external reference: %s" % leftover[:3]

out = os.path.join(ROOT, "preview.html")
open(out, "w").write(html)
print("preview.html: %.1f MB, %d gallery images inlined"
      % (os.path.getsize(out) / 1e6, len(gallery)))
