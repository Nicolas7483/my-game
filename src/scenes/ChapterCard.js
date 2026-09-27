import Phaser from 'phaser';
import { UI, WIDTH, HEIGHT } from '../config.js';
import { text } from '../ui/Window.js';
import { bus } from '../systems/bus.js';

const TITLES = { 1: ['Chapter 1', 'The Lantern Tax'], 2: ['Chapter 2', 'The Wisp Hollows'], 3: ['Chapter 3', 'The Capital of Bottled Stars'], 4: ['Chapter 4', 'The Flats of the Flood Night'], 5: ['Chapter 5', 'The First Lantern'] };

// Big title card between chapters.
export default class ChapterCard extends Phaser.Scene {
  constructor() { super('ChapterCard'); }
  init(data) { this.n = data.n; }
  create() {
    const [a, b] = TITLES[this.n] ?? [`Chapter ${this.n}`, ''];
    this.scene.setVisible(false, 'HUD');
    const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x07081a, 1).setOrigin(0);
    const t1 = text(this, 0, 100, a.toUpperCase(), UI.dim);
    t1.setX(Math.round((WIDTH - t1.width) / 2));
    const t2 = text(this, 0, 116, b, UI.gold).setScale(2);
    t2.setX(Math.round((WIDTH - t2.width * 2) / 2));
    const line = this.add.rectangle(WIDTH / 2, 144, 0, 1, UI.gold).setOrigin(0.5);
    [t1, t2].forEach(t => t.setAlpha(0));
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 900 });
    this.tweens.add({ targets: line, width: 160, duration: 900, delay: 300 });
    this.game.audioManager.sfx('secret', { volume: 0.7 });
    this.time.delayedCall(3200, () => {
      this.tweens.add({ targets: [bg, t1, t2, line], alpha: 0, duration: 700, onComplete: () => {
        this.scene.setVisible(true, 'HUD');
        this.scene.stop();
        bus.emit('chapter-card-done', this.n);
      } });
    });
  }
}
