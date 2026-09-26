import Phaser from 'phaser';
import { UI, WIDTH, HEIGHT } from '../config.js';
import { PREFABS } from '../../content/prefabs.js';
import { Window, text } from '../ui/Window.js';
import { latestSlot, readSlot, importCode } from '../systems/Save.js';
import { startGame } from '../systems/Game.js';
import { State } from '../systems/State.js';

// Night over Puddlewick: stars, lit windows, a lantern, and the menu.
export default class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  init(data) { this.qa = data?.qa; }

  create() {
    this.registry.set('qa', this.qa ? { saves: true } : null);
    const g = this.add.graphics();
    g.fillGradientStyle(0x0b0f2e, 0x0b0f2e, 0x3a2a5e, 0x3a2a5e, 1).fillRect(0, 0, WIDTH, HEIGHT);
    // stars
    for (let i = 0; i < 90; i++) {
      const s = this.add.image(Math.random() * WIDTH, Math.random() * 170, 'px').setAlpha(Math.random()).setScale(Math.random() < 0.2 ? 1 : 0.5);
      this.tweens.add({ targets: s, alpha: 0.1, yoyo: true, repeat: -1, duration: 800 + Math.random() * 2400, delay: Math.random() * 2000 });
    }
    // village silhouette: real house sprites, darkened, with warm windows
    const row = ['house_orange', 'tree', 'house_red', 'house_round', 'pine', 'house_green', 'tree_pink', 'house_wood', 'house_beige', 'pine', 'house_orange2'];
    let x = -8;
    for (const name of row) {
      const pf = PREFABS[name];
      const key = 't_' + pf.sheet, fr = `${pf.c},${pf.r},${pf.w},${pf.h}`;
      const tex = this.textures.get(key);
      if (!tex.has(fr)) tex.add(fr, 0, pf.c * 16, pf.r * 16, pf.w * 16, pf.h * 16);
      const img = this.add.image(x, 238, key, fr).setOrigin(0, 1).setTint(0x3a3460);
      if (pf.glow) for (const [lx, ly] of pf.glow) {
        const l = this.add.image(x + lx, 238 - pf.h * 16 + ly, 'glow').setBlendMode('ADD').setScale(0.7);
        this.tweens.add({ targets: l, alpha: 0.6, yoyo: true, repeat: -1, duration: 900 + Math.random() * 800 });
      }
      x += img.width + 4;
    }
    this.add.rectangle(0, 238, WIDTH, 32, 0x14122a).setOrigin(0);
    // water shimmer line
    for (let i = 0; i < 40; i++) {
      const s = this.add.rectangle(Math.random() * WIDTH, 244 + Math.random() * 22, 6 + Math.random() * 10, 1, 0xffd9a0, 0.4);
      this.tweens.add({ targets: s, alpha: 0, x: s.x + 8, yoyo: true, repeat: -1, duration: 1400 + Math.random() * 1600 });
    }
    this.fire = this.add.particles(0, 0, 'px', { x: { min: 0, max: WIDTH }, y: { min: 120, max: 250 }, lifespan: 4000, speed: { min: 3, max: 10 }, alpha: { start: 0, end: 0, ease: t => Math.sin(t * Math.PI) }, tint: [0xfff3a0, 0xc8ff9a], frequency: 180, blendMode: 'ADD' });

    // Logo
    const logoShadow = text(this, 0, 0, 'LANTERNFALL', 0x1a0f30).setScale(3);
    const logo = text(this, 0, 0, 'LANTERNFALL', UI.gold).setScale(3);
    const lx = Math.round((WIDTH - logo.width) / 2);
    logo.setPosition(lx, 40); logoShadow.setPosition(lx + 3, 43);
    const sub = text(this, 0, 76, 'The Puddlewick Prologue', 0xf4e7ff);
    sub.setX(Math.round((WIDTH - sub.width) / 2));
    const lantern = this.add.image(WIDTH / 2, 100, 'glow_big').setBlendMode('ADD').setScale(0.6).setAlpha(0.5);
    this.tweens.add({ targets: lantern, alpha: 0.8, scale: 0.7, yoyo: true, repeat: -1, duration: 1400 });
    this.tweens.add({ targets: [logo, logoShadow], y: '+=2', yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.inOut' });

    // Menu
    this.hasSave = !!latestSlot();
    this.items = [
      ...(this.hasSave ? [{ label: 'Continue', act: () => this.go(readSlot(latestSlot())) }] : []),
      { label: 'New Game', act: () => this.go(null, true) },
      { label: 'Load Save Code', act: () => this.loadCode() },
    ];
    const h = this.items.length * 16 + 16;
    this.win = new Window(this, 176, 120, 128, Math.ceil(h / 8) * 8);
    this.texts = this.items.map((it, i) => text(this, 200, 128 + i * 16 + 2, it.label));
    this.cursor = this.add.graphics();
    this.sel = 0;
    this.draw();
    this.credit = text(this, 8, 258, 'Art & sound: Pixel-boy & AAA, Kenney (CC0)', 0x8a86b8);
    this.ver = text(this, WIDTH - 44, 258, 'v0.1', 0x8a86b8);

    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.move(-1)); k.on('keydown-W', () => this.move(-1));
    k.on('keydown-DOWN', () => this.move(1)); k.on('keydown-S', () => this.move(1));
    const ok = () => this.confirm();
    k.on('keydown-ENTER', ok); k.on('keydown-SPACE', ok); k.on('keydown-E', ok);
    this.events.once('shutdown', () => k.removeAllListeners());
    this.input.once('pointerdown', () => this.startMusic());
    k.once('keydown', () => this.startMusic());
    window.__title = this;
  }

  startMusic() {
    if (this.music) return;
    this.music = true;
    const am = this.game.audioManager;
    am.currentId = null;
    am.play('intro', this);
  }

  draw() {
    this.texts.forEach((t, i) => t.setTint(i === this.sel ? UI.select : UI.text));
    const y = 130 + this.sel * 16;
    this.cursor.clear().fillStyle(UI.select, 1).fillTriangle(186, y, 186, y + 8, 191, y + 4);
  }

  move(d) { this.sel = (this.sel + d + this.items.length) % this.items.length; this.game.audioManager.sfx('move', { volume: 0.6 }); this.draw(); }

  confirm() {
    this.startMusic();
    this.game.audioManager.sfx('accept');
    this.items[this.sel].act();
  }

  go(data, intro = false) {
    this.cameras.main.fadeOut(500, 5, 6, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => startGame(this, data, { intro }));
  }

  loadCode() {
    const code = window.prompt('Paste a save code:');
    const d = code && importCode(code);
    if (d) this.go(d);
  }
}

export { State };
