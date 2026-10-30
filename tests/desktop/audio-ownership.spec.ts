import {test,expect,_electron as electron} from '@playwright/test';
import {Mp3Encoder} from '@breezystack/lamejs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('library selection releases old players and keyboard controls only the visible session',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-audio-owner-')),executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app=await electron.launch({executablePath,args:['--lang=nl-NL',...(executablePath?[]:['.']),`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
  try {
    const page=await app.firstWindow();
    await expect(page.getByRole('heading',{name:'Mijn oefensessies',exact:true})).toBeVisible();
    await page.addInitScript(()=>{
      const original=window.AudioContext,contexts:AudioContext[]=[];
      (window as any).__audioOwners=contexts;
      window.AudioContext=class extends original {constructor(...args:ConstructorParameters<typeof AudioContext>){super(...args);contexts.push(this);}};
    });
    await page.reload();
    const encoder=new Mp3Encoder(1,44100,128),chunks:Uint8Array[]=[];
    for(let start=0;start<44100*6;start+=1152)chunks.push(encoder.encodeBuffer(Int16Array.from({length:Math.min(1152,44100*6-start)},(_,i)=>Math.sin(2*Math.PI*330*(start+i)/44100)*12000)));
    chunks.push(encoder.flush());
    await page.evaluate(async bytes=>{
      const input={description:'',bpm:120,duration:6,detectedBpm:null,analysisStatus:'unavailable' as const,audio:{name:'test.mp3',bytes:new Uint8Array(bytes)}};
      const a=await window.hitthebeat!.saveExercise({...input,title:'A bron'});
      await window.hitthebeat!.saveExercise({...input,title:'B bron'});
      await window.hitthebeat!.saveRoutine({title:'Eigenaarschap',blocks:[{id:crypto.randomUUID(),exerciseId:a.id,steps:[{id:crypto.randomUUID(),bpm:120,repetitions:1,start:null,end:null}]}]});
    },[...Buffer.concat(chunks.map(c=>Buffer.from(c)))]);
    await page.reload();
    await page.getByRole('button',{name:'Oefeningen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    await page.getByRole('button',{name:/^B bron/}).click();
    await expect(page.getByRole('heading',{name:'test.mp3',exact:true})).toHaveCount(1);
    await expect.poll(()=>page.evaluate(()=>(window as any).__audioOwners.filter((c:AudioContext)=>c.state!=='closed').length)).toBe(1);
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();
    await page.getByRole('button',{name:'Mijn oefensessies',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>(window as any).__audioOwners.every((c:AudioContext)=>c.state==='closed'))).toBe(true);
    await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Eigenaarschap',exact:true})}).getByRole('button',{name:'Starten',exact:true}).click();
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    await page.locator('#main').focus();await page.keyboard.press('Space');
    await expect(page.getByRole('button',{name:'Pauzeren',exact:true})).toBeEnabled();
    await page.getByRole('button',{name:'Pauzeren',exact:true}).click();
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    expect(await page.evaluate(()=>(window as any).__audioOwners.slice(0,-1).every((c:AudioContext)=>c.state==='closed'))).toBe(true);
    await expect(page.getByRole('region',{name:'Oefeningspeler',exact:true})).toHaveCount(0);
  }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
