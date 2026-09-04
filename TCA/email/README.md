# TCA Email Signature Generator — standalone package

This is the full, self-contained package for the tool published at your Claude artifact link. It runs entirely in the browser — no server, no build step, no dependencies.

## Running it

**Simplest:** double-click `index.html` (or open it with your browser: File → Open). Everything — logos, icons, and the browser-tab favicon — is embedded in the file itself, so it works even opened directly from disk.

**Recommended for real use:** host `index.html` behind your own login/access control (a private folder on your intranet, a password-protected subdirectory on confidenceacademy.uk, an internal tool like Notion/SharePoint embed, etc.) and share that link with staff instead of the file itself. See "About the login screen" below for why.

To serve it locally instead of opening the file directly (avoids any browser file:// quirks with clipboard permissions):

```bash
cd tca-email-signature-package
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

## Logging in

- Username: `TCAemail`
- Password: `admingbm`

## What's new in this version

- **Favicon fixed.** The previous version had no `<link rel="icon">` tag, so opening `index.html` directly showed no tab icon. It's now embedded in the file's `<head>`.
- **Full lockup logo on login and header.** The login screen and the app header banner now use the full "THE CONFIDENCE ACADEMY / GET BRITAIN MOVING" lockup you supplied, instead of the runner mark alone.
- **Choice of logo in the signature itself.** A new "Logo in signature" picker lets you choose between the compact Runner mark (default — fits best in a narrow signature), the Full lockup, or **upload your own image** entirely. Uploaded logos are automatically scaled down (max 160×80px) to keep the signature compact.

## What's inside

```
index.html                    The complete tool — open this to run it
assets/
  running.png                  Original runner-only mark
  lockup-original.png          Original full lockup logo (wordmark + tagline + runner) you supplied
  logo-signature.png            Runner mark trimmed for the signature (1x)
  logo-signature@2x.png         Runner mark trimmed for the signature (2x / retina)
  lockup-login@2x.png           Full lockup, sized for the login screen
  lockup-header@2x.png          Full lockup, sized for the app header banner
  lockup-signature@2x.png       Full lockup, sized for the "Full lockup" signature option
  icon-phone.png                Line-style phone icon (Royal Blue, brand stroke weight)
  icon-mail.png                  Line-style envelope icon
  icon-globe.png                 Line-style globe/website icon
  favicon.ico                    Multi-size favicon (16/32/48px) for browser tabs
  favicon-16x16.png … favicon-512x512.png   Individual favicon sizes
  apple-touch-icon.png           180×180 icon for iOS home-screen bookmarks
  generate_assets.py             Regenerates the runner logo crop + favicon set from running.png (Pillow)
  gen_lockup.py                  Regenerates the three lockup logo crops from lockup-original.png (Pillow)
  render_icons.py                Regenerates the 3 line icons from icons.html (Playwright)
  icons.html                     SVG source for the phone/mail/globe icons — edit here to restyle
  favicon-html-snippet.txt       <head> tags to install the favicon on confidenceacademy.uk
```

`index.html` already has every logo and icon baked in as embedded images, so it does **not** read from `assets/` at runtime — that folder is there so you (or a developer) can inspect, edit, or regenerate the source images later, and so anyone using the in-app "Upload your own" logo feature has the original files to hand if needed.

### Updating the logo files

If either logo artwork changes:

```bash
pip install Pillow --break-system-packages
python3 assets/generate_assets.py   # regenerates runner mark + favicons from running.png
python3 assets/gen_lockup.py        # regenerates the 3 lockup sizes from lockup-original.png
```

Then base64-encode the new PNGs and swap them into the matching `data:image/png;base64,...` strings inside `index.html` (search for `LOGO_LOCKUP`, `LOGO_RUNNER`, or `FAVICON` nearby to find each spot).

## Installing the favicon on confidenceacademy.uk

Upload the `favicon*.png`, `favicon.ico`, and `apple-touch-icon.png` files to your site's root (or an `/assets/` folder and adjust the paths), then paste the tags from `assets/favicon-html-snippet.txt` into the `<head>` of your site templates.

## About the login screen

This matches the design and mechanism of your existing brand-assets login page: a client-side check against a fixed username/password, styled to match. It's a deterrent, not real security — anyone who views the page source can read the credentials and the form logic, since there's no server validating anything. It stops casual browsing but won't stop a determined, technical visitor. If this tool needs to hold real access control, put it behind your own server-side authentication (an intranet, an SSO-gated subdirectory, etc.) rather than relying on this screen alone.

## How the signature itself works

- **Copy Signature** copies the actual rendered HTML (a table-based, inline-styled block) to your clipboard — not a screenshot — so it pastes as live, formatted content into Gmail, Outlook, Apple Mail, etc.
- The logo and icons are embedded directly in the signature's HTML as images, the same way Outlook/Gmail embed a pasted picture into a signature — no external image hosting required, and nothing breaks if a link goes down.
- Fonts in the signature itself use Arial/Helvetica (a safe fallback), not the brand's Sora/Inter — custom web fonts aren't reliably supported by email clients, so this keeps the signature rendering identically everywhere. Colours, spacing, and icon style still follow the TCA brand guideline exactly.
- The "Logo in signature" picker (Runner mark / Full lockup / upload your own) only changes the signature's logo — the login screen and app header always show the full lockup.
