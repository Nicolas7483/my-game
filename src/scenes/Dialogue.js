import Phaser from 'phaser';
import { UI, LINE } from '../config.js';
import { DIALOGUES, NPCS } from '../../content/index.js';
import { Window, text } from '../ui/Window.js';
import { check, apply } from '../systems/State.js';
import { bus } from '../systems/bus.js';

const TONE = { kind: UI.kind, bold: UI.bold, sly: UI.sly };
const BOX = { x: 8, y: 192, w: 464, h: 72 };
const VOICES = { fen: 'voice3', marla: 'voice2', hobb: 'voice3', gil: 'voice3', coral: 'voice2', sella: 'voice1', bram: 'voice3', nettie: 'voice2', wren: 'voice2', pim: 'voice1', wisp: 'voice5', umbra: 'voice5', stranger: 'voice5' };

// The classic blue dialogue box: portrait, name tab, typewriter text and in-box choices.
export default class Dialogue extends Phaser.Scene {
  constructor() { super('Dialogue'); }

  init(data) {
    this.state = this.registry.get('state');
    this.npc = (Array.isArray(NPCS) ? NPCS : Object.values(NPCS)).find(n => n.id === data.npcId);
    this.dlg = data.id ? DIALOGUES[data.id] : null;
    this.lines = data.lines;
    this.lineIdx = 0;
    this.closing = false; this.choices = null; this.choiceTexts = []; this.cursor = null; this.node = null;
  }

  create() {
    bus.emit('dialogue-open');
    this.box = new Window(this, BOX.x, BOX.y, BOX.w, BOX.h);
    this.portraitFrame = this.add.graphics();
    this.portrait = this.add.image(BOX.x + 28, BOX.y + 32, 'f_hunter').setVisible(false);
    this.nameTab = new Window(this, 16, 176, 88, 16).setVisible(false);
    this.nameText = text(this, 24, 179, '', UI.select);
    this.body = text(this, 0, 0, '', UI.text);
    this.more = this.add.graphics();
    this.tweens.add({ targets: this.more, y: 2, yoyo: true, repeat: -1, duration: 350 });
    this.choiceWin = null; this.choiceTexts = [];
    this.box.setAlpha(0);
    this.tweens.add({ targets: this.box, alpha: 1, duration: 120 });

    const k = this.input.keyboard;
    const confirm = () => this.confirm();
    k.on('keydown-SPACE', confirm); k.on('keydown-E', confirm); k.on('keydown-ENTER', confirm);
    k.on('keydown-UP', () => this.moveChoice(-1)); k.on('keydown-W', () => this.moveChoice(-1));
    k.on('keydown-DOWN', () => this.moveChoice(1)); k.on('keydown-S', () => this.moveChoice(1));
    for (let i = 1; i <= 4; i++) k.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR'][i - 1]}`, () => { if (this.choices && i <= this.choices.length) { this.sel = i - 1; this.drawSel(); this.confirm(); } });
    this.events.once('shutdown', () => k.removeAllListeners());

    if (this.lines) this.showLine({ speaker: '', text: this.lines[0] });
    else if (this.dlg) {
      const entry = (this.dlg.entries ?? [{ node: 'start' }]).find(e => check(this.state, e.if));
      this.goto(entry?.node);
    } else this.close();
  }

  goto(id) {
    const node = id && this.dlg.nodes[id];
    if (!node) return this.close();
    if (node.branch && !node.text) {
      const b = node.branch.find(x => check(this.state, x.if));
      return this.goto(b?.next);
    }
    this.node = node;
    apply(this.state, node.effects);
    this.showLine(node);
  }

  showLine(node) {
    this.clearChoices();
    const narration = node.speaker === '';
    const name = narration ? '' : node.speaker ?? this.npc?.name ?? '';
    let face = node.face ?? (node.speaker && node.speaker !== this.npc?.name ? null : this.npc?.face);
    if (node.speaker === 'Tavi') face = 'hunter';
    if (face && !this.textures.exists('f_' + face)) face = null;
    const pf = this.portraitFrame.clear();
    const tx = face ? BOX.x + 56 : BOX.x + 12;
    if (face) {
      pf.fillStyle(UI.outline, 1).fillRect(BOX.x + 7, BOX.y + 11, 42, 42);
      pf.fillStyle(UI.border, 1).fillRect(BOX.x + 8, BOX.y + 12, 40, 40);
      pf.fillStyle(0x3a4fb8, 1).fillRect(BOX.x + 9, BOX.y + 13, 38, 38);
      this.portrait.setTexture('f_' + face).setVisible(true);
    } else this.portrait.setVisible(false);
    this.nameTab.setVisible(!!name);
    this.nameText.setText(name);
    this.body.setPosition(tx, BOX.y + 12).setMaxWidth(BOX.x + BOX.w - 12 - tx).setTint(narration ? UI.dim : UI.text);
    this.full = String(node.text ?? '').replace(/[—–]/g, ',');
    this.shown = 0;
    this.typing = true;
    this.voice = VOICES[this.npc?.id] ?? 'voice2';
    this.speakerIsNpc = !narration && node.speaker !== 'Tavi';
    this.more.clear();
  }

  update(_, delta) {
    if (!this.typing) return;
    const before = Math.floor(this.shown);
    this.shown = Math.min(this.full.length, this.shown + delta * 0.055);
    const now = Math.floor(this.shown);
    if (now !== before) {
      this.body.setText(this.full.slice(0, now));
      if (this.speakerIsNpc && now % 4 === 0 && /\w/.test(this.full[now - 1] ?? '')) this.game.audioManager.sfx(this.voice, { volume: 0.25, rate: 1.4 + Math.random() * 0.2 });
    }
    if (this.shown >= this.full.length) this.finishTyping();
  }

  finishTyping() {
    this.typing = false;
    this.body.setText(this.full);
    const node = this.node;
    if (!this.lines && node?.choices) this.showChoices(node.choices);
    else this.more.clear().fillStyle(UI.select, 1).fillTriangle(BOX.x + BOX.w - 16, BOX.y + BOX.h - 12, BOX.x + BOX.w - 8, BOX.y + BOX.h - 12, BOX.x + BOX.w - 12, BOX.y + BOX.h - 8);
  }

  showChoices(all) {
    this.choices = all.filter(c => check(this.state, c.if));
    if (!this.choices.length) { this.choices = null; return; }
    const h = Math.ceil((this.choices.length * 12 + 12) / 8) * 8;
    const w = 216, x = BOX.x + BOX.w - w, y = BOX.y - h;
    this.choiceWin = new Window(this, x, y, w, h);
    this.choiceTexts = this.choices.map((c, i) => {
      const t = text(this, x + 20, y + 7 + i * 12, c.text, UI.text);
      const dot = this.add.graphics();
      return { t, dot };
    });
    this.cursor = this.add.graphics();
    this.sel = 0;
    this.drawSel();
    this.choiceWin.setAlpha(0);
    this.tweens.add({ targets: this.choiceWin, alpha: 1, duration: 100 });
  }

  drawSel() {
    if (!this.choices) return;
    const { x, y } = this.choiceWin;
    this.cursor.clear().fillStyle(UI.select, 1).fillTriangle(x + 8, y + 7 + this.sel * 12, x + 8, y + 15 + this.sel * 12, x + 13, y + 11 + this.sel * 12);
    this.choiceTexts.forEach((c, i) => c.t.setTint(i === this.sel ? UI.select : UI.text));
  }

  moveChoice(d) {
    if (!this.choices) return;
    this.sel = (this.sel + d + this.choices.length) % this.choices.length;
    this.game.audioManager.sfx('move', { volume: 0.6 });
    this.drawSel();
  }

  clearChoices() {
    this.choiceWin?.destroy(); this.choiceWin = null;
    for (const c of this.choiceTexts) { c.t.destroy(); c.dot.destroy(); }
    this.choiceTexts = [];
    this.cursor?.destroy(); this.cursor = null;
    this.choices = null;
  }

  confirm() {
    if (this.typing) { this.shown = this.full.length; this.finishTyping(); return; }
    if (this.lines) {
      this.lineIdx++;
      if (this.lineIdx < this.lines.length) { this.game.audioManager.sfx('move', { volume: 0.4 }); return this.showLine({ speaker: '', text: this.lines[this.lineIdx] }); }
      return this.close();
    }
    if (this.choices) {
      const c = this.choices[this.sel];
      this.game.audioManager.sfx('accept', { volume: 0.7 });
      apply(this.state, c.effects);
      if (c.effects?.length) bus.emit('autosave');
      return this.goto(c.next);
    }
    this.game.audioManager.sfx('move', { volume: 0.4 });
    if (this.node?.branch) return this.goto(this.node.branch.find(x => check(this.state, x.if))?.next);
    if (this.node?.next) return this.goto(this.node.next);
    this.close();
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    this.clearChoices();
    this.scene.stop();
    bus.emit('dialogue-closed');
  }
}

export { LINE };
