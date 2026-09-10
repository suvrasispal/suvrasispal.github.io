# Deploying Nexyra Signature Studio

This folder is a complete, ready-to-deploy static site — no build step, no
server-side code, no dependencies to install. Upload it as-is to any static
host and it works.

```
index.html                    the signature builder (entry point)
favicon.ico
favicon-16x16.png
favicon-32x32.png
favicon-48x48.png
apple-touch-icon.png
android-chrome-192x192.png
android-chrome-512x512.png
site.webmanifest              favicon set, already wired into index.html
signatures/
  signature-lockup-example.html      static reference copy, logo lock-up
  signature-monogram-example.html    static reference copy, monogram
```

Everything the page needs — the Nexyra logo, the monogram, and the three
contact icons — is embedded directly in `index.html` as base64 image data.
There are no other asset requests at runtime except the favicon files and
the Hanken Grotesk web font (loaded from Google Fonts; if that request is
blocked or offline, the page falls back to Helvetica Neue/Arial and still
looks correct).

## One important requirement: HTTPS

The **Copy signature** button uses the browser Clipboard API to write
richly-formatted HTML (not a screenshot, not plain text) to the clipboard.
Browsers only allow this API on a **secure context** — HTTPS, or
`localhost` during local testing. Every option below serves over HTTPS by
default, so this is generally nothing you need to configure, but if you
ever host it somewhere without TLS, the Copy buttons will silently fall
back to a legacy copy method that works less reliably in some browsers.

## Option 1: GitHub Pages

1. Create a new repository (or a folder/branch in an existing one) and add
   the contents of this folder to it.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a
   branch**, choose the branch and the folder containing `index.html`
   (root, or `/docs` if you placed it there), and save.
4. GitHub Pages publishes at `https://<username>.github.io/<repo>/` within
   a minute or two. Since the site lives in a sub-path, the relative
   favicon links in `index.html` resolve correctly either way — no edits
   needed.

This matches how the Nexyra brand guideline itself is hosted
(`suvrasispal.github.io/nexyra/brand/`), so a `nexyra-signature` sibling
repo under the same account is a natural fit.

## Option 2: Netlify

1. Drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
   or connect a repository containing it and set the **publish directory**
   to this folder.
2. Netlify assigns a `*.netlify.app` URL immediately, with HTTPS included.
   Add a custom domain under **Site settings → Domain management** if
   you'd like the tool at a Nexyra subdomain (e.g.
   `signature.nexyraconsulting.co.uk`).

## Option 3: Vercel

1. Run `vercel` from inside this folder (or drag-and-drop / import the
   repository in the Vercel dashboard).
2. No framework or build command is needed — Vercel serves static files
   as-is.

## Option 4: Any other static host (S3 + CloudFront, Cloudflare Pages,
   your own Nginx/Apache server, etc.)

Upload the folder's contents so that `index.html` sits at the path you
want the tool to load from, keeping the favicon files and `site.webmanifest`
alongside it in the same directory (the links in `index.html` are relative,
so this works whether the site is served from the domain root or a
sub-path). Point your web server's default document at `index.html`.

## Testing locally before you deploy

From inside this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` — `localhost` counts as a secure context,
so the Copy buttons work exactly as they will in production.

## Updating the content later

`index.html` is fully self-contained — the logo, monogram, and icons are
baked in as base64 image data, and the two signature layouts (logo lock-up
and monogram) are embedded as JavaScript template strings. To change the
logo, icons, or the signature markup itself, regenerate `index.html` from
source rather than hand-editing it: see the `tools/` scripts and
`README.md` in the main signature package for the full rebuild process.
