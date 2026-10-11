import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, readdir } from 'node:fs/promises';
import { audioFormat } from '../electron/audio-format.mjs';
import { openLibrary } from '../electron/library.mjs';
const aac = await readFile(new URL('./fixtures/pulse-aac.m4a', import.meta.url));
const alac = await readFile(new URL('./fixtures/pulse-alac.m4a', import.meta.url));
const change = (from, to) => { const bytes = Buffer.from(aac); const index = bytes.indexOf(from); assert.ok(index >= 0); bytes.write(to, index, 'ascii'); return bytes; };
test('AAC M4A recognition accepts real file, uppercase extension and byte subviews', () => {
  assert.deepEqual(audioFormat('Mijn oefening.M4A', aac), { extension: 'm4a', mime: 'audio/mp4' });
  const padded = Buffer.concat([Buffer.alloc(13), aac, Buffer.alloc(7)]);
  assert.equal(audioFormat('test.m4a', padded.subarray(13, 13 + aac.length)).mime, 'audio/mp4');
});
test('M4A refuses ALAC, protection, video, wrong extension, corrupt box sizes and truncation', () => {
  assert.throws(() => audioFormat('test.m4a', alac), /Apple Lossless/);
  assert.throws(() => audioFormat('test.m4a', change('mp4a', 'enca')), /beveiligd/);
  assert.throws(() => audioFormat('test.m4a', change('soun', 'vide')), /variant/);
  assert.throws(() => audioFormat('test.mp3', aac), /MP3/);
  assert.throws(() => audioFormat('test.wav', aac), /MP3 of M4A/);
  assert.throws(() => audioFormat('test.m4a', aac.subarray(0, aac.length - 1)), /beschadigd/);
  for (const size of [2, 7, 0xffffffff, 1]) { const bytes = Buffer.from(aac); bytes.writeUInt32BE(size, 0); assert.throws(() => audioFormat('test.m4a', bytes), /beschadigd/); }
});
test('M4A managed copy, extension, MIME, levels, fragments and session snapshot survive reopen beside MP3', async () => {
  const root = await mkdtemp('/tmp/hitthebeat-m4a-store-'); let library = await openLibrary(root);
  try {
    const input = { title: 'AAC', description: 'Ontspannen.', bpm: 120, detectedBpm: 120, analysisStatus: 'estimated', duration: 6, normalizationDb: 3, normalizeAudio: true };
    const source = await library.save({ ...input, audio: { name: '../Origineel.M4A', bytes: aac } });
    await library.save({ ...input, title: 'Bestaande MP3', audio: { name: 'oud.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]) } });
    library.saveFragment(source.id, { name: 'Overgang', start: 1, end: 2 });
    await library.save({ ...source, description: 'Nieuwe opdracht' });
    const routine = library.saveRoutine({ title: 'AAC sessie', blocks: [{ id: crypto.randomUUID(), exerciseId: source.id, steps: [{ id: crypto.randomUUID(), start: null, end: null, repetitions: 1, bpm: 90 }] }] });
    const session = library.startSession(routine.id);
    library.close(); library = await openLibrary(root);
    const saved = library.list().find(item => item.id === source.id);
    assert.equal(saved.audioName, '../Origineel.M4A'); assert.equal(saved.normalizationDb, 3); assert.equal(saved.normalizeAudio, true); assert.equal(saved.fragments[0].name, 'Overgang');
    assert.deepEqual((await library.read(source.id, 'audio')).bytes, new Uint8Array(aac)); assert.equal((await library.read(source.id, 'audio')).mime, 'audio/mp4');
    assert.equal((await readdir(root + '/media')).filter(name => name.endsWith('.m4a')).length, 1);
    assert.equal(library.listSessions()[0].id, session.id); assert.equal(library.listSessions()[0].exercises[0].audioName, '../Origineel.M4A');
    const count = library.list().length, media = await readdir(root + '/media');
    await assert.rejects(library.save({ ...input, audio: { name: 'ALAC.m4a', bytes: alac } }), /Apple Lossless/);
    assert.equal(library.list().length, count); assert.deepEqual(await readdir(root + '/media'), media);
  } finally { library.close(); await rm(root, { recursive: true, force: true }); }
});
