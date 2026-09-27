import Phaser from 'phaser';
import { WIDTH, HEIGHT } from './config.js';
import Preload from './scenes/Preload.js';
import Title from './scenes/Title.js';
import World from './scenes/World.js';
import HUD from './scenes/HUD.js';
import Dialogue from './scenes/Dialogue.js';
import Menu from './scenes/Menu.js';
import Ending from './scenes/Ending.js';
import Battle from './scenes/Battle.js';
import ChapterCard from './scenes/ChapterCard.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#0d0f1c',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.CENTER_BOTH },
  audio: { disableWebAudio: false },
  input: { gamepad: false },
  scene: [Preload, Title, World, HUD, Dialogue, Menu, Ending, Battle, ChapterCard],
});

// Integer zoom keeps every pixel square. Below 2x we allow fractional zoom so small screens still fit.
function fit() {
  const s = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  const zoom = s >= 2 ? Math.floor(s) : Math.max(0.5, s);
  game.scale.setZoom(zoom);
}
window.addEventListener('resize', fit);
game.events.once('ready', fit);
fit();

window.__game = game;
