// Interiors. Each room sits at (0,0); the door gap in the bottom wall leads back outside.
// Floors are 2x2 patterns laid by tile parity so the seams line up.
const WOOD = [309, 310, 331, 332];
const COBBLE = [298, 299, 320, 321];
const PARQUET = [0, 1, 22, 23];

function room(id, name, w, h, wall, exitSpot, props, spots, extra = {}) {
  return {
    id, name, w, h, seed: w * h,
    music: extra.music ?? { day: 'calm', night: 'chill' },
    interior: { room: { x: 0, y: 0, w, h }, wall, floor: extra.floor ?? WOOD, pattern: true, rugs: extra.rugs ?? [], exit: { map: 'town', spot: exitSpot }, door: extra.door },
    props: typeof props === 'function' ? props : () => props,
    spots,
    objects: extra.objects ?? (() => []),
  };
}

export const inn_in = room('inn_in', 'The Soggy Lantern Inn', 14, 10, 'brick', 'inn_in_front', [
  ['i_table', 2, 3, { examine: 'inn_counter' }], ['i_drawers', 5, 1, { id: 'violet_lantern_box', dialogue: 'violet_lantern_box' }],
  ['i_shelf', 1, 1], ['firepit', 9, 1, { examine: 'inn_fire' }], ['i_stairs_up', 12, 1, { rest: 'The spare room upstairs. You sleep like a sack of plums.' }], ['i_clock', 7, 1],
  ['i_bench', 8, 5, { examine: 'inn_table' }], ['i_stool', 7, 5], ['i_stool', 11, 5],
  ['i_bench', 2, 7, { examine: 'inn_table' }], ['i_stool', 1, 7], ['i_plant', 12, 7], ['barrel', 1, 5], ['i_jars', 8, 8],
], { counter: [3, 2], table: [9, 7], fireplace: [10, 3], stairs: [12, 4], center: [5, 6] }, { rugs: [{ x: 6, y: 4, w: 7, h: 3 }] });

export const workshop_in = room('workshop_in', "Sella's Workshop", 12, 9, 'orange', 'workshop_in_front', [
  ['i_table', 2, 2, { examine: 'workshop_bench' }], ['camp_pot', 7, 1, { examine: 'workshop_kiln' }], ['i_shelf', 9, 1, { examine: 'workshop_shelf' }],
  ['i_jars', 1, 6], ['i_bookcase', 5, 1], ['i_plant', 10, 6], ['i_stool', 3, 3], ['crate', 9, 5], ['barrel', 10, 5],
], { bench: [3, 4], kiln: [8, 4], shelf: [9, 4], center: [6, 5] }, { floor: COBBLE, rugs: [{ x: 4, y: 4, w: 4, h: 2 }] });

export const wren_in = room('wren_in', "Nan Wren's Cottage", 10, 8, 'beige', 'wren_in_front', [
  ['i_bed_red', 1, 1, { examine: 'wren_bed' }], ['i_chair', 5, 3], ['camp_pot', 7, 1, { examine: 'wren_hearth' }],
  ['i_plant', 3, 1], ['i_clock', 5, 1], ['i_drawers', 1, 5], ['i_plant', 8, 5],
], { bed: [2, 3], chair: [5, 4], hearth: [8, 4], center: [5, 5] }, { floor: PARQUET, rugs: [{ x: 3, y: 3, w: 4, h: 2 }] });

export const hobb_in = room('hobb_in', "Hobb's House", 10, 8, 'orange', 'hobb_in_front', [
  ['i_bed', 8, 1], ['i_drawers', 2, 1], ['i_shelf2', 5, 1], ['i_table', 2, 4, { examine: 'hobb_table' }], ['i_stool', 1, 4], ['i_stool', 5, 4],
  ['i_plant', 8, 5], ['crate', 1, 6],
], { center: [5, 5], table: [3, 5] }, { rugs: [{ x: 1, y: 3, w: 6, h: 3 }] });

export const gil_in = room('gil_in', "Gil's House", 10, 8, 'moss', 'gil_in_front', [
  ['i_bed_blue', 8, 1], ['i_bookcase', 3, 1], ['i_drawers', 1, 1], ['i_plant', 6, 1],
  ['i_table', 2, 4, { examine: 'gil_table' }], ['i_stool', 5, 4], ['barrel', 8, 5], ['crate', 1, 6],
], { center: [5, 5], table: [3, 5] }, { rugs: [{ x: 1, y: 3, w: 6, h: 3 }] });

export const nettie_in = room('nettie_in', "Nettie's Cottage", 10, 8, 'beige', 'nettie_in_front', [
  ['i_bed_double', 7, 1], ['i_couch', 1, 2, { examine: 'nettie_couch' }], ['i_dresser', 4, 1], ['i_plant', 1, 5], ['i_bookcase2', 6, 5], ['i_stool', 3, 5],
], { center: [5, 5], table: [2, 4] }, { floor: PARQUET, rugs: [{ x: 1, y: 3, w: 5, h: 2 }] });

export const INTERIORS = { inn_in, workshop_in, wren_in, hobb_in, gil_in, nettie_in };
