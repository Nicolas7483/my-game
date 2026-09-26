# Lanternfall: The Puddlewick Prologue

A cute top-down pixel RPG made with [Phaser 3](https://phaser.io). Early Final Fantasy feel, warm Dragon Quest Builders colours, and choices that change the world.

**Play:** https://nicolas7483.github.io/my-game/

## Controls
| Key | Action |
|---|---|
| Arrows / WASD | Walk (Shift to run) |
| Space / E / Enter | Talk, look, pick up, confirm |
| 1 to 5 | Use hotbar item |
| I / J / M | Bag / Journal / Map |
| Esc | Menu (save, load, settings) |
| N | Mute |

The game autosaves when you change area and after choices that matter. You can also save in 3 slots and copy a save code from the menu.

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # content checks + story simulator (plays the prologue thousands of times)
npm run build && npm run preview
npm run qa         # plays the built game in Chromium and takes screenshots (needs `npm run preview` running)
```

## How it is organised
- `content/story.js`: every line of dialogue, NPC, quest and ending (plain data, see `docs/content-spec.md`).
- `content/maps/*.js`: maps painted in code (paths, water, props); `src/systems/MapBuilder.js` autotiles them.
- `content/prefabs.js`: houses, trees and props cut from the tilesets.
- `src/scenes/`: Title, World, HUD, Dialogue, Menu, Ending.
- `docs/story-bible.md`: world, cast, chapter plan, consequences, endings.

## Credits
See [docs/CREDITS.md](docs/CREDITS.md). Art, music and most sounds: **Ninja Adventure** by Pixel-boy & AAA (CC0). Extra sounds: **Kenney** (CC0).
