import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fitTapTempo} from '../src/audio/tap-tempo.mjs';
test('short measures and long tap series determine precise tempo and phase together',()=>{
 for(const bpm of [40,60,123.45,240])for(const count of [3,4,16]){
  const p=60/bpm,r=fitTapTempo(Array.from({length:count},(_,i)=>.17+i*p));
  assert.ok(r);assert.ok(Math.abs(r.bpm-bpm)<1e-8);assert.ok(Math.abs(r.beatOffset-.17)<1e-8);assert.equal(r.short,count<8);
 }
 const taps=Array.from({length:16},(_,i)=>.13+i*.5+Math.sin(i*2.1)*.008),r=fitTapTempo(taps);
 assert.ok(r);assert.ok(Math.abs(r.bpm-120)<.2);assert.ok(Math.abs(r.beatOffset-.13)<.006);
});
test('first tap is not an anchor; enough regular evidence can reject an incidental outlier',()=>{
 const taps=Array.from({length:12},(_,i)=>.2+i*.5);taps[0]=.05;taps[6]+=.12;
 const r=fitTapTempo(taps);assert.ok(r);assert.equal(r.used,10);assert.ok(Math.abs(r.bpm-120)<1e-8);assert.ok(Math.abs(r.beatOffset-.2)<1e-8);
});
test('insufficient, malformed, irregular, drifting and missed/double taps do not produce a stable result',()=>{
 for(const taps of [[],[.1],[.1,.6],[.1,NaN,1],[.1,.1,1],[.1,.9,.95],[-1,0,1],Array.from({length:17},(_,i)=>i*.5),[0,.4,1],[0,.25,.5,1,1.5,2], [0,.5,1,2,2.5,3],Array.from({length:12},(_,i)=>.1+i*.5+i*i*.01)])assert.equal(fitTapTempo(taps),null,JSON.stringify(taps));
});
test('a stable timing offset is retained, and equivalent phase does not require the first musical beat',()=>{
 const r=fitTapTempo([2.12,2.62,3.12,3.62]);assert.ok(r);assert.ok(Math.abs(r.beatOffset-.12)<1e-8);
 assert.equal(fitTapTempo([1,1.5,2,2.5]).beatOffset,0);
});
test('provisional RMS limits accept small jitter and reject above the 5 percent or 40 ms cap',()=>{
 for(const [period,good,bad]of [[.5,.024,.026],[1,.039,.041]]){
  const sequence=amplitude=>Array.from({length:16},(_,i)=>.15+i*period+(i%2?amplitude:-amplitude));
  assert.ok(fitTapTempo(sequence(good)));assert.equal(fitTapTempo(sequence(bad)),null);
 }
});
test('the 15 ms floor tolerates small fast-tempo jitter without discarding ordinary noisy taps',()=>{
 const sequence=amplitude=>Array.from({length:16},(_,i)=>.15+i*.25+Math.sin(i*Math.PI/2)*amplitude);
 assert.equal(fitTapTempo(sequence(.0205)).used,16);assert.equal(fitTapTempo(sequence(.022)),null);
});
