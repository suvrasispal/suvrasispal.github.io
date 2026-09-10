/* Generates the three layered, editable Nexyra PSD templates using ag-psd
 * (reliable PSD writer with true nested layer groups) + node-canvas for
 * pixel-accurate drawing of each brand element. Mirrors the live HTML/CSS
 * templates' layout, colours and type so the PSD and the web editor match.
 *
 * These .psd files are already generated and committed under psd/ — you do
 * not need to run this to use the templates. Re-run it only if you want to
 * regenerate them (e.g. after editing the layout/copy below).
 *
 * Setup:
 *   npm install ag-psd canvas
 *   node generate_psds.js
 * (TTF builds of Hanken Grotesk are already included in ./fonts-ttf,
 * converted from the woff2 files in /assets/fonts with fonttools:
 *   python3 -c "from fontTools.ttLib import TTFont; f=TTFont('in.woff2'); f.flavor=None; f.save('out.ttf')"
 * — node-canvas's registerFont() needs ttf/otf, not woff2.)
 */
const { createCanvas, Image, registerFont } = require('canvas');
require('ag-psd/initialize-canvas');
const { writePsdBuffer } = require('ag-psd');
const fs = require('fs');
const path = require('path');

// Official horizontal logo lockup (real brand asset, supplied directly by
// the client) — node-canvas decodes a Buffer `src` synchronously, so this
// is ready to draw immediately.
const lockupImage = new Image();
lockupImage.src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'logos', 'nexyra-lockup-horizontal-white.png'));

const FONT_DIR = path.join(__dirname, 'fonts-ttf');
registerFont(path.join(FONT_DIR, 'hanken-300-normal.ttf'), { family: 'Hanken Grotesk', weight: '300' });
registerFont(path.join(FONT_DIR, 'hanken-400-normal.ttf'), { family: 'Hanken Grotesk', weight: '400' });
registerFont(path.join(FONT_DIR, 'hanken-500-normal.ttf'), { family: 'Hanken Grotesk', weight: '500' });
registerFont(path.join(FONT_DIR, 'hanken-600-normal.ttf'), { family: 'Hanken Grotesk', weight: '600' });
registerFont(path.join(FONT_DIR, 'hanken-700-normal.ttf'), { family: 'Hanken Grotesk', weight: '700' });

const OUT_DIR = __dirname; // writes Nexyra_*_Template.psd directly into psd/

// ---- Brand tokens -------------------------------------------------------
const C = {
  violetLight: '#A78BFA', violet: '#7C3AED', purple: '#9333EA',
  blue: '#2563EB', blueLight: '#3B82F6',
  ink: '#0A0A0F', inkRaised: '#1A1A24', slate: '#4A4A5A', slateLight: '#6B6B7B',
  line: '#E7E7EC', mist: '#F7F7F9', white: '#FFFFFF',
};

function blank(w, h) {
  const canvas = createCanvas(w, h);
  return { canvas, ctx: canvas.getContext('2d') };
}

function layer(name, w, h, draw, opts) {
  const { canvas, ctx } = blank(w, h);
  draw(ctx, canvas);
  return Object.assign({ name, top: 0, left: 0, canvas }, opts || {});
}

function group(name, children, opts) {
  return Object.assign({ name, children, opened: false }, opts || {});
}

function brandGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, C.violetLight);
  g.addColorStop(0.39, C.violet);
  g.addColorStop(1, C.blueLight);
  return g;
}

/** Draw the Nexyra monogram (N cut by a diagonal slice, with two detached
 * strokes continuing the cut beyond the counter) inside a 200x200 box
 * placed at (x,y) scaled to `size`. */
function drawMonogram(ctx, x, y, size, fillStyle) {
  const s = size / 200;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // clip out the diagonal cut band across the main N shape
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 200, 200);
  ctx.save();
  ctx.translate(112, 84); ctx.rotate((-32 * Math.PI) / 180);
  ctx.rect(-140, -11, 280, 22);
  ctx.restore();
  ctx.clip('evenodd');

  ctx.fillStyle = fillStyle;
  ctx.fillRect(40, 30, 24, 140);
  ctx.save();
  ctx.translate(100, 100); ctx.rotate((-32 * Math.PI) / 180);
  ctx.fillRect(-12, -120, 24, 240);
  ctx.restore();
  ctx.fillRect(136, 30, 24, 140);
  ctx.restore();

  ctx.fillStyle = fillStyle;
  ctx.save(); ctx.translate(172, 46); ctx.rotate((-32 * Math.PI) / 180); ctx.fillRect(-17, -7, 34, 14); ctx.restore();
  ctx.save(); ctx.translate(28, 154); ctx.rotate((-32 * Math.PI) / 180); ctx.fillRect(-17, -7, 34, 14); ctx.restore();

  ctx.restore();
}

function drawTracked(ctx, text, x, y, { font, size, weight = '400', color, tracking = 0, baseline = 'alphabetic' }) {
  ctx.font = `${weight} ${size}px "${font}"`;
  ctx.fillStyle = color;
  ctx.textBaseline = baseline;
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
  return cx - tracking;
}

function trackedWidth(ctx, text, { font, size, weight = '400', tracking = 0 }) {
  ctx.font = `${weight} ${size}px "${font}"`;
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tracking;
  return w - tracking;
}

function wrapText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function pill(ctx, x, y, w, h, fillStyle, strokeStyle, lineWidth) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
  if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth || 1.5; ctx.stroke(); }
}

function arrowIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.09; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size * 0.58, size * 0.08); ctx.lineTo(size, size / 2); ctx.lineTo(size * 0.58, size * 0.92); ctx.stroke();
  ctx.restore();
}

function accentStroke(ctx, cx, cy, w, h) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate((-32 * Math.PI) / 180);
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, C.violetLight); g.addColorStop(0.39, C.violet); g.addColorStop(1, C.blueLight);
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

function placeholderPhoto(ctx, w, h, label) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#2b2140'); g.addColorStop(0.5, '#3a2f5c'); g.addColorStop(1, '#1c2f52');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // subtle diagonal hatch so it doesn't read as a flat design colour
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  for (let i = -h; i < w; i += 28) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 15px "Hanken Grotesk"';
  ctx.textAlign = 'center';
  ctx.fillText(label || 'MEDIA PLACEHOLDER — replace this layer with a client photo', w / 2, h / 2);
  ctx.textAlign = 'left';
}

function logoGroup(ctx0, opts) {
  // returns a "Logo" group with a single "Lockup" sublayer — the official
  // horizontal lockup PNG, drawn at the same position/height used in the
  // live HTML template, so the PSD and the web editor match exactly.
  const { w, h, x, y, logoHeight = 28 } = opts;
  const lockup = layer('Lockup', w, h, (ctx) => {
    const scale = logoHeight / lockupImage.height;
    ctx.drawImage(lockupImage, x, y, lockupImage.width * scale, logoHeight);
  });
  return group('Logo', [lockup]);
}

function savePsd(filename, width, height, children) {
  const psd = { width, height, children: children.slice().reverse(), imageResources: {}, colorMode: 3 };
  const buffer = writePsdBuffer(psd, { generateThumbnail: true, invalidateTextLayers: false });
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log('wrote', outPath, buffer.byteLength, 'bytes');
}

/* =====================================================================
   FACEBOOK — 1200×630, full-bleed photo + bottom scrim
   ===================================================================== */
function buildFacebook() {
  const W = 1200, H = 630;
  const bg = layer('Ink Fill', W, H, (ctx) => { ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); });
  const photo = layer('Photo', W, H, (ctx) => placeholderPhoto(ctx, W, H));
  const backgroundGroup = group('Background', [photo, bg]);

  const scrimBottom = layer('Bottom Scrim', W, H, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(10,10,15,0)'); g.addColorStop(0.72, 'rgba(10,10,15,0.75)'); g.addColorStop(1, 'rgba(10,10,15,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  const scrimTop = layer('Top Scrim', W, H, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 220);
    g.addColorStop(0, 'rgba(10,10,15,0.55)'); g.addColorStop(1, 'rgba(10,10,15,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 220);
  });
  const overlayGroup = group('Overlay Elements', [scrimBottom, scrimTop]);

  // Center matches the live HTML's accent SVG (top:44,right:56,120x34 box,
  // viewBox 0 0 200 60, rect centered at local 150,30) — top-right corner,
  // well clear of the logo regardless of logo size.
  const accent = layer('Accent Stroke', W, H, (ctx) => accentStroke(ctx, 1114, 61, 80, 12));
  const shapesGroup = group('Shapes / Decorative Elements', [accent]);

  const logo = logoGroup(null, { w: W, h: H, x: 48, y: 36, logoHeight: 52 });

  const badge = layer('Eyebrow Badge', W, H, (ctx) => {
    const text = 'DIGITAL PRODUCT & TECHNOLOGY CONSULTING';
    ctx.font = '600 11px "Hanken Grotesk"';
    const tw = trackedWidth(ctx, text, { font: 'Hanken Grotesk', size: 11, weight: '600', tracking: 2.2 }) + 24;
    pill(ctx, 56, 374, tw, 30, null, 'rgba(255,255,255,0.55)', 1.3);
    drawTracked(ctx, text, 56 + 12, 374 + 19, { font: 'Hanken Grotesk', size: 11, weight: '600', color: C.white, tracking: 2.2 });
  });
  const headline = layer('Headline — "Designing What’s Next"', W, H, (ctx) => {
    drawTracked(ctx, 'Designing What’s Next', 56, 456, { font: 'Hanken Grotesk', size: 46, weight: '600', color: C.white, tracking: -1.1 });
  });
  const support = layer('Supporting Text', W, H, (ctx) => {
    // Wrapped to the same width as the live template's support-copy box —
    // deliberately generous vertical rhythm below so a 1- or 2-line wrap
    // never collides with the CTA button beneath it.
    const lines = wrapText(ctx, 'Transforming ideas into digital products, experiences and technology solutions.', 520, '400 18px "Hanken Grotesk"');
    lines.forEach((l, i) => { ctx.font = '400 18px "Hanken Grotesk"'; ctx.fillStyle = 'rgba(255,255,255,0.86)'; ctx.textBaseline = 'alphabetic'; ctx.fillText(l, 56, 494 + i * 26); });
  });
  const url = layer('URL Label', W, H, (ctx) => {
    drawTracked(ctx, 'NEXYRACONSULTING.CO.UK', W - 56 - 190, H - 48, { font: 'Hanken Grotesk', size: 11, weight: '600', color: 'rgba(255,255,255,0.55)', tracking: 1.6 });
  });
  const textGroup = group('Text', [badge, headline, support]);
  const brandGroup = group('Other Brand Elements', [url]);

  const ctaW = 176, ctaH = 44, ctaX = 56, ctaY = 538;
  const ctaBg = layer('CTA Background', W, H, (ctx) => pill(ctx, ctaX, ctaY, ctaW, ctaH, C.white));
  const ctaLabel = layer('CTA Label + Arrow', W, H, (ctx) => {
    ctx.font = '600 14px "Hanken Grotesk"'; ctx.fillStyle = C.ink; ctx.textBaseline = 'middle';
    ctx.fillText('See Our Work', ctaX + 20, ctaY + ctaH / 2 + 1);
    arrowIcon(ctx, ctaX + ctaW - 34, ctaY + ctaH / 2 - 8, 16, C.ink);
  });
  const ctaGroup = group('CTA', [ctaLabel, ctaBg]);

  savePsd('Nexyra_Facebook_Template.psd', W, H, [
    backgroundGroup, overlayGroup, shapesGroup, logo, textGroup, ctaGroup, brandGroup,
  ]);
}

/* =====================================================================
   INSTAGRAM — 1080×1080, photo top / ink panel bottom
   ===================================================================== */
function buildInstagram() {
  const W = 1080, H = 1080;
  const photoH = 660;
  const bg = layer('Ink Fill', W, H, (ctx) => { ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); });
  const photo = layer('Photo', W, H, (ctx) => placeholderPhoto(ctx, W, photoH));
  const backgroundGroup = group('Background', [photo, bg]);

  const scrimTop = layer('Top Scrim', W, H, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 170);
    g.addColorStop(0, 'rgba(10,10,15,0.62)'); g.addColorStop(1, 'rgba(10,10,15,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 170);
  });
  const scrimBottom = layer('Photo Bottom Scrim', W, H, (ctx) => {
    const g = ctx.createLinearGradient(0, photoH - 120, 0, photoH);
    g.addColorStop(0, 'rgba(10,10,15,0)'); g.addColorStop(1, 'rgba(10,10,15,0.5)');
    ctx.fillStyle = g; ctx.fillRect(0, photoH - 120, W, 120);
  });
  const divider = layer('Divider Bar', W, H, (ctx) => {
    const g = brandGradient(ctx, 0, photoH, W, photoH + 6);
    ctx.fillStyle = g; ctx.fillRect(0, photoH, W, 6);
  });
  const overlayGroup = group('Overlay Elements', [scrimTop, scrimBottom, divider]);

  const accent = layer('Accent Stroke', W, H, (ctx) => accentStroke(ctx, 1000, H - 56, 80, 12));
  const shapesGroup = group('Shapes / Decorative Elements', [accent]);

  const logo = logoGroup(null, { w: W, h: H, x: 40, y: 34, logoHeight: 48 });

  const panelY = photoH + 6;
  const badge = layer('Eyebrow Badge', W, H, (ctx) => {
    const text = 'DIGITAL & TECHNOLOGY CONSULTING';
    ctx.font = '600 11px "Hanken Grotesk"';
    const tw = trackedWidth(ctx, text, { font: 'Hanken Grotesk', size: 11, weight: '600', tracking: 2.2 }) + 24;
    pill(ctx, 56, panelY + 36, tw, 30, null, 'rgba(255,255,255,0.5)', 1.3);
    drawTracked(ctx, text, 56 + 12, panelY + 36 + 19, { font: 'Hanken Grotesk', size: 11, weight: '600', color: C.white, tracking: 2.2 });
  });
  const headline = layer('Headline — "Designing What’s Next"', W, H, (ctx) => {
    drawTracked(ctx, 'Designing What’s Next', 56, panelY + 128, { font: 'Hanken Grotesk', size: 40, weight: '600', color: C.white, tracking: -1.0 });
  });
  const support = layer('Supporting Text', W, H, (ctx) => {
    const lines = wrapText(ctx, 'Transforming ideas into digital products, experiences and technology solutions.', 820, '400 16px "Hanken Grotesk"');
    lines.forEach((l, i) => { ctx.font = '400 16px "Hanken Grotesk"'; ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fillText(l, 56, panelY + 168 + i * 24); });
  });
  const textGroup = group('Text', [badge, headline, support]);

  const ctaW = 176, ctaH = 44, ctaX = 56, ctaY = panelY + 232;
  const ctaBg = layer('CTA Background', W, H, (ctx) => pill(ctx, ctaX, ctaY, ctaW, ctaH, C.white));
  const ctaLabel = layer('CTA Label + Arrow', W, H, (ctx) => {
    ctx.font = '600 14px "Hanken Grotesk"'; ctx.fillStyle = C.ink; ctx.textBaseline = 'middle';
    ctx.fillText('See Our Work', ctaX + 20, ctaY + ctaH / 2 + 1);
    arrowIcon(ctx, ctaX + ctaW - 34, ctaY + ctaH / 2 - 8, 16, C.ink);
  });
  const ctaGroup = group('CTA', [ctaLabel, ctaBg]);

  savePsd('Nexyra_Instagram_Template.psd', W, H, [
    backgroundGroup, overlayGroup, shapesGroup, logo, textGroup, ctaGroup,
  ]);
}

/* =====================================================================
   LINKEDIN — 1200×627, professional split panel
   ===================================================================== */
function buildLinkedin() {
  const W = 1200, H = 627;
  const leftW = 540, mediaX = 544, mediaW = 656;

  const inkPanel = layer('Ink Fill (Left Panel)', W, H, (ctx) => { ctx.fillStyle = C.ink; ctx.fillRect(0, 0, leftW, H); });
  const photo = layer('Photo', W, H, (ctx) => {
    ctx.save(); ctx.translate(mediaX, 0);
    placeholderPhoto(ctx, mediaW, H);
    ctx.restore();
  });
  const backgroundGroup = group('Background', [photo, inkPanel]);

  const tint = layer('Photo Duotone Tint', W, H, (ctx) => {
    const g = ctx.createLinearGradient(mediaX, 0, mediaX + mediaW * 0.6, H);
    g.addColorStop(0, 'rgba(124,58,237,0.32)'); g.addColorStop(0.55, 'rgba(37,99,235,0.16)'); g.addColorStop(1, 'rgba(10,10,15,0.22)');
    ctx.fillStyle = g; ctx.fillRect(mediaX, 0, mediaW, H);
  });
  const edge = layer('Photo Edge Fade', W, H, (ctx) => {
    const g = ctx.createLinearGradient(mediaX, 0, mediaX + 110, 0);
    g.addColorStop(0, 'rgba(10,10,15,0.55)'); g.addColorStop(1, 'rgba(10,10,15,0)');
    ctx.fillStyle = g; ctx.fillRect(mediaX, 0, 110, H);
  });
  const overlayGroup = group('Overlay Elements', [tint, edge]);

  const divider = layer('Divider Line', W, H, (ctx) => {
    const g = brandGradient(ctx, leftW, 0, leftW + 4, H);
    ctx.fillStyle = g; ctx.fillRect(leftW, 0, 4, H);
  });
  const accent = layer('Accent Stroke', W, H, (ctx) => accentStroke(ctx, W - 100, H - 48, 80, 12));
  const shapesGroup = group('Shapes / Decorative Elements', [accent, divider]);

  const logo = logoGroup(null, { w: W, h: H, x: 48, y: 44, logoHeight: 48 });

  const segY = 118;
  const segments = layer('Segmented Control (Strategy / Design / Build)', W, H, (ctx) => {
    const labels = [['Strategy', false], ['Design', true], ['Build', false]];
    let sx = 48;
    labels.forEach(([text, active]) => {
      ctx.font = '600 11px "Hanken Grotesk"';
      const tw = trackedWidth(ctx, text.toUpperCase(), { font: 'Hanken Grotesk', size: 11, weight: '600', tracking: 1.6 }) + 20;
      pill(ctx, sx, segY, tw, 28, active ? C.white : null, active ? null : 'rgba(255,255,255,0.35)', 1.2);
      drawTracked(ctx, text.toUpperCase(), sx + 10, segY + 18, { font: 'Hanken Grotesk', size: 11, weight: '600', color: active ? C.ink : 'rgba(255,255,255,0.85)', tracking: 1.6 });
      sx += tw + 8;
    });
  });
  const brandGroup = group('Other Brand Elements', [segments]);

  const headline = layer('Headline — "Designing What’s Next"', W, H, (ctx) => {
    drawTracked(ctx, 'Designing What’s Next', 48, 300, { font: 'Hanken Grotesk', size: 38, weight: '600', color: C.white, tracking: -0.9 });
  });
  const support = layer('Supporting Text', W, H, (ctx) => {
    const lines = wrapText(ctx, 'Transforming ideas into digital products, experiences and technology solutions.', 440, '400 16px "Hanken Grotesk"');
    lines.forEach((l, i) => { ctx.font = '400 16px "Hanken Grotesk"'; ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fillText(l, 48, 336 + i * 24); });
  });
  const url = layer('URL Label', W, H, (ctx) => {
    drawTracked(ctx, 'NEXYRACONSULTING.CO.UK', 48, H - 44, { font: 'Hanken Grotesk', size: 11, weight: '600', color: 'rgba(255,255,255,0.5)', tracking: 1.6 });
  });
  const textGroup = group('Text', [headline, support, url]);

  const ctaW = 176, ctaH = 44, ctaX = 48, ctaY = 410;
  const ctaBg = layer('CTA Background', W, H, (ctx) => pill(ctx, ctaX, ctaY, ctaW, ctaH, C.white));
  const ctaLabel = layer('CTA Label + Arrow', W, H, (ctx) => {
    ctx.font = '600 14px "Hanken Grotesk"'; ctx.fillStyle = C.ink; ctx.textBaseline = 'middle';
    ctx.fillText('See Our Work', ctaX + 20, ctaY + ctaH / 2 + 1);
    arrowIcon(ctx, ctaX + ctaW - 34, ctaY + ctaH / 2 - 8, 16, C.ink);
  });
  const ctaGroup = group('CTA', [ctaLabel, ctaBg]);

  savePsd('Nexyra_LinkedIn_Template.psd', W, H, [
    backgroundGroup, overlayGroup, shapesGroup, logo, brandGroup, textGroup, ctaGroup,
  ]);
}

buildFacebook();
buildInstagram();
buildLinkedin();
