import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

function mp3(tone = false) {
  const encoder = new Mp3Encoder(1, 44100, 128), chunks: Uint8Array[] = [];
  for (let start = 0; start < 44100 * 12; start += 1152) {
    const pcm = Int16Array.from({ length: Math.min(1152, 44100 * 12 - start) }, (_, i) => {
      const t = (start + i) / 44100, beat = (t - 1) % .5;
      return tone ? Math.sin(2 * Math.PI * 440 * t) * 12000 : t >= 1 && beat < .12 ? Math.sin(2 * Math.PI * 330 * t) * Math.exp(-beat * 40) * 25000 : 0;
    });
    chunks.push(encoder.encodeBuffer(pcm));
  }
  chunks.push(encoder.flush()); return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

test('own library imports, estimates, corrects, edits and reopens copied media offline', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-library-ui-'));
  const source = path.join(root, 'original.mp3'); await writeFile(source, mp3());
  const executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const launch = () => electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${path.join(root, 'data')}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  let desktop = await launch();
  try {
    let page = await desktop.firstWindow(); const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.context().setOffline(true);
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Oefening verwijderen', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Oefening toevoegen', exact: true }).click();
    await page.getByLabel('Audiobestand (MP3 of M4A)', { exact: true }).setInputFiles(source);
    await expect(page.getByRole('status')).toContainText('Geschat tempo:', { timeout: 15000 });
    await expect(page.getByLabel('Geluidsniveau normaliseren', { exact: true })).toBeChecked();
    const estimated = Number((await page.getByRole('status').innerText()).match(/tempo: ([\d.]+)/)![1]);
    expect(Math.abs(estimated - 120)).toBeLessThan(2);
    await page.getByRole('textbox', { name: 'Naam', exact: true }).fill('Mijn warming-up');
    await page.getByLabel('Origineel BPM', { exact: true }).fill('118');
    await page.getByRole('textbox', { name: 'Opdracht', exact: true }).fill('Speel ontspannen.\nLuister naar de aanslag.');
    const png = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 200; const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#eee'; ctx.fillRect(0, 0, 600, 200); ctx.fillStyle = '#222'; ctx.font = '24px sans-serif'; ctx.fillText('Testtablatuur', 30, 90); return canvas.toDataURL('image/png').split(',')[1]; });
    await page.getByLabel('Tablatuur of foto').setInputFiles({ name: 'tab.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
    await expect(page.getByText(/tab.png · PNG/)).toBeVisible();
    await page.getByRole('button', { name: 'Oefening opslaan' }).click();
    await expect(page.getByRole('heading', { name: 'Mijn warming-up', exact: true })).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: /^Genormaliseerd/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await expect(page.getByRole('img', { name: 'Tablatuur bij Mijn warming-up' })).toBeVisible();
    const notationOpened = desktop.waitForEvent('window');
    await page.getByRole('button', { name: 'Tablatuur vergroten', exact: true }).click();
    const notation = await notationOpened;
    await expect(notation.getByRole('img')).toBeVisible(); await notation.close();
    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await page.getByRole('button', { name: 'BPM opnieuw analyseren' }).click();
    await expect(page.getByRole('status')).toContainText('Geschat tempo:');
    await expect(page.getByLabel('Origineel BPM', { exact: true })).toHaveValue('118');
    await page.getByRole('textbox', { name: 'Opdracht', exact: true }).fill('Bewaar mijn nieuwe opdracht.');
    await page.getByRole('button', { name: 'Oefening opslaan' }).click();
    await expect(page.getByText('Bewaar mijn nieuwe opdracht.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await page.locator('h1').click();
    await page.screenshot({ path: 'test-results/phase3-library.png', fullPage: true });
    await desktop.close(); await rm(source); desktop = await launch(); page = await desktop.firstWindow();
    page.on('pageerror', error => errors.push(error.message));
    await expect(page.getByRole('heading', { name: 'Mijn oefensessies', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await expect(page.getByText('Bewaar mijn nieuwe opdracht.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await expect(page.getByRole('definition').filter({ hasText: /^118 BPM$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await page.setViewportSize({ width: 960, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Oefening toevoegen', exact: true }).click();
    await page.getByLabel('Audiobestand (MP3 of M4A)', { exact: true }).setInputFiles({ name: 'broken.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('ID3corrupt MP3 contents') });
    await expect(page.getByRole('alert')).toContainText('kan niet worden gelezen');
    await expect(page.getByRole('button', { name: 'Oefening opslaan' })).toBeDisabled();
    await page.getByLabel('Audiobestand (MP3 of M4A)', { exact: true }).setInputFiles({ name: 'constant-tone.mp3', mimeType: 'audio/mpeg', buffer: mp3(true) });
    await expect(page.getByRole('status')).toContainText('Geen duidelijk tempo gevonden');
    await page.getByRole('textbox', { name: 'Naam', exact: true }).fill('Zonder tablatuur');
    await page.getByLabel('Origineel BPM', { exact: true }).fill('90');
    await page.getByRole('textbox', { name: 'Opdracht', exact: true }).fill('Een lange opdracht. '.repeat(200));
    await page.getByRole('button', { name: 'Oefening opslaan' }).click();
    await expect(page.getByRole('heading', { name: 'Zonder tablatuur', exact: true })).toBeVisible();
    await expect(page.getByText('Geen tablatuur toegevoegd.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    expect(await page.locator('.saved-instruction').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await page.getByLabel('Audiobestand vervangen (MP3 of M4A)', { exact: true }).setInputFiles({ name: 'replacement.mp3', mimeType: 'audio/mpeg', buffer: mp3() });
    await expect(page.getByRole('status')).toContainText('Geschat tempo:');
    await page.getByRole('button', { name: 'Oefening opslaan', exact: true }).click();
    await expect(page.getByRole('definition').filter({ hasText: /^replacement.mp3$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await expect(page.locator('.library-toolbar > .row-actions > button')).toHaveText(['Oefening importeren', 'Oefening verwijderen', 'Oefening toevoegen']);
    await page.getByRole('button', { name: 'Oefening verwijderen', exact: true }).click();
    await page.getByRole('button', { name: 'Annuleren', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Zonder tablatuur', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Oefening verwijderen', exact: true }).click();
    await page.getByRole('button', { name: 'Definitief verwijderen', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Zonder tablatuur', exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally { await desktop.close(); await rm(root, { recursive: true, force: true }); }
});
