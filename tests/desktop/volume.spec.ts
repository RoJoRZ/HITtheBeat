import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
function mp3(amplitude: number) {
  const encoder = new Mp3Encoder(1, 44100, 128), chunks: Uint8Array[] = [];
  for (let start = 0; start < 44100 * 5; start += 1152) chunks.push(encoder.encodeBuffer(Int16Array.from({ length: Math.min(1152, 44100 * 5 - start) }, (_, i) => Math.sin(2 * Math.PI * 440 * (start + i) / 44100) * amplitude)));
  chunks.push(encoder.flush()); return Buffer.concat(chunks.map(value => Buffer.from(value)));
}
test('import normalizes quiet and loud MP3, volume and mute survive exercise changes, free loops and reopening', async () => {
  test.setTimeout(45000);
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-volume-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const launch = () => electron.launch({ executablePath, args: [...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  let app = await launch();
  try {
    let page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.context().setOffline(true);
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    for (const [name, amplitude] of [['Zacht', 1600], ['Luid', 16000]] as const) {
      await page.getByRole('button', { name: 'Oefening toevoegen', exact: true }).click();
      await page.getByLabel('Audiobestand (MP3 of M4A)', { exact: true }).setInputFiles({ name: `${name}.mp3`, mimeType: 'audio/mpeg', buffer: mp3(amplitude) });
      await expect(page.getByRole('status')).toContainText('Geen duidelijk tempo gevonden');
      await expect(page.getByText(/Gemeten aanpassing:/)).toBeVisible();
      await page.getByLabel('Origineel BPM', { exact: true }).fill('120');
      await page.getByRole('button', { name: 'Oefening opslaan', exact: true }).click();
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
    const sources = await page.evaluate(async () => window.hitthebeat!.listExercises());
    const quiet = sources.find(item => item.title === 'Zacht')!, loud = sources.find(item => item.title === 'Luid')!;
    expect(quiet.normalizationDb).toBeGreaterThan(0); expect(loud.normalizationDb).toBeLessThan(0);
    expect(quiet.normalizationDb! - loud.normalizationDb!).toBeCloseTo(20, 0);
    // Existing unmeasured exercises can be normalized from their edit form too.
    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await page.getByLabel('Geluidsniveau normaliseren', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Oefening opslaan', exact: true }).click();
    await expect(page.getByText('Normalisatie uit', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await page.getByRole('button', { name: 'Volume normaliseren', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Geen duidelijk tempo gevonden');
    await expect(page.getByLabel('Geluidsniveau normaliseren', { exact: true })).toBeChecked();
    await page.getByRole('button', { name: 'Oefening opslaan', exact: true }).click();
    await page.getByRole('slider', { name: 'Volume', exact: true }).fill('43');
    await page.getByRole('button', { name: 'Geluid dempen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Dempen opheffen', exact: true })).toBeVisible();
    await page.evaluate(async () => {
      const sources = await window.hitthebeat!.listExercises();
      await window.hitthebeat!.saveRoutine({ title: 'Niveaus', blocks: sources.map(source => ({ id: crypto.randomUUID(), exerciseId: source.id, steps: [{ id: crypto.randomUUID(), repetitions: 1, bpm: 120, start: .2, end: 1.7 }] })) });
    });
    await page.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click();
    await page.getByRole('article', { name: 'Niveaus', exact: true }).getByRole('button', { name: 'Bewerken' }).click();
    await page.getByRole('button', { name: 'Sessie starten', exact: true }).click();
    await expect(page.getByRole('slider', { name: 'Volume', exact: true })).toHaveValue('43');
    await expect(page.getByRole('button', { name: 'Dempen opheffen', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Dempen opheffen', exact: true }).click();
    await page.getByRole('slider', { name: 'Volume', exact: true }).focus(); await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fragment oefenen', exact: true }).click();
    await expect(page.getByRole('slider', { name: 'Volume', exact: true })).toHaveValue('43');
    await page.getByRole('button', { name: 'Terug naar sessie', exact: true }).click();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Oefening afgerond', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Verder met volgende oefening', exact: true }).click();
    await expect(page.getByRole('slider', { name: 'Volume', exact: true })).toHaveValue('43');
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await page.locator('#main').focus(); await page.setViewportSize({ width: 1440, height: 960 });
    await page.screenshot({ path: 'test-results/volume-player.png', fullPage: true });
    await page.getByRole('button', { name: 'Geluid dempen', exact: true }).click();
    await app.close(); app = await launch(); page = await app.firstWindow();
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await expect(page.getByRole('slider', { name: 'Volume', exact: true })).toHaveValue('43');
    await expect(page.getByRole('button', { name: 'Dempen opheffen', exact: true })).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: /^Genormaliseerd/ })).toBeVisible();
    expect(errors).toEqual([]);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});
