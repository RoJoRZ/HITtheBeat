import { test, expect, _electron as electron } from '@playwright/test';
import { createServer } from 'vite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('development server loads desktop bridge, local font and injected styles', async () => {
  test.skip(Boolean(process.env.HITTHEBEAT_TEST_EXECUTABLE), 'Development server is tested with the development runtime.');
  const data = await mkdtemp(path.join(tmpdir(), 'hitthebeat-dev-test-'));
  const server = await createServer();
  try {
    await server.listen();
    const desktop = await electron.launch({ args: ['.'], env: { ...process.env, HITTHEBEAT_DEV: '1', HITTHEBEAT_TEST_DATA: data } });
    try {
      const page = await desktop.firstWindow();
      await expect(page.getByRole('heading', { name: 'Mijn oefenrondjes', exact: true })).toBeVisible();
      await expect(page.getByText('HITtheBeat · v0.0.1')).toBeVisible();
      expect(await page.locator('.app-shell').evaluate(element => getComputedStyle(element).display)).toBe('grid');
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.fonts.check('16px "Source Sans 3"'))).toBe(true);
    } finally {
      await desktop.close();
    }
  } finally {
    await server.close();
    await rm(data, { recursive: true, force: true });
  }
});
