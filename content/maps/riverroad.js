// The River Road, east of Tamblemeadow (Chapter 1). The Tamble runs north to south; the ford crosses it.
import { T, rng } from '../../src/systems/MapBuilder.js';

export default {
  id: 'riverroad',
  name: 'The River Road',
  w: 48, h: 30, seed: 31,
  music: { day: 'road', night: 'quiet' },
  tufts: 0.1,

  paint(p) {
    const r = rng(77);
    p.rect(T.WATER, 26, 0, 5, 31);
    for (let y = -2; y < 32; y += 3) {
      p.blob(T.WATER, 26 + r() * 1.2, y + r() * 2, 1.8 + r(), 2 + r(), 0.2, y + 3);
      p.blob(T.WATER, 30.5 + r() * 1.2, y + 1 + r() * 2, 1.8 + r(), 2 + r(), 0.2, y + 9);
    }
    p.path(T.DIRT, [[0, 15], [25, 15]]);
    p.path(T.DIRT, [[32, 15], [48, 15]]);
    p.path(T.DIRT, [[14, 15], [14, 10]]);
    p.path(T.DIRT, [[38, 15], [38, 10]]);
    p.path(T.DIRT, [[40, 15], [40, 21]]);
    p.blob(T.DIRT, 15, 9, 4, 2.5, 0.3, 4);
  },

  planks(state) {
    return [{ x: 25, y: 14, w: 8, h: 2, tint: state.has('ford_open') ? undefined : 0x9a8f86 }];
  },

  props(state) {
    const P = [
      // borders
      ['pines', 0, 0], ['bigtree', 4, 0], ['pine', 8, 1], ['tree', 20, 1], ['pine', 22, 0], ['bigtree_lime', 33, 0], ['pines', 43, 0],
      ['pine', 0, 20], ['tree', 3, 25], ['bigtree', 7, 26], ['pine', 12, 27], ['tree_round', 17, 26], ['pines', 20, 25],
      ['tree', 34, 26], ['pine', 38, 27], ['bigtree_lime', 43, 25], ['pine', 45, 20], ['tree', 46, 5],
      // Wickwarden camp
      ['tent_camp', 9, 5, { examine: 'camp_tent' }], ['tent_camp2', 17, 5, { examine: 'camp_tent' }], ['firepit', 14, 8, { examine: 'camp_fire' }],
      ['camp_pot', 11, 9, { examine: 'camp_fire' }], ['weapon_rack', 20, 8, { examine: 'camp_rack' }], ['big_barrel', 7, 9], ['log_bench', 13, 11], ['banner_red', 16, 8],
      ['lamp', 12, 13, { examine: 'lamp_post' }], ['cart', 4, 12, { examine: 'camp_wagon' }],
      // dead grove + nest
      ['tree_bare', 34, 4], ['tree_bare', 37, 3], ['tree_bare', 40, 4], ['tree_bare', 35, 7], ['tree_bare', 41, 7], ['tree_bare', 43, 9],
      ['stump', 33, 10], ['boulder_grey', 42, 11],
      // ruined shrine
      ['statue_monk', 39, 22, { id: 'shrine_old', dialogue: 'shrine_old', reach: { flag: 'ford_open' } }], ['stone_lantern', 37, 23, { examine: 'shrine' }], ['pillar', 42, 21],
      ['tent_ruined', 34, 19],
      // milestone and road east
      ['signpost', 44, 13, { id: 'milestone', dialogue: 'milestone', reach: { flag: 'ford_open' } }], ['boulder', 46, 16], ['tree', 46, 12],
      // scatter
      ['bush', 5, 18], ['bush_round', 21, 19], ['rock', 23, 11], ['berrybush', 9, 20], ['tree_pink', 18, 21], ['oak', 2, 4],
    ];
    return P;
  },

  flowerbeds() {
    return [{ x: 2, y: 17, w: 8, h: 4, density: 0.3 }, { x: 33, y: 17, w: 6, h: 2, density: 0.25 }];
  },

  walls(state) {
    const W = [[0, 0, 48, 1], [0, 29, 48, 1], [47, 0, 1, 30], [0, 0, 1, 30]];
    if (!state.has('ford_open')) W.push([25, 14, 1, 2], [32, 14, 1, 2]);
    return W;
  },
  open() { return [[0, 15, 1, 2]]; },

  spots: {
    road_west: [2, 15], camp: [15, 11], ford: [23, 15], nest: [38, 10], shrine_old: [39, 25], milestone: [44, 16], road_east: [45, 15], start: [2, 15],
  },

  objects() {
    return [{ x: 37, y: 6, w: 3, h: 3, dialogue: 'nest_entrance', reach: { flag: 'ford_open' } }];
  },

  dimspot: { x: 38.5, y: 6.5, r: 3 },

  roamers(state) {
    return [
      { id: 'rr_moths1', battle: 'road_moths', sprite: 'butterfly', x: 8, y: 17 },
      { id: 'rr_slimes', battle: 'road_slimes', sprite: 'slime', x: 20, y: 22, tint: 0xa8a8c0 },
      { id: 'rr_moths2', battle: 'road_moths', sprite: 'butterfly', x: 36, y: 13, if: { flag: 'ford_open' } },
      { id: 'rr_wicks', battle: 'road_lanterns', sprite: 'lanternred', x: 41, y: 19, tint: 0xb0a0c8, if: { flag: 'ford_open' } },
    ];
  },

  warps: [{ x: 0, y: 15, w: 1, h: 2, to: 'meadow', spot: 'meadow_east', dir: 'left' }],
};
