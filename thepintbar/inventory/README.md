# The Pint Bar — Inventory Management

A branded stock-control interface for the bar, sitting on top of an Excel workbook.

---

## What's in this package

```
deploy/
├── index.html             ← THE APPLICATION. Self-contained, open it directly.
├── assets/                Brand assets
│   ├── lockup-horizontal.svg           cream / light grounds
│   ├── lockup-horizontal-reversed.svg  dark green grounds (app header)
│   ├── mark.svg                        tankard mark, full colour
│   ├── mark-cream.svg                  tankard mark, reversed
│   └── favicon.svg
├── server.js              Local service: serves the app, owns the .xlsx
├── package.json           One dependency (xlsx)
├── src/                   Editable source, for future changes
│   ├── index.dc.html      The application source
│   ├── support.js         Runtime it loads
│   └── assets/            Same brand assets, for the source build
├── data/                  Created on first run
│   ├── inventory.xlsx     The live workbook
│   └── backups/           A dated copy before each day's first write
└── README.md              This file
```

`index.html` needs no build step, no internet connection and no server — every
script, style and logo is inlined, so it runs from a file:// path, a USB stick
or any static host on its own. The server adds automatic Excel read/write.

### index.html vs src/

`index.html` is the built, flattened application — what you deploy.

`src/` is the same application unflattened. Edit `src/index.dc.html` and it runs
directly in a browser as long as `support.js` and `assets/` sit beside it; that
is the copy to hand to a developer. Rebuilding the flattened root `index.html`
afterwards is an inlining step — or just serve `src/` as-is with
`PINT_PUBLIC_DIR=./src npm start`.

---

## Option A — Run with the local service (recommended for the bar)

Full automatic Excel persistence. Every stock movement writes straight into
`data/inventory.xlsx`.

**One-time setup on the bar's computer**

1. Install Node.js 18 or newer — <https://nodejs.org> (LTS installer).
2. Open Terminal (Mac) or Command Prompt (Windows) in this `deploy` folder.
3. Run:

   ```
   npm install
   npm start
   ```

4. Open <http://localhost:4000>.

**Daily use** — run `npm start` and leave the window open; staff use the browser.

To start it automatically at login, use a Windows Scheduled Task, a macOS Login
Item, or `pm2 start server.js --name pintbar` on either.

**Using an existing workbook** — drop it in as `data/inventory.xlsx` before
starting, with sheets named `Inventory` and `Transactions` (columns below).

**Storing the workbook elsewhere** (a shared drive, Dropbox, OneDrive):

```
PINT_DATA_DIR="/path/to/folder" npm start        # Mac / Linux
set PINT_DATA_DIR=D:\PintBar && npm start        # Windows
```

**Other devices on the bar's wi-fi** — find the computer's local IP and open
`http://192.168.x.x:4000` on a tablet or phone. The service listens on all
interfaces; keep it on the bar's private network, it has no authentication.

---

## Option B — Run the single file, no install

Double-click `index.html`. Everything works; data lives in that browser.

For Excel, the app gives you two routes in **Settings**:

- **Create & link file / Open local .xlsx** — Chrome or Edge on desktop only.
  The browser asks permission once, then every movement writes into the chosen
  workbook on disk. Permission is re-granted each new session.
- **Import .xlsx / Export .xlsx** — works in every browser.

Serve it from any static host (Netlify, an internal web server, a USB stick) and
it behaves the same — minus automatic file writing, which needs Option A.

---

## Excel structure

### Sheet: `Inventory`

| ID | Product | Category | Unit | Current Stock | Low Stock Threshold | Notes |
|----|---------|----------|------|--------------:|--------------------:|-------|
| P001 | Birra Moretti | Draught | Keg | 0 | 1 | |

### Sheet: `Transactions`

| Date | Time | Product ID | Product | Transaction Type | Quantity | Previous Stock | New Stock | Reason | Staff |
|------|------|------------|---------|------------------|---------:|---------------:|----------:|--------|-------|
| 11 Sep 2026 | 19:42 | P010 | Budweiser | Sale | -2 | 5 | 3 | | Bar staff |

Transaction types: `Sale`, `Stock Added`, `Adjustment`, `Product Added`,
`Product Deleted`. Quantity is signed — negative removes stock.

You can edit the workbook in Excel while the service is stopped; it is read back
on the next start. Avoid editing it in Excel *while* the service is running —
Excel locks the file and the next write will fail.

---

## The data layer

The interface never touches storage directly. One layer resolves, in order:

1. **Local service** — if `GET /api/inventory` answers, it owns the data.
2. **Linked file handle** — a workbook the user picked via the browser.
3. **Browser storage** — the fallback, with manual import/export.

Swapping Excel for Postgres, MySQL or a cloud API later means rewriting
`readWorkbook()` / `writeWorkbook()` in `server.js`. The front end is unchanged:
it posts the same `{ products, txns }` shape.

### API

```
GET  /api/inventory   →  { products: [...], txns: [...], file: "inventory.xlsx" }
POST /api/inventory   ←  { products: [...], txns: [...] }
```

---

## Data safety

- Stock can never go negative — the movement is blocked and the user warned.
- Deleting a product asks for confirmation; its movement history is kept.
- A dated backup is written to `data/backups/` before the first write each day.
- Writes go to a temp file and are renamed, so an interrupted write cannot
  truncate the workbook.

**Back up `data/` to a drive or cloud folder.** The backups folder protects
against bad edits, not against a failed hard disk.

---

## Current stock data

Loaded from the list supplied on 11 Sep 2026: 16 draught lines and 40 spirits,
wines and other drinks. Everything not on that list is set to 0.

Items with an amber ⚑ on their row need a decision:

- **Johnnie Walker Double Black** — no quantity was supplied; it shows 0 and is
  excluded from the out-of-stock count until someone counts it.
- **Crodino (Pink)** — could not be confirmed as an official variant (Crodino
  sells as Biondo and Rosso).
- **Schweppes** — no variant stated (tonic, slimline, lemonade, ginger ale).
- **Sambuca Apple / Black / White, Tequila Blanco, Tequila Oro, Dark Rum** — no
  brand stated.
- **Disaronno 111, Sambuca Black 112, Rosé Wine 1111** — entered as supplied,
  but the figures look like typing errors; please confirm.

Hennessy and Rémy Martin are recorded without an expression (VS, VSOP) because
none was given.

---

## Resetting

**Settings → Reset demo data** restores the supplied stock list and clears all
recorded movements. Export first if you want a copy.
