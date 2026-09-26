# Content spec (for writers and designers)

All story content lives in `content/story.js` as plain JavaScript data. The engine reads it; no code is needed.

## Canon (merged by the orchestrator)
- World: **Candlemere**. Magic: **glims**, motes of light left by every kept promise, kept in glass lanterns called **wicks**. Broken promises leave grey **Dimspots**.
- Village: **Puddlewick**, a stilted harbor where the **Tamble** river meets the sea. Makes lantern glass, glowing floats, plum cakes.
- Across the river: **Tamblemeadow**, reached by **Tamsy's Span**, the bridge that "broke in a storm" (it was sabotaged).
- Hero: **Tavi**, a river foundling whose lantern never goes out (it hums near the villain's magic).
- Romance: **Sella**, lanternwright's apprentice. Proud, witty, wants to light the meadow at night. Affinity var `aff_sella` (0 to 5).
- Villain: **Umbra, the Hushwarden**. Wants to seal every glim in one lamp so no promise can ever break again (and no night can fall). Motif: grey moths, violet flame. In the prologue he appears first as a **hooded stranger** at the inn asking for food, then at the end reveals himself as the **Lantern Inspector**.
- Mystery: the village wicks are going out one by one, and each dimmed wick steals a memory of someone loved.

## Maps and named spots (use these ids for NPC spawns)
Town `town` (Puddlewick): `plaza` (well in center), `inn_door` (Marla's inn, west), `inn_porch`, `workshop` (Sella's lantern workshop, east), `yard` (Hobb's carpentry yard, southwest, log piles), `stall` (Coral's market stall, next to plaza), `dock` (east pier over the sea, Gil fishes here), `dock_end`, `shrine` (lantern shrine, south east), `wren_porch` (Nan Wren's cottage porch, south), `bridge_south` (south end of Tamsy's Span, guard post), `bridge_mid` (the break), `garden` (flower garden, west), `beach` (sandy shore, south east).
Meadow `meadow` (Tamblemeadow, north across the bridge): `meadow_gate` (north end of bridge), `pond`, `reeds`, `clearing` (wisp), `dimspot` (grey patch), `old_oak`, `flowers`.

## Items (ids)
`plank` (Good Plank), `oldplank` (Rotten Plank), `bobber` (Lucky Bobber), `shard` (Odd Glass Shard), `plumcake` (Plum Cake), `jar` (Empty Jar), `starjar` (Jar of Starlight), `wisp` (the wisp, only if befriended), `lantern` (Tavi's Lantern, key item), `coin` is gold (use the `gold` effect instead).

## Dialogue format
```js
DIALOGUES.marla = {
  entries: [ { if: { flag: 'bridge_fixed' }, node: 'after' }, { node: 'start' } ], // first match wins
  nodes: {
    start: { text: 'Short line, max 100 characters.', next: 'n2' },
    n2: { text: 'Another line.', choices: [
      { text: 'Kind option (max 34 chars)', tone: 'kind', effects: [ { addVar: ['aff_sella', 1] } ], next: 'yes' },
      { text: 'Sly option', tone: 'sly', if: { item: 'plank' }, next: 'no' },
      { text: 'Leave', next: null },
    ] },
    yes: { speaker: 'Sella', face: 'woman', text: 'Speaker/face override for a line.', effects: [ { setFlag: 'x' } ] },
  },
};
```
- `speaker`/`face` default to the NPC talking. Use `speaker: 'Tavi'` for hero lines (sparingly), `speaker: ''` for narration.
- A node without `next`/`choices` ends the conversation.
- `tone`: `kind` | `bold` | `sly` (shown as a small colored mark).

### Conditions (`if`)
`{ flag: 'x' }`, `{ notFlag: 'x' }`, `{ var: 'aff_sella', gte: 2 }` (`gte`, `lte`, `eq`), `{ item: 'plank', n: 3 }`, `{ noItem: 'shard' }`, `{ gold: 10 }`, `{ time: 'night' }` / `'day'`, `{ quest: 'span', stage: 2 }` (stage >=), `{ all: [ ... ] }`, `{ any: [ ... ] }`, `{ not: {...} }`.

### Effects
`{ setFlag: 'x' }`, `{ clearFlag: 'x' }`, `{ addVar: ['name', n] }`, `{ setVar: ['name', n] }`, `{ giveItem: 'id', n: 1 }`, `{ takeItem: 'id', n: 1 }`, `{ gold: n }` (negative to pay), `{ quest: ['id', stage] }` (stage 0 starts, higher advances, -1 completes), `{ toast: 'Sella will remember that.', icon: 'heart' }` (icons: heart, heartbreak, star, item, gold, moth, quest), `{ sfx: 'jingle' }`, `{ emote: ['npcId', 'heart'] }` (heart, surprise, angry, sad, happy, dots, music), `{ fade: 'night' }` (skip to night) / `{ fade: 'day' }`, `{ ending: 'prologue' }` (plays the end card), `{ autosave: true }`.
Every choice that matters must produce a **visible** signal: a toast, an emote, an item, or a world change (flag used by the map).

## World-change flags the map already reacts to
- `bridge_fixed`: the bridge planks appear and the meadow opens. `bridge_flimsy`: the bridge is patched with rotten planks (visibly darker, creaks).
- `stall_fixed`: Coral's stall gets its lantern back (lights at night).
- `wisp_friend`: a small wisp follows Tavi everywhere. `wisp_bottled`: the jar glows in the hotbar.
- `garden_bloom`: flowers bloom in the garden.
- `inspector_here`: Umbra stands in the plaza.
- `wicks_relit`: all village lanterns glow at night.

## Other data
- `NPCS`: `{ id, name, sprite, face, spawns: [ { if, map, spot, dx, dy, wander: 2 } ], dialogue: 'id' }` (first spawn whose `if` passes is used; no spawn = absent).
- `QUESTS`: `{ id: { title, stages: [ 'objective for stage 0 (max 40 chars)', ... ] } }`.
- `EXAMINE`: `{ objectId: [ 'line', 'line' ] }` for landmark objects (well, inn_sign, shrine, boat, crates, workshop_window, notice_board, statue, mill, ...), max 90 chars each, 2 to 3 lines, cycled.
- `INTRO`: 3 to 4 short narration lines shown when a new game starts.
- `ENDING`: 3 to 5 short lines for the prologue end card, with variants keyed by flags.
