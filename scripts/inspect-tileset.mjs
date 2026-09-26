// Writes a 4x upscaled contact sheet with a grid and tile indices, for picking tile ids by eye.
// usage: node scripts/inspect-tileset.mjs public/assets/tiles/tilesetfloor.png out.png [tileSize]
import sharp from 'sharp';
const [src, out, ts = '16', scaleArg = '3'] = process.argv.slice(2);
const T = +ts, S = +scaleArg;
const img = sharp(src);
const { width, height } = await img.metadata();
const cols = Math.floor(width / T), rows = Math.floor(height / T);
const W = cols * T * S, H = rows * T * S;
const base = await sharp(src).extract({ left: 0, top: 0, width: cols * T, height: rows * T })
  .resize(W, H, { kernel: 'nearest' }).png().toBuffer();
let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  const x = c * T * S, y = r * T * S;
  svg += `<rect x="${x}" y="${y}" width="${T * S}" height="${T * S}" fill="none" stroke="#f0f" stroke-opacity="0.35"/>`;
  svg += `<text x="${x + 1}" y="${y + 9}" font-size="9" font-family="monospace" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke">${r * cols + c}</text>`;
}
svg += '</svg>';
await sharp({ create: { width: W, height: H, channels: 4, background: '#303040' } })
  .composite([{ input: base }, { input: Buffer.from(svg) }]).png().toFile(out);
console.log(`${src}: ${cols}x${rows} tiles -> ${out}`);
