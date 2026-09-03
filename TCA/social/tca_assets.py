#!/usr/bin/env python3
"""
TCA social templates — asset generator.

Two jobs:

  1. Favicons. Takes the supplied favicon.ico and produces every size the
     login page and the templates page reference, plus base64 data URIs so
     the icons still work when the HTML is opened straight off disk with no
     sibling files.

         python3 tca_assets.py icons [source.ico] [--outdir .]

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

BRAND_NAVY = (0, 36, 125, 255)          # Royal Blue #00247D
SALT = "tca-social-templates-v1"        # must match SALT in the HTML

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


def _resize(im, size):
    from PIL import Image
    return im.resize((size, size), Image.LANCZOS)


def _on_navy(im):
    """Flatten onto brand navy. iOS home-screen icons render transparency as black."""
    from PIL import Image
    bg = Image.new("RGBA", im.size, BRAND_NAVY)
    bg.alpha_composite(im)
    return bg


def _data_uri(im, size, flatten=False):
    frame = _resize(_on_navy(im) if flatten else im, size)
    buf = io.BytesIO()
    frame.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def build_icons(src, outdir):
    im = _load(src)
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
    _resize(_on_navy(im), APPLE_TOUCH[1]).save(path, format="PNG", optimize=True)
    written.append(path)

    for p in written:
        print("wrote %-28s %6.1f KB" % (os.path.basename(p), os.path.getsize(p) / 1024))

    print("\n--- paste into the HTML <head> ---")
    print("icon 32 data URI      (%d chars)" % len(_data_uri(im, 32)))
    print("apple-touch data URI  (%d chars)" % len(_data_uri(im, 180, flatten=True)))

    with open(os.path.join(outdir, "favicon-datauris.txt"), "w") as f:
        f.write("icon-32\n" + _data_uri(im, 32) + "\n\n")
        f.write("apple-touch-180\n" + _data_uri(im, 180, flatten=True) + "\n")
    print("full strings written to favicon-datauris.txt")


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
        src = args[1] if len(args) > 1 and not args[1].startswith("--") else "favicon.ico"
        outdir = "."
        if "--outdir" in args:
            outdir = args[args.index("--outdir") + 1]
        if not os.path.exists(src):
            sys.exit("Can't find %s — pass the path to your .ico" % src)
        build_icons(src, outdir)

    elif cmd == "hash":
        if len(args) < 3:
            sys.exit("Usage: tca_assets.py hash <username> <password>")
        build_hashes(args[1], args[2])

    else:
        sys.exit("Unknown command %r — try 'icons' or 'hash'" % cmd)


if __name__ == "__main__":
    main()
