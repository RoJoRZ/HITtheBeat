import {test,expect,_electron as electron} from '@playwright/test';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE;
const launch=(root:string)=>electron.launch({executablePath,args:[...(executablePath?[]:['.']),`--user-data-dir=${root}`,'--lang=nl-NL'],env:{...process.env,HITTHEBEAT_DEV:'0'}});

test('info describes existing features and version while playback continues; keyboard close restores focus',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-info-playing-')),app=await launch(root);
 try{const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();await page.context().setOffline(true);
 const session=await page.evaluate(async()=>{const api=window.hitthebeat!,e=await api.saveExercise({kind:'metronome',title:'Eigen oefening',description:'Eigen opdracht',bpm:120,detectedBpm:null,analysisStatus:'unavailable',duration:0,meter:'4/4',bars:128});return api.saveRoutine({title:'Mijn muziekmoment',blocks:[{id:crypto.randomUUID(),exerciseId:e.id,steps:[{id:crypto.randomUUID(),bpm:120,repetitions:1,start:null,end:null}]}]});});
 await page.reload();await page.getByRole('article',{name:session.title}).getByRole('button',{name:'Starten',exact:true}).click();await page.getByRole('button',{name:'Afspelen',exact:true}).click();await expect(page.getByTestId('time-planned')).not.toHaveText('0:00');const before=await page.getByTestId('time-planned').innerText();
 const button=page.getByRole('button',{name:'Info over HITtheBeat',exact:true});await button.click();const info=page.getByRole('dialog',{name:'Over HITtheBeat',exact:true});await expect(info).toBeVisible();await expect(info.getByRole('listitem')).toHaveCount(9);await expect(info).toContainText('persoonlijke oefenmaatje');await expect(info).toContainText('25–300%');await expect(info).toContainText(`HITtheBeat · v${JSON.parse(await readFile('package.json','utf8')).version}`);await expect(info.getByRole('button',{name:'Sluiten',exact:true})).toBeFocused();
 await expect(page.getByTestId('time-planned')).not.toHaveText(before);await info.press('1');await expect(info).toBeVisible();await page.screenshot({path:'test-results/info-nl.png',fullPage:true});await info.press('Escape');await expect(info).not.toBeVisible();await expect(button).toBeFocused();await expect(page.getByRole('button',{name:'Pauzeren',exact:true})).toBeVisible();
 expect((await page.evaluate(()=>window.hitthebeat!.listSessions()))[0].routine.id).toBe(session.id);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});

test('info translates without losing an unsaved form and scrolls at minimum desktop size',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-info-form-')),app=await launch(root);
 try{const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();await page.getByRole('button',{name:'Oefeningen',exact:true}).click();await page.getByRole('button',{name:'Oefening toevoegen',exact:true}).click();await page.getByRole('textbox',{name:'Naam',exact:true}).fill('Niet opgeslagen');await page.getByRole('textbox',{name:'Opdracht',exact:true}).fill('Blijf ontspannen.');await page.getByRole('button',{name:'Info over HITtheBeat',exact:true}).click();
 await page.evaluate(()=>window.hitthebeat!.setLanguage('en'));const info=page.getByRole('dialog',{name:'About HITtheBeat',exact:true});await expect(info).toBeVisible();await expect(info.getByRole('listitem')).toHaveCount(9);await expect(info).toContainText('personal practice companion');await expect(info).toContainText('12 semitones');await page.setViewportSize({width:900,height:680});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await info.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);await page.screenshot({path:'test-results/info-en-top.png',fullPage:true});
 const close=info.getByRole('button',{name:'Back to my music moment',exact:true});await close.scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/info-en-bottom.png',fullPage:true});await close.click();await expect(info).not.toBeVisible();await expect(page.getByRole('textbox',{name:'Name',exact:true})).toHaveValue('Niet opgeslagen');await expect(page.getByRole('textbox',{name:'Instructions',exact:true})).toHaveValue('Blijf ontspannen.');expect(await page.evaluate(()=>window.hitthebeat!.listExercises())).toHaveLength(0);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
