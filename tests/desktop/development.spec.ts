import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { createServer } from 'vite';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('development server loads desktop bridge, local font and injected styles', async () => {
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE), 'Development server is tested with the development runtime.');
  const { version } = JSON.parse(await readFile('package.json', 'utf8'));
  const data = await mkdtemp(path.join(tmpdir(), 'hitthebeat-dev-test-'));
  const server = await createServer();
  try {
    await server.listen();
    const desktop = await electron.launch({ args: ['--lang=nl-NL', '.'], env: { ...process.env, HITTHEBEAT_DEV: '1', HITTHEBEAT_TEST_DATA: data } });
    try {
      const page = await desktop.firstWindow();
      await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
      await expect(page.locator('.sidebar-bottom .version')).toHaveText(`HITtheBeat · v${version}`);
      await expect(page.locator('.sidebar-bottom .version')).toBeVisible();
      expect(await page.locator('.app-shell').evaluate(element => getComputedStyle(element).display)).toBe('grid');
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.fonts.check('16px "Source Sans 3"'))).toBe(true);
      const encoder = new Mp3Encoder(1, 44100, 128), chunks: Uint8Array[] = [];
      for (let start = 0; start < 88200; start += 1152) chunks.push(encoder.encodeBuffer(Int16Array.from({ length: Math.min(1152, 88200 - start) }, (_, i) => Math.sin(2 * Math.PI * 440 * (start + i) / 44100) * 12000)));
      chunks.push(encoder.flush());
      await page.evaluate(async bytes => {
        const exercise = await window.hitthebeat!.saveExercise({ title: 'Ontwikkelproef', description: '', bpm: 120, duration: 2, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'dev.mp3', bytes: new Uint8Array(bytes) } });
        await window.hitthebeat!.saveRoutine({ title: 'Dev sessie', blocks: [{ id: crypto.randomUUID(), exerciseId: exercise.id, steps: [{ id: crypto.randomUUID(), bpm: 60, repetitions: 1, start: 0, end: 2 }] }] });
      }, [...Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))]);
      await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
      await page.reload();
      await page.getByRole('article', { name: 'Dev sessie', exact: true }).getByRole('button', { name: 'Starten' }).click();
      await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();

    } finally {
      await desktop.close();
    }
  } finally {
    await server.close();
    await rm(data, { recursive: true, force: true });
  }
});
