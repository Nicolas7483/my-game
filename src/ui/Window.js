import Phaser from 'phaser';
import { UI, GRID, FONT, FONT_SIZE, LINE } from '../config.js';
import { ITEMS } from '../../content/items.js';

// Every panel in the game goes through here: same gradient, same border, sizes on the 8px grid.
export const SIZES = {
  slot: [24, 24],
  widget: [128, 32],
  toast: [224, 24],
  dialogue: [464, 72],
};

const snap = v => Math.round(v / GRID) * GRID;
export const registry = []; // every live window, for the QA grid audit
if (typeof window !== 'undefined') window.__windows = registry;

export class Window extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, opts = {}) {
    super(scene, x, y);
    this.w = w; this.h = h; this.opts = opts;
    if (!opts.free && (x % GRID || y % GRID || w % GRID || h % GRID)) console.warn(`Window off grid: ${x},${y} ${w}x${h}`);
    this.g = scene.add.graphics();
    this.add(this.g);
    this.draw();
    scene.add.existing(this);
    registry.push(this);
    this.once('destroy', () => registry.splice(registry.indexOf(this), 1));
  }
  draw() {
    const { g, w, h } = this;
    const a = this.opts.alpha ?? 0.94;
    g.clear();
    g.fillStyle(UI.shadow, 0.35).fillRect(2, 2, w, h);
    g.fillStyle(UI.outline, 1).fillRect(1, 0, w - 2, h).fillRect(0, 1, w, h - 2);
    g.fillStyle(UI.border, 1).fillRect(2, 1, w - 4, h - 2).fillRect(1, 2, w - 2, h - 4);
    g.fillStyle(0x9aa3c8, 1).fillRect(3, h - 3, w - 6, 1).fillRect(w - 3, 3, 1, h - 6);
    g.fillGradientStyle(this.opts.top ?? UI.winTop, this.opts.top ?? UI.winTop, this.opts.bottom ?? UI.winBottom, this.opts.bottom ?? UI.winBottom, a);
    g.fillRect(3, 3, w - 6, h - 6);
    g.fillStyle(0xffffff, 0.08).fillRect(3, 3, w - 6, 1);
  }
  resize(w, h) { this.w = w; this.h = h; this.draw(); return this; }
}

export function text(scene, x, y, str, color = UI.text, opts = {}) {
  const t = scene.add.bitmapText(x, y, FONT, str, FONT_SIZE);
  t.setTint(color);
  if (opts.maxWidth) t.setMaxWidth(opts.maxWidth);
  t.setLineSpacing(LINE - 10);
  return t;
}

// A text with a 1px dark drop shadow, for labels drawn straight over the world.
export function shadowText(scene, x, y, str, color = UI.text) {
  const c = scene.add.container(x, y);
  const s = text(scene, 1, 1, str, 0x0a0c20);
  const t = text(scene, 0, 0, str, color);
  c.add([s, t]);
  c.setText = v => { s.setText(v); t.setText(v); return c; };
  c.textObj = t;
  return c;
}

export function itemIcon(scene, x, y, id) {
  const icon = ITEMS[id]?.icon ?? 'bag';
  let img;
  if (icon.includes(':')) {
    const [sheet, i] = icon.split(':');
    img = scene.add.image(x, y, 't_' + sheet, +i);
  } else img = scene.add.image(x, y, 'it_' + icon);
  const src = img.frame;
  if (src.width > 16 || src.height > 16) img.setScale(16 / Math.max(src.width, src.height));
  return img;
}

export { snap };
