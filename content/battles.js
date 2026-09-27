// Battle data: party members, enemies and encounters. Numbers are tuned for short, friendly fights.

export const PARTY = {
  tavi: {
    name: 'Tavi', sprite: 'hunter', face: 'hunter',
    base: { hp: 30, lp: 10, atk: 7, def: 3, spd: 6 }, grow: { hp: 7, lp: 2, atk: 2, def: 1, spd: 1 },
    skills: [
      { id: 'flare', name: 'Flare', lp: 4, level: 1, target: 'enemy', power: 13, desc: 'Lantern fire on one foe.' },
      { id: 'glow', name: 'Glow', lp: 3, level: 1, target: 'ally', heal: 14, desc: 'Warm light heals an ally.' },
      { id: 'burst', name: 'Lantern Burst', lp: 6, level: 3, target: 'enemies', power: 10, desc: 'Light floods every foe.' },
    ],
  },
  sella: {
    name: 'Sella', sprite: 'woman', face: 'woman',
    base: { hp: 24, lp: 12, atk: 5, def: 2, spd: 8 }, grow: { hp: 5, lp: 3, atk: 2, def: 1, spd: 1 },
    skills: [
      { id: 'shards', name: 'Glass Shards', lp: 4, level: 1, target: 'enemies', power: 7, desc: 'Sharp glass hits all foes.' },
      { id: 'mend', name: 'Mend', lp: 3, level: 1, target: 'ally', heal: 12, desc: 'Patch up an ally.' },
      { id: 'prism', name: 'Prism', lp: 5, level: 3, target: 'enemy', power: 16, desc: 'Focused light, one foe.' },
    ],
  },
};

export function xpToNext(level) { return 10 * level * level + 10 * level; }

export function statsOf(id, member) {
  const p = PARTY[id];
  const l = (member?.lvl ?? 1) - 1;
  const s = {};
  for (const k of Object.keys(p.base)) s[k] = p.base[k] + p.grow[k] * l;
  return { maxHp: s.hp, maxLp: s.lp, atk: s.atk, def: s.def, spd: s.spd };
}

// sprite: 'm:<file>' monster sheet (4x4, 16px), 'c:<char>' character sheet, 'boss:<file>' 50px strip.
export const ENEMIES = {
  moth: { name: 'Grey Moth', sprite: 'm:butterfly', tint: 0xd8d0ec, desat: 1, front: true, hp: 14, atk: 5, def: 1, spd: 7, xp: 4, gold: 2,
    moves: [{ name: 'Dust', chance: 0.3, power: 3, drainLp: 3, text: 'grey dust!' }] },
  wick: { name: 'Snuffed Wick', sprite: 'm:lanternred', tint: 0xc8b8e8, desat: 0.7, front: true, hp: 18, atk: 6, def: 2, spd: 4, xp: 6, gold: 4,
    moves: [{ name: 'Flicker', chance: 0.35, power: 4, all: true, text: 'a cold flicker!' }] },
  slime: { name: 'Dim Slime', sprite: 'm:slime', tint: 0xc0c0dc, desat: 0.9, front: true, hp: 22, atk: 5, def: 3, spd: 3, xp: 5, gold: 3, moves: [] },
  guard: { name: 'Wickwarden', sprite: 'c:knight', tint: 0xd8ccff, hp: 26, atk: 7, def: 3, spd: 5, xp: 8, gold: 6,
    moves: [{ name: 'Shield Bash', chance: 0.25, power: 9, text: 'a shield bash!' }] },
  corvin: { name: 'Corvin', sprite: 'c:sorcererblack', tint: 0xe6dcff, hp: 70, atk: 8, def: 4, spd: 6, xp: 30, gold: 20, boss: true,
    moves: [{ name: 'Violet Levy', chance: 0.35, power: 5, all: true, drainLp: 2, text: 'the Violet Levy!' }] },
  hollow: { name: 'The Hollow Wick', sprite: 'boss:giantspirit', tint: 0xcabcff, hp: 120, atk: 9, def: 4, spd: 5, xp: 45, gold: 30, boss: true,
    moves: [
      { name: 'Hush', chance: 0.3, power: 7, all: true, text: 'a hush that swallows light!' },
      { name: 'Swarm', chance: 0.25, summon: 'moth', text: 'more moths!' },
    ] },
};

export const BATTLES = {
  moths_dock: { enemies: ['moth', 'moth'], bg: 'town', music: 'fight', intro: 'Grey moths swarm the dock!' },
  road_moths: { enemies: ['moth', 'moth', 'moth'], bg: 'road', music: 'fight', intro: 'Moths flutter out of the reeds!' },
  road_lanterns: { enemies: ['wick', 'moth', 'wick'], bg: 'road', music: 'fight', intro: 'Snuffed wicks drift closer...' },
  road_slimes: { enemies: ['slime', 'slime'], bg: 'road', music: 'fight', intro: 'Dim slimes ooze across the road!' },
  goons_ford: { enemies: ['guard', 'guard'], bg: 'road', music: 'fight2', intro: 'The Wickwardens raise their shields!',
    talk: { chance: 0.35, bonus: [[{ flag: 'told_truth' }, 0.4], [{ flag: 'stranger_fed' }, 0.1], [{ flag: 'pell_friend' }, 0.3]],
      win: 'The guards look at each other, then step aside.', fail: 'They are not in the mood to chat.' } },
  nest_boss: { enemies: ['moth', 'hollow', 'moth'], bg: 'nest', music: 'final_area', noRun: true, intro: 'The Hollow Wick rises from the nest!' },
  corvin: { enemies: ['guard', 'corvin', 'guard'], bg: 'town', music: 'fight2', noRun: true, intro: 'Corvin draws his violet lantern.',
    talk: { chance: 0, bonus: [[{ flag: 'corvin_doubts' }, 0.7]], win: 'Corvin lowers the lantern. His hands are shaking.', fail: 'Corvin will not listen. Not yet.' } },
};

// Items that work in battle (heal = HP for one ally, lp = lantern power).
export const BATTLE_ITEMS = ['plumcake', 'herb', 'fish', 'honey', 'glimdrop'];
