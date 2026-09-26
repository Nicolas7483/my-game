// Items. icon = file in public/assets/items (without .png). use = effects when used from the hotbar (1-5).
export const ITEMS = {
  lantern: { name: "Tavi's Lantern", icon: 'element:3', key: true, desc: 'It never needs oil. Tonight it hums.' },
  plank: { name: 'Good Plank', icon: 'branch', desc: 'Straight, dry, smells like pine. Hobb would approve.' },
  oldplank: { name: 'Rotten Plank', icon: 'branch', desc: 'Soft as cake. Not the good kind of cake.' },
  bobber: { name: 'Lucky Bobber', icon: 'gemyellow', desc: "Gil's lucky bobber. Still lucky? Hard to say." },
  shard: { name: 'Odd Glass Shard', icon: 'gempurple', desc: 'Violet glass. It is cold, and it hums back.' },
  plumcake: { name: 'Plum Cake', icon: 'onigiri', desc: 'Warm and sticky. Heals a heart.', use: [{ heal: 2 }, { takeItem: 'plumcake' }, { toast: 'Delicious. +1 heart', icon: 'heart' }, { sfx: 'heal' }] },
  jar: { name: 'Empty Jar', icon: 'waterpot', desc: 'Sella made it. Sturdy enough to hold starlight.' },
  starjar: { name: 'Jar of Starlight', icon: 'lifepot', desc: 'The wisp beats against the glass like a heart.' },
  wisp: { name: 'Wisp Friend', icon: 'heart', key: true, desc: 'A tiny light that chose you. It hums along.' },
  letter: { name: 'Folded Letter', icon: 'letter', desc: 'Not yours. Probably.' },
  flower: { name: 'Meadow Bloom', icon: 'seed1', desc: 'A flower that glows faintly at night.' },
  fish: { name: 'Silver Fish', icon: 'fish', desc: 'Still wriggling. Gil would be proud.', use: [{ heal: 1 }, { takeItem: 'fish' }, { toast: 'Crunchy. +half heart', icon: 'heart' }] },
  honey: { name: 'Honey Pot', icon: 'honey', desc: 'Sweet enough to bribe a bear.', use: [{ heal: 2 }, { takeItem: 'honey' }, { toast: 'So sweet. +1 heart', icon: 'heart' }] },
};
