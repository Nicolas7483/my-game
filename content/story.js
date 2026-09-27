// Lanternfall: Prologue "The Broken Bridge"
// All story content as plain data (see docs/content-spec.md).
// Helpers below only build plain objects; exports are pure data.

const toast = (text, icon = 'star') => ({ toast: text, icon });
const heartUp = (who = 'Sella') => [
  { addVar: ['aff_sella', 1] },
  toast(`${who} will remember that.`, 'heart'),
];
const heartDown = (text = 'Sella will remember that.') => [
  { addVar: ['aff_sella', -1] },
  toast(text, 'heartbreak'),
];
const N = ''; // narration speaker

// ---------------------------------------------------------------- INTRO
export const INTRO = [
  'Puddlewick, at dusk. Gulls settle on every roof, and the bay turns gold.',
  'You are Tavi. The river gave you to this village, with a lantern that never goes out.',
  'Tonight, up the hill, another wick went out.',
  'And someone forgot a name they loved.',
];

// ---------------------------------------------------------------- NPCS
export const NPCS = [
  { id: 'fen', name: 'Old Fen', sprite: 'OldMan', face: 'oldman', dialogue: 'fen',
    spawns: [ { map: 'town', spot: 'plaza', dx: -2, dy: 1, wander: 1 } ] },
  { id: 'marla', name: 'Marla', sprite: 'Villager2', face: 'villager2', dialogue: 'marla',
    spawns: [ { map: 'town', spot: 'inn_door', dx: 1, dy: 1, wander: 1 } ] },
  { id: 'stranger', name: 'Hooded Stranger', sprite: 'Inspector', face: 'inspector', dialogue: 'stranger',
    spawns: [ { if: { notFlag: 'bridge_fixed' }, map: 'town', spot: 'inn_porch' } ] },
  { id: 'hobb', name: 'Hobb', sprite: 'Villager3', face: 'villager3', dialogue: 'hobb',
    spawns: [ { map: 'town', spot: 'yard', wander: 2 } ] },
  { id: 'gil', name: 'Gil', sprite: 'OldMan2', face: 'oldman2', dialogue: 'gil',
    spawns: [ { map: 'town', spot: 'dock' } ] },
  { id: 'coral', name: 'Coral', sprite: 'Villager5', face: 'villager5', dialogue: 'coral',
    spawns: [ { map: 'town', spot: 'stall' } ] },
  { id: 'sella', name: 'Sella', sprite: 'Woman', face: 'woman', dialogue: 'sella',
    spawns: [
      { if: { flag: 'inspector_here' }, map: 'town', spot: 'wren_porch', dx: 2 },
      { if: { all: [ { flag: 'sella_ready' }, { notFlag: 'stall_fixed' } ] }, map: 'town', spot: 'stall', dx: 2 },
      { map: 'town', spot: 'workshop', wander: 1 },
    ] },
  { id: 'bram', name: 'Bram', sprite: 'Knight', face: 'knight', dialogue: 'bram',
    spawns: [ { map: 'town', spot: 'bridge_south', dx: 1 } ] },
  { id: 'nettie', name: 'Nettie', sprite: 'Villager4', face: 'villager4', dialogue: 'nettie',
    spawns: [ { map: 'town', spot: 'garden', dx: 2, wander: 2 } ] },
  { id: 'wren', name: 'Nan Wren', sprite: 'OldWoman', face: 'oldwoman', dialogue: 'wren',
    spawns: [ { map: 'town', spot: 'wren_porch' } ] },
  { id: 'pim', name: 'Pim', sprite: 'Child', face: 'child', dialogue: 'pim',
    spawns: [
      { if: { flag: 'child_escort' }, map: 'town', spot: 'wren_porch', dx: -1, wander: 1 },
      { if: { time: 'night' }, map: 'meadow', spot: 'old_oak', dy: 1 },
      { map: 'town', spot: 'garden', dx: -2, wander: 2 },
    ] },
  { id: 'wisp', name: 'Wisp', sprite: 'Spirit', face: 'spirit', dialogue: 'wisp',
    spawns: [ { if: { all: [ { notFlag: 'wisp_bottled' }, { notFlag: 'wisp_friend' } ] },
      map: 'meadow', spot: 'clearing', wander: 1 } ] },
  { id: 'umbra', name: 'Lantern Inspector', sprite: 'Inspector', face: 'inspector', dialogue: 'umbra',
    spawns: [ { if: { all: [ { flag: 'inspector_here' }, { notFlag: 'prologue_done' } ] }, map: 'town', spot: 'plaza', dx: 1 } ] },
];

// ---------------------------------------------------------------- QUESTS
export const QUESTS = {
  span: { title: "Tamsy's Span", stages: [
    'Ask Hobb in the yard about the bridge.',
    'Find 3 Good Planks for Hobb.',
    'Cross the bridge. Look at the break.',
  ] },
  bobber: { title: "Gil's Lucky Bobber", stages: [
    "Find Gil's bobber in the meadow reeds.",
    'Bring the bobber back to Gil.',
  ] },
  stall: { title: 'Moths at the Stall', stages: [
    "Ask Sella about Coral's moth lantern.",
    "Sella waits at the stall. Talk to Coral.",
  ] },
  starlight: { title: 'A Jar of Starlight', stages: [
    'Find starlight in Tamblemeadow.',
    'Bring the light to Nan Wren.',
    'Someone waits in the plaza.',
  ] },
  pim: { title: 'Home by Dusk', stages: [
    "Walk Pim home to Nan Wren's porch.",
  ] },
};

// ---------------------------------------------------------------- DIALOGUES
export const DIALOGUES = {};

// ---- Old Fen, elder. Tic: calls Tavi a new wrong name every time.
DIALOGUES.fen = {
  entries: [
    { if: { notFlag: 'met_fen' }, node: 'intro' },
    { if: { flag: 'singer_healed' }, node: 'healed' },
    { if: { flag: 'singer_half' }, node: 'half' },
    { if: { flag: 'bridge_flimsy' }, node: 'flimsy' },
    { if: { flag: 'bridge_fixed' }, node: 'fixed' },
    { node: 'remind' },
  ],
  nodes: {
    intro: { text: 'Ah, young Tulip! No. Tavi. I knew that. I was testing you.', next: 'i2' },
    i2: { text: "Another wick went dark tonight. Nan Wren's. Our lullaby singer.", next: 'i3' },
    i3: { text: 'Each dark wick steals a memory. She is forgetting her own song.', next: 'i4' },
    i4: { text: "Only meadow starlight can mend her. But the bridge is broken.", choices: [
      { text: "I'll fix the bridge.", tone: 'bold', next: 'gift' },
      { text: 'Poor Nan Wren...', tone: 'kind', next: 'kind' },
      { text: 'Who breaks a bridge?', tone: 'sly', next: 'sly' },
    ] },
    kind: { text: 'She sang you to sleep when you were a basket baby. Loudly.', next: 'gift' },
    sly: { text: "A storm, they say. Storms don't usually use saws. Hm.", next: 'gift' },
    gift: { text: 'Hobb, in the yard, can mend it. Take these coins, young Turnip.',
      effects: [ { setFlag: 'met_fen' }, { gold: 10 }, { quest: ['span', 0] },
        toast('Got 10 gold.', 'gold') ] },

    remind: { text: 'Planks, young Taffy. Hobb, the yard. I remember everything. Except names.',
      next: 'r2' },
    r2: { text: 'In my day, lanterns sang. Now they hum. Lazy lanterns.' },

    fixed: { text: 'The Span stands! Off to the meadow, young Toad. Starlight awaits.', next: 'f2' },
    f2: { text: 'A jar holds light tight. A friend only lends it. Choose kindly.' },

    flimsy: { text: 'Rotten planks, young Tinker? Tamsy herself is tutting in her grave.',
      next: 'f2' },

    healed: { text: 'The song is back! Every wick on the hill, young Tadpole. Every one!',
      next: 'h2' },
    h2: { text: "There's a polite man by the well. Too polite. I don't like him." },
    half: { text: 'Half a song is still a song, young Teacup. Well done.', next: 'h2' },
  },
};

// ---- Marla, innkeeper. Tic: calls everyone "sprout".
DIALOGUES.marla = {
  entries: [
    { if: { flag: 'wicks_relit' }, node: 'relit' },
    { if: { flag: 'singer_half' }, node: 'half' },
    { if: { flag: 'stranger_fed' }, node: 'fed' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: 'Sit down, sprout. You look like a wet noodle.', next: 'hub' },
    hub: { text: 'What can I do you for? Soup, cake, or a good scolding?', choices: [
      { text: 'Buy a plum cake. (5 gold)',
        if: { all: [ { gold: 5 }, { notFlag: 'marla_kind' }, { noItem: 'plumcake' } ] },
        effects: [ { gold: -5 }, { giveItem: 'plumcake' }, toast('Got a Plum Cake.', 'item') ],
        next: 'bought' },
      { text: 'Could I have a cake?',
        if: { all: [ { flag: 'marla_kind' }, { noItem: 'plumcake' }, { notFlag: 'stranger_fed' } ] },
        effects: [ { giveItem: 'plumcake' }, toast('Got a Plum Cake. Free!', 'item') ],
        next: 'free' },
      { text: 'How are you, Marla?', tone: 'kind', if: { notFlag: 'marla_kind' }, next: 'k1' },
      { text: 'Any gossip?', tone: 'sly', next: 'gossip' },
      { text: 'Bye, Marla.', next: null },
    ] },
    bought: { text: 'Plum cake. Nobody knows why we bake it at promise feasts. It just works.' },
    free: { text: "On the house, sprout. Kindness pays better than coin. Don't tell Coral." },
    gossip: { text: "Soup's free. Gossip costs extra. Ask Nettie, she's in debt." },
    k1: { text: 'Me? Nobody asks me that. Sit. No, really, sit.', next: 'k2' },
    k2: { text: "My wick went dark last week. Now I can't picture my Tom's face.", next: 'k3' },
    k3: { text: 'Silly. Ten years gone. Anyway! Your cake is free from now on, sprout.',
      effects: [ { setFlag: 'marla_kind' }, { emote: ['marla', 'heart'] },
        toast('Marla will remember that.', 'heart') ] },

    fed: { text: 'You fed that hooded fellow my cake? He left a tip. A moth. Just one.',
      next: 'hub' },
    half: { text: "Nan Wren's humming again. Half a song. Better than none, sprout." },
    relit: { text: "My wick's back, sprout! I can see Tom's laugh again. Crooked teeth and all.",
      next: 'r2' },
    r2: { text: 'Soup for you. Forever. I keep a ledger, and you are paid up.' },
  },
};

// ---- Hooded Stranger (Umbra in disguise)
DIALOGUES.stranger = {
  entries: [
    { if: { flag: 'stranger_fed' }, node: 'again_fed' },
    { if: { flag: 'stranger_refused' }, node: 'again_ref' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: 'A hooded traveler sits on the porch. A grey moth rests on his sleeve.',
      next: 's2' },
    s2: { speaker: N, text: 'Your lantern hums. Low and uneasy, like a held breath.', next: 's3' },
    s3: { text: 'Spare a bite, lantern child? The road here was long. And very grey.', choices: [
      { text: 'Here, have some plum cake.', tone: 'kind', if: { item: 'plumcake' },
        effects: [ { takeItem: 'plumcake' }, { setFlag: 'stranger_fed' },
          { emote: ['stranger', 'happy'] }, toast('The stranger will remember that.', 'moth') ],
        next: 'fed' },
      { text: "Sorry. I've got nothing.", tone: 'bold',
        effects: [ { setFlag: 'stranger_refused' }, { emote: ['stranger', 'dots'] },
          toast('The stranger will remember that.', 'moth') ],
        next: 'refused' },
      { text: "I'll find you something.", tone: 'kind', next: 'wait' },
    ] },
    fed: { text: 'Plum cake. The promise-feast cake. How very fitting.', next: 'fed2' },
    fed2: { text: 'A word, child. Every promise is a debt. And someone always collects.' },
    refused: { text: 'Of course. Everyone says later. Later is where the light goes to die.' },
    wait: { text: 'I will wait. I am very, very good at waiting.' },
    again_fed: { text: 'Still here. Still full. The moths and I thank you, lantern child.' },
    again_ref: { text: "No matter. Hunger is only a promise the belly didn't keep." },
  },
};

// ---- Hobb, carpenter. Tic: counts on his fingers mid-sentence.
DIALOGUES.hobb = {
  entries: [
    { if: { flag: 'bridge_flimsy' }, node: 'flimsy' },
    { if: { flag: 'bridge_fixed' }, node: 'fixed' },
    { if: { item: 'plank', n: 3 }, node: 'build' },
    { if: { flag: 'hobb_asked' }, node: 'waiting' },
    { if: { flag: 'met_fen' }, node: 'plan' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: "Oh! Tavi. One, two... hi. Sorry. I count when I'm nervous.", next: 's2' },
    s2: { text: "I'm always nervous. Three, four. Old Fen was looking for you." },

    plan: { text: 'The bridge? I can fix it! One, two... I need three Good Planks.', next: 'p2' },
    p2: { text: 'Gil has one. Coral sells one. The crates behind the inn, maybe? Three!',
      next: 'p3' },
    p3: { text: 'Or... I have rotten planks. Fast! But they creak. Five, six, oh no.', choices: [
      { text: "I'll find good planks.", tone: 'kind',
        effects: [ { setFlag: 'hobb_asked' }, { quest: ['span', 1] }, { emote: ['hobb', 'happy'] } ],
        next: 'p4' },
      { text: 'Use the rotten ones. Now.', tone: 'sly', next: 'rotten' },
      { text: 'Say the plan again?', next: 'p2' },
    ] },
    p4: { text: "Good! Good. I'll warm up my hammer. And my nerve. Mostly my nerve." },

    waiting: { text: 'Three Good Planks, Tavi. One, two, three. I practiced counting them.',
      choices: [
        { text: 'Still looking.', next: null },
        { text: 'Use the rotten planks.', tone: 'sly', next: 'rotten' },
      ] },
    rotten: { text: "Now?! One, two... okay. OKAY. Please don't tell Sella.",
      effects: [ { setFlag: 'hobb_asked' }, { emote: ['hobb', 'surprise'] } ], next: 'rotten2' },
    rotten2: { speaker: N, text: 'Hammers bang. Wood groans. The Span stands, dark and creaky.',
      effects: [ { setFlag: 'bridge_fixed' }, { setFlag: 'bridge_flimsy' },
        { quest: ['span', 2] }, toast('The bridge is up. It creaks.', 'moth'),
        { sfx: 'jingle' }, { autosave: true } ],
      next: 'rotten3' },
    rotten3: { text: "It'll hold. Probably. Walk softly. Seven, eight... don't jump." },

    build: { text: 'Three Good Planks! One, two, three! I counted twice. Four times.', choices: [
      { text: "You've got this, Hobb.", tone: 'kind', effects: [ { emote: ['hobb', 'heart'] } ],
        next: 'b2' },
      { text: 'Build it. I believe in you.', tone: 'bold', effects: [ { emote: ['hobb', 'surprise'] } ],
        next: 'b2' },
      { text: 'Race you? Kidding. Go.', tone: 'sly', effects: [ { emote: ['hobb', 'happy'] } ],
        next: 'b2' },
    ] },
    b2: { speaker: N, text: 'Hammers ring out over the river. Hobb only cries a little.',
      effects: [ { takeItem: 'plank', n: 3 }, { setFlag: 'bridge_fixed' }, { setFlag: 'hobb_asked' },
        { quest: ['span', 2] }, toast("Tamsy's Span is fixed!", 'quest'),
        { sfx: 'jingle' }, { autosave: true } ],
      next: 'b3' },
    b3: { text: "Sturdy as a grandma! Go on. The meadow's waiting. So is my nap." },

    fixed: { text: 'I built a bridge! Me! One, two... I need to lie down.', next: 'f2' },
    f2: { text: "Bram's saluting it. I think it's the best day of his life." },
    flimsy: { text: 'The bridge creaks. One, two... it creaks a lot. I hum over it.', next: 'fl2' },
    fl2: { text: "If anyone asks, it's a musical bridge. On purpose. Yes." },
  },
};

// ---- Gil, fisher. Tic: ends lines with "eh, fish?"
DIALOGUES.gil = {
  entries: [
    { if: { flag: 'bobber_sold' }, node: 'sulk' },
    { if: { all: [ { item: 'bobber' }, { flag: 'promised_gil' } ] }, node: 'kept' },
    { if: { item: 'bobber' }, node: 'surprise' },
    { if: { flag: 'gil_done' }, node: 'done' },
    { if: { flag: 'promised_gil' }, node: 'waiting' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: "River's been quiet. Too quiet. Eh, fish?", choices: [
      { text: 'Could I have a plank?', if: { flag: 'met_fen' }, next: 'plank' },
      { text: 'Are you talking to a fish?', tone: 'sly', next: 'fish' },
      { text: 'Bye, Gil.', next: null },
    ] },
    fish: { text: "Better listeners than Nettie. They don't repeat a thing, eh fish?" },
    plank: { text: "Got a Good Plank. I'll trade it for a promise, eh fish?", next: 'plank2' },
    plank2: { text: 'My lucky bobber fell off the bridge. It drifted to the meadow reeds.',
      choices: [
        { text: "I promise I'll find it.", tone: 'kind',
          effects: [ { setFlag: 'promised_gil' }, { giveItem: 'plank' }, { quest: ['bobber', 0] },
            toast('Promise made. Got a Good Plank.', 'item') ],
          next: 'deal' },
        { text: 'Just the plank, please?', tone: 'sly', next: 'nodeal' },
      ] },
    deal: { speaker: N, text: 'Gil sticks one hand in the water to seal it. The river remembers.' },
    nodeal: { text: 'No promise, no plank. Fish have rules. So do I, eh fish?' },
    waiting: { text: 'Bobber, meadow, reeds. You promised. The fish heard you, eh fish?' },
    kept: { text: 'My bobber! You kept your word, eh fish? Look, fish! LOOK!', next: 'kept2' },
    kept2: { speaker: N, text: "A tiny glim floats up from Gil's hands. A promise, kept.",
      effects: [ { takeItem: 'bobber' }, { setFlag: 'gil_done' }, { gold: 5 },
        { quest: ['bobber', -1] }, { emote: ['gil', 'happy'] },
        toast('A promise kept. A glim is born.', 'star') ],
      next: 'kept3' },
    kept3: { text: "Five gold and a sea shanty. The shanty's free. Unlike Coral's jokes." },
    surprise: { text: "That's my bobber! You found it without even promising? Eh, fish!",
      next: 'surp2' },
    surp2: { text: "Take my plank. And five gold. Don't argue, I'm old and damp.",
      effects: [ { takeItem: 'bobber' }, { setFlag: 'gil_done' }, { giveItem: 'plank' },
        { gold: 5 }, { emote: ['gil', 'happy'] }, toast('Got a Good Plank and 5 gold.', 'item') ] },
    done: { text: 'Bobber back, fish biting. Well. Nibbling. Eh, fish?' },
    sulk: { text: "Coral's selling a lucky bobber. MY bobber. Don't talk to me, eh fish?",
      effects: [ { emote: ['gil', 'angry'] } ] },
  },
};

// ---- Coral, merchant. Tic: prices everything, even compliments.
DIALOGUES.coral = {
  entries: [
    { if: { all: [ { flag: 'sella_ready' }, { notFlag: 'stall_fixed' }, { flag: 'coral_plank' } ] },
      node: 'fix_refund' },
    { if: { all: [ { flag: 'sella_ready' }, { notFlag: 'stall_fixed' } ] }, node: 'fix' },
    { if: { flag: 'stall_fixed' }, node: 'glow' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: 'Welcome, welcome! Browsing is free. Smiling is two coins.', next: 'hub' },
    glow: { text: 'Stall glowing, moths gone! Smiling is now one coin. For you.', next: 'hub' },
    hub: { text: 'What catches your eye? Besides my dazzling personality.', choices: [
      { text: 'A Good Plank, please.',
        if: { all: [ { notFlag: 'coral_plank' }, { notFlag: 'stall_fixed' } ] }, next: 'p1' },
      { text: 'Sell a lucky bobber?', tone: 'sly', if: { item: 'bobber' }, next: 'sell' },
      { text: 'Just browsing.', next: 'browse' },
    ] },
    browse: { text: 'Browsing is free! Leaving is also free. Today only.' },
    p1: { text: 'Ten gold. Or fix my stall lantern. Moths ate the light. Grey ones.',
      choices: [
        { text: 'Pay 10 gold.', if: { gold: 10 },
          effects: [ { gold: -10 }, { giveItem: 'plank' }, { setFlag: 'coral_plank' },
            toast('Got a Good Plank.', 'item') ],
          next: 'paid' },
        { text: "I'll fix your lantern.", tone: 'kind', if: { notFlag: 'stall_asked' },
          effects: [ { setFlag: 'stall_asked' }, { quest: ['stall', 0] } ], next: 'ask_sella' },
        { text: 'Grey moths?', next: 'moths' },
        { text: 'Maybe later.', next: null },
      ] },
    paid: { text: "Pleasure! Your smile was free. This once. Don't get used to it." },
    ask_sella: { text: "Ask Sella at the workshop! She's clever. Tell her I said so. Costs nothing." },
    moths: { text: 'A hooded fellow bought my best lantern. Next morning: moths. Rude!',
      next: 'p1' },
    sell: { text: "Ooh, shiny! Eight gold, no questions. Well, one. Isn't that Gil's?",
      choices: [
        { text: 'Sell it. 8 gold.', tone: 'sly',
          effects: [ { takeItem: 'bobber' }, { gold: 8 }, { setFlag: 'bobber_sold' },
            { quest: ['bobber', -1] }, toast('A promise broke. Somewhere, a wick dims.', 'moth') ],
          next: 'sold' },
        { text: 'Never mind.', next: null },
      ] },
    sold: { text: 'Pleasure doing business! I will price this at twenty. Shh.' },

    fix: { speaker: N, text: 'Sella lifts your lantern to the stall. The grey moths turn, all at once.',
      next: 'fix2' },
    fix2: { speaker: 'Sella', face: 'woman', text: 'Steady... steady... Now, Tavi! Walk them out to sea!',
      next: 'fix3' },
    fix3: { speaker: N, text: 'You lead the moths down the pier. They scatter into the dusk like ash.',
      next: 'fix4' },
    fix4: { text: 'My lantern! Here, a Good Plank. Free! That almost never happens.',
      effects: [ { setFlag: 'stall_fixed' }, { giveItem: 'plank' }, { quest: ['stall', -1] },
        { emote: ['coral', 'heart'] }, toast('Stall fixed! Got a Good Plank.', 'item') ] },
    fix_refund: { speaker: N, text: 'Sella lifts your lantern. The moths follow it down the pier, into the sea.',
      next: 'refund2' },
    refund2: { text: 'My lantern! You already have my plank, so... six gold refund. Partial. I am me.',
      effects: [ { setFlag: 'stall_fixed' }, { gold: 6 }, { quest: ['stall', -1] },
        { emote: ['coral', 'heart'] }, toast('Stall fixed! Got 6 gold.', 'gold') ] },
  },
};

// ---- Sella, lanternwright's apprentice (romance). Tic: proud, puns, "don't lick it".
DIALOGUES.sella = {
  entries: [
    { if: { all: [ { flag: 'inspector_here' }, { var: 'aff_sella', gte: 2 }, { notFlag: 'walk_done' } ] },
      node: 'walk' },
    { if: { all: [ { flag: 'inspector_here' }, { notFlag: 'walk_done' } ] }, node: 'nowalk' },
    { if: { flag: 'inspector_here' }, node: 'after' },
    { if: { notFlag: 'met_sella' }, node: 'meet' },
    { if: { all: [ { flag: 'sella_ready' }, { notFlag: 'stall_fixed' } ] }, node: 'atstall' },
    { if: { all: [ { flag: 'stall_asked' }, { notFlag: 'sella_ready' }, { notFlag: 'stall_fixed' } ] },
      node: 'stall' },
    { if: { all: [ { flag: 'bridge_flimsy' }, { notFlag: 'sella_flimsy' } ] }, node: 'flimsy' },
    { if: { all: [ { flag: 'wisp_friend' }, { notFlag: 'sella_wisp' } ] }, node: 'wispf' },
    { if: { all: [ { flag: 'wisp_bottled' }, { notFlag: 'sella_wisp' } ] }, node: 'wispb' },
    { if: { all: [ { item: 'plank', n: 2 }, { notFlag: 'carry_asked' }, { notFlag: 'bridge_fixed' } ] },
      node: 'carry' },
    { if: { var: 'aff_sella', gte: 4 }, node: 't4' },
    { if: { var: 'aff_sella', gte: 3 }, node: 't3' },
    { if: { var: 'aff_sella', gte: 2 }, node: 't2' },
    { if: { var: 'aff_sella', gte: 1 }, node: 't1' },
    { node: 't0' },
  ],
  nodes: {
    // First meeting: honesty test
    meet: { text: 'Oh. A customer. Or a loiterer. Mind the glass, please.', next: 'm2' },
    m2: { speaker: N, text: 'She holds up a lantern. It leans like a very tired duck.', next: 'm3' },
    m3: { text: "Be honest. Is it good? Don't be nice. Nice is useless.", choices: [
      { text: "It's lopsided. But it glows.", tone: 'kind',
        effects: [ ...heartUp(), { emote: ['sella', 'heart'] } ], next: 'honest' },
      { text: "It's perfect! A masterpiece!", tone: 'sly',
        effects: [ ...heartDown('Sella noticed the flattery.'), { emote: ['sella', 'angry'] } ],
        next: 'flatter' },
      { text: 'Give it here. I can fix it.', tone: 'bold',
        effects: [ { emote: ['sella', 'surprise'] } ], next: 'bold' },
    ] },
    honest: { text: 'Lopsided! Ha! Finally, someone in this village with eyes.', next: 'jar' },
    flatter: { text: 'It leans like a duck, Tavi. Do not butter me. I am not toast.', next: 'jar' },
    bold: { text: "Hands off, hero. It's my duck. I mean lantern. Nice try, though.", next: 'jar' },
    jar: { text: "Anyway. Starlight spills, and jars don't. Take my best one.",
      effects: [ { setFlag: 'met_sella' }, { giveItem: 'jar' }, toast('Got an Empty Jar.', 'item') ],
      next: 'jar2' },
    jar2: { text: "Someday I'll light the whole meadow. At night. Don't laugh. Don't lick it." },

    // Stall help
    stall: { text: 'Grey moths at Coral\'s? Moths chase glims. Grey ones... chase worse.', next: 'st2' },
    st2: { text: 'I need a steady light to lure them out. Yours never goes out. Ever.',
      choices: [
        { text: "Use my lantern. Let's go.", tone: 'kind',
          effects: [ { setFlag: 'sella_ready' }, { quest: ['stall', 1] }, ...heartUp() ],
          next: 'st_yes' },
        { text: "What's in it for me?", tone: 'sly',
          effects: [ { setFlag: 'sella_ready' }, { quest: ['stall', 1] },
            ...heartDown('Sella expected better.') ],
          next: 'st_sly' },
        { text: "Can't you use your own?", tone: 'bold', next: 'st_why' },
      ] },
    st_why: { text: "Mine flickers. Pride doesn't make light, sadly. I checked.", next: 'st2' },
    st_yes: { text: "Look at you, sharing. Meet me at Coral's stall, hero." },
    atstall: { text: 'Lantern up, hero. Go on, talk to Coral. I will glare at the moths.', effects: [ { emote: ['sella', 'happy'] } ] },
    st_sly: { text: 'A warm fuzzy feeling? Ugh. Fine. Free wick trims. Stall. Now.' },

    // Carrying planks (romance beat)
    carry: { text: "You're carrying planks like a startled crab. Want a hand?", choices: [
      { text: 'Yes please. Thank you.', tone: 'kind',
        effects: [ { setFlag: 'carry_asked' }, { setFlag: 'sella_carry' }, ...heartUp() ],
        next: 'c_yes' },
      { text: 'You carry. I supervise.', tone: 'sly',
        effects: [ { setFlag: 'carry_asked' }, { setFlag: 'sella_carry' }, { addVar: ['aff_sella', 1] },
          toast('Sella laughed too loud. Good sign.', 'heart') ],
        next: 'c_sly' },
      { text: "I don't need help.", tone: 'bold',
        effects: [ { setFlag: 'carry_asked' }, ...heartDown('Sella uses that line too. It stung.') ],
        next: 'c_no' },
    ] },
    c_yes: { text: "Good. I'm strong. Glass is heavy, you know. Lead the way." },
    c_sly: { text: 'Ha! Cheeky. Fine, boss. I am billing you in pastries.' },
    c_no: { text: 'Right. Of course. Neither do I. Obviously.' },

    // Reactions
    flimsy: { text: 'Rotten planks, Tavi? People walk on that. Children. Hobb.', choices: [
      { text: "You're right. I'm sorry.", tone: 'kind', effects: [ { setFlag: 'sella_flimsy' } ],
        next: 'fl_kind' },
      { text: 'I was in a hurry.', tone: 'sly',
        effects: [ { setFlag: 'sella_flimsy' }, ...heartDown() ], next: 'fl_sly' },
    ] },
    fl_kind: { text: "Sorry doesn't hold a bridge. But... thanks for saying it." },
    fl_sly: { text: 'So was the river, the day it broke. Just... walk softly.' },

    wispf: { text: 'Is that a WISP? Following YOU? Hi! Hi, little light!',
      effects: [ { setFlag: 'sella_wisp' }, ...heartUp(), { emote: ['sella', 'heart'] } ],
      next: 'wf2' },
    wf2: { text: 'Free light, lighting the meadow at night. That was my dream, you thief.' },
    wispb: { text: 'You bottled it. Smart. I think. It looks... sad in there.', choices: [
      { text: 'It was for Nan Wren.', tone: 'kind', effects: [ { setFlag: 'sella_wisp' } ],
        next: 'wb_kind' },
      { text: 'Light is light.', tone: 'bold',
        effects: [ { setFlag: 'sella_wisp' }, ...heartDown(), { emote: ['sella', 'sad'] } ],
        next: 'wb_bold' },
    ] },
    wb_kind: { text: 'Right. For Nan Wren. I would have done the same. Probably.' },
    wb_bold: { text: 'Is it? Mine flickers because it breathes. Never mind.' },

    // Tiered greetings
    t0: { text: "Oh. It's you. Mind the glass, please.", next: 't0b' },
    t0b: { text: 'I am busy being a genius. Quietly. Shoo.' },
    t1: { text: 'Evening, Tavi. Need a wick trimmed, or just loitering?', next: 't1b' },
    t1b: { text: 'I made a pun earlier. It was so bright it needed shades.' },
    t2: { text: "Tavi! Perfect timing. Hold this. Don't lick it.", next: 't2b' },
    t2b: { text: 'Glass is just sand that believed in itself. Like me. Ha!' },
    t3: { text: "I saved you the good stool. The one that doesn't wobble.", next: 't3b' },
    t3b: { text: "I burned toast thinking about... lanterns. Yes. Lanterns." },
    t4: { text: "You're late. I was worried. I was NOT worried. Hi.", next: 't3b' },

    // Shared lantern walk (after the singer is healed)
    walk: { text: "You did it. Nan Wren's humming. I'm not crying. It's glass dust.", next: 'w2' },
    w2: { text: "It's dark. Walk back together? One lantern's enough for two.", choices: [
      { text: "I'd like that.", tone: 'kind',
        effects: [ { setFlag: 'shared_walk' }, { setFlag: 'walk_done' }, { addVar: ['aff_sella', 1] },
          { emote: ['sella', 'heart'] }, toast('Sella will remember this walk.', 'heart') ],
        next: 'w3' },
      { text: 'Is this a date?', tone: 'sly',
        effects: [ { setFlag: 'shared_walk' }, { setFlag: 'walk_done' }, { addVar: ['aff_sella', 1] },
          { emote: ['sella', 'surprise'] }, toast('Sella will remember this walk.', 'heart') ],
        next: 'w_date' },
      { text: "I'll go alone.", tone: 'bold',
        effects: [ { setFlag: 'walk_done' }, ...heartDown('Oh. Sure. Of course.') ],
        next: 'w_no' },
    ] },
    w3: { speaker: N, text: 'You walk up the hill, shoulders bumping. Her hand finds the handle too.',
      next: 'w4' },
    w4: { text: "For the record, this is not a date. It's lantern efficiency.", next: 'w5' },
    w_date: { text: 'It is NOT. Hush. Walk. Hold the lantern higher. Closer. Fine.', next: 'w3' },
    w5: { text: "Someone's in the plaza. Violet light. Stay close, Tavi." },
    w_no: { text: "Right. I'll just... glow on my own. I'm very good at that." },
    nowalk: { text: 'Good work, Tavi. Really. Nan Wren is humming again.', next: 'nw2' },
    nw2: { text: "I'd walk you back, but... never mind. Goodnight.",
      effects: [ { setFlag: 'walk_done' }, { emote: ['sella', 'dots'] } ] },
    after: { text: "Go on. Plaza. I'm right behind you. Probably. Definitely." },
  },
};

// ---- Bram, bridge guard. Tic: salutes before and after lines.
DIALOGUES.bram = {
  entries: [
    { if: { flag: 'told_truth' }, node: 'truth' },
    { if: { flag: 'kept_quiet' }, node: 'quiet' },
    { if: { flag: 'bridge_flimsy' }, node: 'flimsy' },
    { if: { flag: 'bridge_fixed' }, node: 'fixed' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: '*salutes* Halt! State your business. Also, the bridge is broken. Carry on.',
      next: 's2' },
    s2: { text: 'I guard this spot. It is important. I think. Is it? *salutes*' },
    fixed: { text: '*salutes* The bridge goes somewhere now! My job has meaning! *salutes*' },
    flimsy: { text: '*salutes* The bridge creaks when I look at it. So I stopped looking.' },
    truth: { text: '*salutes* Sabotage! I told everyone. Twice. Marla made me stop.', next: 't2' },
    t2: { text: 'I am now guarding against saboteurs. And also the bridge. *salutes*' },
    quiet: { text: '*salutes* A storm, I am sure. I have arrested three clouds.', next: 'q2' },
    q2: { text: 'They got away. Clouds are slippery. *salutes*' },
  },
};

// ---- Nettie, gossip. "The village remembers." Tic: "You didn't hear it from me."
DIALOGUES.nettie = {
  entries: [
    { if: { flag: 'shared_walk' }, node: 'walk' },
    { if: { flag: 'inspector_here' }, node: 'inspector' },
    { if: { flag: 'child_escort' }, node: 'pim' },
    { if: { flag: 'wisp_bottled' }, node: 'bottled' },
    { if: { flag: 'wisp_friend' }, node: 'friend' },
    { if: { flag: 'told_truth' }, node: 'truth' },
    { if: { flag: 'bobber_sold' }, node: 'bobber' },
    { if: { flag: 'bridge_flimsy' }, node: 'flimsy' },
    { if: { flag: 'stranger_fed' }, node: 'fed' },
    { if: { flag: 'stranger_refused' }, node: 'refused' },
    { if: { flag: 'stall_fixed' }, node: 'stall' },
    { if: { flag: 'bridge_fixed' }, node: 'bridge' },
    { if: { flag: 'marla_kind' }, node: 'marla' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: 'Psst. Sella likes you. Maybe. You did NOT hear it from me.', next: 's2' },
    s2: { text: "A hooded man by the inn. Hungry, and he stares at lanterns. Shh!" },
    marla: { text: 'Marla sang in the kitchen! Someone was kind to her. Didn\'t hear it from me.' },
    bridge: { text: 'Bridge is fixed! Hobb only cried twice. You did not hear it from me.' },
    stall: { text: "Coral smiled for free today. FREE. You didn't hear it from me." },
    fed: { text: 'You fed the hooded man? Brave. Or silly. Both! Didn\'t hear it from me.' },
    refused: { text: 'You sent the hooded man off hungry. He smiled. Brr. Not from me!' },
    flimsy: { text: "Rotten planks! Hobb's counting in his sleep. You didn't hear it from me." },
    bobber: { text: "Gil's bobber at Coral's stall? The village will talk. I AM the village." },
    truth: { text: 'SABOTAGE! Bram told the fish. The fish told me. Not from me!' },
    friend: { text: 'A wisp follows you like a duckling! You did not hear it from me.' },
    bottled: { text: 'They say you bottled a wisp. Glass is cold, dear. Not from me.' },
    pim: { text: 'You walked little Pim home in the dark? Oh, my heart. Not from me.' },
    inspector: { text: 'A Lantern Inspector, at THIS hour? Moths on his hat! Not from me.' },
    walk: { text: 'You and Sella, one lantern. The whole hill saw. You didn\'t hear it from me.',
      effects: [ { emote: ['nettie', 'heart'] } ] },
  },
};

// ---- Nan Wren, lullaby singer. Pim's gran. Gentle, forgetful, "dear heart".
DIALOGUES.wren = {
  entries: [
    { if: { flag: 'singer_healed' }, node: 'healed' },
    { if: { flag: 'singer_half' }, node: 'half' },
    { if: { any: [ { item: 'starjar' }, { flag: 'wisp_friend' } ] }, node: 'heal' },
    { if: { all: [ { time: 'night' }, { notFlag: 'child_escort' } ] }, node: 'missing' },
    { if: { flag: 'bridge_fixed' }, node: 'bridge' },
    { node: 'start' },
  ],
  nodes: {
    start: { speaker: N, text: 'Nan Wren rocks slowly. The wick by her door is dark.', next: 's2' },
    s2: { text: 'Who is there? Tavi. Yes. I knew that, dear heart.', next: 's3' },
    s3: { text: 'My grandchild. The loud one. Their name slipped out of my pocket.' },
    bridge: { text: 'I heard hammering, dear heart. Or my heart. Hard to tell at my age.' },
    missing: { text: 'My loud one went for starlight. At night! The little goose.', next: 'mi2' },
    mi2: { text: 'By the old oak, I think. Or the moon. Bring them home, dear heart?' },

    heal: { speaker: N, text: 'Nan Wren sits wrapped in a shawl. The dark wick waits by her door.',
      next: 'h2' },
    h2: { text: 'Is that... light? Oh, it is warm. Come closer, dear heart.', choices: [
      { text: 'Pour out the starlight.', tone: 'kind', if: { item: 'starjar' },
        effects: [ { takeItem: 'starjar' }, { setFlag: 'singer_healed' }, { setFlag: 'wicks_relit' },
          { setFlag: 'garden_bloom' }, { sfx: 'jingle' }, toast('Nan Wren is healed!', 'star') ],
        next: 'full1' },
      { text: 'Ask the wisp to help.', tone: 'kind', if: { flag: 'wisp_friend' },
        effects: [ { setFlag: 'singer_half' }, { setFlag: 'garden_bloom' }, { sfx: 'jingle' },
          toast('Nan Wren is half healed.', 'star') ],
        next: 'half1' },
      { text: 'Not yet.', next: null },
    ] },
    full1: { speaker: N, text: 'Starlight pours over her hands. Up the hill, wick after wick blinks on.',
      next: 'full2' },
    full2: { text: '♪ Hush now, little wick, the tide will keep you... ♪',
      effects: [ { emote: ['wren', 'music'] } ], next: 'full3' },
    full3: { text: '♪ What is promised comes home by the light. ♪', next: 'full4' },
    full4: { text: 'Oh! PIM. My grandchild is Pim! I remember every freckle.',
      effects: [ { emote: ['pim', 'heart'] }, { setFlag: 'inspector_here' }, { quest: ['starlight', 2] },
        toast('Someone waits in the plaza.', 'quest'), { autosave: true } ] },
    half1: { speaker: N, text: 'The wisp circles her twice, shy. It gives some light. Only some.',
      next: 'half2' },
    half2: { text: '♪ Hush now, little wick, the tide will... ♪ Hm. The rest is fog.',
      effects: [ { emote: ['wren', 'music'] } ], next: 'half3' },
    half3: { text: "It's enough, dear heart. It's more than I had. Thank you.",
      effects: [ { setFlag: 'inspector_here' }, { quest: ['starlight', 2] },
        toast('Someone waits in the plaza.', 'quest'), { autosave: true } ] },

    healed: { text: 'Every verse is back, dear heart. And every name. Thank you, Tavi.', next: 'hd2' },
    hd2: { text: 'Hum it with me sometime. Off-key is fine. Tamsy sang off-key.' },
    half: { text: 'Half a song, dear heart. The rest is fog. But fog lifts, doesn\'t it?' },
  },
};

// ---- Pim, child. Tic: "BOOM!", names rocks Steve.
DIALOGUES.pim = {
  entries: [
    { if: { all: [ { flag: 'child_escort' }, { flag: 'singer_healed' } ] }, node: 'healed' },
    { if: { all: [ { flag: 'child_escort' }, { flag: 'singer_half' } ] }, node: 'half' },
    { if: { flag: 'child_escort' }, node: 'home' },
    { if: { all: [ { time: 'night' }, { flag: 'pim_alone' } ] }, node: 'p2' },
    { if: { time: 'night' }, node: 'lost' },
    { if: { flag: 'bridge_fixed' }, node: 'bridge' },
    { node: 'start' },
  ],
  nodes: {
    start: { text: "I'm gonna be a hero like you! BOOM!", next: 's2' },
    s2: { text: 'This rock is a king. His name is Steve. Bow to Steve.' },
    bridge: { text: "The bridge is back! I'm gonna cross it. Don't tell Gran. BOOM!" },
    lost: { text: "BOOM! Oh. It's you. I'm not lost. I'm exploring. In the dark. Alone.",
      effects: [ { quest: ['pim', 0] } ], next: 'p2' },
    p2: { text: 'I wanted starlight for Gran. But the dark got really, really big.', choices: [
      { text: "Let's walk home together.", tone: 'kind', next: 'walk' },
      { text: 'Race you home! BOOM!', tone: 'bold', next: 'race' },
      { text: "You'll be fine. Go on.", tone: 'sly',
        effects: [ { setFlag: 'pim_alone' }, { emote: ['pim', 'sad'] },
          toast('Pim sniffles. The dark stays big.', 'moth') ],
        next: 'alone' },
    ] },
    walk: { speaker: N, text: 'You walk Pim home under your lantern. Pim names every rock.',
      effects: [ { setFlag: 'child_escort' }, { quest: ['pim', -1] }, { emote: ['pim', 'heart'] },
        toast('Pim is home safe.', 'heart') ],
      next: 'walk2' },
    walk2: { text: "That one's Steve. That one's also Steve. Thanks, Tavi. BOOM." },
    race: { speaker: N, text: 'Pim wins, somehow. Pim was not actually lost. Pim was just slow.',
      effects: [ { setFlag: 'child_escort' }, { quest: ['pim', -1] }, { emote: ['pim', 'happy'] },
        toast('Pim is home safe.', 'heart') ],
      next: 'walk2' },
    alone: { text: "Fine! I'm brave. I'll go when I'm braver. In a minute. BOOM?" },
    home: { text: "You walked me home! You're my hero. Second to Steve. Steve's a rock." },
    healed: { text: 'Gran said my name! PIM! Like a firework! BOOM!' },
    half: { text: "Gran calls me Pip now. That's okay. Pip is cute. BOOM." },
  },
};

// ---- The wisp (meadow clearing). The big choice.
DIALOGUES.wisp = {
  entries: [ { node: 'start' } ],
  nodes: {
    start: { speaker: N, text: 'A wisp, small as a plum, trembles above the clover.', next: 'w2' },
    w2: { speaker: 'Wisp', text: 'Tink? Tink tink.', next: 'w3' },
    w3: { speaker: N, text: 'It hums the same note as your lantern. As if it knows you.', choices: [
      { text: 'Bottle it in the jar.', tone: 'sly', if: { item: 'jar' },
        effects: [ { takeItem: 'jar' }, { giveItem: 'starjar' }, { setFlag: 'wisp_bottled' },
          { quest: ['starlight', 1] }, { emote: ['wisp', 'sad'] },
          toast('Got a Jar of Starlight.', 'item') ],
        next: 'b1' },
      { text: 'Hold out your hand.', tone: 'kind',
        effects: [ { setFlag: 'wisp_friend' }, { giveItem: 'wisp' }, { quest: ['starlight', 1] },
          { emote: ['wisp', 'heart'] }, toast('The wisp will follow you.', 'heart') ],
        next: 'f1' },
      { text: 'Leave it be.', next: null },
    ] },
    b1: { speaker: N, text: 'The lid clinks shut. The wisp presses one tiny hand to the glass.',
      next: 'b2' },
    b2: { speaker: N, text: 'It glows so bright. It does not blink anymore.' },
    f1: { speaker: N, text: 'The wisp lands on your palm, warm as toast, then hops onto your lantern.',
      next: 'f2' },
    f2: { speaker: 'Wisp', text: 'Tink!', next: 'f3' },
    f3: { speaker: N, text: "It will share some light. Not all. Friends don't give everything." },
  },
};

// ---- Umbra, the Hushwarden, as the Lantern Inspector (finale)
DIALOGUES.umbra = {
  entries: [ { node: 'start' } ],
  nodes: {
    start: { speaker: N, text: 'A tall man waits by the well. Violet trim. Grey moths circle his hat.',
      next: 'u2' },
    u2: { text: 'Good evening. Lantern Inspector, from the capital. Such a lively glow.', next: 'u3' },
    u3: { speaker: N, text: 'Your lantern hums, loud as a bee in a jar. He smiles at it. Fondly.',
      next: 'u4' },
    u4: { speaker: 'Tavi', text: 'Wait. That voice. You were the hooded stranger!',
      branch: [ { if: { flag: 'stranger_fed' }, next: 'fed1' }, { next: 'hun1' } ] },
    fed1: { text: 'And you fed me plum cake. I never forget a kindness, Tavi.', next: 'fed2' },
    fed2: { text: "So I will take your light last. That's a promise.", next: 'bridge' },
    hun1: { text: 'And you let me go hungry. Good. You are learning how the world works.',
      next: 'bridge' },
    bridge: { text: 'Tell me. Did the bridge hold? Old things break so easily.',
      branch: [ { if: { flag: 'told_truth' }, next: 'tt0' }, { next: 'tq0' } ] },
    tt0: { speaker: 'Tavi', text: 'Bram knows. Someone cut it.', effects: [ { emote: ['umbra', 'angry'] } ], next: 'tt1' },
    tq0: { speaker: 'Tavi', text: 'A storm broke it. They say.', effects: [ { emote: ['umbra', 'happy'] } ], next: 'tq1' },
    tt1: { text: 'The guard? Clever village. Loud, too. I shall be quieter next time.',
      next: 'moth' },
    tq1: { text: 'Storms take the blame so gracefully. They never argue.', next: 'moth' },
    moth: { speaker: N, text: 'A grey moth lands on your lantern. It does not fly off.',
      branch: [ { if: { flag: 'kept_shard' }, next: 'sh0' }, { if: { flag: 'shard_tossed' }, next: 'sh2' }, { next: 'sh3' } ] },
    sh0: { speaker: N, text: 'In your pocket, the violet shard starts to hum.', effects: [ { emote: ['umbra', 'surprise'] } ], next: 'sh1' },
    sh3: { text: 'I dropped something by your bridge. Someone will find it. Someone always does.', next: 'wisp' },
    sh1: { text: 'Ah. You found my glass. Keep it warm for me, would you?', next: 'wisp' },
    sh2: { text: 'You gave my glass to the river? The river gives things back. You know that.',
      next: 'wisp' },
    wisp: { text: 'And the light you brought the old singer. Where did it come from?',
      branch: [ { if: { flag: 'wisp_bottled' }, next: 'wb0' }, { next: 'wf0' } ] },
    wb0: { speaker: 'Tavi', text: 'I caught a wisp. In a jar.', next: 'wb1' },
    wf0: { speaker: 'Tavi', text: 'A wisp. My friend.', next: 'wf1' },
    wb1: { text: "A star in a jar! You'd make a fine Warden, Tavi. Truly.",
      effects: [ toast('The Inspector approves. That is worse.', 'moth') ], next: 'rev' },
    wf1: { text: 'Loose light, hiding behind yours. So untidy. Free things end up lost.',
      effects: [ toast('The wisp hisses at him. Tink!', 'moth') ], next: 'rev' },
    rev: { text: 'Keep your little promises, lantern child. They only ever break.', next: 'rev2' },
    rev2: { speaker: 'Umbra', text: 'Forgive me. I never said my name. Umbra. Some say, the Hushwarden.',
      next: 'rev3' },
    rev3: { speaker: N, text: "He bows. The moths lift. The well's lantern goes out, and he is gone.",
      effects: [ { quest: ['starlight', -1] }, { autosave: true }, { ending: 'prologue' } ] },
  },
};

// ---- Object dialogues -------------------------------------------------------

// Crates behind the inn: one Good Plank, guarded by a flag.
DIALOGUES.crates = {
  entries: [ { if: { flag: 'crates_plank' }, node: 'empty' }, { node: 'start' } ],
  nodes: {
    start: { speaker: N, text: 'Crates behind the inn. A fat cat sleeps on top of a Good Plank.',
      next: 'c2' },
    c2: { speaker: N, text: 'The cat opens one eye. It has clearly never moved in its life.', choices: [
      { text: 'Ask the cat nicely.', tone: 'kind', next: 'nice' },
      { text: 'Wiggle the plank out.', tone: 'sly', next: 'wiggle' },
      { text: 'Leave the cat be.', next: null },
    ] },
    nice: { speaker: N, text: 'You ask very politely. The cat considers it, then rolls off, offended.',
      effects: [ { setFlag: 'crates_plank' }, { giveItem: 'plank' }, toast('Got a Good Plank.', 'item') ] },
    wiggle: { speaker: N, text: 'You wiggle. The cat rides the plank like a tiny king. Then: hiss.',
      effects: [ { setFlag: 'crates_plank' }, { giveItem: 'plank' }, toast('Got a Good Plank.', 'item') ] },
    empty: { speaker: N, text: 'Empty crates. They smell of onions and old promises. The cat judges you.' },
  },
};

// The break in Tamsy's Span: the sabotage reveal.
DIALOGUES.bridge_break = {
  entries: [
    { if: { notFlag: 'bridge_fixed' }, node: 'gap' },
    { if: { all: [ { flag: 'bridge_seen' }, { flag: 'kept_shard' } ] }, node: 'seen_shard' },
    { if: { flag: 'bridge_seen' }, node: 'seen' },
    { node: 'start' },
  ],
  nodes: {
    gap: { speaker: N, text: 'The Span just stops. Below, the Tamble chuckles at you.' },
    seen: { speaker: N, text: 'The mended span. The river hums softly below.' },
    seen_shard: { speaker: N, text: 'The mended span. The shard in your pocket hums back at the water.' },
    start: { speaker: N, text: 'Mid-span, your lantern starts to hum. Low, like a held note.', next: 'k2' },
    k2: { speaker: N, text: "The old beams aren't snapped. They're cut. Clean, like a saw. Or a spell.",
      next: 'k3' },
    k3: { speaker: N, text: 'Wedged in the wood: a violet glass shard. Cold. It hums back.', choices: [
      { text: 'Keep the shard.', tone: 'sly',
        effects: [ { setFlag: 'kept_shard' }, { giveItem: 'shard' },
          toast('Got an Odd Glass Shard.', 'item') ],
        next: 'bram1' },
      { text: 'Toss it in the river.', tone: 'bold',
        effects: [ { setFlag: 'shard_tossed' }, toast('The river swallows it. The hum stops.', 'moth') ],
        next: 'bram1' },
    ] },
    bram1: { speaker: 'Bram', face: 'knight', text: '*salutes* Halt! I mean, hello! Anything to report?',
      choices: [
        { text: 'It was sabotage. Cut beams.', tone: 'bold',
          effects: [ { setFlag: 'told_truth' }, { emote: ['bram', 'surprise'] },
            toast('Bram will tell everyone.', 'quest') ],
          next: 'truth' },
        { text: 'Nothing. Just a storm.', tone: 'sly',
          effects: [ { setFlag: 'kept_quiet' }, { emote: ['bram', 'dots'] },
            toast('You keep the secret. For now.', 'moth') ],
          next: 'quiet' },
      ] },
    truth: { speaker: 'Bram', face: 'knight', text: 'Sabotage?! On MY bridge? I must tell someone! Everyone!',
      next: 'dusk' },
    quiet: { speaker: 'Bram', face: 'knight', text: 'A storm! Knew it. Nasty things, storms. *salutes*',
      next: 'dusk' },
    dusk: { speaker: N, text: 'The sun slips into the sea. Across the river, the meadow begins to glow.',
      effects: [ { setFlag: 'bridge_seen' }, { fade: 'night' }, { quest: ['span', -1] },
        { quest: ['starlight', 0] }, { autosave: true } ] },
  },
};

// Gil's bobber in the meadow reeds.
DIALOGUES.reeds = {
  entries: [ { if: { flag: 'got_bobber' }, node: 'empty' }, { node: 'start' } ],
  nodes: {
    start: { speaker: N, text: 'Something bobs in the reeds. Red and white, and very smug.', next: 'r2' },
    r2: { speaker: N, text: "Gil's lucky bobber! You fish it out. Your sleeve is now a pond.",
      effects: [ { setFlag: 'got_bobber' }, { giveItem: 'bobber' }, { quest: ['bobber', 1] },
        toast('Got the Lucky Bobber.', 'item') ] },
    empty: { speaker: N, text: 'Just reeds now. A frog watches you, deeply unimpressed.' },
  },
};

// The Dimspot: eerie, with a memory flash of Tavi's past.
DIALOGUES.dimspot = {
  entries: [ { if: { flag: 'saw_dimspot' }, node: 'again' }, { node: 'start' } ],
  nodes: {
    start: { speaker: N, text: 'The grass here is ash-grey. Even the crickets go quiet.', next: 'd2' },
    d2: { speaker: N, text: 'Your lantern gutters. For one blink, you forget your own name.', next: 'd3' },
    d3: { speaker: N, text: "A flash: a basket, a river, a voice. 'I'll come back for you, little light.'",
      next: 'd4' },
    d4: { speaker: N, text: 'Then it is gone. Someone made a promise here. Someone let it go.',
      effects: [ { setFlag: 'saw_dimspot' }, toast('A memory flickers.', 'moth') ] },
    again: { speaker: N, text: "The grey patch. You don't want to stand in it long." },
  },
};

// ---------------------------------------------------------------- EXAMINE
export const EXAMINE = {
  well: [
    "Old Tamsy's well. Coins at the bottom glow, each one a wish she carried.",
    'You lean in. Your echo says your name, but a little farther away.',
  ],
  inn_sign: [
    'The Sleepy Gull Inn. The gull on the sign is, in fact, asleep.',
    'ROOMS 10 COPPER. PROMISES ACCEPTED IF KEPT BY BREAKFAST.',
  ],
  notice_board: [
    'LOST: one lucky bobber. Red. Smug. Ask Gil.',
    'DIMMING IS NATURAL. DO NOT PANIC. DO NOT ASK QUESTIONS. (The Wickwardens)',
    "Scrawled underneath: 'I AM asking questions.' Signed, Nettie.",
  ],
  shrine: [
    'A shrine of stacked lanterns. One flame for every family in Puddlewick.',
    'Three lanterns are dark. Someone left a plum cake by each one anyway.',
  ],
  boat: [
    "Tamsy's old ferry boat, painted every spring. Nobody has rowed it in years.",
    'Rope marks are worn deep in the post. Someone tied up here thousands of times.',
  ],
  workshop_window: [
    'Through the glass: lanterns everywhere, and one piece of very burnt toast.',
    'A crate in the corner reads: FAILURES. DO NOT OPEN. Very tempting.',
  ],
  mill: [
    'The Honeywheel Mill turns on glim-light, creaking a slow tune.',
    'The wheel stutters, stops, then groans on. The miller pretends not to notice.',
  ],
  statue: [
    'Old Tamsy in stone, oar in hand. The gulls have given her a white hat.',
    "The plaque reads: 'ANYONE. ANY HOUR. FOR FREE.' Her promise.",
  ],
  lamp_post: [
    "A lamp post with a wick inside. It flickers like it's thinking very hard.",
    'A grey moth clings to the glass. It does not look like it pays rent.',
  ],
  flowerbed: [
    'Marigolds and sea pinks. Half of them have gone oddly pale.',
    'A tiny sign: PLEASE DO NOT EAT THE FLOWERS, PIM.',
  ],
  barrels: [
    'Barrels of smoked fish. Your stomach makes a promise it cannot keep.',
    'One barrel is labeled PICKLES? The question mark is worrying.',
  ],
  fishnet: [
    'A fishing net hung to dry. It has caught one boot and one strong opinion.',
    'Glowing floats are tied along it. Wick-floats, the fishers call them.',
  ],
  bench: [
    'A bench worn smooth by two hundred years of gossip.',
    "Someone carved 'N + everyone' into the arm. Classic Nettie.",
  ],
  mailbox: [
    "A mailbox shaped like a gull. One letter inside: 'Dear Me, eat a vegetable.'",
    'Promises to yourself make the smallest glims. Also the hardest to catch.',
  ],
  haystack: [
    'A haystack. Somewhere inside, a needle has given up hope.',
    'It smells like summer and sneezing.',
  ],
  signpost_meadow: [
    'NORTH: TAMBLEMEADOW. SOUTH: PUDDLEWICK. WEST: SHEEP (PROBABLY).',
    "Someone added 'HOME BY DUSK!' in a child's wobbly letters.",
  ],
  pond_stone: [
    'A flat stone, perfect for skipping. You skip it twice. Personal best.',
    'The ripples glow faintly. Starlight settles here like dew.',
  ],
  old_oak: [
    'An oak older than the village. Lanterns once hung from every branch.',
    'Carved in the bark: T + THE RIVER. Old Tamsy, maybe.',
  ],
  grave_marker: [
    'HERE RESTS BISCUIT, BEST DOG. HE KEPT EVERY PROMISE.',
    'Someone still leaves a fresh stick here every week.',
  ],
};

// ---------------------------------------------------------------- ENDING
// Render: base lines, then every matching variant (in order), then `tease` last.
export const ENDING = {
  base: [
    'The first night of the Dimming ends. Puddlewick sleeps, mostly.',
  ],
  variants: [
    { if: { flag: 'bridge_flimsy' }, line: "Tamsy's Span creaks in the wind. It will not hold forever." },
    { if: { notFlag: 'bridge_flimsy' }, line: "Tamsy's Span stands sturdy over the Tamble." },
    { if: { flag: 'singer_healed' }, line: "Every wick on the hill glows. Nan Wren remembers Pim's name." },
    { if: { flag: 'singer_half' }, line: 'Nan Wren hums half a song. A wisp sleeps on your lantern.' },
    { if: { flag: 'shared_walk' }, line: 'Sella keeps humming the lullaby. She blames the glass dust.' },
    { if: { flag: 'stranger_fed' }, line: 'Somewhere, a man in grey remembers the taste of plum cake.' },
    { if: { flag: 'told_truth' }, line: 'Bram guards the bridge with a new word: sabotage.' },
  ],
  tease: 'Chapter 1: The Lantern Tax. The moths are coming.',
};
