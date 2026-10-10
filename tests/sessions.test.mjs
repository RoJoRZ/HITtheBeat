import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openLibrary } from '../electron/library.mjs';
const audio = { name: 'test.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]) };
async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-history-')); let library = await openLibrary(root);
  try {
    const source = await library.save({ title: 'Gitaar', description: 'Rustig spelen', bpm: 120, duration: 20, detectedBpm: null, analysisStatus: 'unavailable', audio });
    const makeBlock = () => ({ id: randomUUID(), exerciseId: source.id, steps: [75,95,85].map(bpm => ({ id: randomUUID(), start: 0, end: 2, bpm, repetitions: 1 })) });
    const routine = library.saveRoutine({ title: 'Techniek', blocks: [makeBlock(), makeBlock()] });
    const other = library.saveRoutine({ title: 'Warming-up', blocks: [makeBlock()] });
    await run({ library, root, routine, other, reopen: async () => { try { library.close(); } catch (error) { if (error.code !== 'ERR_INVALID_STATE') throw error; } library = await openLibrary(root); return library; } });
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
}
function reviewProgress(session, seq = 1) {
  return { ...session.progress, seq, phase: 'review', step: 2, passes: 3, statuses: ['completed','pending'], times: { planned: 6, fragment: 2, pause: 4 }, played: [
    ...session.routine.blocks[0].steps.map((step, index) => ({ mode: 'planned', block: 0, step: index, a: 0, b: 2, bpm: step.bpm, pitch: 0, seconds: 2, completed: 1 })),
    { mode: 'fragment', block: 0, step: 1, a: .5, b: 1, bpm: 60, pitch: 3, seconds: 2, completed: 0 },
  ] };
}
const evaluation = (delta = 5) => ({ id: randomUUID(), block: 0, fromStep: 0, toStep: 2, action: delta > 0 ? 'faster' : delta < 0 ? 'slower' : 'same', delta, note: 'Let op ontspanning.' });
test('history survives reopen, snapshots stay unchanged and tempo applies once to only one block', async () => fixture(async ({ library, routine, other, reopen }) => {
  const session = library.startSession(routine.id), progress = reviewProgress(session);
  library.saveSession(session.id, progress);
  const choice = evaluation(); library.reviewSession(session.id, choice); library.reviewSession(session.id, choice);
  const changed = library.listRoutines().find(item => item.id === routine.id);
  assert.deepEqual(changed.blocks[0].steps.map(step => step.bpm), [80,100,90]);
  assert.deepEqual(changed.blocks[1].steps.map(step => step.bpm), [75,95,85]);
  assert.deepEqual(library.listRoutines().find(item => item.id === other.id), other);
  const lower = evaluation(-10); library.reviewSession(session.id, lower);
  assert.deepEqual(library.listRoutines().find(item => item.id === routine.id).blocks[0].steps.map(step => step.bpm), [70,90,80]);
  library.saveSession(session.id, { ...progress, seq: 2 }, 'stopped');
  library = await reopen();
  const saved = library.listSessions()[0]; assert.equal(saved.status, 'stopped'); assert.equal(saved.evaluations.length, 2);
  assert.equal(saved.progress.times.planned + saved.progress.times.fragment, 8);
  assert.deepEqual(saved.routine, routine); assert.equal(saved.progress.played[3].pitch, 3);
  library.deleteRoutine(routine.id); assert.deepEqual(library.listSessions()[0].routine, routine);
}));
test('tempo outside bounds rolls back both evaluation and plan, concurrent editor change is preserved', async () => fixture(async ({ library, routine }) => {
  const session = library.startSession(routine.id); library.saveSession(session.id, reviewProgress(session));
  assert.throws(() => library.reviewSession(session.id, evaluation(400)), /25–300/);
  assert.equal(library.listSessions()[0].evaluations.length, 0); assert.deepEqual(library.listRoutines().find(item => item.id === routine.id), routine);
  library.saveRoutine({ ...routine, title: 'Intussen gewijzigd' });
  assert.throws(() => library.reviewSession(session.id, evaluation()), /intussen gewijzigd/);
  library.reviewSession(session.id, evaluation(0)); assert.equal(library.listSessions()[0].evaluations.length, 1);
}));
test('checkpoints ignore old sequences, reject invalid context and never label skipped or unfinished runs as completed', async () => fixture(async ({ library, routine, reopen }) => {
  const session = library.startSession(routine.id), progress = reviewProgress(session);
  assert.throws(() => library.saveSession(session.id, { ...progress, passes: 10 }), /Ongeldige/);
  assert.throws(() => library.saveSession(session.id, { ...progress, times: { ...progress.times, planned: 900 } }), /Ongeldige/);
  assert.throws(() => library.saveSession(session.id, { ...progress, played: [{ ...progress.played[0], block: 10 }] }), /Ongeldige/);
  library.saveSession(session.id, progress);
  assert.equal(library.saveSession(session.id, { ...session.progress, seq: 0 }).progress.passes, 3);
  assert.throws(() => library.saveSession(session.id, { ...progress, seq: 2 }, 'completed'), /nog niet/);
  assert.throws(() => library.saveSession(session.id, { ...progress, seq: 2, phase: 'complete', statuses: ['completed','skipped'] }, 'completed'), /nog niet/);
  library.saveSession(session.id, { ...progress, seq: 2, phase: 'complete', statuses: ['completed','skipped'] }, 'partial');
  library.startSession(routine.id); library = await reopen();
  assert.deepEqual(library.listSessions().map(item => item.status).sort(), ['interrupted','partial']);
}));
test('migration from schema 2 preserves routines and exercises', async () => fixture(async ({ library, root, routine, reopen }) => {
  library.close();
  const db = new DatabaseSync(path.join(root, 'library.sqlite')); db.exec('DROP TABLE sessions; ALTER TABLE exercises DROP COLUMN normalization_db; ALTER TABLE exercises DROP COLUMN normalize_audio; PRAGMA user_version=2;'); db.close();
  // fixture reopen closes the already closed handle safely.
  library = await reopen();
  assert.equal(library.list().length, 1); assert.deepEqual(library.listRoutines().find(item => item.id === routine.id), routine);
  assert.equal(library.listSessions().length, 0); library.startSession(routine.id);
}));
