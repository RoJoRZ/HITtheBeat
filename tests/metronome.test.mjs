import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openLibrary } from '../electron/library.mjs';
import { metronomeSeconds } from '../electron/exercise-model.mjs';
import { plannedSeconds, validateRoutine } from '../electron/routine-model.mjs';
import { createRun, advance, current, remainingSeconds } from '../src/session/runner.ts';
import { validateProgress } from '../electron/session-model.mjs';
import { buildDashboard } from '../src/library/progress.mjs';
import { clickPlan } from '../src/audio/metronome.ts';
const source = { kind: 'metronome', meter: '6/8', id: randomUUID(), title: 'Zes acht', description: '', bpm: 120, duration: 0, detectedBpm: null, analysisStatus: 'unavailable' };
const step = (bars = 8, bpm = 120) => ({ id: randomUUID(), start: null, end: null, repetitions: 1, bars, bpm });
const routine = (exercise, steps) => ({ id: randomUUID(), title: 'Tellen', updatedAt: '', blocks: [{ id: randomUUID(), exerciseId: exercise.id, steps }] });

test('quarter-note BPM gives correct bar durations, pulses and accents for each meter', () => {
  for (const [meter, seconds, pulses] of [['3/4', 12, 24], ['4/4', 16, 32], ['6/8', 12, 48]]) {
    const exercise = { ...source, meter };
    assert.equal(metronomeSeconds(exercise, 8), seconds);
    assert.equal(plannedSeconds(step(8, 60), exercise), seconds * 2);
    const plan = clickPlan(meter, 120, seconds); assert.equal(plan.length, pulses);
    assert.equal(plan[0].frequency, 1800); assert.equal(plan[1].frequency, 1000);
    if (meter === '6/8') { assert.equal(plan[3].frequency, 1400); assert.equal(plan[1].position, .25); }
    else assert.equal(plan[1].position, .5);
  }
});

test('metronome boundaries, tempos and audio-only controls validate without changing audio rules', () => {
  const input = routine(source, [step()]); assert.equal(validateRoutine(input, [source]).blocks[0].steps[0].bars, 8);
  for (const bars of [0, 129, 1.5, NaN]) assert.throws(() => validateRoutine(routine(source, [step(bars)]), [source]), /maten/);
  for (const bpm of [19, 301, NaN]) assert.throws(() => validateRoutine(routine(source, [step(8, bpm)]), [source]), /tempo/);
  assert.throws(() => validateRoutine(routine(source, [{ ...step(), start: 0, end: 1 }]), [source]), /audiofragment/);
  const audio = { ...source, kind: 'audio', duration: 6 }; assert.throws(() => validateRoutine(routine(audio, [step()]), [audio]), /Maten/);
});

test('metronome passes use per-step bars and BPM; pause and restart do not advance; mixed session evaluates normally', () => {
  const audio = { ...source, id: randomUUID(), kind: 'audio', duration: 6 };
  const input = routine(source, [{ ...step(2, 60), repetitions: 2 }, step(4, 120)]);
  input.blocks.push({ id: randomUUID(), exerciseId: audio.id, steps: [{ id: randomUUID(), bpm: 120, repetitions: 1, start: null, end: null }] });
  let run = createRun(input, [source, audio]); assert.equal(remainingSeconds(run), 24); // 2x6s + 6s + 6s
  run = advance(run, 'play'); run = advance(run, 'pause'); assert.equal(advance(run, 'ended'), run);
  run = advance(advance(run, 'restart'), 'play'); assert.equal(run.passes, 0);
  run = advance(run, 'ended'); assert.equal(run.repetition, 1);
  run = advance(run, 'ended'); assert.equal(current(run).exercise.duration, 6);
  run = advance(run, 'ended'); assert.equal(run.phase, 'review'); assert.equal(run.passes, 3);
  run = advance(run, 'next'); assert.equal(current(run).exercise.id, audio.id);
});

test('metronome progress validates reference coordinates and dashboard separates meter and bars', () => {
  const plan = routine(source, [step(2), step(4)]);
  const input = { seq: 1, block: 0, step: 1, repetition: 0, phase: 'review', passes: 2, statuses: ['completed'], times: { planned: 9, fragment: 0, pause: 2 }, played: [3,6].map((b, index) => ({ mode: 'planned', block: 0, step: index, a: 0, b, bpm: 120, pitch: 0, seconds: b, completed: 1 })) };
  const snapshot = { routine: plan, exercises: [source] };
  assert.deepEqual(validateProgress(input, snapshot), input);
  assert.throws(() => validateProgress({ ...input, played: [{ ...input.played[0], b: 30 }] }, snapshot));
  const session = { ...snapshot, id: randomUUID(), startedAt: '2026-10-15T10:00:00Z', status: 'completed', progress: input, evaluations: [] };
  const dashboard = buildDashboard([session], { period: 'all', now: new Date('2026-10-15T15:00:00Z'), timeZone: 'Europe/Amsterdam' });
  assert.equal(dashboard.totalSeconds, 9); assert.equal(dashboard.groups.length, 2); assert.ok(dashboard.groups.every(group => group.part.includes('Metronoom 6/8')));
});

test('audio-free storage reopens, rejects type change and fragments, preserves snapshots and deletion protection', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-metronome-')); let library = await openLibrary(root);
  try {
    const saved = await library.save({ ...source, id: undefined, bars: 2 }); assert.equal(saved.duration, 0); assert.equal(saved.audioName, ''); assert.deepEqual(await readdir(path.join(root, 'media')), []);
    assert.equal(await library.read(saved.id, 'audio'), null); assert.throws(() => library.saveFragment(saved.id, { name: 'Nee', start: 0, end: 1 }), /audiofragment/);
    await assert.rejects(library.save({ ...saved, kind: 'audio' }), /oefentype/);
    await assert.rejects(library.save({ ...source, id: undefined, meter: '7/9' }), /maatsoort/);
    const plan = library.saveRoutine({ ...routine(saved, [step(2, 60)]), id: undefined }); const session = library.startSession(plan.id);
    await assert.rejects(library.deleteExercise(saved.id), /sessie/);
    library.close(); library = await openLibrary(root); assert.equal(library.list()[0].meter, '6/8'); assert.equal(library.list()[0].bars, 2);
    await library.save({ ...saved, meter: '4/4' }); assert.equal(library.listSessions()[0].exercises[0].meter, '6/8'); assert.equal(library.listSessions()[0].id, session.id);
    library.deleteRoutine(plan.id); await library.deleteExercise(saved.id); assert.equal(library.list().length, 0); assert.equal(library.listSessions().length, 1);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});

test('schema 5 upgrade retains original media, boundaries and old snapshots without kind fields', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-schema5-')); let library = await openLibrary(root);
  try {
    const bytes = new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]);
    const audio = await library.save({ title: 'Oud', description: '', bpm: 120, detectedBpm: null, analysisStatus: 'unavailable', duration: 6, audio: { name: 'oud.mp3', bytes } });
    const plan = library.saveRoutine({ ...routine(audio, [{ id: randomUUID(), start: 1, end: 3, bpm: 120, repetitions: 2 }]), id: undefined });
    const session = library.startSession(plan.id); library.interruptSessions(); library.close();
    const db = new DatabaseSync(path.join(root, 'library.sqlite'));
    const snapshot = { routine: session.routine, exercises: session.exercises.map(({ kind, meter, bars, ...rest }) => rest) };
    db.prepare('UPDATE sessions SET snapshot=?').run(JSON.stringify(snapshot));
    db.exec('ALTER TABLE exercises DROP COLUMN beat_offset; ALTER TABLE exercises DROP COLUMN credit; ALTER TABLE routine_blocks DROP COLUMN count_in; ALTER TABLE routines DROP COLUMN count_in; ALTER TABLE exercises DROP COLUMN bars; ALTER TABLE exercises DROP COLUMN kind; ALTER TABLE exercises DROP COLUMN meter; ALTER TABLE routine_steps DROP COLUMN bars; PRAGMA user_version=5;'); db.close();
    library = await openLibrary(root);
    assert.equal(library.list()[0].kind, 'audio'); assert.equal(library.list()[0].duration, 6);
    assert.deepEqual((await library.read(audio.id, 'audio')).bytes, bytes); assert.deepEqual(library.listRoutines()[0], plan);
    assert.deepEqual(library.listSessions()[0].exercises, snapshot.exercises); assert.equal(library.listSessions()[0].status, 'interrupted');
    const run = createRun(library.listSessions()[0].routine, library.listSessions()[0].exercises); assert.equal(remainingSeconds(run), 4);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});

test('exercise bars drive every session; updating bars applies atomically without rewriting history', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-exercise-bars-')); const library = await openLibrary(root);
  try {
    const exercise = await library.save({ ...source, id: undefined, bars: 3 });
    const plan = library.saveRoutine({ ...routine(exercise, [{ ...step(), bars: undefined }]), id: undefined });
    assert.equal(plannedSeconds(plan.blocks[0].steps[0], exercise), 4.5);
    const session = library.startSession(plan.id), version = plan.updatedAt;
    for (const bars of [0, 129, 1.5, NaN]) await assert.rejects(library.save({ ...exercise, bars }), /maten/);
    const changed = await library.save({ ...exercise, bars: 5 });
    assert.equal(plannedSeconds(library.listRoutines()[0].blocks[0].steps[0], changed), 7.5);
    assert.notEqual(library.listRoutines()[0].updatedAt, version);
    assert.equal(library.listSessions()[0].exercises[0].bars, 3); assert.equal(library.listSessions()[0].id, session.id);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});

test('schema 6 promotes a common count, preserves conflicting legacy steps until exercise edit, and rejects stale restoration', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-bars-upgrade-')); let library = await openLibrary(root);
  try {
    const a = await library.save({ ...source, id: undefined }), b = await library.save({ ...source, id: undefined, title: 'Andere' });
    const first = library.saveRoutine({ ...routine(a, [step(), step()]), id: undefined });
    const second = library.saveRoutine({ ...routine(b, [step()]), id: undefined }); library.close();
    const db = new DatabaseSync(path.join(root, 'library.sqlite'));
    db.prepare('UPDATE routine_steps SET bars=2 WHERE id=?').run(first.blocks[0].steps[0].id);
    db.prepare('UPDATE routine_steps SET bars=4 WHERE id=?').run(first.blocks[0].steps[1].id);
    db.prepare('UPDATE routine_steps SET bars=6 WHERE id=?').run(second.blocks[0].steps[0].id);
    db.exec('ALTER TABLE exercises DROP COLUMN beat_offset; ALTER TABLE exercises DROP COLUMN credit; ALTER TABLE routine_blocks DROP COLUMN count_in; ALTER TABLE routines DROP COLUMN count_in; ALTER TABLE exercises DROP COLUMN bars; PRAGMA user_version=6;'); db.close();
    library = await openLibrary(root);
    assert.equal(library.list().find(item => item.id === b.id).bars, 6);
    const stale = library.listRoutines().find(item => item.id === first.id);
    assert.deepEqual(stale.blocks[0].steps.map(step => step.bars), [2, 4]);
    const changed = await library.save({ ...library.list().find(item => item.id === a.id), bars: 5 });
    assert.ok(library.listRoutines().find(item => item.id === first.id).blocks[0].steps.every(step => step.bars === undefined));
    const resaved = library.saveRoutine(stale);
    assert.ok(resaved.blocks[0].steps.every(step => step.bars === undefined));
    assert.equal(plannedSeconds(resaved.blocks[0].steps[0], changed), 7.5);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});
