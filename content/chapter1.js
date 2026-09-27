// Lanternfall: Chapter 1 "The Lantern Tax"
// Plain data merged by the engine on top of the prologue (see docs/content-spec.md).
// Existing NPC/dialogue ids only add ch1 spawns/entries (all gated on flag 'ch1');
// their node ids start with c1_. Helpers below only build plain objects.

const toast = (text, icon = 'star') => ({ toast: text, icon });
const heartUp = (text = 'Sella will remember that.') => [
  { addVar: ['aff_sella', 1] },
  toast(text, 'heart'),
];
const heartDown = (text = 'Sella will remember that.') => [
  { addVar: ['aff_sella', -1] },
  toast(text, 'heartbreak'),
];
const N = ''; // narration speaker
const IN_CH1 = { flag: 'ch1' };
const ch1 = (...conds) => ({ all: [IN_CH1, ...conds] });
const flag = (f) => ({ flag: f });
const notFlag = (f) => ({ notFlag: f });
// Speakers from other dialogues
const SELLA = { speaker: 'Sella', face: 'woman' };
const MARLA = { speaker: 'Marla', face: 'villager2' };
const GIL = { speaker: 'Gil', face: 'oldman2' };
const CORAL = { speaker: 'Coral', face: 'villager5' };
const BRAM = { speaker: 'Bram', face: 'knight' };
const PELL = { speaker: 'Pell', face: 'boy' };
const CORVIN = { speaker: 'Corvin', face: 'sorcererblack' };
const FEN = { speaker: 'Old Fen', face: 'oldman' };

// ---------------------------------------------------------------- INTRO
const INTRO = [
  'The morning after. The Tamble rose in the night, fat and brown with rain.',
  'Up the coast road, wheels creak. Three wagons, hung with violet lanterns.',
  'Grey moths ride on the roofs like passengers who never paid.',
  'Puddlewick wakes to a very official sound. THUNK. A stamp.',
];

// ---------------------------------------------------------------- ITEMS
const ITEMS = {
  // herb and glimdrop already live in content/items.js
  violet_lantern: { name: 'Violet Lantern', icon: 'gempurple', key: true,
    desc: 'The hooded stranger left it. It hums at your lantern.' },
  tax_notice: { name: 'Tax Notice', icon: 'letter2', desc: 'ONE WICK PER HOUSEHOLD. Stamped four times. Very official.' },
  moth_dust: { name: 'Moth Dust', icon: 'bag', desc: 'Grey dust. Sticky. Smells like wagon grease.' },
  ford_pass: { name: 'Ford Pass', icon: 'letter', desc: 'Lets the bearer cross the ford. Stamp slightly smudged.' },
  bram_note: { name: "Bram's Letter", icon: 'letter', desc: "'Tavi is honest.' Bram saluted it. Twice." },
  glow_float: { name: 'Glow Float', icon: 'gemyellow', desc: 'A Puddlewick fishing float. It glows like a tiny moon.' },
  moonmint: { name: 'Moonmint', icon: 'seed1', desc: 'Silver-green leaves. Nan Wren brews it into sleepy tea.' },
  dumpling: { name: 'Ladle Dumpling', icon: 'onigiri', desc: 'Fat, hot, suspiciously good. Heals 20 HP.',
    use: [{ heal: 20 }, { takeItem: 'dumpling' }] },
  gruel: { name: 'Grey Gruel', icon: 'waterpot', desc: 'Wickwarden gruel. Heals 5 HP and one ounce of joy.',
    use: [{ heal: 5 }, { takeItem: 'gruel' }] },
  moth_lantern: { name: 'Moth-Lantern', icon: 'lifepot', key: true,
    desc: "Grey glass full of stolen glims. The Warden's violet seal." },
};

// ---------------------------------------------------------------- NPCS
const NPCS = [
  // ---- New characters
  { id: 'corvin', name: 'Corvin', sprite: 'SorcererBlack', face: 'sorcererblack', dialogue: 'corvin',
    spawns: [ { if: ch1(notFlag('ch1_done')), map: 'town', spot: 'plaza', dx: 1, dy: 1 } ] },
  { id: 'wguard1', name: 'Wickwarden', sprite: 'Knight', face: 'knight', dialogue: 'wguard',
    spawns: [ { if: ch1(notFlag('ch1_done')), map: 'town', spot: 'plaza', dx: 3, dy: 1 } ] },
  { id: 'wguard2', name: 'Wickwarden', sprite: 'Knight', face: 'knight', dialogue: 'wguard',
    spawns: [ { if: ch1(notFlag('ch1_done')), map: 'town', spot: 'plaza', dx: 2, dy: -1 } ] },
  { id: 'fguard1', name: 'Ford Guard', sprite: 'Knight', face: 'knight', dialogue: 'ford',
    spawns: [
      { if: ch1(notFlag('ford_open')), map: 'riverroad', spot: 'ford', dy: -1 },
      { if: ch1(notFlag('won_goons_ford')), map: 'riverroad', spot: 'camp', dx: 2 },
    ] },
  { id: 'fguard2', name: 'Ford Guard', sprite: 'Knight', face: 'knight', dialogue: 'ford',
    spawns: [
      { if: ch1(notFlag('ford_open')), map: 'riverroad', spot: 'ford', dy: 1 },
      { if: ch1(notFlag('won_goons_ford')), map: 'riverroad', spot: 'camp', dx: 3 },
    ] },
  { id: 'camp_guard', name: 'Wickwarden', sprite: 'Knight', face: 'knight', dialogue: 'camp_guard',
    spawns: [ { if: IN_CH1, map: 'riverroad', spot: 'camp', dx: -2 } ] },
  { id: 'pell', name: 'Pell', sprite: 'Boy', face: 'boy', dialogue: 'pell',
    spawns: [
      { if: ch1(flag('ch1_done'), flag('pell_ally')), map: 'inn_in', spot: 'table' },
      { if: ch1(flag('pell_ally'), flag('won_nest_boss')), map: 'town', spot: 'plaza', dy: 2 },
      { if: ch1(notFlag('ch1_done')), map: 'riverroad', spot: 'camp', dx: 1, dy: 2 },
    ] },
  { id: 'ladle', name: 'Mother Ladle', sprite: 'Villager6', face: 'villager6', dialogue: 'ladle',
    spawns: [ { if: IN_CH1, map: 'riverroad', spot: 'camp', dx: -1, dy: 2 } ] },
  { id: 'tob', name: 'Tob', sprite: 'OldMan3', face: 'oldman3', dialogue: 'tob',
    spawns: [ { if: IN_CH1, map: 'riverroad', spot: 'milestone', dx: 1 } ] },

  // ---- Prologue villagers (ch1 spawns only; placed before prologue spawns)
  { id: 'fen', spawns: [ { if: IN_CH1, map: 'town', spot: 'plaza', dx: -2, dy: 1, wander: 1 } ] },
  { id: 'marla', spawns: [
    { if: ch1(flag('ch1_done'), flag('lantern_hidden')), map: 'town', spot: 'plaza', dx: -1, dy: -1 },
    { if: IN_CH1, map: 'inn_in', spot: 'counter' },
  ] },
  { id: 'hobb', spawns: [
    { if: ch1(flag('span_collapsed'), notFlag('span_rebuilt')), map: 'town', spot: 'bridge_south', dx: -2 },
    { if: IN_CH1, map: 'town', spot: 'yard', wander: 2 },
  ] },
  { id: 'gil', spawns: [ { if: IN_CH1, map: 'town', spot: 'dock' } ] },
  { id: 'coral', spawns: [ { if: IN_CH1, map: 'town', spot: 'stall' } ] },
  { id: 'sella', spawns: [
    { if: ch1(flag('dock_alarm'), notFlag('won_moths_dock')), map: 'town', spot: 'dock', dx: -1 },
    { if: ch1(flag('won_moths_dock'), notFlag('won_nest_boss')), map: 'riverroad', spot: 'road_west', dx: 1 },
    { if: ch1(flag('won_nest_boss'), notFlag('ch1_done')), map: 'town', spot: 'plaza', dx: -1, dy: 1 },
    { if: ch1(flag('ch1_done')), map: 'workshop_in', spot: 'bench' },
    { if: IN_CH1, map: 'town', spot: 'workshop', wander: 1 },
  ] },
  { id: 'bram', spawns: [
    { if: ch1(flag('told_truth'), flag('won_nest_boss'), notFlag('ch1_done')), map: 'town', spot: 'plaza', dx: -3 },
    { if: IN_CH1, map: 'town', spot: 'bridge_south', dx: 1 },
  ] },
  { id: 'nettie', spawns: [ { if: IN_CH1, map: 'town', spot: 'garden', dx: 2, wander: 2 } ] },
  { id: 'wren', spawns: [ { if: IN_CH1, map: 'town', spot: 'wren_porch' } ] },
  { id: 'pim', spawns: [
    { if: ch1(flag('child_escort')), map: 'town', spot: 'wren_porch', dx: -1, wander: 1 },
    { if: IN_CH1, map: 'town', spot: 'garden', dx: -2, wander: 2 },
  ] },
];

// ---------------------------------------------------------------- QUESTS
const QUESTS = {
  tax: { title: 'The Lantern Tax', stages: [
    'See what the wagons want in the plaza.',
    'Ask Marla at the inn about a lantern.',
    'Moths at the dock! Help Sella.',
    'Follow the moths up the river road.',
    'Find the moth nest past the ford.',
    'Face Corvin in the plaza.',
  ] },
  ferry: { title: 'Across the Tamble', stages: [
    'The Span fell. Find a way across.',
    'Tell Gil what you found upriver.',
  ] },
  pell: { title: 'A Float for Mira', stages: [
    'Bring Pell a glow float from town.',
  ] },
  herbs: { title: 'Moonmint Tea', stages: [
    'Find moonmint at the old road shrine.',
    'Bring the moonmint to Nan Wren.',
  ] },
};

// ---------------------------------------------------------------- DIALOGUES
const DIALOGUES = {};

// ---- Optional opener (engine may open it after the chapter card and INTRO)
DIALOGUES.ch1_start = {
  entries: [ { node: 'start' } ],
  nodes: {
    start: { ...FEN, text: 'Young Tugboat! Up, up! Wagons in the plaza. Violet ones. With STAMPS.',
      effects: [ { setHour: 8 }, { quest: ['tax', 0] } ], next: 's2' },
    s2: { ...FEN, text: 'Wickwardens. Paperwork people. Bring your lantern. And your manners.' },
  },
};

// ---- Corvin, Wickwarden collector. Umbra's childhood friend, true believer.
// Tic: stamps things and says "Noted." Calls Umbra "the Warden", with reverence.
const famineNodes = {
  fam1: { speaker: N, text: 'The wagons roll east with half the grain. By supper, the shelves look thin.',
    branch: [ { if: flag('marla_kind'), next: 'famk' }, { next: 'famp' } ] },
  famk: { ...MARLA, text: 'Supper, sprouts! Everyone! I cooked the whole ledger. All tabs forgiven!',
    effects: [ { emote: ['marla', 'heart'] }, toast('Marla feeds the whole village.', 'heart') ],
    next: 'famk2' },
  famk2: { speaker: N, text: 'Tables fill the plaza. Soup, bread, and one plum cake cut forty ways.',
    next: 'fam_end' },
  famp: { speaker: N, text: 'Supper is thin. Everyone brings one thing. It is almost enough.',
    next: 'famp2' },
  famp2: { ...MARLA, text: 'Thin soup, sprouts. But hot. Nobody in Puddlewick eats alone.',
    effects: [ { emote: ['marla', 'sad'] } ], next: 'fam_end' },
  fam_end: { speaker: N, text: "In Sella's workshop, a crate of failures glows faintly violet. Nobody tells.",
    effects: [ { quest: ['tax', -1] }, { setFlag: 'ch1_done' }, { autosave: true }, { ending: 'ch1' } ] },
};

DIALOGUES.corvin = {
  entries: [
    { if: { all: [ flag('lantern_hidden'), notFlag('ch1_done') ] }, node: 're' },
    { if: { all: [ { quest: 'tax', stage: 5 }, notFlag('ch1_done') ] }, node: 'fin' },
    { if: flag('met_corvin'), node: 'mid' },
    { node: 'd1' },
  ],
  nodes: {
    // Decree
    d1: { speaker: N, text: 'Violet lanterns sway on the wagons. Grey moths nap on them like cats.',
      next: 'd2' },
    d2: { text: 'Citizens! Corvin, Wickwarden collector. By order of the Warden... *stamp*',
      next: 'd3' },
    d3: { text: 'One wick per household. Surplus light. And any unregistered lantern. Noted.',
      branch: [ { if: flag('bridge_flimsy'), next: 'col1' }, { next: 'hold1' } ] },
    col1: { speaker: N, text: "A groan from the river. Then a CRACK. Tamsy's Span folds into the Tamble.",
      effects: [ { setFlag: 'span_collapsed' }, { emote: ['corvin', 'surprise'] },
        toast("Tamsy's Span has collapsed.", 'moth') ],
      next: 'col2' },
    col2: { text: 'Was that a bridge? Unlicensed collapse. That is a fine. Noted.', next: 'lan1' },
    hold1: { speaker: N, text: "Far off, the swollen Tamble shoves at Tamsy's Span. The Span holds.",
      effects: [ toast('The Span held through the flood.', 'star') ], next: 'lan1' },
    lan1: { text: 'You. That lantern hums. Unregistered? Hand it... wait. *flips ledger*',
      next: 'lan2' },
    lan2: { text: "Exempt. By the Warden's own hand. How odd. The Warden is never odd.",
      choices: [
        { text: 'Who IS this Warden?', tone: 'kind', next: 'w1' },
        { text: 'Taxing light is theft.', tone: 'bold',
          effects: [ { emote: ['corvin', 'angry'] }, toast('Corvin will remember that.', 'moth') ],
          next: 'b1' },
        { text: 'Nice hat. Very official.', tone: 'sly',
          effects: [ { emote: ['corvin', 'happy'] } ], next: 's1' },
      ] },
    w1: { text: 'The best man in Candlemere. He shared his last candle with me once.', next: 'd_end' },
    b1: { text: "Theft? It's safekeeping. Light left loose gets lost. Ask any moth.", next: 'd_end' },
    s1: { text: "Thank you. It's regulation. The feather is not. Don't tell anyone.", next: 'd_end' },
    d_end: { text: 'Also: a violet lantern was left at your inn. I will have it. Noted.',
      effects: [ { setFlag: 'met_corvin' }, { setFlag: 'got_notice' }, { giveItem: 'tax_notice' },
        { quest: ['tax', 1] } ],
      branch: [ { if: flag('wisp_friend'), next: 'wf' }, { if: flag('wisp_bottled'), next: 'wb' } ] },
    wf: { speaker: N, text: 'Your wisp hides behind your lantern and blows a tiny raspberry at him.',
      effects: [ { emote: ['corvin', 'dots'] } ] },
    wb: { text: 'A star in a jar? Tidy. The Warden would approve. I approve. Noted.',
      effects: [ toast('Corvin approves. Hm.', 'moth') ] },

    // Between beats
    mid: { text: 'River child. Tax day. The moths and I are both very busy. Noted.', choices: [
      { text: 'Your wagons draw moths.', tone: 'bold', if: flag('won_moths_dock'), next: 'm1' },
      { text: 'Who is the Warden to you?', tone: 'kind', next: 'm2' },
      { text: 'Want a hug? For morale.', tone: 'sly', next: 'm4' },
      { text: 'Bye, Corvin.', next: null },
    ] },
    m1: { text: 'Moths love light. Wagons carry light. Simple. Nothing sinister. Noted.' },
    m2: { text: 'We grew up on the Flats. One flood night, he waited for a light. None came.',
      next: 'm3' },
    m3: { text: 'Now he makes sure the light always comes. For everyone. For me.',
      effects: [ { emote: ['corvin', 'heart'] } ] },
    m4: { text: 'Hugs are unregistered. ...Ask me after tax day. Maybe. Noted.',
      effects: [ { emote: ['corvin', 'surprise'] } ] },

    // Finale
    fin: { speaker: N, text: 'Corvin waits at the well. His guards hold an empty crate marked VIOLET.',
      next: 'fin2' },
    fin2: { text: 'Every household has paid, river child. All but one lantern. The violet one.',
      choices: [
        { text: "I'm not alone here.", tone: 'bold', next: 'fa_b' },
        { text: 'Can we talk first?', tone: 'kind', next: 'fa_k' },
        { text: 'Lantern? What lantern?', tone: 'sly', next: 'fa_s' },
      ] },
    fa_b: { text: 'No? Then who stands with you?', next: 'fin3' },
    fa_k: { text: 'Talk is free. Tax is not. But go on. I am listening.', next: 'fin3' },
    fa_s: { text: 'Your pocket is humming. Loudly. Noted.', next: 'fin3' },
    fin3: { speaker: N, text: 'The plaza goes quiet. Even the gulls lean in.',
      branch: [ { if: flag('told_truth'), next: 'res' }, { next: 'fin4' } ] },
    res: { ...BRAM, text: '*salutes* Someone cut our bridge! Puddlewick stands with Tavi! *salutes*',
      effects: [ { emote: ['corvin', 'surprise'] }, toast('The village stands with you.', 'star') ],
      next: 'fin4' },
    fin4: { speaker: N, text: 'Villagers gather behind you. Hobb counts them. He runs out of fingers.',
      branch: [
        { if: flag('kept_shard'), next: 'shard' },
        { if: flag('pell_ally'), next: 'pell' },
        { if: { var: 'aff_sella', gte: 2 }, next: 'hand' },
        { next: 'fin5' },
      ] },
    shard: { speaker: N, text: 'In your pocket, the shard hums with the violet lantern. Same glass. Same hand.',
      effects: [ { emote: ['corvin', 'surprise'] }, toast('The shard and the lantern resonate.', 'moth') ],
      branch: [
        { if: flag('pell_ally'), next: 'pell' },
        { if: { var: 'aff_sella', gte: 2 }, next: 'hand' },
        { next: 'fin5' },
      ] },
    pell: { ...PELL, text: "Sir? The locked wagon. It's full of moths. I looked. Sorry, sir.",
      effects: [ { emote: ['corvin', 'dots'] } ],
      branch: [ { if: { var: 'aff_sella', gte: 2 }, next: 'hand' }, { next: 'fin5' } ] },
    hand: { speaker: N, text: "Sella steps up beside you. Her hand brushes yours. It's shaking a bit.",
      choices: [
        { text: 'Take her hand.', tone: 'kind',
          effects: [ { setFlag: 'held_hands' }, { addVar: ['aff_sella', 1] }, { emote: ['sella', 'heart'] },
            toast('Sella holds your hand.', 'heart') ],
          next: 'hand_k' },
        { text: 'Want to hold my ladle?', tone: 'sly',
          effects: [ { setFlag: 'held_hands' }, { addVar: ['aff_sella', 1] }, { emote: ['sella', 'happy'] },
            toast('Sella snorts. Then takes your hand.', 'heart') ],
          next: 'hand_s' },
        { text: 'Not now. Stay sharp.', tone: 'bold',
          effects: [ { emote: ['sella', 'dots'] }, toast('Sella lets her hand drop.', 'heartbreak') ],
          next: 'hand_b' },
      ] },
    hand_k: { ...SELLA, text: "For the record, this is for balance. It's very windy. Hi.", next: 'fin5' },
    hand_s: { ...SELLA, text: "It's MY ladle. Hush. Give me your hand. There. Balance.", next: 'fin5' },
    hand_b: { ...SELLA, text: 'Right. Sharp. I am extremely sharp. Like glass.', next: 'fin5' },
    fin5: { text: 'The Warden wants that lantern. The Warden is never wrong. Hand it over.',
      choices: [
        { text: 'Show him the moth-lantern.', tone: 'bold',
          if: { all: [ { item: 'moth_lantern' }, notFlag('corvin_doubts') ] }, next: 'ev1' },
        { text: 'Pay the tax with it.', tone: 'kind', if: { item: 'violet_lantern' }, next: 'pay1' },
        { text: 'Hide it. Deny everything.', tone: 'sly', if: { item: 'violet_lantern' }, next: 'hide1' },
      ] },

    // Evidence
    ev1: { speaker: N, text: 'You set the grey moth-lantern on the well. Its violet seal glints.',
      next: 'ev2' },
    ev2: { text: "That seal is the Warden's. Umbra's. No. A forgery. It must be.",
      effects: [ { emote: ['corvin', 'surprise'] } ],
      branch: [ { if: flag('stranger_fed'), next: 'evf' }, { next: 'ev3' } ] },
    evf: { text: 'He wrote me of a child who fed him plum cake. Was that you?', next: 'ev3' },
    ev3: { text: 'I will ask him myself. Noted. ...Noted.',
      effects: [ { setFlag: 'corvin_doubts' }, toast('Corvin doubts. His ledger shakes.', 'moth') ],
      next: 'fin6' },
    fin6: { text: 'Even so. The law is the law. The violet lantern, please.', choices: [
      { text: 'Pay the tax with it.', tone: 'kind', if: { item: 'violet_lantern' }, next: 'pay1' },
      { text: 'Hide it. Deny everything.', tone: 'sly', if: { item: 'violet_lantern' }, next: 'hide1' },
    ] },

    // Pay
    pay1: { speaker: N, text: 'You hand over the violet lantern. It hums once at yours. Like goodbye.',
      effects: [ { takeItem: 'violet_lantern' }, { setFlag: 'lantern_paid' }, { emote: ['corvin', 'happy'] },
        toast('The violet lantern goes to the capital.', 'moth') ],
      next: 'pay2' },
    pay2: { text: 'Thank you. Truly. Puddlewick is paid in full. No fines. No hunger.',
      branch: [ { if: flag('child_escort'), next: 'payc' }, { next: 'pay3' } ] },
    payc: { text: 'I hear you walked a child home in the dark. He did that for me, once.',
      next: 'pay3' },
    pay3: { text: 'He is a good man. You will see. *stamp* Paid.',
      branch: [ { if: flag('corvin_doubts'), next: 'payd' }, { next: 'pay4' } ] },
    payd: { text: "I'll carry it myself. And I'll watch what it feeds.", next: 'pay4' },
    pay4: { speaker: N, text: 'The wagons roll east, violet light swaying. A grey cloud of moths follows.',
      next: 'pay5' },
    pay5: { ...SELLA, text: 'Safe is good. Safe is... good. Why does it feel like losing?',
      next: 'pay_end' },
    pay_end: { speaker: N, text: 'Puddlewick keeps its grain. The inn window stays dark tonight.',
      effects: [ { quest: ['tax', -1] }, { setFlag: 'ch1_done' }, { autosave: true }, { ending: 'ch1' } ] },

    // Hide
    hide1: { speaker: N, text: "You shrug. Behind you, Sella's FAILURES crate clicks shut. Nobody opens it.",
      effects: [ { takeItem: 'violet_lantern' }, { setFlag: 'lantern_hidden' }, { emote: ['sella', 'happy'] },
        toast('The violet lantern stays hidden.', 'star') ],
      next: 'hide2' },
    hide2: { text: 'No lantern? Then Puddlewick is fined. Half your grain rides with me.',
      effects: [ { emote: ['corvin', 'angry'] } ],
      branch: [ { if: flag('stall_fixed'), next: 'hidec' }, { next: 'hide3' } ] },
    hidec: { ...CORAL, text: 'And not one coin of mine rides with you. Closed. To you. Forever.',
      effects: [ { emote: ['coral', 'angry'] } ], next: 'hide3' },
    hide3: { text: 'The Warden is patient. I am less so. I will be back, river child.', choices: [
      { text: 'Let him go.', tone: 'kind', next: 'fam1' },
      { text: 'Stop him. Right now.', tone: 'bold', next: 'fight' },
    ] },
    fight: { text: 'Brave. Wrong, but brave. Guards! Ledgers up!',
      effects: [ { emote: ['corvin', 'angry'] }, { battle: 'corvin', after: 'corvin_after' } ] },

    // After losing the Corvin fight
    re: { text: 'Back again, river child? The wagons are loaded. Shall I just go?', choices: [
      { text: 'Go, then.', tone: 'kind', next: 'fam1' },
      { text: 'Round two.', tone: 'bold', next: 'fight' },
    ] },

    ...famineNodes,
  },
};

DIALOGUES.corvin_after = {
  entries: [ { if: flag('talked_corvin'), node: 'ct1' }, { node: 'ca1' } ],
  nodes: {
    ct1: { speaker: N, text: 'Corvin lowers the violet lantern. His hands are shaking.',
      effects: [ { setFlag: 'corvin_spared' }, toast('You talked Corvin down.', 'heart') ], next: 'ct2' },
    ct2: { ...CORVIN, text: 'Not today, lantern child. Maybe the Warden is wrong. Maybe.',
      next: 'fam1' },
    ca1: { speaker: N, text: 'Corvin sits down hard on the well. His ledger lands in a puddle.',
      effects: [ { setFlag: 'corvin_beaten' }, toast('Corvin is beaten. He will remember.', 'star') ],
      next: 'ca2' },
    ca2: { ...CORVIN, text: 'You fight like a promise. Stubborn. The grain left an hour ago, you know.',
      next: 'ca3' },
    ca3: { ...CORVIN, text: 'I only stayed to see your face. Noted. Deeply, deeply noted.',
      next: 'fam1' },
    ...famineNodes,
  },
};

// ---- Wickwarden guards in the plaza (anonymous)
DIALOGUES.wguard = {
  entries: [
    { if: flag('stall_fixed'), node: 'coral' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: '*yawn* I carry the crate. The crate is heavy. Life is heavy.', next: 's2' },
    s2: { text: 'Please move along. Or stay. Standing still is also allowed.' },
    coral: { text: "The stall lady won't sell us lunch. She said 'infinite gold'. Rude.", next: 'c2' },
    c2: { text: 'Do you have lunch? No? Right. Move along. Hungrily.' },
  },
};

// ---- Ford guards
DIALOGUES.ford = {
  entries: [
    { if: flag('ford_open'), node: 'open' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: 'Halt! Ford closed. Warden business. Moths. Paperwork. Mostly paperwork.',
      choices: [
        { text: 'I have a ford pass.', if: { item: 'ford_pass' }, next: 'pass' },
        { text: 'Bram says I am honest.', tone: 'kind',
          if: { all: [ { item: 'bram_note' }, { noItem: 'ford_pass' } ] }, next: 'note' },
        { text: 'The moths are YOUR wagon.', tone: 'bold',
          if: { all: [ flag('pell_told'), { noItem: 'ford_pass' }, { noItem: 'bram_note' } ] }, next: 'wagon' },
        { text: '10 gold for a peek?', tone: 'sly',
          if: { all: [ { gold: 10 }, { noItem: 'ford_pass' }, { noItem: 'bram_note' }, notFlag('pell_told') ] },
          next: 'bribe' },
        { text: 'Move. Or I move you.', tone: 'bold', next: 'fight' },
        { text: 'Later.', next: null },
      ] },
    pass: { text: 'A pass! Smudged, but a pass. Smudges are legal. Probably.',
      effects: [ { takeItem: 'ford_pass' } ], next: 'ok' },
    note: { text: 'Bram? Saluting Bram? He saluted a horse once. ...Fine. Bram is honest.',
      next: 'ok' },
    wagon: { text: 'The locked one? It hums at night. I KNEW it. Go. Go before I think.',
      next: 'ok' },
    bribe: { text: 'Peek granted. The peek lasts all day. Off you go.',
      effects: [ { gold: -10 } ], next: 'ok' },
    ok: { speaker: N, text: 'The guards shuffle aside. The ford splashes, cold and open.',
      effects: [ { setFlag: 'ford_open' }, toast('The ford is open.', 'quest'), { autosave: true } ],
      branch: [ { if: flag('won_moths_dock'), next: 'ok2' } ] },
    ok2: { speaker: N, text: 'Past the ford, dead grey trees. The moth tracks lead straight in.',
      effects: [ { quest: ['tax', 4] } ] },
    fight: { text: 'Oh good. We were so bored. Shields up!',
      effects: [ { battle: 'goons_ford', after: 'ford_after' } ] },
    open: { text: 'Ford is open. We are on moth-watch now. From very far away.' },
  },
};

DIALOGUES.ford_after = {
  entries: [ { if: flag('talked_goons_ford'), node: 't1' }, { node: 'a1' } ],
  nodes: {
    t1: { speaker: N, text: 'The guards lower their shields and wave you through. Nobody wanted a fight.',
      effects: [ { setFlag: 'ford_open' }, toast('The ford is open.', 'quest'), { autosave: true } ],
      branch: [ { if: flag('won_moths_dock'), next: 'a2' } ] },
    a1: { speaker: N, text: 'The guards flee into the reeds, yelling about paperwork.',
      effects: [ { setFlag: 'ford_open' }, toast('The ford is open.', 'quest'), { autosave: true } ],
      branch: [ { if: flag('won_moths_dock'), next: 'a2' } ] },
    a2: { ...SELLA, text: 'Ha! Paperwork beats rock. Lantern beats paperwork. Nest next.',
      effects: [ { quest: ['tax', 4] } ] },
  },
};

// ---- Camp guard: bribed, charmed or fooled
DIALOGUES.camp_guard = {
  entries: [
    { if: { all: [ flag('guard_fooled'), flag('won_nest_boss') ] }, node: 'caught' },
    { if: flag('guard_done'), node: 'done' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: '*yawn* Halt. I hand out ford passes. Or naps. Mostly naps.', choices: [
      { text: 'Here. 5 gold for snacks.', tone: 'sly', if: { gold: 5 }, next: 'bribe' },
      { text: 'Mother Ladle sent this.', tone: 'kind', if: { item: 'dumpling' }, next: 'charm' },
      { text: 'Wave the tax notice. Orders!', tone: 'sly', if: { item: 'tax_notice' }, next: 'fool' },
      { text: 'Sleep well.', next: null },
    ] },
    bribe: { text: 'Snacks accepted. One ford pass. We never met. *yawn*',
      effects: [ { gold: -5 }, { giveItem: 'ford_pass' }, { setFlag: 'guard_done' } ] },
    charm: { text: "Ladle's dumpling! I'd give you my boots. Here, take a pass instead.",
      effects: [ { takeItem: 'dumpling' }, { giveItem: 'ford_pass' }, { setFlag: 'guard_done' },
        { emote: ['camp_guard', 'heart'] } ] },
    fool: { text: 'Orders from Corvin?! Here! A pass! Tell him I stood up straight!',
      effects: [ { giveItem: 'ford_pass' }, { setFlag: 'guard_done' }, { setFlag: 'guard_fooled' },
        { emote: ['camp_guard', 'surprise'] } ] },
    done: { text: 'You have a pass. I have a nap. Everyone wins. *yawn*' },
    caught: { text: 'Corvin says he never sent you. I am on latrine duty now. Thanks.',
      effects: [ { emote: ['camp_guard', 'angry'] } ] },
  },
};

// ---- Pell, scared young guard. Can become an ally.
DIALOGUES.pell = {
  entries: [
    { if: { all: [ flag('ch1_done'), flag('pell_ally') ] }, node: 'post' },
    { if: flag('pell_ally'), node: 'ally' },
    { if: { all: [ flag('pell_float_asked'), { item: 'glow_float' } ] }, node: 'give' },
    { if: flag('pell_float_asked'), node: 'waiting' },
    { if: flag('pell_met'), node: 'again' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: 'A young guard hides behind a tent, holding his spear upside down.',
      next: 's2' },
    s2: { text: "I'm not hiding! I'm guarding this tent. From behind. Tactically.", next: 's3' },
    s3: { text: "Are there moths on me? Don't look. No, look. Are there?",
      effects: [ { setFlag: 'pell_met' } ],
      choices: [
        { text: 'No moths. Share my light?', tone: 'kind', next: 'k1' },
        { text: 'Out of my way, soldier.', tone: 'bold',
          effects: [ { emote: ['pell', 'surprise'] }, toast('Pell squeaks. He will remember.', 'moth') ],
          next: 'b1' },
        { text: "One's on your nose. Boo.", tone: 'sly',
          effects: [ { emote: ['pell', 'surprise'] } ], next: 'sl1' },
      ] },
    b1: { text: 'Yes sir! No sir! I mean, eep! Moving! Moved!' },
    sl1: { text: "EEK! ...That was mean. Funny. But mean. Are there really none?", next: 's3' },
    again: { text: 'Oh. You again. Are you going to shout? Or boo? Please pick nice.',
      choices: [
        { text: 'Sorry. Share my light?', tone: 'kind', next: 'k1' },
        { text: 'Carry on, soldier.', next: null },
      ] },
    k1: { speaker: N, text: 'He scoots into your lantern light. His shoulders drop an inch.',
      effects: [ { setFlag: 'pell_friend' }, { emote: ['pell', 'heart'] } ], next: 'k2' },
    k2: { text: "I'm Pell. I joined for the free boots. Nobody said moths.", next: 'k3' },
    k3: { text: "The moths come off the back wagon. The locked one. We're not to look.",
      effects: [ { setFlag: 'pell_told' }, toast('Pell told you about the locked wagon.', 'quest') ],
      next: 'k4' },
    k4: { text: "I promised my sister a Puddlewick glow float. But I can't go to town.",
      choices: [
        { text: "I'll bring you one.", tone: 'kind',
          effects: [ { setFlag: 'pell_float_asked' }, { quest: ['pell', 0] } ], next: 'k5' },
        { text: 'Not my problem.', tone: 'bold',
          effects: [ { emote: ['pell', 'sad'] } ], next: 'k6' },
      ] },
    k5: { text: 'Really? A promise? A real one?', next: 'k7' },
    k7: { speaker: N, text: 'Pell dips a hand in a puddle to seal it. Close enough to a river.' },
    k6: { text: 'Right. No. Of course. Sorry. I apologize a lot. Sorry.' },
    waiting: { text: 'A glow float for Mira. Gil at the dock has them. Or Coral. Coral has everything.' },
    give: { text: "A glow float! It's so floaty! Mira is going to SCREAM.",
      effects: [ { takeItem: 'glow_float' }, { setFlag: 'pell_ally' }, { quest: ['pell', -1] },
        { emote: ['pell', 'heart'] }, toast('A promise kept. Pell is your ally.', 'star') ],
      next: 'give2' },
    give2: { text: "Take my ford pass. And a glimdrop. I'll say I lost them. I lose things.",
      effects: [ { giveItem: 'ford_pass' }, { giveItem: 'glimdrop' } ] },
    ally: { text: "Ford's that way. Nest's past it. I'll cheer. Quietly. From here." },
    post: { text: 'Marla hired me! I wash cups. Nobody yells. Cups never have moths.' },
  },
};

// ---- Mother Ladle, Wickwarden camp cook
DIALOGUES.ladle = {
  entries: [
    { if: flag('ladle_done'), node: 'done' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: 'A round woman stirs a pot the size of a bathtub. It glugs. Ominously.',
      next: 's2' },
    s2: { text: 'Wickwarden gruel. Grey, like everything the Warden likes. Taste. Be honest.',
      choices: [
        { text: "It's awful. Sorry.", tone: 'kind',
          effects: [ { setFlag: 'ladle_done' }, { giveItem: 'dumpling' }, { emote: ['ladle', 'happy'] } ],
          next: 'hon' },
        { text: 'Delicious! Seconds?', tone: 'sly',
          effects: [ { setFlag: 'ladle_done' }, { giveItem: 'gruel' }, { emote: ['ladle', 'dots'] } ],
          next: 'lie' },
        { text: 'Why is it grey?', tone: 'bold', next: 'why' },
      ] },
    hon: { text: 'HA! A tongue with manners! Here. Real food. My secret dumplings.' },
    lie: { text: 'Liar. Sweet little liar. Here, seconds. Enjoy your punishment.' },
    why: { text: 'Warden orders. No color, no spice, no fuss. Safe food. Sad food.', next: 's2' },
    done: { text: 'The moths eat better than my boys. They get the good light. Hmph.' },
  },
};

// ---- Tob, traveler at the milestone
DIALOGUES.tob = {
  entries: [
    { if: flag('tob_helped'), node: 'done' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: "Morning! Tob. Postman. Capital's three days. I've been here two.", next: 's2' },
    s2: { text: 'My feet filed a complaint. I am delivering it personally.', choices: [
      { text: 'Have a herb. For the feet.', tone: 'kind', if: { item: 'herb' },
        effects: [ { takeItem: 'herb' }, { giveItem: 'glimdrop' }, { setFlag: 'tob_helped' },
          { emote: ['tob', 'heart'] } ],
        next: 'gift' },
      { text: "What's in the capital?", next: 'cap1' },
      { text: 'Deliver it faster?', tone: 'sly', next: 'fast' },
      { text: 'Bye, Tob.', next: null },
    ] },
    gift: { text: 'Bless you. Here, a glimdrop. Found it in a ditch. Ditches are generous.' },
    cap1: { text: 'The sky never goes dark there now. Lanterns everywhere. Nobody sleeps.',
      next: 'cap2' },
    cap2: { text: 'Wagons go in full of light. They come back full of moths. Odd, eh?' },
    fast: { text: 'Faster? Young one, I have delivered letters to people who died waiting.',
      next: 'fast2' },
    fast2: { text: 'Joke! Mostly. Slow mail is still mail. A promise, just late.' },
    done: { text: 'Day three starts tomorrow. Or the day after. I am pacing myself.' },
  },
};

// ---- Object: the Wickwarden decree on the plaza notice board
DIALOGUES.decree = {
  entries: [
    { if: flag('got_notice'), node: 'read' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: 'BY ORDER OF THE WARDEN: ONE WICK PER HOUSEHOLD. SURPLUS LIGHT.',
      next: 's2' },
    s2: { speaker: N, text: 'ALSO ANY UNREGISTERED LANTERN. The stamp is pressed so hard it tore.',
      next: 's3' },
    s3: { speaker: N, text: 'A spare copy flaps loose. You pocket it. Paperwork is contagious.',
      effects: [ { setFlag: 'got_notice' }, { giveItem: 'tax_notice' }, { quest: ['tax', 0] } ] },
    read: { speaker: N, text: "Under the decree, scrawled: 'SURPLUS? MY LIGHT IS NOT EXTRA.' (Nettie)",
      next: 'r2' },
    r2: { speaker: N, text: "Under that, smaller: 'Steve agrees.' A drawing of a rock." },
  },
};

// ---- Object: the box behind the inn counter
DIALOGUES.violet_lantern_box = {
  entries: [
    { if: flag('got_violet'), node: 'empty' },
    { if: flag('marla_told'), node: 'open' },
    { node: 'locked' },
  ],
  nodes: {
    locked: { speaker: N, text: "A box behind Marla's counter. It hums. Better ask Marla first." },
    open: { speaker: N, text: 'Inside, wrapped in a napkin: a lantern of violet glass. It hums at yours.',
      branch: [ { if: flag('kept_shard'), next: 'shard' }, { next: 'take' } ] },
    shard: { speaker: N, text: 'The shard in your pocket joins in. Three notes, one chord. Same glassmaker.',
      effects: [ toast('The shard and the lantern resonate.', 'moth') ], next: 'take' },
    take: { speaker: N, text: 'Your lantern growls softly, like two dogs meeting. You take the violet one.',
      effects: [ { setFlag: 'got_violet' }, { giveItem: 'violet_lantern' } ], next: 'alarm' },
    alarm: { speaker: N, text: 'A bell clangs at the dock. Someone yells: MOTHS! Big grey ones!',
      effects: [ { setFlag: 'dock_alarm' }, { quest: ['tax', 2] }, { emote: ['marla', 'surprise'] },
        { autosave: true } ],
      next: 'alarm2' },
    alarm2: { ...MARLA, text: "Go, sprout! Sella's already running at them with a soup ladle!" },
    empty: { speaker: N, text: 'An empty box, one napkin, and a single grey moth wing.' },
  },
};

// ---- After the dock battle
DIALOGUES.dock_after = {
  entries: [ { node: 'a1' } ],
  nodes: {
    a1: { speaker: N, text: 'The last moth pops into grey dust. The wick-floats bob, dim but alive.',
      effects: [ { giveItem: 'moth_dust' } ], next: 'a2' },
    a2: { ...SELLA, text: 'We did it! I hit a moth with a LADLE. I am a legend. Say it.', choices: [
      { text: 'You were brave. Truly.', tone: 'kind',
        effects: [ ...heartUp(), { emote: ['sella', 'heart'] } ], next: 'ak' },
      { text: 'You swing like Hobb counts.', tone: 'sly',
        effects: [ ...heartUp('Sella laughed too loud. Good sign.'), { emote: ['sella', 'happy'] } ],
        next: 'as' },
      { text: 'Next time, stay behind me.', tone: 'bold',
        effects: [ ...heartDown('Sella bristles. Proud, remember?'), { emote: ['sella', 'angry'] } ],
        next: 'ab' },
    ] },
    ak: { ...SELLA, text: 'Truly? ...Okay. Stop. My ears are going pink.', next: 'a3' },
    as: { ...SELLA, text: 'Nervously and a lot? Rude. Accurate. Ha!', next: 'a3' },
    ab: { ...SELLA, text: 'Behind? I was IN FRONT. Of you. Check the dust.', next: 'a3' },
    a3: { ...SELLA, text: 'Look. The dust smells of wagon grease. These moths rode in on the Warden wagons.',
      next: 'a4' },
    a4: { ...SELLA, text: 'Their tracks go east. Through the meadow, up the river road. We follow.',
      branch: [ { if: flag('bobber_sold'), next: 'a5b' }, { next: 'a5' } ] },
    a5: { ...GIL, text: 'Moth-bashing bounty! Ten gold from the whole dock, eh fish?',
      effects: [ { gold: 10 }, { quest: ['tax', 3] }, { emote: ['gil', 'happy'] }, { autosave: true } ],
      next: 'a6' },
    a5b: { ...GIL, text: "Bounty. Ten gold. From the dock. Not from me. Eh, fish.",
      effects: [ { gold: 10 }, { quest: ['tax', 3] }, { emote: ['gil', 'angry'] }, { autosave: true } ],
      next: 'a6' },
    a6: { speaker: N, text: 'The river road waits past the meadow.',
      branch: [ { if: { all: [ flag('span_collapsed'), notFlag('span_rebuilt') ] }, next: 'a7' } ] },
    a7: { ...SELLA, text: "Only the Span's in the river. We need a boat. Or Hobb. Or wings.",
      effects: [ { quest: ['ferry', 0] } ] },
  },
};

// ---- Object: the moth nest
DIALOGUES.nest_entrance = {
  entries: [
    { if: flag('won_nest_boss'), node: 'done' },
    { if: flag('won_moths_dock'), node: 'start' },
    { node: 'early' },
  ],
  nodes: {
    early: { speaker: N, text: 'A grey dome of dead trees. Wings breathe inside. Your lantern tugs you home.',
      next: 'early2' },
    early2: { speaker: N, text: 'Not yet. Something is happening in Puddlewick first.' },
    start: { speaker: N, text: 'Dead trees knot into a grey dome. Inside, a thousand wings breathe.',
      effects: [ { quest: ['tax', 4] } ], next: 'n2' },
    n2: { speaker: N, text: 'Your lantern hums hard. Something huge unfolds. It has a wick for a heart.',
      choices: [
        { text: 'Lantern up. Go in.', tone: 'bold', next: 'go' },
        { text: 'Not yet. Stock up first.', next: 'wait' },
      ] },
    go: { ...SELLA, text: "Ladle ready. Lantern up. Don't lick it. Don't lick ANYTHING.",
      effects: [ { battle: 'nest_boss', after: 'nest_after' } ] },
    wait: { speaker: N, text: 'You back away slowly. The wings keep breathing.' },
    done: { speaker: N, text: 'Just dead trees and grey snow now. A sparrow is already moving in.' },
  },
};

DIALOGUES.nest_after = {
  entries: [ { node: 'a1' } ],
  nodes: {
    a1: { speaker: N, text: 'The Hollow Wick bursts into grey snow. The dead trees sigh with relief.',
      next: 'a2' },
    a2: { speaker: N, text: "At the nest's heart: a grey lantern, stuffed with stolen glims. A violet seal.",
      effects: [ { giveItem: 'moth_lantern' }, toast('Evidence! The Warden fed the moths.', 'quest') ],
      next: 'a3' },
    a3: { ...SELLA, text: "That's the Warden's seal. The WAGONS feed the moths. On purpose?!",
      choices: [
        { text: 'Are you okay?', tone: 'kind',
          effects: [ ...heartUp(), { emote: ['sella', 'heart'] } ], next: 'ak' },
        { text: 'We show everyone. Today.', tone: 'bold',
          effects: [ ...heartUp(), { emote: ['sella', 'happy'] } ], next: 'ab' },
        { text: "Maybe Corvin doesn't know.", tone: 'sly',
          effects: [ { emote: ['sella', 'dots'] }, toast('Sella frowns. Thinking.', 'star') ],
          next: 'as' },
      ] },
    ak: { ...SELLA, text: 'No. Yes. Ask me after I throw something. Thanks for asking.', next: 'a4' },
    ab: { ...SELLA, text: 'YES. Corvin first. Loudly. In front of everyone.', next: 'a4' },
    as: { ...SELLA, text: '...Maybe. People believe in the wrong folks all the time.', next: 'a4' },
    a4: { ...SELLA, text: "Back to Puddlewick. Corvin's still at the well, stamping things.",
      effects: [ { quest: ['tax', 5] }, { autosave: true } ],
      branch: [ { if: flag('wisp_friend'), next: 'a5' } ] },
    a5: { speaker: N, text: 'Your wisp sneezes out a puff of grey dust. Tink! It looks very proud.' },
  },
};

// ---- Object: ruined roadside shrine
DIALOGUES.shrine_old = {
  entries: [
    { if: { all: [ { quest: 'herbs', stage: 0 }, notFlag('got_moonmint') ] }, node: 'pick' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: 'A ruined roadside shrine. One lantern niche is still warm to the touch.',
      next: 's2' },
    s2: { speaker: N, text: 'Carved in the stone: WHAT IS PROMISED COMES HOME BY THE LIGHT.',
      branch: [ { if: flag('wisp_friend'), next: 's3' } ] },
    s3: { speaker: N, text: 'Your wisp hums the next note of the Keeping Song. Tink. Then it forgets.' },
    pick: { speaker: N, text: 'Moonmint grows in the cracks, silver-green. Nan Wren\'s tea herb!',
      effects: [ { setFlag: 'got_moonmint' }, { giveItem: 'moonmint' }, { quest: ['herbs', 1] } ],
      next: 's2' },
  },
};

// ---- Object: milestone
DIALOGUES.milestone = {
  entries: [
    { if: flag('read_milestone'), node: 'again' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: "A stone milestone: CAPITAL, 3 DAYS. Someone scratched: 'MORE LIKE 5.'",
      effects: [ { setFlag: 'read_milestone' } ], next: 's2' },
    s2: { speaker: N, text: "Lower down, moss-soft: 'TAMSY ROWED HERE.' She got around." },
    again: { speaker: N, text: 'East, the road climbs toward a sky that never quite gets dark.' },
  },
};

// ================================================= PROLOGUE VILLAGERS (ch1)

// ---- Old Fen
DIALOGUES.fen = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('lantern_hidden')), node: 'c1_hid' },
    { if: ch1(flag('ch1_done')), node: 'c1_paid' },
    { if: ch1(notFlag('fen_c1')), node: 'c1_start' },
    { if: IN_CH1, node: 'c1_idle' },
  ],
  nodes: {
    c1_start: { text: 'Young Tangerine! The Wardens took my wick. Surplus, they said.', next: 'c1_s2' },
    c1_s2: { text: "I'm ninety. ALL my light is surplus. Rude.",
      branch: [ { if: flag('told_truth'), next: 'c1_tt' }, { next: 'c1_kq' } ] },
    c1_tt: { text: 'First our bridge is cut, now our light is taxed. Hm. Not a coincidence.',
      next: 'c1_gift' },
    c1_kq: { text: 'A storm took the bridge, a tax takes the rest. Weather is busy lately.',
      next: 'c1_gift' },
    c1_gift: { text: 'Here. Five coins from my sock. The sock is also surplus.',
      effects: [ { setFlag: 'fen_c1' }, { gold: 5 } ] },
    c1_idle: { text: 'Never trust a man who stamps things, young Thimble. Or a moth. Or a stamp.' },
    c1_hid: { text: 'Hungry, young Tomato? Me too. But that violet light is still ours.' },
    c1_paid: { text: 'Grain is safe, young Trumpet. So why do I feel poorer?' },
  },
};

// ---- Marla
DIALOGUES.marla = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('lantern_hidden')), node: 'c1_hid' },
    { if: ch1(flag('ch1_done')), node: 'c1_paid' },
    { if: ch1(notFlag('marla_told')), node: 'c1_start' },
    { if: ch1(notFlag('got_violet')), node: 'c1_box' },
    { if: IN_CH1, node: 'c1_hub' },
  ],
  nodes: {
    c1_start: { text: 'Sprout! Come here. Quiet voice. Quieter. That Corvin has ears on his hat.',
      next: 'c1_s2' },
    c1_s2: { text: 'Your hooded fellow left something in his room. A lantern. Violet. It hums.',
      branch: [ { if: flag('stranger_fed'), next: 'c1_fed' }, { next: 'c1_ref' } ] },
    c1_fed: { text: "There was a note: 'For the plum cake. For the window.' Odd man.",
      next: 'c1_s3' },
    c1_ref: { text: "No note. Just one moth on the pillow. Didn't even tip. Rude.", next: 'c1_s3' },
    c1_s3: { text: "It's in the box behind the counter. Go look before Corvin does.",
      effects: [ { setFlag: 'marla_told' }, { quest: ['tax', 1] } ] },
    c1_box: { text: 'Behind the counter, sprout. The humming box. Go on.' },
    c1_hub: { text: 'Tax day, sprout. Even the soup looks worried.', choices: [
      { text: 'Plum cake. (5 gold)', if: { all: [ { gold: 5 }, notFlag('marla_kind') ] },
        effects: [ { gold: -5 }, { giveItem: 'plumcake' } ], next: 'c1_cake' },
      { text: 'Could I have a cake?', if: { all: [ flag('marla_kind'), { noItem: 'plumcake' } ] },
        effects: [ { giveItem: 'plumcake' } ], next: 'c1_free' },
      { text: 'How are you holding up?', tone: 'kind', next: 'c1_how' },
      { text: 'Bye, Marla.', next: null },
    ] },
    c1_cake: { text: "Five gold. The tax man tried to haggle. I said no, sprout. Twice." },
    c1_free: { text: 'Still free, sprout. The ledger says so. The ledger is law in here.' },
    c1_how: { text: 'They took my wick. Surplus.',
      branch: [ { if: flag('wicks_relit'), next: 'c1_tom' }, { next: 'c1_dim' } ] },
    c1_tom: { text: "But Tom's crooked laugh stayed. I checked twice. Some things aren't taxable." },
    c1_dim: { text: "Didn't matter much. It was already dark. Funny how that stings more." },
    c1_hid: { text: 'Fed forty mouths on one pot, sprout. The ledger is empty. My heart is not.',
      effects: [ { emote: ['marla', 'heart'] } ] },
    c1_paid: { text: "Grain's safe, sprout. The window's dark. I keep looking at it anyway." },
  },
};

// ---- Hobb
DIALOGUES.hobb = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('lantern_hidden')), node: 'c1_hid' },
    { if: ch1(flag('ch1_done')), node: 'c1_post' },
    { if: ch1(flag('span_collapsed'), notFlag('span_rebuilt')), node: 'c1_col' },
    { if: ch1(flag('span_rebuilt')), node: 'c1_new' },
    { if: IN_CH1, node: 'c1_proud' },
  ],
  nodes: {
    c1_col: { text: 'It fell. My bridge. One, two... all of it. Rotten planks. I knew.', choices: [
      { text: 'Rebuild it. (20 gold)', tone: 'kind', if: { gold: 20 }, next: 'c1_build' },
      { text: "It's not your fault, Hobb.", tone: 'kind',
        effects: [ { emote: ['hobb', 'heart'] }, toast('Hobb stops counting. For a second.', 'heart') ],
        next: 'c1_nf' },
      { text: 'Count louder. It helps.', tone: 'sly', next: 'c1_louder' },
      { text: 'Later.', next: null },
    ] },
    c1_nf: { text: "It sort of is. But thanks. Twenty gold buys good wood. I'd do it right." },
    c1_louder: { text: 'ONE! TWO! ...It does help. Why does it help?' },
    c1_build: { speaker: N, text: "Hobb works like a storm. Good wood this time. Tamsy's Span rises again.",
      effects: [ { gold: -20 }, { setFlag: 'span_rebuilt' }, { quest: ['ferry', -1] }, { sfx: 'jingle' },
        toast("Tamsy's Span is rebuilt!", 'quest'), { autosave: true } ],
      next: 'c1_b2' },
    c1_b2: { text: 'Good planks! I counted each one. Twice. It will hold. I promise.' },
    c1_new: { text: 'New Span! Solid as a grandma. One, two... I only cried a bit.' },
    c1_proud: { text: 'The flood hit the Span all night. It HELD! One, two... I held too!',
      branch: [ { if: flag('bridge_flimsy'), next: 'c1_tax' }, { next: 'c1_p2' } ] },
    c1_p2: { text: 'Good planks, Tavi. You did that. Now they tax my wick. Three, four, ugh.' },
    c1_tax: { text: 'They taxed my wick. I have one candle left. One. That is it. One.' },
    c1_hid: { text: 'No grain, but I carved forty bowls for the soup. One, two... forty!' },
    c1_post: { text: 'Wagons gone. I can count again. For fun, not nerves. One! Two!' },
  },
};

// ---- Gil
DIALOGUES.gil = {
  entries: [
    { if: ch1(flag('promised_gil2'), flag('won_nest_boss'), notFlag('gil2_done')), node: 'c1_tell' },
    { if: ch1(flag('pell_float_asked'), { noItem: 'glow_float' }, notFlag('pell_ally'), notFlag('gil_float'),
      flag('bobber_sold')), node: 'c1_nofloat' },
    { if: ch1(flag('pell_float_asked'), { noItem: 'glow_float' }, notFlag('pell_ally'), notFlag('gil_float')),
      node: 'c1_yfloat' },
    { if: ch1(flag('won_moths_dock'), flag('span_collapsed'), notFlag('ferried'), notFlag('span_rebuilt')),
      node: 'c1_ferry' },
    { if: ch1(flag('bobber_sold')), node: 'c1_sulk' },
    { if: IN_CH1, node: 'c1_idle' },
  ],
  nodes: {
    c1_idle: { text: 'Wardens taxed my wick-floats. FLOATS. Next they tax the fish, eh fish?' },
    c1_sulk: { text: 'Taxed. And robbed of a bobber, once. Some days are grey, eh fish?',
      effects: [ { emote: ['gil', 'dots'] } ] },

    c1_ferry: { text: 'Span went swimming, eh? Need a boat?',
      branch: [
        { if: flag('gil_done'), next: 'c1_free' },
        { if: flag('bobber_sold'), next: 'c1_bitter' },
        { next: 'c1_deal' },
      ] },
    c1_free: { text: 'Hop in. Tamsy rowed anyone, any hour, for free. So do I, eh fish?',
      effects: [ { setFlag: 'ferried' }, { quest: ['ferry', -1] }, { emote: ['gil', 'happy'] },
        toast('Gil will ferry you. Free!', 'star'), { autosave: true } ],
      next: 'c1_row' },
    c1_bitter: { text: 'After my bobber? Fifteen gold. Or swim. Fish are good at it, eh fish?',
      effects: [ { emote: ['gil', 'angry'] } ],
      choices: [
        { text: 'Pay 15 gold.', if: { gold: 15 }, next: 'c1_paid' },
        { text: "Sorry. I'll keep this promise.", tone: 'kind', next: 'c1_sorry' },
        { text: 'Later.', next: null },
      ] },
    c1_sorry: { text: "Sorry doesn't float. ...Fine. Tell me what's upriver. KEEP this one, eh fish.",
      effects: [ { setFlag: 'promised_gil2' }, { setFlag: 'ferried' }, { quest: ['ferry', 1] },
        { emote: ['gil', 'dots'] }, toast('Promise made. Gil will ferry you.', 'star'), { autosave: true } ],
      next: 'c1_row' },
    c1_deal: { text: 'Fifteen gold. Or a promise. I like promises. Fish do too.', choices: [
      { text: 'Pay 15 gold.', if: { gold: 15 }, next: 'c1_paid' },
      { text: "I'll tell you what's upriver.", tone: 'kind',
        effects: [ { setFlag: 'promised_gil2' }, { setFlag: 'ferried' }, { quest: ['ferry', 1] },
          toast('Promise made. Gil will ferry you.', 'star'), { autosave: true } ],
        next: 'c1_row' },
      { text: 'Later.', next: null },
    ] },
    c1_paid: { text: 'Coin in the bucket. Boat at the bank. Eh, fish.',
      effects: [ { gold: -15 }, { setFlag: 'ferried' }, { quest: ['ferry', -1] },
        toast('Gil will ferry you across.', 'gold'), { autosave: true } ],
      next: 'c1_row' },
    c1_row: { speaker: N, text: "Gil's boat waits by the fallen Span. He rows off-key, and sings worse." },

    c1_yfloat: { text: 'A glow float for a sister? Take one. Floats are for keeping, eh fish?',
      effects: [ { setFlag: 'gil_float' }, { giveItem: 'glow_float' }, { emote: ['gil', 'happy'] } ] },
    c1_nofloat: { text: "Floats? For you? Ask your friend Coral. She sells MY things, eh fish.",
      effects: [ { setFlag: 'gil_float' } ] },

    c1_tell: { text: "Well? What's upriver? You promised, eh fish?", next: 'c1_t2' },
    c1_t2: { speaker: N, text: 'You tell him: the camp, the ford, the nest, the grey moth-lantern.',
      next: 'c1_t3' },
    c1_t3: { speaker: N, text: "A tiny glim floats up from Gil's hands. Another promise, kept.",
      effects: [ { setFlag: 'gil2_done' }, { quest: ['ferry', -1] }, { emote: ['gil', 'happy'] },
        toast('A promise kept. A glim is born.', 'star') ],
      next: 'c1_t4' },
    c1_t4: { text: 'Moths on purpose. Hmph. I knew those wagons smelled fishy, eh fish?' },
  },
};

// ---- Coral (shop)
DIALOGUES.coral = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('lantern_hidden')), node: 'c1_hid' },
    { if: ch1(notFlag('coral_c1'), flag('stall_fixed')), node: 'c1_ref' },
    { if: ch1(notFlag('coral_c1')), node: 'c1_cert' },
    { if: IN_CH1, node: 'c1_hub' },
  ],
  nodes: {
    c1_ref: { text: 'Wardens tried to buy lunch. I said CLOSED. For them. Forever. Priceless.',
      effects: [ { setFlag: 'coral_c1' }, { emote: ['coral', 'happy'] } ], next: 'c1_hub' },
    c1_cert: { text: "Wardens bought my lunch stock. Paid in 'certificates'. CERTIFICATES.",
      effects: [ { setFlag: 'coral_c1' }, { emote: ['coral', 'angry'] } ], next: 'c1_hub' },
    c1_hub: { text: 'Buying? Prices went up. Taxes. Do not look at me like that.', choices: [
      { text: 'Herb (5 gold)', if: { all: [ { gold: 5 }, notFlag('stall_fixed') ] },
        effects: [ { gold: -5 }, { giveItem: 'herb' } ], next: 'c1_ty' },
      { text: 'Herb (4 gold)', if: { all: [ { gold: 4 }, flag('stall_fixed') ] },
        effects: [ { gold: -4 }, { giveItem: 'herb' } ], next: 'c1_ty' },
      { text: 'Glimdrop (8 gold)', if: { all: [ { gold: 8 }, notFlag('stall_fixed') ] },
        effects: [ { gold: -8 }, { giveItem: 'glimdrop' } ], next: 'c1_ty' },
      { text: 'Glimdrop (6 gold)', if: { all: [ { gold: 6 }, flag('stall_fixed') ] },
        effects: [ { gold: -6 }, { giveItem: 'glimdrop' } ], next: 'c1_ty' },
      { text: 'Glow float (5 gold)',
        if: { all: [ { gold: 5 }, flag('pell_float_asked'), notFlag('pell_ally'), { noItem: 'glow_float' } ] },
        effects: [ { gold: -5 }, { giveItem: 'glow_float' } ], next: 'c1_float' },
      { text: 'Just browsing.', next: 'c1_browse' },
    ] },
    c1_ty: { text: 'Pleasure! The receipt costs extra. Kidding. Mostly.' },
    c1_float: { text: 'A float for a Warden boy? I charge Wardens double. You, normal. Shh.' },
    c1_browse: { text: 'Browsing is still free. The Wardens tried to tax it. I hid.' },
    c1_hid: { text: 'Grain is short, so I gave soup bowls away. FREE. Tell no one. Ever.' },
  },
};

// ---- Sella (romance)
DIALOGUES.sella = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('held_hands')), node: 'c1_ph' },
    { if: ch1(flag('ch1_done'), flag('lantern_hidden')), node: 'c1_phid' },
    { if: ch1(flag('ch1_done')), node: 'c1_ppaid' },
    { if: ch1(flag('dock_alarm'), notFlag('won_moths_dock')), node: 'c1_dock' },
    { if: ch1(flag('won_nest_boss'), notFlag('sella_crate')), node: 'c1_crate' },
    { if: ch1(flag('won_nest_boss')), node: 'c1_ready' },
    { if: ch1(flag('won_moths_dock'), notFlag('sella_road')), node: 'c1_road' },
    { if: ch1(flag('won_moths_dock'), flag('ford_open')), node: 'c1_i2' },
    { if: ch1(flag('won_moths_dock')), node: 'c1_i1' },
    { if: ch1({ var: 'aff_sella', gte: 4 }), node: 'c1_t4' },
    { if: ch1({ var: 'aff_sella', gte: 3 }), node: 'c1_t3' },
    { if: ch1({ var: 'aff_sella', gte: 2 }), node: 'c1_t2' },
    { if: ch1({ var: 'aff_sella', gte: 1 }), node: 'c1_t1' },
    { if: IN_CH1, node: 'c1_t0' },
  ],
  nodes: {
    // Tiered greetings (before the moths)
    c1_t0: { text: "Oh. It's you. They taxed my best wick. Mind the glass, please.", next: 'c1_tb' },
    c1_t1: { text: 'Morning, Tavi. I am glaring at the wagons. Want to join? It helps.', next: 'c1_tb' },
    c1_t2: { text: "Tavi! Hold this. Don't lick it. It's my last good wick. Hide it.", next: 'c1_tb' },
    c1_t3: { text: 'I saved you the good stool. Also I hid a wick in my boot. Shh.', next: 'c1_tb' },
    c1_t4: { text: 'You came. Good. I was worried. About the tax. Only the tax. Hi.', next: 'c1_tb' },
    c1_tb: { text: 'Surplus light. As if light could be extra. Light is the whole point.' },

    // Dock battle
    c1_dock: { text: 'Tavi! Moths! Grey ones, big as gulls, eating the wick-floats!', next: 'c1_d2' },
    c1_d2: { text: "My ladle, your lantern. Hold the light high. Don't lick it.", choices: [
      { text: "Together. Let's go.", tone: 'kind', next: 'c1_dk' },
      { text: 'Stay behind me.', tone: 'bold', effects: [ { emote: ['sella', 'angry'] } ], next: 'c1_db' },
      { text: 'Is the ladle load-bearing?', tone: 'sly', effects: [ { emote: ['sella', 'happy'] } ],
        next: 'c1_ds' },
    ] },
    c1_dk: { text: 'Together. Obviously. Lantern up!',
      effects: [ { join: 'sella' }, { battle: 'moths_dock', after: 'dock_after' } ] },
    c1_db: { text: "Behind YOU? I'm the one with the ladle. Move!",
      effects: [ { join: 'sella' }, { battle: 'moths_dock', after: 'dock_after' } ] },
    c1_ds: { text: 'It is PERSONAL. Now GO!',
      effects: [ { join: 'sella' }, { battle: 'moths_dock', after: 'dock_after' } ] },

    // River road (romance beat)
    c1_road: { speaker: N, text: 'Sella waits by the road, lantern on her knee, eyeing the far tents.',
      next: 'c1_r2' },
    c1_r2: { text: "I've never been this far from Puddlewick. It's very... outside.", next: 'c1_r3' },
    c1_r3: { text: 'Lighting the meadow was my dream. This road is bigger than a dream.', choices: [
      { text: "I'm glad you came.", tone: 'kind',
        effects: [ ...heartUp(), { emote: ['sella', 'heart'] } ], next: 'c1_rk' },
      { text: 'Scared of the big outside?', tone: 'sly',
        effects: [ ...heartUp('Sella threw a pebble at you. Fondly.'), { emote: ['sella', 'happy'] } ],
        next: 'c1_rs' },
      { text: 'Go home if it is too much.', tone: 'bold',
        effects: [ ...heartDown('Sella stiffens. Too blunt.'), { emote: ['sella', 'angry'] } ],
        next: 'c1_rb' },
    ] },
    c1_rk: { text: "Me too. Don't make it weird. It's weird now. Walk.", next: 'c1_r4' },
    c1_rs: { text: 'Terrified. Of your jokes. Walk, comedian.', next: 'c1_r4' },
    c1_rb: { text: 'And leave you all the glory? Absolutely not.', next: 'c1_r4' },
    c1_r4: { text: "Tents ahead. A ford with guards. Let's be clever. Or loud.",
      effects: [ { setFlag: 'sella_road' } ] },
    c1_i1: { text: 'Camp, ford, nest. In that order. I made a list. It lives in my head.' },
    c1_i2: { text: "Ford's open. Nest's past it. Lantern up, hero." },

    // Before the finale
    c1_crate: { text: "Corvin's at the well. He'll want the violet lantern.", next: 'c1_c2' },
    c1_c2: { text: 'If it comes to it... my FAILURES crate. Nobody opens it. Not even me.',
      effects: [ { setFlag: 'sella_crate' } ], next: 'c1_c3' },
    c1_c3: { text: "Or we pay, and Puddlewick eats. I don't know, Tavi. Your call." },
    c1_ready: { text: "I'm right here. Probably. Definitely. Go talk to him." },

    // After
    c1_ph: { text: 'About the hand thing. It was windy. It WAS. ...It was nice. Shh.',
      effects: [ { emote: ['sella', 'heart'] } ] },
    c1_phid: { text: 'My FAILURES crate is now the most important crate in town. Ha!' },
    c1_ppaid: { text: 'The violet light went east. I keep looking that way. Silly.' },
  },
};

// ---- Bram
DIALOGUES.bram = {
  entries: [
    { if: ch1(flag('ch1_done')), node: 'c1_post' },
    { if: ch1(flag('told_truth'), notFlag('bram_note_given')), node: 'c1_note' },
    { if: ch1(flag('span_collapsed'), notFlag('span_rebuilt')), node: 'c1_gap' },
    { if: ch1(flag('told_truth')), node: 'c1_tt' },
    { if: IN_CH1, node: 'c1_quiet' },
  ],
  nodes: {
    c1_note: { text: '*salutes* Tavi! I told Corvin about the sabotage. He wrote "noted".',
      next: 'c1_n2' },
    c1_n2: { text: 'Take this. A letter. I vouch for you. I failed Warden school. They know me.',
      effects: [ { setFlag: 'bram_note_given' }, { giveItem: 'bram_note' } ], next: 'c1_n3' },
    c1_n3: { text: 'I failed for saluting too much. Is that possible? *salutes*' },
    c1_gap: { text: '*salutes* I guarded the bridge. The bridge left. I now guard the gap.' },
    c1_tt: { text: '*salutes* Sabotage, then taxes. I smell a plot. It smells like ink.' },
    c1_quiet: { text: '*salutes* I have arrested the tax. It had papers. I let it go. *salutes*' },
    c1_post: { text: '*salutes* The wagons are gone. I saluted them out. Sarcastically. *salutes*' },
  },
};

// ---- Nettie
DIALOGUES.nettie = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('held_hands')), node: 'c1_hands' },
    { if: ch1(flag('ch1_done'), flag('corvin_beaten')), node: 'c1_beat' },
    { if: ch1(flag('ch1_done')), node: 'c1_post' },
    { if: ch1(flag('won_moths_dock'), notFlag('nettie_moth')), node: 'c1_moth' },
    { if: IN_CH1, node: 'c1_start' },
  ],
  nodes: {
    c1_start: { text: 'Corvin grew up with the Warden. Best friends! You did not hear it from me.',
      branch: [ { if: flag('shared_walk'), next: 'c1_walk' }, { next: 'c1_s2' } ] },
    c1_walk: { text: 'Also: you and Sella, one lantern. The WHOLE hill knows. Not from me.',
      effects: [ { emote: ['nettie', 'heart'] } ] },
    c1_s2: { text: 'They took my wick. I told them it was a gossip wick. They took it anyway.' },
    c1_moth: { text: 'The MOTH MAN! I SAID so! Buys lanterns, leaves moths. The rumor was TRUE!',
      effects: [ { setFlag: 'nettie_moth' }, { emote: ['nettie', 'surprise'] } ], next: 'c1_m2' },
    c1_m2: { text: 'Moths follow those wagons like gulls follow Gil. You did NOT hear it from me.' },
    c1_hands: { text: 'Hand. In. Hand. At the WELL. You did not hear it from me.',
      effects: [ { emote: ['nettie', 'heart'] } ] },
    c1_beat: { text: 'You beat a tax man with a lantern! Our Tavi! Not from me. From EVERYONE.' },
    c1_post: { text: 'The wagons are gone. The gossip stays forever. Not from me.' },
  },
};

// ---- Nan Wren (side quest: moonmint)
DIALOGUES.wren = {
  entries: [
    { if: ch1({ item: 'moonmint' }, { quest: 'herbs', done: false }), node: 'c1_give' },
    { if: ch1(flag('wren_tea')), node: 'c1_post' },
    { if: ch1({ quest: 'herbs', done: false }), node: 'c1_wait' },
    { if: IN_CH1, node: 'c1_start' },
  ],
  nodes: {
    c1_start: { text: 'They took my wick, dear heart.',
      branch: [ { if: flag('singer_healed'), next: 'c1_full' }, { next: 'c1_half' } ] },
    c1_full: { text: "But I kept the song. And Pim's name. Let them tax THAT. Ha!", next: 'c1_ask' },
    c1_half: { text: 'Half a song left. I hum the half very loudly now.', next: 'c1_ask' },
    c1_ask: { text: "Pim's scared of the moths. Can't sleep. Moonmint tea would help.", choices: [
      { text: "I'll find you moonmint.", tone: 'kind',
        effects: [ { quest: ['herbs', 0] }, { emote: ['wren', 'heart'] } ], next: 'c1_where' },
      { text: 'Later, Nan.', next: null },
    ] },
    c1_where: { text: 'It grows by the old road shrine, east. Silver leaves. Mind the moths.' },
    c1_wait: { text: 'Moonmint, dear heart. The old shrine on the river road. Silver leaves.' },
    c1_give: { text: 'Moonmint! Oh, it smells like my mother humming. Thank you, dear heart.',
      effects: [ { takeItem: 'moonmint' }, { setFlag: 'wren_tea' }, { quest: ['herbs', -1] },
        { giveItem: 'glimdrop', n: 2 }, { emote: ['wren', 'music'] } ],
      next: 'c1_g2' },
    c1_g2: { text: '♪ Hush now, little wick, the tide will keep you... ♪ There. Pim will sleep.' },
    c1_post: { text: 'Pim sleeps like a stone now. Like Steve, dear heart.' },
  },
};

// ---- Pim
DIALOGUES.pim = {
  entries: [
    { if: ch1(flag('ch1_done'), flag('corvin_beaten')), node: 'c1_beat' },
    { if: ch1(flag('ch1_done')), node: 'c1_post' },
    { if: ch1(flag('won_moths_dock')), node: 'c1_moth' },
    { if: ch1(flag('child_escort')), node: 'c1_spy' },
    { if: IN_CH1, node: 'c1_start' },
  ],
  nodes: {
    c1_start: { text: "The moths are big. I'm not scared. Steve is. A little. BOOM?" },
    c1_spy: { text: 'Tax man took Gran\'s wick. I gave him a rock. It\'s Steve. Steve is a SPY.',
      effects: [ { emote: ['pim', 'happy'] } ] },
    c1_moth: { text: 'You fought MOTHS? With a LANTERN? BOOM! I fought one with Steve. I lost.' },
    c1_beat: { text: 'You bonked the tax man! BOOM! Steve saw everything. Steve is proud.' },
    c1_post: { text: 'The wagons left. I named one Steve. Bye, Steve! BOOM.' },
  },
};

// ---------------------------------------------------------------- EXAMINE
const EXAMINE = {
  camp_tent: [
    'A Wickwarden tent. Blue canvas, perfect corners, zero joy.',
    'A sign on the flap: QUIET HOURS: ALWAYS.',
  ],
  camp_fire: [
    'A cook fire with no color in it. Grey flames. Warm, somehow. Barely.',
    'The pot glugs. Something in it looks back at you.',
  ],
  camp_rack: [
    'A rack of Wickwarden spears, polished and labeled. One is upside down. Pell.',
    'A tag reads: SPEARS ARE NOT FOR MOTHS. MOTHS ARE PROTECTED.',
  ],
  camp_wagon: [
    'A supply wagon, locked three times. It hums. Wagons should not hum.',
    'Grey moth wings are stuck in the door crack. Lots of them.',
  ],
  fallen_log: [
    'A fallen log, soft with moss. A beetle is running a very small inn inside.',
    'Someone carved a tiny lantern into the bark. It looks proud of itself.',
  ],
  inn_counter: [
    "Marla's counter. The soup ledger sits open. Most tabs say FORGIVEN.",
    "A sticky note: 'CORVIN: NO HAGGLING. NO STAMPING THE CAKES.'",
  ],
  inn_fire: [
    'The inn stove. Marla keeps it lit even when she cannot afford to.',
    'A pot of soup sits close to the heat, like a sleepy cat.',
  ],
  inn_table: [
    'A long table with forty spoon-shaped dents. Promise feasts were loud here.',
    "Carved in the wood: 'TOM WAS HERE. MARLA TOO. MARLA MORE.'",
  ],
  workshop_bench: [
    "Sella's bench. Tweezers, wicks, and one bite of very burnt toast.",
    'A list: 1. Light the meadow. 2. Stop burning toast. 3. (scribbled out)',
  ],
  workshop_kiln: [
    "Sella's glass kiln, hot as a dragon's opinion. Do not lick it.",
    'A tray of cooling lanterns. One leans like a tired duck. Family resemblance.',
  ],
  workshop_shelf: [
    'Lanterns in rows, each with a name tag. One says FOR THE MEADOW. SOMEDAY.',
    'Behind them, a crate: FAILURES. DO NOT OPEN. Very, very tempting.',
  ],
  wren_bed: [
    "Nan Wren's bed, heaped with quilts. Each quilt has a lullaby stitched in it.",
    'A small pillow on the end. Pim-sized. Steve-sized too.',
  ],
  wren_hearth: [
    "Nan Wren's hearth. A kettle waits for tea. The cat waits for the kettle.",
    'A drawing of a rock is pinned above it. Labeled STEVE.',
  ],
  hobb_table: [
    "Hobb's table. Every nail is sorted by size. Then by mood.",
    'A tally on the wall: DAYS WITHOUT PANIC: 0. The zero is chalked in fresh.',
  ],
  gil_table: [
    "Gil's table. A fish skeleton sits in the chair of honor.",
    'A note: TALK TO FISH MORE. LISTEN TO NETTIE LESS.',
  ],
  nettie_couch: [
    "Nettie's couch, perfectly placed to see every window on the street.",
    'Under a cushion: a notebook titled THINGS I DID NOT SAY. It is very thick.',
  ],
  tax_crate: [
    'A crate of taxed wicks, each labeled SURPLUS in very neat letters.',
    "One label says NETTIE'S (GOSSIP). Someone crossed it out: SURPLUS.",
  ],
  dead_tree: [
    'A tree gone grey from root to tip. Moth wings rustle in its branches.',
    'Your lantern flickers near it, like it wants to warm the bark.',
  ],
};

// ---------------------------------------------------------------- ENDING
const ENDING = {
  base: [
    'The wagons roll east. The Lantern Tax is paid, one way or another.',
  ],
  variants: [
    { if: flag('lantern_hidden'), line: "A violet light sleeps in Sella's FAILURES crate. Puddlewick goes hungry, together." },
    { if: { all: [ flag('lantern_hidden'), flag('marla_kind') ] }, line: "Marla's soup feeds forty. The ledger is empty. Nobody minds." },
    { if: flag('lantern_paid'), line: 'Puddlewick eats well. Far to the east, a violet lantern feeds something hungry.' },
    { if: flag('corvin_beaten'), line: 'Corvin nurses his pride on the road. He will not forget your face.' },
    { if: flag('corvin_doubts'), line: 'Corvin reads his ledger by candlelight. For once, it does not add up.' },
    { if: flag('held_hands'), line: 'Sella keeps flexing her hand. She blames the wind.' },
    { if: flag('span_rebuilt'), line: "Tamsy's Span stands again, built of good planks this time." },
    { if: { all: [ flag('span_collapsed'), notFlag('span_rebuilt') ] }, line: "Tamsy's Span lies in the river. Gil's boat does the crossing now." },
    { if: notFlag('span_collapsed'), line: "Tamsy's Span held against the flood. Hobb still brags about it." },
    { if: flag('pell_ally'), line: 'A young Wickwarden washes cups at the Sleepy Gull. His sister got her float.' },
  ],
  tease: 'Chapter 2: The Wisp Hollows. Something is singing under the meadow.',
};

export const CH1 = { INTRO, NPCS, DIALOGUES, QUESTS, EXAMINE, ENDING, ITEMS };
