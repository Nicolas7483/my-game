import Phaser from 'phaser';
import { TILE, SPEED, DEPTH, DAY_LENGTH, WIDTH, HEIGHT } from '../config.js';
import { SHEETS } from '../../content/prefabs.js';
import { NPCS, EXAMINE, INTRO } from '../../content/story.js';
import { FALLBACK } from '../../content/tileinfo.js';
import { buildMap, rng } from '../systems/MapBuilder.js';
import { check } from '../systems/State.js';
import { bus } from '../systems/bus.js';
import { writeSlot } from '../systems/Save.js';
import { EMOTES } from './Preload.js';
import town from '../../content/maps/town.js';
import meadow from '../../content/maps/meadow.js';

export const MAPS = { town, meadow };
const DIRS = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

// Sky tint over a day (multiply blend). Hours -> colour.
const SKY = [[0, 0x363f78], [4.5, 0x363f78], [6, 0xcdb6d6], [7.5, 0xffffff], [16.5, 0xffffff], [18, 0xffd2a0], [19.5, 0x8c7fb8], [21, 0x363f78], [24, 0x363f78]];
function skyAt(h) {
  h = ((h % 24) + 24) % 24;
  for (let i = 0; i < SKY.length - 1; i++) {
    const [h0, c0] = SKY[i], [h1, c1] = SKY[i + 1];
    if (h >= h0 && h <= h1) {
      const t = (h - h0) / (h1 - h0 || 1);
      const a = Phaser.Display.Color.IntegerToColor(c0), b = Phaser.Display.Color.IntegerToColor(c1);
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, 100, t * 100);
      return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
    }
  }
  return 0xffffff;
}
export function darkness(h) {
  h = ((h % 24) + 24) % 24;
  if (h >= 21 || h < 4.5) return 1;
  if (h >= 18) return (h - 18) / 3;
  if (h < 7) return 1 - (h - 4.5) / 2.5;
  return 0;
}

export default class World extends Phaser.Scene {
  constructor() { super('World'); }

  init(data) {
    this.state = this.registry.get('state');
    this.qa = this.registry.get('qa');
    this.mapId = data.map ?? this.state.d.map ?? 'town';
    this.arriveSpot = data.spot;
    this.intro = data.intro;
    this.busy = false; // true while a dialogue or menu owns the input
  }

  create() {
    const def = MAPS[this.mapId];
    this.def = def;
    this.state.d.map = this.mapId;
    this.md = buildMap(def, this.state);
    this.registry.set('mapData', this.md);
    this.registry.set('mapDef', def);
    this.cameras.main.setBackgroundColor('#2a5a3a');

    this.buildTilemap();
    this.buildProps();
    this.buildAmbience();
    this.spawnPlayer();
    this.spawnNpcs();
    this.buildNight();
    this.setupInput();
    this.setupBus();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.md.w * TILE, this.md.h * TILE);
    cam.startFollow(this.player, true, 0.18, 0.18);
    cam.setRoundPixels(true);
    cam.fadeIn(400, 10, 12, 28);

    if (!this.scene.isActive('HUD')) this.scene.launch('HUD');
    else this.scene.get('HUD').events.emit('map-changed');
    this.scene.bringToTop('HUD');
    this.game.audioManager.play(this.musicId(), this);
    this.lastNight = this.state.isNight();
    this.autosaveTimer = 0;
    if (this.intro) this.time.delayedCall(700, () => this.openDialogue(null, null, INTRO));
    this.events.emit('ready');
    window.__world = this;
  }

  musicId() {
    if (this.state.has('inspector_here') && this.mapId === 'town' && !this.state.has('prologue_done')) return 'tension';
    return this.state.isNight() ? this.def.music.night : this.def.music.day;
  }

  // ---------------------------------------------------------------- map
  buildTilemap() {
    const { w, h, layers } = this.md;
    const map = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: w, height: h });
    this.tilemap = map;
    let gid = 1;
    const tilesets = {};
    for (const key of Object.keys(SHEETS)) {
      const src = this.textures.get('i_' + key).getSourceImage();
      const count = Math.floor(src.width / TILE) * Math.floor(src.height / TILE);
      tilesets[key] = map.addTilesetImage(key, 'i_' + key, TILE, TILE, 0, 0, gid);
      tilesets[key].first = gid;
      gid += count;
    }
    const all = Object.values(tilesets);
    const depthOf = { ground: DEPTH.ground, terrain: DEPTH.terrain, overlay: DEPTH.overlay, deco: DEPTH.deco };
    for (const name of ['ground', 'terrain', 'overlay', 'deco']) {
      const layer = map.createBlankLayer(name, all, 0, 0, w, h);
      layer.setDepth(depthOf[name]);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const t = layers[name][y][x];
        if (!t) continue;
        const tile = layer.putTileAt(tilesets[t.sheet].first + t.i, x, y);
        if (t.tint) tile.tint = t.tint;
      }
    }
    // Water shimmer: a few animated ripples on open water.
    const r = rng(5);
    for (const [x, y] of this.md.water) {
      if (r() < 0.12) {
        const s = this.add.sprite(x * TILE + 8, y * TILE + 8, 'ripples').setDepth(DEPTH.overlay).setAlpha(0.8);
        s.play({ key: 'ripples', startFrame: Math.floor(r() * 4) });
      }
    }
  }

  buildProps() {
    this.props = [];
    this.lights = [];
    for (const pr of this.md.props) {
      const { pf } = pr;
      const key = 'i_' + pf.sheet;
      const frameName = `${pf.c},${pf.r},${pf.w},${pf.h}`;
      const tex = this.textures.get(key);
      if (!tex.has(frameName)) tex.add(frameName, 0, pf.c * TILE, pf.r * TILE, pf.w * TILE, pf.h * TILE);
      const img = this.add.image(pr.x * TILE, pr.y * TILE, key, frameName).setOrigin(0, 0);
      img.setDepth(DEPTH.world + (pr.y + pf.h) * TILE - 1);
      pr.img = img;
      this.props.push(pr);
      for (const [lx, ly] of pf.glow ?? []) this.addLight(pr.x * TILE + lx, pr.y * TILE + ly, 'glow', 0.9);
      if (pr.name.startsWith('house') && r2() < 0.5) this.addChimney(pr.x * TILE + pf.w * TILE - 12, pr.y * TILE + 4);
    }
    function r2() { return Math.random(); }
    for (const d of this.def.decals ?? []) {
      if (d.key === 'reeds') {
        for (let i = 0; i < 3; i++) this.add.image(d.x * TILE + i * 14, d.y * TILE, 't_nature', 243 + (i % 2)).setOrigin(0, 0).setDepth(DEPTH.world + d.y * TILE + 16);
      } else this.add.image(d.x * TILE, d.y * TILE, d.key).setOrigin(0, 0).setDepth(DEPTH.overlay + 1);
    }
    if (this.def.dimspot) {
      const ds = this.def.dimspot;
      this.dimspot = this.add.image(ds.x * TILE, ds.y * TILE, 'dim').setScale(ds.r * TILE * 2 / 128).setDepth(DEPTH.deco + 1).setBlendMode(Phaser.BlendModes.MULTIPLY);
      this.tweens.add({ targets: this.dimspot, alpha: 0.7, yoyo: true, repeat: -1, duration: 1800 });
    }
  }

  addChimney(x, y) {
    this.time.addEvent({ delay: 2600 + Math.random() * 1500, loop: true, callback: () => {
      if (!this.sys.isActive()) return;
      const s = this.add.sprite(x, y, 'smoke').setDepth(DEPTH.above).setAlpha(0.55).setScale(0.5);
      s.play('smoke');
      this.tweens.add({ targets: s, y: y - 14, alpha: 0, duration: 900, onComplete: () => s.destroy() });
    } });
  }

  addLight(x, y, key = 'glow', scale = 1) {
    const l = this.add.image(x, y, key).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.light).setScale(scale).setAlpha(0);
    l.baseScale = scale;
    this.lights.push(l);
    return l;
  }

  buildAmbience() {
    const { w, h } = this.md;
    // Drifting leaves by day, fireflies by night.
    const leafKey = this.mapId === 'town' ? 'leafpink' : 'leaf';
    this.leaves = this.add.particles(0, 0, leafKey, {
      frame: [0, 1, 2, 3, 4, 5], x: { min: 0, max: w * TILE }, y: -10, lifespan: 9000, speedY: { min: 12, max: 22 }, speedX: { min: -14, max: 8 },
      rotate: { min: 0, max: 360 }, frequency: 900, quantity: 1, alpha: { start: 0.9, end: 0 },
    }).setDepth(DEPTH.above + 1);
    this.fireflies = this.add.particles(0, 0, 'px', {
      x: { min: 0, max: w * TILE }, y: { min: 0, max: h * TILE }, lifespan: 4000, speed: { min: 2, max: 8 },
      alpha: { start: 0, end: 0, ease: t => Math.sin(t * Math.PI) }, tint: [0xfff3a0, 0xc8ff9a, 0xfff8d0], scale: { min: 0.5, max: 1 },
      frequency: 140, blendMode: 'ADD', emitting: false,
    }).setDepth(DEPTH.light + 1);
    this.fireflies.alphaMax = 0;
  }

  // ---------------------------------------------------------------- actors
  makeActor(key, x, y, opts = {}) {
    const c = this.add.container(x, y);
    const shadow = this.add.image(0, -1, 'shadow').setAlpha(0.45);
    const spr = this.add.sprite(0, 0, key, 0).setOrigin(0.5, 1);
    c.add([shadow, spr]);
    c.spr = spr; c.key = key; c.facing = 'down'; c.moving = false;
    if (opts.tint) spr.setTint(opts.tint);
    c.setDepth(DEPTH.world + y);
    return c;
  }

  face(actor, dir) {
    actor.facing = dir;
    if (!actor.moving) { actor.spr.anims.stop(); actor.spr.setFrame(['down', 'up', 'left', 'right'].indexOf(dir)); }
  }

  spawnPlayer() {
    const s = this.state.d;
    let x, y;
    const spot = this.arriveSpot && this.md.spots[this.arriveSpot];
    if (spot) { x = spot[0] * TILE + 8; y = spot[1] * TILE + 12; }
    else if (s.x != null && s.map === this.mapId) { x = s.x; y = s.y; }
    else { const st = this.md.spots.start; x = st[0] * TILE + 8; y = st[1] * TILE + 12; }
    this.player = this.makeActor('c_hunter', x, y);
    this.face(this.player, s.facing || 'down');
    this.lantern = this.addLight(x, y - 8, 'glow_big', 0.9);
    this.lantern.isLantern = true;
    this.stepTimer = 0; this.stepIdx = 0;
    this.companion = null;
    if (this.state.has('wisp_friend')) this.spawnCompanion();
  }

  spawnCompanion() {
    if (this.companion) return;
    const p = this.player;
    this.companion = this.makeActor('c_spirit', p.x - 12, p.y - 2);
    this.companion.spr.setAlpha(0.9).play('c_spirit_walk_down');
    this.companion.glow = this.addLight(p.x, p.y, 'glow_cyan', 0.6);
    this.companion.glow.always = true;
    this.tweens.add({ targets: this.companion.spr, y: -3, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });
  }

  spawnNpcs() {
    this.npcs = [];
    const list = Array.isArray(NPCS) ? NPCS : Object.values(NPCS);
    for (const def of list) {
      // the first spawn whose condition passes wins, even if it is on another map
      const first = def.spawns?.find(s => check(this.state, s.if));
      if (!first || first.map !== this.mapId) continue;
      const spot = this.md.spots[first.spot];
      if (!spot) { console.warn('missing spot', first.spot); continue; }
      const x = (spot[0] + (first.dx ?? 0)) * TILE + 8, y = (spot[1] + (first.dy ?? 0)) * TILE + 12;
      const key = 'c_' + def.sprite.toLowerCase();
      const npc = this.makeActor(key, x, y, { tint: def.id === 'umbra' ? 0xd8c8ff : undefined });
      npc.def = def; npc.home = { x, y }; npc.wander = first.wander ?? 0; npc.wait = 1000 + Math.random() * 2000; npc.target = null;
      this.face(npc, def.id === 'gil' ? 'right' : 'down');
      if (def.id === 'wisp') {
        npc.spr.play('c_spirit_walk_down');
        const g = this.addLight(x, y - 8, 'glow_cyan', 0.8); g.always = true; npc.glow = g;
        this.tweens.add({ targets: npc.spr, y: -4, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });
      }
      if (def.id === 'umbra') { const g = this.addLight(x, y - 8, 'glow_violet', 0.7); g.always = true; npc.glow = g; }
      this.npcs.push(npc);
    }
  }

  // ---------------------------------------------------------------- night
  buildNight() {
    this.night = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0xffffff).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.night).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.updateSky(true);
  }

  updateSky(force) {
    const hr = this.state.d.hour;
    this.night.setFillStyle(skyAt(hr));
    const d = darkness(hr);
    this.dark = d;
    for (const l of this.lights) {
      const target = l.always ? 0.35 + d * 0.65 : l.isLantern ? d * 0.85 : d;
      l.setAlpha(target * (0.92 + Math.random() * 0.08));
    }
    this.fireflies.emitting = d > 0.5;
    this.leaves.emitting = d < 0.5;
    const nightNow = this.state.isNight();
    if (!force && nightNow !== this.lastNight) {
      this.lastNight = nightNow;
      this.game.audioManager.play(this.musicId(), this);
      this.respawnNpcs();
      bus.emit('toast', { text: nightNow ? 'Night falls over ' + this.def.name + '.' : 'Morning comes.', icon: 'star' });
    }
  }

  respawnNpcs() {
    for (const n of this.npcs) { n.glow?.destroy(); n.destroy(); }
    this.lights = this.lights.filter(l => l.active);
    this.spawnNpcs();
  }

  // ---------------------------------------------------------------- input
  setupInput() {
    const k = this.input.keyboard;
    this.keys = k.addKeys({ up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', w: 'W', a: 'A', s: 'S', d: 'D', space: 'SPACE', e: 'E', enter: 'ENTER', shift: 'SHIFT' });
    const act = () => { if (!this.busy) this.interact(); };
    k.on('keydown-SPACE', act); k.on('keydown-E', act); k.on('keydown-ENTER', act);
    k.on('keydown-ESC', () => { if (!this.busy) this.openMenu('main'); });
    k.on('keydown-I', () => { if (!this.busy) this.openMenu('bag'); });
    k.on('keydown-M', () => { if (!this.busy) this.openMenu('map'); });
    k.on('keydown-J', () => { if (!this.busy) this.openMenu('journal'); });
    k.on('keydown-N', () => { const m = this.game.audioManager.toggleMute(); bus.emit('toast', { text: m ? 'Sound off' : 'Sound on', icon: 'star' }); });
    for (let i = 1; i <= 5; i++) k.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i - 1]}`, () => { if (!this.busy) bus.emit('use-slot', i - 1); });
    this.events.once('shutdown', () => k.removeAllListeners());
  }

  openMenu(tab) {
    this.busy = true;
    this.game.audioManager.sfx('menu');
    this.scene.launch('Menu', { tab });
    this.scene.bringToTop('Menu');
  }

  setupBus() {
    const on = (ev, fn) => { bus.on(ev, fn, this); this.events.once('shutdown', () => bus.off(ev, fn, this)); };
    on('world-changed', flag => this.onWorldChanged(flag));
    on('emote', (id, kind) => this.emote(id, kind));
    on('fade', to => this.fadeTo(to));
    on('ending', () => { this.pendingEnding = true; });
    on('autosave', () => this.autosave(true));
    on('dialogue-closed', () => {
      this.busy = false;
      if (this.pendingEnding) { this.pendingEnding = false; this.busy = true; this.state.set('prologue_done'); this.autosave(); this.scene.launch('Ending'); }
    });
    on('menu-closed', () => { this.busy = false; });
    on('sfx', name => this.game.audioManager.sfx(name));
    on('set-hour', h => { this.state.d.hour = h; this.updateSky(); });
  }

  // Flags that change the map rebuild the scene in place (with a flash) so the change is visible at once.
  onWorldChanged(flag) {
    const mapFlags = ['bridge_fixed', 'bridge_flimsy', 'stall_fixed', 'garden_bloom', 'meadow_replanted'];
    if (flag === 'wisp_friend') { this.spawnCompanion(); }
    if (flag === 'wicks_relit') this.cameras.main.flash(600, 255, 230, 170);
    if (mapFlags.includes(flag) || flag === 'inspector_here' || flag === 'child_escort' || flag === 'wisp_bottled' || flag === 'wisp_friend') {
      this.needsRebuild = true;
    }
  }

  fadeTo(when) {
    this.pendingFade = when;
  }

  emote(id, kind) {
    const who = id === 'tavi' || id === 'player' ? this.player : this.npcs.find(n => n.def.id === id);
    if (!who) return;
    const img = this.add.image(who.x, who.y - 22, 'emote' + (EMOTES[kind] ?? 29)).setDepth(DEPTH.fx).setScale(0.2);
    this.tweens.add({ targets: img, scale: 1, y: who.y - 26, duration: 180, ease: 'Back.out' });
    this.tweens.add({ targets: img, alpha: 0, delay: 1600, duration: 300, onComplete: () => img.destroy() });
    if (kind === 'heart') this.game.audioManager.sfx('heart');
  }

  // ---------------------------------------------------------------- movement
  blockedAt(px, py, ignore) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    const { w, h, blocked } = this.md;
    if (tx < 0 || ty < 0 || tx >= w || ty >= h) return !this.warpAt(tx, ty);
    if (blocked[ty * w + tx]) return true;
    for (const n of this.npcs) {
      if (n === ignore) continue;
      if (Math.abs(n.x - px) < 7 && Math.abs(n.y - 3 - py) < 5) return true;
    }
    if (ignore !== this.player && ignore && Math.abs(this.player.x - px) < 7 && Math.abs(this.player.y - 3 - py) < 5) return true;
    return false;
  }

  canStand(actor, x, y) {
    // feet box: 10 x 5 px
    return !(this.blockedAt(x - 5, y - 5, actor) || this.blockedAt(x + 4, y - 5, actor) || this.blockedAt(x - 5, y - 1, actor) || this.blockedAt(x + 4, y - 1, actor));
  }

  moveActor(actor, dx, dy) {
    let moved = false;
    if (dx && this.canStand(actor, actor.x + dx, actor.y)) { actor.x += dx; moved = true; }
    else if (dx && !dy) { // slide around corners
      for (const s of [-1, 1]) if (this.canStand(actor, actor.x + dx, actor.y + s * 1.5)) { actor.y += s * 0.8; break; }
    }
    if (dy && this.canStand(actor, actor.x, actor.y + dy)) { actor.y += dy; moved = true; }
    else if (dy && !dx) {
      for (const s of [-1, 1]) if (this.canStand(actor, actor.x + s * 1.5, actor.y + dy)) { actor.x += s * 0.8; break; }
    }
    return moved;
  }

  animate(actor, dir, moving) {
    actor.facing = dir;
    actor.moving = moving;
    const key = `${actor.key}_walk_${dir}`;
    if (moving) { if (actor.spr.anims.currentAnim?.key !== key || !actor.spr.anims.isPlaying) actor.spr.play(key, true); }
    else this.face(actor, dir);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    if (this.needsRebuild && !this.busy) { this.rebuild(); return; }
    if (this.pendingFade && !this.busy) { this.doFade(this.pendingFade); this.pendingFade = null; return; }
    if (!this.busy && !this.transitioning) {
      this.state.d.hour += (24 / DAY_LENGTH) * dt;
      if (this.state.d.hour >= 24) { this.state.d.hour -= 24; this.state.d.day += 1; }
    }
    this.state.d.playtime += dt;
    this.updateSky();
    this.updatePlayer(dt);
    this.updateNpcs(dt, delta);
    this.updateCompanion(dt);
    this.autosaveTimer += dt;
    if (this.autosaveTimer > 120) this.autosave();
  }

  updatePlayer(dt) {
    const p = this.player, k = this.keys;
    let vx = 0, vy = 0;
    if (!this.busy && !this.transitioning) {
      if (k.left.isDown || k.a.isDown) vx -= 1;
      if (k.right.isDown || k.d.isDown) vx += 1;
      if (k.up.isDown || k.w.isDown) vy -= 1;
      if (k.down.isDown || k.s.isDown) vy += 1;
      if (this.qaMove) { vx = this.qaMove[0]; vy = this.qaMove[1]; }
    }
    if (vx || vy) {
      const len = Math.hypot(vx, vy);
      const sp = SPEED * (k.shift.isDown ? 1.35 : 1) * dt;
      const dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy ? (vy < 0 ? 'up' : 'down') : p.facing;
      const moved = this.moveActor(p, (vx / len) * sp, (vy / len) * sp);
      this.animate(p, dir, true);
      if (moved) {
        this.stepTimer -= dt;
        if (this.stepTimer <= 0) { this.stepTimer = k.shift.isDown ? 0.22 : 0.3; this.footstep(); }
      } else if (!this.bumped) { this.bumped = true; }
      this.checkWarp();
    } else {
      this.bumped = false;
      if (p.moving) this.animate(p, p.facing, false);
    }
    p.setDepth(DEPTH.world + p.y);
    this.lantern.setPosition(p.x, p.y - 8);
    this.state.d.x = p.x; this.state.d.y = p.y; this.state.d.facing = p.facing;
  }

  footstep() {
    const { w, surface } = this.md;
    const s = surface[Math.floor(this.player.y / TILE - 0.2) * w + Math.floor(this.player.x / TILE)];
    const am = this.game.audioManager;
    if (s === 'wood') am.sfx('step' + (this.stepIdx++ % 4), { volume: 0.5, rate: 1.1 });
    else am.sfx('step' + (this.stepIdx++ % 4), { volume: s === 'dirt' ? 0.35 : 0.22, rate: s === 'dirt' ? 0.9 : 1.2 });
  }

  updateNpcs(dt, delta) {
    for (const n of this.npcs) {
      if (n.talking || !n.wander || this.busy) { if (n.moving) this.animate(n, n.facing, false); n.setDepth(DEPTH.world + n.y); n.glow?.setPosition(n.x, n.y - 8); continue; }
      if (!n.target) {
        n.wait -= delta;
        if (n.wait <= 0) {
          const r = n.wander * TILE;
          n.target = { x: n.home.x + (Math.random() * 2 - 1) * r, y: n.home.y + (Math.random() * 2 - 1) * r };
          n.wait = 1500 + Math.random() * 3000;
          n.stuck = 0;
        }
      } else {
        const dx = n.target.x - n.x, dy = n.target.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 1.5 || n.stuck > 0.6) { n.target = null; this.animate(n, n.facing, false); }
        else {
          const sp = 30 * dt;
          const moved = this.moveActor(n, (dx / d) * sp, (dy / d) * sp);
          if (!moved) n.stuck += dt;
          this.animate(n, Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down', true);
        }
      }
      n.setDepth(DEPTH.world + n.y);
      n.glow?.setPosition(n.x, n.y - 8);
    }
  }

  updateCompanion(dt) {
    const c = this.companion;
    if (!c) return;
    const p = this.player;
    const [fx, fy] = DIRS[p.facing];
    const tx = p.x - fx * 14 - 8, ty = p.y - fy * 10 - 4;
    c.x += (tx - c.x) * Math.min(1, dt * 4);
    c.y += (ty - c.y) * Math.min(1, dt * 4);
    c.setDepth(DEPTH.world + c.y);
    c.glow.setPosition(c.x, c.y - 8);
  }

  // ---------------------------------------------------------------- interaction
  interact() {
    const p = this.player;
    const [fx, fy] = DIRS[p.facing];
    const px = p.x + fx * 12, py = p.y - 4 + fy * 12;
    // 1. NPCs
    let best = null, bestD = 16;
    for (const n of this.npcs) {
      const d = Math.hypot(n.x - px, n.y - 4 - py);
      if (d < bestD) { best = n; bestD = d; }
    }
    if (best) return this.talkTo(best);
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    // 2. Objects (hotspots with dialogue or examine lines)
    for (const o of this.md.objects) {
      if (o.if && !check(this.state, o.if)) continue;
      if (tx >= o.x && ty >= o.y && tx < o.x + (o.w ?? 1) && ty < o.y + (o.h ?? 1)) {
        if (o.dialogue) return this.openDialogue(o.dialogue, null);
        if (o.examine) return this.examine(o.examine);
      }
    }
    // 3. Props (houses, trees, well...)
    for (const pr of this.props) {
      const { pf } = pr;
      if (tx >= pr.x && ty >= pr.y && tx < pr.x + pf.w && ty < pr.y + pf.h) {
        if (pr.dialogue) return this.openDialogue(pr.dialogue, null);
        if (pr.examine && EXAMINE[pr.examine]) return this.examine(pr.examine);
        return this.examineFallback(pr.name);
      }
    }
    // 4. The ground itself
    const { w, h, surface, layers } = this.md;
    if (tx < 0 || ty < 0 || tx >= w || ty >= h) return;
    if (surface[ty * w + tx] === 'water') return this.examineFallback('water');
    if (layers.deco[ty][tx]?.sheet === 'nature') return this.examineFallback('flower');
    if (this.companion && Math.hypot(this.companion.x - px, this.companion.y - py) < 16) return this.examineFallback('wisp');
  }

  talkTo(npc) {
    const p = this.player;
    const dx = p.x - npc.x, dy = p.y - npc.y;
    npc.talking = true;
    npc.target = null;
    this.animate(npc, Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down', false);
    this.openDialogue(npc.def.dialogue, npc);
  }

  openDialogue(id, npc, lines) {
    this.busy = true;
    this.animate(this.player, this.player.facing, false);
    this.scene.launch('Dialogue', { id, npcId: npc?.def.id, lines });
    this.scene.bringToTop('Dialogue');
    const release = () => { for (const n of this.npcs) n.talking = false; };
    bus.once('dialogue-closed', release);
  }

  examine(id) {
    const lines = EXAMINE[id];
    if (!lines) return this.examineFallback(id);
    const seen = this.state.d.seen;
    const i = seen[id] ?? 0;
    seen[id] = i + 1;
    this.openDialogue(null, null, [lines[i % lines.length]]);
  }

  examineFallback(name) {
    const cat = Object.keys(FALLBACK).find(k => name.startsWith(k)) ?? 'thing';
    const lines = FALLBACK[cat];
    const seen = this.state.d.seen;
    const key = 'fb_' + cat;
    const i = seen[key] ?? 0;
    seen[key] = i + 1;
    this.openDialogue(null, null, [lines[i % lines.length]]);
  }

  // ---------------------------------------------------------------- warps & rebuilds
  warpAt(tx, ty) {
    return this.def.warps.find(wp => tx >= wp.x && ty >= wp.y - 1 && tx < wp.x + wp.w && ty <= wp.y + 1);
  }

  checkWarp() {
    const p = this.player;
    const tx = Math.floor(p.x / TILE), ty = Math.floor((p.y - 2) / TILE);
    for (const wp of this.def.warps) {
      const inside = tx >= wp.x && tx < wp.x + wp.w && (wp.dir === 'up' ? p.y < (wp.y + 1) * TILE - 4 : p.y > wp.y * TILE + 4);
      if (inside && !this.transitioning) {
        if (wp.if && !check(this.state, wp.if)) continue;
        this.transitioning = true;
        this.game.audioManager.sfx('whoosh', { volume: 0.4 });
        this.cameras.main.fadeOut(350, 10, 12, 28);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.state.d.map = wp.to; this.state.d.x = null;
          this.scene.restart({ map: wp.to, spot: wp.spot });
          this.time.delayedCall(10, () => this.autosave(true));
        });
        return;
      }
    }
  }

  rebuild() {
    this.needsRebuild = false;
    this.cameras.main.flash(350, 255, 244, 214);
    this.scene.restart({ map: this.mapId });
  }

  doFade(when) {
    this.transitioning = true;
    this.cameras.main.fadeOut(700, 5, 6, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.state.d.hour = when === 'night' ? 21 : when === 'day' ? 8 : this.state.d.hour;
      bus.emit('toast', { text: when === 'night' ? 'Night falls.' : 'A new morning.', icon: 'star' });
      this.scene.restart({ map: this.mapId });
    });
  }

  autosave(quiet) {
    this.autosaveTimer = 0;
    if (this.qa && !this.qa.saves) return;
    if (writeSlot('auto', this.state) && !quiet) bus.emit('saved');
  }
}
