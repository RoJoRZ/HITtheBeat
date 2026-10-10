import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openLibrary } from '../electron/library.mjs';

const audio = { name: '../../original.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0,1]) };
const image = { name: 'tab.png', bytes: new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]) };
const input = { title: "Oefening ' ; --", description: 'Rustig\nblijven', bpm: 118, detectedBpm: 120, analysisStatus: 'estimated', duration: 12, audio, image };

test('managed media and corrected tempo survive reopen and metadata edits', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-store-')); let library;
  try {
    library = await openLibrary(root);
    const saved = await library.save(input);
    assert.equal(saved.bpm, 118); assert.equal(saved.detectedBpm, 120);
    assert.deepEqual((await library.read(saved.id, 'audio')).bytes, audio.bytes);
    assert.ok((await readdir(path.join(root, 'media'))).every(name => /^[0-9a-f-]{36}\.(mp3|png)$/.test(name)));
    library.close(); library = await openLibrary(root);
    assert.equal(library.list()[0].title, input.title);
    const changed = await library.save({ ...saved, description: 'Nieuwe opdracht', bpm: 116, image: null });
    assert.equal(changed.bpm, 116); assert.equal(changed.detectedBpm, 120);
    assert.equal(await library.read(saved.id, 'image'), null);
    assert.deepEqual((await library.read(saved.id, 'audio')).bytes, audio.bytes);
    assert.equal((await readdir(path.join(root, 'media'))).length, 1);
    await rm(path.join(root, 'media', (await readdir(path.join(root, 'media')))[0]));
    await assert.rejects(library.read(saved.id, 'audio'), /ontbreekt/);
  } finally { library?.close(); await rm(root, { recursive: true, force: true }); }
});

test('reject invalid identifiers, metadata and media without partial records', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-invalid-')); const library = await openLibrary(root);
  try {
    await assert.rejects(library.read('../secret', 'audio'), /Ongeldige/);
    for (const change of [{ bpm: NaN }, { title: '' }, { detectedBpm: 500 }, { audio: undefined }, { image: { name: 'script.svg', bytes: new TextEncoder().encode('<svg>arbitrary</svg>') } }, { audio: { name: 'bad.mp3', bytes: new Uint8Array(20) } }]) {
      await assert.rejects(library.save({ ...input, ...change }));
    }
    assert.equal(library.list().length, 0); assert.equal((await readdir(path.join(root, 'media'))).length, 0);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});

test('normalization metadata survives edits and reopen, original bytes remain intact, invalid gain is rejected', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-normalization-store-')); let library = await openLibrary(root);
  try {
    const saved = await library.save({ ...input, normalizationDb: 5.25, normalizeAudio: true });
    const changed = await library.save({ ...saved, title: 'Nieuw', normalizeAudio: false });
    assert.equal(changed.normalizationDb, 5.25); assert.equal(changed.normalizeAudio, false);
    const edited = await library.save({ id: saved.id, title: 'Ook gewijzigd', description: '', bpm: 118, detectedBpm: null, analysisStatus: 'unavailable', duration: 12 });
    assert.equal(edited.normalizationDb, 5.25); assert.equal(edited.normalizeAudio, false);
    library.close(); library = await openLibrary(root);
    assert.equal(library.list()[0].normalizationDb, 5.25); assert.deepEqual((await library.read(saved.id, 'audio')).bytes, audio.bytes);
    for (const value of [NaN, Infinity, 13, -61, 'loud']) await assert.rejects(library.save({ ...edited, normalizationDb: value }), /volumenormalisatie/);
    assert.equal(library.list()[0].normalizationDb, 5.25);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});

test('schema 3 upgrade preserves library, routines and session history without changing existing audio levels', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-volume-migrate-')); let library = await openLibrary(root);
  try {
    const exercise = await library.save(input);
    const { randomUUID } = await import('node:crypto');
    const routine = library.saveRoutine({ title: 'Voor upgrade', blocks: [{ id: randomUUID(), exerciseId: exercise.id, steps: [{ id: randomUUID(), start: null, end: null, bpm: 118, repetitions: 1 }] }] });
    const session = library.startSession(routine.id); library.interruptSessions();
    const history = library.listSessions(); library.close();
    const { DatabaseSync } = await import('node:sqlite'); const db = new DatabaseSync(path.join(root, 'library.sqlite'));
    db.exec('ALTER TABLE exercises DROP COLUMN normalization_db; ALTER TABLE exercises DROP COLUMN normalize_audio; PRAGMA user_version=3;'); db.close();
    library = await openLibrary(root);
    assert.equal(library.list()[0].normalizationDb, null); assert.equal(library.list()[0].normalizeAudio, true);
    assert.deepEqual(library.listRoutines()[0], routine); assert.deepEqual(library.listSessions(), history);
    assert.equal(library.listSessions()[0].id, session.id);
    assert.deepEqual((await library.read(exercise.id, 'audio')).bytes, audio.bytes);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});
