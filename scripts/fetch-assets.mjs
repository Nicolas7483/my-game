// Downloads the CC0 art/audio we use from the series-ai/jam-ready-assets mirror.
// Files are committed to the repo, so this only needs to run when the manifest changes.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://media.githubusercontent.com/media/series-ai/jam-ready-assets/HEAD/';
const NA = 'ninja-adventure/2D/top-down-rpg/';

const CHARACTERS = ['Villager', 'Villager2', 'Villager3', 'Villager4', 'Villager5', 'Villager6',
  'OldMan', 'OldMan2', 'OldMan3', 'OldWoman', 'Princess', 'Knight', 'Monk', 'Noble', 'Woman',
  'Child', 'Boy', 'Hunter', 'Inspector', 'Master', 'Samurai', 'SorcererBlack', 'Shaman', 'Eskimo',
  'Cavegirl', 'EggGirl', 'NinjaBlue', 'Spirit'];
const ANIMALS = ['Cat', 'CatOrange', 'Chicken', 'Dog', 'Cow', 'Frog', 'Horse', 'Pig'];
const TILESETS = ['TilesetFloor', 'TilesetFloorB', 'TilesetFloorDetail', 'TilesetHouse', 'TilesetNature',
  'TilesetWater', 'TilesetField', 'TilesetElement', 'TilesetRelief', 'TilesetReliefDetail',
  'TilesetTowers', 'TilesetVillageAbandoned', 'TilesetLogic', 'tileset_camp', 'tileset_bed'];
const MUSIC = ['36 - Village', '33 - Calm Village', '4 - Village', '35 - Adventure', '31 - Sunny',
  '9 - Quiet', '27 - Chill', '22 - Dream', '38 - Intro', '28 - Tension', '6 - Story (Short)', '7 - Sad Theme'];

const files = [];
const add = (src, dest, base = BASE + NA) => files.push({ url: base + src.split('/').map(encodeURIComponent).join('/'), dest });

for (const c of CHARACTERS) {
  const d = c.toLowerCase();
  add(`Actor/Character/${c}/SpriteSheet.png`, `chars/${d}.png`);
  add(`Actor/Character/${c}/Faceset.png`, `faces/${d}.png`);
}
add('Actor/Character/Shadow.png', 'chars/shadow.png');
for (const a of ANIMALS) add(`Actor/Animal/${a}/SpriteSheet.png`, `animals/${a.toLowerCase()}.png`);
for (const t of TILESETS) add(`Backgrounds/Tilesets/${t}.png`, `tiles/${t.toLowerCase()}.png`);
for (const t of ['Elements', 'TilesetInterior', 'TilesetInteriorFloor', 'TilesetWallSimple'])
  add(`Backgrounds/Tilesets/Interior/${t}.png`, `tiles/interior_${t.toLowerCase()}.png`);
for (const [s, d] of [['Flower/SpriteSheet16x16.png', 'anim_flower'], ['Plant/SpriteSheet16x16.png', 'anim_plant'],
  ['Water Ripples/SpriteSheet16x16.png', 'anim_ripples'], ['WaterMill/Watermill_A_34x36.png', 'anim_watermill'],
  ['MillPropeller/MillPropeller_A_64x64.png', 'anim_millprop'], ['Flag/FlagRed16x16.png', 'anim_flag_red'],
  ['Flag/FlagBlue16x16.png', 'anim_flag_blue'], ['Waterfall/TopSheet16x16.png', 'anim_fall_top'],
  ['Waterfall/MiddleSheet16x16.png', 'anim_fall_mid'], ['Waterfall/BottomSheet16x16.png', 'anim_fall_bot']])
  add(`Backgrounds/Animated/${s}`, `tiles/${d}.png`);
add('Backgrounds/Vehicles/Boat.png', 'tiles/boat.png');
add('Backgrounds/Vehicles/FishNet.png', 'tiles/fishnet.png');
for (const p of ['Leaf', 'LeafPink', 'Spark', 'Grass', 'Clouds']) add(`FX/Particle/${p}.png`, `fx/${p.toLowerCase()}.png`);
add('FX/Smoke/Smoke/SpriteSheet.png', 'fx/smoke.png');
add('FX/Environment/Raylight.png', 'fx/raylight.png');
add('FX/Environment/Fog.png', 'fx/fog.png');
for (let i = 1; i <= 30; i++) add(`Ui/Emote/emote${i}.png`, `ui/emote${i}.png`);
for (const u of ['Ui/Receptacle/Heart.png', 'Ui/Receptacle/IconHeart.png', 'Ui/Arrow.png', 'Ui/Font/NormalFont.ttf', 'Ui/Font/font8x8.png'])
  add(u, 'ui/' + u.split('/').pop().toLowerCase());
const ITEMS = ['Food/Fish', 'Food/Honey', 'Food/Onigiri', 'Food/TeaLeaf', 'Food/Nut', 'Food/Seed1', 'Food/SeedBig1',
  'Object/Book', 'Object/Bag', 'Object/MoneyBag', 'Object/PanFlute', 'Object/Hourglass', 'Other/Letter', 'Other/Letter2',
  'Potion/LifePot', 'Potion/Heart', 'Potion/WaterPot', 'Potion/MilkPot', 'Resource/Branch', 'Resource/GemYellow',
  'Resource/GemGreen', 'Resource/GemPurple', 'Resource/Rock', 'Resource/feather', 'Resource/BarIron',
  'Tool/Hammer', 'Tool/Axe', 'Tool/Shovel', 'Tool/WateringCan', 'Treasure/GoldCoin', 'Treasure/GoldKey',
  'Treasure/SilverKey', 'Treasure/LittleTreasureChest', 'Treasure/BigTreasureChest', 'Treasure/Coin2'];
for (const it of ITEMS) add(`Items/${it}.png`, `items/${it.split('/')[1].toLowerCase()}.png`);
for (const m of MUSIC) add(`Audio/Musics/${m}.ogg`, `music/${m.replace(/^\d+ - /, '').replace(/[^A-Za-z]+/g, '_').toLowerCase().replace(/_$/, '')}.ogg`);
const SFX = ['Menu/Move1', 'Menu/Accept', 'Menu/Accept3', 'Menu/Cancel', 'Menu/Menu6', 'Bonus/Coin', 'Bonus/Bonus',
  'Bonus/PowerUp1', 'Alert/Alert', 'Alert/Alert2', 'Magic & Skill/Heal', 'Magic & Skill/Spirit', 'Magic & Skill/Magic1',
  'Elemental/Water1', 'Elemental/Grass', 'Elemental/Bubble', 'Creature/Bird', 'Creature/Dog', 'Creature/Duck',
  'Hit & Impact/Impact', 'Hit & Impact/Hit1', 'Jump & Bounce/Jump', 'Whoosh & Slash/Whoosh',
  'Voice/Voice1', 'Voice/Voice2', 'Voice/Voice3', 'Voice/Voice5'];
for (const s of SFX) add(`Audio/Sounds/${s}.wav`, `sfx/${s.split('/')[1].toLowerCase()}.wav`);
for (const j of ['Success1', 'Success3', 'Secret1', 'Secret2', 'LevelUp2']) add(`Audio/Jingles/${j}.wav`, `sfx/jingle_${j.toLowerCase()}.wav`);
add('LICENSE.txt', 'LICENSE-ninja-adventure.txt');
const K = BASE + 'kenney-rpg-audio/';
for (const s of ['footstep00', 'footstep01', 'footstep02', 'footstep03', 'doorOpen_1', 'doorClose_1', 'handleCoins',
  'bookFlip1', 'metalLatch', 'creak1', 'cloth1', 'dropLeather'])
  files.push({ url: `${K}audio/Audio/${s}.ogg`, dest: `sfx/k_${s.toLowerCase()}.ogg`, optional: true });

async function exists(p) { try { await access(p); return true; } catch { return false; } }

let ok = 0, fail = 0;
const queue = [...files];
async function worker() {
  while (queue.length) {
    const f = queue.shift();
    const out = join(ROOT, 'public/assets', f.dest);
    if (await exists(out)) { ok++; continue; }
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 200 && buf.toString().includes('oid sha256')) throw new Error('LFS pointer');
        await mkdir(dirname(out), { recursive: true });
        await writeFile(out, buf);
        ok++;
        break;
      } catch (e) {
        if (attempt === 2) { fail++; console.warn(`${f.optional ? 'skip' : 'FAIL'} ${f.dest}: ${e.message}`); }
      }
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`assets: ${ok} ok, ${fail} failed`);
