import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { validateCountIn, countInSeconds, plannedPreparation } from '../electron/count-in-model.mjs';
import { openLibrary } from '../electron/library.mjs';
import { createRun, advance, remainingSeconds, remainingPreparation } from '../src/session/runner.ts';
import { validateProgress } from '../electron/session-model.mjs';
import { buildDashboard } from '../src/library/progress.mjs';
const source = { id: randomUUID(), title: 'Bron', description: '', bpm: 120, duration: 6, detectedBpm: null, analysisStatus: 'unavailable' };
const makeStep = (bpm=120,repetitions=1) => ({id:randomUUID(),bpm,repetitions,start:null,end:null});
const makeRoutine = () => ({ id: randomUUID(), title: 'Aftellen', updatedAt:'', countIn:{enabled:true,meter:'4/4'}, blocks:[{id:randomUUID(),exerciseId:source.id,steps:[makeStep(120,2),makeStep(60)]}] });

test('one count-in bar uses quarter-note BPM, defaults off and validates settings', () => {
  assert.equal(countInSeconds({},120),0);
  for (const [meter,seconds] of [['3/4',1.5],['4/4',2],['6/8',1.5]]) {
    assert.deepEqual(validateCountIn({enabled:true,meter}),{enabled:true,meter});
    assert.equal(countInSeconds({countIn:{enabled:true,meter}},120),seconds);
    assert.equal(countInSeconds({countIn:{enabled:true,meter}},240),seconds/2);
  }
  for(const value of [null,{},true,{enabled:1,meter:'4/4'},{enabled:true,meter:'7/8'}]) assert.throws(()=>validateCountIn(value));
  assert.throws(()=>countInSeconds(makeRoutine(),0));
  assert.equal(plannedPreparation(makeRoutine()),8);
});
test('every repeat and tempo change counts first; count-in cannot complete a music pass', () => {
  let run = advance(createRun(makeRoutine(),[source]),'play'); assert.equal(run.phase,'countin');
  assert.equal(advance(run,'ended'),run); assert.equal(run.passes,0);
  assert.equal(remainingSeconds(run),24); assert.equal(remainingPreparation(run,1),7);
  run=advance(run,'counted'); assert.equal(run.phase,'playing'); assert.equal(remainingPreparation(run),6);
  run=advance(run,'ended'); assert.equal(run.phase,'countin'); assert.equal(run.repetition,1);
  run=advance(advance(run,'counted'),'ended'); assert.equal(run.phase,'countin'); assert.equal(run.step,1);
  assert.equal(countInSeconds(run.routine,60),4); assert.equal(remainingPreparation(run,3),3);
  run=advance(advance(run,'counted'),'ended'); assert.equal(run.phase,'review'); assert.equal(run.passes,3);
  assert.equal(advance(run,'repeat').phase,'countin'); run=advance(run,'next'); assert.equal(run.phase,'complete'); assert.equal(remainingPreparation(run),0);
});
test('pause while counting restarts bar; pause in music resumes without a new count; restart and fragment return count again', () => {
  let run=advance(createRun(makeRoutine(),[source]),'play');
  run=advance(run,'pause'); assert.equal(run.phase,'paused'); assert.equal(run.resumeCountIn,true); assert.equal(advance(run,'play').phase,'countin');
  run=advance(advance(run,'play'),'counted'); run=advance(run,'pause'); assert.equal(run.resumeCountIn,false); run=advance(run,'play'); assert.equal(run.phase,'playing');
  assert.equal(advance(run,'restart').phase,'countin');
  run=advance(run,'fragment'); assert.equal(run.phase,'fragment'); assert.equal(advance(run,'return').phase,'countin');
  run=advance(advance(advance(run,'return'),'pause'),'fragment'); run=advance(run,'return'); assert.equal(run.phase,'paused'); assert.equal(advance(run,'play').phase,'countin');
  const input=makeRoutine(); input.blocks.push({id:randomUUID(),exerciseId:source.id,steps:[makeStep()]});
  run=advance(advance(createRun(input,[source]),'play'),'skip'); assert.equal(run.phase,'countin'); assert.equal(run.block,1); assert.equal(run.passes,0);
});
test('preparation is separately validated and excluded from practice days, time and tempo', () => {
  const routine=makeRoutine(); const progress={seq:1,block:0,step:0,repetition:0,phase:'countin',passes:0,statuses:['pending'],times:{planned:0,fragment:0,pause:0,preparation:1},played:[]};
  const snapshot={routine,exercises:[source]}; assert.deepEqual(validateProgress(progress,snapshot),progress);
  assert.throws(()=>validateProgress(progress,{...snapshot,routine:{...routine,countIn:undefined}}));
  for(const preparation of [-1,NaN,Infinity]) assert.throws(()=>validateProgress({...progress,times:{...progress.times,preparation}},snapshot));
  const session={...snapshot,id:randomUUID(),startedAt:'2026-10-15T12:00:00Z',status:'stopped',progress,evaluations:[]};
  const dashboard=buildDashboard([session],{period:'all',now:new Date('2026-10-15T15:00:00Z'),timeZone:'Europe/Amsterdam'});
  assert.equal(dashboard.totalSeconds,0); assert.equal(dashboard.practiceDays,0); assert.equal(dashboard.groups.length,0); assert.equal(dashboard.sessions.length,1);
});
test('count-in persists on the session plan, keeps snapshots and migrates schema 7 without enabling existing plans', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-count-store-')); let library=await openLibrary(root);
  try {
    const exercise=await library.save({...source,id:undefined,audio:{name:'test.mp3',bytes:new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0])}});
    const input=makeRoutine();input.id=undefined;input.blocks[0].exerciseId=exercise.id;
    let routine=library.saveRoutine(input); assert.deepEqual(routine.countIn,input.countIn); const session=library.startSession(routine.id);
    routine=library.saveRoutine({...routine,countIn:{enabled:false,meter:'6/8'}}); assert.equal(library.listSessions()[0].routine.countIn.enabled,true);
    const prep={...session.progress,seq:1,phase:'countin',times:{planned:0,fragment:0,pause:0,preparation:1}};
    library.saveSession(session.id,prep); assert.throws(()=>library.saveSession(session.id,{...prep,seq:2,times:{...prep.times,preparation:0}}),/teruglopen/);
    library.close();library=await openLibrary(root);assert.deepEqual(library.listRoutines()[0].countIn,{enabled:false,meter:'6/8'});assert.equal(library.listSessions()[0].progress.times.preparation,1);
    library.close(); const db=new DatabaseSync(path.join(root,'library.sqlite'));db.exec('ALTER TABLE routines DROP COLUMN count_in; PRAGMA user_version=7;');db.close();library=await openLibrary(root);
    assert.equal(library.listRoutines()[0].countIn,undefined);assert.equal(library.listSessions()[0].routine.countIn.enabled,true);
  } finally {library.close();await rm(root,{recursive:true,force:true});}
});
