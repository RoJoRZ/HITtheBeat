import { test, expect, _electron as electron, type Page } from '@playwright/test';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
async function drag(page: Page, from: number, to: number) {
  const wave = page.locator('.interactive-waveform'); await wave.scrollIntoViewIfNeeded(); const box = (await wave.boundingBox())!;
  await page.mouse.move(box.x + box.width * from, box.y + box.height * .6); await page.mouse.down();
  await page.mouse.move(box.x + box.width * to, box.y + box.height * .6, { steps: 8 }); await page.mouse.up();
}
for (const captureFails of [false, true]) test(`capture ${captureFails ? 'fallback' : 'normal'}: waveform selects source passages, drags markers after zoom/pan, previews, saves and resumes the unchanged session`, async () => {
  test.setTimeout(60000);
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-wave-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app = await electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const page = await app.firstWindow(), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await expect(page.locator('h1')).toBeVisible(); await page.waitForLoadState('load');
    if (captureFails) await page.addInitScript(() => { Element.prototype.setPointerCapture = () => { throw new DOMException('Capture unavailable', 'NotFoundError'); }; });
    const bytes = Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
    const original = await page.evaluate(async bytes => {
      const api = window.hitthebeat!, audio = await api.saveExercise({ title: 'Selecteren', description: '', bpm: 120, duration: 6, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'select.m4a', bytes: new Uint8Array(bytes) } });
      const metro = await api.saveExercise({ title: 'Rustig tellen', kind: 'metronome', meter: '4/4', bars: 8, description: '', bpm: 120, duration: 0, detectedBpm: null, analysisStatus: 'unavailable' });
      return api.saveRoutine({ title: 'Visueel oefenen', blocks: [audio, metro].map(source => ({ id: crypto.randomUUID(), exerciseId: source.id, steps: [{ id: crypto.randomUUID(), bpm: 120, repetitions: 2, start: null, end: null }] })) });
    }, bytes);
    await page.reload(); await page.context().setOffline(true);
    await page.getByRole('article', { name: 'Visueel oefenen' }).getByRole('button', { name: 'Starten', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Fragment beluisteren' })).toBeEnabled();
    await drag(page, .2, .5);
    await expect(page.getByText('Vrij fragment oefenen', { exact: true })).toBeVisible();
    const a = page.getByLabel('Begin A (seconden)', { exact: true }), b = page.getByLabel('Einde B (seconden)', { exact: true });
    await expect.poll(async () => Number(await a.inputValue())).toBeCloseTo(1.2, 1); await expect.poll(async () => Number(await b.inputValue())).toBeCloseTo(3, 1);
    const before = [Number(await a.inputValue()), Number(await b.inputValue())];
    await page.getByRole('button', { name: 'Waveform inzoomen' }).click();
    const visibleBeforePan = await page.getByTestId('waveform-range').textContent();
    await page.getByRole('button', { name: 'Verschuiven', exact: true }).click();
    await drag(page, .6, .4);
    await expect(page.getByTestId('waveform-range')).not.toHaveText(visibleBeforePan!);
    await page.getByRole('button', { name: 'Verschuiven', exact: true }).click();
    await page.getByRole('button', { name: 'Waveform naar rechts' }).click();
    await page.getByRole('button', { name: 'Waveform naar links' }).click();
    expect([Number(await a.inputValue()), Number(await b.inputValue())]).toEqual(before);
    await page.getByRole('button', { name: 'Toon selectie', exact: true }).click();
    const rangeText = (await page.getByTestId('waveform-range').textContent())!;
    const view = /Zichtbaar ([\d.]+)–([\d.]+)/.exec(rangeText)!; const start = Number(view[1]), end = Number(view[2]);
    await drag(page, (before[0] - start) / (end - start), (before[0] + .2 - start) / (end - start));
    await expect.poll(async () => Number(await a.inputValue())).toBeCloseTo(before[0] + .2, 1);
    await expect(b).toHaveValue(String(before[1]));
    await page.getByRole('slider', { name: 'Eindmarkering B' }).focus(); await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => Number(await b.inputValue())).toBeCloseTo(before[1] - .01, 2);
    await page.getByRole('button', { name: 'Hele track', exact: true }).click();
    await drag(page, .8, .6); // reverse selection
    await expect.poll(async () => Number(await a.inputValue())).toBeCloseTo(3.6, 1);
    await expect.poll(async () => Number(await b.inputValue())).toBeCloseTo(4.8, 1);
    await a.fill('2.25'); await a.press('Enter');
    await expect(page.getByTestId('waveform-range')).toContainText('A 2.250');
    await page.getByRole('button', { name: 'Fragment beluisteren' }).click();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeEnabled();
    await expect(page.getByTestId('time-fragment')).not.toHaveText('0:00', { timeout: 4000 });
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await page.screenshot({ path: 'test-results/waveform-selection.png', fullPage: true });
    await page.getByRole('button', { name: 'Fragment opslaan', exact: true }).click();
    await page.getByLabel('Fragmentnaam').fill('Lastige wissel'); await page.getByRole('button', { name: 'Fragment bewaren', exact: true }).click();
    const source = (await page.evaluate(() => window.hitthebeat!.listExercises())).find(e => e.title === 'Selecteren')!;
    expect(source.fragments?.[0].name).toBe('Lastige wissel'); expect(source.fragments?.[0].start).toBeCloseTo(2.25, 2);
    const routine = (await page.evaluate(() => window.hitthebeat!.listRoutines()))[0]; expect(routine.blocks).toEqual(original.blocks);
    await page.getByRole('button', { name: 'Terug naar sessie' }).click();
    await expect(page.getByText('Stap 1 van 1 · Herhaling 1 van 2', { exact: true })).toBeVisible();
    await expect(page.getByTestId('planned-settings')).toContainText('Volledige track');
    await page.getByRole('button', { name: 'Oefening overslaan' }).click();
    await expect(page.getByRole('heading', { name: 'Rustig tellen', exact: true })).toBeVisible();
    await expect(page.locator('.waveform-editor')).toHaveCount(0);
    await page.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click(); await page.getByRole('button', { name: 'Stoppen en terug', exact: true }).click();
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click(); await page.getByRole('button', { name: /Selecteren/ }).click();
    await expect(page.getByRole('button', { name: 'Fragment beluisteren' })).toBeEnabled();
    await drag(page, .15, .35);
    await expect(page.getByRole('button', { name: 'Fragment beluisteren' })).toBeEnabled();
    const svgBox = (await page.locator('.interactive-waveform').boundingBox())!;
    await page.mouse.move(svgBox.x + svgBox.width * .35, svgBox.y + svgBox.height * .6);
    await page.mouse.down();
    await page.mouse.move(svgBox.x + svgBox.width * .8, svgBox.y - 5, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => Number(await b.inputValue())).toBeCloseTo(4.8, 1);
    // A release without a preceding move still carries the final coordinate.
    const boundary = page.getByLabel('Begin A (seconden)', { exact: true });
    await expect(page.getByRole('button', { name: 'Fragment beluisteren' })).toBeEnabled();
    const previous = await boundary.inputValue();
    await page.locator('.interactive-waveform').evaluate(svg => {
      const box = svg.getBoundingClientRect();
      const send = (type: string, fraction: number) => svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 91, button: 0, clientX: box.x + box.width * fraction }));
      send('pointerdown', .5); send('pointerup', .7);
    });
    await expect(boundary).not.toHaveValue(previous);
    await expect(page.getByRole('button', { name: 'Fragment beluisteren' })).toBeEnabled();
    const committed = await boundary.inputValue();
    // A click or cancelled gesture must leave the committed loop alone.
    for (const cancel of [false, true]) {
      await page.locator('.interactive-waveform').evaluate((svg, cancel) => {
        const box = svg.getBoundingClientRect();
        const send = (type: string, fraction: number) => svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 92, button: 0, clientX: box.x + box.width * fraction }));
        send('pointerdown', .2);
        if (cancel) { send('pointermove', .4); send('pointercancel', .4); }
        else send('pointerup', .2);
      }, cancel);
      await expect(boundary).toHaveValue(committed);
    }
    await page.getByRole('button', { name: 'Fragment beluisteren' }).click();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeEnabled();
    expect(errors).toEqual([]);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});

test('first beat is saved with the exercise and reused by both players, with free selection available', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-beat-ui-'));
  const app = await electron.launch({ args: ['--lang=nl-NL', '.', `--user-data-dir=${root}`], env:{...process.env,HITTHEBEAT_DEV:'0'} });
  try {
    const page=await app.firstWindow(); await expect(page.locator('h1')).toBeVisible();
    const bytes=Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
    await page.evaluate(async bytes=>{
      const api=window.hitthebeat!, e=await api.saveExercise({title:'Telraster',description:'',bpm:120,duration:6,detectedBpm:null,analysisStatus:'unavailable',audio:{name:'beat.m4a',bytes:new Uint8Array(bytes)}});
      await api.saveRoutine({title:'Raster sessie',blocks:[{id:crypto.randomUUID(),exerciseId:e.id,steps:[{id:crypto.randomUUID(),bpm:80,repetitions:1,start:null,end:null}]}]});
    },bytes);
    await page.getByRole('button',{name:'Oefeningen',exact:true}).click();
    await page.getByRole('button',{name:'Bewerken',exact:true}).click();
    await page.getByLabel('Eerste tel (seconden, optioneel)',{exact:true}).fill('.2');
    await page.getByRole('button',{name:'Oefening opslaan',exact:true}).click();
    await expect(page.getByRole('button',{name:'Vastklikken op tel',exact:true})).toBeEnabled();
    await drag(page,.2,.5);
    await expect(page.getByTestId('waveform-range')).toContainText('A 1.200–B 3.200');
    await page.getByRole('button',{name:'Vastklikken op tel',exact:true}).click();
    await page.getByRole('slider',{name:'Eindmarkering B',exact:true}).focus();await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('waveform-range')).toContainText('B 3.190');
    await page.reload();
    await page.getByRole('article',{name:'Raster sessie',exact:true}).getByRole('button',{name:'Starten',exact:true}).click();
    await expect(page.getByRole('button',{name:'Vastklikken op tel',exact:true})).toBeEnabled();
    await drag(page,.2,.5);
    await expect(page.getByTestId('waveform-range')).toContainText('A 1.200–B 3.200');
    expect((await page.evaluate(()=>window.hitthebeat!.listExercises()))[0].beatOffset).toBe(.2);
    await page.screenshot({path:'test-results/beat-grid.png',fullPage:true});
  } finally {await app.close();await rm(root,{recursive:true,force:true});}
});
