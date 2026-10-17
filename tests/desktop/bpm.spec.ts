import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Mp3Encoder } from '@breezystack/lamejs';
import { rhythm } from '../tempo-fixtures.mjs';

async function wholeBpm(page: import('@playwright/test').Page) {
  const text=await page.locator('body').innerText(); expect(text).not.toMatch(/\d+[.,]\d+\s*BPM/);
  const labels=await page.locator('[aria-label]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')).join(' '));expect(labels).not.toMatch(/\d+[.,]\d+\s*BPM/);
}
test('whole BPM presentation preserves fractional exercises, plans and historical snapshots until explicitly edited',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-bpm-display-')),executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
 const app=await electron.launch({executablePath,args:[...(executablePath?[]:['.']),`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
 try{
  const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();await page.waitForLoadState('load');
  const bytes=Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
  const original=await page.evaluate(async bytes=>{
   const api=window.hitthebeat!,exercise=await api.saveExercise({title:'Fractionele bron',description:'',bpm:120.4,detectedBpm:119.6,analysisStatus:'estimated',duration:6,audio:{name:'bron.m4a',bytes:new Uint8Array(bytes)}});
   const routine=await api.saveRoutine({title:'Precieze sessie',countIn:undefined,blocks:[{id:crypto.randomUUID(),exerciseId:exercise.id,countIn:{enabled:true,meter:'4/4'},steps:[{id:crypto.randomUUID(),bpm:95.7,repetitions:1,start:0,end:1}]}]});
   const session=await api.startSession(routine.id),seconds=120.4/95.7;
   await api.saveSession(session.id,{...session.progress,seq:1,phase:'complete',passes:1,statuses:['completed'],times:{planned:seconds,fragment:0,pause:0,preparation:2},played:[{mode:'planned',block:0,step:0,a:0,b:1,bpm:95.7,pitch:0,seconds,completed:1}]},'completed');
   return {exercise,routine,history:(await api.listSessions())[0]};
  },bytes);
  await page.reload();await page.context().setOffline(true);
  await page.getByRole('button',{name:'Oefeningen',exact:true}).click();await expect(page.getByRole('definition').filter({hasText:/^120 BPM$/})).toBeVisible();await wholeBpm(page);
  const localTempo=page.getByLabel('Speeltempo BPM',{exact:true});await expect(localTempo).toHaveValue('120');await localTempo.focus();await localTempo.press('Tab');await expect(localTempo).toHaveValue('120');
  await page.getByRole('button',{name:'Bewerken',exact:true}).click();await expect(page.getByLabel('Origineel BPM',{exact:true})).toHaveValue('120');
  await page.getByLabel('Opdracht',{exact:true}).fill('Alleen de opdracht gewijzigd.');await page.getByRole('button',{name:'Oefening opslaan',exact:true}).click();
  let stored=(await page.evaluate(()=>window.hitthebeat!.listExercises()))[0];expect(stored.bpm).toBe(120.4);expect(stored.detectedBpm).toBe(119.6);
  await page.getByRole('button',{name:'Mijn oefensessies',exact:true}).click();await page.getByRole('article',{name:'Precieze sessie'}).getByRole('button',{name:'Bewerken'}).click();
  const step=page.getByLabel('BPM oefening 1 stap 1',{exact:true});await expect(step).toHaveValue('96');
  await page.getByLabel('Naam van de sessie',{exact:true}).fill('Precieze sessie hernoemd');await page.getByRole('button',{name:'Sessie opslaan',exact:true}).click();
  expect((await page.evaluate(()=>window.hitthebeat!.listRoutines()))[0].blocks[0].steps[0].bpm).toBe(95.7);
  await page.getByRole('button',{name:'Sessie starten',exact:true}).click();await expect(page.getByTestId('session-bpm')).toHaveText('96 BPM');await wholeBpm(page);
  await page.getByRole('button',{name:'Afspelen',exact:true}).click();await expect(page.getByTestId('count-in')).toContainText('96 BPM');await page.getByRole('button',{name:'Fragment oefenen',exact:true}).click();
  await expect(page.getByLabel('Speeltempo BPM',{exact:true})).toHaveValue('96');await page.getByLabel('Speeltempo BPM',{exact:true}).focus();await page.getByLabel('Speeltempo BPM',{exact:true}).press('Tab');await wholeBpm(page);
  await page.getByRole('button',{name:'Mijn oefensessies',exact:true}).click();await page.getByRole('button',{name:'Stoppen en terug',exact:true}).click();
  const records=await page.evaluate(()=>window.hitthebeat!.listSessions());expect(records.find(s=>s.id===original.history.id)).toEqual(original.history);
  await page.getByRole('button',{name:'Voortgang',exact:true}).click();await expect(page.getByRole('heading',{name:'Tempo-ontwikkeling'})).toBeVisible();await wholeBpm(page);
  await expect(page.getByRole('img',{name:/laatst 96 BPM/})).toBeVisible();await page.getByText('Meetpunten bekijken',{exact:true}).click();await page.getByText('Fragmenten en evaluaties bekijken',{exact:true}).first().click();await wholeBpm(page);
  await page.screenshot({path:'test-results/bpm-progress.png',fullPage:true});
  await page.getByRole('button',{name:'Oefeningen',exact:true}).click();await page.getByRole('button',{name:'Bewerken',exact:true}).click();
  await page.getByRole('button',{name:'Halveer BPM',exact:true}).click();await expect(page.getByLabel('Origineel BPM',{exact:true})).toHaveValue('60');
  await page.getByRole('button',{name:'Verdubbel BPM',exact:true}).click();await expect(page.getByLabel('Origineel BPM',{exact:true})).toHaveValue('120');
  await page.getByLabel('Origineel BPM',{exact:true}).fill('124');await page.getByRole('button',{name:'Oefening opslaan',exact:true}).click();
  stored=(await page.evaluate(()=>window.hitthebeat!.listExercises()))[0];expect(stored.bpm).toBe(124);
  expect((await page.evaluate(()=>window.hitthebeat!.listSessions())).find(s=>s.id===original.history.id)).toEqual(original.history);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});

test('MP3 worker detects accented subdivisions and retains a manual BPM entered during analysis',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-bpm-worker-')),executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
 const app=await electron.launch({executablePath,args:[...(executablePath?[]:['.']),`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
 try{
  const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();await page.getByRole('button',{name:'Oefeningen',exact:true}).click();await page.getByRole('button',{name:'Oefening toevoegen',exact:true}).click();
  const {samples,sampleRate}=rhythm(85,{division:2,pattern:[1,.6],accompaniment:true}),encoder=new Mp3Encoder(1,sampleRate,96),chunks:Uint8Array[]=[];
  for(let i=0;i<samples.length;i+=1152)chunks.push(encoder.encodeBuffer(Int16Array.from(samples.subarray(i,i+1152),v=>Math.round(Math.max(-1,Math.min(1,v))*32767))));chunks.push(encoder.flush());
  await page.getByLabel('Audiobestand (MP3 of M4A)',{exact:true}).setInputFiles({name:'Geaccentueerd.mp3',mimeType:'audio/mpeg',buffer:Buffer.concat(chunks.map(c=>Buffer.from(c)))});
  await page.getByLabel('Origineel BPM',{exact:true}).fill('88');
  await expect(page.getByRole('status')).toContainText('Geschat tempo: 85 BPM',{timeout:15000});await expect(page.getByLabel('Origineel BPM',{exact:true})).toHaveValue('88');await wholeBpm(page);
  await page.setViewportSize({width:960,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/bpm-detection.png',fullPage:true});
  await page.getByRole('button',{name:'Oefening opslaan',exact:true}).click();expect((await page.evaluate(()=>window.hitthebeat!.listExercises()))[0].bpm).toBe(88);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
