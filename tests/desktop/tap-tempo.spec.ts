import {test,expect,_electron as electron} from '@playwright/test';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('tap modal owns audio/Space, rejects unstable taps and applies joint tempo/phase only on explicit save',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-tap-')),executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
 const app=await electron.launch({executablePath,args:['--lang=nl-NL',...(executablePath?[]:['.']),`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
 try {
  const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();
  await page.addInitScript(()=>{
   const Base=window.AudioContext;(window as any).__tapContexts=[];
   window.AudioContext=class extends Base{
    constructor(...args:ConstructorParameters<typeof AudioContext>){super(...args);(window as any).__tapContexts.push(this);}
    getOutputTimestamp(){return {contextTime:this.currentTime,performanceTime:performance.now()};}
    createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source);source.start=(...args)=>{(this as any).__start=args[0];start(...args);};return source;}
   };
  });
  await page.reload();await page.context().setOffline(true);
  const id=await page.evaluate(async bytes=>(await window.hitthebeat!.saveExercise({title:'Tikken',description:'',bpm:100,duration:6,detectedBpm:null,analysisStatus:'unavailable',audio:{name:'tap.m4a',bytes:new Uint8Array(bytes)}})).id,[...await readFile('tests/fixtures/pulse-aac.m4a')]);
  await page.getByRole('button',{name:'Oefeningen',exact:true}).click();
  await expect(page.getByRole('button',{name:'Vastklikken op tel',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Bewerken',exact:true}).click();
  async function open(){await page.getByRole('button',{name:'Bepaal BPM',exact:true}).click();await page.getByRole('button',{name:'Start meetikken',exact:true}).click();await expect(page.getByRole('status',{name:'Tikmeting',exact:true})).toContainText('Spatie');}
  async function taps(values:number[]){await page.getByRole('dialog').evaluate((dialog,values)=>{
   const ctx=(window as any).__tapContexts.at(-1);
   for(const position of values){const event=new KeyboardEvent('keydown',{bubbles:true,code:'Space',key:' '});Object.defineProperty(event,'timeStamp',{value:performance.now()+((ctx.__start+position)-ctx.currentTime)*1000});dialog.dispatchEvent(event);}
  },values);}
  await open();await taps([.2,.7]);await page.getByRole('button',{name:'Stop meetikken / beluisteren',exact:true}).click();
  await expect(page.getByRole('button',{name:'Overnemen',exact:true})).toBeDisabled();
  await expect(page.getByRole('dialog')).toContainText('Geen stabiel tempo gevonden');
  await page.getByRole('button',{name:'Opnieuw tikken',exact:true}).click();await expect(page.getByRole('status',{name:'Tikmeting',exact:true})).toContainText('Spatie');
  await taps([.2,.45,1.3,1.4]);await page.getByRole('button',{name:'Stop meetikken / beluisteren',exact:true}).click();
  await expect(page.getByRole('button',{name:'Overnemen',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Opnieuw tikken',exact:true}).click();await expect(page.getByRole('status',{name:'Tikmeting',exact:true})).toContainText('Spatie');
  await taps([.2,.7,1.2,1.7]);await page.getByRole('button',{name:'Stop meetikken / beluisteren',exact:true}).click();
  await page.evaluate(()=>window.hitthebeat!.setLanguage('en'));
  await expect(page.getByRole('heading',{name:'Determine BPM',exact:true})).toBeVisible();
  await page.evaluate(()=>window.hitthebeat!.setLanguage('nl'));
  await expect(page.getByRole('dialog')).toContainText('Korte meting');await expect(page.getByRole('dialog')).toContainText('120 BPM');
  await page.screenshot({path:'test-results/tap-tempo.png',fullPage:true});
  await page.getByRole('button',{name:'Resultaat beluisteren',exact:true}).click();
  await expect(page.getByRole('status',{name:'Tikmeting',exact:true})).toContainText('klikken');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByLabel('Origineel BPM',{exact:true})).toHaveValue('100');
  expect(await page.evaluate(()=>(window as any).__tapContexts.every((c:AudioContext)=>c.state==='closed'))).toBe(true);
  await open();await taps(Array.from({length:17},(_,i)=>.1+i*.25));
  await expect(page.getByRole('status',{name:'Tikmeting',exact:true})).toContainText('16 tikken');
  await expect(page.getByRole('button',{name:'Stop meetikken / beluisteren',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Overnemen',exact:true}).click();
  await expect(page.getByLabel('Origineel BPM',{exact:true})).toHaveValue('240');
  const unsaved=(await page.evaluate(()=>window.hitthebeat!.listExercises()))[0];expect(unsaved.bpm).toBe(100);expect(unsaved.beatOffset).toBeNull();
  await page.getByRole('button',{name:'Oefening opslaan',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Tikken',exact:true})).toBeVisible();
  const saved=(await page.evaluate(()=>window.hitthebeat!.listExercises())).find(e=>e.id===id)!;
  expect(saved.bpm).toBeCloseTo(240,1);expect(saved.beatOffset).toBeCloseTo(.1,2);
  await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>(window as any).__tapContexts.slice(0,-1).every((c:AudioContext)=>c.state==='closed'))).toBe(true);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
