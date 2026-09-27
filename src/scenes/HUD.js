import Phaser from 'phaser';
import { UI, TILE } from '../config.js';
import { QUESTS } from '../../content/story.js';
import { ITEMS } from '../../content/items.js';
import { Window, text, shadowText, itemIcon } from '../ui/Window.js';
import { useItem } from '../systems/State.js';
import { bus } from '../systems/bus.js';
import { EMOTES } from './Preload.js';

// Layout on the 8px grid (see docs/style-guide.md).
const L = {
  status: [8, 8, 128, 40],
  toast: [144, 8, 192, 24],
  mini: [344, 8, 128, 96],
  quest: [344, 112, 128, 48],
  hotbar: [120, 232, 144, 32],
  keys: [272, 232, 88, 32],
};
const MINI_PX = 2; // minimap pixels per tile

export function clockText(hour) {
  const h = Math.floor(hour) % 24, m = Math.floor((hour % 1) * 60 / 10) * 10;
  const label = h < 5 ? 'Night' : h < 8 ? 'Dawn' : h < 17 ? 'Day' : h < 20 ? 'Dusk' : 'Night';
  return { label, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
}

// Minimap colours per surface / prop.
export function drawMiniMap(scene, md, key, px = MINI_PX) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, md.w * px, md.h * px);
  const ctx = tex.getContext();
  const col = { grass: '#6fa84a', dirt: '#d9a066', water: '#4aa3d8', wood: '#b0703a' };
  for (let y = 0; y < md.h; y++) for (let x = 0; x < md.w; x++) {
    let c = col[md.surface[y * md.w + x]] ?? col.grass;
    if (md.surface[y * md.w + x] === 'grass' && (x + y) % 2) c = '#69a146';
    ctx.fillStyle = c; ctx.fillRect(x * px, y * px, px, px);
  }
  for (const p of md.props) {
    const n = p.name;
    ctx.fillStyle = n.startsWith('house') || n.startsWith('shop') ? '#e0604a' : /tree|pine|oak/.test(n) ? '#3d7a3a' : n.startsWith('torii') || n.startsWith('statue') ? '#f2d16b' : '#8a6a4a';
    const solid = n.startsWith('house') || n.startsWith('shop') ? p.pf.h : Math.min(p.pf.h, 2);
    ctx.fillRect(p.x * px, (p.y + p.pf.h - solid) * px, p.pf.w * px, solid * px);
  }
  tex.refresh();
  return tex;
}

export default class HUD extends Phaser.Scene {
  constructor() { super('HUD'); }

  create() {
    this.state = this.registry.get('state');
    this.toasts = [];
    this.toastBusy = false;

    // Status: hearts, clock, gold
    const [sx, sy, sw, sh] = L.status;
    this.statusWin = new Window(this, sx, sy, sw, sh);
    this.hearts = [0, 1, 2].map(i => this.add.image(sx + 7 + i * 15, sy + 5, 'hearts', 0).setOrigin(0));
    this.clockLabel = text(this, sx + 62, sy + 7, '', UI.select);
    this.clockTime = text(this, sx + 94, sy + 7, '', UI.text);
    this.coin = this.add.image(sx + 12, sy + 28, 'coin', 0);
    this.goldText = text(this, sx + 20, sy + 24, '', UI.gold);
    this.placeText = text(this, sx + 62, sy + 24, '', UI.dim);

    // Minimap
    const [mx, my, mw, mh] = L.mini;
    this.miniWin = new Window(this, mx, my, mw, mh);
    this.miniImg = null;
    this.miniDots = this.add.graphics();

    // Quest tracker
    const [qx, qy, qw, qh] = L.quest;
    this.questWin = new Window(this, qx, qy, qw, qh);
    this.questTitle = text(this, qx + 8, qy + 6, '', UI.gold);
    this.questText = text(this, qx + 8, qy + 18, '', UI.text, { maxWidth: qw - 16 });

    // Hotbar
    const [hx, hy, hw, hh] = L.hotbar;
    this.hotWin = new Window(this, hx, hy, hw, hh);
    this.slots = [];
    const g = this.add.graphics();
    for (let i = 0; i < 5; i++) {
      const x = hx + 4 + i * 28, y = hy + 4;
      g.fillStyle(UI.outline, 0.55).fillRect(x, y, 24, 24);
      g.lineStyle(1, 0x6a78c8, 1).strokeRect(x + 0.5, y + 0.5, 23, 23);
      const num = text(this, x + 18, y + 15, String(i + 1), UI.dim);
      this.slots.push({ x, y, num, icon: null, count: null });
    }
    this.slotGfx = g;
    // Shortcut panel: Bag, Map, Journal (click-free key caps, no floating text)
    const [kx, ky, kw, kh] = L.keys;
    this.keyWin = new Window(this, kx, ky, kw, kh);
    const kg = this.add.graphics();
    const keys = [['it_bag', 'I'], ['it_letter2', 'M'], ['it_book', 'J']];
    this.keyParts = [this.keyWin, kg];
    keys.forEach(([icon, key], i) => {
      const x = kx + 4 + i * 28, y = ky + 4;
      kg.fillStyle(UI.outline, 0.55).fillRect(x, y, 24, 24);
      kg.lineStyle(1, 0x6a78c8, 1).strokeRect(x + 0.5, y + 0.5, 23, 23);
      const img = this.add.image(x + 12, y + 11, icon);
      if (img.width > 16 || img.height > 16) img.setScale(14 / Math.max(img.width, img.height));
      const t = text(this, x + 17, y + 15, key, UI.select);
      this.keyParts.push(img, t);
    });
    this.bottom = [this.hotWin, this.slotGfx, ...this.slots.map(s => s.num), ...this.keyParts];

    this.refreshAll();
    this.events.on('map-changed', () => this.refreshMap());

    const on = (ev, fn) => { bus.on(ev, fn, this); this.events.once('shutdown', () => bus.off(ev, fn, this)); };
    on('inventory-changed', () => this.refreshHotbar());
    on('hp-changed', () => this.refreshHearts());
    on('var-changed', () => {});
    on('quest-changed', (id, how) => {
      this.refreshQuest();
      const q = QUESTS[id];
      if (!q) return;
      if (how === 'new') { this.toast({ text: `New quest: ${q.title}`, icon: 'quest' }); this.game.audioManager.sfx('alert2', { volume: 0.7 }); }
      else if (how === 'done') { this.toast({ text: `Quest complete: ${q.title}`, icon: 'star' }); this.game.audioManager.sfx('quest'); }
      else this.game.audioManager.sfx('alert', { volume: 0.5 });
    });
    on('toast', t => this.toast(t));
    on('saved', () => this.toast({ text: 'Game saved', icon: 'star' }));
    on('use-slot', i => this.useSlot(i));
    on('dialogue-open', () => this.setBottomVisible(false));
    on('dialogue-closed', () => this.setBottomVisible(true));
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.refreshClock() });
    this.time.addEvent({ delay: 100, loop: true, callback: () => this.fadeOverHero() });
  }

  setBottomVisible(v) {
    for (const o of [...this.bottom, ...this.slots.flatMap(s => [s.icon, s.count]).filter(Boolean), this.questWin, this.questTitle, this.questText]) {
      this.tweens.killTweensOf(o);
      this.tweens.add({ targets: o, alpha: v ? 1 : 0, duration: 150 });
    }
    if (v) this.refreshQuest();
  }

  // Panels turn see-through when the hero walks under them, so the hero is never hidden.
  fadeOverHero() {
    const w = this.scene.get('World');
    if (!w?.player || !w.sys.isActive()) return;
    const cam = w.cameras.main;
    const hx = w.player.x - cam.scrollX, hy = w.player.y - cam.scrollY;
    const groups = [
      [L.status, [this.statusWin, ...this.hearts, this.clockLabel, this.clockTime, this.coin, this.goldText, this.placeText]],
      [L.mini, [this.miniWin, this.miniImg, this.miniNight, this.miniDots]],
      [[L.quest[0], L.quest[1], L.quest[2], this.questWin.h], [this.questWin, this.questTitle, this.questText]],
      [L.hotbar, [this.hotWin, this.slotGfx, ...this.slots.flatMap(s => [s.num, s.icon, s.count])]],
      [L.keys, this.keyParts],
    ];
    for (const [[x, y, gw, gh], objs] of groups) {
      const over = hx > x - 8 && hx < x + gw + 8 && hy > y - 2 && hy < y + gh + 22;
      for (const o of objs) if (o && o.alpha > 0.05) o.setAlpha(over ? 0.3 : 1);
    }
  }

  refreshAll() { this.refreshHearts(); this.refreshHotbar(); this.refreshQuest(); this.refreshClock(); this.refreshMap(); }

  refreshHearts() {
    const hp = this.state.d.hp;
    this.hearts.forEach((h, i) => { const v = hp - i * 2; h.setFrame(v >= 2 ? 4 : v === 1 ? 2 : 0); });
  }

  refreshClock() {
    const { label, time } = clockText(this.state.d.hour);
    this.clockLabel.setText(label);
    this.clockTime.setText(time);
    this.goldText.setText(String(this.state.d.gold));
    this.placeText.setText(`Day ${this.state.d.day}`);
    this.updateMiniDots();
  }

  refreshHotbar() {
    const s = this.state;
    this.slots.forEach((sl, i) => {
      sl.icon?.destroy(); sl.count?.destroy(); sl.icon = sl.count = null;
      const id = s.d.hotbar[i];
      if (!id || !s.count(id)) return;
      sl.icon = itemIcon(this, sl.x + 11, sl.y + 11, id);
      const n = s.count(id);
      if (n > 1) sl.count = text(this, sl.x + 2, sl.y + 1, String(n), UI.select);
    });
  }

  useSlot(i) {
    const id = this.state.d.hotbar[i];
    const item = id && ITEMS[id];
    if (!item) { this.game.audioManager.sfx('cancel', { volume: 0.5 }); return; }
    const sl = this.slots[i];
    this.tweens.add({ targets: sl.icon, y: sl.y + 10, yoyo: true, duration: 80 });
    if (item.use) useItem(this.state, item);
    else { this.toast({ text: `${item.name}: ${item.desc}`, icon: 'item', item: id, long: true }); this.game.audioManager.sfx('move'); }
  }

  refreshQuest() {
    const s = this.state;
    const id = s.activeQuests()[0];
    const has = !!id;
    this.questWin.setVisible(has); this.questTitle.setVisible(has); this.questText.setVisible(has);
    if (!has) return;
    const q = QUESTS[id];
    const stage = s.quest(id);
    this.questTitle.setText(q.title);
    this.questText.setText(q.stages[Math.min(stage, q.stages.length - 1)] ?? '');
    const lines = Math.max(1, Math.ceil(this.questText.getTextBounds().local.height / 11));
    this.questWin.resize(128, Math.ceil((22 + lines * 11) / 8) * 8);
  }

  refreshMap() {
    const md = this.registry.get('mapData');
    if (!md) return;
    this.miniImg?.destroy();
    drawMiniMap(this, md, 'minimap');
    const [mx, my, mw, mh] = L.mini;
    this.miniImg = this.add.image(0, 0, 'minimap').setOrigin(0);
    const iw = mw - 8, ih = mh - 8;
    if (md.w * MINI_PX > iw || md.h * MINI_PX > ih) this.miniImg.setCrop(0, 0, iw, ih);
    this.miniNight?.destroy();
    this.miniNight = this.add.rectangle(mx + 4, my + 4, iw, ih, 0xffffff).setOrigin(0).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.children.bringToTop(this.miniNight);
    this.children.bringToTop(this.miniDots);
    this.updateMiniDots();
  }

  updateMiniDots() {
    const w = this.scene.get('World');
    const md = this.registry.get('mapData');
    if (!w?.player || !md || !this.miniImg) return;
    const [mx, my, mw, mh] = L.mini;
    const iw = mw - 8, ih = mh - 8;
    const px = (w.player.x / TILE) * MINI_PX, py = (w.player.y / TILE) * MINI_PX;
    const cx = Math.max(0, Math.floor((iw - md.w * MINI_PX) / 2)), cy = Math.max(0, Math.floor((ih - md.h * MINI_PX) / 2));
    const ox = Phaser.Math.Clamp(Math.round(px - iw / 2), 0, Math.max(0, md.w * MINI_PX - iw)) - cx;
    const oy = Phaser.Math.Clamp(Math.round(py - ih / 2), 0, Math.max(0, md.h * MINI_PX - ih)) - cy;
    if (this.miniImg.isCropped) { this.miniImg.setCrop(ox + cx, oy + cy, iw, ih); this.miniImg.setPosition(mx + 4 - ox - cx, my + 4 - oy - cy); }
    else this.miniImg.setPosition(mx + 4 - ox, my + 4 - oy);
    if (this.miniNight) this.miniNight.fillColor = w.night?.fillColor ?? 0xffffff;
    const g = this.miniDots.clear();
    const cam = w.cameras.main;
    g.lineStyle(1, 0xffffff, 0.5).strokeRect(mx + 4 - ox + Math.round(cam.scrollX / TILE * MINI_PX) + 0.5, my + 4 - oy + Math.round(cam.scrollY / TILE * MINI_PX) + 0.5, Math.round(cam.width / TILE * MINI_PX), Math.round(cam.height / TILE * MINI_PX));
    for (const n of w.npcs ?? []) {
      const x = mx + 4 - ox + Math.round((n.x / TILE) * MINI_PX), y = my + 4 - oy + Math.round((n.y / TILE) * MINI_PX);
      if (x < mx + 4 || y < my + 4 || x > mx + mw - 6 || y > my + mh - 6) continue;
      g.fillStyle(n.def.id === 'sella' ? UI.heart : 0xfff1c0, 1).fillRect(x - 1, y - 2, 2, 2);
    }
    for (const wp of md.warps) {
      const x = mx + 4 - ox + (wp.x + wp.w / 2) * MINI_PX, y = my + 4 - oy + wp.y * MINI_PX;
      if (x >= mx + 4 && y >= my + 4 && x < mx + mw - 4 && y < my + mh - 4) g.fillStyle(UI.gold, 1).fillRect(x - 2, y, 4, 2);
    }
    const blink = Math.floor(this.time.now / 300) % 2;
    g.fillStyle(blink ? 0xffffff : UI.select, 1).fillRect(mx + 4 - ox + Math.round(px) - 1, my + 4 - oy + Math.round(py) - 3, 3, 3);
  }

  // Toasts slide in at the top centre, one at a time.
  toast(t) {
    this.toasts.push(t);
    if (!this.toastBusy) this.nextToast();
  }

  nextToast() {
    const t = this.toasts.shift();
    if (!t) { this.toastBusy = false; return; }
    this.toastBusy = true;
    const [x, y, w, h] = L.toast;
    const c = this.add.container(0, -32);
    const win = new Window(this, x, y, w, h);
    let icon;
    if (t.item) icon = itemIcon(this, x + 14, y + 12, t.item);
    else if (t.icon === 'gold') icon = this.add.image(x + 14, y + 12, 'coin', 0);
    else icon = this.add.image(x + 14, y + 12, 'emote' + (EMOTES[{ quest: 'alert', moth: 'sleep', item: 'surprise' }[t.icon] ?? t.icon] ?? EMOTES.star));
    let str = t.text;
    const tx = text(this, x + 26, y + 8, str, t.icon === 'heart' ? 0xffc2cc : t.icon === 'heartbreak' ? 0xc0c4d8 : UI.text);
    while (tx.getTextBounds().local.width > w - 34 && str.length > 4) { str = str.slice(0, -2); tx.setText(str.trimEnd() + '…'); }
    c.add([win, icon, tx]);
    if (t.icon === 'heart') this.game.audioManager.sfx('heart', { volume: 0.6 });
    this.tweens.add({ targets: c, y: 0, duration: 220, ease: 'Back.out' });
    this.tweens.add({ targets: c, y: -32, delay: t.long ? 3200 : 2200, duration: 200, ease: 'Sine.in', onComplete: () => { c.destroy(); this.nextToast(); } });
  }
}
