import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('audio-free metronome creates offline, reopens, edits bars and plays mixed session with evaluation/history', async () => {
  test.setTimeout(45000);
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-metronome-ui-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const launch = () => electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  let app = await launch();
  try {
    let page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.context().setOffline(true);
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await page.getByRole('button', { name: 'Oefening toevoegen', exact: true }).click();
    await page.getByLabel('Oefentype', { exact: true }).selectOption('metronome');
    await expect(page.getByLabel('Audiobestand (MP3 of M4A)', { exact: true })).toHaveCount(0);
    await page.getByLabel('Naam', { exact: true }).fill('Tellen in zes');
    await page.getByLabel('Maatsoort', { exact: true }).selectOption('6/8');
    await page.getByLabel('BPM', { exact: true }).fill('120');
    await expect(page.getByLabel('Maten per herhaling', { exact: true })).toHaveValue('8');
    await page.getByLabel('Maten per herhaling', { exact: true }).fill('2');
    await page.getByLabel('Opdracht', { exact: true }).fill('Accent op één en vier.');
    await page.getByRole('button', { name: 'Oefening opslaan', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Metronoomspeler' })).toBeVisible();
    await page.locator('#main').focus(); await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible();
    await page.getByRole('slider', { name: 'Volume', exact: true }).fill('37');
    await page.getByRole('button', { name: 'Geluid dempen', exact: true }).click();
    await app.close(); app = await launch(); page = await app.firstWindow();
    page.on('pageerror', error => errors.push(error.message));
    const aac = Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
    await page.evaluate(async bytes => { const source = await window.hitthebeat!.saveExercise({ title: 'Audio na metronoom', description: '', bpm: 120, detectedBpm: null, analysisStatus: 'unavailable', duration: 6, audio: { name: 'track.m4a', bytes: new Uint8Array(bytes) } }); return source.id; }, aac);
    await page.reload();
    await page.getByRole('button', { name: 'Nieuwe oefensessie', exact: true }).click();
    await page.getByLabel('Naam van de sessie').fill('Gemengde sessie');
    const saved = await page.evaluate(() => window.hitthebeat!.listExercises());
    await page.getByLabel('Oefening blok 1').selectOption(saved.find(item => item.kind === 'metronome')!.id);
    await expect(page.getByLabel('Maten oefening 1 stap 1')).toHaveCount(0);
    await expect(page.getByRole('cell', { name: '2 maten', exact: true })).toBeVisible();
    await page.getByLabel('Herhalingen oefening 1 stap 1').fill('2');
    await expect(page.getByTestId('own-round-duration')).toContainText('0:06');
    await page.getByRole('button', { name: 'Oefening toevoegen aan sessie', exact: true }).click();
    await page.getByLabel('Oefening blok 2').selectOption(saved.find(item => item.kind === 'audio')!.id);
    await page.getByRole('button', { name: 'Sessie opslaan', exact: true }).click();
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Fragment oefenen', exact: true })).toBeDisabled();
    await expect(page.getByRole('slider', { name: 'Volume', exact: true })).toHaveValue('37');
    await expect(page.getByRole('button', { name: 'Dempen opheffen', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Dempen opheffen', exact: true }).click();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await page.locator('#main').focus(); await page.keyboard.press('1'); await page.keyboard.press('Space');
    await expect(page.getByText('Stap 1 van 1 · Herhaling 2 van 2', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/metronome-session.png', fullPage: true });
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Audio na metronoom', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fragment oefenen', exact: true })).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Sessie afgerond', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(async () => (await window.hitthebeat!.listSessions())[0].status)).toBe('completed');
    await page.getByRole('button', { name: 'Voortgang', exact: true }).click();
    await expect(page.locator('circle[aria-label]').filter({hasText:'Tellen in zes'}).first()).toBeVisible();
    expect(errors).toEqual([]);
    const history = await page.evaluate(() => window.hitthebeat!.listSessions());
    expect(history[0].exercises.find(item => item.title === 'Tellen in zes')).toMatchObject({meter:'6/8',bars:2}); expect(history[0].progress.passes).toBe(3); expect(history[0].progress.times.fragment).toBe(0); expect(history[0].evaluations).toHaveLength(2);
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await page.getByRole('button', { name: /Tellen in zes.*Metronoom/ }).click();
    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await expect(page.getByLabel('Maten per herhaling', { exact: true })).toHaveValue('2');
    await page.getByLabel('Maten per herhaling', { exact: true }).fill('4');
    await page.getByRole('button', { name: 'Oefening opslaan', exact: true }).click();
    await expect(page.getByRole('definition').filter({ hasText: /^4$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click();
    await expect(page.getByRole('article', { name: 'Gemengde sessie' })).toContainText('0:18 gepland');
    expect((await page.evaluate(() => window.hitthebeat!.listSessions()))[0].exercises.find(item => item.kind === 'metronome')!.bars).toBe(2);

  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});

test('metronome rendered pulses use the audio clock, scale with tempo and mute/pause correctly', async () => {
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE), 'Source DSP harness; packaged UI is checked separately.');
  const { createServer } = await import('vite'); const server = await createServer(); await server.listen();
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-metronome-dsp-'));
  const app = await electron.launch({ args: ['--lang=nl-NL', '.', `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '1' } });
  try {
    const page = await app.firstWindow(); await expect(page.locator('h1')).toBeVisible();
    const result = await page.evaluate(async () => { const { metronomeProbe } = await import('/tests/audio/metronome-probe.ts'); return metronomeProbe(); });
    for (const [index, item] of result.results.entries()) {
      expect(item.onsets).toHaveLength([3,4,6][index]);
      for (let i = 1; i < item.onsets.length; i++) expect(item.onsets[i] - item.onsets[i-1]).toBeCloseTo([.5,.25,.5][index], 2);
      expect(item.lastPeak).toBeLessThan(.00001);
    }
    expect(result.muted).toBeLessThan(.00001); expect(result.full).toBeGreaterThan(.1); expect(result.paused).toBeLessThan(.00001);
    expect(result.stoppedAt).toBeCloseTo(result.pausedPosition, 6);
  } finally { await app.close(); await server.close(); await rm(root, { recursive: true, force: true }); }
});
