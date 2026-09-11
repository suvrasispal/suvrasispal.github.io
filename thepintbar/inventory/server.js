/**
 * The Pint Bar — Inventory local service
 * ---------------------------------------------------------------
 * Serves the web app and owns the Excel workbook on disk.
 *
 *   GET  /api/inventory   -> { products, txns, file }   (reads data/inventory.xlsx)
 *   POST /api/inventory   <- { products, txns }         (rewrites the workbook)
 *
 * The front end calls these automatically on load and on every stock
 * movement. If the service is not running, the app falls back to
 * browser storage with manual Import / Export.
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
  : path.join(__dirname, 'public');
const DATA_DIR = process.env.PINT_DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'inventory.xlsx');
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

function readWorkbook() {
  if (!fs.existsSync(FILE)) return { products: [], txns: [], file: 'inventory.xlsx' };
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
        .reverse() // app holds newest-first
    : [];

  return { products, txns, file: path.basename(FILE) };
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

  const empty = [{
    Date: '', Time: '', 'Product ID': '', Product: '', 'Transaction Type': '',
    Quantity: '', 'Previous Stock': '', 'New Stock': '', Reason: '', Staff: ''
  }];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inv.length ? inv : [{
    ID: '', Product: '', Category: '', Unit: '', 'Current Stock': '', 'Low Stock Threshold': '', Notes: ''
  }]), 'Inventory');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tx.length ? tx : empty), 'Transactions');

  // Atomic-ish write: temp file then rename, so a crash can't truncate the book.
  const tmp = FILE + '.tmp';
  XLSX.writeFile(wb, tmp);
  fs.renameSync(tmp, FILE);
}

// ── static files ───────────────────────────────────────────────────

function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = path.join(PUBLIC_DIR, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

// ── server ─────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/inventory' || url === '/api/inventory/') {
    if (req.method === 'GET') {
      try {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(readWorkbook()));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 8e6) req.destroy(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          if (!Array.isArray(data.products)) throw new Error('products array required');
          writeWorkbook(data.products, data.txns || []);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, file: path.basename(FILE), written: data.products.length }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(e.message || e) }));
        }
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
  console.log('');
  console.log('  The Pint Bar — Inventory');
  console.log('  ------------------------');
  console.log('  App:      http://localhost:' + PORT);
  console.log('  Workbook: ' + FILE);
  console.log('  Backups:  ' + BACKUP_DIR);
  console.log('');
  if (!fs.existsSync(FILE)) {
    console.log('  No workbook yet — it is created the first time stock changes,');
    console.log('  or drop an existing inventory.xlsx into the data folder.');
    console.log('');
  }
});
