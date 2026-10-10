import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('desktop loads offline, exposes only its narrow bridge, navigates and reopens', async () => {
  const data = await mkdtemp(path.join(tmpdir(), 'hitthebeat-test-'));
  try {
    for (let launch = 0; launch < 2; launch++) {
      const executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
      const desktop = await electron.launch({ executablePath, args: [...(executablePath ? [] : ['.']), `--user-data-dir=${data}`], env: { ...process.env, HITTHEBEAT_TEST_DATA: data, HITTHEBEAT_DEV: '0' } });
      try {
        const page = await desktop.firstWindow();
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await expect(page.getByRole('heading', { name: 'Mijn oefenrondjes', exact: true })).toBeVisible();
        await page.context().setOffline(true);
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Mijn oefenrondjes', exact: true })).toBeVisible();
        await expect(page.getByText('HITtheBeat · v0.0.5')).toBeVisible();
        await page.getByRole('button', { name: 'Eigen bibliotheek bekijken' }).click();
        await expect(page.getByRole('button', { name: 'Oefenrondje maken' })).toBeDisabled();
        expect(await page.evaluate(() => typeof (window as unknown as { require?: unknown }).require)).toBe('undefined');
        const preferences = await desktop.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences());
        expect(preferences.contextIsolation).toBe(true);
        expect(preferences.nodeIntegration).toBe(false);
        expect(preferences.sandbox).toBe(true);
        await page.getByRole('button', { name: 'Oefeningen', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Oefeningen', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Voortgang', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Jouw voortgang' })).toBeVisible();
        await page.getByRole('button', { name: 'Mijn oefenrondjes', exact: true }).click();
        await page.getByRole('button', { name: 'Mijn oefenrondjes', exact: true }).focus();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Oefeningen', exact: true })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('heading', { name: 'Oefeningen', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Mijn oefenrondjes', exact: true }).click();
        await page.setViewportSize({ width: 960, height: 700 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.setViewportSize({ width: 1440, height: 960 });
        await page.screenshot({ path: `test-results/desktop-start-${launch}.png` });
        expect(errors).toEqual([]);
      } finally {
        await desktop.close();
      }
    }
  } finally {
    await rm(data, { recursive: true, force: true });
  }
});
