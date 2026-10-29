import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { createServer } from 'vite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('audio controls load MP3 offline, validate loops, and respect keyboard focus', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-audio-controls-'));
  const desktop = await electron.launch({ executablePath: process.env.HITTHEBEAT_TEST_EXECUTABLE, args: ['--lang=nl-NL', ...(process.env.HITTHEBEAT_TEST_EXECUTABLE ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const page = await desktop.firstWindow();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const encoder = new Mp3Encoder(1, 44100, 128), chunks: Uint8Array[] = [];
    for (let start = 0; start < 44100 * 8; start += 1152) chunks.push(encoder.encodeBuffer(Int16Array.from({ length: Math.min(1152, 44100 * 8 - start) }, (_, i) => Math.sin(2 * Math.PI * 440 * (start + i) / 44100) * 12000)));
    chunks.push(encoder.flush());
    await page.evaluate(async bytes => { await window.hitthebeat!.saveExercise({ title: 'Toetsen oefenen', description: '', bpm: 90, duration: 8, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'test-440Hz.mp3', bytes: new Uint8Array(bytes) } }); }, [...Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))]);
    await page.context().setOffline(true);
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await page.waitForTimeout(300);
    await page.locator('h1').click();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible();
    const stopped = Number(await page.getByRole('slider', { name: 'Afspeelpositie', exact: true }).inputValue());
    await page.waitForTimeout(200);
    expect(Number(await page.getByRole('slider', { name: 'Afspeelpositie', exact: true }).inputValue())).toBeCloseTo(stopped, 1);
    await page.getByLabel('Speeltempo BPM', { exact: true }).fill('22.5');
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Speeltempo BPM', { exact: true })).toHaveValue('23'); // New manual BPM is whole; the DSP probe still checks exact 25% playback.
    await page.getByLabel('Speeltempo BPM', { exact: true }).fill('270');
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Speeltempo BPM', { exact: true })).toHaveValue('270');
    await page.getByLabel('Speeltempo BPM', { exact: true }).fill('271');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alert')).toContainText('25–300%');
    await page.getByLabel('Speeltempo BPM', { exact: true }).fill('60');
    await page.keyboard.press('Enter');
    await page.getByLabel('Toonhoogte (halve tonen)', { exact: true }).fill('3');
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Speeltempo BPM', { exact: true })).toHaveValue('60');
    await page.getByLabel('Begin A (seconden)', { exact: true }).fill('1');
    await page.keyboard.press('Enter');
    await page.getByLabel('Einde B (seconden)', { exact: true }).fill('2');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Loop', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Loop', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await page.waitForTimeout(1900);
    const loopPosition = Number(await page.getByRole('slider', { name: 'Afspeelpositie', exact: true }).inputValue());
    expect(loopPosition).toBeGreaterThanOrEqual(1);
    expect(loopPosition).toBeLessThan(2);
    await page.getByLabel('Begin A (seconden)', { exact: true }).fill('3');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alert')).toContainText('fragment');
    await page.getByLabel('Speeltempo BPM', { exact: true }).focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await page.locator('h1').click();
    await page.keyboard.press('1');
    await expect.poll(async () => Number(await page.getByRole('slider', { name: 'Afspeelpositie', exact: true }).inputValue())).toBeLessThan(1.2);
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/audio-player.png', fullPage: true });
    await page.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click();
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally { await desktop.close(); await rm(root, { recursive: true, force: true }); }
});

test('DSP preserves pitch at different speeds and shifts pitch at fixed speed', async () => {
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE), 'DSP harness uses source modules; packaged controls tested separately.');
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-dsp-'));
  const server = await createServer();
  await server.listen();
  const desktop = await electron.launch({ args: ['--lang=nl-NL', '.', `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '1' } });
  try {
    const page = await desktop.firstWindow();
    await expect(page.locator('h1')).toBeVisible();
    const results = await page.evaluate(async () => {
      const { probe } = await import('/tests/audio/probe.ts');
      const cases = [];
      for (const [rate, pitch] of [[1, 0], [.25, 0], [.5, 0], [2, 0], [3, 0], [1, 12], [1.5, -12], [.25, 12], [3, -12]]) cases.push(await probe(rate, pitch, false));
      for (const rate of [.25, 1, 3]) cases.push(await probe(rate, 0, true));
      return cases;
    });
    console.log('DSP measurements', results);
    const segment = await page.evaluate(async () => { const { segmentProbe } = await import('/tests/audio/segment-probe.ts'); return segmentProbe(); });
    expect(segment.during).toBeGreaterThan(.03);
    expect(segment.after).toBeLessThan(.00001);
    expect(segment.end).toBeCloseTo(.6, 3);
    expect(segment.ended).toBe(true);
    expect(segment.loopPosition).toBeGreaterThanOrEqual(.1);
    expect(segment.loopPosition).toBeLessThan(.3);
    expect(segment.loopEnded).toBe(false);
    expect(segment.loopRms).toBeGreaterThan(.03);
    expect(segment.replacementRms).toBeLessThan(.00001);

    const levels = await page.evaluate(async () => { const { volumeProbe } = await import('/tests/audio/volume-probe.ts'); return volumeProbe(); });
    expect(levels.quiet.full / levels.loud.full).toBeCloseTo(1, 1);
    for (const level of [levels.quiet, levels.loud]) {
      expect(level.initialMuted).toBeLessThan(.00001);
      expect(level.full).toBeGreaterThan(.08); expect(level.full).toBeLessThan(.15);
      expect(level.half / level.full).toBeCloseTo(.5, 1);
      expect(level.muted).toBeLessThan(.00001);
      expect(level.restored / level.full).toBeCloseTo(.5, 1);
      expect(level.afterEnd).toBeLessThan(.00001);
      expect(level.loop).toBeGreaterThan(.02); expect(level.loopMuted).toBeLessThan(.00001);
    }

    for (const result of results) {
      expect(Math.abs(result.frequency - result.expectedFrequency)).toBeLessThan(8);
      expect(Math.abs(result.end - result.expectedEnd)).toBeLessThan(result.rate === .25 && !result.loop ? .25 : .2);
      expect(result.minimumRms).toBeGreaterThan(.02);
    }
  } finally { await desktop.close(); await server.close(); await rm(root, { recursive: true, force: true }); }
});
