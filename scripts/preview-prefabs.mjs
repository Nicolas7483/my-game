// Renders every prefab with its name into one sheet so the Art Director can check the catalog.
import sharp from 'sharp';
import { PREFABS, SHEETS } from '../content/prefabs.js';
const out = process.argv[2] || 'prefabs.png';
const S = 3, CELL = 16;
const items = [];
for (const [name, p] of Object.entries(PREFABS)) {
  const src = `public/assets/${SHEETS[p.sheet].file}`;
  try {
    const buf = await sharp(src).extract({ left: p.c * CELL, top: p.r * CELL, width: p.w * CELL, height: p.h * CELL })
      .resize(p.w * CELL * S, p.h * CELL * S, { kernel: 'nearest' }).png().toBuffer();
    items.push({ name, buf, w: p.w * CELL * S, h: p.h * CELL * S });
  } catch (e) { console.warn('bad prefab', name, e.message); }
}
const W = 1500; let x = 8, y = 8, rowH = 0; const comp = [];
for (const it of items) {
  if (x + Math.max(it.w, 110) > W) { x = 8; y += rowH + 24; rowH = 0; }
  comp.push({ input: it.buf, left: x, top: y + 14 });
  comp.push({ input: Buffer.from(`<svg width="${Math.max(it.w, 110)}" height="14" xmlns="http://www.w3.org/2000/svg"><text x="0" y="11" font-size="12" font-family="monospace" fill="#fff">${it.name}</text></svg>`), left: x, top: y });
  x += Math.max(it.w, 110) + 12; rowH = Math.max(rowH, it.h + 14);
}
await sharp({ create: { width: W, height: y + rowH + 30, channels: 4, background: '#5a8a3a' } }).composite(comp).png().toFile(out);
console.log('wrote', out);
