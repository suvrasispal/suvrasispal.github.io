# Suvrasis Pal portfolio

Static site. No build step, no dependencies, no server-side code.

## Structure

```
index.html        the page
css/style.css     all styling
js/main.js        project viewer and contact form
assets/           favicon, portrait
assets/thumb/     card images (1800px)
assets/full/      viewer images (3840px)
```

## Deploy

Upload the contents of this folder so that `index.html` sits at the root of the
site. Keep the folder structure intact: all paths are relative, so `css`, `js`
and `assets` must stay alongside `index.html`.

Works as-is on GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3 or ordinary
shared hosting. For Netlify, drag this folder onto app.netlify.com/drop.

## Notes

Fonts load from Google Fonts, so the page needs an internet connection to show
Bricolage Grotesque, Newsreader and DM Mono. Without one it falls back to
Helvetica and Georgia, which is close but not identical.

The contact form posts to Web3Forms. The access key in `index.html` is public by
design: it identifies the destination inbox and grants no account access.
