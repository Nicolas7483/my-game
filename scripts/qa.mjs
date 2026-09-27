// End-to-end QA: boots the real game in Chromium and plays it like a person would.
// usage: node scripts/qa.mjs [url] [outDir]
import { launch } from './browser.mjs';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:4173/my-game/?qa=1';
const out = process.argv[3] || 'qa/shots';
mkdirSync(out, { recursive: true });
const browser = await launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && !/GL Driver|GPU stall|tile size multiple/.test(m.text()))) errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
page.on('dialog', d => d.dismiss());

const results = [];
const ok = (name, pass, info = '') => { results.push({ name, pass, info }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? '  ' + info : ''}`); };
const wait = ms => page.waitForTimeout(ms);
const shot = name => page.screenshot({ path: `${out}/${name}.png` });
const press = async (key, times = 1, gap = 120) => { for (let i = 0; i < times; i++) { await page.keyboard.down(key); await wait(40); await page.keyboard.up(key); await wait(gap); } };
const hold = async (key, ms) => { await page.keyboard.down(key); await wait(ms); await page.keyboard.up(key); };
const ev = (fn, arg) => page.evaluate(fn, arg);
const worldReady = () => page.waitForFunction(() => window.__world?.player && window.__world.sys.isActive(), null, { timeout: 15000 });
const talkUntilDone = async (pick = 0, max = 120) => {
  for (let i = 0; i < max; i++) {
    const st = await ev(() => { const d = window.__game.scene.getScene('Dialogue'); return d.sys.isActive() ? { active: true, choices: d.choices?.length ?? 0, typing: d.typing } : { active: false }; });
    if (!st.active) return i;
    if (st.choices) { await press('ArrowDown', pick % st.choices); await press('Enter'); } else await press('Space', 1, 160);
  }
  return max;
};

// 1. Title
await page.goto(url);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => window.__title?.sys.isActive(), null, { timeout: 20000 });
await wait(800);
await shot('01-title');
ok('title screen loads', true);
await press('ArrowDown'); await press('ArrowUp');
const sel = await ev(() => window.__title.sel);
ok('title menu responds to arrows', sel === 0, `sel=${sel}`);
await press('Enter');
await worldReady();
await wait(1200);
await shot('02-intro');
const introActive = await ev(() => window.__game.scene.getScene('Dialogue').sys.isActive());
ok('intro narration plays', introActive);
await talkUntilDone();
await wait(400);
await shot('03-town-start');

// 2. Movement + collision
const x0 = await ev(() => window.__world.player.x);
await hold('ArrowRight', 700);
const x1 = await ev(() => window.__world.player.x);
ok('hero walks with arrow keys', x1 > x0 + 20, `${x0.toFixed(1)} -> ${x1.toFixed(1)}`);
await hold('d', 300);
const x2 = await ev(() => window.__world.player.x);
ok('hero walks with WASD', x2 > x1 + 5);
// push into the plaza statue (solid) from the south
await ev(() => { const w = window.__world; w.player.x = 31 * 16; w.player.y = 25 * 16 + 4; });
await hold('ArrowUp', 800);
const yWell = await ev(() => window.__world.player.y);
ok('solid props block the hero', yWell > 23 * 16 + 4, `y=${yWell.toFixed(1)}`);
// water blocks
await ev(() => { const w = window.__world; w.player.x = 20 * 16 + 8; w.player.y = 13 * 16 + 12; });
await hold('ArrowUp', 900);
const yRiver = await ev(() => window.__world.player.y);
ok('water blocks the hero', yRiver > 11 * 16, `y=${yRiver.toFixed(1)}`);

// 3. Talk to Old Fen and pick choices
const fenPos = await ev(() => { const n = window.__world.npcs.find(n => n.def.id === 'fen'); n.wander = 0; return [n.x, n.y]; });
await ev(([x, y]) => { const w = window.__world; w.player.x = x; w.player.y = y + 16; w.face(w.player, 'up'); }, fenPos);
await wait(200);
await press('Space');
await wait(600);
await shot('04-dialogue-fen');
const dlg = await ev(() => window.__game.scene.getScene('Dialogue').sys.isActive());
ok('talking to an NPC opens the dialogue box', dlg);
let guard = 0;
while (guard++ < 120) {
  const st = await ev(() => { const d = window.__game.scene.getScene('Dialogue'); return d.sys.isActive() ? { choices: d.choices?.length ?? 0 } : null; });
  if (!st) break;
  if (st.choices) { await wait(300); await shot('05-choices'); await press('Enter'); } else await press('Space', 1, 160);
}
const fen = await ev(() => ({ quests: window.__world.state.d.quests, gold: window.__world.state.d.gold, flags: [...window.__world.state.flags] }));
ok('dialogue choices change the game state', Object.keys(fen.quests).length > 0 || fen.flags.length > 0, JSON.stringify(fen).slice(0, 160));
await wait(2500);
await shot('06-after-fen-toasts');

// 4. Interact with an object (examine)
await ev(() => { const w = window.__world; w.player.x = 31 * 16; w.player.y = 25 * 16 + 4; });
await hold('ArrowUp', 500);
await press('Space'); await wait(500);
const exam = await ev(() => window.__game.scene.getScene('Dialogue').full);
ok('objects can be examined', !!exam, exam);
await talkUntilDone();

// 5. Menus
await press('Escape'); await wait(400);
ok('Esc opens the menu', await ev(() => window.__game.scene.getScene('Menu').sys.isActive()));
await shot('07-menu');
await press('ArrowDown'); await press('Enter'); await wait(300); await shot('08-party');
await press('ArrowLeft'); await press('ArrowDown'); await press('Enter'); await wait(300); await shot('08-journal');
await press('ArrowLeft'); await press('ArrowDown'); await press('Enter'); await wait(300); await shot('09-map');
await press('ArrowLeft'); await press('ArrowDown'); await press('Enter'); await press('Enter'); await wait(400);
const saved = await ev(() => !!localStorage.getItem('lanternfall.save.1'));
ok('saving to slot 1 works', saved);
await press('Escape'); await press('Escape'); await wait(300);
ok('menu closes with Esc', !(await ev(() => window.__game.scene.getScene('Menu').sys.isActive())));
await press('i'); await wait(300); await shot('10-bag'); await press('Escape'); await wait(300);
ok('one Esc closes a menu opened with I', !(await ev(() => window.__game.scene.getScene('Menu').sys.isActive())));

// 6. Night
await ev(() => { const w = window.__world; w.state.d.hour = 22; w.updateSky(); });
await wait(1500);
await shot('11-night');

// 7. Save / reload / continue
const before = await ev(() => ({ flags: [...window.__world.state.flags].sort().join(','), quests: JSON.stringify(window.__world.state.d.quests), map: window.__world.mapId }));
await ev(() => window.__world.autosave(true));
await page.reload();
await page.waitForFunction(() => window.__title?.sys.isActive(), null, { timeout: 20000 });
await wait(500);
const items = await ev(() => window.__title.items.map(i => i.label));
ok('Continue appears after saving', items[0] === 'Continue', items.join('/'));
await press('Enter');
await worldReady(); await wait(800);
const after = await ev(() => ({ flags: [...window.__world.state.flags].sort().join(','), quests: JSON.stringify(window.__world.state.d.quests), map: window.__world.mapId }));
ok('continue restores flags, quests and map', JSON.stringify(before) === JSON.stringify(after), JSON.stringify(after).slice(0, 120));

// 8. Meadow via the bridge (force the flag) and warp
await ev(() => { const w = window.__world; w.state.set('bridge_fixed'); w.state.d.hour = 12; });
await wait(1500);
await ev(() => { const w = window.__world; w.player.x = 27 * 16 + 8; w.player.y = 3 * 16; });
await hold('ArrowUp', 1500);
await page.waitForFunction(() => window.__world?.mapId === 'meadow' && window.__world.player, null, { timeout: 8000 }).catch(() => {});
await wait(1200);
ok('walking north over the fixed bridge reaches the meadow', await ev(() => window.__world.mapId === 'meadow'));
await shot('12-meadow');
await talkUntilDone();
const m0 = await ev(() => [window.__world.player.x, window.__world.player.y]);
await hold('ArrowUp', 600); await hold('ArrowLeft', 400);
const m1 = await ev(() => [window.__world.player.x, window.__world.player.y]);
ok('hero can still move after changing map', Math.hypot(m1[0] - m0[0], m1[1] - m0[1]) > 10, `${m0.map(Math.round)} -> ${m1.map(Math.round)}`);
ok('first meadow visit happens at nightfall', await ev(() => window.__world.state.isNight()));

// 9. HUD grid audit + performance
const grid = await ev(() => (window.__windows || []).filter(w => w.active && w.visible).map(w => [w.x, w.y, w.w, w.h]).filter(([x, y, w, h]) => x % 8 || y % 8 || w % 8 || h % 8));
ok('every visible window sits on the 8px grid', grid.length === 0, JSON.stringify(grid));
const fps = await ev(() => new Promise(r => { const s = []; const t = setInterval(() => s.push(window.__game.loop.actualFps), 250); setTimeout(() => { clearInterval(t); r(s.reduce((a, b) => a + b, 0) / s.length); }, 4000); }));
ok('frame rate (headless software GL, indicative)', fps > 30, `${fps.toFixed(1)} fps`);

ok('no console errors', errors.length === 0, errors.slice(0, 8).join(' | '));
await browser.close();
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
