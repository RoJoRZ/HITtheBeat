import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { openLibrary } from '../electron/library.mjs';
import { decodeExercise, encodeExercise, validateCredit, MAX_PACKAGE_BYTES } from '../electron/exercise-sharing.mjs';
import { sharingDialogs } from '../electron/sharing-dialogs.mjs';
const audio={name:'../../original.mp3',bytes:new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0,1])};
const image={name:'tab.png',bytes:new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])};
const input={title:'Warme vingers',description:'Speel rustig.\nLuister.',bpm:118.4,detectedBpm:119.6,analysisStatus:'estimated',duration:12,audio,image,normalizationDb:4.2,normalizeAudio:true};
const credit={name:'Ro & band',message:'Veel plezier! <script>geen HTML</script>'};
async function setup(run){const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-sharing-'));const lib=await openLibrary(root);try{await run(lib,root);}finally{lib.close();await rm(root,{recursive:true,force:true});}}

test('audio package roundtrip preserves original media, precise settings, fragments and maker; new IDs and no overwrite',async()=>setup(async(lib,root)=>{
 const source=await lib.save(input);lib.saveFragment(source.id,{name:'Lastige passage',start:1.25,end:8.7});
 const routine=lib.saveRoutine({title:'Historie',blocks:[{id:randomUUID(),exerciseId:source.id,steps:[{id:randomUUID(),bpm:95.7,repetitions:1,start:null,end:null}]}]});lib.startSession(routine.id);lib.interruptSessions();const history=lib.listSessions();
 const bytes=encodeExercise(await lib.exportExercise(source.id),credit);const data=decodeExercise(bytes);
 const imported=await lib.save(data.input,data.fragments);
 assert.notEqual(imported.id,source.id);assert.notEqual(imported.fragments[0].id,lib.list().find(e=>e.id===source.id).fragments[0].id);
 assert.equal(imported.title,source.title);assert.equal(imported.bpm,118.4);assert.equal(imported.detectedBpm,119.6);assert.equal(imported.normalizationDb,4.2);assert.deepEqual(imported.credit,credit);
 assert.deepEqual((await lib.read(imported.id,'audio')).bytes,audio.bytes);assert.deepEqual((await lib.read(imported.id,'image')).bytes,image.bytes);
 assert.equal((await readdir(path.join(root,'media'))).length,4);assert.deepEqual(lib.listSessions(),history);assert.deepEqual(lib.listRoutines(),[routine]);
 const edited=await lib.save({...imported,title:'Eigen naam'});assert.deepEqual(edited.credit,credit);
 const second=decodeExercise(encodeExercise(await lib.exportExercise(imported.id),imported.credit));assert.deepEqual(second.input.credit,credit);assert.equal(second.fragments[0].start,1.25);
 assert.equal(decodeExercise(encodeExercise(await lib.exportExercise(source.id),null)).input.credit,null);
}));

test('metronome package has no audio, retains meter/bars and optional tab; absent attribution stays absent',async()=>setup(async(lib)=>{
 const source=await lib.save({...input,kind:'metronome',bpm:105,meter:'6/8',bars:13,audio:undefined});
 const decoded=decodeExercise(encodeExercise(await lib.exportExercise(source.id),null));const saved=await lib.save(decoded.input,decoded.fragments);
 assert.equal(saved.kind,'metronome');assert.equal(saved.meter,'6/8');assert.equal(saved.bars,13);assert.equal(await lib.read(saved.id,'audio'),null);assert.deepEqual((await lib.read(saved.id,'image')).bytes,image.bytes);assert.equal(saved.credit,null);
}));

test('reject corrupted/oversized/unsupported packages and malicious settings before adding records or media',async()=>setup(async(lib,root)=>{
 const source=await lib.save(input);const bytes=encodeExercise(await lib.exportExercise(source.id),credit);const base=JSON.parse(bytes);
 for(const change of [v=>v.version=99,v=>v.audio.data='!!!!',v=>v.audio.sha256='0'.repeat(64),v=>v.audio.data=v.audio.data+'====',v=>v.exercise.bpm=0,v=>v.exercise.duration=-1,v=>v.exercise.credit.name='x'.repeat(121),v=>v.exercise.fragments=[{name:'Bad',start:0,end:99}],v=>v.exercise.fragments=[{name:'A',start:0,end:1},{name:'a',start:1,end:2}],v=>v.image.data=null]) {
  const v=structuredClone(base);change(v);assert.throws(()=>decodeExercise(Buffer.from(JSON.stringify(v))));
 }
 assert.throws(()=>decodeExercise(Buffer.from('{broken')));assert.throws(()=>decodeExercise(Buffer.alloc(MAX_PACKAGE_BYTES+1)));
 assert.throws(()=>validateCredit({name:'',message:'Geen naam'}));assert.throws(()=>validateCredit({name:'a\0b',message:''}));
 await assert.rejects(lib.save({...input,title:'Ongeldige fragmenten'},[{name:'Buiten',start:0,end:20}]));
 assert.equal(lib.list().length,1);assert.equal((await readdir(path.join(root,'media'))).length,2);
 // Simulate failure after media writes: SQLite trigger aborts the insert, files roll back.
 const db=new DatabaseSync(path.join(root,'library.sqlite'));db.exec("CREATE TRIGGER reject_import BEFORE INSERT ON exercises BEGIN SELECT RAISE(ABORT,'test failure'); END;");
 const decoded=decodeExercise(bytes);await assert.rejects(lib.save(decoded.input,decoded.fragments),/test failure/);db.close();
 assert.equal(lib.list().length,1);assert.equal((await readdir(path.join(root,'media'))).length,2);
}));

test('native dialog boundary supports cancel, preview without writes, rename, token expiry and repeated independent imports',async()=>setup(async(lib,root)=>{
 const exercise=await lib.save(input),file=path.join(root,'shared.htbexercise');let canceled=false;
 const dialog={showSaveDialog:async()=>({canceled,filePath:file}),showOpenDialog:async()=>({canceled,filePaths:[file]})};
 const sharing=sharingDialogs({library:lib,dialog,owner:()=>null});
 canceled=true;assert.equal(await sharing.export(exercise.id,credit),false);assert.equal(await sharing.preview(),null);
 canceled=false;assert.equal(await sharing.export(exercise.id,credit),true);assert.ok((await readFile(file)).length);
 let preview=await sharing.preview();assert.deepEqual(preview.credit,credit);assert.equal(lib.list().length,1);
 sharing.cancel(preview.token);await assert.rejects(sharing.confirm(preview.token,'Nieuw'),/opnieuw/);
 preview=await sharing.preview();await assert.rejects(sharing.confirm('bad','Nieuw'),/opnieuw/);await assert.rejects(sharing.confirm(preview.token,''));
 const saved=await sharing.confirm(preview.token,'Mijn eigen naam');assert.equal(saved.title,'Mijn eigen naam');assert.deepEqual(saved.credit,credit);await assert.rejects(sharing.confirm(preview.token,'Nogmaals'),/opnieuw/);
 preview=await sharing.preview();const duplicate=await sharing.confirm(preview.token,exercise.title);assert.notEqual(duplicate.id,exercise.id);assert.equal(lib.list().length,3);
 await writeFile(file,'broken');await assert.rejects(sharing.preview());assert.equal(lib.list().length,3);
}));

test('schema 9 upgrade defaults attribution without rewriting legacy snapshots, then persists imported credit after reopening',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-credit-migration-'));let lib=await openLibrary(root);
 try{
  const source=await lib.save(input);const routine=lib.saveRoutine({title:'Oud',blocks:[{id:randomUUID(),exerciseId:source.id,steps:[{id:randomUUID(),bpm:100,repetitions:1,start:null,end:null}]}]});lib.startSession(routine.id);lib.interruptSessions();lib.close();
  const db=new DatabaseSync(path.join(root,'library.sqlite'));const rows=db.prepare('SELECT id,snapshot FROM sessions').all();for(const row of rows){const snapshot=JSON.parse(row.snapshot);snapshot.exercises.forEach(e=>delete e.credit);db.prepare('UPDATE sessions SET snapshot=? WHERE id=?').run(JSON.stringify(snapshot),row.id);}const old=db.prepare('SELECT snapshot FROM sessions').get().snapshot;db.exec('ALTER TABLE exercises DROP COLUMN credit; PRAGMA user_version=9;');db.close();
  lib=await openLibrary(root);assert.equal(lib.list()[0].credit,null);assert.equal('credit' in lib.listSessions()[0].exercises[0],false);
  const decoded=decodeExercise(encodeExercise(await lib.exportExercise(source.id),credit));await lib.save(decoded.input,decoded.fragments);lib.close();lib=await openLibrary(root);assert.deepEqual(lib.list().find(e=>e.credit)?.credit,credit);
  const check=new DatabaseSync(path.join(root,'library.sqlite'));assert.equal(check.prepare('SELECT snapshot FROM sessions').get().snapshot,old);check.close();
 }finally{lib.close();await rm(root,{recursive:true,force:true});}
});
