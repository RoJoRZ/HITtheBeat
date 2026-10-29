import { test,expect,_electron as electron } from '@playwright/test';
import { createServer } from 'vite';
import { mkdtemp,rm,readFile } from 'node:fs/promises';
import {tmpdir} from 'node:os';import path from 'node:path';

test('audio metronome uses exact source beat count with audible clicks, silent track and safe pause/restore',async()=>{
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE));
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-click-audio-')),server=await createServer();await server.listen();
  const app=await electron.launch({args:['--lang=nl-NL','.',`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'1'}});
  try {
    const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();
    const result=await page.evaluate(async()=>{const {soundModeProbe}=await import('/tests/audio/sound-mode-probe.ts');return soundModeProbe();});
    console.log('Audio metronome measurements',result);
    expect(result.pulses).toHaveLength(2);expect(result.pulses[0]).toBeLessThan(.08);expect(result.pulses[1]).toBeCloseTo(1,1);
    expect(result.between).toBeLessThan(.00001);expect(result.end).toBeCloseTo(1.2,4);expect(result.ended).toBe(true);expect(result.after).toBeLessThan(.00001);
    expect(result.restored).toBeGreaterThan(.1);expect(result.paused).toBeLessThan(.00001);
  } finally {await app.close();await server.close();await rm(root,{recursive:true,force:true});}
});

test('evaluation saves sound for the next session and keeps current repeats, snapshots and other steps unchanged',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-sound-ui-'));
  const app=await electron.launch({args:['--lang=nl-NL','.',`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
  try {
    const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();
    const bytes=Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
    await page.evaluate(async bytes=>{
      const api=window.hitthebeat!,e=await api.saveExercise({title:'Audio of klik',description:'',bpm:120,duration:6,detectedBpm:null,analysisStatus:'unavailable',audio:{name:'klik.m4a',bytes:new Uint8Array(bytes)}});
      await api.saveRoutine({title:'Klankkeuze',blocks:[{id:crypto.randomUUID(),exerciseId:e.id,steps:[{id:crypto.randomUUID(),bpm:120,repetitions:1,start:.2,end:2.2},{id:crypto.randomUUID(),bpm:60,repetitions:1,start:1,end:1.5}]}]});
    },bytes);
    await page.reload();await page.getByRole('article',{name:'Klankkeuze',exact:true}).getByRole('button',{name:'Starten',exact:true}).click();
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Fragmentserie afgerond',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Audio/metronoom kiezen',exact:true}).click();
    await page.getByRole('checkbox',{name:'Stap 1 · 120 BPM · Alleen metronoom',exact:true}).check();
    await page.getByRole('button',{name:'Deze serie opnieuw',exact:true}).click();
    await expect(page.getByTestId('playback-sound')).toHaveText('Audio');
    await expect(page.getByRole('heading',{name:'Fragmentserie afgerond',exact:true})).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('playback-sound')).toHaveText('Audio');
    await expect(page.getByRole('heading',{name:'Oefening afgerond',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Audio/metronoom kiezen',exact:true}).click();
    await expect(page.getByRole('checkbox',{name:'Stap 1 · 120 BPM · Alleen metronoom',exact:true})).toBeChecked();
    await page.screenshot({path:'test-results/audio-metronome-review.png',fullPage:true});
    await page.getByRole('button',{name:'Sessie afronden',exact:true}).click();
    const saved=(await page.evaluate(()=>window.hitthebeat!.listSessions()))[0];
    expect(saved.progress.played.filter(p=>p.step===0).map(p=>p.sound)).toEqual(['audio']);
    expect(saved.progress.played.filter(p=>p.step===0).every(p=>p.completed===2)).toBe(true);
    expect(saved.progress.played.find(p=>p.step===1)?.sound).toBe('audio');
    expect(saved.routine.blocks[0].steps.map(p=>p.bpm)).toEqual([120,60]);
    await page.getByRole('button',{name:'Terug naar mijn sessies',exact:true}).click();
    await page.getByRole('article',{name:'Klankkeuze',exact:true}).getByRole('button',{name:'Starten',exact:true}).click();
    await expect(page.getByTestId('playback-sound')).toHaveText('Alleen metronoom');
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Fragmentserie afgerond',exact:true})).toBeVisible();
    const current=(await page.evaluate(()=>window.hitthebeat!.listSessions()))[0];
    expect(current.routine.blocks[0].steps[0].audioMode).toBe('metronome');
    expect(current.progress.played[0].sound).toBe('metronome');
    expect(saved.routine.blocks[0].steps[0].audioMode).toBeUndefined();
  } finally {await app.close();await rm(root,{recursive:true,force:true});}
});
