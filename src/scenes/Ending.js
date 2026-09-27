import Phaser from 'phaser';
import { UI, WIDTH, HEIGHT } from '../config.js';
import { ENDINGS, CHAPTERS } from '../../content/index.js';
import { text } from '../ui/Window.js';
import { check } from '../systems/State.js';
import { bus } from '../systems/bus.js';
import { writeSlot } from '../systems/Save.js';

// The prologue end card: what your choices changed, then a tease of Chapter 1.
export default class Ending extends Phaser.Scene {
  constructor() { super('Ending'); }

  init(data) { this.id = data?.id ?? 'prologue'; }

  create() {
    const state = this.registry.get('state');
    this.scene.setVisible(false, 'HUD');
    this.events.once('shutdown', () => this.scene.setVisible(true, 'HUD'));
    const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x07081a, 0).setOrigin(0);
    this.tweens.add({ targets: bg, fillAlpha: 0.92, duration: 1200 });
    this.game.audioManager.play('story', this);
    const ENDING = ENDINGS[this.id] ?? ENDINGS.prologue;
    const chapterN = this.id === 'prologue' ? 0 : +this.id.replace('ch', '');
    this.nextChapter = CHAPTERS[chapterN] ? chapterN + 1 : null;
    const lines = [...(ENDING.base ?? []), ...(ENDING.variants ?? []).filter(v => check(state, v.if)).map(v => v.line)];
    const title = text(this, 0, 28, this.id === 'prologue' ? 'END OF THE PROLOGUE' : `END OF CHAPTER ${chapterN}`, UI.gold).setScale(2).setAlpha(0);
    title.setX(Math.round((WIDTH - title.width) / 2));
    this.tweens.add({ targets: title, alpha: 1, delay: 800, duration: 800 });
    let y = 64;
    lines.forEach((l, i) => {
      const t = text(this, 48, y, l, UI.text, { maxWidth: WIDTH - 96 }).setAlpha(0);
      y += Math.max(14, t.getTextBounds().local.height + 5);
      this.tweens.add({ targets: t, alpha: 1, delay: 1600 + i * 1100, duration: 700 });
    });
    const tease = text(this, 48, Math.min(y + 8, 214), ENDING.tease ?? '', 0xc79bff, { maxWidth: WIDTH - 96 }).setAlpha(0);
    const d = 1600 + lines.length * 1100 + 600;
    this.tweens.add({ targets: tease, alpha: 1, delay: d, duration: 900 });
    const thanks = text(this, 0, 238, this.nextChapter ? `Enter: begin Chapter ${this.nextChapter}   Esc: title` : 'More chapters soon.   Enter: keep exploring   Esc: title', UI.dim).setAlpha(0);
    thanks.setX(Math.round((WIDTH - thanks.width) / 2));
    this.tweens.add({ targets: thanks, alpha: 1, delay: d + 900, duration: 600, onComplete: () => { this.ready = true; } });
    writeSlot('auto', state);
    const k = this.input.keyboard;
    const cont = () => {
      if (!this.ready) return;
      this.scene.stop(); bus.emit('menu-closed');
      if (this.nextChapter) { bus.emit('begin-chapter', this.nextChapter); return; }
      const w = this.scene.get('World'); w.game.audioManager.play(w.musicId(), w);
    };
    k.on('keydown-ENTER', cont); k.on('keydown-SPACE', cont);
    k.on('keydown-ESC', () => { if (!this.ready) return; this.scene.stop('HUD'); this.scene.stop('World'); bus.removeAllListeners(); this.scene.start('Title'); });
    this.events.once('shutdown', () => k.removeAllListeners());
  }
}
