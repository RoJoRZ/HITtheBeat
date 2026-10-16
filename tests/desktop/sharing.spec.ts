import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('offline export with maker credit, duplicate-name import preview, cancel, rename and re-export',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-sharing-ui-')),executablePath=process.env.HITTHEBEAT_TEST_EXECUTABLE,file=path.join(root,'deel.htbexercise');
 const app=await electron.launch({executablePath,args:[...(executablePath?[]:['.']),`--user-data-dir=${path.join(root,'data')}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
 try{
  const page=await app.firstWindow();const errors:string[]=[];page.on('pageerror',e=>{errors.push(e.message);console.log('Renderer error:',e.message);});await expect(page.locator('h1')).toBeVisible();await page.context().setOffline(true);
  await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=(async()=>({canceled:false,filePath:file})) as typeof dialog.showSaveDialog;dialog.showOpenDialog=(async()=>({canceled:false,filePaths:[file]})) as typeof dialog.showOpenDialog;},file);
  const bytes=Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
  const original=await page.evaluate(async bytes=>{
   const canvas=document.createElement('canvas');canvas.width=100;canvas.height=30;canvas.getContext('2d')!.fillRect(0,0,100,30);const image=Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]),c=>c.charCodeAt(0));
   const e=await window.hitthebeat!.saveExercise({title:'Gedeelde oefening',description:'Luister naar je aanslag.',bpm:120.4,detectedBpm:119.6,analysisStatus:'estimated',duration:6,normalizationDb:3.2,normalizeAudio:true,audio:{name:'origineel.m4a',bytes:new Uint8Array(bytes)},image:{name:'tab.png',bytes:image}});
   return window.hitthebeat!.saveFragment(e.id,{name:'Intro',start:1.25,end:3.75});
  },bytes);
  await page.reload();await page.getByRole('button',{name:'Oefeningen',exact:true}).click();await page.getByRole('button',{name:'Exporteren',exact:true}).click();
  const exp=page.getByRole('dialog',{name:'Oefening exporteren',exact:true});await exp.getByLabel('Makernaam of artiestennaam (optioneel)').fill('Ro & vrienden');await exp.getByLabel('Persoonlijke boodschap (optioneel)').fill('Veel plezier! <b>Jij kunt dit</b>');
  await page.screenshot({path:'test-results/sharing-export.png',fullPage:true});await exp.getByRole('button',{name:'Bestand opslaan'}).click();await expect(exp).not.toBeVisible();
  expect(JSON.parse(await readFile(file,'utf8')).exercise.credit.name).toBe('Ro & vrienden');
  const imp=page.getByRole('dialog',{name:'Oefening importeren',exact:true});await page.getByRole('button',{name:'Oefening importeren',exact:true}).click();await expect(imp.getByRole('status')).toContainText('Er bestaat al een oefening');await expect(imp.getByText('Gemaakt door Ro & vrienden')).toBeVisible();
  await page.screenshot({path:'test-results/sharing-import.png',fullPage:true});await imp.getByRole('button',{name:'Annuleren'}).click();expect((await page.evaluate(()=>window.hitthebeat!.listExercises())).length).toBe(1);
  await page.getByRole('button',{name:'Oefening importeren',exact:true}).click();await imp.getByLabel('Naam van de geïmporteerde oefening').fill('Mijn nieuwe oefening');await expect(imp.getByRole('status')).toHaveCount(0);await imp.getByRole('button',{name:'Importeren',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Mijn nieuwe oefening',exact:true})).toBeVisible();await expect(page.getByText('Gemaakt door Ro & vrienden')).toBeVisible();await expect(page.getByText('Veel plezier! <b>Jij kunt dit</b>',{exact:true})).toBeVisible();await expect(page.getByRole('img',{name:'Tablatuur bij Mijn nieuwe oefening'})).toBeVisible();
  const all=await page.evaluate(()=>window.hitthebeat!.listExercises()),imported=all.find(e=>e.id!==original.id)!;expect(imported.bpm).toBe(120.4);expect(imported.fragments![0].id).not.toBe(original.fragments![0].id);expect(imported.fragments![0].start).toBe(1.25);
  expect(await page.evaluate(async id=>Array.from((await window.hitthebeat!.readAudio(id)).bytes),imported.id)).toEqual(bytes);
  await page.getByRole('button',{name:'Exporteren',exact:true}).click();await expect(exp.getByLabel('Makernaam of artiestennaam (optioneel)')).toHaveValue('Ro & vrienden');await exp.getByRole('button',{name:'Annuleren'}).click();
  await page.getByRole('button',{name:'Bewerken',exact:true}).click();await expect(page.getByRole('heading',{name:'Oefening bewerken',exact:true})).toBeVisible();await page.getByRole('textbox',{name:'Opdracht',exact:true}).fill('Een eigen opdracht.');await page.getByRole('button',{name:'Oefening opslaan',exact:true}).click();await expect(page.getByText('Gemaakt door Ro & vrienden')).toBeVisible();
  await page.setViewportSize({width:960,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/sharing-credit.png',fullPage:true});
  await writeFile(file,'kapot');await page.getByRole('button',{name:'Oefening importeren',exact:true}).click();await expect(page.getByRole('alert')).toContainText('geen geldig');expect((await page.evaluate(()=>window.hitthebeat!.listExercises())).length).toBe(2);
  await app.evaluate(({dialog})=>{dialog.showOpenDialog=(async()=>({canceled:true,filePaths:[]})) as typeof dialog.showOpenDialog;});await page.getByRole('button',{name:'Oefening importeren',exact:true}).click();await expect(imp).not.toBeVisible();expect(errors).toEqual([]);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
