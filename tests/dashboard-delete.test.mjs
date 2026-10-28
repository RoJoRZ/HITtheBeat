import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openLibrary } from '../electron/library.mjs';
import { buildDashboard } from '../src/library/progress.mjs';
async function fixture(run) {
 const root=await mkdtemp(path.join(tmpdir(),'htb-purge-')); let library=await openLibrary(root);
 try {
  const save=title=>library.save({title,description:'',bpm:120,duration:20,detectedBpm:null,analysisStatus:'unavailable',audio:{name:'t.mp3',bytes:new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0])}});
  const a=await save('Zelfde naam'),b=await save('Zelfde naam');
  const block=id=>({id:randomUUID(),exerciseId:id,steps:[{id:randomUUID(),bpm:120,repetitions:1,start:null,end:null}]});
  const mixed=library.saveRoutine({title:'Gemengd',blocks:[block(a.id),block(b.id)]});
  const single=library.saveRoutine({title:'Enkel',blocks:[block(a.id)]});
  const played=(block,seconds=20)=>({mode:'planned',block,step:0,a:0,b:20,bpm:120,pitch:0,seconds,completed:1});
  function complete(routine) {
   let s=library.startSession(routine.id);
   const playedItems=routine.blocks.map((_,i)=>played(i));
   library.saveSession(s.id,{...s.progress,seq:1,phase:'review',passes:1,times:{planned:20,fragment:0,pause:1},played:[played(0)]});
   library.reviewSession(s.id,{id:randomUUID(),block:0,fromStep:0,toStep:0,action:'same',delta:0,note:'A',rating:2});
   const last=routine.blocks.length-1;
   library.saveSession(s.id,{...s.progress,seq:2,block:last,phase:'review',passes:playedItems.length,statuses:routine.blocks.map(()=> 'completed'),times:{planned:20*playedItems.length,fragment:last ? 5 : 0,pause:1},played:last ? [...playedItems,{...played(0,5),mode:'fragment',a:2,b:4,bpm:60,completed:0}] : playedItems});
   if(last) library.reviewSession(s.id,{id:randomUUID(),block:last,fromStep:0,toStep:0,action:'same',delta:0,note:'B',rating:5});
   s=library.listSessions().find(item=>item.id===s.id);
   return library.saveSession(s.id,{...s.progress,seq:3,phase:'complete'},'completed');
  }
  const first=complete(mixed),second=complete(single);
  await run({library,root,a,b,mixed,single,first,second,complete,reopen:async()=>{library.close();library=await openLibrary(root);return library;}});
 } finally {library.close();await rm(root,{recursive:true,force:true});}
}
test('deleting one identity preserves mixed snapshots, other results and media; empty sessions stop counting and new practice returns',async()=>fixture(async({library,a,b,mixed,single,first,reopen})=>{
 const before=library.listSessions(), preview=library.practiceDeletionPreview(a.id);
 assert.equal(preview.sessions,2);assert.equal(preview.seconds,45);
 library.deletePracticeProgress(a.id,preview.fingerprint);
 const records=library.listSessions(),kept=records.find(s=>s.id===first.id);
 assert.deepEqual(kept.routine,first.routine);assert.deepEqual(kept.exercises,first.exercises);
 assert.deepEqual(kept.progress.played,first.progress.played.filter(p=>p.block===1));assert.deepEqual(kept.evaluations,first.evaluations.filter(e=>e.block===1));
 assert.equal(kept.startedAt,first.startedAt);assert.equal(kept.updatedAt,first.updatedAt);
 const dashboard=buildDashboard(records);assert.equal(dashboard.totalSeconds,20);assert.equal(dashboard.practicedSessions,1);assert.equal(dashboard.completedSessions,1);assert.equal(dashboard.tempoGroups[0].exerciseId,b.id);
 assert.equal(library.list().length,2);assert.equal(library.listRoutines().length,2);assert.equal((await library.read(a.id,'audio')).bytes.length,12);
 library=await reopen();assert.equal(library.listPracticeProgress().some(p=>p.id===a.id),false);assert.deepEqual(library.listSessions(),records);
 const newSession=library.startSession(single.id);library.saveSession(newSession.id,{...newSession.progress,seq:1,phase:'paused',passes:0,times:{planned:1,fragment:0,pause:0},played:[{mode:'planned',block:0,step:0,a:0,b:20,bpm:120,pitch:0,seconds:1,completed:0}]},'stopped');
 assert.equal(library.listPracticeProgress().find(p=>p.id===a.id).seconds,1);assert.equal(before.length,2);
}));
test('invalid identity, active sessions and stale confirmation reject atomically, including deleted library sources',async()=>fixture(async({library,a,single,mixed})=>{
 const before=library.listSessions();assert.throws(()=>library.practiceDeletionPreview('../bad'));
 const old=library.practiceDeletionPreview(a.id),running=library.startSession(single.id);
 assert.throws(()=>library.deletePracticeProgress(a.id,old.fingerprint),/lopende sessie/);
 library.saveSession(running.id,{...running.progress,seq:1},'stopped');
 assert.throws(()=>library.deletePracticeProgress(a.id,old.fingerprint),/gewijzigd/);
 library.deleteRoutine(single.id);library.deleteRoutine(mixed.id);await library.deleteExercise(a.id);
 assert.ok(library.listPracticeProgress().some(p=>p.id===a.id));
 const preview=library.practiceDeletionPreview(a.id);library.deletePracticeProgress(a.id,preview.fingerprint);
 assert.equal(library.listPracticeProgress().some(p=>p.id===a.id),false);assert.deepEqual(library.listSessions().find(s=>s.id===before[0].id).exercises,before[0].exercises);
}));
test('a storage error rolls back every affected session',async()=>fixture(async({library,root,a})=>{
 const before=library.listSessions(),preview=library.practiceDeletionPreview(a.id);
 const db=new DatabaseSync(path.join(root,'library.sqlite'));const target=before.at(-1).id;
 db.exec(`CREATE TRIGGER refuse_purge BEFORE UPDATE ON sessions WHEN NEW.id='${target}' BEGIN SELECT RAISE(ABORT,'blocked'); END;`);
 try {assert.throws(()=>library.deletePracticeProgress(a.id,preview.fingerprint),/blocked/);assert.deepEqual(library.listSessions(),before);}finally{db.close();}
}));
