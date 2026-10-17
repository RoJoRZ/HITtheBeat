import { LocalizedError } from './i18n.mjs';
/** @typedef {{id:string,name:string,start:number,end:number}} Fragment */
/** @typedef {{id?:string,name:string,start:number,end:number}} FragmentInput */
/** @param {FragmentInput} input @param {number} duration @returns {Fragment} */
export function validateFragment(input, duration) {
  if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 160 || input.name.includes('\0')) throw new LocalizedError("Geef het fragment een naam van maximaal 160 tekens.");
  if (input.id !== undefined && (typeof input.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(input.id))) throw new LocalizedError("Ongeldig fragment.");
  if (typeof input.start !== 'number' || typeof input.end !== 'number' || !Number.isFinite(input.start) || !Number.isFinite(input.end) || input.start < 0 || input.end > duration || input.end - input.start < .1 - 1e-9) throw new LocalizedError("Kies een fragment binnen de track, met A vóór B en minstens 0,1 seconde duur.");
  return { id: input.id ?? crypto.randomUUID(), name: input.name.trim(), start: input.start, end: input.end };
}
