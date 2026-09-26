// Renders a whole map to a PNG (for level design reviews). usage: node scripts/render-map.mjs town out.png [flag,flag]
import sharp from 'sharp';
import { buildMap } from '../src/systems/MapBuilder.js';
import { SHEETS } from '../content/prefabs.js';

const [id = 'town', out = 'map.png', flagsArg = ''] = process.argv.slice(2);
const def = (await import(`../content/maps/${id}.js`)).default;
const flags = new Set(flagsArg.split(',').filter(Boolean));
const state = { has: f => flags.has(f), isNight: () => false, var: () => 0 };
const md = buildMap(def, state);
const T = 16;
const sheetBuf = {};
for (const [k, s] of Object.entries(SHEETS)) sheetBuf[k] = { img: sharp(`public/assets/${s.file}`), cols: s.cols };
const cache = new Map();
async function tile(sheet, i) {
  const key = sheet + ':' + i;
  if (!cache.has(key)) {
    const s = SHEETS[sheet];
    cache.set(key, await sharp(`public/assets/${s.file}`).extract({ left: (i % s.cols) * T, top: Math.floor(i / s.cols) * T, width: T, height: T }).png().toBuffer());
  }
  return cache.get(key);
}
const comp = [];
for (const name of ['ground', 'terrain', 'overlay', 'deco']) {
  for (let y = 0; y < md.h; y++) for (let x = 0; x < md.w; x++) {
    const t = md.layers[name][y][x];
    if (t) comp.push({ input: await tile(t.sheet, t.i), left: x * T, top: y * T });
  }
}
const props = [...md.props].sort((a, b) => (a.y + a.pf.h) - (b.y + b.pf.h));
for (const p of props) {
  const s = SHEETS[p.pf.sheet];
  const buf = await sharp(`public/assets/${s.file}`).extract({ left: p.pf.c * T, top: p.pf.r * T, width: p.pf.w * T, height: p.pf.h * T }).png().toBuffer();
  if (p.x >= 0 && p.y >= 0) comp.push({ input: buf, left: p.x * T, top: p.y * T });
}
// spots as small markers
let svg = `<svg width="${md.w * T}" height="${md.h * T}" xmlns="http://www.w3.org/2000/svg">`;
for (const [k, [x, y]] of Object.entries(md.spots)) svg += `<circle cx="${x * T + 8}" cy="${y * T + 8}" r="4" fill="#ff00ff"/><text x="${x * T + 12}" y="${y * T + 6}" font-size="9" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke" font-family="monospace">${k}</text>`;
svg += '</svg>';
comp.push({ input: Buffer.from(svg), left: 0, top: 0 });
await sharp({ create: { width: md.w * T, height: md.h * T, channels: 4, background: '#000' } }).composite(comp).png().toFile(out);
console.log('wrote', out);
