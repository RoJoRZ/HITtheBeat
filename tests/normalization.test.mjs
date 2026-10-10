import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizationLevel } from '../src/audio/normalization.ts';
const tone = (amplitude, seconds = 2) => Float32Array.from({ length: 8000 * seconds }, (_, i) => amplitude * Math.sin(2 * Math.PI * 440 * i / 8000));
const gain = result => 10 ** (result.db / 20);
test('quiet and loud versions converge on the same active RMS, preserving stereo and dynamics', () => {
  const quiet = normalizationLevel([tone(.05)], 8000), loud = normalizationLevel([tone(.5)], 8000);
  assert.ok(Math.abs(quiet.rms * gain(quiet) - loud.rms * gain(loud)) < 1e-7);
  assert.ok(Math.abs(quiet.rms * gain(quiet) - 10 ** (-18 / 20)) < 1e-7);
  const stereo = normalizationLevel([tone(.05), tone(.05)], 8000); assert.ok(Math.abs(stereo.db - quiet.db) < 1e-7);
  const inverted = normalizationLevel([tone(.05), Float32Array.from(tone(.05), sample => -sample)], 8000);
  assert.ok(Math.abs(inverted.db - quiet.db) < 1e-7);
});
test('leading and trailing silence keep matching within one decibel', () => {
  const plain = tone(.05), padded = new Float32Array(plain.length + 16000); padded.set(plain, 8000);
  assert.ok(Math.abs(normalizationLevel([plain], 8000).db - normalizationLevel([padded], 8000).db) < 1);
});
test('peaks cap amplification, very quiet audio stays unchanged, and silence remains finite', () => {
  const click = new Float32Array(16000); click[1000] = .9;
  const level = normalizationLevel([click], 8000);
  assert.ok(level.peak * gain(level) <= 10 ** (-1 / 20) + 1e-7); assert.equal(level.limited, true);
  const low = normalizationLevel([tone(.003)], 8000); assert.ok(low.db <= 12 + 1e-7);
  assert.equal(normalizationLevel([tone(.00001)], 8000).db, 0);
  assert.equal(normalizationLevel([new Float32Array(16000)], 8000).quiet, true);
});
test('reject malformed samples rather than propagating non-finite gain', () => {
  for (const [channels, rate] of [[[],8000], [[new Float32Array(0)],8000], [[tone(.2)],0], [[new Float32Array([NaN])],8000], [[tone(.2),new Float32Array(3)],8000]]) assert.throws(() => normalizationLevel(channels, rate));
});
