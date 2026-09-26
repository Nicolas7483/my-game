import { bus } from './bus.js';
import { ITEMS } from '../../content/items.js';
import { QUESTS } from '../../content/story.js';
import { START_HOUR } from '../config.js';

export const SAVE_VERSION = 1;

// Everything that makes up a playthrough. Plain data so it can be saved as JSON.
export function newState() {
  return {
    v: SAVE_VERSION,
    map: 'town', x: null, y: null, spot: 'start', facing: 'down',
    hour: START_HOUR, day: 1, playtime: 0,
    hp: 6, maxHp: 6, gold: 12,
    flags: [], vars: { aff_sella: 0, warmth: 0, hoard: 0, rep: 0 },
    inv: [{ id: 'lantern', n: 1 }], hotbar: ['lantern', null, null, null, null],
    quests: {}, questOrder: [], seen: {},
  };
}

export class State {
  constructor(data = newState()) { this.load(data); }
  load(data) {
    this.d = { ...newState(), ...data };
    this.flags = new Set(this.d.flags);
  }
  toJSON() { return { ...this.d, flags: [...this.flags] }; }

  has(flag) { return this.flags.has(flag); }
  set(flag, on = true) {
    const had = this.flags.has(flag);
    if (on) this.flags.add(flag); else this.flags.delete(flag);
    if (had !== on) bus.emit('world-changed', flag);
  }
  var(name) { return this.d.vars[name] ?? 0; }
  addVar(name, n) { this.d.vars[name] = this.var(name) + n; bus.emit('var-changed', name); }
  setVar(name, n) { this.d.vars[name] = n; bus.emit('var-changed', name); }

  count(id) { return this.d.inv.find(i => i.id === id)?.n ?? 0; }
  give(id, n = 1) {
    let slot = this.d.inv.find(i => i.id === id);
    if (!slot) { slot = { id, n: 0 }; this.d.inv.push(slot); }
    slot.n += n;
    if (!this.d.hotbar.includes(id)) {
      const free = this.d.hotbar.indexOf(null);
      if (free >= 0) this.d.hotbar[free] = id;
    }
    bus.emit('inventory-changed');
  }
  take(id, n = 1) {
    const slot = this.d.inv.find(i => i.id === id);
    if (!slot) return;
    slot.n -= n;
    if (slot.n <= 0) {
      this.d.inv = this.d.inv.filter(i => i !== slot);
      this.d.hotbar = this.d.hotbar.map(h => (h === id ? null : h));
    }
    bus.emit('inventory-changed');
  }
  addGold(n) { this.d.gold = Math.max(0, this.d.gold + n); bus.emit('inventory-changed'); }
  heal(n) { this.d.hp = Math.max(0, Math.min(this.d.maxHp, this.d.hp + n)); bus.emit('hp-changed'); }

  quest(id) { return this.d.quests[id]; }
  setQuest(id, stage) {
    if (!QUESTS[id]) return;
    const prev = this.d.quests[id];
    if (prev === 'done') return;
    if (stage === -1) this.d.quests[id] = 'done';
    else if (prev === undefined || stage > prev) this.d.quests[id] = stage;
    else return;
    this.d.questOrder = [id, ...this.d.questOrder.filter(q => q !== id)];
    bus.emit('quest-changed', id, prev === undefined ? 'new' : stage === -1 ? 'done' : 'update');
  }
  activeQuests() {
    return this.d.questOrder.filter(id => this.d.quests[id] !== undefined && this.d.quests[id] !== 'done');
  }
  isNight() { const h = this.d.hour % 24; return h >= 19.5 || h < 5.5; }
}

// ---- Conditions -------------------------------------------------------------
export function check(state, c) {
  if (!c) return true;
  if (Array.isArray(c)) return c.every(x => check(state, x));
  if (c.all) return c.all.every(x => check(state, x));
  if (c.any) return c.any.some(x => check(state, x));
  if (c.not) return !check(state, c.not);
  if ('flag' in c && !state.has(c.flag)) return false;
  if ('notFlag' in c && state.has(c.notFlag)) return false;
  if ('var' in c) {
    const v = state.var(c.var);
    if ('gte' in c && !(v >= c.gte)) return false;
    if ('lte' in c && !(v <= c.lte)) return false;
    if ('eq' in c && v !== c.eq) return false;
    if ('gt' in c && !(v > c.gt)) return false;
    if ('lt' in c && !(v < c.lt)) return false;
  }
  if ('item' in c && state.count(c.item) < (c.n ?? 1)) return false;
  if ('noItem' in c && state.count(c.noItem) > 0) return false;
  if ('gold' in c && state.d.gold < c.gold) return false;
  if ('time' in c && (c.time === 'night') !== state.isNight()) return false;
  if ('quest' in c) {
    const q = state.quest(c.quest);
    if (q === undefined) return false;
    if ('stage' in c && q !== 'done' && q < c.stage) return false;
    if (c.done === true && q !== 'done') return false;
    if (c.done === false && q === 'done') return false;
  }
  if ('questDone' in c && state.quest(c.questDone) !== 'done') return false;
  if ('noQuest' in c && state.quest(c.noQuest) !== undefined) return false;
  return true;
}

// ---- Effects ----------------------------------------------------------------
export function apply(state, effects) {
  if (!effects) return;
  for (const e of [].concat(effects)) {
    if (e.setFlag) state.set(e.setFlag, true);
    if (e.clearFlag) state.set(e.clearFlag, false);
    if (e.addVar) state.addVar(e.addVar[0], e.addVar[1]);
    if (e.setVar) state.setVar(e.setVar[0], e.setVar[1]);
    if (e.giveItem) {
      state.give(e.giveItem, e.n ?? 1);
      if (!e.silent) bus.emit('toast', { text: `Got ${ITEMS[e.giveItem]?.name ?? e.giveItem}${(e.n ?? 1) > 1 ? ` x${e.n}` : ''}`, icon: 'item', item: e.giveItem });
      bus.emit('sfx', 'item');
    }
    if (e.takeItem) state.take(e.takeItem, e.n ?? 1);
    if (typeof e.gold === 'number') {
      state.addGold(e.gold);
      bus.emit('toast', { text: `${e.gold > 0 ? '+' : ''}${e.gold} gold`, icon: 'gold' });
      bus.emit('sfx', 'coin');
    }
    if (typeof e.heal === 'number') state.heal(e.heal);
    if (e.quest) state.setQuest(e.quest[0], e.quest[1]);
    if (e.toast) bus.emit('toast', { text: e.toast, icon: e.icon ?? 'star' });
    if (e.sfx) bus.emit('sfx', e.sfx);
    if (e.emote) bus.emit('emote', e.emote[0], e.emote[1]);
    if (e.fade) bus.emit('fade', e.fade);
    if (e.ending) bus.emit('ending', e.ending);
    if (e.autosave) bus.emit('autosave');
  }
}
