import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { dashboardSettings } from '../electron/dashboard-settings.mjs';
import { buildDashboard } from '../src/library/progress.mjs';
test('dashboard preferences default to all/min, persist independently of language, validate and survive write failures', async () => {
 const root = await mkdtemp(path.join(os.tmpdir(),'htb-dashboard-'));
 try {
  await writeFile(path.join(root,'preferences.json'), '{"version":1,"language":"en"}');
  const settings = await dashboardSettings(root); assert.deepEqual(settings.get(), {period:'all',tempo:'min'});
  await Promise.all([settings.set({period:'month',tempo:'max'}),settings.set({period:'year',tempo:'average'})]);
  assert.deepEqual((await dashboardSettings(root)).get(), {period:'year',tempo:'average'});
  assert.equal(await readFile(path.join(root,'preferences.json'),'utf8'),'{"version":1,"language":"en"}');
  await assert.rejects(settings.set({period:'bogus',tempo:'min'}));
  await assert.rejects(settings.set({period:'all',tempo:'min',extra:true}));
  await rm(root,{recursive:true}); await assert.rejects(settings.set({period:'all',tempo:'min'}));
  assert.deepEqual(settings.get(), {period:'year',tempo:'average'});
 } finally { await rm(root,{recursive:true,force:true}); }
});
test('tempo combines all blocks, fragments and partial playback per exercise/session without changing history', () => {
 const played = [{block:0,step:0,mode:'planned',seconds:10,bpm:100,completed:1},{block:1,step:0,mode:'fragment',seconds:30,bpm:60,completed:0},{block:0,step:0,mode:'planned',seconds:0,bpm:300,completed:0},{block:0,step:0,mode:'planned',seconds:10,bpm:80,completed:0}];
 const session={id:'s',startedAt:'2026-10-28T10:00:00Z',status:'stopped',routine:{id:'r',title:'R',blocks:[{id:'b',exerciseId:'e',steps:[{start:null,end:null}]},{id:'c',exerciseId:'e',steps:[{start:1,end:2}]}]},exercises:[{id:'e',title:'E',bpm:120,duration:10}],evaluations:[],progress:{times:{planned:20,fragment:30},played}};
 const before=structuredClone(session), opts={period:'all',now:new Date('2026-10-28T12:00:00Z'),timeZone:'UTC'};
 for(const [tempo,bpm] of [['min',60],['max',100],['average',72]]) {
  const data=buildDashboard([session],{...opts,tempo}); assert.equal(data.tempoGroups.length,1); assert.equal(data.tempoGroups[0].points.length,1);assert.equal(data.tempoGroups[0].points[0].bpm,bpm);
 }
 assert.deepEqual(session,before);
});
