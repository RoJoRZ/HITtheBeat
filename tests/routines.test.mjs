import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openLibrary } from '../electron/library.mjs';
import { plannedSeconds, validateRoutine } from '../electron/routine-model.mjs';
const source = { id: randomUUID(), bpm: 120, duration: 60 };
const step = (bpm = 60) => ({ id: randomUUID(), bpm, repetitions: 1, start: null, end: null });
const round = (exerciseId = source.id) => ({ title: 'Warming-up', blocks: [{ id: randomUUID(), exerciseId, steps: [step()] }] });
const exercise = { title: 'Wisselslag', description: 'Let op je pols', bpm: 120, detectedBpm: null, analysisStatus: 'unavailable', duration: 60, audio: { name: 'test.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]) } };

test('duration uses original seconds, tempo and repetitions', () => {
  assert.equal(plannedSeconds(step(), source), 120);
  assert.equal(plannedSeconds({ ...step(), repetitions: 2, start: 12, end: 22 }, source), 40);
  for (const bpm of [30, 360]) assert.equal(validateRoutine({ ...round(), blocks: [{ ...round().blocks[0], steps: [step(bpm)] }] }, [source]).blocks[0].steps[0].bpm, bpm);
});
test('reject invalid fragments, tempos, repetitions, identities and sources', () => {
  for (const change of [{ start: -1, end: 10 }, { start: 12, end: 12 }, { start: 0, end: 61 }, { start: null, end: 10 }, { bpm: 29.9 }, { bpm: 360.1 }, { bpm: NaN }, { repetitions: 0 }, { repetitions: 1.2 }, { repetitions: 100 }]) {
    const input = round(); input.blocks[0].steps[0] = { ...step(), ...change };
    assert.throws(() => validateRoutine(input, [source]));
  }
  const duplicate = round(); duplicate.blocks[0].steps.push(duplicate.blocks[0].steps[0]);
  assert.throws(() => validateRoutine(duplicate, [source]));
  assert.throws(() => validateRoutine(round(randomUUID()), [source]));
});
test('independent routines preserve block/step order across reopen and failed transactions', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-rounds-')); let library = await openLibrary(root);
  try {
    const savedExercise = await library.save(exercise);
    const a = library.saveRoutine(round(savedExercise.id));
    const input = round(savedExercise.id); input.title = 'Techniek'; input.blocks[0].steps = [step(75), { ...step(95), repetitions: 2 }, step(85)]; input.blocks.push({ id: randomUUID(), exerciseId: savedExercise.id, steps: [step(120)] });
    const b = library.saveRoutine(input);
    library.saveRoutine({ ...a, blocks: [{ ...a.blocks[0], steps: [step(90)] }] });
    assert.deepEqual(library.listRoutines().find(item => item.id === b.id), b);
    const broken = { ...a, title: 'Should roll back', blocks: b.blocks };
    assert.throws(() => library.saveRoutine(broken));
    assert.equal(library.listRoutines().find(item => item.id === a.id).title, 'Warming-up');
    library.close(); library = await openLibrary(root);
    assert.deepEqual(library.listRoutines().find(item => item.id === b.id).blocks.map(block => block.steps.map(item => item.bpm)), [[75,95,85],[120]]);
    library.deleteRoutine(a.id);
    assert.equal(library.listRoutines().length, 1); assert.equal(library.list().length, 1);
    assert.ok(await library.read(savedExercise.id, 'audio'));
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});
test('migrate version 1 without losing exercise metadata', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-migration-'));
  try {
    await mkdir(path.join(root, 'media'));
    const db = new DatabaseSync(path.join(root, 'library.sqlite'));
    db.exec(`CREATE TABLE exercises (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, bpm REAL NOT NULL CHECK(bpm>0), detected_bpm REAL, analysis_status TEXT NOT NULL, duration REAL NOT NULL, audio_name TEXT NOT NULL, audio_file TEXT NOT NULL, image_name TEXT, image_file TEXT, image_mime TEXT, updated_at TEXT NOT NULL) STRICT; PRAGMA user_version=1;`);
    db.prepare('INSERT INTO exercises VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(source.id, 'Bestaande oefening', 'Bewaar deze opdracht', 120, 119.9, 'estimated', 60, 'old.mp3', `${source.id}.mp3`, null, null, null, '2026-10-10'); db.close();
    const library = await openLibrary(root);
    try { assert.equal(library.list()[0].description, 'Bewaar deze opdracht'); assert.equal(library.list()[0].detectedBpm, 119.9); assert.equal(library.saveRoutine(round()).title, 'Warming-up'); }
    finally { library.close(); }
  } finally { await rm(root, { recursive: true, force: true }); }
});
