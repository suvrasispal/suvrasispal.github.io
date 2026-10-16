# Deployment

The website root is the **`adda-slough-website/`** folder. Upload its *contents* so that `index.html` sits at the top of your web root.

## 1. Before you upload
- Make sure you have the whole folder: `index.html`, every `.dc.html`, `support.js`, `.nojekyll`, `css/`, `js/`, `data/`, `images/`, `assets/`.
- Optional to upload: `developer/`, `scripts/`, `server/` (contain no secrets; not needed by visitors).
- `functions/` and `wrangler.toml` are only used by Cloudflare Pages.

## 2a. Standard web host (cPanel, Apache, Nginx, IIS)
1. Open the file manager or connect by FTP/SFTP.
2. Go to the web root (usually `public_html/` or `www/`).
3. Upload everything inside `adda-slough-website/`, keeping the folders. Make sure hidden files (`.nojekyll`) are included if your client hides dotfiles — harmless if missed on these hosts.
4. Visit `https://your-domain/` — the home page should open.
5. Enable HTTPS (Let's Encrypt in cPanel → SSL/TLS Status).

MIME types: `.html` → `text/html`, `.js` → `application/javascript`, `.css` → `text/css`, `.json` → `application/json`, `.svg` → `image/svg+xml`. These are the defaults on all common servers.

## 2b. Netlify / Vercel
Drag the `adda-slough-website` folder into the Netlify dashboard (Sites → Add new site → Deploy manually), or create a Vercel project with framework "Other", no build command, output directory `.`.

## 2c. GitHub Pages
1. Create a repository and push the contents of `adda-slough-website/` (so `index.html` is at the repo root). Keep `.nojekyll`.
2. Settings → Pages → Build and deployment → *Deploy from a branch* → `main` / `/ (root)` → Save.
3. Add your custom domain under *Custom domain* and tick *Enforce HTTPS*.

## 2d. Cloudflare Pages (required for real Adda Live)
1. Connect the repository: build command **none**, output directory **/**.
   Or from this folder: `npx wrangler pages deploy .`
2. Follow `server/LIVE-STREAMING.md` to create the D1 database, set secrets and connect Amazon IVS.

## 3. Optional: clean URLs
Map friendly URLs to page files with host rewrites.

Apache `.htaccess`:
```
RewriteEngine On
RewriteRule ^events/?$ Events.dc.html [L]
RewriteRule ^about-us/?$ About.dc.html [L]
RewriteRule ^contact-us/?$ Contact.dc.html [L]
```
Netlify `_redirects`:
```
/events      /Events.dc.html     200
/about-us    /About.dc.html      200
/contact-us  /Contact.dc.html    200
```

## 4. After upload
Run through [CHECKLIST.md](CHECKLIST.md). Clear any CDN cache after replacing `css/theme.css` or `js/site.js`.

## Updating an existing deployment
Upload only the changed files, keeping their folder paths, and replace the old ones. If you edited a `.dc.html` file and want the site to keep working when opened from a folder, also run `node scripts/build-offline-bundle.mjs` and upload `js/offline-bundle.js`.
