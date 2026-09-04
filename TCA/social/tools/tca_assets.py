#!/usr/bin/env python3
"""
TCA social templates — asset generator.

Two jobs:

  1. Favicons. Takes a source image (.png or .ico) and produces every size the
     login page and the templates page reference, plus a base64 data URI so
     the icon still works when the HTML is opened straight off disk with no
     sibling files. A transparent source is trimmed to its artwork and centred
     in a square so the mark stays legible at 16px. Colours are never altered.

         python3 tca_assets.py icons running.png [--outdir .] [--flat-bg FFFFFF]

  1b. Logo. Pulls the raster out of logo-primary.svg (which is a wrapper around
     an embedded PNG), scales it for on-screen use and quantises it so it can be
     inlined in the page as a data URI instead of fetched from a remote host.

         python3 tca_assets.py logo logo-primary.svg [--outdir .]

  2. Credential hashes. The login gate stores salted SHA-256 digests rather
     than the username and password in clear text, so the credentials are
     not sitting in the page source for anyone who opens View Source. Run
     this to generate the two constants after changing them.

         python3 tca_assets.py hash TCAsocial admingbm

     Paste the printed values over AUTH.user and AUTH.pass in the HTML.

     This is obfuscation, not security. Anyone determined can read the
     script and work around the gate. See the note in the HTML.
"""

import base64
import hashlib
import io
import os
import sys

SALT = "tca-social-templates-v1"        # must match SALT in the HTML
FLAT_BG = (255, 255, 255, 255)          # backdrop for the Apple touch icon
LOGO_WIDTH = 640                        # enough for the 258px YouTube lock-up
LOGO_COLOURS = 32                       # flat brand artwork palettises cleanly

ICO_SIZES = [16, 32, 48, 64, 128, 256]
PNG_TARGETS = {
    "favicon-16.png": 16,
    "favicon-32.png": 32,
    "favicon-48.png": 48,
    "favicon-192.png": 192,
    "favicon-512.png": 512,
}
APPLE_TOUCH = ("apple-touch-icon.png", 180)


def _load(src):
    from PIL import Image
    im = Image.open(src)
    try:
        im.size = max(im.ico.sizes())      # pull the largest frame out of the .ico
    except Exception:
        pass
    return im.convert("RGBA")


def _square(im):
    """Trim a transparent source to its artwork and centre it in a square, so a
    mark drawn with wide margins is still readable at 16px. Pixels are moved,
    never recoloured."""
    from PIL import Image
    box = im.getchannel("A").getbbox()
    if not box:
        return im
    mark = im.crop(box)
    side = round(max(mark.size) * 1.06)     # a little even breathing room
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.alpha_composite(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
    return out


def _resize(im, size):
    from PIL import Image
    return im.resize((size, size), Image.LANCZOS)


def _flatten(im, colour=FLAT_BG):
    """Flatten onto a solid backdrop. iOS home-screen icons render transparency
    as black, so the Apple touch icon needs a background — white, to match the
    artwork as supplied."""
    from PIL import Image
    bg = Image.new("RGBA", im.size, colour)
    bg.alpha_composite(im)
    return bg


def _data_uri(im, size, flatten=False, bg=FLAT_BG):
    frame = _resize(_flatten(im, bg) if flatten else im, size)
    buf = io.BytesIO()
    frame.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def build_icons(src, outdir, flat_bg=FLAT_BG):
    im = _square(_load(src))
    os.makedirs(outdir, exist_ok=True)
    written = []

    ico_path = os.path.join(outdir, "favicon.ico")
    _resize(im, 256).save(ico_path, format="ICO",
                          sizes=[(s, s) for s in ICO_SIZES])
    written.append(ico_path)

    for name, size in PNG_TARGETS.items():
        path = os.path.join(outdir, name)
        _resize(im, size).save(path, format="PNG", optimize=True)
        written.append(path)

    path = os.path.join(outdir, APPLE_TOUCH[0])
    _resize(_flatten(im, flat_bg), APPLE_TOUCH[1]).save(path, format="PNG", optimize=True)
    written.append(path)

    for p in written:
        print("wrote %-28s %6.1f KB" % (os.path.basename(p), os.path.getsize(p) / 1024))

    print("\n--- paste into the HTML <head> ---")
    print("icon 32 data URI      (%d chars)" % len(_data_uri(im, 32)))

    with open(os.path.join(outdir, "favicon-datauris.txt"), "w") as f:
        f.write("icon-32\n" + _data_uri(im, 32) + "\n")
    print("full strings written to favicon-datauris.txt")


def build_logo(src, outdir):
    """logo-primary.svg is an SVG wrapper around an embedded PNG, so the raster
    comes straight out of it — nothing is redrawn or recoloured."""
    import base64 as b64
    import re
    from PIL import Image

    os.makedirs(outdir, exist_ok=True)
    if src.lower().endswith(".svg"):
        text = open(src, encoding="utf-8").read()
        match = re.search(r"base64,([^\"\']+)", text)
        if not match:
            sys.exit("No embedded raster found in %s" % src)
        im = Image.open(io.BytesIO(b64.b64decode(match.group(1)))).convert("RGBA")
    else:
        im = _load(src)

    height = round(im.height * LOGO_WIDTH / im.width)
    small = im.resize((LOGO_WIDTH, height), Image.LANCZOS).quantize(
        colors=LOGO_COLOURS, method=Image.FASTOCTREE)

    path = os.path.join(outdir, "logo-primary.png")
    small.save(path, format="PNG", optimize=True)
    print("wrote %-28s %6.1f KB  (%d x %d)"
          % ("logo-primary.png", os.path.getsize(path) / 1024, LOGO_WIDTH, height))

    uri = "data:image/png;base64," + b64.b64encode(open(path, "rb").read()).decode()
    with open(os.path.join(outdir, "logo-datauri.txt"), "w") as f:
        f.write(uri)
    print("data URI (%d chars) written to logo-datauri.txt" % len(uri))
    print("Paste it over the TCA_LOGO constant in the HTML <head>.")


def digest(value):
    return hashlib.sha256((SALT + ":" + value).encode("utf-8")).hexdigest()


def build_hashes(user, password):
    print("Replace the AUTH constants in the HTML with:\n")
    print('    user: "%s",' % digest(user))
    print('    pass: "%s"' % digest(password))
    print('\n(salt "%s" — must match SALT in the HTML)' % SALT)


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        return
    cmd = args[0]

    if cmd == "icons":
        src = args[1] if len(args) > 1 and not args[1].startswith("--") else "running.png"
        outdir = "."
        if "--outdir" in args:
            outdir = args[args.index("--outdir") + 1]
        flat = FLAT_BG
        if "--flat-bg" in args:
            hexval = args[args.index("--flat-bg") + 1].lstrip("#")
            flat = tuple(int(hexval[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
        if not os.path.exists(src):
            sys.exit("Can't find %s — pass the path to your source image" % src)
        build_icons(src, outdir, flat)

    elif cmd == "logo":
        src = args[1] if len(args) > 1 and not args[1].startswith("--") else "logo-primary.svg"
        outdir = "."
        if "--outdir" in args:
            outdir = args[args.index("--outdir") + 1]
        if not os.path.exists(src):
            sys.exit("Can't find %s" % src)
        build_logo(src, outdir)

    elif cmd == "hash":
        if len(args) < 3:
            sys.exit("Usage: tca_assets.py hash <username> <password>")
        build_hashes(args[1], args[2])

    else:
        sys.exit("Unknown command %r — try 'icons', 'logo' or 'hash'" % cmd)


if __name__ == "__main__":
    main()
