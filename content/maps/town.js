// Puddlewick. Coordinates are tiles (16 px). Terrain paint uses the vertex grid (see MapBuilder).
import { T, rng } from '../../src/systems/MapBuilder.js';

export default {
  id: 'town',
  name: 'Puddlewick',
  w: 56, h: 42, seed: 11,
  music: { day: 'village', night: 'quiet' },
  tufts: 0.08,

  paint(p) {
    // The Tamble river runs east into the sea.
    p.rect(T.WATER, 0, 8, 57, 3);
    const r = rng(42);
    for (let x = -2; x < 58; x += 3) {
      p.blob(T.WATER, x + r() * 2, 7.2 + r() * 1.2, 2.5 + r() * 1.5, 1.6 + r() * 1.0, 0.2, x + 1);
      p.blob(T.WATER, x + 1 + r() * 2, 10.2 + r() * 1.2, 2.5 + r() * 1.5, 1.6 + r() * 1.0, 0.2, x + 7);
    }
    p.blob(T.WATER, 12, 9.5, 5, 2.6, 0.3, 3);
    p.blob(T.WATER, 41, 9.5, 6, 2.5, 0.3, 5);
    p.rect(T.WATER, 48, 7, 9, 36);
    p.blob(T.WATER, 47, 33, 3, 6, 0.4, 9);
    for (let y = 12; y < 44; y += 3) p.blob(T.WATER, 47.2 + r() * 1.6, y + r() * 2, 1.6 + r() * 1.4, 2 + r(), 0.2, y);
    // Paths: bridge to plaza, plaza to inn, workshop, cottage, yard, dock.
    p.blob(T.DIRT, 27.5, 23.5, 5.2, 3, 0.2, 4);
    p.path(T.DIRT, [[27, 12], [27, 22]]);
    p.path(T.DIRT, [[27, 24], [8, 24], [8, 18]]);
    p.path(T.DIRT, [[28, 24], [39, 24], [39, 18]]);
    p.path(T.DIRT, [[27, 25], [27, 36], [25, 36]]);
    p.path(T.DIRT, [[8, 24], [8, 33]]);
    p.path(T.DIRT, [[39, 24], [46, 24]]);
    p.path(T.DIRT, [[33, 24], [33, 29], [36, 29], [36, 33]]);
    p.path(T.DIRT, [[14, 24], [14, 29]]);
    p.path(T.DIRT, [[27, 5], [27, 0]]);
    p.path(T.DIRT, [[40, 29], [43, 29], [43, 26]]);
  },

  planks(state) {
    const collapsed = state.has('span_collapsed') && !state.has('span_rebuilt');
    const fixed = state.has('bridge_fixed') && !collapsed;
    const bridge = fixed
      ? [{ x: 27, y: 5, w: 2, h: 8, tint: state.has('bridge_flimsy') && !state.has('span_rebuilt') ? 0xb09a88 : undefined }]
      : [{ x: 27, y: 5, w: 2, h: 3, broken: [[0, 2], [1, 2]] }, { x: 27, y: 11, w: 2, h: 2, broken: [[0, 0], [1, 0]] }];
    return [...bridge, { x: 45, y: 24, w: 8, h: 2, tint: 0xe2c0a0 }];
  },

  props(state) {
    const P = [
      // north forest edge
      ['pines', 0, 0], ['bigtree', 4, 0], ['tree', 9, 1], ['pine', 12, 0], ['bigtree_lime', 14, 0], ['tree_round', 19, 1],
      ['pine', 21, 0], ['tree', 23, 2], ['pine', 30, 1], ['bigtree', 32, 0], ['tree_lime', 36, 1], ['pines', 38, 0],
      ['tree', 43, 1], ['pine', 45, 0], ['bigtree_lime', 47, 0], ['tree_round', 52, 1], ['pine', 54, 0],
      ['bush', 25, 4], ['bush_round', 30, 4], ['rock', 24, 3], ['signpost', 29, 3, { id: 'signpost_meadow' }],
      // west border
      ['pine', 0, 13], ['tree', 0, 16], ['oak', 0, 26], ['pine', 0, 30], ['tree', 1, 34], ['pines', 0, 37],
      // south border
      ['bigtree', 4, 39], ['tree', 9, 39], ['oak_pink', 12, 38], ['pine', 16, 39], ['tree_round', 19, 39], ['bigtree_lime', 30, 39],
      ['tree', 35, 40], ['pine', 38, 39], ['tree_pink', 41, 40], ['tree', 21, 40],
      // the inn (west)
      ['inn', 6, 13, { id: 'inn', examine: 'inn_sign', enter: 'inn_in' }],
      ['barrel', 10, 15], ['crates', 11, 16, { id: 'crates', dialogue: 'crates' }], ['crate', 12, 16], ['barrel_open', 5, 16],
      ['lamp', 10, 17, { examine: 'lamp_post' }], ['table_long', 11, 19, { id: 'bench', examine: 'bench' }],
      // garden
      ['fence_h', 1, 20], ['fence_h', 1, 26], ['bush_round', 5, 20], ['tree_pink', 2, 22, { examine: 'flowerbed' }],
      // Sella's workshop (east)
      ['house_red', 38, 15, { id: 'workshop', examine: 'workshop_window', enter: 'workshop_in' }], ['lamp', 42, 17, { examine: 'lamp_post' }],
      ['goods_crates', 42, 15], ['pot', 37, 17],
      // plaza
      ['well', 32, 25, { id: 'well', examine: 'well' }], ['signpost', 24, 21, { id: 'notice_board', examine: 'notice_board' }], ['statue', 30, 20, { examine: 'statue' }],
      ['lamp', 22, 21, { examine: 'lamp_post' }], ['lamp', 33, 21, { examine: 'lamp_post' }], ['tree_round', 20, 26], ['tree_round', 34, 26],
      ['bush', 23, 20], ['bush', 32, 20],
      // Coral's stall
      ['tent', 18, 19, { id: 'stall_tent', examine: 'barrels' }], ['market_goods', 17, 21, { id: 'stall_goods', examine: 'barrels', solid: 1 }],
      ['barrels', 14, 19, { examine: 'barrels' }],
      // Nettie's and Hobb's houses
      ['hut', 13, 26, { enter: 'nettie_in' }], ['signpost', 17, 29, { examine: 'mailbox' }],
      ['house_orange2', 3, 28, { enter: 'hobb_in' }], ['crates2', 10, 30], ['planks_long', 3, 33],
      ['planks', 10, 33], ['stump', 5, 35], ['cart', 9, 35],
      // Gil's house near the dock
      ['house_wood', 41, 26, { enter: 'gil_in' }], ['barrel', 44, 27], ['pot', 40, 28],
      // Nan Wren's cottage (south)
      ['house_round', 24, 33, { id: 'wren_house', enter: 'wren_in' }], ['bush_round', 23, 35], ['berrybush', 28, 33],
      // shrine
      ['statue_orb', 35, 29, { id: 'shrine', examine: 'shrine' }], ['stone_lantern', 34, 30, { examine: 'shrine' }], ['stone_lantern', 38, 30, { examine: 'shrine' }],
      ['torii', 35, 32, { examine: 'shrine' }], ['oak_pink', 30, 30], ['oak_pink', 39, 30],
      // east coast and beach
      ['boulder', 43, 37],
      ['tree_round', 23, 29], ['tree', 16, 33], ['oak_autumn', 12, 12], ['tree', 36, 12],
      // more homes
      ['house_green', 16, 14], ['shop_blue', 22, 14, { examine: 'notice_board' }], ['house_orange2', 31, 14],
      ['house_wood', 44, 19], ['house_red', 18, 29], ['barrel', 21, 32], ['lamp', 25, 17, { examine: 'lamp_post' }],
      ['bush', 16, 36], ['tree_lime', 2, 36], ['boulder_grey', 7, 37],
      ['tree_pink', 14, 21], ['bush_round', 36, 21], ['tree', 43, 13], ['bush', 30, 17], ['banner_red', 26, 20], ['banner_green', 30, 20],
      ['berrybush_orange', 42, 35], ['tree_round', 38, 36],
      ['field', 30, 36, { examine: 'haystack' }], ['sprout', 31, 37], ['sprout', 30, 38], ['sprout', 32, 37], ['scarecrow', 34, 37, { examine: 'haystack' }], ['sign_fruit', 16, 22, { examine: 'barrels' }],
    ];
    if (state.has('stall_fixed')) P.push(['lamp', 21, 19, { examine: 'lamp_post' }]);
    if (state.has('garden_bloom')) P.push(['berrybush_orange', 5, 23]);
    return P;
  },

  flowerbeds(state) {
    return [
      { x: 1, y: 21, w: 7, h: 5, density: state.has('garden_bloom') ? 0.8 : 0.35 },
      { x: 34, y: 34, w: 6, h: 2, density: 0.4 },
      { x: 23, y: 5, w: 3, h: 1, density: 0.5 },
      { x: 30, y: 5, w: 3, h: 1, density: 0.5 },
    ];
  },

  walls(state) {
    const W = [[0, 0, 56, 1], [0, 41, 56, 1], [0, 0, 1, 42], [55, 0, 1, 42]];
    if (!state.has('bridge_fixed') || (state.has('span_collapsed') && !state.has('span_rebuilt'))) W.push([27, 7, 2, 4]);
    return W;
  },
  open() { return [[26, 0, 4, 1]]; },

  // Named spots used by NPC spawns and warps.
  spots: {
    start: [27, 27], plaza: [25, 24], inn_door: [7, 18], inn_porch: [11, 18], workshop: [41, 19], yard: [8, 32],
    stall: [20, 22], dock: [49, 24], dock_end: [52, 24], shrine: [36, 34], wren_porch: [27, 36], bridge_south: [29, 13],
    bridge_mid: [27, 12], bridge_north: [27, 4], garden: [5, 24], beach: [43, 32],
  },

  // Interactive tiles with no sprite (or extra hotspots).
  objects(state) {
    return [
      { x: 27, y: 7, w: 2, h: 5, dialogue: 'bridge_break' },
      { x: 24, y: 21, dialogue: 'decree', if: { flag: 'ch1' } },
      { x: 50, y: 26, w: 3, h: 3, examine: 'boat' },
      { x: 43, y: 28, examine: 'fishnet' },
    ];
  },

  decals: [
    { key: 'boat', x: 48, y: 27.2 },
    { key: 'fishnet', x: 43, y: 28.5 },
  ],

  animals: [['cat', 11, 21], ['dog', 45, 23], ['cat', 29, 37]],

  warps: [
    { x: 26, y: 0, w: 4, h: 1, to: 'meadow', spot: 'meadow_gate', dir: 'up' },
    // Gil's boat, once the Span has fallen and he agreed to row you
    { x: 52, y: 24, w: 1, h: 2, to: 'meadow', spot: 'ferry_landing', msg: 'Gil rows you across the Tamble.', if: { all: [{ flag: 'span_collapsed' }, { notFlag: 'span_rebuilt' }, { flag: 'ferried' }] } },
  ],
};
