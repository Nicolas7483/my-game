// Launches Chromium; prefers the preinstalled binary so no browser download is needed.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const CANDIDATES = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];
export function launch(opts = {}) {
  const executablePath = CANDIDATES.find(p => existsSync(p) && !p.endsWith('chromium'));
  return chromium.launch({ ...(executablePath ? { executablePath } : {}), ...opts });
}
