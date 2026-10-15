import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('detached notation follows exercises, zooms/resizes/fullscreens, reuses and closes without stopping playback', async () => {
  test.setTimeout(60000);
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-notation-')), executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const app = await electron.launch({ executablePath, args: [...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  try {
    const main = await app.firstWindow(), errors: string[] = [];
    await expect(main.locator('h1')).toBeVisible(); await main.waitForLoadState('load');
    main.on('pageerror', e => errors.push(e.message));
    const bytes = Array.from(await readFile('tests/fixtures/pulse-aac.m4a'));
    await main.evaluate(async bytes => {
      const api = window.hitthebeat!;
      const image = (label: string) => {
        const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1000;
        const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1600, 1000); ctx.fillStyle = '#222'; ctx.font = '48px sans-serif'; ctx.fillText(label, 80, 100);
        ctx.strokeStyle = '#222'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(80, 220 + i * 80); ctx.lineTo(1500, 220 + i * 80); ctx.stroke(); }
        ctx.fillText('5    7    5    7    8    7    5', 150, 460);
        return { name: 'tab.png', bytes: Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]), c => c.charCodeAt(0)) };
      };
      const first = await api.saveExercise({ title: 'Wisselslag', description: '', bpm: 120, duration: 6, detectedBpm: null, analysisStatus: 'unavailable', audio: { name: 'audio.m4a', bytes: new Uint8Array(bytes) }, image: image('Wisselslag') });
      const second = await api.saveExercise({ title: 'Maatgevoel', kind: 'metronome', meter: '3/4', bars: 8, description: '', bpm: 120, duration: 0, detectedBpm: null, analysisStatus: 'unavailable', image: image('Maatgevoel') });
      const third = await api.saveExercise({ title: 'Zonder tab', kind: 'metronome', meter: '4/4', bars: 8, description: '', bpm: 120, duration: 0, detectedBpm: null, analysisStatus: 'unavailable' });
      await api.saveRoutine({ title: 'Tabvenster testen', blocks: [first, second, third].map(exercise => ({ id: crypto.randomUUID(), exerciseId: exercise.id, steps: [{ id: crypto.randomUUID(), bpm: 120, repetitions: 99, start: null, end: null }] })) });
    }, bytes);
    await main.reload(); await main.context().setOffline(true);
    await main.getByRole('article', { name: 'Tabvenster testen' }).getByRole('button', { name: 'Starten', exact: true }).click();
    await main.getByRole('button', { name: 'Afspelen', exact: true }).click();
    const opened = app.waitForEvent('window'); await main.getByRole('button', { name: 'Tablatuur vergroten', exact: true }).click();
    const viewer = await opened; viewer.on('pageerror', e => errors.push(e.message));
    await expect(viewer.getByRole('img', { name: 'Tablatuur bij Wisselslag' })).toBeVisible();
    expect(await viewer.evaluate(() => typeof window.hitthebeat)).toBe('undefined');
    expect(await viewer.evaluate(() => typeof (window as unknown as { require?: unknown }).require)).toBe('undefined');
    expect(await viewer.evaluate(() => Object.keys(window.notationViewer!))).toEqual(['getState', 'onChange', 'toggleFullscreen', 'close']);
    const security = await app.evaluate(({ BrowserWindow, ipcMain }) => {
      const windows = BrowserWindow.getAllWindows(), child = windows.find(w => w.webContents.getURL().includes('?view=notation'))!;
      const prefs = child.webContents.getLastWebPreferences();
      const mainBackgroundThrottling = windows.find(w => w !== child)!.webContents.getBackgroundThrottling();
      const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, (event: unknown) => unknown> })._invokeHandlers;
      let blocked = false; try { handlers.get('library:list')!({ sender: child.webContents, senderFrame: child.webContents.mainFrame }); } catch { blocked = true; }
      return { mainBackgroundThrottling, sandbox: prefs.sandbox, isolation: prefs.contextIsolation, node: prefs.nodeIntegration, blocked, movable: child.isMovable(), resizable: child.isResizable() };
    });
    expect(security).toEqual({ mainBackgroundThrottling: false, sandbox: true, isolation: true, node: false, blocked: true, movable: true, resizable: true });
    const width = await viewer.getByRole('img').evaluate(img => img.getBoundingClientRect().width);
    await viewer.getByRole('button', { name: 'Inzoomen', exact: true }).click();
    await expect(viewer.getByLabel('Afbeeldingszoom')).toHaveText('125%');
    expect(await viewer.getByRole('img').evaluate(img => img.getBoundingClientRect().width)).toBeGreaterThan(width);
    await viewer.getByRole('button', { name: 'Uitzoomen', exact: true }).click();
    await expect(viewer.getByLabel('Afbeeldingszoom')).toHaveText('100%');
    await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('?view=notation'))!; w.setBounds({ x: 120, y: 100, width: 700, height: 560 }); });
    await expect.poll(() => viewer.evaluate(() => innerWidth)).toBeLessThan(750);
    await viewer.getByRole('button', { name: 'Inzoomen', exact: true }).click();
    await viewer.getByRole('button', { name: 'Volledig scherm', exact: true }).click();
    await expect(viewer.getByRole('button', { name: 'Volledig scherm verlaten' })).toBeVisible();
    await expect(viewer.getByLabel('Afbeeldingszoom')).toHaveText('125%');
    await viewer.keyboard.press('Escape');
    await expect(viewer.getByRole('button', { name: 'Volledig scherm', exact: true })).toBeVisible();
    await viewer.getByRole('button', { name: 'Passend', exact: true }).click();
    await main.getByRole('button', { name: 'Tablatuur vergroten', exact: true }).click();
    expect(app.windows()).toHaveLength(2);
    await viewer.screenshot({ path: 'test-results/notation-window.png' });
    await main.getByRole('button', { name: 'Oefening overslaan', exact: true }).click();
    await expect(viewer.getByRole('heading', { name: 'Maatgevoel', exact: true })).toBeVisible();
    await expect(viewer.getByRole('img', { name: 'Tablatuur bij Maatgevoel' })).toBeVisible();
    await main.getByRole('button', { name: 'Oefening overslaan', exact: true }).click();
    await expect(viewer.getByRole('heading', { name: 'Zonder tab', exact: true })).toBeVisible();
    await expect(viewer.getByText('Geen tablatuur bij deze oefening.', { exact: true })).toBeVisible();
    await expect(viewer.getByRole('img')).toHaveCount(0);
    await viewer.getByRole('button', { name: 'Tablatuurvenster sluiten' }).click();
    await expect.poll(() => app.windows().length).toBe(1);
    await expect(main.getByRole('button', { name: 'Pauzeren', exact: true })).toBeEnabled();
    const previous = await main.getByTestId('time-planned').textContent();
    await expect(main.getByTestId('time-planned')).not.toHaveText(previous!, { timeout: 4000 });
    expect((await main.evaluate(() => window.hitthebeat!.listSessions()))[0].status).toBe('running');
    // Reopen from the library, then closing the main window must also close its detached viewer.
    await main.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click(); await main.getByRole('button', { name: 'Stoppen en terug', exact: true }).click();
    await main.getByRole('button', { name: 'Oefeningen', exact: true }).click();
    await main.getByRole('button', { name: /Wisselslag/ }).click();
    const reopened = app.waitForEvent('window'); await main.getByRole('button', { name: 'Tablatuur vergroten', exact: true }).click();
    const secondViewer = await reopened; await expect(secondViewer.getByRole('img')).toBeVisible();
    await main.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click();
    await expect(secondViewer.getByRole('heading', { name: 'Geen oefening actief' })).toBeVisible();
    await expect(secondViewer.getByRole('img')).toHaveCount(0);
    expect(errors).toEqual([]);
    await main.close(); await expect.poll(() => app.windows().length).toBe(0);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});
