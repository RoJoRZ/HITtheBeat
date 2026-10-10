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
