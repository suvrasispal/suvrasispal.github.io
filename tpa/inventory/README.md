# The Pint Bar — Inventory Management

A branded stock-control application that uses an Excel workbook as its
database. No install, no server, no npm.

---

## What's in this package

```
The Pint Bar Inventory/
├── index.html            ← THE APPLICATION. Open this.
├── data/
│   └── inventory.xlsx    ← THE DATABASE. 82 products, ready to use.
├── assets/               Brand assets
│   ├── lockup-horizontal.svg           cream / light grounds
│   ├── lockup-horizontal-reversed.svg  dark green grounds (app header)
│   ├── mark.svg                        tankard mark, full colour
│   ├── mark-cream.svg                  tankard mark, reversed
│   └── favicon.svg
├── src/                  Editable source, for future changes
│   ├── index.dc.html
│   ├── support.js
│   └── assets/
└── README.md             This file
```

---

## Setting it up — once, takes ten seconds

1. Open `index.html` in **Google Chrome** or **Microsoft Edge** on a desktop
   or laptop.
2. Press **Connect Excel file** in the top bar (it also lives in Settings).
3. Choose `data/inventory.xlsx` from this folder — or any workbook in a
   OneDrive, Dropbox or network folder.
4. When the browser asks whether to let the site save changes, choose
   **Save changes** / **Allow**.

The button turns into a green **Live · inventory.xlsx** indicator. The dashboard
now shows the stock held in that file, and every change you make is written
straight back into it. **Change file** next to it re-points the app at a
different workbook.

## Using it from then on

Open `index.html` and it reconnects to the same workbook on its own. You never
have to find the file again.

If the browser has forgotten the permission — usually after a full restart — the
top bar shows an amber **Needs reconnecting** state with a **Reconnect Excel**
button. One click and you are back. The four states are:

- **Green, "Live · inventory.xlsx"** — connected and saving to the file. Click
  it to re-read the workbook immediately.
- **Amber, "Needs reconnecting"** — one click to re-grant permission.
- **Amber, "Workbook unreachable"** — the file is locked or moved (see below).
- **Grey, "Refresh"** — no workbook connected; data is held in this browser.

---

## How it works

The workbook is the single source of truth. The browser does not keep its own
copy of the inventory.

- **On open** the app reads `inventory.xlsx` and displays what it holds.
- **On every change** — add stock, record a sale, adjust, add, edit or delete a
  product — it writes the whole workbook back, then reads it again, so the
  screen always matches the file.
- **Every five seconds** it re-reads the file, so a change made in Excel, or by
  another computer on a synced folder, appears on its own.
- **Before each save** it checks the file has not changed since it was last
  read. If it has, your view refreshes to the newer data instead of overwriting
  it, and you are asked to redo that one change.

The connection is remembered by the browser itself, not by a cookie or local
storage, so clearing browsing data does not lose your inventory — the data is
in the Excel file, not in the browser.

---

## Sharing between computers

Put the package in a folder that syncs — **OneDrive, Dropbox, Google Drive**, or
a **shared network drive** — and connect each computer to its own path to that
same file.

Bartender A saves → the folder syncs → Bartender B's screen picks it up within
a few seconds.

Two caveats worth knowing:

- Sync services are not instant. If two people change stock in the same few
  seconds on different machines, the sync service may keep both versions as
  conflicted copies. In practice, at one bar with one till computer, this does
  not arise.
- Each computer connects to the file once, the first time.

---

## Which browsers work

| Browser | Reads and writes the file |
|---|---|
| Chrome, Edge, Opera (desktop) | Yes |
| Brave, Arc, other Chromium desktop browsers | Yes |
| Safari | No |
| Firefox | No |
| Any phone or tablet browser | No |

This is a browser security rule, not a limitation of the application: only
Chromium desktop browsers allow a web page to write to a chosen local file.

In an unsupported browser the app still runs and shows the starting stock, and
you can move data in and out with **Import .xlsx** and **Export .xlsx** in
Settings — but it will not save to the file automatically.

---

## Prices, stock value and batches

Money is tracked properly, not as a single price field on the product.

- **Every purchase opens its own batch.** Add ten bottles at £30 and ten more
  at £32 and both records stand — `B0001 · 10 @ £30`, `B0002 · 10 @ £32`.
  A later price never overwrites an earlier one.
- **Unit purchase price is required.** New products and every *Add stock* refuse
  to save without it; every *Record sale* refuses to save without a sale price.
- **Stock leaves oldest-first (FIFO).** Sell 12 from the example above and the
  app takes 10 from `B0001` and 2 from `B0002`, leaving 0 and 8, and records
  the exact cost of the goods sold — never an average price.
- **Stock value** = remaining quantity × that batch's own price, summed. It is
  shown on the dashboard, on every inventory row, in the Manage panel, in all
  reports and in the workbook.
- **Purchase cost and sales income stay separate** — stock expenditure, cost of
  goods sold, sales income and gross margin (income − cost of goods) are shown
  as four distinct figures, so nobody reads a delivery as takings.

### Stock that has no price yet

Existing stock keeps its quantity exactly as it is and becomes an opening batch
with no price. Those products are flagged **Price required** — an amber banner
at the top, a red badge on the row, a **Price req** filter tab in Inventory, and
a **Set unit price** button on the row and in Manage. Entering the price writes
it into that existing batch; the quantity is never touched.

---

## Version history & backups

Every save keeps a complete copy of the workbook — the data *and* the `.xlsx`
bytes — so an accidental or wrong overwrite is always recoverable.

A version is kept automatically when the workbook is opened, when any change is
saved, when the file is found to have been edited outside the app, when a
workbook is imported, and before a restore. Nothing is ever replaced without
the outgoing state being stored first. `Back up now` adds one on demand.

The **Versions** tab lists them newest first, with the date and time, what
caused the save, the staff name, and the products / units / stock value each
one holds. The newest is badged **Current version**; any earlier one can be:

- **Restored** — replaces the current inventory and rewrites the workbook. The
  data being replaced is saved as a new version first, so a restore can itself
  be undone.
- **Downloaded** as a standalone `.xlsx` — useful for inspecting an old state
  in Excel without touching the live file.

The newest 40 versions are kept; older ones drop off. Backups live in the
browser's IndexedDB alongside the workbook link, so they survive refreshes,
browser restarts and future sessions. They are per-browser, not stored in the
workbook — keep the workbook itself in a synced folder for off-machine safety.

---

## Reports

The **Reports** tab covers a **week**, **month**, **quarter** or a **custom
date range**, and offers three views of the selected period:

- **Movement** — opening stock, added, sold, closing and stock value per product.
- **Stock & purchases** — every price batch: product, date added, batch, quantity,
  unit purchase price, total purchase cost, quantity remaining and remaining
  value, with total expenditure for the period.
- **Sales** — product, date, quantity sold, sale unit price, sales income, cost
  of goods sold, margin and the batch the stock came from, with total income for
  the period.

Above them sit the period totals: stock expenditure, sales income, cost of goods
sold, gross margin and current stock value. The dashboard carries the same
figures for the current month alongside the live inventory totals.

Figures are derived from the Transactions and Stock Batches sheets, so they stay
correct however the stock was changed.

**Download PDF** saves a branded A4 report straight to your downloads folder —
no print dialog. It carries the Pint Bar lockup, the reporting period, the
summary, the money summary, the table for whichever report view you are on, and
the generation date, and paginates cleanly if the table runs past one page.

---

## Using it on a phone or tablet

The interface is built mobile-first. On narrow screens the inventory table
becomes cards, controls and tap targets grow, and the navigation scrolls
sideways rather than squashing — the page itself never scrolls horizontally.

Stock steppers, **Sale** and **Manage** sit on one row per product, so a
bartender can adjust stock with one thumb.

Note that a phone or tablet browser **cannot** write to the Excel file (see the
browser table above). Use a tablet for viewing and for recording sales into a
workbook on a synced folder from a connected desktop, or connect the workbook on
a Chromium desktop browser.

---

## Excel structure

Three sheets. Keep the names and the column headers as they are.

### Sheet: `Inventory`

| ID | Product | Category | Unit | Current Stock | Low Stock Threshold | Unit Cost | Sale Price | Stock Value | Notes |
|----|---------|----------|------|--------------:|--------------------:|----------:|-----------:|------------:|-------|
| P001 | Birra Moretti | Draught | Keg | 0 | 1 | 92.00 | | 0.00 | |

`Unit Cost` is the most recent purchase price, for reference. The authoritative
prices live in the batch sheet.

### Sheet: `Stock Batches`

| Batch ID | Date | ISO | Product ID | Product | Qty Added | Qty Remaining | Unit Cost | Batch Cost | Remaining Value | Note |
|----------|------|-----|------------|---------|----------:|--------------:|----------:|-----------:|----------------:|------|
| B0001 | 16 Sep 2026 | … | P018 | Jack Daniel's Old No.7 | 10 | 6 | 30.00 | 300.00 | 180.00 | Delivery received |
| B0002 | 20 Sep 2026 | … | P018 | Jack Daniel's Old No.7 | 10 | 10 | 32.00 | 320.00 | 320.00 | Delivery received |

This sheet is the permanent price history. Each row keeps its own price for
good; nothing rewrites an earlier batch when a new delivery arrives at a new
price. A blank `Unit Cost` is stock awaiting a price and shows as
**Price required** in the app.

### Sheet: `Transactions`

| Date | Time | ISO | Product ID | Product | Transaction Type | Quantity | Previous Stock | New Stock | Unit Price | Total Value | Cost of Goods | Batch | Reason | Staff |
|------|------|-----|------------|---------|------------------|---------:|---------------:|----------:|-----------:|------------:|--------------:|-------|--------|-------|
| 16 Sep 2026 | 19:42 | … | P010 | Budweiser | Sale | -2 | 5 | 3 | 4.50 | 9.00 | 3.60 | B0006 × 2 | | Bar staff |

Transaction types: `Sale`, `Stock Added`, `Adjustment`, `Product Added`,
`Product Deleted`, `Price Set`. Quantity is signed — negative removes stock.
On a sale, `Unit Price` and `Total Value` are the sale price and income, and
`Cost of Goods` is what those units cost from the batches they came from.

### Opening an older workbook

A workbook saved by an earlier version has no `Stock Batches` sheet. Nothing is
lost: the app keeps every quantity, turns each product's current stock into an
opening batch, takes a price from a `Unit Cost` column if one exists, flags the
rest as **Price required**, and writes the new sheet on the next save. The
`data/inventory.xlsx` in this package is such a workbook — it upgrades itself
the first time you save into it.

You can edit the workbook in Excel directly. The app picks the changes up
within a few seconds.

**Close it in Excel while the bar is trading.** Excel locks the file, and saves
will fail until it is closed — the app tells you rather than losing the change.

---

## Backups

The application does not make backups of its own; the workbook is a normal file,
so back it up the way you back up any other:

- Keep it in OneDrive, Dropbox or Google Drive — all three keep version history
  and can restore an earlier copy.
- Or use **Export .xlsx** in Settings to save a dated snapshot before a stock
  take.

---

## Current stock data

`data/inventory.xlsx` holds the full product list — 82 products, 1,482 units.
The 56 lines supplied on 13 Sep 2026 carry their stated quantities; the
remaining lines are earlier catalogue entries kept at 0 so they can be restocked
without being re-added.

Items with an amber ⚑ on their row need a decision:

- **Crodino (Pink)** — could not be confirmed as an official variant (Crodino
  sells as Biondo and Rosso).
- **Schweppes** — no variant stated (tonic, slimline, lemonade, ginger ale).
- **Sambuca Apple / Black / White, Tequila Blanco, Tequila Oro, Dark Rum** — no
  brand stated.
- **Disaronno 111, Sambuca Black 112, Rosé Wine 1111** — entered as supplied,
  but the figures look like typing errors; please confirm.

Hennessy and Rémy Martin are recorded without an expression (VS, VSOP), and
Malbec, Shiraz and Croft Port without a producer or bottling, because none was
given.

---

## Data safety

- Stock can never go negative — the movement is blocked and the user warned.
- Deleting a product asks for confirmation; its movement history is kept.
- A change that cannot be written to the file is refused and reported, not
  silently kept in the browser.
- A save is rejected if the file changed since it was read, so one computer
  cannot overwrite another's newer data.
- Duplicate products collapse automatically — same ID, or same name within the
  same category.
- Historical purchase prices are never overwritten. A new price is always a new
  batch, so past cost and past valuation stay auditable.
- Prices can be corrected at any time. Click an item's price in the inventory
  (or "Edit prices" under Manage) to see the current purchase and sale price
  and change or clear either one independently. A purchase-price fix applies
  to the latest batch only, or to all stock on the shelf if you choose; other
  products and already-recorded sales are never changed. Every change is
  logged in History as a "Price Change".
- Prices are optional everywhere. Products, stock additions, adjustments and
  sales can all be saved with the price left blank; the item is flagged
  "No price" and simply isn't counted in stock value or income until a price
  is added.
- Quantities are never altered when a missing price is added.

---

## Settings

- **Default low-stock threshold** — used for new products.
- **Sale price** on a product is remembered and pre-filled on the next sale; the
  sale price on each individual sale is still yours to change.
- **Staff name** — recorded against every movement in the Transactions sheet.
- **Restore starting stock list** — rewrites the inventory back to the full
  82-line list and clears all movements. This overwrites the workbook. Export
  first.

---

## If you outgrow a single file

The application reads and writes through one small data layer. Replacing Excel
with SQLite or a hosted database later means changing where that layer reads
and writes — the interface, the screens and the workflow stay exactly as they
are.
