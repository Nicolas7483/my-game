# Lanternfall style guide

Base resolution 480x270, integer scaled. Grid 8px: every window x/y/w/h is a multiple of 8 (checked by `npm run qa`).

## Palette
- UI window: vertical gradient #2c3fa8 to #141c5a (94% alpha); border #f4f1e8 (2px); outline #0a0c20; inner bevel #9aa3c8; shadow #05060f at 35%, offset 2px.
- Text #ffffff, dim #aab4e8, selected #ffe9a8, gold #ffd35a, heart #ff5d73.
- Sky (multiply): day #ffffff, dusk #ffcf9a to #b08ab0, night #363f78.
- Lights: warm lamps #ffc478 (centre alpha at most 0.6), spirit #78dcff, shadow magic #9664e6.
- Minimap: grass #6fa84a, path #d9a066, water #4aa3d8, wood #b0703a, house #e0604a, tree #3d7a3a, landmark #f2d16b.

## Windows (one Window class only)
- Heights: 16 (name tags), 24 (toasts, slot rows), 32 (bars), 40+ in steps of 8.
- Widths: 88 (tags, shortcuts), 128 (status, minimap, quest), 144 (hotbar), 192 (toast), 216 (choices), 464 (dialogue).
- Padding 8px inside; 4px between slots; 8px between windows; 8px screen margin.
- HUD: status top-left; minimap and quest stacked top-right sharing x=344; toast top-centre; hotbar bottom-centre; shortcuts right of the hotbar.

## Type
- One bitmap font (Kenney Mini, baked 1-bit at 8px, line height 11). Never blurry canvas text.
- HUD labels are 1 to 3 words. Dialogue lines at most 100 characters; choices at most 34.
- Text sits inside windows. Over the world only with a 1px #0a0c20 shadow.

## Do / Don't
- Do snap to 8px, reuse 24x24 slots, use the same icon for the same thing everywhere.
- Do dim the world (#0a0c20 at 60%) behind full menus and hide the HUD.
- Do give every building a path to its door and every path an end worth reaching.
- Don't overlap props with roofs, coastline or each other: check with `node scripts/render-map.mjs town out.png`.
- Don't repeat one prop more than 3 times per screen; alternate tree species.
- Don't use pure white additive light.
