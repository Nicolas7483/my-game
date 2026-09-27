// Merges the prologue with every chapter file (content/chapter*.js) into one set of game data.
// Chapter NPC spawns and dialogue entries go BEFORE the prologue ones (their conditions include the chapter flag).
import * as prologue from './story.js';
import { ITEMS as BASE_ITEMS } from './items.js';

const isNode = typeof process !== 'undefined' && !!process.versions?.node;
async function loadNodeChapters() {
  const { readdirSync } = await import('node:fs');
  const dir = new URL('.', import.meta.url);
  const files = readdirSync(dir).filter(f => /^chapter\d+\.js$/.test(f)).sort();
  return Promise.all(files.map(f => import(new URL(f, dir).href)));
}
const chapterMods = isNode ? await loadNodeChapters() : Object.values(import.meta.glob('./chapter*.js', { eager: true }));
export const CHAPTERS = chapterMods.map(m => Object.values(m).find(v => v && typeof v === 'object' && v.DIALOGUES)).filter(Boolean);

const npcs = (Array.isArray(prologue.NPCS) ? prologue.NPCS : Object.values(prologue.NPCS)).map(n => ({ ...n, spawns: [...(n.spawns ?? [])] }));
const dialogues = Object.fromEntries(Object.entries(prologue.DIALOGUES).map(([k, d]) => [k, { entries: [...(d.entries ?? [{ node: 'start' }])], nodes: { ...d.nodes } }]));
const quests = { ...prologue.QUESTS };
const examine = { ...prologue.EXAMINE };
const items = { ...BASE_ITEMS };

for (const ch of [...CHAPTERS].reverse()) {
  for (const n of ch.NPCS ?? []) {
    const existing = npcs.find(x => x.id === n.id);
    if (existing) {
      const { spawns, ...rest } = n;
      existing.spawns = [...(spawns ?? []), ...existing.spawns];
      Object.assign(existing, Object.fromEntries(Object.entries(rest).filter(([k]) => k !== 'id')));
    } else npcs.push({ ...n, spawns: [...(n.spawns ?? [])] });
  }
  for (const [id, d] of Object.entries(ch.DIALOGUES ?? {})) {
    if (dialogues[id]) { dialogues[id].entries = [...(d.entries ?? []), ...dialogues[id].entries]; Object.assign(dialogues[id].nodes, d.nodes); }
    else dialogues[id] = { entries: d.entries ?? [{ node: 'start' }], nodes: { ...d.nodes } };
  }
  Object.assign(quests, ch.QUESTS ?? {});
  Object.assign(examine, ch.EXAMINE ?? {});
  for (const [id, it] of Object.entries(ch.ITEMS ?? {})) items[id] = { ...(items[id] ?? {}), ...it };
}

export const NPCS = npcs;
export const DIALOGUES = dialogues;
export const QUESTS = quests;
export const EXAMINE = examine;
export const ITEMS = items;
export const INTRO = prologue.INTRO;
export const ENDING = prologue.ENDING;
export const ENDINGS = { prologue: prologue.ENDING, ...Object.fromEntries(CHAPTERS.map((c, i) => [`ch${i + 1}`, c.ENDING])) };
export const CHAPTER_INTROS = Object.fromEntries(CHAPTERS.map((c, i) => [i + 1, c.INTRO]));
