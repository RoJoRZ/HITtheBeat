import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
test('settings confirms deletion impact, cancel preserves history, mixed results survive and removal persists offline', async () => {
 const root=await mkdtemp(path.join(tmpdir(),'htb-purge-ui-'));
 const executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
 const launch=()=>electron.launch({executablePath,args:[...(executablePath?[]:['.']),'--lang=nl-NL',`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
 let app=await launch();
 try {
  let page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();
  const ids=await page.evaluate(async()=>{
   const api=window.hitthebeat!,make=async(title:string)=>api.saveExercise({kind:'metronome',title,description:'',bpm:120,duration:0,meter:'4/4',bars:1,detectedBpm:null,analysisStatus:'unavailable'});
   const a=await make('Opruimen'),b=await make('Behouden');
   const routine=await api.saveRoutine({title:'Gemengd',blocks:[a,b].map(e=>({id:crypto.randomUUID(),exerciseId:e.id,steps:[{id:crypto.randomUUID(),bpm:120,repetitions:1,start:null,end:null}]}))});
   const run=await api.startSession(routine.id);
   await api.saveSession(run.id,{...run.progress,seq:1,phase:'complete',block:1,passes:2,statuses:['completed','completed'],times:{planned:4,fragment:0,pause:0},played:[0,1].map(block=>({mode:'planned',block,step:0,a:0,b:2,bpm:120,pitch:0,seconds:2,completed:1}))},'completed');
   return {a:a.id,b:b.id};
  });
  const before=await page.evaluate(()=>window.hitthebeat!.listSessions());
  await page.getByRole('button',{name:'Instellingen',exact:true}).click();
  await expect(page.getByRole('row').filter({hasText:'Opruimen'})).toContainText('0:02');
  // Stub only the native dialog in this isolated fixture, recording its impact text.
  await app.evaluate(({dialog})=>{dialog.showMessageBox=async(_owner:any,options:any)=>{(globalThis as any).progressPrompt=options;return {response:1,checkboxChecked:false};};});
  await page.getByRole('button',{name:'Voortgang van Opruimen verwijderen',exact:true}).click();
  await expect(page.getByRole('button',{name:'Voortgang van Opruimen verwijderen',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>window.hitthebeat!.listSessions())).toEqual(before);
  const prompt=await app.evaluate(()=> (globalThis as any).progressPrompt);
  expect(prompt.defaultId).toBe(1);expect(prompt.cancelId).toBe(1);expect(prompt.message).toContain('Opruimen');expect(prompt.detail).toContain('1 sessies · 2 seconden');expect(prompt.detail).toContain('niet ongedaan');
  await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:0,checkboxChecked:false});});
  await page.getByRole('button',{name:'Voortgang van Opruimen verwijderen',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Opruimen');
  await expect(page.getByRole('button',{name:'Voortgang van Opruimen verwijderen',exact:true})).toHaveCount(0);
  const after=await page.evaluate(()=>window.hitthebeat!.listSessions());
  expect(after[0].routine).toEqual(before[0].routine);expect(after[0].progress.played).toEqual(before[0].progress.played.filter(p=>p.block===1));
  expect((await page.evaluate(()=>window.hitthebeat!.listExercises())).map(e=>e.id)).toContain(ids.a);
  await app.close();app=await launch();page=await app.firstWindow();await page.context().setOffline(true);
  await page.getByRole('button',{name:'Voortgang',exact:true}).click();await expect(page.getByTestId('dashboard-time')).toHaveText('0:02');await expect(page.getByTestId('dashboard-sessions')).toHaveText('1');await expect(page.getByRole('checkbox',{name:'Opruimen',exact:true})).toHaveCount(0);await expect(page.getByRole('checkbox',{name:'Behouden',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Instellingen',exact:true}).click();await expect(page.getByRole('button',{name:'Voortgang van Opruimen verwijderen',exact:true})).toHaveCount(0);
  await page.evaluate(()=>window.hitthebeat!.setLanguage('en'));await expect(page.getByRole('heading',{name:'Delete saved progress',exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/dashboard-manage.png',fullPage:true});
 } finally {await app.close();await rm(root,{recursive:true,force:true});}
});
