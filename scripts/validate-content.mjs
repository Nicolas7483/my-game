// Content checks + a story simulator that plays the prologue thousands of times with random choices.
// usage: node scripts/validate-content.mjs [runs]
import { existsSync } from 'node:fs';
import { NPCS, DIALOGUES, QUESTS, EXAMINE, INTRO, ENDING, CHAPTERS } from '../content/index.js';
import { ITEMS } from '../content/index.js';
import { FALLBACK } from '../content/tileinfo.js';
import { State, check, apply } from '../src/systems/State.js';
import { bus } from '../src/systems/bus.js';
import town from '../content/maps/town.js';
import meadow from '../content/maps/meadow.js';
import riverroad from '../content/maps/riverroad.js';
import { INTERIORS } from '../content/maps/interiors.js';
import { buildMap } from '../src/systems/MapBuilder.js';
import { BATTLES, PARTY } from '../content/battles.js';

const MAPS = { town, meadow, riverroad, ...INTERIORS };
const SPOTS = Object.fromEntries(Object.entries(MAPS).map(([id, m]) => [id, buildMap(m, { has: () => true, isNight: () => false, var: () => 0 }).spots]));

const EMOTE_KINDS = ['heart', 'heartbreak', 'surprise', 'alert', 'question', 'dots', 'happy', 'sad', 'angry', 'sleep', 'star', 'music', 'shock', 'grin'];
const TOAST_ICONS = ['heart', 'heartbreak', 'star', 'item', 'gold', 'moth', 'quest'];
const errors = [], warns = [];
const err = m => errors.push(m), warn = m => warns.push(m);
const npcList = Array.isArray(NPCS) ? NPCS : Object.values(NPCS);
const npcIds = new Set(npcList.map(n => n.id));
const dash = /[–—]/;

function checkEffects(where, effects) {
  for (const e of [].concat(effects ?? [])) {
    if (e.giveItem && !ITEMS[e.giveItem]) err(`${where}: unknown item ${e.giveItem}`);
    if (e.takeItem && !ITEMS[e.takeItem]) err(`${where}: unknown item ${e.takeItem}`);
    if (e.quest && !QUESTS[e.quest[0]]) err(`${where}: unknown quest ${e.quest[0]}`);
    if (e.emote && !npcIds.has(e.emote[0]) && !['tavi', 'player'].includes(e.emote[0])) err(`${where}: emote target ${e.emote[0]}`);
    if (e.emote && !EMOTE_KINDS.includes(e.emote[1])) err(`${where}: emote kind ${e.emote[1]}`);
    if (e.toast && e.icon && !TOAST_ICONS.includes(e.icon)) warn(`${where}: toast icon ${e.icon}`);
    if (e.toast && e.toast.length > 60) warn(`${where}: long toast (${e.toast.length}) "${e.toast}"`);
    if (e.toast && dash.test(e.toast)) err(`${where}: dash in toast`);
    if (e.battle && !BATTLES[e.battle]) err(`${where}: unknown battle ${e.battle}`);
    if (e.after && !DIALOGUES[e.after]) err(`${where}: battle after-dialogue ${e.after} missing`);
    if (e.join && !PARTY[e.join]) err(`${where}: unknown party member ${e.join}`);
  }
}

// ---- static checks
for (const n of npcList) {
  const s = n.sprite.toLowerCase();
  if (!existsSync(`public/assets/chars/${s}.png`)) err(`npc ${n.id}: missing sprite ${s}`);
  if (!existsSync(`public/assets/faces/${n.face}.png`)) err(`npc ${n.id}: missing face ${n.face}`);
  if (!DIALOGUES[n.dialogue]) err(`npc ${n.id}: missing dialogue ${n.dialogue}`);
  for (const sp of n.spawns ?? []) {
    if (!MAPS[sp.map]) err(`npc ${n.id}: unknown map ${sp.map}`);
    else if (!SPOTS[sp.map][sp.spot]) err(`npc ${n.id}: unknown spot ${sp.spot} on ${sp.map}`);
  }
}
for (const [id, d] of Object.entries(DIALOGUES)) {
  for (const e of d.entries ?? []) if (!d.nodes[e.node]) err(`dialogue ${id}: entry -> missing node ${e.node}`);
  for (const [nid, node] of Object.entries(d.nodes)) {
    const w = `${id}.${nid}`;
    if (!node.text) err(`${w}: no text`);
    else {
      if (node.text.length > 100) err(`${w}: text too long (${node.text.length})`);
      if (dash.test(node.text)) err(`${w}: em/en dash`);
    }
    if (node.next && !d.nodes[node.next]) err(`${w}: next -> missing ${node.next}`);
    for (const b of node.branch ?? []) if (b.next && !d.nodes[b.next]) err(`${w}: branch -> missing ${b.next}`);
    checkEffects(w, node.effects);
    for (const c of node.choices ?? []) {
      if (c.text.length > 34) err(`${w}: choice too long "${c.text}"`);
      if (dash.test(c.text)) err(`${w}: dash in choice`);
      if (c.next && !d.nodes[c.next]) err(`${w}: choice -> missing ${c.next}`);
      checkEffects(w, c.effects);
    }
    if (node.face && !existsSync(`public/assets/faces/${node.face}.png`)) err(`${w}: missing face ${node.face}`);
  }
}
for (const [id, q] of Object.entries(QUESTS)) for (const s of q.stages) if (s.length > 40) warn(`quest ${id}: long stage "${s}"`);
for (const [id, lines] of Object.entries(EXAMINE)) for (const l of lines) { if (l.length > 90) warn(`examine ${id}: long line`); if (dash.test(l)) err(`examine ${id}: dash`); }
const stateStub = { has: () => false, isNight: () => false, var: () => 0 };
for (const [mid, m] of Object.entries(MAPS)) {
  for (const o of m.objects(stateStub)) {
    if (o.dialogue && !DIALOGUES[o.dialogue]) err(`map ${mid}: object dialogue ${o.dialogue} missing`);
    if (o.examine && !EXAMINE[o.examine]) warn(`map ${mid}: examine ${o.examine} has no text (fallback used)`);
  }
  for (const p of m.props(stateStub)) {
    const o = p[3] ?? {};
    if (o.examine && !EXAMINE[o.examine]) warn(`map ${mid}: prop examine ${o.examine} has no EXAMINE text`);
    if (o.dialogue && !DIALOGUES[o.dialogue]) err(`map ${mid}: prop dialogue ${o.dialogue} missing`);
  }
  for (const wp of m.warps ?? []) if (!SPOTS[wp.to]?.[wp.spot]) err(`map ${mid}: warp to missing ${wp.to}.${wp.spot}`);
}
void FALLBACK; void INTRO; void ENDING;

// ---- simulation: random but sensible players
function available(state) {
  const acts = [];
  const map = state.d.map;
  for (const n of npcList) {
    const sp = (n.spawns ?? []).find(s => check(state, s.if));
    if (sp && sp.map === map) acts.push({ kind: 'talk', id: n.dialogue, who: n.id });
  }
  for (const o of MAPS[map].objects(state)) if (o.dialogue && check(state, o.if) && check(state, o.reach)) acts.push({ kind: 'talk', id: o.dialogue, who: o.dialogue });
  for (const p of MAPS[map].props(state)) if (p[3]?.dialogue && check(state, p[3].reach)) acts.push({ kind: 'talk', id: p[3].dialogue, who: p[3].dialogue });
  const md = buildMap(MAPS[map], state);
  for (const wp of md.warps) {
    if (wp.if && !check(state, wp.if)) continue;
    if (map === 'town' && wp.to === 'meadow' && !canCrossSpan(state)) continue;
    acts.push({ kind: 'warp', to: wp.to });
  }
  acts.push({ kind: 'wait' });
  return acts;
}

// Crossing the Span: fixed and not collapsed, or ferried by Gil / rebuilt after a collapse.
function canCrossSpan(state) {
  if (!state.has('bridge_fixed')) return false;
  if (state.has('span_collapsed')) return state.has('ferried') || state.has('span_rebuilt');
  return true;
}

function runDialogue(state, id, rand, log, careful, depth = 0) {
  const d = DIALOGUES[id];
  const entry = (d.entries ?? [{ node: 'start' }]).find(e => check(state, e.if));
  let node = entry && d.nodes[entry.node];
  let steps = 0;
  while (node && steps++ < 60) {
    apply(state, node.effects);
    if (node.choices) {
      let vis = node.choices.filter(c => check(state, c.if));
      if (careful) { const safe = vis.filter(c => !/rotten/.test(c.next ?? '')); if (safe.length) vis = safe; }
      if (!vis.length) break;
      const c = vis[Math.floor(rand() * vis.length)];
      log.push(`${id}: "${c.text}"`);
      apply(state, c.effects);
      node = c.next ? d.nodes[c.next] : null;
    } else if (node.branch) { const b = node.branch.find(x => check(state, x.if)); node = b?.next ? d.nodes[b.next] : null; }
    else node = node.next ? d.nodes[node.next] : null;
  }
  // battles queued by the conversation: the simulator always wins them
  while (state.pendingBattles?.length && depth < 5) {
    const b = state.pendingBattles.shift();
    state.set('won_' + b.id);
    log.push(`battle ${b.id}`);
    if (b.after) runDialogue(state, b.after, rand, log, careful, depth + 1);
  }
}

const CH1 = CHAPTERS.length > 0;
function simulate(seed, maxSteps = 600, careful = false, untilPrologue = false) {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const state = new State();
  let ended = false;
  const onEnd = () => { ended = true; };
  const onFade = to => { state.d.hour = to === 'night' ? 21 : 8; };
  bus.removeAllListeners();
  bus.on('ending', id => {
    if (!id || id === 'prologue') {
      if (!CH1 || untilPrologue) { ended = true; return; }
      state.set('prologue_done'); state.set('ch1'); state.d.day += 1; state.d.hour = 8; state.d.map = 'town'; log.push('== chapter 1');
    } else { state.set(id + '_done'); ended = true; }
  });
  bus.on('fade', onFade);
  bus.on('battle', (id, after) => { (state.pendingBattles ??= []).push({ id, after }); });
  bus.on('set-hour', h => { state.d.hour = h; });
  const log = [];
  for (let step = 0; step < maxSteps && !ended; step++) {
    const acts = available(state);
    const a = acts[Math.floor(rand() * acts.length)];
    if (a.kind === 'talk') runDialogue(state, a.id, rand, log, careful);
    else if (a.kind === 'warp') {
      state.d.map = a.to; log.push(`-> ${a.to}`);
      if (a.to === 'meadow' && !state.has('seen_meadow')) { state.set('seen_meadow'); if (!state.isNight()) state.d.hour = 20; if (state.quest('span') !== undefined) state.setQuest('span', -1); }
    }
    else state.d.hour = state.isNight() ? 8 : 21;
  }
  return { ended, state, log };
}

const runs = +(process.argv[2] ?? 3000);
let wins = 0; const endFlags = new Map(); const stuck = [];
for (let i = 0; i < runs; i++) {
  const r = simulate(i * 7919 + 1, 2000);
  if (r.ended) {
    wins++;
    for (const f of ['bridge_flimsy', 'stranger_fed', 'told_truth', 'kept_shard', 'wisp_bottled', 'wisp_friend', 'child_escort', 'singer_healed', 'singer_half', 'shared_walk', 'stall_fixed', 'gil_done', 'bobber_sold'])
      if (r.state.has(f)) endFlags.set(f, (endFlags.get(f) ?? 0) + 1);
  } else if (stuck.length < 3) stuck.push({ flags: [...r.state.flags].join(','), quests: JSON.stringify(r.state.d.quests), items: r.state.d.inv.map(i => i.id + 'x' + i.n).join(','), last: r.log.slice(-6) });
}

let careful = 0, sturdy = 0;
const carefulStuck = [];
for (let i = 0; i < Math.min(runs, 1000); i++) { const r = simulate(i * 104729 + 3, 3000, true); if (r.ended) { careful++; if (!r.state.has('bridge_flimsy')) sturdy++; } else if (carefulStuck.length < 2) carefulStuck.push({ flags: [...r.state.flags].join(','), quests: JSON.stringify(r.state.d.quests), items: r.state.d.inv.map(i => i.id + 'x' + i.n).join(','), gold: r.state.d.gold, map: r.state.d.map, last: r.log.slice(-5) }); }
if (process.env.DEBUG) console.log(JSON.stringify(carefulStuck, null, 1));

console.log(`Static checks: ${errors.length} errors, ${warns.length} warnings`);
for (const e of errors) console.log('  ERROR ' + e);
for (const w of warns.slice(0, 20)) console.log('  warn  ' + w);
console.log(`\nSimulation: ${wins}/${runs} random playthroughs reached the ending (${(100 * wins / runs).toFixed(1)}%)`);
console.log('Consequence coverage among endings:', Object.fromEntries([...endFlags].map(([k, v]) => [k, `${Math.round(100 * v / Math.max(1, wins))}%`])));
console.log(`Careful players (never pick rotten planks): ${careful}/${Math.min(runs, 1000)} finished, ${sturdy} with a sturdy bridge`);
if (stuck.length) console.log('Sample unfinished runs:', JSON.stringify(stuck, null, 1));
process.exit(errors.length || wins === 0 ? 1 : 0);
