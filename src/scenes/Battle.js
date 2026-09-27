import Phaser from 'phaser';
import { UI, WIDTH } from '../config.js';
import { BATTLES, ENEMIES, PARTY, BATTLE_ITEMS } from '../../content/battles.js';
import { PREFABS } from '../../content/prefabs.js';
import { ITEMS } from '../../content/index.js';
import { Window, text, itemIcon } from '../ui/Window.js';
import { check } from '../systems/State.js';
import { bus } from '../systems/bus.js';

// Classic side-view turn-based battles: foes on the left, the party on the right.
const PANEL = { y: 192, h: 72 };
const COMMANDS = ['Attack', 'Lantern', 'Item', 'Defend', 'Talk', 'Run'];
const wait = (scene, ms) => new Promise(r => scene.time.delayedCall(ms, r));

export default class Battle extends Phaser.Scene {
  constructor() { super('Battle'); }

  init(data) {
    this.state = this.registry.get('state');
    this.def = BATTLES[data.id];
    this.battleId = data.id;
    this.over = false;
  }

  create() {
    this.cameras.main.fadeIn(300, 255, 255, 255);
    this.game.audioManager.play(this.def.music ?? 'fight', this);
    this.drawBackdrop(this.def.bg ?? 'road');
    this.spawnEnemies();
    this.spawnParty();
    this.enemyWin = new Window(this, 8, PANEL.y, 168, PANEL.h);
    this.enemyTexts = [];
    this.partyWin = new Window(this, 184, PANEL.y, 288, PANEL.h);
    this.partyRows = [];
    this.menuLayer = this.add.container(0, 0).setDepth(50);
    this.msgWin = new Window(this, 64, 8, 352, 24).setDepth(60).setVisible(false);
    this.msgText = text(this, 76, 16, '', UI.text).setDepth(61).setVisible(false);
    this.refreshPanels();
    this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', w: 'W', s: 'S', a: 'A', d: 'D', ok1: 'SPACE', ok2: 'ENTER', ok3: 'E', back: 'ESC', back2: 'X' });
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.events.once('shutdown', () => this.input.keyboard.removeAllListeners());
    window.__battle = this;
    this.run();
  }

  // ------------------------------------------------------------------ scene art
  drawBackdrop(kind) {
    const g = this.add.graphics();
    const sky = { road: [0x9ad0ff, 0xe9f4ff], town: [0xffc98f, 0xfff0d0], nest: [0x2a2340, 0x5a4a78] }[kind] ?? [0x9ad0ff, 0xe9f4ff];
    g.fillGradientStyle(sky[0], sky[0], sky[1], sky[1], 1).fillRect(0, 0, WIDTH, 110);
    for (let y = 104; y < 192; y += 16) for (let x = 0; x < WIDTH; x += 16) {
      const frame = kind === 'town' && y > 150 && y < 175 ? 177 : 264 + ((x * 7 + y * 3) % 5 === 0 ? 1 + ((x + y) % 4) : 0);
      const t = this.add.image(x, y, 't_floor', frame).setOrigin(0);
      if (kind === 'nest') t.setTint(0x8a7ea8);
    }
    const trees = kind === 'town' ? ['house_orange', 'tree_pink', 'house_red', 'tree', 'house_round', 'pine', 'house_wood'] : kind === 'nest' ? ['tree_bare', 'tree_bare', 'pine', 'tree_bare', 'tree_bare', 'pine', 'tree_bare', 'tree_bare'] : ['tree', 'pine', 'tree_round', 'bigtree_lime', 'pine', 'tree', 'tree_round', 'pine'];
    const PF = PREFABS;
    const row = (y, offset, tint, alpha) => {
      let x = offset;
      for (let i = 0; x < WIDTH; i++) {
        const pf = PF[trees[(i + (offset ? 3 : 0)) % trees.length]];
        const key = 't_' + pf.sheet, fr = `${pf.c},${pf.r},${pf.w},${pf.h}`;
        const tex = this.textures.get(key);
        if (!tex.has(fr)) tex.add(fr, 0, pf.c * 16, pf.r * 16, pf.w * 16, pf.h * 16);
        const img = this.add.image(x, y, key, fr).setOrigin(0, 1).setAlpha(alpha);
        if (tint) img.setTint(tint);
        x += img.width + 2;
      }
    };
    row(104, -20, kind === 'nest' ? 0x544a70 : 0x7fa0c0, 0.8);
    row(112, -6, kind === 'nest' ? 0x7a6c98 : null, 1);
    if (kind === 'nest') {
      this.add.particles(0, 0, 'px', { x: { min: 0, max: WIDTH }, y: { min: 20, max: 180 }, lifespan: 3000, speed: { min: 4, max: 12 }, alpha: { start: 0.6, end: 0 }, tint: 0xb8a8e8, frequency: 120 });
    }
    this.add.rectangle(0, 192, WIDTH, 78, 0x0a0c20, 1).setOrigin(0);
  }

  makeSprite(spriteDef, x, y, tint, facing, desat = 0) {
    const [kind, file] = spriteDef.split(':');
    let spr;
    if (kind === 'boss') {
      spr = this.add.sprite(x, y, 'b_' + file, 0).setOrigin(0.5, 1).setScale(2);
      if (!this.anims.exists('b_' + file)) this.anims.create({ key: 'b_' + file, frames: this.anims.generateFrameNumbers('b_' + file, { start: 0, end: 4 }), frameRate: 6, repeat: -1 });
      spr.play('b_' + file);
    } else {
      const key = (kind === 'm' ? 'm_' : 'c_') + file;
      const col = facing === 'front' ? 0 : facing === 'right' ? 3 : 2;
      spr = this.add.sprite(x, y, key, col).setOrigin(0.5, 1).setScale(2);
      const ak = `${key}_bt_${facing}`;
      const short = this.textures.get(key).frameTotal < 17;
      if (!this.anims.exists(ak)) this.anims.create({ key: ak, frames: this.anims.generateFrameNumbers(key, { frames: short ? [col, col + 4] : [col, col + 4, col + 8, col + 12] }), frameRate: 6, repeat: -1 });
      spr.play(ak);
    }
    if (desat && spr.preFX) spr.preFX.addColorMatrix().saturate(-desat);
    if (tint) spr.setTint(tint);
    this.add.image(x, y - 1, 'shadow').setScale(kind === 'boss' ? 5 : 2).setAlpha(0.35).setDepth(-1);
    spr.baseTint = tint;
    return spr;
  }

  spawnEnemies() {
    this.enemies = [];
    const list = this.def.enemies;
    const bossIdx = list.findIndex(e => ENEMIES[e].boss);
    const slots = bossIdx >= 0 ? [[184, 140], [184, 176], [40, 150], [150, 120]] : [[120, 160], [80, 140], [80, 176], [160, 140], [160, 176]];
    let k = 0;
    list.forEach((id, i) => this.addEnemy(id, i === bossIdx ? [104, 172] : slots[k++] ?? slots[0]));
  }

  addEnemy(id, pos) {
    const e = ENEMIES[id];
    const spr = this.makeSprite(e.sprite, pos[0], pos[1], e.tint, e.front ? 'front' : 'right', e.desat);
    spr.setDepth(pos[1]);
    this.tweens.add({ targets: spr, y: pos[1] - 2, yoyo: true, repeat: -1, duration: 700 + Math.random() * 400, ease: 'Sine.inOut' });
    const n = this.enemies.filter(x => x.id === id).length;
    const foe = { side: 'enemy', id, info: e, name: e.name + (n ? ' ' + 'BCD'[n - 1] : ''), hp: e.hp, maxHp: e.hp, atk: e.atk, def: e.def, spd: e.spd, spr, x: pos[0], y: pos[1], alive: true };
    this.enemies.push(foe);
    return foe;
  }

  spawnParty() {
    this.party = this.state.d.members.map((id, i) => {
      const p = this.state.member(id), s = this.state.stats(id);
      const x = 392 + i * 16, y = 140 + i * 32;
      const spr = this.makeSprite('c:' + PARTY[id].sprite, x, y, null, 'left');
      spr.setDepth(y);
      return { side: 'party', id, name: PARTY[id].name, get hp() { return p.hp; }, set hp(v) { p.hp = v; }, get lp() { return p.lp; }, set lp(v) { p.lp = v; }, maxHp: s.maxHp, maxLp: s.maxLp, atk: s.atk, def: s.def, spd: s.spd, spr, x, y, defending: false, get alive() { return p.hp > 0; } };
    });
  }

  refreshPanels() {
    for (const t of this.enemyTexts) t.destroy();
    this.enemyTexts = this.enemies.filter(e => e.alive).slice(0, 5).map((e, i) => text(this, 20, PANEL.y + 8 + i * 12, e.name, UI.text));
    for (const r of this.partyRows) r.destroy();
    this.partyRows = [];
    this.party.forEach((m, i) => {
      const y = PANEL.y + 10 + i * 22;
      const active = this.current === m;
      const nameT = text(this, 200, y, m.name, active ? UI.select : m.alive ? UI.text : 0x8088aa);
      const hpT = text(this, 262, y, `HP ${String(Math.max(0, m.hp)).padStart(3)}/${m.maxHp}`, m.hp <= m.maxHp * 0.25 ? UI.heart : UI.text);
      const lpT = text(this, 372, y, `LP ${String(m.lp).padStart(2)}/${m.maxLp}`, UI.dim);
      const g = this.add.graphics();
      g.fillStyle(0x0a0c20, 1).fillRect(262, y + 10, 96, 3);
      g.fillStyle(m.hp <= m.maxHp * 0.25 ? UI.heart : 0x7de0a2, 1).fillRect(262, y + 10, Math.round(96 * Math.max(0, m.hp) / m.maxHp), 3);
      g.fillStyle(0x0a0c20, 1).fillRect(372, y + 10, 72, 3);
      g.fillStyle(0xffd35a, 1).fillRect(372, y + 10, Math.round(72 * m.lp / m.maxLp), 3);
      this.partyRows.push(nameT, hpT, lpT, g);
    });
  }

  // ------------------------------------------------------------------ flow
  async run() {
    await this.say(this.def.intro ?? 'Enemies appear!', 1200);
    while (!this.over) {
      const actors = [...this.party.filter(p => p.alive), ...this.enemies.filter(e => e.alive)]
        .map(a => ({ a, init: a.spd + Math.random() * 4 })).sort((x, y) => y.init - x.init).map(x => x.a);
      for (const a of actors) {
        if (this.over || !a.alive) continue;
        if (a.side === 'party') {
          a.defending = false;
          this.current = a; this.refreshPanels();
          const action = await this.chooseAction(a);
          this.current = null; this.refreshPanels();
          await this.perform(a, action);
        } else await this.enemyTurn(a);
        if (this.checkEnd()) break;
      }
    }
  }

  checkEnd() {
    if (this.over) return true;
    if (this.enemies.every(e => !e.alive)) { this.win(); return true; }
    if (this.party.every(p => !p.alive)) { this.lose(); return true; }
    return false;
  }

  say(msg, ms = 900) {
    this.msgWin.setVisible(true); this.msgText.setVisible(true).setText(msg);
    return wait(this, ms).then(() => { this.msgWin.setVisible(false); this.msgText.setVisible(false); });
  }

  // ------------------------------------------------------------------ menus
  chooseAction(actor) {
    return new Promise(resolve => {
      this.pending = { resolve, actor, stage: 'command', sel: this.lastCommand?.[actor.id] ?? 0 };
      this.drawMenu();
      this.tweens.add({ targets: actor.spr, x: actor.x - 10, duration: 120 });
    });
  }

  menuOptions() {
    const p = this.pending, a = p.actor;
    if (p.stage === 'command') return COMMANDS.map(c => ({ label: c, disabled: (c === 'Run' && this.def.noRun) || (c === 'Talk' && !this.def.talk) }));
    if (p.stage === 'skill') return PARTY[a.id].skills.filter(s => (this.state.member(a.id).lvl ?? 1) >= s.level).map(s => ({ label: `${s.name}`, right: `${s.lp}`, skill: s, disabled: a.lp < s.lp, desc: s.desc }));
    if (p.stage === 'item') return BATTLE_ITEMS.filter(id => this.state.count(id) > 0 && ITEMS[id]).map(id => ({ label: ITEMS[id].name, right: `x${this.state.count(id)}`, item: id, desc: ITEMS[id].desc }));
    if (p.stage === 'target') return p.targets.map(t => ({ label: t.name, target: t }));
    return [];
  }

  drawMenu() {
    this.menuLayer.removeAll(true);
    const p = this.pending;
    if (!p) return;
    const opts = this.menuOptions();
    if (p.stage === 'target') {
      const t = opts[p.sel]?.target;
      if (t) {
        const cur = this.add.graphics().fillStyle(UI.select, 1);
        const half = t.spr.displayWidth / 2 + 6;
        const cx = t.x + (t.side === 'enemy' ? half : -half), cy = t.y - t.spr.displayHeight / 2;
        t.spr.setAlpha(0.65); this.time.delayedCall(140, () => t.spr.setAlpha(1));
        if (t.side === 'enemy') cur.fillTriangle(cx, cy, cx + 7, cy - 5, cx + 7, cy + 5); else cur.fillTriangle(cx, cy, cx - 7, cy - 5, cx - 7, cy + 5);
        this.menuLayer.add(cur);
        this.tweens.add({ targets: cur, x: t.side === 'enemy' ? 3 : -3, yoyo: true, repeat: -1, duration: 250 });
        this.tag(`Target: ${t.name}${t.side === 'enemy' ? `  (${Math.max(0, t.hp)}/${t.maxHp})` : ''}`);
      }
      return;
    }
    const w = 168, rows = Math.max(1, opts.length);
    const h = Math.ceil((rows * 11 + 12) / 8) * 8;
    const y = p.stage === 'command' ? PANEL.y : PANEL.y - h;
    const win = new Window(this, 8, y, w, p.stage === 'command' ? PANEL.h : h);
    this.menuLayer.add(win);
    if (p.stage === 'command') {
      opts.forEach((o, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const t = text(this, 28 + col * 76, y + 10 + row * 18, o.label, o.disabled ? 0x6a72a0 : i === p.sel ? UI.select : UI.text);
        this.menuLayer.add(t);
      });
      const col = p.sel % 2, row = Math.floor(p.sel / 2);
      const cur = this.add.graphics().fillStyle(UI.select, 1).fillTriangle(18 + col * 76, y + 10 + row * 18, 18 + col * 76, y + 18 + row * 18, 23 + col * 76, y + 14 + row * 18);
      this.menuLayer.add(cur);
      this.tag(`${p.actor.name}'s turn`);
    } else {
      if (!opts.length) this.menuLayer.add(text(this, 24, y + 8, p.stage === 'item' ? 'No usable items.' : 'No skills.', UI.dim));
      opts.forEach((o, i) => {
        if (o.item) { const ic = itemIcon(this, 22, y + 11 + i * 11, o.item).setScale(0.6); this.menuLayer.add(ic); }
        this.menuLayer.add(text(this, 32, y + 7 + i * 11, o.label, o.disabled ? 0x6a72a0 : i === p.sel ? UI.select : UI.text));
        if (o.right) this.menuLayer.add(text(this, 150, y + 7 + i * 11, o.right, UI.dim));
      });
      const d = opts[p.sel]?.desc;
      if (d) this.tag(d, y - 16);
    }
  }

  // Small name-tag window for turn, target and skill hints.
  tag(str, y = 8) {
    const w = new Window(this, 8, y, 216, 16);
    this.menuLayer.add(w);
    this.menuLayer.add(text(this, 16, y + 3, str, UI.select));
  }

  onKey(e) {
    const p = this.pending;
    if (this.over && this.canLeave && ['Space', 'Enter', 'KeyE'].includes(e.code)) return this.leave();
    if (!p) return;
    const opts = this.menuOptions();
    const k = e.code;
    const move = d => { p.sel = (p.sel + d + Math.max(1, opts.length)) % Math.max(1, opts.length); this.game.audioManager.sfx('move', { volume: 0.5 }); this.drawMenu(); };
    if (p.stage === 'command') {
      if (k === 'ArrowUp' || k === 'KeyW') move(-2);
      else if (k === 'ArrowDown' || k === 'KeyS') move(2);
      else if (k === 'ArrowLeft' || k === 'KeyA') move(-1);
      else if (k === 'ArrowRight' || k === 'KeyD') move(1);
    } else if (k === 'ArrowUp' || k === 'KeyW' || k === 'ArrowLeft' || k === 'KeyA') move(-1);
    else if (k === 'ArrowDown' || k === 'KeyS' || k === 'ArrowRight' || k === 'KeyD') move(1);
    if (k === 'Escape' || k === 'KeyX' || k === 'Backspace') {
      if (p.stage !== 'command') { p.stage = p.prev ?? 'command'; p.prev = null; p.sel = 0; this.game.audioManager.sfx('cancel', { volume: 0.5 }); this.drawMenu(); }
      return;
    }
    if (!['Space', 'Enter', 'KeyE'].includes(k)) return;
    const o = opts[p.sel];
    if (!o || o.disabled) { this.game.audioManager.sfx('cancel', { volume: 0.5 }); return; }
    this.game.audioManager.sfx('accept', { volume: 0.6 });
    if (p.stage === 'command') {
      this.lastCommand = { ...(this.lastCommand ?? {}), [p.actor.id]: p.sel };
      const c = o.label;
      if (c === 'Attack') return this.pickTarget({ kind: 'attack' }, 'enemy');
      if (c === 'Lantern') { p.stage = 'skill'; p.sel = 0; return this.drawMenu(); }
      if (c === 'Item') { p.stage = 'item'; p.sel = 0; return this.drawMenu(); }
      return this.finish({ kind: c.toLowerCase() });
    }
    if (p.stage === 'skill') {
      const s = o.skill;
      if (s.target === 'enemies') return this.finish({ kind: 'skill', skill: s, targets: this.enemies.filter(x => x.alive) });
      return this.pickTarget({ kind: 'skill', skill: s }, s.target === 'ally' ? 'ally' : 'enemy', 'skill');
    }
    if (p.stage === 'item') return this.pickTarget({ kind: 'item', item: o.item }, 'ally', 'item');
    if (p.stage === 'target') return this.finish({ ...p.action, targets: [o.target] });
  }

  pickTarget(action, side, prev = 'command') {
    const p = this.pending;
    p.action = action; p.prev = prev; p.stage = 'target';
    p.targets = side === 'enemy' ? this.enemies.filter(e => e.alive) : this.party;
    p.sel = side === 'ally' ? Math.max(0, p.targets.indexOf(p.actor)) : 0;
    this.drawMenu();
  }

  finish(action) {
    const p = this.pending;
    this.pending = null;
    this.menuLayer.removeAll(true);
    this.tweens.add({ targets: p.actor.spr, x: p.actor.x, duration: 120 });
    p.resolve(action);
  }

  // ------------------------------------------------------------------ actions
  damage(atk, def, power = 0) {
    const base = power ? power + atk * 0.6 : atk * 1.5;
    return Math.max(1, Math.round(base * (0.9 + Math.random() * 0.25) - def * 0.8));
  }

  async lunge(actor, dir) {
    await new Promise(r => this.tweens.add({ targets: actor.spr, x: actor.x + dir * 22, duration: 120, yoyo: true, onComplete: r }));
  }

  popNumber(t, str, color) {
    const y = t.y - t.spr.displayHeight - 4;
    const c = this.add.container(0, 0).setDepth(200);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.add(text(this, dx, dy, str, 0x0a0c20).setScale(2));
    const n = text(this, 0, 0, str, color).setScale(2);
    c.add(n);
    c.setPosition(Math.round(t.x - n.width / 2), y);
    this.tweens.add({ targets: c, y: y - 8, duration: 140, ease: 'Quad.out', yoyo: false, onComplete: () => this.tweens.add({ targets: c, y: y - 4, duration: 120 }) });
    this.tweens.add({ targets: c, alpha: 0, delay: 700, duration: 350, onComplete: () => c.destroy() });
  }

  hit(t, amount) {
    t.hp = Math.max(0, t.hp - amount);
    this.popNumber(t, String(amount), amount >= 14 ? UI.gold : UI.text);
    t.spr.setTintFill(0xffffff);
    this.time.delayedCall(90, () => { t.spr.clearTint(); if (t.spr.baseTint) t.spr.setTint(t.spr.baseTint); });
    this.tweens.add({ targets: t.spr, x: t.x + (t.side === 'enemy' ? -4 : 4), yoyo: true, repeat: 1, duration: 50 });
    this.game.audioManager.sfx(amount > 12 ? 'hit5' : 'hit2', { volume: 0.6 });
    if (t.hp <= 0) this.faint(t);
    this.refreshPanels();
  }

  heal(t, amount) {
    const s = this.state;
    const before = t.hp;
    t.hp = Math.min(t.maxHp, t.hp + amount);
    this.popNumber(t, `+${t.hp - before}`, 0x7de0a2);
    this.game.audioManager.sfx('heal2', { volume: 0.6 });
    void s;
    this.refreshPanels();
  }

  faint(t) {
    if (t.side === 'enemy') {
      t.alive = false;
      this.tweens.killTweensOf(t.spr);
      this.tweens.add({ targets: t.spr, alpha: 0, scaleY: 0.2, duration: 400 });
    } else {
      t.spr.anims.stop(); t.spr.setOrigin(0.5, 0.5).setY(t.y - 8).setAngle(90).setTint(0x8088aa).setAlpha(0.8);
    }
  }

  async perform(a, action) {
    if (action.kind === 'attack') {
      const t = action.targets[0].alive ? action.targets[0] : this.enemies.find(e => e.alive);
      if (!t) return;
      await this.lunge(a, -1);
      this.game.audioManager.sfx('slash', { volume: 0.5 });
      this.hit(t, this.damage(a.atk, t.def));
      await wait(this, 450);
    } else if (action.kind === 'skill') {
      const s = action.skill;
      a.lp -= s.lp; this.refreshPanels();
      await this.say(`${a.name}: ${s.name}!`, 600);
      this.flashSkill(s);
      for (const t0 of action.targets) {
        const t = t0.alive || s.heal ? t0 : this.enemies.find(e => e.alive);
        if (!t) continue;
        if (s.heal) { if (t.alive) this.heal(t, s.heal + a.atk); }
        else this.hit(t, this.damage(a.atk, t.def, s.power));
        await wait(this, 180);
      }
      await wait(this, 350);
    } else if (action.kind === 'item') {
      const item = ITEMS[action.item];
      const t = action.targets[0];
      this.state.take(action.item);
      await this.say(`${a.name} uses ${item.name}.`, 600);
      for (const e of item.use ?? []) {
        if (typeof e.heal === 'number' && t.alive) this.heal(t, e.heal);
        if (typeof e.lp === 'number') { t.lp = Math.min(t.maxLp, t.lp + e.lp); this.popNumber(t, `+${e.lp} LP`, UI.gold); this.refreshPanels(); }
      }
      await wait(this, 400);
    } else if (action.kind === 'defend') {
      a.defending = true;
      await this.say(`${a.name} braces behind the lantern.`, 700);
    } else if (action.kind === 'talk') {
      const tk = this.def.talk;
      let chance = tk.chance;
      for (const [cond, bonus] of tk.bonus ?? []) if (check(this.state, cond)) chance += bonus;
      if (Math.random() < chance) { await this.say(tk.win, 1500); this.win(true); }
      else await this.say(tk.fail, 1100);
    } else if (action.kind === 'run') {
      if (Math.random() < 0.7) { this.game.audioManager.sfx('whoosh'); await this.say('You slip away!', 800); this.end('ran'); }
      else await this.say('Could not get away!', 900);
    }
  }

  flashSkill(s) {
    const fl = this.add.rectangle(0, 0, WIDTH, 192, s.heal ? 0x9dffc0 : 0xffe0a0, 0.35).setOrigin(0).setBlendMode('ADD').setDepth(150);
    this.tweens.add({ targets: fl, alpha: 0, duration: 400, onComplete: () => fl.destroy() });
    this.game.audioManager.sfx(s.heal ? 'heal' : 'magic3', { volume: 0.6 });
  }

  async enemyTurn(e) {
    const targets = this.party.filter(p => p.alive);
    if (!targets.length) return;
    const move = (e.info.moves ?? []).find(m => Math.random() < m.chance);
    await this.lunge(e, 1);
    if (move?.summon) {
      if (this.enemies.filter(x => x.alive).length < 4) {
        await this.say(`${e.name} calls ${move.text}`, 900);
        const free = [[184, 140], [184, 176], [40, 150], [150, 120]].find(p => !this.enemies.some(x => x.alive && x.x === p[0] && x.y === p[1]));
        if (free) { const n = this.addEnemy(move.summon, free); n.spr.setAlpha(0); this.tweens.add({ targets: n.spr, alpha: 1, duration: 300 }); this.refreshPanels(); }
        return;
      }
    }
    if (move) {
      await this.say(`${e.name} uses ${move.text}`, 800);
      const hitList = move.all ? targets : [Phaser.Utils.Array.GetRandom(targets)];
      for (const t of hitList) {
        const dmg = this.damage(e.atk, t.def, move.power) * (t.defending ? 0.5 : 1);
        this.hit(t, Math.max(1, Math.round(dmg)));
        if (move.drainLp) { t.lp = Math.max(0, t.lp - move.drainLp); this.refreshPanels(); }
      }
    } else {
      const t = Phaser.Utils.Array.GetRandom(targets);
      const dmg = this.damage(e.atk, t.def) * (t.defending ? 0.5 : 1);
      this.hit(t, Math.max(1, Math.round(dmg)));
    }
    await wait(this, 500);
  }

  // ------------------------------------------------------------------ outcomes
  async win(talked = false) {
    if (this.over) return;
    this.over = true;
    this.pending = null; this.menuLayer.removeAll(true);
    const foes = this.enemies;
    const xp = talked ? Math.round(foes.reduce((s, e) => s + e.info.xp, 0) / 2) : foes.reduce((s, e) => s + e.info.xp, 0);
    const gold = talked ? 0 : foes.reduce((s, e) => s + e.info.gold, 0);
    this.game.audioManager.sfx('jingle', { volume: 0.7 });
    this.state.addGold(gold);
    const ups = this.state.gainXp(xp);
    for (const m of this.party) { const s = this.state.stats(m.id); m.maxHp = s.maxHp; m.maxLp = s.maxLp; if (m.hp <= 0) m.hp = 1; }
    this.refreshPanels();
    const lines = [talked ? 'Peace, for now.' : 'Victory!', `+${xp} XP${gold ? `   +${gold} gold` : ''}`, ...ups.map(u => `${PARTY[u.id].name} reached level ${u.lvl}!`)];
    if (ups.length) this.game.audioManager.sfx('levelup', { volume: 0.7 });
    const h = Math.ceil((lines.length * 12 + 32) / 8) * 8;
    new Window(this, 144, 48, 192, h).setDepth(300);
    lines.forEach((l, i) => text(this, 160, 58 + i * 12, l, i === 0 ? UI.gold : UI.text).setDepth(301));
    this.victoryH = h;
    for (const m of this.party) if (m.alive) this.tweens.add({ targets: m.spr, y: m.y - 6, yoyo: true, repeat: 2, duration: 150 });
    await wait(this, 600);
    this.result = talked ? 'talked' : 'won';
    this.canLeave = true;
    const tri = this.add.graphics().setDepth(301).fillStyle(UI.select, 1).fillTriangle(144 + 192 - 18, 48 + h - 12, 144 + 192 - 10, 48 + h - 12, 144 + 192 - 14, 48 + h - 8);
    this.tweens.add({ targets: tri, y: 2, yoyo: true, repeat: -1, duration: 350 });
  }

  async lose() {
    if (this.over) return;
    this.over = true;
    this.pending = null; this.menuLayer.removeAll(true);
    this.game.audioManager.sfx('jingle_gameover', { volume: 0.7 });
    const win = new Window(this, 104, 64, 272, 48).setDepth(300);
    void win;
    text(this, 118, 74, 'The light gutters out...', UI.heart).setDepth(301);
    text(this, 118, 88, 'Someone carries you home.', UI.text).setDepth(301);
    await wait(this, 800);
    this.result = 'lost';
    this.canLeave = true;
  }

  leave() { this.end(this.result); }

  end(result) {
    if (this.ended) return;
    this.ended = true;
    this.cameras.main.fadeOut(300, 10, 12, 28);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      bus.emit('battle-over', { id: this.battleId, result });
    });
  }
}
