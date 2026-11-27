import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('edit sound and meter per session, then complete it by keyboard', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-session-keys-'));
  const app = await electron.launch({
    args: ['--lang=nl-NL', '.', `--user-data-dir=${root}`],
    env: { ...process.env, HITTHEBEAT_DEV: '0' },
  });
  try {
    const page = await app.firstWindow();
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(async bytes => {
      const api = window.hitthebeat!;
      const exercise = await api.saveExercise({ title: 'Track', description: '', bpm: 120, duration: 6, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'track.m4a', bytes: new Uint8Array(bytes) } });
      for (const title of ['A', 'B']) {
        await api.saveRoutine({ title, blocks: [{ id: crypto.randomUUID(), exerciseId: exercise.id, steps: [
          { id: crypto.randomUUID(), bpm: 120, repetitions: 1, start: 0, end: 2 },
          { id: crypto.randomUUID(), bpm: 120, repetitions: 1, start: 2, end: 3 },
        ] }] });
      }
    }, Array.from(await readFile('tests/fixtures/pulse-aac.m4a')));
    await page.reload();
    const card = page.getByRole('article', { name: 'A', exact: true });
    await card.getByRole('button', { name: 'Bewerken' }).click();
    await page.getByLabel('Maatsoort aftelmaat oefening 1').selectOption('6/8');
    await expect(page.getByLabel('Aftellen oefening 1')).not.toBeChecked();
    await page.getByLabel('Klank oefening 1 stap 1').selectOption('metronome');
    await expect(page.getByLabel('Klank oefening 1 stap 2')).toHaveValue('audio');
    await page.getByRole('button', { name: 'Sessie opslaan' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Oefensessie opgeslagen.' })).toBeVisible();
    await page.getByRole('button', { name: 'Terug naar overzicht' }).click();

    await page.locator('#main').focus();
    await page.keyboard.press('ArrowRight');
    await expect(card.getByRole('button', { name: 'Starten' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('article', { name: 'B', exact: true }).getByRole('button', { name: 'Starten' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('playback-sound')).toHaveText('Alleen metronoom');
    const play = page.getByRole('button', { name: 'Afspelen', exact: true });
    await expect(play).toBeEnabled();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pauzeren' })).toBeEnabled();
    await page.keyboard.press('Space');
    await expect(play).toBeEnabled();
    await page.keyboard.press('1');
    await expect(play).toBeEnabled();
    await page.keyboard.press('Space');
    await expect(page.getByRole('heading', { name: 'Fragmentserie afgerond' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('playback-sound')).toHaveText('Audio');
    await expect(page.getByRole('heading', { name: 'Oefening afgerond' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Terug naar mijn sessies' })).toBeEnabled();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Recente oefensessies' })).toBeVisible();
    await page.getByRole('button', { name: 'Info over HITtheBeat' }).click();
    await expect(page.getByRole('heading', { name: 'Sneltoetsen' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  } finally {
    await app.close();
    await rm(root, { recursive: true, force: true });
  }
});
