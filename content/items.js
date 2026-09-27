// Items. icon = file in public/assets/items (without .png). use = effects when used from the hotbar (1-5).
export const ITEMS = {
  lantern: { name: "Tavi's Lantern", icon: 'element:3', key: true, desc: 'It never needs oil. Tonight it hums.' },
  plank: { name: 'Good Plank', icon: 'branch', desc: 'Straight, dry, smells like pine. Hobb would approve.' },
  oldplank: { name: 'Rotten Plank', icon: 'branch', desc: 'Soft as cake. Not the good kind of cake.' },
  bobber: { name: 'Lucky Bobber', icon: 'gemyellow', desc: "Gil's lucky bobber. Still lucky? Hard to say." },
  shard: { name: 'Odd Glass Shard', icon: 'gempurple', desc: 'Violet glass. It is cold, and it hums back.' },
  plumcake: { name: 'Plum Cake', icon: 'onigiri', desc: 'Warm and sticky. Heals a heart.', use: [{ heal: 20 }, { takeItem: 'plumcake' }, { toast: 'Delicious! +20 HP', icon: 'heart' }, { sfx: 'heal' }] },
  jar: { name: 'Empty Jar', icon: 'waterpot', desc: 'Sella made it. Sturdy enough to hold starlight.' },
  starjar: { name: 'Jar of Starlight', icon: 'lifepot', desc: 'The wisp beats against the glass like a heart.' },
  wisp: { name: 'Wisp Friend', icon: 'heart', key: true, desc: 'A tiny light that chose you. It hums along.' },
  letter: { name: 'Folded Letter', icon: 'letter', desc: 'Not yours. Probably.' },
  flower: { name: 'Meadow Bloom', icon: 'seed1', desc: 'A flower that glows faintly at night.' },
  fish: { name: 'Silver Fish', icon: 'fish', desc: 'Still wriggling. Gil would be proud.', use: [{ heal: 8 }, { takeItem: 'fish' }, { toast: 'Crunchy. +8 HP', icon: 'heart' }] },
  honey: { name: 'Honey Pot', icon: 'honey', desc: 'Sweet enough to bribe a bear.', use: [{ heal: 20 }, { takeItem: 'honey' }, { toast: 'So sweet. +20 HP', icon: 'heart' }] },
  herb: { name: 'Riverherb', icon: 'seed1', desc: 'Bitter, green, reliable. Heals 15 HP.', use: [{ heal: 15 }, { takeItem: 'herb' }, { toast: 'Bitter but better. +15 HP', icon: 'heart' }] },
  glimdrop: { name: 'Glimdrop', icon: 'gemyellow', desc: 'A drop of kept promise. Restores 8 LP.', use: [{ lp: 8 }, { takeItem: 'glimdrop' }, { toast: 'Your lantern brightens. +8 LP', icon: 'star' }] },
};
