import { validateCountIn } from './count-in-model.mjs';
import { isMetronome, sourceSeconds, validTempo } from './exercise-model.mjs';
/** @typedef {{id:string, repetitions:number, bpm:number, start:number|null, end:number|null,fragmentId?:string,fragmentName?:string,bars?:number}} RoutineStep */
/** @typedef {{id:string, exerciseId:string, steps:RoutineStep[], countIn?:import('./count-in-model.mjs').CountIn}} RoutineBlock */
/** @typedef {{id?:string, title:string, blocks:RoutineBlock[], countIn?:import('./count-in-model.mjs').CountIn}} RoutineInput */
/** @typedef {{id:string, bpm:number, duration:number,kind?:string,meter?:string,bars?:number}} SourceExercise */

/** @param {RoutineStep} step @param {SourceExercise} exercise */
export function plannedSeconds(step, exercise) {
  return ((step.start === null ? sourceSeconds(step, exercise) : (step.end ?? exercise.duration) - step.start) * step.repetitions * exercise.bpm / step.bpm);
}

/** Validate on both sides of IPC. No renderer-supplied duration is trusted.
 * @param {RoutineInput} input @param {SourceExercise[]} exercises
 * @returns {RoutineInput}
 */
export function validateRoutine(input, exercises) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const ids = new Set();
  /** @param {unknown} id */
  function identity(id) { if (typeof id !== 'string' || !uuid.test(id) || ids.has(id)) throw new Error('Ongeldige of dubbele stap.'); ids.add(id); return id; }
  if (!input || typeof input.title !== 'string' || !input.title.trim() || input.title.length > 160 || input.title.includes('\0')) throw new Error('Geef de sessie een naam van maximaal 160 tekens.');
  if (!Array.isArray(input.blocks) || !input.blocks.length || input.blocks.length > 100) throw new Error('Kies 1 tot 100 oefeningen in je sessie.');
  let totalSteps = 0;
  const blocks = input.blocks.map(block => {
    const id = identity(block.id), exercise = exercises.find(item => item.id === block.exerciseId);
    if (!exercise) throw new Error('Een oefening uit deze sessie ontbreekt in de bibliotheek.');
    if (!Array.isArray(block.steps) || !block.steps.length || (totalSteps += block.steps.length) > 1000) throw new Error('Kies minstens één stap per oefening en maximaal 1000 stappen per sessie.');
    const steps = block.steps.map(step => {
      const stepId = identity(step.id);
      if (!Number.isInteger(step.repetitions) || step.repetitions < 1 || step.repetitions > 99) throw new Error('Kies 1 tot 99 herhalingen per stap.');
      if (!validTempo(step.bpm, exercise)) throw new Error(isMetronome(exercise) ? 'Kies een tempo van 20–300 BPM.' : `Kies een tempo van 25–300% van het originele BPM (${exercise.bpm}).`);
      if (isMetronome(exercise)) {
        sourceSeconds(step, exercise);
        if (step.start !== null || step.end !== null || step.fragmentId !== undefined) throw new Error('Een metronoomstap gebruikt maten, geen audiofragment.');
      } else if (step.bars !== undefined) throw new Error('Maten zijn alleen voor metronoom-oefeningen.');
      if (step.start !== null || step.end !== null) {
        if (typeof step.start !== 'number' || typeof step.end !== 'number' || !Number.isFinite(step.start) || !Number.isFinite(step.end) || step.start < 0 || step.end > exercise.duration || step.end - step.start < .1 - 1e-9) throw new Error('Kies een fragment binnen de track, met A vóór B en minstens 0,1 seconde duur.');
      }
      if (step.fragmentId !== undefined && (typeof step.fragmentId !== 'string' || !uuid.test(step.fragmentId) || typeof step.fragmentName !== 'string' || !step.fragmentName.trim() || step.fragmentName.length > 160 || step.fragmentName.includes('\0') || step.start === null)) throw new Error('Controleer het benoemde fragment.');
      return { ...(isMetronome(exercise) && step.bars !== undefined ? { bars: step.bars } : {}), ...(step.fragmentId ? { fragmentId: step.fragmentId, fragmentName: step.fragmentName } : {}), id: stepId, repetitions: step.repetitions, bpm: step.bpm, start: step.start, end: step.end };
    });
    return { id, exerciseId: exercise.id, steps, ...(block.countIn === undefined ? {} : { countIn: validateCountIn(block.countIn) }) };
  });
  if (input.id !== undefined && !uuid.test(input.id)) throw new Error('Ongeldig sessie.');
  return { id: input.id, title: input.title.trim(), blocks, ...(input.countIn === undefined ? {} : { countIn: validateCountIn(input.countIn) }) };
}
