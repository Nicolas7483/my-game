import Phaser from 'phaser';
import { UI, TILE } from '../config.js';
import { QUESTS } from '../../content/index.js';
import { ITEMS } from '../../content/index.js';
import { Window, text, itemIcon } from '../ui/Window.js';
import { useItem } from '../systems/State.js';
import { bus } from '../systems/bus.js';
import { writeSlot, readSlot, slotSummary, exportCode, importCode } from '../systems/Save.js';
import { startGame } from '../systems/Game.js';
import { drawMiniMap } from './HUD.js';
import { PARTY, xpToNext } from '../../content/battles.js';

const TABS = [
  { id: 'bag', label: 'Bag' },
  { id: 'party', label: 'Party' },
  { id: 'journal', label: 'Journal' },
  { id: 'map', label: 'Map' },
  { id: 'save', label: 'Save' },
  { id: 'load', label: 'Load' },
  { id: 'settings', label: 'Settings' },
  { id: 'title', label: 'Title Screen' },
];

// What the village remembers about you (shown in the Journal).
const MEMORY = [
  ['bridge_flimsy', 'You patched the Span with rotten planks.'],
  ['bridge_fixed', 'Tamsy\'s Span stands again.'],
  ['stranger_fed', 'You fed the hooded stranger.'],
  ['stranger_refused', 'You turned the hooded stranger away.'],
  ['told_truth', 'You told Bram the bridge was cut.'],
  ['kept_quiet', 'You kept the sabotage to yourself.'],
  ['kept_shard', 'You kept the violet shard.'],
  ['shard_tossed', 'You gave the violet shard to the river.'],
  ['stall_fixed', 'Coral\'s stall glows again.'],
  ['bobber_sold', 'You sold Gil\'s lucky bobber.'],
  ['gil_done', 'Gil has his lucky bobber back.'],
  ['wisp_bottled', 'You bottled the wisp.'],
  ['wisp_friend', 'The wisp chose to follow you.'],
  ['child_escort', 'You walked Pim home in the dark.'],
  ['singer_healed', 'Nan Wren sings again.'],
  ['singer_half', 'Nan Wren hums, half remembering.'],
  ['shared_walk', 'You shared one lantern with Sella.'],
];

const LABELS = {
  town: { inn_door: 'Inn', workshop: 'Workshop', plaza: 'Plaza', yard: 'Yard', stall: 'Market', dock_end: 'Dock', shrine: 'Shrine', wren_porch: 'Nan Wren', bridge_mid: 'The Span', garden: 'Garden' },
  meadow: { clearing: 'Clearing', pond: 'Pond', old_oak: 'Old Oak', dimspot: 'Dimspot', meadow_gate: 'The Span', flowers: 'Flowers' },
};

export default class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }

  init(data) {
    this.state = this.registry.get('state');
    this.tab = Math.max(0, TABS.findIndex(t => t.id === (data.tab === 'main' ? 'bag' : data.tab)));
    this.focus = data.tab === 'main' ? 'tabs' : 'content';
    this.direct = data.tab !== 'main'; // opened with I/J/M: one Esc closes it
    this.sel = 0;
  }

  create() {
    this.add.rectangle(0, 0, 480, 270, 0x0a0c20, 0.6).setOrigin(0);
    this.scene.setVisible(false, 'HUD');
    this.events.once('shutdown', () => this.scene.setVisible(true, 'HUD'));
    this.tabWin = new Window(this, 16, 24, 112, 144);
    this.tabTexts = TABS.map((t, i) => text(this, 36, 32 + i * 16, t.label));
    this.tabCursor = this.add.graphics();
    this.contentWin = new Window(this, 136, 24, 328, 224);
    this.goldWin = new Window(this, 16, 176, 112, 40);
    this.add.image(28, 189, 'coin', 0);
    this.goldText = text(this, 38, 185, `${this.state.d.gold} gold`, UI.gold);
    this.playText = text(this, 24, 199, '', UI.dim);
    const mins = Math.floor(this.state.d.playtime / 60);
    this.playText.setText(`Played ${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`);
    this.help = text(this, 16, 256, '', UI.dim);
    this.layer = this.add.container(0, 0);

    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.move(-1)); k.on('keydown-W', () => this.move(-1));
    k.on('keydown-DOWN', () => this.move(1)); k.on('keydown-S', () => this.move(1));
    k.on('keydown-LEFT', () => this.side(-1)); k.on('keydown-A', () => this.side(-1));
    k.on('keydown-RIGHT', () => this.side(1)); k.on('keydown-D', () => this.side(1));
    const ok = () => this.confirm();
    k.on('keydown-ENTER', ok); k.on('keydown-SPACE', ok); k.on('keydown-E', ok);
    k.on('keydown-ESC', () => this.back());
    k.on('keydown-I', () => this.jump('bag')); k.on('keydown-M', () => this.jump('map')); k.on('keydown-J', () => this.jump('journal'));
    for (let i = 1; i <= 5; i++) k.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i - 1]}`, () => this.assign(i - 1));
    this.events.once('shutdown', () => k.removeAllListeners());
    this.render();
  }

  jump(id) {
    const i = TABS.findIndex(t => t.id === id);
    if (i === this.tab && this.focus === 'content') return this.close();
    this.tab = i; this.focus = 'content'; this.sel = 0; this.render();
  }

  sfx(n, v = 0.6) { this.game.audioManager.sfx(n, { volume: v }); }

  move(d) {
    if (this.focus === 'tabs') { this.tab = (this.tab + d + TABS.length) % TABS.length; this.sel = 0; }
    else { const n = this.rows?.length ?? 0; if (!n) return; this.sel = (this.sel + d + n) % n; }
    this.sfx('move'); this.render();
  }

  side(d) {
    const row = this.rows?.[this.sel];
    if (this.focus === 'content' && row?.adjust) { row.adjust(d); this.sfx('move'); return this.render(); }
    if (d < 0 && this.focus === 'content') { this.direct = false; this.focus = 'tabs'; this.sfx('move'); return this.render(); }
    if (d > 0 && this.focus === 'tabs' && this.rows?.length) { this.focus = 'content'; this.sel = 0; this.sfx('move'); return this.render(); }
  }

  confirm() {
    if (this.focus === 'tabs') {
      if (TABS[this.tab].id === 'title') return this.toTitle();
      if (this.rows?.length) { this.focus = 'content'; this.sel = 0; this.sfx('accept'); this.render(); }
      return;
    }
    const row = this.rows?.[this.sel];
    if (row?.action) { row.action(); this.render(); }
  }

  back() {
    if (this.focus === 'content' && !this.direct) { this.focus = 'tabs'; this.sfx('cancel'); return this.render(); }
    this.close();
  }

  close() {
    this.sfx('cancel');
    this.scene.stop();
    bus.emit('menu-closed');
  }

  assign(slot) {
    if (TABS[this.tab].id !== 'bag' || this.focus !== 'content') return;
    const row = this.rows?.[this.sel];
    if (!row?.item) return;
    const hb = this.state.d.hotbar;
    for (let i = 0; i < hb.length; i++) if (hb[i] === row.item) hb[i] = null;
    hb[slot] = row.item;
    bus.emit('inventory-changed');
    bus.emit('toast', { text: `${ITEMS[row.item].name} set to slot ${slot + 1}`, icon: 'item', item: row.item });
    this.sfx('confirm');
  }

  toTitle() {
    writeSlot('auto', this.state);
    this.scene.stop('HUD'); this.scene.stop('World');
    bus.removeAllListeners();
    this.scene.start('Title');
  }

  // ------------------------------------------------------------------ drawing
  render() {
    this.layer.removeAll(true);
    this.tabTexts.forEach((t, i) => t.setTint(i === this.tab ? UI.select : UI.text));
    const g = this.tabCursor.clear();
    const cy = 32 + this.tab * 16;
    g.fillStyle(this.focus === 'tabs' ? UI.select : UI.dim, 1).fillTriangle(24, cy, 24, cy + 8, 29, cy + 4);
    const id = TABS[this.tab].id;
    this.rows = [];
    this[`draw_${id}`]?.();
    this.help.setText(this.focus === 'tabs' ? 'Up/Down choose   Enter open   Esc close' : (this.helpText ?? 'Up/Down choose   Enter select   Left back   Esc close'));
    this.helpText = null;
  }

  heading(str) { this.layer.add(text(this, 148, 32, str, UI.gold)); }
  t(x, y, s, c, o) { const tt = text(this, x, y, s, c, o); this.layer.add(tt); return tt; }

  drawRows(x, y, step = 14) {
    this.rows.forEach((r, i) => {
      const on = this.focus === 'content' && i === this.sel;
      if (r.icon) { const ic = itemIcon(this, x + 6, y + i * step + 4, r.icon); this.layer.add(ic); }
      this.t(x + (r.icon ? 16 : 0), y + i * step, r.label, on ? UI.select : r.color ?? UI.text);
      if (r.right) this.t(x + 180, y + i * step, r.right, on ? UI.select : UI.dim);
      if (on) { const gg = this.add.graphics().fillStyle(UI.select, 1).fillTriangle(x - 10, y + i * step, x - 10, y + i * step + 8, x - 5, y + i * step + 4); this.layer.add(gg); }
    });
  }

  draw_bag() {
    this.heading('Bag');
    const inv = this.state.d.inv;
    this.rows = inv.map(it => ({
      item: it.id, icon: it.id, label: ITEMS[it.id]?.name ?? it.id, right: it.n > 1 ? `x${it.n}` : '',
      action: () => { const item = ITEMS[it.id]; if (useItem(this.state, item)) this.sfx('confirm'); },
    }));
    if (!this.rows.length) this.t(160, 56, 'Empty. Pockets full of lint.', UI.dim);
    this.drawRows(164, 50, 16);
    const row = this.rows[this.sel];
    if (row && this.focus === 'content') {
      const it = ITEMS[row.item];
      const box = new Window(this, 144, 192, 312, 48); this.layer.add(box);
      this.t(152, 198, it.desc, UI.text, { maxWidth: 296 });
      this.t(152, 226, it.use ? 'Enter use   1-5 put on hotbar' : '1-5 put on hotbar', UI.dim);
    }
    this.helpText = 'Enter use   1-5 hotbar slot   Left back';
  }

  draw_party() {
    this.heading('Party');
    const s = this.state;
    s.d.members.forEach((id, i) => {
      const P = PARTY[id], m = s.member(id), st = s.stats(id);
      const y = 50 + i * 88;
      this.layer.add(this.add.image(166, y + 20, 'f_' + P.face).setScale(1));
      this.t(192, y, `${P.name}   Lv ${m.lvl}`, UI.select);
      this.t(192, y + 13, `HP ${m.hp}/${st.maxHp}`, UI.text);
      this.t(272, y + 13, `LP ${m.lp}/${st.maxLp}`, UI.text);
      this.t(352, y + 13, `Next ${xpToNext(m.lvl) - m.xp} XP`, UI.dim);
      this.t(192, y + 26, `Atk ${st.atk}   Def ${st.def}   Spd ${st.spd}`, UI.dim);
      const skills = P.skills.filter(k => m.lvl >= k.level).map(k => `${k.name} (${k.lp})`).join('  ');
      this.t(192, y + 40, skills, UI.text, { maxWidth: 260 });
      const locked = P.skills.find(k => m.lvl < k.level);
      if (locked) this.t(192, y + 52, `Lv ${locked.level}: ${locked.name}`, 0x6a72a0);
    });
    if (s.d.members.length < 2) this.t(148, 150, 'Friends will join you on the road.', UI.dim);
  }

  draw_journal() {
    this.heading('Journal');
    const s = this.state;
    let y = 48;
    const active = s.activeQuests();
    const done = Object.keys(s.d.quests).filter(q => s.quest(q) === 'done');
    for (const id of active.slice(0, 4)) {
      const q = QUESTS[id]; const st = s.quest(id);
      this.t(148, y, q.title, UI.gold);
      this.t(156, y + 11, q.stages[Math.min(st, q.stages.length - 1)], UI.text, { maxWidth: 296 });
      y += 26;
    }
    if (done.length) { this.t(148, y, 'Done: ' + done.map(d => QUESTS[d]?.title).join(', '), UI.dim, { maxWidth: 300 }); y += 22; }
    const aff = Phaser.Math.Clamp(s.var('aff_sella'), 0, 5);
    this.t(148, y, 'Sella', UI.select);
    for (let i = 0; i < 5; i++) this.layer.add(this.add.image(190 + i * 16, y + 4, 'hearts', i < aff ? 4 : 0).setScale(0.75));
    y += 18;
    const mem = MEMORY.filter(([f]) => s.has(f)).map(([, l]) => l);
    this.t(148, y, 'The village remembers', UI.gold); y += 12;
    if (!mem.length) this.t(156, y, 'Nothing yet. Every choice leaves a mark.', UI.dim);
    for (const m of mem.slice(-6)) { this.t(156, y, '• ' + m, UI.text); y += 11; }
  }

  draw_map() {
    const md = this.registry.get('mapData');
    const def = this.registry.get('mapDef');
    this.heading(def?.name ?? 'Map');
    if (!md) return;
    const px = Math.max(2, Math.floor(Math.min(312 / md.w, 188 / md.h)));
    drawMiniMap(this, md, 'bigmap', px);
    const ox = 144 + Math.floor((312 - md.w * px) / 2), oy = 48 + Math.floor((188 - md.h * px) / 2);
    this.layer.add(this.add.image(ox, oy, 'bigmap').setOrigin(0));
    for (const [spot, label] of Object.entries(LABELS[def.id] ?? {})) {
      const p = md.spots[spot]; if (!p) continue;
      const tt = text(this, 0, 0, label, UI.text);
      const bx = Phaser.Math.Clamp(ox + p[0] * px - tt.width / 2, 144, 456 - tt.width), by = oy + p[1] * px - 12;
      const bg = this.add.rectangle(bx - 2, by - 1, tt.width + 4, 10, 0x0a0c20, 0.7).setOrigin(0);
      tt.setPosition(bx, by);
      this.layer.add([bg, tt]);
    }
    const w = this.scene.get('World');
    if (w?.player) {
      const g = this.add.graphics().fillStyle(0xffffff, 1).fillRect(ox + (w.player.x / TILE) * px - 2, oy + (w.player.y / TILE) * px - 4, 4, 4);
      this.layer.add(g);
      this.tweens.add({ targets: g, alpha: 0.2, yoyo: true, repeat: -1, duration: 300 });
    }
  }

  slotRows(forSave) {
    return ['1', '2', '3'].map(slot => {
      const sum = slotSummary(slot);
      return {
        label: `Slot ${slot}`, right: sum ? `${sum.map === 'meadow' ? 'Meadow' : 'Puddlewick'}  ${sum.playtime}` : 'Empty',
        action: () => {
          if (forSave) { writeSlot(slot, this.state); this.sfx('confirm'); bus.emit('toast', { text: `Saved to slot ${slot}`, icon: 'star' }); }
          else { const d = readSlot(slot); if (d) { this.sfx('confirm'); startGame(this, d); } else this.sfx('cancel'); }
        },
      };
    });
  }

  draw_save() {
    this.heading('Save');
    this.rows = [
      ...this.slotRows(true),
      { label: 'Copy save code', color: UI.dim, action: () => this.exportSave() },
    ];
    this.drawRows(164, 52, 16);
    this.t(148, 150, 'The game also autosaves when you change area', UI.dim);
    this.t(148, 161, 'and after choices that matter.', UI.dim);
  }

  draw_load() {
    this.heading('Load');
    const auto = slotSummary('auto');
    this.rows = [
      { label: 'Autosave', right: auto ? `${auto.map === 'meadow' ? 'Meadow' : 'Puddlewick'}  ${auto.playtime}` : 'Empty', action: () => { const d = readSlot('auto'); if (d) startGame(this, d); } },
      ...this.slotRows(false),
      { label: 'Paste save code', color: UI.dim, action: () => this.importSave() },
    ];
    this.drawRows(164, 52, 16);
  }

  draw_settings() {
    this.heading('Settings');
    const am = this.game.audioManager, st = am.settings;
    const bar = v => '■'.repeat(Math.round(v * 10)).padEnd(10, '·');
    this.rows = [
      { label: 'Music', right: `${Math.round(st.music * 100)}%`, adjust: d => { st.music = Phaser.Math.Clamp(Math.round((st.music + d * 0.05) * 100) / 100, 0, 1); am.applyVolumes(); } },
      { label: 'Sound effects', right: `${Math.round(st.sfx * 100)}%`, adjust: d => { st.sfx = Phaser.Math.Clamp(Math.round((st.sfx + d * 0.05) * 100) / 100, 0, 1); am.applyVolumes(); am.sfx('coin'); } },
      { label: 'Mute all (N)', right: st.muted ? 'On' : 'Off', action: () => am.toggleMute(), adjust: () => am.toggleMute() },
    ];
    void bar;
    this.drawRows(164, 52, 16);
    this.t(148, 120, 'Left/Right to adjust.', UI.dim);
    this.t(148, 140, 'Controls', UI.gold);
    const lines = ['Arrows / WASD  walk      Shift  run', 'Space / E  talk, look, pick up', '1-5  use hotbar item   I  bag', 'M  map   J  journal   Esc  menu'];
    lines.forEach((l, i) => this.t(156, 153 + i * 11, l, UI.text));
    this.helpText = 'Left/Right adjust   Enter toggle   Esc close';
  }

  exportSave() {
    const code = exportCode(this.state);
    try { navigator.clipboard?.writeText(code); } catch { /* ignore */ }
    window.prompt('Your save code (copied). Keep it somewhere safe:', code);
    bus.emit('toast', { text: 'Save code copied', icon: 'star' });
  }

  importSave() {
    const code = window.prompt('Paste a save code:');
    if (!code) return;
    const d = importCode(code);
    if (!d) { bus.emit('toast', { text: 'That code did not work', icon: 'heartbreak' }); this.sfx('cancel'); return; }
    startGame(this, d);
  }
}
