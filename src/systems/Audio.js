import { loadSettings, saveSettings } from './Save.js';
import { BASE } from '../config.js';

// Music tracks by id. Loaded on demand so the first load stays small.
export const MUSIC = {
  intro: 'music/intro.ogg',
  village: 'music/village.ogg',
  calm: 'music/calm_village.ogg',
  village2: 'music/village.ogg',
  adventure: 'music/adventure.ogg',
  sunny: 'music/sunny.ogg',
  quiet: 'music/quiet.ogg',
  chill: 'music/chill.ogg',
  dream: 'music/dream.ogg',
  tension: 'music/tension.ogg',
  story: 'music/story_short.ogg',
  sad: 'music/sad_theme.ogg',
  fight: 'music/fight.ogg',
  fight2: 'music/fight2.ogg',
  final_area: 'music/final_area.ogg',
  peaceful: 'music/peaceful.ogg',
  road: 'music/road.ogg',
  good_time: 'music/good_time.ogg',
};

export const SFX = {
  move: 'sfx/move1.wav', accept: 'sfx/accept.wav', confirm: 'sfx/accept3.wav', cancel: 'sfx/cancel.wav',
  menu: 'sfx/menu6.wav', coin: 'sfx/coin.wav', item: 'sfx/bonus.wav', quest: 'sfx/jingle_success1.wav',
  secret: 'sfx/jingle_secret2.wav', heart: 'sfx/jingle_success3.wav', heal: 'sfx/heal.wav', spirit: 'sfx/spirit.wav',
  magic: 'sfx/magic1.wav', splash: 'sfx/water1.wav', grass: 'sfx/grass.wav', bubble: 'sfx/bubble.wav',
  bird: 'sfx/bird.wav', bump: 'sfx/impact.wav', hit: 'sfx/hit1.wav', whoosh: 'sfx/whoosh.wav',
  alert: 'sfx/alert.wav', alert2: 'sfx/alert2.wav', jingle: 'sfx/jingle_success3.wav', levelup: 'sfx/jingle_levelup2.wav',
  voice1: 'sfx/voice1.wav', voice2: 'sfx/voice2.wav', voice3: 'sfx/voice3.wav', voice5: 'sfx/voice5.wav',
  step0: 'sfx/k_footstep00.ogg', step1: 'sfx/k_footstep01.ogg', step2: 'sfx/k_footstep02.ogg', step3: 'sfx/k_footstep03.ogg',
  hit2: 'sfx/hit2.wav', hit5: 'sfx/hit5.wav', slash: 'sfx/slash.wav', magic3: 'sfx/magic3.wav', heal2: 'sfx/heal2.wav',
  fireball: 'sfx/fireball.wav', bounce: 'sfx/bounce.wav', jingle_gameover: 'sfx/jingle_gameover.wav', levelup1: 'sfx/jingle_levelup1.wav',
  door: 'sfx/k_dooropen_1.ogg', coins: 'sfx/k_handlecoins.ogg', book: 'sfx/k_bookflip1.ogg', latch: 'sfx/k_metallatch.ogg',
  creak: 'sfx/k_creak1.ogg', cloth: 'sfx/k_cloth1.ogg', drop: 'sfx/k_dropleather.ogg',
};

// Crossfading music player + one-shot sounds. Survives scene changes (lives on the game).
export class AudioManager {
  constructor(game) {
    this.game = game;
    this.settings = loadSettings();
    this.current = null; this.currentId = null; this.pending = null;
  }
  get sound() { return this.game.sound; }
  musicVol() { return this.settings.muted ? 0 : this.settings.music; }
  sfxVol() { return this.settings.muted ? 0 : this.settings.sfx; }

  // Fades run on the game clock, so they finish even if the scene that started them closes.
  fade(snd, to, ms, then) {
    this.fades = (this.fades ?? []).filter(f => f.snd !== snd);
    this.fades.push({ snd, from: snd.volume, to, t: 0, ms, then });
    if (!this.ticking) {
      this.ticking = true;
      this.game.events.on('step', (_, dt) => {
        for (const f of [...this.fades]) {
          f.t = Math.min(f.ms, f.t + dt);
          const alive = f.snd && !f.snd.pendingRemove && f.snd.manager;
          if (alive) try { f.snd.setVolume(f.from + (f.to - f.from) * (f.t / f.ms)); } catch { /* destroyed */ }
          if (f.t >= f.ms || !alive) { this.fades.splice(this.fades.indexOf(f), 1); if (alive) f.then?.(); }
        }
      });
    }
  }

  play(id, scene) {
    if (!id || id === this.currentId) return;
    this.currentId = id;
    const key = 'm_' + id;
    const start = () => {
      if (this.currentId !== id) return;
      const old = this.current;
      const next = this.sound.add(key, { loop: true, volume: 0 });
      next.play();
      this.current = next;
      this.fade(next, this.musicVol(), 1200);
      if (old && old !== next) this.fade(old, 0, 900, () => old.destroy());
    };
    if (scene.cache.audio.exists(key)) start();
    else {
      scene.load.audio(key, BASE + 'assets/' + MUSIC[id]);
      scene.load.once('complete', start);
      scene.load.start();
    }
  }

  sfx(name, opts = {}) {
    if (!SFX[name] || this.sfxVol() <= 0) return;
    try { this.sound.play('s_' + name, { volume: this.sfxVol() * (opts.volume ?? 1), detune: opts.detune ?? 0, rate: opts.rate ?? 1 }); } catch { /* not loaded yet */ }
  }

  applyVolumes() {
    if (this.current) this.current.setVolume(this.musicVol());
    saveSettings(this.settings);
  }
  toggleMute() { this.settings.muted = !this.settings.muted; this.applyVolumes(); return this.settings.muted; }
}
