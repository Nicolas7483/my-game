// Turns a map definition (content/maps/*.js) into tile layers, a collision grid and placed objects.
// Terrain is painted on a vertex grid (w+1 by h+1); each tile picks its art from its 4 corners,
// which gives smooth, hand-drawn looking shores and paths without a map editor.
import { PREFABS } from '../../content/prefabs.js';

export const T = { GRASS: 0, DIRT: 1, WATER: 2 };

const GRASS = [264, 264, 264, 264, 264, 264, 265, 266, 267, 268, 244, 245];
// corner key = NW NE SW SE (1 = terrain present)
const DIRT = { '1111': 177, '0001': 154, '0011': 155, '0010': 156, '0101': 176, '1010': 178, '0100': 198, '1100': 199, '1000': 200, '1110': 181, '1101': 182, '1011': 203, '0111': 204, '1001': 177, '0110': 177 };
const WATER = { '1111': 197, '0001': 168, '0011': 169, '0010': 170, '0101': 196, '1010': 198, '0100': 224, '1100': 225, '1000': 226, '1110': 201, '1101': 202, '1011': 229, '0111': 230, '1001': 197, '0110': 197 };
const PLANK = { nw: 336, n: 337, ne: 338, w: 364, c: 365, e: 366, sw: 392, s: 393, se: 394, vt: 339, vm: 367, vb: 395, hl: 420, hm: 421, hr: 422, one: 423, broken1: 448, broken2: 449 };
const DETAIL = [32, 33, 34, 35, 32, 33, 35, 37];
const FLOWERS = [264, 265, 267, 270, 266, 267, 273];

export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export class Painter {
  constructor(w, h) { this.w = w; this.h = h; this.v = Array.from({ length: h + 1 }, () => new Uint8Array(w + 1)); }
  set(t, x, y) { if (x >= 0 && y >= 0 && x <= this.w && y <= this.h) this.v[y][x] = t; }
  get(x, y) { x = Math.max(0, Math.min(this.w, x)); y = Math.max(0, Math.min(this.h, y)); return this.v[y][x]; }
  fill(t) { for (const row of this.v) row.fill(t); return this; }
  rect(t, x, y, w, h) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(t, i, j); return this; }
  blob(t, cx, cy, rx, ry, wobble = 0, seed = 1) {
    const r = rng(seed);
    for (let j = Math.floor(cy - ry - 2); j <= cy + ry + 2; j++) for (let i = Math.floor(cx - rx - 2); i <= cx + rx + 2; i++) {
      const d = ((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2;
      if (d <= 1 + (r() - 0.5) * wobble) this.set(t, i, j);
    }
    return this;
  }
  // Manhattan path through points, `thick` vertices wide (2 = one full tile of path plus soft edges).
  path(t, pts, thick = 2) {
    for (let k = 0; k < pts.length - 1; k++) {
      let [x0, y0] = pts[k]; const [x1, y1] = pts[k + 1];
      while (x0 !== x1) { this.rect(t, x0, y0, thick, thick); x0 += Math.sign(x1 - x0); }
      while (y0 !== y1) { this.rect(t, x0, y0, thick, thick); y0 += Math.sign(y1 - y0); }
      this.rect(t, x1, y1, thick, thick);
    }
    return this;
  }
}

function cornerKey(p, x, y, t) {
  return `${+(p.get(x, y) === t)}${+(p.get(x + 1, y) === t)}${+(p.get(x, y + 1) === t)}${+(p.get(x + 1, y + 1) === t)}`;
}

// Planks laid over a rectangle as a 9-slice.
function plankTile(i, j, w, h) {
  if (w === 1 && h === 1) return PLANK.one;
  if (w === 1) return j === 0 ? PLANK.vt : j === h - 1 ? PLANK.vb : PLANK.vm;
  if (h === 1) return i === 0 ? PLANK.hl : i === w - 1 ? PLANK.hr : PLANK.hm;
  const col = i === 0 ? 'w' : i === w - 1 ? 'e' : 'c';
  const row = j === 0 ? 'n' : j === h - 1 ? 's' : '';
  if (row === '') return PLANK[col];
  if (col === 'c') return PLANK[row];
  return PLANK[row + col];
}

const WALL_STYLES = { beige: 0, orange: 5, brick: 60, moss: 65 };

// Rooms: a floor, a wall ring from the interior sheet, a door gap at the bottom that leads outside.
function buildInterior(def, state) {
  const { w, h, interior: it } = def;
  const empty = () => Array.from({ length: h }, () => new Array(w).fill(null));
  const layers = { ground: empty(), terrain: empty(), overlay: empty(), deco: empty() };
  const blocked = new Uint8Array(w * h).fill(1);
  const surface = new Array(w * h).fill('void');
  const r = rng(def.seed ?? 3);
  const { x: rx, y: ry, w: rw, h: rh } = it.room;
  const b = WALL_STYLES[it.wall ?? 'orange'];
  const door = rx + (it.door ?? Math.floor(rw / 2));
  for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) {
    const floor = it.pattern ? it.floor[((x & 1) + (y & 1) * 2) % it.floor.length] : it.floor[Math.floor(r() * it.floor.length)];
    layers.ground[y][x] = { sheet: 'ifloor', i: floor };
    const top = y === ry, bot = y === ry + rh - 1, left = x === rx, right = x === rx + rw - 1;
    let wi = null;
    if (top) wi = left ? b : right ? b + 4 : b + 1 + ((x - rx) % 3);
    else if (bot) wi = left ? b + 40 : right ? b + 44 : b + 41 + ((x - rx) % 3);
    else if (left) wi = b + 10 + ((y - ry) % 3) * 10;
    else if (right) wi = b + 14 + ((y - ry) % 3) * 10;
    if (bot && x === door) wi = null;
    if (wi !== null) layers.overlay[y][x] = { sheet: 'wall', i: wi };
    else { blocked[y * w + x] = 0; surface[y * w + x] = 'wood'; }
  }
  // Rugs: a 9-slice from the framed tan tiles of the interior floor sheet.
  const RUG = { nw: 16, n: 17, ne: 18, w: 38, c: 39, e: 40, sw: 60, s: 61, se: 62 };
  for (const g of it.rugs ?? []) for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) {
    const col = i === 0 ? 'w' : i === g.w - 1 ? 'e' : 'c', row = j === 0 ? 'n' : j === g.h - 1 ? 's' : '';
    const key = row ? (col === 'c' ? row : row + col) : col;
    layers.terrain[g.y + j][g.x + i] = { sheet: 'ifloor', i: RUG[key] };
  }
  const props = [];
  for (const [name, x, y, opts = {}] of def.props(state)) {
    const pf = PREFABS[name];
    if (!pf) { console.warn('unknown prefab', name); continue; }
    props.push({ name, x, y, pf, ...opts });
    const solidRows = opts.solid ?? pf.solid ?? 1;
    for (let j = pf.h - solidRows; j < pf.h; j++) for (let i = 0; i < pf.w; i++) {
      const tx = x + i, ty = y + j;
      if (tx >= 0 && ty >= 0 && tx < w && ty < h) blocked[ty * w + tx] = 1;
    }
  }
  const warps = [{ x: door, y: ry + rh - 1, w: 1, h: 1, to: it.exit.map, spot: it.exit.spot, dir: 'down' }];
  const spots = { door: [door, ry + rh - 2], ...def.spots };
  return { w, h, layers, blocked, surface, props, water: [], spots, objects: def.objects?.(state) ?? [], warps, interior: true };
}

export function buildMap(def, state) {
  if (def.interior) return buildInterior(def, state);
  const { w, h } = def;
  const p = new Painter(w, h).fill(T.GRASS);
  def.paint(p, state);
  const r = rng(def.seed ?? 7);
  const empty = () => Array.from({ length: h }, () => new Array(w).fill(null));
  const layers = { ground: empty(), terrain: empty(), overlay: empty(), deco: empty() };
  const blocked = new Uint8Array(w * h);
  const surface = new Array(w * h).fill('grass');
  const water = [];

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    layers.ground[y][x] = { sheet: 'floor', i: GRASS[Math.floor(r() * GRASS.length)] };
    const wk = cornerKey(p, x, y, T.WATER);
    if (wk !== '0000') {
      layers.terrain[y][x] = { sheet: 'water', i: WATER[wk] };
      const n = [...wk].filter(c => c === '1').length;
      if (n >= 2) blocked[y * w + x] = 1;
      if (n === 4) water.push([x, y]);
      surface[y * w + x] = 'water';
      continue;
    }
    const dk = cornerKey(p, x, y, T.DIRT);
    if (dk !== '0000') {
      layers.terrain[y][x] = { sheet: 'floor', i: DIRT[dk] };
      if ([...dk].filter(c => c === '1').length >= 2) surface[y * w + x] = 'dirt';
    }
  }

  // Planks (docks, bridges). Walkable even over water.
  for (const d of def.planks?.(state) ?? []) {
    for (let j = 0; j < d.h; j++) for (let i = 0; i < d.w; i++) {
      const x = d.x + i, y = d.y + j;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      let idx = plankTile(i, j, d.w, d.h);
      if (d.broken?.some(([bx, by]) => bx === i && by === j)) idx = (i + j) % 2 ? PLANK.broken1 : PLANK.broken2;
      layers.overlay[y][x] = { sheet: 'water', i: idx, tint: d.tint };
      blocked[y * w + x] = 0;
      surface[y * w + x] = 'wood';
    }
  }

  // Props (houses, trees...). Solid bottom rows block movement.
  const props = [];
  const doorWarps = [], doorSpots = {};
  for (const [name, x, y, opts = {}] of def.props(state)) {
    const pf = PREFABS[name];
    if (!pf) { console.warn('unknown prefab', name); continue; }
    props.push({ name, x, y, pf, ...opts });
    const solidRows = opts.solid ?? pf.solid ?? 1;
    if (opts.enter) {
      const dx = x + (pf.door ?? 1), dy = y + pf.h - 1;
      doorWarps.push({ x: dx, y: dy, w: 1, h: 1, to: opts.enter, spot: 'door', dir: 'up', door: true });
      doorSpots[opts.enter + '_front'] = [dx, dy + 1];
    }
    for (let j = pf.h - solidRows; j < pf.h; j++) for (let i = 0; i < pf.w; i++) {
      if (pf.blockCols && !pf.blockCols.includes(i)) continue;
      const tx = x + i, ty = y + j;
      if (tx >= 0 && ty >= 0 && tx < w && ty < h) blocked[ty * w + tx] = 1;
    }
    if (pf.blockCols && solidRows === 0) for (const c of pf.blockCols) blocked[(y + pf.h - 1) * w + x + c] = 1;
  }

  for (const d of doorWarps) blocked[d.y * w + d.x] = 0;

  // Extra blockers (invisible walls, map borders).
  for (const [x, y, bw = 1, bh = 1] of def.walls?.(state) ?? []) {
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      const tx = x + i, ty = y + j;
      if (tx >= 0 && ty >= 0 && tx < w && ty < h) blocked[ty * w + tx] = 1;
    }
  }
  for (const [x, y, bw = 1, bh = 1] of def.open?.(state) ?? []) {
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) blocked[(y + j) * w + x + i] = 0;
  }

  // Scatter grass tufts and flowers on open grass (never under props).
  const occupied = new Uint8Array(w * h);
  for (const pr of props) for (let j = 0; j < pr.pf.h; j++) for (let i = 0; i < pr.pf.w; i++) {
    const tx = pr.x + i, ty = pr.y + j; if (tx < w && ty < h && tx >= 0 && ty >= 0) occupied[ty * w + tx] = 1;
  }
  const beds = def.flowerbeds?.(state) ?? [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (layers.terrain[y][x] || layers.overlay[y][x] || occupied[y * w + x]) continue;
    const inBed = beds.some(b => x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h);
    const roll = r();
    if (inBed && roll < (beds.find(b => x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h).density ?? 0.55)) layers.deco[y][x] = { sheet: 'nature', i: FLOWERS[Math.floor(r() * FLOWERS.length)] };
    else if (roll < (def.tufts ?? 0.07)) layers.deco[y][x] = { sheet: 'detail', i: DETAIL[Math.floor(r() * DETAIL.length)] };
  }

  // Map edges are walls except where a warp is.
  for (let x = 0; x < w; x++) { blocked[x] ||= 0; }

  const warps = [...(def.warps ?? []), ...doorWarps];
  return { w, h, layers, blocked, surface, props, water, spots: { ...def.spots, ...doorSpots }, objects: def.objects?.(state) ?? [], warps, painter: p };
}
