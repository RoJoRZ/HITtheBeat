import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openLibrary } from '../electron/library.mjs';
const audio = { name: 'test.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]) };
const input = { title: 'Techniek', description: '', bpm: 120, duration: 20, detectedBpm: null, analysisStatus: 'unavailable', audio };
async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-fragments-')); let library = await openLibrary(root);
  try { await run({ library, root, reopen: async () => { library.close(); library = await openLibrary(root); return library; } }); }
  finally { library.close(); await rm(root, { recursive: true, force: true }); }
}
test('named fragments validate, remain scoped to the exercise, preserve metadata and survive reopen', async () => fixture(async ({ library, reopen }) => {
  const exercise = await library.save(input), other = await library.save({ ...input, title: 'Anders' });
  for (const value of [{ name: '', start: 0, end: 1 }, { name: 'A', start: -1, end: 1 }, { name: 'A', start: NaN, end: 2 }, { name: 'A', start: 0, end: 21 }, { name: 'A', start: 2, end: 2 }, { name: 'A', start: 3, end: 2 }, { name: 'A', start: '0', end: 2 }]) assert.throws(() => library.saveFragment(exercise.id, value));
  assert.deepEqual(library.list()[0].fragments, []);
  const withFragment = library.saveFragment(exercise.id, { name: '  Overgang  ', start: .25, end: 2.75 });
  const fragment = withFragment.fragments[0];
  assert.equal(fragment.name, 'Overgang');
  assert.throws(() => library.saveFragment(exercise.id, { name: 'overgang', start: 2, end: 3 }), /unieke/);
  assert.throws(() => library.saveFragment(other.id, { ...fragment, name: 'Vreemd' }), /niet meer/);
  assert.deepEqual(library.list().find(item => item.id === other.id).fragments, []);
  await library.save({ ...withFragment, title: 'Aangepast' });
  library = await reopen();
  const saved = library.list().find(item => item.id === exercise.id);
  assert.deepEqual(saved.fragments, [fragment]); assert.equal(saved.title, 'Aangepast');
  assert.deepEqual((await library.read(exercise.id, 'audio')).bytes, audio.bytes);
}));
test('editing/deleting a named fragment keeps routine selections and session snapshots intact', async () => fixture(async ({ library, reopen }) => {
  const exercise = await library.save(input);
  const fragment = library.saveFragment(exercise.id, { name: 'Overgang', start: 1, end: 3 }).fragments[0];
  const routine = library.saveRoutine({ title: 'Training', blocks: [{ id: randomUUID(), exerciseId: exercise.id, steps: [{ id: randomUUID(), repetitions: 2, bpm: 90, start: fragment.start, end: fragment.end, fragmentId: fragment.id, fragmentName: fragment.name }] }] });
  const session = library.startSession(routine.id); library.interruptSessions();
  library.saveFragment(exercise.id, { ...fragment, name: 'Nieuwe overgang', start: 2, end: 4 });
  assert.deepEqual(library.listRoutines()[0], routine);
  assert.deepEqual(library.listSessions()[0].routine, session.routine);
  assert.deepEqual(library.listSessions()[0].exercises[0].fragments, [fragment]);
  library.deleteFragment(exercise.id, fragment.id);
  assert.throws(() => library.deleteFragment(exercise.id, fragment.id), /niet meer/);
  library = await reopen();
  assert.deepEqual(library.list()[0].fragments, []);
  assert.deepEqual(library.listRoutines()[0], routine);
  assert.deepEqual(library.startSession(routine.id).routine, routine);
}));
test('schema 4 migration preserves media, routine boundaries and existing session history', async () => fixture(async ({ library, root, reopen }) => {
  const exercise = await library.save(input);
  const routine = library.saveRoutine({ title: 'Bestaand', blocks: [{ id: randomUUID(), exerciseId: exercise.id, steps: [{ id: randomUUID(), repetitions: 1, bpm: 120, start: .5, end: 3 }] }] });
  library.startSession(routine.id); library.interruptSessions();
  const history = library.listSessions();
  const db = new DatabaseSync(path.join(root, 'library.sqlite'));
  db.exec('ALTER TABLE exercises DROP COLUMN beat_offset; ALTER TABLE exercises DROP COLUMN credit; ALTER TABLE routine_blocks DROP COLUMN count_in; ALTER TABLE routines DROP COLUMN count_in; ALTER TABLE exercises DROP COLUMN bars; ALTER TABLE exercises DROP COLUMN kind; ALTER TABLE exercises DROP COLUMN meter; ALTER TABLE routine_steps DROP COLUMN bars; ALTER TABLE exercises DROP COLUMN fragments; ALTER TABLE routine_steps DROP COLUMN fragment_id; ALTER TABLE routine_steps DROP COLUMN fragment_name; PRAGMA user_version=4;'); db.close();
  library = await reopen();
  assert.deepEqual(library.list()[0].fragments, []);
  assert.deepEqual(library.listRoutines()[0], routine); assert.deepEqual(library.listSessions(), history);
  assert.deepEqual((await library.read(exercise.id, 'audio')).bytes, audio.bytes);
}));
