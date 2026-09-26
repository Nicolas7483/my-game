import { SAVE_VERSION } from './State.js';

const KEY = 'lanternfall.save.';
const SETTINGS = 'lanternfall.settings';
export const SLOTS = ['auto', '1', '2', '3'];

// Old saves are upgraded step by step (migrations[v] turns version v into v + 1).
const migrations = {};

function migrate(data) {
  let d = data;
  while (d.v < SAVE_VERSION && migrations[d.v]) d = migrations[d.v](d);
  return d;
}

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }

export function writeSlot(slot, state) {
  const data = { ...state.toJSON(), savedAt: Date.now() };
  return safeSet(KEY + slot, JSON.stringify(data));
}

export function readSlot(slot) {
  const raw = safeGet(KEY + slot);
  if (!raw) return null;
  try { return migrate(JSON.parse(raw)); } catch { return null; }
}

export function slotSummary(slot) {
  const d = readSlot(slot);
  if (!d) return null;
  const mins = Math.floor((d.playtime || 0) / 60);
  return { map: d.map, when: new Date(d.savedAt || 0), playtime: `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`, gold: d.gold };
}

export function latestSlot() {
  let best = null;
  for (const s of SLOTS) {
    const d = readSlot(s);
    if (d && (!best || (d.savedAt || 0) > best.t)) best = { slot: s, t: d.savedAt || 0 };
  }
  return best?.slot ?? null;
}

// Export code: base64 JSON plus a short checksum, so a typo never loads garbage.
function checksum(str) { let h = 7; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h.toString(36); }

export function exportCode(state) {
  const json = JSON.stringify(state.toJSON());
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `LF1.${checksum(b64)}.${b64}`;
}

export function importCode(code) {
  const parts = String(code).trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'LF1' || checksum(parts[2]) !== parts[1]) return null;
  try { return migrate(JSON.parse(decodeURIComponent(escape(atob(parts[2]))))); } catch { return null; }
}

export function loadSettings() {
  try { return { music: 0.35, sfx: 0.5, muted: false, ...JSON.parse(safeGet(SETTINGS) || '{}') }; } catch { return { music: 0.35, sfx: 0.5, muted: false }; }
}
export function saveSettings(s) { safeSet(SETTINGS, JSON.stringify(s)); }
