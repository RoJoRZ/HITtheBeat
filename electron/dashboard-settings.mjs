import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { LocalizedError } from './i18n.mjs';
/** @typedef {{period:'week'|'month'|'year'|'all',tempo:'min'|'max'|'average'}} DashboardSettings */
/** @param {unknown} value @returns {value is DashboardSettings} */
export function isDashboardSettings(value) {
  if (!value || typeof value !== 'object') return false;
  const v = /** @type {Record<string,unknown>} */ (value);
  return typeof v.period === 'string' && typeof v.tempo === 'string' && ['week','month','year','all'].includes(v.period) && ['min','max','average'].includes(v.tempo) && Object.keys(v).every(key => ['period','tempo'].includes(key));
}
/** @param {string} directory */
export async function dashboardSettings(directory) {
  const file = path.join(directory, 'dashboard-preferences.json');
  /** @type {DashboardSettings} */
  let current = { period: 'all', tempo: 'min' };
  try { const saved = JSON.parse(await readFile(file, 'utf8')); if (isDashboardSettings(saved)) current = saved; } catch {}
  let queue = Promise.resolve();
  return { get: () => ({ ...current }),
    /** @param {unknown} value */
    async set(value) {
      if (!isDashboardSettings(value)) throw new LocalizedError('Ongeldige dashboardinstellingen.');
      const next = { ...value };
      const operation = queue.then(async () => {
        const temp = path.join(directory, `.dashboard-${randomUUID()}.tmp`);
        try { await writeFile(temp, JSON.stringify(next), { flag: 'wx', mode: 0o600 }); await rename(temp, file); current = next; return { ...current }; }
        catch { throw new LocalizedError('De dashboardinstellingen konden niet worden opgeslagen. Probeer opnieuw.'); }
        finally { await rm(temp, { force: true }).catch(() => {}); }
      });
      queue = operation.then(() => {}, () => {}); return operation;
    }
  };
}
