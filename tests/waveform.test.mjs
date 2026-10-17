import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWaveform, visiblePeaks, selectionRange, timeAt, viewportRange } from '../src/audio/waveform.mjs';

test('peak pyramid retains short transients in both stereo channels and bounds memory', () => {
  const left = new Float32Array(200000), right = new Float32Array(200000); left[10] = .5; right[190000] = -1;
  const wave = buildWaveform([left, right], 1000);
  assert.ok(wave.levels[0].length <= 65536); assert.equal(wave.duration, 200); assert.equal(wave.levels.at(-1)[0], 1);
  assert.ok(visiblePeaks(wave, 0, 1, 10).some(v => v === .5));
  assert.ok(visiblePeaks(wave, 189, 191, 10).some(v => v === 1));
  assert.ok(visiblePeaks(wave, 10, 20).every(v => v === 0));
  assert.throws(() => buildWaveform([], 44100)); assert.throws(() => buildWaveform([left, right.subarray(1)],1000));
});
test('selection uses canonical source time, supports reverse drags, clamps bounds and enforces the playable minimum', () => {
  assert.deepEqual(selectionRange(8,2,10),{a:2,b:8}); assert.deepEqual(selectionRange(-2,20,10),{a:0,b:10});
  for(const [from,to] of [[10,10],[0,0],[.3,.301],[9.99,10]]) {const r=selectionRange(from,to,10);assert.ok(r.a>=0&&r.b<=10&&r.b-r.a>=.1);}
  assert.equal(timeAt(350,100,500,2,7),4.5); assert.equal(timeAt(-1,100,500,2,7),2); assert.equal(timeAt(900,100,500,2,7),7);
  const selected={a:2.345,b:4.567};const zoomed=viewportRange(2,3,10);assert.equal(timeAt(100+(.345/3)*500,100,500,zoomed.start,zoomed.end),selected.a);
  assert.deepEqual(selected,{a:2.345,b:4.567}); assert.deepEqual(viewportRange(99,3,10),{start:7,end:10});assert.deepEqual(viewportRange(-10,20,10),{start:0,end:10});
});
