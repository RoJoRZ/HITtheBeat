import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateTempo } from '../src/audio/bpm.ts';

function fixture(bpm, { duration = 16, intro = 0, plucked = false } = {}) {
  const sr = 22050, data = new Float32Array(sr * duration);
  for (let t = intro; t < duration; t += 60 / bpm) {
    const start = Math.round(t * sr);
    const length = Math.round((plucked ? .18 : .025) * sr);
    for (let i = 0; i < length && start + i < data.length; i++) {
      const age = i / sr;
      data[start + i] += .5 * Math.exp(-age * (plucked ? 20 : 150)) * (Math.sin(2 * Math.PI * (plucked ? 220 : 1100) * age) + .3 * Math.sin(2 * Math.PI * 330 * age));
    }
  }
  return data;
}
for (const bpm of [60, 75, 90, 95, 120, 180, 220]) {
  test(`estimates regular onsets and plucked notes at ${bpm} BPM`, () => {
    for (const plucked of [false, true]) {
      const result = estimateTempo(fixture(bpm, { intro: 2, plucked }), 22050);
      assert.ok(result.bpm && Math.abs(result.bpm - bpm) < 2, JSON.stringify({ bpm, plucked, result }));
    }
  });
}
test('silence, constant tone and insufficient audio do not fabricate a tempo', () => {
  assert.equal(estimateTempo(new Float32Array(22050 * 10), 22050).bpm, null);
  assert.equal(estimateTempo(Float32Array.from({length:22050*10}, (_,i)=>.3*Math.sin(2*Math.PI*440*i/22050)), 22050).bpm, null);
  assert.equal(estimateTempo(fixture(120, { duration: 2 }), 22050).bpm, null);
});
