#!/usr/bin/env python3
"""
Download every photograph the site uses and repoint index.html at local copies.

The site currently hot-links its photography from Unsplash's CDN. Run this once
and the whole package becomes self-contained: no third-party image requests, no
dependency on Unsplash staying up, faster and more private for visitors.

    cd tca-website
    python3 tools/download-images.py

Options:
    --dry-run     list what would be downloaded, change nothing
    --html PATH   point at a different HTML file (default: index.html)
    --out DIR     where to save (default: assets/images)

Safe to re-run. Images already downloaded are skipped, and URLs already
pointing at local files are left alone.

Standard library only. No pip install needed.
"""

import argparse
import html as htmlmod
import os
import re
import sys
import urllib.request

# Descriptive filenames, so the assets folder is readable at a glance.
# Anything not listed falls back to the Unsplash file id.
NAMES = {
    "photo-1552674605-db6ffd4facb5": "hero-runners",
    "photo-1716374032637-aa49a1d93a18": "about-group",
    "photo-1519311965067-36d3e5f33d39": "benefits-high-five",
    "photo-1517130038641-a774d04afb3c": "event-zumba-dance",
    "photo-1738523686619-1b3b5d2405ee": "event-mindset-resilience",
    "photo-1518622358385-8ea7d0794bf6": "event-nutrition-wellbeing",
    "photo-1770270402445-b72169c6e48a": "blog-high-five",
    "photo-1590333748338-d629e4564ad9": "waitlist-open-road",
    "photo-1607962837359-5e7e89f86776": "contact-solo-runner",
}

URL_RE = re.compile(r'https://images\.unsplash\.com/(photo-[0-9a-z]+-[0-9a-f]+)[^"\'\s]*')
UA = "Mozilla/5.0 (compatible; TCA-site-build/1.0)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", default="index.html")
    ap.add_argument("--out", default=os.path.join("assets", "images"))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(args.html):
        sys.exit(f"Can't find {args.html}. Run this from the folder containing index.html.")

    source = open(args.html, encoding="utf-8").read()

    # Unique URLs, in document order
    found, seen = [], set()
    for m in URL_RE.finditer(source):
        url = m.group(0)
        if url not in seen:
            seen.add(url)
            found.append((url, m.group(1)))

    if not found:
        print("No Unsplash URLs left in the HTML. Nothing to do.")
        return

    print(f"{len(found)} image(s) referenced in {args.html}\n")
    os.makedirs(args.out, exist_ok=True)

    replacements = {}
    failures = []

    for url, photo_id in found:
        name = NAMES.get(photo_id, photo_id) + ".jpg"
        dest = os.path.join(args.out, name)
        # Path as it will appear in the HTML, always forward slashes
        rel = "/".join(os.path.normpath(dest).split(os.sep))
        replacements[url] = rel

        if args.dry_run:
            print(f"  would download  {photo_id}  ->  {rel}")
            continue

        if os.path.exists(dest) and os.path.getsize(dest) > 0:
            print(f"  already present {rel} ({os.path.getsize(dest):,} bytes)")
            continue

        # The HTML stores &amp;; the request needs real ampersands
        request_url = htmlmod.unescape(url)
        try:
            req = urllib.request.Request(request_url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            if not data:
                raise ValueError("empty response")
            with open(dest, "wb") as f:
                f.write(data)
            print(f"  downloaded      {rel} ({len(data):,} bytes)")
        except Exception as exc:
            failures.append((photo_id, exc))
            print(f"  FAILED          {photo_id}: {exc}")

    if args.dry_run:
        print("\nDry run: nothing written.")
        return

    if failures:
        print(f"\n{len(failures)} download(s) failed. index.html has NOT been changed,")
        print("so the site still works against the CDN. Fix the errors and re-run.")
        sys.exit(1)

    # Only rewrite once every file is safely on disk
    updated = source
    for url, rel in replacements.items():
        updated = updated.replace(url, rel)

    backup = args.html + ".cdn-backup"
    if not os.path.exists(backup):
        with open(backup, "w", encoding="utf-8") as f:
            f.write(source)
        print(f"\nOriginal saved as {backup}")

    with open(args.html, "w", encoding="utf-8") as f:
        f.write(updated)

    print(f"{args.html} now points at {args.out}/")
    print("\nThe site is self-contained. Nothing loads from Unsplash any more.")
    print("Licence record is in docs/PHOTOGRAPHY.md — keep it with the images.")


if __name__ == "__main__":
    main()
