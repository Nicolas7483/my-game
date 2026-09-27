// Interiors. Each room sits at (0,0); the door gap in the bottom wall leads back outside.
const WOOD = [309, 310, 310, 310, 331, 332];

function room(id, name, w, h, wall, exitSpot, props, spots, extra = {}) {
  return {
    id, name, w, h, seed: w * h,
    music: extra.music ?? { day: 'calm', night: 'chill' },
    interior: { room: { x: 0, y: 0, w, h }, wall, floor: extra.floor ?? WOOD, exit: { map: 'town', spot: exitSpot }, door: extra.door },
    props: typeof props === 'function' ? props : () => props,
    spots,
    objects: extra.objects ?? (() => []),
  };
}

export const inn_in = room('inn_in', 'The Soggy Lantern Inn', 14, 10, 'brick', 'inn_in_front', [
  ['i_table', 2, 3, { examine: 'inn_counter' }], ['i_drawers', 5, 1, { id: 'violet_lantern_box', dialogue: 'violet_lantern_box' }],
  ['i_shelf', 1, 1], ['i_stove', 10, 1, { examine: 'inn_fire' }], ['i_stairs_up', 12, 1],
  ['i_bench', 7, 5, { examine: 'inn_table' }], ['i_stool', 6, 5], ['i_stool', 10, 5], ['i_bench', 2, 7], ['i_plant', 12, 6],
  ['i_rug', 5, 7], ['i_clock', 8, 1],
], { counter: [3, 2], table: [8, 6], fireplace: [10, 3], stairs: [12, 4], center: [7, 5] });

export const workshop_in = room('workshop_in', "Sella's Workshop", 12, 9, 'orange', 'workshop_in_front', [
  ['i_table', 2, 2, { examine: 'workshop_bench' }], ['i_cauldron', 7, 2, { examine: 'workshop_kiln' }], ['i_shelf', 9, 1, { examine: 'workshop_shelf' }],
  ['i_jars', 1, 5], ['i_bookcase', 6, 1], ['i_plant', 10, 5], ['i_rug_small', 5, 5], ['i_stool', 3, 3],
], { bench: [3, 4], kiln: [7, 4], shelf: [9, 4], center: [6, 5] });

export const wren_in = room('wren_in', "Nan Wren's Cottage", 10, 8, 'beige', 'wren_in_front', [
  ['i_bed_red', 1, 1, { examine: 'wren_bed' }], ['i_chair', 5, 3], ['i_stove', 8, 1, { examine: 'wren_hearth' }],
  ['i_rug_small', 4, 4], ['i_plant', 3, 1], ['i_clock', 6, 1],
], { bed: [2, 3], chair: [5, 4], hearth: [8, 3], center: [5, 5] });

export const hobb_in = room('hobb_in', "Hobb's House", 10, 8, 'orange', 'hobb_in_front', [
  ['i_bed', 1, 1], ['i_table', 5, 3, { examine: 'hobb_table' }], ['i_stool', 4, 3], ['i_bookcase2', 8, 1], ['i_jars', 5, 1],
], { center: [5, 5], table: [6, 4] });

export const gil_in = room('gil_in', "Gil's House", 10, 8, 'moss', 'gil_in_front', [
  ['i_bed_blue', 8, 1], ['i_table', 2, 3, { examine: 'gil_table' }], ['i_stool', 5, 3], ['i_drawers', 1, 1], ['i_plant', 5, 1],
], { center: [5, 5], table: [3, 4] });

export const nettie_in = room('nettie_in', "Nettie's Cottage", 10, 8, 'beige', 'nettie_in_front', [
  ['i_bed_double', 7, 1], ['i_couch', 1, 2, { examine: 'nettie_couch' }], ['i_dresser', 4, 1], ['i_rug', 3, 4], ['i_plant', 1, 5],
], { center: [5, 5], table: [2, 4] });

export const INTERIORS = { inn_in, workshop_in, wren_in, hobb_in, gil_in, nettie_in };
