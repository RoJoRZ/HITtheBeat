import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
function track() {
  const encoder = new Mp3Encoder(1, 44100, 128), chunks: Uint8Array[] = [];
  for (let start = 0; start < 44100 * 6; start += 1152) chunks.push(encoder.encodeBuffer(Int16Array.from({ length: Math.min(1152, 44100 * 6 - start) }, (_, i) => Math.sin(2 * Math.PI * 330 * (start + i) / 44100) * 16000)));
  chunks.push(encoder.flush()); return Buffer.concat(chunks.map(value => Buffer.from(value)));
}
test('real routine restores interrupted pass, plays repeats in order and advances to next exercise', async () => {
  test.setTimeout(45000);
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-session-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app = await electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const page = await app.firstWindow(), errors: string[] = [];
    page.on('pageerror', reason => errors.push(reason.message));
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.evaluate(async bytes => {
      const canvas = document.createElement('canvas'); canvas.width = 660; canvas.height = 210;
      const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#eee'; ctx.fillRect(0, 0, 660, 210); ctx.strokeStyle = '#222'; ctx.fillStyle = '#222'; ctx.font = '20px sans-serif';
      for (let line = 0; line < 6; line++) { ctx.beginPath(); ctx.moveTo(20, 40 + line * 25); ctx.lineTo(640, 40 + line * 25); ctx.stroke(); }
      ctx.fillText('5   7   5   7   8   7   5', 60, 90);
      const image = { name: 'test-tab.png', bytes: Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]), char => char.charCodeAt(0)) };
      const sources = [];
      for (const title of ['Wisselslag', 'Akkoorden']) sources.push(await window.hitthebeat!.saveExercise({ title, description: 'Speel ontspannen. Let op de timing.', bpm: 120, detectedBpm: null, analysisStatus: 'unavailable', duration: 6, audio: { name: `${title}.mp3`, bytes: new Uint8Array(bytes) }, image: title === 'Wisselslag' ? image : undefined }));
      const step = (bpm: number, repetitions = 1, end = .6) => ({ id: crypto.randomUUID(), bpm, repetitions, start: .2, end });
      await window.hitthebeat!.saveRoutine({ title: 'Mijn hele sessie', blocks: [
        { id: crypto.randomUUID(), exerciseId: sources[0].id, steps: [step(75, 1, 2.2), step(95, 2, 2.2), step(85, 1, 2.2)] },
        { id: crypto.randomUUID(), exerciseId: sources[1].id, steps: [step(120, 1, 2.2)] },
      ] });
    }, [...track()]);
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('article').getByRole('button', { name: 'Bewerken' }).click();
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Oefeningen in deze sessie' })).toContainText('Akkoorden');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByText('Stap 2 van 3 · Herhaling 1 van 2')).toBeVisible();
    await page.getByRole('button', { name: 'Fragment oefenen', exact: true }).click();
    await expect(page.getByText('Vrij fragment oefenen', { exact: true })).toBeVisible();
    await page.getByLabel('Speeltempo BPM', { exact: true }).fill('60'); await page.keyboard.press('Enter');
    await page.getByLabel('Toonhoogte (halve tonen)', { exact: true }).fill('3'); await page.keyboard.press('Enter');
    await page.getByLabel('Begin A (seconden)', { exact: true }).fill('.4'); await page.keyboard.press('Enter');
    await page.getByLabel('Einde B (seconden)', { exact: true }).fill('.9');
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByTestId('time-fragment')).not.toHaveText('0:00', { timeout: 5000 });
    await page.locator('#main').focus();
    await page.screenshot({ path: 'test-results/phase5-fragment.png', fullPage: true });
    await page.getByLabel('Toonhoogte (halve tonen)', { exact: true }).fill('4');
    await page.getByRole('button', { name: 'Terug naar sessie', exact: true }).click();
    await expect(page.getByText('Stap 2 van 3 · Herhaling 1 van 2')).toBeVisible();
    await expect(page.getByTestId('session-bpm')).toHaveText('95 BPM');
    await expect(page.getByTestId('planned-settings')).toContainText('Fragment 0.2–2.2 seconden · Toonhoogte origineel');
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await page.locator('#main').focus(); await page.keyboard.press('1');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await expect(page.getByRole('img', { name: 'Tablatuur bij Wisselslag', exact: true })).toBeVisible();
    const notationOpened = app.waitForEvent('window');
    await page.getByRole('button', { name: 'Tablatuur vergroten', exact: true }).click();
    const notation = await notationOpened;
    await expect(notation.getByRole('img')).toBeVisible(); await notation.close();
    await page.locator('#main').focus();
    await page.screenshot({ path: 'test-results/phase5-player.png', fullPage: true });
    await page.setViewportSize({ width: 960, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Verder oefenen', exact: true }).click();
    await expect(page.getByText('Stap 2 van 3 · Herhaling 1 van 2')).toBeVisible();
    await page.locator('#main').focus(); await page.keyboard.press('Space');
    await expect(page.getByText('Stap 2 van 3 · Herhaling 2 van 2')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('region', { name: 'Oefeningen in deze sessie' })).toContainText('Afgerond');
    await page.getByRole('button', { name: 'Verder met volgende oefening', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Akkoorden', exact: true })).toBeVisible();
    await expect(page.getByTestId('session-bpm')).toHaveText('120 BPM');
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Sessie afronden', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Sessie afgerond', exact: true })).toBeVisible();
    await expect(page.getByText('5 speelbeurten afgerond. 0 oefeningen overgeslagen.')).toBeVisible();
    await expect(page.getByText('Je resultaten zijn bewaard bij Voortgang.', { exact: true })).toBeVisible();
    const history = await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0]);
    expect(history.status).toBe('completed'); expect(history.progress.passes).toBe(5);
    expect(history.progress.played.some(item => item.mode === 'fragment' && item.a === .4 && item.b === .9 && item.bpm === 60 && item.pitch === 3 && item.seconds > .5 && item.completed === 0)).toBe(true);
    expect(history.progress.times.planned + history.progress.times.fragment).toBeGreaterThan(history.progress.times.planned);
    await page.getByRole('button', { name: 'Terug naar mijn sessies', exact: true }).click();
    await page.getByRole('article', { name: 'Mijn hele sessie', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await expect(page.getByLabel('Naam van de sessie')).toHaveValue('Mijn hele sessie');
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await page.getByRole('button', { name: 'Oefening overslaan', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Oefeningen in deze sessie' })).toContainText('Overgeslagen');
    await page.getByRole('button', { name: 'Oefening overslaan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Sessie beëindigd', exact: true })).toBeVisible();
    await expect(page.getByText('0 speelbeurten afgerond. 2 oefeningen overgeslagen.')).toBeVisible();
    expect(errors).toEqual([]);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});

test('missing audio does not advance or count a pass and stopping keeps the saved routine', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-missing-session-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app = await electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const page = await app.firstWindow();
    await page.evaluate(async () => {
      const exercise = await window.hitthebeat!.saveExercise({ title: 'Ontbrekende audio', description: '', bpm: 120, duration: 6, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'missing.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]) } });
      await window.hitthebeat!.saveRoutine({ title: 'Bewaard sessie', blocks: [{ id: crypto.randomUUID(), exerciseId: exercise.id, steps: [{ id: crypto.randomUUID(), bpm: 120, repetitions: 2, start: null, end: null }] }] });
    });
    const { readdir } = await import('node:fs/promises');
    const media = path.join(root, 'library', 'media');
    for (const filename of await readdir(media)) await rm(path.join(media, filename));
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('article').getByRole('button', { name: 'Bewerken' }).click();
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('ontbreekt');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeDisabled();
    await expect(page.getByTestId('time-planned')).toHaveText('0:00');
    await expect(page.getByText('Stap 1 van 1 · Herhaling 1 van 2')).toBeVisible();
    await page.getByRole('button', { name: 'Audio opnieuw laden', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('ontbreekt');
    await page.getByRole('button', { name: 'Sessie stoppen', exact: true }).click();
    await page.getByRole('button', { name: 'Stoppen en terug', exact: true }).click();
    await page.getByRole('article', { name: 'Bewaard sessie', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await expect(page.getByLabel('Naam van de sessie')).toHaveValue('Bewaard sessie');
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('ontbreekt');
    await page.getByRole('button', { name: 'Oefening overslaan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Sessie beëindigd', exact: true })).toBeVisible();
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});

test('queue buttons navigate forward/back while preserving transport and real time; review drafts are discarded', async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-jump-'));
  const app=await electron.launch({args:['--lang=nl-NL','.',`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
  try {
    const page=await app.firstWindow();await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(async bytes=>{
      const api=window.hitthebeat!;const exercises=[];
      for(const title of ['Eerste','Tweede','Derde'])exercises.push(await api.saveExercise({title,description:'',bpm:120,duration:6,detectedBpm:null,analysisStatus:'unavailable',audio:{name:'jump.mp3',bytes:new Uint8Array(bytes)}}));
      await api.saveRoutine({title:'Springen',blocks:exercises.map((e,i)=>({id:crypto.randomUUID(),exerciseId:e.id,steps:[{id:crypto.randomUUID(),bpm:120,repetitions:1,start:0,end:i===2?.3:6}]}))});
    },[...track()]);
    await page.reload();await page.getByRole('article',{name:'Springen',exact:true}).getByRole('button',{name:'Starten',exact:true}).click();
    const queue=page.getByRole('region',{name:'Oefeningen in deze sessie'});
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    await queue.getByRole('button',{name:/2\. Tweede/}).click();
    await expect(page.getByRole('heading',{name:'Tweede',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();
    await expect(page.getByTestId('time-planned')).not.toHaveText('0:00');
    await page.getByRole('button',{name:'Pauzeren',exact:true}).click();
    await queue.getByRole('button',{name:/1\. Eerste/}).click();
    await expect(page.getByRole('heading',{name:'Eerste',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    await page.getByRole('button',{name:'Afspelen',exact:true}).click();
    await queue.getByRole('button',{name:/3\. Derde/}).click();
    await expect(page.getByRole('heading',{name:'Oefening afgerond',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'3 · Sneller',exact:true}).click();
    await queue.getByRole('button',{name:/2\. Tweede/}).click();
    await expect(page.getByRole('button',{name:'Afspelen',exact:true})).toBeEnabled();
    const saved=(await page.evaluate(()=>window.hitthebeat!.listSessions()))[0];
    expect(saved.evaluations).toEqual([]);expect(saved.progress.passes).toBe(1);
    expect(saved.progress.played.some(p=>p.block===1&&p.seconds>0&&p.completed===0)).toBe(true);
    expect((await page.evaluate(()=>window.hitthebeat!.listRoutines()))[0].blocks[2].steps[0].bpm).toBe(120);
  } finally {await app.close();await rm(root,{recursive:true,force:true});}
});
