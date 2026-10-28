import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
function track() {
  const encoder = new Mp3Encoder(1, 44100, 128), chunks: Uint8Array[] = [];
  for (let start = 0; start < 44100 * 4; start += 1152) chunks.push(encoder.encodeBuffer(Int16Array.from({ length: Math.min(1152, 44100 * 4 - start) }, (_, i) => Math.sin(2 * Math.PI * 330 * (start + i) / 44100) * 16000)));
  chunks.push(encoder.flush()); return Buffer.concat(chunks.map(value => Buffer.from(value)));
}
test('evaluate at fragment boundaries, repeat a series, change one future block and retain history after reopening', async () => {
  test.setTimeout(60000);
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-evaluation-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const launch = () => electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  let app = await launch();
  try {
    let page = await app.firstWindow(); const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 960 });
    const routineId = await page.evaluate(async bytes => {
      const exercise = await window.hitthebeat!.saveExercise({ title: 'Fragmenten', description: 'Rustige wisselslag.', bpm: 120, duration: 4, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'synth.mp3', bytes: new Uint8Array(bytes) } });
      const step = (bpm: number, repetitions: number, start: number, end: number) => ({ id: crypto.randomUUID(), bpm, repetitions, start, end });
      const routine = await window.hitthebeat!.saveRoutine({ title: 'Techniek', blocks: [
        { id: crypto.randomUUID(), exerciseId: exercise.id, steps: [step(75, 1, .2, .7), step(95, 2, .2, .7), step(85, 1, 1, 2.5)] },
        { id: crypto.randomUUID(), exerciseId: exercise.id, steps: [step(120, 1, .2, 1.7)] },
      ] });
      await window.hitthebeat!.saveRoutine({ title: 'Ander sessie', blocks: [{ id: crypto.randomUUID(), exerciseId: exercise.id, steps: [step(100, 1, .2, .7)] }] });
      return routine.id;
    }, [...track()]);
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('article', { name: 'Techniek', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fragmentserie afgerond', exact: true })).toBeVisible();
    const pausedTime = await page.getByTestId('time-planned').textContent();
    const before = await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0]);
    expect(before.progress.passes).toBe(3); expect(before.progress.step).toBe(1); expect(before.progress.statuses[0]).toBe('pending');
    await page.waitForTimeout(1100);
    await expect(page.getByTestId('time-planned')).toHaveText(pausedTime!);
    const after = await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0]);
    expect(after.progress.times.planned).toBeCloseTo(before.progress.times.planned, 2);
    expect(after.progress.times.pause).toBeCloseTo(before.progress.times.pause, 2);
    await expect(page.getByRole('textbox', { name: 'Notitie (optioneel)' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Deze serie opnieuw', exact: true }).click();
    await expect(page.getByTestId('session-bpm')).toHaveText('75 BPM');
    await expect(page.getByRole('heading', { name: 'Fragmentserie afgerond', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Beoordeling .* van 5/ })).toHaveCount(0);
    await page.keyboard.press('3');
    await expect(page.getByLabel('2. Aanpassing in BPM')).toBeFocused();
    await page.getByLabel('Aanpassing in BPM').fill('400');
    await expect(page.getByRole('button', { name: 'Verder met volgende fragment', exact: true })).toBeDisabled();
    await page.getByLabel('Aanpassing in BPM').fill('');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Fragmentserie afgerond', exact: true })).toBeVisible();
    await page.getByLabel('Aanpassing in BPM').fill('5');
    await expect(page.getByTestId('tempo-preview')).toHaveText('75 → 80 · 95 → 100 · 85 → 90 BPM');

    await page.locator('#main').focus();
    await page.screenshot({ path: 'test-results/phase6-evaluation.png', fullPage: true });
    await page.getByLabel('Aanpassing in BPM').press('Enter');
    await expect(page.getByTestId('session-bpm')).toHaveText('85 BPM');
    const routines = await page.evaluate(async () => window.hitthebeat!.listRoutines());
    expect(routines.find(item => item.id === routineId)!.blocks[0].steps.map(step => step.bpm)).toEqual([80,100,90]);
    expect(routines.find(item => item.id === routineId)!.blocks[1].steps[0].bpm).toBe(120);
    expect(routines.find(item => item.title === 'Ander sessie')!.blocks[0].steps[0].bpm).toBe(100);
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('session-bpm')).toHaveText('120 BPM');
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible();
    await page.keyboard.press('1');
    await expect(page.getByLabel('Aanpassing in BPM')).toBeFocused();
    await page.keyboard.type('7');
    await expect(page.getByLabel('Aanpassing in BPM')).toHaveValue('7');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Je resultaten zijn bewaard bij Voortgang.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Terug naar mijn sessies', exact: true }).click();
    await page.getByRole('article', { name: 'Techniek', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await expect(page.getByLabel('BPM oefening 1 stap 1', { exact: true })).toHaveValue('80');
    await page.getByRole('button', { name: 'Voortgang', exact: true }).click();
    await expect(page.getByRole('img', { name: 'Beoordelingen van alle zichtbare oefeningen' })).toHaveCount(0);
    expect(await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0].progress.passes)).toBe(8);
    await page.locator('#main').focus();
    await page.screenshot({ path: 'test-results/phase6-history.png', fullPage: true });
    await app.close(); app = await launch(); page = await app.firstWindow();
    await page.getByRole('article', { name: 'Techniek', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await expect(page.getByLabel('BPM oefening 1 stap 2', { exact: true })).toHaveValue('100');
    const saved = await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0]);
    expect(saved.status).toBe('completed'); expect(saved.progress.passes).toBe(8);
    expect(saved.routine.blocks[0].steps.map(item => item.bpm)).toEqual([75,95,85]);
    expect(saved.evaluations).toHaveLength(4);
    expect(saved.evaluations.every(item => item.note === '')).toBe(true);
    expect(saved.evaluations.map(item => item.rating)).toEqual([undefined,undefined,undefined,undefined]);
    expect(saved.evaluations.map(item => item.delta)).toEqual([0,5,0,-7]);
    expect((await page.evaluate(async () => window.hitthebeat!.listRoutines())).find(item => item.id === routineId)!.blocks[1].steps[0].bpm).toBe(113);
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await page.getByRole('button', { name: 'Sessie stoppen', exact: true }).click();
    await page.getByRole('button', { name: 'Stoppen en terug', exact: true }).click();
    await expect(page.getByRole('article', { name: 'Techniek', exact: true })).toBeVisible();
    await page.getByRole('article', { name: 'Techniek', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    expect(await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0].status)).toBe('stopped');
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await page.waitForTimeout(1100);
    await app.close(); app = await launch(); page = await app.firstWindow();
    const interrupted = await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0]);
    expect(interrupted.status).toBe('interrupted'); expect(interrupted.progress.passes).toBeLessThan(5);
    expect(errors).toEqual([]);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});

test('a conflicting plan edit leaves evaluation open and can be saved without overwriting that edit', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-review-conflict-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app = await electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const page = await app.firstWindow();
    await page.evaluate(async bytes => {
      const exercise = await window.hitthebeat!.saveExercise({ title: 'Proef', description: '', bpm: 120, duration: 4, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'test.mp3', bytes: new Uint8Array(bytes) } });
      await window.hitthebeat!.saveRoutine({ title: 'Sessie', blocks: [{ id: crypto.randomUUID(), exerciseId: exercise.id, steps: [{ id: crypto.randomUUID(), bpm: 120, start: .2, end: .7, repetitions: 1 }] }] });
    }, [...track()]);
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('article', { name: 'Sessie', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible();
    await page.evaluate(async () => { const routine = (await window.hitthebeat!.listRoutines())[0]; routine.blocks[0].steps[0].bpm = 140; await window.hitthebeat!.saveRoutine(routine); });
    await page.getByRole('button', { name: '3 · Sneller', exact: true }).click();
    await page.getByRole('button', { name: 'Sessie afronden', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('intussen gewijzigd');
    await page.waitForTimeout(1100);
    await expect(page.getByRole('alert')).toContainText('intussen gewijzigd');
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible();
    expect(await page.evaluate(async () => (await window.hitthebeat!.listSessions())[0].evaluations.length)).toBe(0);
    await page.getByRole('button', { name: '2 · Gelijk houden', exact: true }).click();
    await page.getByRole('button', { name: 'Sessie afronden', exact: true }).click();
    await expect(page.getByText('Je resultaten zijn bewaard bij Voortgang.', { exact: true })).toBeVisible();
    expect(await page.evaluate(async () => (await window.hitthebeat!.listRoutines())[0].blocks[0].steps[0].bpm)).toBe(140);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});
