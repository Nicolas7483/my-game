// Tamblemeadow, across Tamsy's Span.
import { T } from '../../src/systems/MapBuilder.js';

export default {
  id: 'meadow',
  name: 'Tamblemeadow',
  w: 44, h: 32, seed: 23,
  music: { day: 'sunny', night: 'dream' },
  tufts: 0.12,

  paint(p) {
    p.blob(T.WATER, 33, 10, 5.5, 4, 0.35, 2);
    p.blob(T.WATER, 37, 16, 3, 2.5, 0.3, 8);
    p.path(T.DIRT, [[21, 32], [21, 22], [15, 22], [15, 12], [20, 12]]);
    p.path(T.DIRT, [[21, 22], [27, 22], [27, 14]]);
    p.blob(T.DIRT, 20.5, 9, 4, 3, 0.25, 5);
    p.path(T.DIRT, [[15, 18], [8, 18], [8, 12]]);
  },

  planks() { return [{ x: 21, y: 29, w: 2, h: 3 }]; },

  props(state) {
    const P = [
      // borders
      ['pines', 0, 0], ['bigtree_lime', 4, 0], ['pine', 8, 0], ['bigtree', 10, 0], ['tree_round', 15, 0], ['pine', 17, 1],
      ['bigtree_yellow', 24, 0], ['pines', 28, 0], ['tree', 33, 0], ['bigtree', 36, 0], ['pine', 41, 0],
      ['pine', 0, 5], ['tree', 0, 9], ['bigtree', 0, 13], ['pine', 0, 18], ['tree_round', 0, 21], ['pines', 0, 25],
      ['pine', 42, 5], ['tree', 42, 20], ['pines', 40, 25], ['bigtree_lime', 38, 21], ['pine', 42, 13],
      ['bigtree', 4, 29], ['tree', 9, 29], ['pine', 13, 29], ['oak', 17, 28], ['oak_pink', 24, 28], ['tree', 28, 29], ['pines', 31, 28], ['tree_lime', 36, 29],
      // landmarks
      ['oak_autumn', 5, 5, { id: 'old_oak', examine: 'old_oak' }],
      ['boulder', 29, 13, { examine: 'pond_stone' }], ['rock', 30, 6], ['boulder_grey', 38, 7],
      ['grave', 11, 17, { examine: 'grave_marker' }], ['cross', 12, 16, { examine: 'grave_marker' }],
      ['signpost', 23, 25, { id: 'signpost_meadow', examine: 'signpost_meadow' }],
      ['stone_lantern', 17, 7, { examine: 'shrine' }], ['stone_lantern', 24, 7, { examine: 'shrine' }],
      ['berrybush', 33, 19], ['berrybush_orange', 13, 24], ['bush', 25, 17], ['bush_round', 18, 16], ['bush', 30, 24],
      ['tree_pink', 11, 9], ['tree', 34, 23], ['tree_willow', 25, 11], ['stump', 6, 22], ['log', 9, 24],
      ['bigtree_pink', 4, 11], ['tree_round', 36, 3],
    ];
    return P;
  },

  flowerbeds(state) {
    return [
      { x: 16, y: 3, w: 10, h: 3, density: 0.5 },
      { x: 28, y: 18, w: 8, h: 5, density: state.has('meadow_replanted') ? 0.8 : 0.35 },
      { x: 3, y: 15, w: 5, h: 4, density: 0.4 },
    ];
  },

  walls() { return [[0, 0, 44, 1], [0, 31, 44, 1], [0, 0, 1, 32], [43, 0, 1, 32]]; },
  open() { return [[21, 31, 2, 1]]; },

  spots: {
    meadow_gate: [21, 27], pond: [28, 12], reeds: [29, 16], clearing: [21, 8], dimspot: [8, 20], old_oak: [7, 9],
    flowers: [31, 20], start: [21, 27],
  },

  objects() {
    return [
      { x: 30, y: 15, w: 3, h: 2, dialogue: 'reeds' },
      { x: 7, y: 19, w: 3, h: 3, dialogue: 'dimspot' },
    ];
  },

  decals: [{ key: 'reeds', x: 30, y: 15 }, { key: 'reeds', x: 32, y: 15.5 }],
  dimspot: { x: 8.5, y: 20.5, r: 3 },

  animals: [['frog', 31, 17], ['frog', 26, 14]],

  warps: [{ x: 21, y: 31, w: 2, h: 1, to: 'town', spot: 'bridge_north', dir: 'down' }],
};
