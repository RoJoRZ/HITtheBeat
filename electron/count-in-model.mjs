import { LocalizedError } from './i18n.mjs';
import { meterBeats, metronomeSeconds } from './exercise-model.mjs';
/** @typedef {{enabled:boolean,meter:string}} CountIn */
/** @param {unknown} input @returns {CountIn} */
export function validateCountIn(input) {
  if (!input || typeof input !== 'object' || !('enabled' in input) || typeof input.enabled !== 'boolean' || !('meter' in input) || typeof input.meter !== 'string') throw new LocalizedError("Controleer de aftelmaat.");
  meterBeats(input.meter);
  return { enabled: input.enabled, meter: input.meter };
}
/** @param {{countIn?:CountIn}} routine @param {number} bpm */
export function countInSeconds(routine, bpm) {
  if (!routine.countIn?.enabled) return 0;
  if (!Number.isFinite(bpm) || bpm <= 0) throw new LocalizedError("Kies een positief tempo voor de aftelmaat.");
  return metronomeSeconds({ meter: routine.countIn.meter, bpm, duration: 0 }, 1);
}
/** Legacy session settings only apply to snapshots without block settings.
 * @param {{countIn?:CountIn}} routine @param {{countIn?:CountIn}} block
 */
export function countInForBlock(routine, block) { return block.countIn ?? routine.countIn; }
/** @param {import('./routine-model.mjs').RoutineInput} routine */
export function hasCountIn(routine) { return routine.blocks.some(block => countInForBlock(routine, block)?.enabled); }
/** @param {import('./routine-model.mjs').RoutineInput} routine */
export function plannedPreparation(routine) { return routine.blocks.reduce((total, block) => total + block.steps.reduce((sum, step) => sum + step.repetitions * countInSeconds({ countIn: countInForBlock(routine, block) }, step.bpm), 0), 0); }
