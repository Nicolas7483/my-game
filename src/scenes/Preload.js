import Phaser from 'phaser';
import { BASE, WIDTH, HEIGHT } from '../config.js';
import { SHEETS } from '../../content/prefabs.js';
import { ITEMS } from '../../content/items.js';
import { NPCS } from '../../content/story.js';
import { SFX, AudioManager } from '../systems/Audio.js';

export const CHARACTERS = ['hunter', 'woman', 'inspector', 'villager2', 'villager3', 'villager4', 'villager5', 'oldman', 'oldman2',
  'oldwoman', 'child', 'knight', 'spirit', 'noble', 'samurai', 'villager', 'villager6', 'monk', 'boy', 'princess', 'master', 'oldman3'];
export const EMOTES = { heart: 27, heartbreak: 26, surprise: 22, alert: 21, question: 23, dots: 20, happy: 11, sad: 16, angry: 19, sleep: 28, star: 29, music: 29, shock: 25, grin: 5 };

export default class Preload extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload() {
    document.getElementById('boot')?.remove();
    const bar = this.add.rectangle(WIDTH / 2 - 80, HEIGHT / 2, 0, 4, 0xffd35a).setOrigin(0, 0.5);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, 164, 8).setStrokeStyle(1, 0xf4f1e8);
    this.load.on('progress', v => { bar.width = 160 * v; });

    this.load.setBaseURL(BASE);
    this.load.setPath('assets/');
    this.load.bitmapFont('pixel', 'fonts/pixel.png', 'fonts/pixel.xml');
    for (const [key, s] of Object.entries(SHEETS)) this.load.spritesheet('t_' + key, s.file, { frameWidth: 16, frameHeight: 16 });
    const chars = new Set([...CHARACTERS, ...Object.values(NPCS).map(n => n.sprite?.toLowerCase()).filter(Boolean)]);
    for (const c of chars) {
      this.load.spritesheet('c_' + c, `chars/${c}.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.image('f_' + c, `faces/${c}.png`);
    }
    this.load.image('shadow', 'chars/shadow.png');
    for (const a of ['cat', 'dog', 'frog']) this.load.spritesheet('a_' + a, `animals/${a}.png`, { frameWidth: 16, frameHeight: 16 });
    const icons = new Set(Object.values(ITEMS).map(i => i.icon).filter(i => !i.includes(':')));
    for (const i of icons) this.load.image('it_' + i, `items/${i}.png`);
    this.load.image('it_goldcoin', 'items/goldcoin.png');
    this.load.spritesheet('hearts', 'ui/heart.png', { frameWidth: 16, frameHeight: 16 });
    for (let i = 1; i <= 30; i++) this.load.image('emote' + i, `ui/emote${i}.png`);
    this.load.image('boat', 'tiles/boat.png');
    this.load.image('fishnet', 'tiles/fishnet.png');
    this.load.spritesheet('ripples', 'tiles/anim_ripples.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('flag_red', 'tiles/anim_flag_red.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('leaf', 'fx/leaf.png', { frameWidth: 12, frameHeight: 7 });
    this.load.spritesheet('leafpink', 'fx/leafpink.png', { frameWidth: 12, frameHeight: 7 });
    this.load.spritesheet('spark', 'fx/spark.png', { frameWidth: 10, frameHeight: 8 });
    this.load.spritesheet('smoke', 'fx/smoke.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('fog', 'fx/fog.png');
    for (const [k, f] of Object.entries(SFX)) this.load.audio('s_' + k, f);
  }

  create() {
    this.makeGlowTextures();
    this.makeAnimations();
    if (!this.game.audioManager) this.game.audioManager = new AudioManager(this.game);
    const qs = new URLSearchParams(location.search);
    if (qs.has('qa')) this.scene.start('Title', { qa: true });
    else this.scene.start('Title');
  }

  // Soft radial lights for lamps, windows and the hero's lantern (generated once, not drawn per frame).
  makeGlowTextures() {
    const mk = (key, size, stops) => {
      const tex = this.textures.createCanvas(key, size, size);
      const ctx = tex.getContext();
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (const [o, c] of stops) g.addColorStop(o, c);
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      tex.refresh();
    };
    mk('glow', 64, [[0, 'rgba(255,220,150,1)'], [0.35, 'rgba(255,190,110,0.55)'], [1, 'rgba(255,160,80,0)']]);
    mk('glow_big', 160, [[0, 'rgba(255,225,170,0.9)'], [0.4, 'rgba(255,200,130,0.35)'], [1, 'rgba(255,170,90,0)']]);
    mk('glow_violet', 96, [[0, 'rgba(200,150,255,0.9)'], [0.4, 'rgba(150,100,230,0.4)'], [1, 'rgba(120,80,200,0)']]);
    mk('glow_cyan', 64, [[0, 'rgba(190,255,255,1)'], [0.4, 'rgba(120,220,255,0.45)'], [1, 'rgba(90,180,255,0)']]);
    mk('dim', 128, [[0, 'rgba(120,110,140,0.75)'], [0.6, 'rgba(110,100,130,0.45)'], [1, 'rgba(100,90,120,0)']]);
    // 2x2 pixel used for particles (fireflies, dust).
    const px = this.textures.createCanvas('px', 2, 2); px.getContext().fillStyle = '#fff'; px.getContext().fillRect(0, 0, 2, 2); px.refresh();
  }

  makeAnimations() {
    const dirs = ['down', 'up', 'left', 'right'];
    for (const key of this.textures.getTextureKeys().filter(k => k.startsWith('c_'))) {
      const short = this.textures.get(key).frameTotal < 17; // some sheets only have 2 rows
      dirs.forEach((d, i) => {
        const frames = short ? [i, 4 + i] : [i, 4 + i, 8 + i, 12 + i];
        this.anims.create({ key: `${key}_walk_${d}`, frames: this.anims.generateFrameNumbers(key, { frames }), frameRate: short ? 5 : 8, repeat: -1 });
      });
    }
    for (const a of ['cat', 'dog', 'frog']) this.anims.create({ key: `a_${a}_idle`, frames: this.anims.generateFrameNumbers('a_' + a, { frames: [0, 1] }), frameRate: 2, repeat: -1 });
    this.anims.create({ key: 'ripples', frames: this.anims.generateFrameNumbers('ripples', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'flag_red', frames: this.anims.generateFrameNumbers('flag_red', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'smoke', frames: this.anims.generateFrameNumbers('smoke', { start: 0, end: 5 }), frameRate: 8 });
  }
}
