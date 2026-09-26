// Bakes a TTF pixel font into a crisp 1-bit bitmap font (PNG + BMFont XML) that Phaser loads natively.
// usage: node scripts/bake-font.mjs <ttf> <px> <outName> [preview.png]
import { launch } from './browser.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const [ttf, pxArg, outName, preview, downArg = '1', oxArg = '0', oyArg = '0'] = process.argv.slice(2);
const ox = +oxArg, oy = +oyArg;
const px = +pxArg;
const down = +downArg; // render big, then shrink by this factor (for fonts drawn on a 2x pixel grid)
const b64 = (await readFile(ttf)).toString('base64');
const browser = await launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
const result = await page.evaluate(async ({ b64, px, preview, down, ox, oy }) => {
  const ff = new FontFace('Bake', `url(data:font/ttf;base64,${b64})`);
  await ff.load(); document.fonts.add(ff);
  const chars = [];
  for (let c = 32; c < 127; c++) chars.push(String.fromCharCode(c));
  chars.push('é', 'è', 'à', 'ç', '…', '♥', '•', '→', '←', '↑', '↓', '’', '“', '”', '♪', '▼', '★');
  const cellW = px * 2, cellH = Math.ceil(px * 1.6);
  const cols = 16, rows = Math.ceil(chars.length / cols);
  const cv = document.createElement('canvas');
  cv.width = cols * cellW; cv.height = rows * cellH;
  const ctx = cv.getContext('2d');
  ctx.font = `${px}px Bake`; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff';
  const m = ctx.measureText('Hg');
  const ascent = Math.round(m.fontBoundingBoxAscent ?? px);
  const lineHeight = Math.round((m.fontBoundingBoxAscent + m.fontBoundingBoxDescent) || px * 1.25);
  const glyphs = [];
  chars.forEach((ch, i) => {
    const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
    ctx.fillText(ch, x, y + ascent);
    glyphs.push({ ch, id: ch.codePointAt(0), x, y, w: Math.round(ctx.measureText(ch).width) });
  });
  const img = ctx.getImageData(0, 0, cv.width, cv.height);
  for (let i = 3; i < img.data.length; i += 4) {
    const on = img.data[i] >= 110;
    img.data[i] = on ? 255 : 0; img.data[i - 3] = img.data[i - 2] = img.data[i - 1] = 255;
  }
  ctx.putImageData(img, 0, 0);
  let out = cv;
  if (down > 1) {
    // Nearest sampling on the font's own pixel grid; (ox, oy) picks which sub-pixel lands on the grid.
    out = document.createElement('canvas');
    out.width = cv.width / down; out.height = Math.ceil(cv.height / down);
    const oc = out.getContext('2d');
    const dst = oc.createImageData(out.width, out.height);
    for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) {
      const sx = x * down + ox, sy = y * down + oy;
      if (sx >= cv.width || sy >= cv.height) continue;
      const si = (sy * cv.width + sx) * 4, di = (y * out.width + x) * 4;
      for (let k = 0; k < 4; k++) dst.data[di + k] = img.data[si + k];
    }
    oc.putImageData(dst, 0, 0);
    for (const g of glyphs) { g.x /= down; g.y = Math.floor(g.y / down); g.w = Math.round(g.w / down); }
  }
  let prev = null;
  if (preview) {
    const p = document.createElement('canvas'); p.width = 400; p.height = 60;
    const pc = p.getContext('2d'); pc.fillStyle = '#1a2266'; pc.fillRect(0, 0, 400, 60);
    pc.font = `${px}px Bake`; pc.fillStyle = '#fff'; pc.fillText('The quick brown fox, Sella! 123 ♥', 4, 20);
    const d = pc.getImageData(0, 0, 400, 60); prev = p.toDataURL();
  }
  return { png: out.toDataURL(), glyphs, cellW: cellW / down, cellH: Math.ceil(cellH / down), lineHeight: Math.round(lineHeight / down), ascent: Math.round(ascent / down), w: out.width, h: out.height, prev };
}, { b64, px, preview, down, ox, oy });
await browser.close();
const { glyphs, cellH, lineHeight, w, h } = result;
let xml = `<?xml version="1.0"?>\n<font>\n<info face="${outName}" size="${px / down}"/>\n<common lineHeight="${lineHeight}" base="${result.ascent}" scaleW="${w}" scaleH="${h}" pages="1"/>\n<pages><page id="0" file="${outName}.png"/></pages>\n<chars count="${glyphs.length}">\n`;
for (const g of glyphs) if (g.ch === ' ') g.w = Math.max(g.w, Math.round(px / down / 2));
for (const g of glyphs) xml += `<char id="${g.id}" x="${g.x}" y="${g.y}" width="${Math.max(1, g.w)}" height="${cellH}" xoffset="0" yoffset="0" xadvance="${g.w}" page="0"/>\n`;
xml += '</chars>\n</font>\n';
await writeFile(`public/assets/fonts/${outName}.png`, Buffer.from(result.png.split(',')[1], 'base64'));
await writeFile(`public/assets/fonts/${outName}.xml`, xml);
if (preview && result.prev) await writeFile(preview, Buffer.from(result.prev.split(',')[1], 'base64'));
console.log(`baked ${outName}: ${glyphs.length} glyphs, lineHeight ${lineHeight}`);
