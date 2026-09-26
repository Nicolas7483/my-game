import { State, newState } from './State.js';
import { bus } from './bus.js';

// Starts (or restarts) a playthrough from save data, from any scene.
export function startGame(scene, data, opts = {}) {
  const state = new State(data ?? newState());
  scene.registry.set('state', state);
  const mgr = scene.scene;
  for (const key of ['Dialogue', 'Menu', 'Ending', 'HUD', 'World', 'Title']) if (key !== scene.scene.key && mgr.isActive(key)) mgr.stop(key);
  bus.removeAllListeners();
  mgr.start('World', { map: state.d.map, intro: opts.intro });
  if (scene.scene.key !== 'World') mgr.stop();
}
