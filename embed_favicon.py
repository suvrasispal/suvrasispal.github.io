"""Embed favicon.svg directly into index.html.

The page currently points at `portfolio/assets/favicon.svg`, so the icon only
appears if that subfolder happens to be deployed alongside. The SVG is 266
bytes — smaller than the HTTP request fetching it — so it is embedded as a data
URI instead. Nothing external to break.

Two PNG fallbacks are rendered from the same SVG:
  * 32x32   for browsers that don't support SVG icons (Safari 15 and earlier)
  * 180x180 for the iOS home-screen icon, which never accepts SVG

PNGs are rasterised through headless Chromium rather than redrawn by hand, so
they are the same artwork rather than an approximation of it.
"""

import base64
import os
import re

from playwright.sync_api import sync_playwright

SVG_IN = "/mnt/user-data/uploads/favicon.svg"
HTML_IN = "/mnt/user-data/uploads/index.html"
OUT_DIR = "/home/claude/landing"

os.makedirs(OUT_DIR, exist_ok=True)
svg = open(SVG_IN, "rb").read()


def png_at(size):
    """Rasterise the SVG at size x size using a real browser."""
    page_html = (
        "<style>html,body{margin:0;padding:0}svg{display:block;width:%dpx;height:%dpx}</style>%s"
        % (size, size, svg.decode())
    )
    path = f"{OUT_DIR}/_tmp_{size}.png"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": size, "height": size},
                        device_scale_factor=1)
        pg.set_content(page_html)
        pg.wait_for_timeout(250)          # let the webfont fall back and settle
        pg.screenshot(path=path, omit_background=False)
        b.close()
    data = open(path, "rb").read()
    os.remove(path)
    return data


def uri(data, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(data).decode())


svg_uri = uri(svg, "image/svg+xml")
png32 = png_at(32)
png180 = png_at(180)

links = (
    '<link rel="icon" href="%s" type="image/svg+xml">\n'
    '  <link rel="alternate icon" href="%s" type="image/png" sizes="32x32">\n'
    '  <link rel="apple-touch-icon" href="%s" sizes="180x180">\n'
    '  <meta name="theme-color" content="#0a0a0a">'
    % (svg_uri, uri(png32, "image/png"), uri(png180, "image/png"))
)

html = open(HTML_IN, encoding="utf-8").read()

# replace the existing icon link, wherever it sits and however it's indented
pattern = re.compile(r'[ \t]*<link rel="icon"[^>]*>[ \t]*\r?\n', re.I)
assert pattern.search(html), "no existing <link rel=icon> found"
html = pattern.sub("  " + links + "\n", html, count=1)

out = os.path.join(OUT_DIR, "index.html")
open(out, "w", encoding="utf-8").write(html)

print("svg  data URI: %5d chars" % len(svg_uri))
print("png32  bytes: %5d" % len(png32))
print("png180 bytes: %5d" % len(png180))
print("index.html: %.1f KB -> %.1f KB"
      % (os.path.getsize(HTML_IN) / 1024, os.path.getsize(out) / 1024))
