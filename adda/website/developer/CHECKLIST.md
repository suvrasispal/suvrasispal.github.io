# Deployment-readiness checklist

## Checked for this release (8 October 2026)
- [x] All 111 external media URLs on media.adda-slough.org load: 110 images (each returns real dimensions) + the ABP News video (3 min 19 s).
- [x] Every local reference (favicons, CSS, JS, logo, About photo, pandal photo, Nexyra logo, 17 sponsor logos, 10 Unsplash photos) points to a file that exists in the package — 0 missing.
- [x] No page references the removed folders (`assets/images/events`, `org`, `promotions`, `assets/videos`).
- [x] `js/offline-bundle.js` rebuilt from the current pages.
- [x] Design-review file (Hover Options) removed from the package.

## After each deployment
- [ ] Home: slideshow, upcoming events, promotions, About photo, sponsors marquee
- [ ] Events: hero, posters, Bhog section, category cards
- [ ] Festivals / Cultural / Sports: every event card has an image
- [ ] Open three past events (`Event.dc.html?id=durga-pujo-2025`, `holi-2026`, `adda-cricket-2026`)
- [ ] About: ADDA Family grid
- [ ] Charity + Adda Aid 2022/2021/2020
- [ ] Media › Print clippings; Media › Digital ABP News video plays
- [ ] Registration poster; Contact and Sign-in forms display
- [ ] Search returns results (try "durga", "cricket")
- [ ] Header menus, mobile menu and footer links work; favicon shows
- [ ] Repeat on a phone (portrait) and a desktop browser
- [ ] Browser console shows no 404 errors (DevTools › Network, filter "404")
