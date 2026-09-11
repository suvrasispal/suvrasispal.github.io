/**
 * The Pint Bar — Inventory service
 * ---------------------------------------------------------------
 * Serves the web app and owns the Excel workbook. The workbook is the
 * SINGLE SOURCE OF TRUTH — browsers only display and edit what it holds.
 *
 *   GET  /api/inventory   -> { products, txns, rev, file, exists }
 *   POST /api/inventory   <- { products, txns, rev }
 *                         -> { products, txns, rev, file }   (authoritative)
 *
 * `rev` is the workbook's modification time. A POST carrying a stale rev is
 * rejected with 409 so one device cannot silently overwrite another's change;
 * the app re-reads and shows the newer data instead.
 *
 * Run:  npm install && npm start     then open http://localhost:4000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const PORT = process.env.PORT || 4000;
const PUBLIC_DIR = process.env.PINT_PUBLIC_DIR
  ? path.resolve(process.env.PINT_PUBLIC_DIR)
  : __dirname;

// Never serve these over HTTP, even though they sit in the served folder.
const PRIVATE = ['server.js', 'package.json', 'package-lock.json', 'node_modules', 'data', 'src', 'README.md'];

const DATA_DIR = process.env.PINT_DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'inventory.xlsx');
const SEED = path.join(DATA_DIR, 'inventory.seed.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

// ── Excel <-> app model ────────────────────────────────────────────

function revOf() {
  try { return Math.round(fs.statSync(FILE).mtimeMs); } catch (e) { return 0; }
}

function readWorkbook() {
  if (!fs.existsSync(FILE)) {
    return { products: [], txns: [], rev: 0, file: path.basename(FILE), exists: false };
  }
  const wb = XLSX.readFile(FILE);

  const invSheet = wb.Sheets['Inventory'] || wb.Sheets[wb.SheetNames[0]];
  const products = XLSX.utils.sheet_to_json(invSheet || {})
    .filter(r => r.Product)
    .map((r, i) => ({
      id: String(r.ID || 'P' + String(i + 1).padStart(3, '0')),
      name: String(r.Product),
      category: String(r.Category || 'Other'),
      unit: String(r.Unit || 'Unit'),
      stock: Number(r['Current Stock']) || 0,
      threshold: Number(r['Low Stock Threshold']) || 0,
      notes: String(r.Notes || '')
    }));

  const txSheet = wb.Sheets['Transactions'];
  const txns = txSheet
    ? XLSX.utils.sheet_to_json(txSheet)
        .filter(r => r.Product)
        .map(r => ({
          iso: '',
          date: String(r.Date || ''),
          time: String(r.Time || ''),
          productId: String(r['Product ID'] || ''),
          product: String(r.Product || ''),
          type: String(r['Transaction Type'] || 'Adjustment'),
          qty: Number(r.Quantity) || 0,
          prev: Number(r['Previous Stock']) || 0,
          next: Number(r['New Stock']) || 0,
          reason: String(r.Reason || ''),
          staff: String(r.Staff || '')
        }))
        .reverse() // the app holds newest-first
    : [];

  return { products, txns, rev: revOf(), file: path.basename(FILE), exists: true };
}

// Guard against a malformed payload wiping a good workbook.
function sane(products) {
  return Array.isArray(products) && products.every(p => p && typeof p.name === 'string' && p.name.length);
}

// Same product id, or same name within the same category, is the same product.
function dedupe(products) {
  const byId = new Map();
  const byName = new Map();
  const out = [];
  for (const p of products) {
    const nameKey = (p.category + '|' + p.name).toLowerCase().replace(/\s+/g, ' ').trim();
    const hit = byId.get(p.id) || byName.get(nameKey);
    if (hit) { Object.assign(hit, p); continue; }   // last write wins, one row
    const row = Object.assign({}, p);
    out.push(row);
    byId.set(row.id, row);
    byName.set(nameKey, row);
  }
  return out;
}

function writeWorkbook(products, txns) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  // Keep a dated backup of the previous state before overwriting.
  if (fs.existsSync(FILE)) {
    const day = new Date().toISOString().slice(0, 10);
    const dest = path.join(BACKUP_DIR, 'inventory-' + day + '.xlsx');
    if (!fs.existsSync(dest)) fs.copyFileSync(FILE, dest);
  }

  const wb = XLSX.utils.book_new();

  const inv = products.map(p => ({
    ID: p.id,
    Product: p.name,
    Category: p.category,
    Unit: p.unit,
    'Current Stock': p.stock,
    'Low Stock Threshold': p.threshold,
    Notes: p.notes || ''
  }));

  const tx = (txns || []).slice().reverse().map(t => ({
    Date: t.date,
    Time: t.time,
    'Product ID': t.productId,
    Product: t.product,
    'Transaction Type': t.type,
    Quantity: t.qty,
    'Previous Stock': t.prev,
    'New Stock': t.next,
    Reason: t.reason || '',
    Staff: t.staff || ''
  }));

  const emptyTx = [{
    Date: '', Time: '', 'Product ID': '', Product: '', 'Transaction Type': '',
    Quantity: '', 'Previous Stock': '', 'New Stock': '', Reason: '', Staff: ''
  }];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inv.length ? inv : [{
    ID: '', Product: '', Category: '', Unit: '', 'Current Stock': '', 'Low Stock Threshold': '', Notes: ''
  }]), 'Inventory');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tx.length ? tx : emptyTx), 'Transactions');

  // Write to a temp file then rename, so a crash cannot truncate the workbook.
  const tmp = FILE + '.tmp';
  XLSX.writeFile(wb, tmp);
  fs.renameSync(tmp, FILE);
}

// Serialise writes — two devices saving at once must not interleave.
let chain = Promise.resolve();
function queue(fn) {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
}

// ── static files ───────────────────────────────────────────────────

function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const safe = path.normalize(rel).replace(/^(\.\.[\/\\])+/, '');
  const top = safe.split(/[\/\\]/).filter(Boolean)[0] || '';
  const file = path.join(PUBLIC_DIR, safe);
  if (PRIVATE.indexOf(top) !== -1 || !file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(file).pipe(res);
}

// ── server ─────────────────────────────────────────────────────────

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/inventory' || url === '/api/inventory/') {
    if (req.method === 'GET') {
      try { json(res, 200, readWorkbook()); }
      catch (e) { json(res, 500, { error: String(e.message || e) }); }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 2e7) req.destroy(); });
      req.on('end', () => {
        queue(() => {
          try {
            const data = JSON.parse(body || '{}');
            if (!sane(data.products)) throw new Error('products array required, each with a name');

            const current = revOf();
            if (current && typeof data.rev === 'number' && data.rev && data.rev !== current) {
              // Someone else saved first. Hand back the newer truth; the app adopts it.
              const latest = readWorkbook();
              json(res, 409, Object.assign({ error: 'The workbook changed on another device. Your view has been refreshed — please redo that change.' }, latest));
              return;
            }

            const products = dedupe(data.products);
            writeWorkbook(products, data.txns || []);
            const saved = readWorkbook();
            console.log(new Date().toISOString() + '  saved ' + products.length + ' products, ' + (data.txns || []).length + ' movements');
            json(res, 200, saved);
          } catch (e) {
            json(res, 400, { error: String(e.message || e) });
          }
        });
      });
      return;
    }

    res.writeHead(405).end();
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // First run: build the workbook from the shipped starting inventory so the
  // app is never blank. Once inventory.xlsx exists, the seed is ignored.
  if (!fs.existsSync(FILE) && fs.existsSync(SEED)) {
    try {
      const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
      if (sane(seed.products)) {
        writeWorkbook(dedupe(seed.products), []);
        console.log('  Created ' + path.basename(FILE) + ' from the starting inventory (' + seed.products.length + ' products).');
      }
    } catch (e) {
      console.log('  Could not read the starting inventory: ' + e.message);
    }
  }

  console.log('');
  console.log('  The Pint Bar — Inventory');
  console.log('  ------------------------');
  console.log('  App:      http://localhost:' + PORT);
  console.log('  Serving:  ' + PUBLIC_DIR);
  console.log('  Workbook: ' + FILE);
  console.log('  Backups:  ' + BACKUP_DIR);
  console.log('');
  if (!fs.existsSync(FILE)) {
    console.log('  No workbook and no starting inventory found. Open the app and use');
    console.log('  "Publish starting inventory", or drop an inventory.xlsx into data/.');
    console.log('');
  }
});
