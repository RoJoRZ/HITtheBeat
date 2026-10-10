import type { Exercise, Routine } from '../library/types.ts';
import { plannedSeconds, validateRoutine } from '../../electron/routine-model.mjs';
export type Phase = 'ready' | 'playing' | 'paused' | 'fragment' | 'review' | 'complete';
export interface Run {
  routine: Routine; exercises: Exercise[]; block: number; step: number; repetition: number;
  phase: Phase; revision: number; resumePlaying: boolean; passes: number;
  statuses: ('pending' | 'completed' | 'skipped')[];
}
export function createRun(routine: Routine, exercises: Exercise[]): Run {
  validateRoutine(routine, exercises);
  return { routine: structuredClone(routine), exercises: structuredClone(exercises), block: 0, step: 0, repetition: 0, phase: 'ready', revision: 0, resumePlaying: false, passes: 0, statuses: routine.blocks.map(() => 'pending') };
}
export function current(run: Run) {
  const block = run.routine.blocks[run.block], step = block.steps[run.step];
  return { block, step, exercise: run.exercises.find(item => item.id === block.exerciseId)! };
}
export type Action = 'play' | 'pause' | 'ended' | 'restart' | 'fragment' | 'return' | 'next' | 'skip' | 'repeat';
export function advance(run: Run, action: Action): Run {
  const { block, step } = current(run);
  if (action === 'play' && ['ready', 'paused'].includes(run.phase)) return { ...run, phase: 'playing' };
  if (action === 'pause' && run.phase === 'playing') return { ...run, phase: 'paused' };
  if (action === 'fragment' && ['ready', 'playing', 'paused'].includes(run.phase)) return { ...run, phase: 'fragment', resumePlaying: run.phase === 'playing' };
  if (action === 'return' && run.phase === 'fragment') return { ...run, phase: run.resumePlaying ? 'playing' : 'paused', revision: run.revision + 1 };
  if (action === 'restart' && ['ready', 'playing', 'paused'].includes(run.phase)) return { ...run, revision: run.revision + 1 };
  if (action === 'ended' && run.phase === 'playing') {
    const next = { ...run, passes: run.passes + 1, revision: run.revision + 1 };
    if (run.repetition + 1 < step.repetitions) return { ...next, repetition: run.repetition + 1 };
    if (run.step + 1 < block.steps.length) return { ...next, step: run.step + 1, repetition: 0 };
    return { ...next, phase: 'review', statuses: run.statuses.map((status, index) => index === run.block ? 'completed' : status) };
  }
  if (action === 'repeat' && run.phase === 'review') return { ...run, step: 0, repetition: 0, phase: 'playing', revision: run.revision + 1, statuses: run.statuses.map((status, index) => index === run.block ? 'pending' : status) };
  if ((action === 'next' && run.phase === 'review') || (action === 'skip' && ['ready', 'playing', 'paused'].includes(run.phase))) {
    const statuses = run.statuses.map((status, index) => index === run.block && action === 'skip' ? 'skipped' as const : status);
    return { ...run, block: Math.min(run.block + 1, run.routine.blocks.length - 1), step: 0, repetition: 0, phase: run.block + 1 === run.routine.blocks.length ? 'complete' : 'playing', revision: run.revision + 1, statuses };
  }
  return run;
}
export function remainingSeconds(run: Run, position = 0) {
  if (run.phase === 'complete') return 0;
  let total = 0;
  for (let b = run.block; b < run.routine.blocks.length; b++) {
    if (b === run.block && run.phase === 'review') continue;
    const block = run.routine.blocks[b], exercise = run.exercises.find(item => item.id === block.exerciseId)!;
    for (let s = b === run.block ? run.step : 0; s < block.steps.length; s++) {
      const step = block.steps[s];
      if (b === run.block && s === run.step) {
        total += plannedSeconds({ ...step, repetitions: step.repetitions - run.repetition }, exercise);
        if (run.phase !== 'fragment') total -= Math.max(0, Math.min((step.end ?? exercise.duration) - (step.start ?? 0), position - (step.start ?? 0))) * exercise.bpm / step.bpm;
      } else total += plannedSeconds(step, exercise);
    }
  }
  return Math.max(0, total);
}
