# assets/images

Empty on purpose.

The site currently hot-links its nine photographs from Unsplash's CDN. To
pull them down and serve them from here instead, run from the folder that
contains `index.html`:

    python3 tools/download-images.py

That downloads each image at the exact size and quality the page requests,
saves it here under a descriptive filename, and repoints `index.html` at the
local copies. The original is kept as `index.html.cdn-backup`.

Nothing is rewritten unless every download succeeds, so a partial failure
leaves the working CDN version intact.

Licence details for all nine images are in `docs/PHOTOGRAPHY.md`. Keep that
file with these assets.
