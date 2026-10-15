import { countInForBlock, hasCountIn } from './count-in-model.mjs';
import { isMetronome, sourceSeconds, validTempo } from './exercise-model.mjs';
/** @typedef {{mode:'planned'|'fragment', block:number, step:number, a:number, b:number, bpm:number, pitch:number, seconds:number, completed:number}} Played */
/** @typedef {{seq:number, block:number, step:number, repetition:number, phase:string, passes:number, statuses:string[], times:{planned:number,fragment:number,pause:number,preparation?:number}, played:Played[]}} Progress */
/** @typedef {{id:string,block:number,fromStep:number,toStep:number,action:'repeat'|'same'|'faster'|'slower',delta:number,note:string,rating?:number}} Evaluation */
/** @typedef {{routine:import('./routine-model.mjs').RoutineInput,exercises:import('./library.mjs').Exercise[]}} Snapshot */
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** @param {unknown} id */
export function sessionId(id) { if (typeof id !== 'string' || !uuid.test(id)) throw new Error('Ongeldige sessie.'); return id; }
/** @param {unknown} value @param {number} max */
function integer(value, max) { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max; }
/** @param {unknown} value */
function seconds(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 31536000; }
/** @param {Progress} input @param {Snapshot} snapshot @returns {Progress} */
export function validateProgress(input, snapshot) {
  const fail = () => { throw new Error('Ongeldige sessieresultaten.'); };
  if (!input || !integer(input.seq, Number.MAX_SAFE_INTEGER) || !integer(input.block, snapshot.routine.blocks.length - 1)) return fail();
  const block = snapshot.routine.blocks[input.block];
  if (!integer(input.step, block.steps.length - 1) || !integer(input.repetition, block.steps[input.step].repetitions - 1) || !['ready','playing','countin','paused','fragment','review','complete'].includes(input.phase) || !integer(input.passes, 1000000)) return fail();
  if (input.phase === 'countin' && !countInForBlock(snapshot.routine, block)?.enabled) return fail();
  if (!Array.isArray(input.statuses) || input.statuses.length !== snapshot.routine.blocks.length || input.statuses.some(status => !['pending','completed','skipped'].includes(status))) return fail();
  if (!input.times || !seconds(input.times.planned) || !seconds(input.times.fragment) || !seconds(input.times.pause) || (input.times.preparation !== undefined && (!seconds(input.times.preparation) || (!hasCountIn(snapshot.routine) && input.times.preparation !== 0))) || !Array.isArray(input.played) || input.played.length > 100000) return fail();
  let passes = 0, planned = 0, fragment = 0;
  const played = input.played.map(item => {
    if (!item || !['planned','fragment'].includes(item.mode) || !integer(item.block, snapshot.routine.blocks.length - 1)) return fail();
    const sourceBlock = snapshot.routine.blocks[item.block], source = snapshot.exercises.find(exercise => exercise.id === sourceBlock.exerciseId);
    if (!source || !integer(item.step, sourceBlock.steps.length - 1) || !seconds(item.seconds) || !integer(item.completed, 1000000) || !Number.isFinite(item.a) || !Number.isFinite(item.b) || item.a < 0 || item.b > sourceSeconds(sourceBlock.steps[item.step], source) + .1 || item.b - item.a < .1 - 1e-9 || !validTempo(item.bpm, source) || !Number.isFinite(item.pitch) || Math.abs(item.pitch) > 12) return fail();
    const step = sourceBlock.steps[item.step];
    if (isMetronome(source) && (item.mode !== 'planned' || item.pitch !== 0)) return fail();
    if (item.mode === 'planned' && (item.bpm !== step.bpm || item.pitch !== 0 || item.a !== (step.start ?? 0) || Math.abs(item.b - (step.end ?? sourceSeconds(step, source))) > .1)) return fail();
    if (item.mode === 'fragment' && item.completed !== 0) return fail();
    passes += item.completed; if (item.mode === 'planned') planned += item.seconds; else fragment += item.seconds;
    return { mode: item.mode, block: item.block, step: item.step, a: item.a, b: item.b, bpm: item.bpm, pitch: item.pitch, seconds: item.seconds, completed: item.completed };
  });
  if (passes !== input.passes || Math.abs(planned - input.times.planned) > .01 || Math.abs(fragment - input.times.fragment) > .01) return fail();
  return { seq: input.seq, block: input.block, step: input.step, repetition: input.repetition, phase: input.phase, passes: input.passes, statuses: [...input.statuses], times: { ...input.times }, played };
}
/** @param {Evaluation} input @param {Snapshot} snapshot @param {Progress} progress */
export function validateEvaluation(input, snapshot, progress) {
  if (!input || progress.phase !== 'review' || input.block !== progress.block || input.toStep !== progress.step || !integer(input.fromStep, input.toStep) || !['repeat','same','faster','slower'].includes(input.action) || !Number.isFinite(input.delta) || Math.abs(input.delta) > 1000 || (input.action === 'faster' ? input.delta <= 0 : input.action === 'slower' ? input.delta >= 0 : input.delta !== 0) || typeof input.note !== 'string' || input.note.length > 2000 || input.note.includes('\0')) throw new Error('Controleer de evaluatie en BPM-aanpassing.');
  if (input.rating !== undefined && (!integer(input.rating, 5) || input.rating < 1)) throw new Error('Kies een beoordeling van 1 tot en met 5.');
  sessionId(input.id);
  const steps = snapshot.routine.blocks[input.block].steps, last = steps[input.toStep];
  const duration = snapshot.exercises.find(item => item.id === snapshot.routine.blocks[input.block].exerciseId)?.duration;
  const same = (/** @type {import('./routine-model.mjs').RoutineStep} */ step) => (step.start ?? 0) === (last.start ?? 0) && (step.end ?? duration) === (last.end ?? duration);
  if ((input.toStep + 1 < steps.length && same(steps[input.toStep + 1])) || (input.fromStep > 0 && same(steps[input.fromStep - 1])) || steps.slice(input.fromStep, input.toStep + 1).some(step => !same(step))) throw new Error('De evaluatie hoort bij de volledige fragmentserie.');
  return { id: input.id, block: input.block, fromStep: input.fromStep, toStep: input.toStep, action: input.action, delta: input.delta, note: input.note.trim(), rating: input.rating ?? 3 };
}
