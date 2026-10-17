import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('session count-in persists, counts each pass at its BPM, pauses/restarts, returns from free training, and excludes preparation from practice', async () => {
  test.setTimeout(70000);
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-count-ui-')), executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const launch=()=>electron.launch({executablePath,args:['--lang=nl-NL',...(executablePath?[]:['.']),`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
  let app=await launch();
  try {
    let page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();await page.waitForLoadState('load');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    const bytes=Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
    await page.evaluate(async bytes=>{
      const api=window.hitthebeat!,audio=await api.saveExercise({title:'Audio',description:'Ontspannen.',bpm:120,duration:6,detectedBpm:null,analysisStatus:'unavailable',audio:{name:'test.m4a',bytes:new Uint8Array(bytes)}});
      const metro=await api.saveExercise({title:'Metronoom',description:'Luister naar de maat.',kind:'metronome',meter:'6/8',bars:1,bpm:120,duration:0,detectedBpm:null,analysisStatus:'unavailable'});
      const step=(bpm:number,repetitions=1,start:number|null=.2,end:number|null=1.2)=>({id:crypto.randomUUID(),bpm,repetitions,start,end});
      await api.saveRoutine({title:'Samen aftellen',blocks:[{id:crypto.randomUUID(),exerciseId:audio.id,steps:[step(240,2),step(120)]},{id:crypto.randomUUID(),exerciseId:metro.id,steps:[step(120,1,null,null)]}]});
    },bytes);
    await page.reload();await page.context().setOffline(true);
    await page.getByRole('article',{name:'Samen aftellen'}).getByRole('button',{name:'Bewerken'}).click();
    await expect(page.getByLabel('Aftellen oefening 1',{exact:true})).not.toBeChecked();
    await expect(page.getByLabel('Maatsoort aftelmaat oefening 1',{exact:true})).toHaveValue('4/4');
    await page.getByLabel('Aftellen oefening 1',{exact:true}).check();
    await expect(page.getByLabel('Aftellen oefening 2',{exact:true})).not.toBeChecked();
    await page.getByLabel('Aftellen oefening 2',{exact:true}).check();
    await page.getByLabel('Maatsoort aftelmaat oefening 2',{exact:true}).selectOption('3/4');
    await expect(page.getByTestId('planned-preparation')).toContainText('Oefentijd 0:04 · Aftellen 0:06 · Totaal 0:09');
    await page.screenshot({path:'test-results/count-in-editor.png',fullPage:true});
    await page.getByRole('button',{name:'Sessie opslaan',exact:true}).click();
    await app.close();app=await launch();page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));
    await page.context().setOffline(true);
    await page.getByRole('article',{name:'Samen aftellen'}).getByRole('button',{name:'Bewerken'}).click();
    await expect(page.getByLabel('Aftellen oefening 1',{exact:true})).toBeChecked();
    await expect(page.getByLabel('Maatsoort aftelmaat oefening 2',{exact:true})).toHaveValue('3/4');
    await page.getByRole('button',{name:'Sessie starten',exact:true}).click();
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();
    await expect(page.getByTestId('count-in')).toContainText('240 BPM');
    await expect(page.getByTestId('time-planned')).toHaveText('0:00');
    await page.getByRole('button',{name:'Pauzeren',exact:true}).click();
    await expect(page.getByTestId('count-in')).toHaveCount(0);
    await page.locator('#main').focus();await page.keyboard.press('Space');
    await expect(page.getByTestId('count-in')).toBeVisible();
    await page.keyboard.press('1');await expect(page.getByTestId('count-in')).toBeVisible();
    await page.getByRole('button',{name:'Fragment oefenen',exact:true}).click();
    await expect(page.getByText('Vrij fragment oefenen',{exact:true})).toBeVisible();
    await expect(page.getByTestId('count-in')).toHaveCount(0);
    await page.getByRole('button',{name:'Terug naar sessie',exact:true}).click();
    await expect(page.getByTestId('count-in')).toBeVisible();
    await expect(page.getByText('Stap 1 van 2 · Herhaling 2 van 2',{exact:true})).toBeVisible();
    await expect(page.getByTestId('count-in')).toContainText('240 BPM');
    await expect(page.getByTestId('session-bpm')).toHaveText('120 BPM');
    await expect(page.getByTestId('count-in')).toContainText('120 BPM');
    await page.screenshot({path:'test-results/count-in-player.png',fullPage:true});
    await expect(page.getByRole('heading',{name:'Oefening afgerond',exact:true})).toBeVisible({timeout:10000});
    await expect(page.getByRole('button',{name:'Verder met volgende oefening',exact:true})).toBeEnabled();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading',{name:'Metronoom',exact:true})).toBeVisible();
    await expect(page.getByTestId('count-in')).toContainText('3/4'); // Per-block count meter is independent of the exercise's 6/8.
    await expect(page.getByRole('heading',{name:'Oefening afgerond',exact:true})).toBeVisible({timeout:10000});
    await expect(page.getByRole('button',{name:'Sessie afronden',exact:true})).toBeEnabled();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading',{name:'Sessie afgerond',exact:true})).toBeVisible();
    await expect.poll(()=>page.evaluate(async()=>(await window.hitthebeat!.listSessions())[0].status)).toBe('completed');
    const session=(await page.evaluate(()=>window.hitthebeat!.listSessions()))[0];
    expect(session.progress.passes).toBe(4);expect(session.progress.times.planned).toBeCloseTo(3.5,0);expect(session.progress.times.preparation).toBeGreaterThan(5.3); // 5.5s planned preparation; allow audio-clock/timer quantization.
    expect(session.progress.played.reduce((sum,item)=>sum+item.seconds,0)).toBeCloseTo(session.progress.times.planned,3);
    expect(session.evaluations).toHaveLength(2);expect(errors).toEqual([]);
    await page.getByRole('button',{name:'Voortgang',exact:true}).click();
    await expect(page.getByText(/Aftellen 0:/).first()).toBeVisible();
  } finally {await app.close();await rm(root,{recursive:true,force:true});}
});

test('count-in audio uses distinct clicks and hands off to music on the audio clock; pause/mute cancel the pending sound', async()=>{
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE),'Source DSP probe; packaged UI checked separately.');
  const {createServer}=await import('vite');const server=await createServer();await server.listen();
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-count-dsp-'));
  const app=await electron.launch({args:['--lang=nl-NL','.',`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'1'}});
  try{const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();
    const result=await page.evaluate(async()=>{const {countInProbe}=await import('/tests/audio/count-in-probe.ts');return countInProbe();});
    expect(result.leadSeconds).toBe(1.5);expect(result.onsets).toHaveLength(7);
    for(let i=0;i<result.onsets.length;i++)expect(result.onsets[i]).toBeCloseTo(i*.5,2);
    expect(Math.abs(result.countFrequency-3000)).toBeLessThan(150);expect(Math.abs(result.metroFrequency-1800)).toBeLessThan(150);
    expect(result.counting).toBe(true);expect(result.positionDuringCount).toBe(0);expect(result.musicDuringCount).toBeLessThan(.002);expect(result.musicAfterCount).toBeGreaterThan(.1);
    expect(result.afterCancelledCount).toBeLessThan(.00001);expect(result.pausedPosition).toBe(0);expect(result.mutedPeak).toBeLessThan(.00001);
  }finally{await app.close();await server.close();await rm(root,{recursive:true,force:true});}
});

test('stopping during count-in saves preparation without a completed pass or practice time',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-count-stop-')),executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app=await electron.launch({executablePath,args:['--lang=nl-NL',...(executablePath?[]:['.']),`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
  try{const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();await page.waitForLoadState('load');
    await page.evaluate(async()=>{const api=window.hitthebeat!,source=await api.saveExercise({kind:'metronome',meter:'6/8',bars:1,title:'Rustig',description:'',bpm:60,duration:0,detectedBpm:null,analysisStatus:'unavailable'});await api.saveRoutine({title:'Stop in aftelmaat',blocks:[{countIn:{enabled:true,meter:'3/4'},id:crypto.randomUUID(),exerciseId:source.id,steps:[{id:crypto.randomUUID(),bpm:60,repetitions:1,start:null,end:null}]}]});});
    await page.reload();await page.getByRole('article',{name:'Stop in aftelmaat'}).getByRole('button',{name:'Starten',exact:true}).click();
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();await expect(page.getByTestId('count-in')).toContainText('3/4');
    await expect(page.getByTestId('time-preparation')).not.toHaveText('0:00',{timeout:2000});
    await page.getByRole('button',{name:'Mijn oefensessies',exact:true}).click();await page.getByRole('button',{name:'Stoppen en terug',exact:true}).click();
    await expect.poll(()=>page.evaluate(async()=>(await window.hitthebeat!.listSessions())[0].status)).toBe('stopped');
    const record=(await page.evaluate(()=>window.hitthebeat!.listSessions()))[0];expect(record.status).toBe('stopped');expect(record.progress.passes).toBe(0);expect(record.progress.times.planned).toBe(0);expect(record.progress.times.preparation).toBeGreaterThan(0);expect(record.progress.played).toHaveLength(0);
  }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
