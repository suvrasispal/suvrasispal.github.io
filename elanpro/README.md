# ÉlanPro — installable web apps (PWA)

Two separate installable apps that share one salon database on the same device:

| App | Path | Who it is for |
|---|---|---|
| Customer | `/customer/` | Clients — book, reschedule, cancel, offers, profile |
| Admin | `/admin/` | Salon staff — dashboard, calendar, services, customers, offers, hours (PIN **2468**) |

The root `/` redirects to the customer app, so the link you share with clients is just the site address. Share `/admin/` only with staff.

## Folder contents

```
index.html            → redirects to customer/
.nojekyll             → tells GitHub Pages to serve files as-is
lib/                  → shared app engine + styles (used by both apps)
customer/             → customer app: index.html, manifest.webmanifest, sw.js, icons/
admin/                → admin app:    index.html, manifest.webmanifest, sw.js, icons/
```

## Deploy on GitHub Pages (about 5 minutes)

1. Sign in at https://github.com and click **New repository**. Name it e.g. `elanpro`, set it to **Public**, and click **Create repository**.
2. Unzip the download. On the new repo page click **uploading an existing file**. Open the unzipped `deploy` folder, select **everything inside it** (`customer`, `admin`, `lib`, `index.html`, `README.md`) and drag it in — do **not** drag the `deploy` folder itself. Click **Commit changes**.
   - Check the repo front page: you should see `admin/`, `customer/`, `lib/` and `index.html` at the top level.
   - `.nojekyll` is a hidden file; if your computer hides it, that is fine — the site still works.
3. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. Wait 1–2 minutes. Your site will be live at:
   - Customer: `https://<your-username>.github.io/elanpro/`
   - Admin: `https://<your-username>.github.io/elanpro/admin/`

Using the command line instead:

```bash
cd deploy
git init && git add . && git commit -m "ÉlanPro PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/elanpro.git
git push -u origin main
# then enable Settings → Pages → main / (root)
```

## Install on a phone

**iPhone (Safari):** open the link → tap **Share** → **Add to Home Screen** → **Add**.
**Android (Chrome):** open the link → tap **⋮** → **Install app** (or **Add to Home screen**).

Install the customer link and the admin link separately — each gets its own icon (pink = customer, blue = admin). Both open full-screen and keep working offline after the first visit.

## Troubleshooting: no “Add to Home Screen” option

1. **Open the link in the real browser, not inside another app.** Links tapped in WhatsApp, Instagram, Facebook, Gmail or LinkedIn open in a built-in viewer that has no Add to Home Screen. Use its ⋯ menu → **Open in Safari / Open in Chrome**.
2. **iPhone:** the option is in Safari's **Share** sheet (square with an up arrow, bottom toolbar) — scroll down past the app icons to find **Add to Home Screen**. In Chrome on iPhone (iOS 16.4+) it is under Share too. It is *not* in the ⋯ page menu.
3. **Android:** in Chrome tap **⋮** (top right) → **Install app** or **Add to Home screen**. Samsung Internet: ☰ → **Add page to** → **Home screen**.
4. **Check the site actually loads** at `https://<username>.github.io/<repo>/` — if you see a 404, the files were uploaded inside an extra `deploy/` folder (open `/<repo>/deploy/` instead, or move the files up), or Pages hasn't finished building (Settings → Pages shows the live URL when ready).
5. The app itself now shows an **“Install on your phone”** card with the right instructions for your phone and browser (and a one-tap **Install app** button on Android).

## Updating the app later

Replace `customer/index.html` and/or `admin/index.html` in the repo with new versions. Then open `sw.js` in the same folder and bump the version (`elanpro-customer-v1` → `-v2`) so phones pick up the update on their next launch.

## Important limitations of this version

- **Data is stored on each device** (browser storage). Customer and admin share data only when both are used **on the same phone/browser**. A booking made on a client's phone will *not* appear on the salon's tablet yet.
- The admin PIN (2468) is a demo gate, not real security — anyone with the admin link and PIN can open it.
- No real push notifications, emails or payments.
- Photos load from Unsplash (free licence) and need an internet connection the first time.

To go live with real customers, the next step is a shared online backend (e.g. Supabase or Firebase) for accounts, bookings and notifications — the app's data model is already structured for this.
