// Quick boot test: loads the game, starts a new game, takes screenshots, reports console errors.
import { launch } from './browser.mjs';
const url = process.argv[2] || 'http://localhost:5173/?qa=1';
const out = process.argv[3] || 'qa/shots';
import { mkdirSync } from 'node:fs';
mkdirSync(out, { recursive: true });
const browser = await launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
await page.goto(url);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/01-title.png` });
await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowUp');
await page.keyboard.press('Enter');
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/02-intro.png` });
for (let i = 0; i < 5; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(400); }
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/03-town.png` });
console.log(errors.slice(0, 30).join('\n') || 'no console errors');
await browser.close();
