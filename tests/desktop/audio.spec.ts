import { test, expect, _electron as electron } from '@playwright/test';
import { Mp3Encoder } from '@breezystack/lamejs';
import { createServer } from 'vite';

test('audio controls load MP3 offline, validate loops, and respect keyboard focus', async () => {
  const desktop = await electron.launch({ executablePath: process.env.HITTHEBEAT_TEST_EXECUTABLE, args: process.env.HITTHEBEAT_TEST_EXECUTABLE ? [] : ['.'], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const page = await desktop.firstWindow();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.getByRole('button', { name: 'Audioproef', exact: true }).click();
    await page.context().setOffline(true);
    await page.getByRole('button', { name: 'Voorbeeldmelodie laden' }).click();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await page.waitForTimeout(300);
    await page.locator('h1').click();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible();
    const stopped = Number(await page.getByRole('slider').inputValue());
    await page.waitForTimeout(200);
    expect(Number(await page.getByRole('slider').inputValue())).toBeCloseTo(stopped, 1);
    await page.getByLabel('Speeltempo BPM', { exact: true }).fill('22.5');
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Speeltempo BPM', { exact: true })).toHaveValue('22.5');
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
    const loopPosition = Number(await page.getByRole('slider').inputValue());
    expect(loopPosition).toBeGreaterThanOrEqual(1);
    expect(loopPosition).toBeLessThan(2);
    await page.getByLabel('Begin A (seconden)', { exact: true }).fill('3');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alert')).toContainText('fragment');
    await page.getByLabel('Origineel BPM', { exact: true }).focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await page.locator('h1').click();
    await page.keyboard.press('1');
    await expect.poll(async () => Number(await page.getByRole('slider').inputValue())).toBeLessThan(1.2);
    await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/audio-player.png', fullPage: true });
    const encoder = new Mp3Encoder(1, 44100, 128);
    const chunks: Uint8Array[] = [];
    for (let start = 0; start < 44100 * 2; start += 1152) {
      const pcm = Int16Array.from({ length: Math.min(1152, 88200 - start) }, (_, i) => Math.sin(2 * Math.PI * 440 * (start + i) / 44100) * 12000);
      chunks.push(encoder.encodeBuffer(pcm));
    }
    chunks.push(encoder.flush());
    await page.getByLabel('Audiobestand kiezen').setInputFiles({ name: 'test-440Hz.mp3', mimeType: 'audio/mpeg', buffer: Buffer.concat(chunks.map(chunk => Buffer.from(chunk))) });
    await expect(page.getByRole('heading', { name: 'test-440Hz.mp3' })).toBeVisible();
    await page.getByRole('button', { name: 'Afspelen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pauzeren', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Mijn oefenrondjes', exact: true }).click();
    await page.getByRole('button', { name: 'Audioproef', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Afspelen', exact: true })).toBeDisabled();
    expect(errors).toEqual([]);
  } finally { await desktop.close(); }
});

test('DSP preserves pitch at different speeds and shifts pitch at fixed speed', async () => {
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE), 'DSP harness uses source modules; packaged controls tested separately.');
  const server = await createServer();
  await server.listen();
  const desktop = await electron.launch({ args: ['.'], env: { ...process.env, HITTHEBEAT_DEV: '1' } });
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
    for (const result of results) {
      expect(Math.abs(result.frequency - result.expectedFrequency)).toBeLessThan(8);
      expect(Math.abs(result.end - result.expectedEnd)).toBeLessThan(result.rate === .25 && !result.loop ? .25 : .2);
      expect(result.minimumRms).toBeGreaterThan(.02);
    }
  } finally { await desktop.close(); await server.close(); }
});
