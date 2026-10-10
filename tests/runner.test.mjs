import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRun, advance, current, remainingSeconds } from '../src/session/runner.ts';
const exercise = { id: randomUUID(), bpm: 120, duration: 60 };
const steps = [75,95,85].map((bpm, index) => ({ id: randomUUID(), bpm, repetitions: index === 1 ? 2 : 1, start: 12, end: 22 }));
const routine = { id: randomUUID(), title: 'Techniek', updatedAt: '', blocks: [{ id: randomUUID(), exerciseId: exercise.id, steps }, { id: randomUUID(), exerciseId: exercise.id, steps: [{ ...steps[0], id: randomUUID(), bpm: 60 }] }] };

test('four passes execute in order, review separates exercises, final block completes once', () => {
  let run = advance(createRun(routine, [exercise]), 'play'); const tempos = [];
  for (let i = 0; i < 4; i++) { tempos.push(current(run).step.bpm); run = advance(run, 'ended'); }
  assert.deepEqual(tempos, [75,95,95,85]); assert.equal(run.phase, 'review'); assert.equal(run.passes, 4);
  assert.equal(advance(run, 'ended'), run); assert.equal(run.statuses[0], 'completed');
  run = advance(run, 'next'); assert.equal(run.block, 1); assert.equal(current(run).step.bpm, 60);
  run = advance(advance(run, 'ended'), 'next'); assert.equal(run.phase, 'complete'); assert.equal(run.passes, 5);
  assert.equal(advance(run, 'ended'), run); assert.equal(remainingSeconds(run), 0);
});
test('pause and multiple free interruptions preserve repeat and restore its full duration', () => {
  let run = advance(advance(createRun(routine, [exercise]), 'play'), 'ended');
  assert.equal(run.step, 1); assert.equal(run.repetition, 0);
  const remaining = remainingSeconds(run, 12);
  assert.equal(remainingSeconds(run, 17), remaining - 5 * 120 / 95);
  run = advance(run, 'pause'); assert.equal(advance(run, 'ended'), run);
  run = advance(run, 'play');
  for (let i = 0; i < 3; i++) {
    run = advance(run, 'fragment'); assert.equal(advance(run, 'ended'), run); assert.equal(remainingSeconds(run, 50), remaining);
    run = advance(run, 'return'); assert.equal(run.phase, 'playing'); assert.equal(run.step, 1); assert.equal(run.repetition, 0); assert.equal(run.passes, 1);
  }
  run = advance(advance(run, 'ended'), 'fragment'); assert.equal(run.repetition, 1);
  run = advance(run, 'return'); assert.equal(run.repetition, 1);
  const paused = advance(advance(advance(run, 'pause'), 'fragment'), 'return'); assert.equal(paused.phase, 'paused');
});
test('restart does not complete a pass, skip is distinct from completion and snapshots are independent', () => {
  let run = createRun(routine, [exercise]);
  run.routine.title = 'Snapshot'; assert.equal(routine.title, 'Techniek');
  const restarted = advance(run, 'restart'); assert.equal(restarted.passes, 0); assert.equal(restarted.phase, 'ready');
  run = advance(restarted, 'skip'); assert.equal(run.block, 1); assert.equal(run.statuses[0], 'skipped');
  run = advance(run, 'skip'); assert.equal(run.phase, 'complete'); assert.equal(run.passes, 0); assert.deepEqual(run.statuses, ['skipped','skipped']);
});
