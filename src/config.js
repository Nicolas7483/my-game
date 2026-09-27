// Global constants. The whole game renders at 480x270 and is scaled up by whole numbers.
export const WIDTH = 480;
export const HEIGHT = 270;
export const TILE = 16;
export const GRID = 8; // every HUD rectangle snaps to this grid

export const FONT = 'pixel';
export const FONT_SIZE = 8; // baked bitmap font, native size
export const LINE = 11;

// One palette for all UI, so nothing looks improvised.
export const UI = {
  winTop: 0x2c3fa8,
  winBottom: 0x141c5a,
  border: 0xf4f1e8,
  outline: 0x0a0c20,
  shadow: 0x05060f,
  text: 0xffffff,
  dim: 0xaab4e8,
  gold: 0xffd35a,
  heart: 0xff5d73,
  kind: 0x7de0a2,
  bold: 0xff9d5c,
  sly: 0xc79bff,
  select: 0xffe9a8,
};

export const DEPTH = { ground: 0, terrain: 1, overlay: 2, deco: 3, world: 10, above: 100000, fx: 200000, night: 300000, light: 300001 };

export const SPEED = 78; // px per second
// Daytime (5:30 to 20:00) lasts about 18 real minutes; nights pass faster (about 5 minutes).
export const DAY_HOURS_PER_SEC = 14.5 / (18 * 60);
export const NIGHT_SPEEDUP = 2.2;
export const START_HOUR = 16.5; // the story starts in the golden afternoon

export const MUSIC_VOLUME = 0.35;
export const SFX_VOLUME = 0.5;

export const BASE = import.meta.env?.BASE_URL ?? '/';
