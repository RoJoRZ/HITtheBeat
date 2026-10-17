/** Presentation only: never use this to replace stored source or snapshot values.
 * @param {number} value
 */
export function bpmText(value) { return Number.isFinite(value) ? String(Math.round(value)) : '—'; }
