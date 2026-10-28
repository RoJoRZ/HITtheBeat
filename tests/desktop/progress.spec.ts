import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

test('dashboard reflects real time, combined exercise tempo, no score and immutable history offline', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hitthebeat-progress-'));
  const executablePath = process.env.HITTHEBEAT_TEST_EXECUTABLE;
  const launch = () => electron.launch({ executablePath, args: ['--lang=nl-NL', ...(executablePath ? [] : ['.']), `--user-data-dir=${root}`], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
  let app = await launch();
  try {
    let page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.getByRole('button', { name: 'Voortgang', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Elke oefening telt' })).toBeVisible();
    await expect(page.getByTestId('dashboard-time')).toHaveText('0:00');
    await expect(page.getByRole('img', { name: /Gespeeld tempo/ })).toHaveCount(0);
    await page.evaluate(async () => {
      const source = await window.hitthebeat!.saveExercise({ title: 'Wisselslag', description: 'Ontspannen oefenen.', bpm: 120, detectedBpm: null, analysisStatus: 'unavailable', duration: 20, audio: { name: 'test.mp3', bytes: new Uint8Array([73,68,51,0,0,0,0,0,0,0,0,0]) } });
      const routine = await window.hitthebeat!.saveRoutine({ title: 'Dagelijkse techniek', blocks: [{ id: crypto.randomUUID(), exerciseId: source.id, steps: [{ id: crypto.randomUUID(), start: null, end: null, bpm: 90, repetitions: 1 }, { id: crypto.randomUUID(), start: 2, end: 4, bpm: 110, repetitions: 1 }] }] });
      const session = await window.hitthebeat!.startSession(routine.id);
      const first = { mode: 'planned' as const, block: 0, step: 0, a: 0, b: 20, bpm: 90, pitch: 0, seconds: 20, completed: 1 };
      const progress = { ...session.progress, seq: 1, phase: 'review', passes: 1, statuses: ['pending'], times: { planned: 20, fragment: 0, pause: 120 }, played: [first] };
      await window.hitthebeat!.saveSession(session.id, progress, 'running');
      await window.hitthebeat!.reviewSession(session.id, { id: crypto.randomUUID(), block: 0, fromStep: 0, toStep: 0, action: 'same', delta: 0, rating: 3, note: 'Rustige aanslag.' });
      const final = { ...progress, seq: 2, step: 1, passes: 2, statuses: ['completed'], times: { planned: 22, fragment: 3, pause: 120 }, played: [first, { ...first, step: 1, a: 2, b: 4, bpm: 110, seconds: 2 }, { ...first, mode: 'fragment' as const, a: .5, b: 1, bpm: 60, pitch: 3, seconds: 3, completed: 0 }] };
      await window.hitthebeat!.saveSession(session.id, final, 'running');
      await window.hitthebeat!.reviewSession(session.id, { id: crypto.randomUUID(), block: 0, fromStep: 1, toStep: 1, action: 'same', delta: 0, rating: 4, note: 'Overgang ontspannen.' });
      await window.hitthebeat!.saveSession(session.id, { ...final, seq: 3, phase: 'complete' }, 'completed');
      const stopped = await window.hitthebeat!.startSession(routine.id);
      await window.hitthebeat!.saveSession(stopped.id, { ...stopped.progress, seq: 1, phase: 'paused', times: { planned: 1, fragment: 0, pause: 50 }, played: [{ ...first, seconds: 1, completed: 0 }] }, 'stopped');
    });
    await page.evaluate(() => window.hitthebeat!.setDashboardSettings({ period: 'week', tempo: 'min' }));
    const oldId = await page.evaluate(async () => {
      const e = await window.hitthebeat!.saveExercise({ kind: 'metronome', title: 'Ritme', description: '', bpm: 120, detectedBpm: null, analysisStatus: 'unavailable', duration: 0, meter: '4/4', bars: 1 });
      const r = await window.hitthebeat!.saveRoutine({ title: 'Ritmesessie', blocks: [{ id: crypto.randomUUID(), exerciseId: e.id, steps: [{ id: crypto.randomUUID(), start: null, end: null, bpm: 120, repetitions: 1 }] }] });
      let id = '';
      for (let i = 0; i < 2; i++) {
        const run = await window.hitthebeat!.startSession(r.id); id = run.id;
        await window.hitthebeat!.saveSession(run.id, { ...run.progress, seq: 1, phase: 'complete', passes: 1, statuses: ['completed'], times: { planned: 2, fragment: 0, pause: 30 }, played: [{ mode: 'planned', block: 0, step: 0, a: 0, b: 2, bpm: 120, pitch: 0, seconds: 2, completed: 1 }] }, 'completed');
      }
      return id;
    });
    // Only the temporary fixture database is changed: put one run outside this month.
    await app.close();
    const db = new DatabaseSync(path.join(root, 'library', 'library.sqlite'));
    const date = new Date(); date.setDate(date.getDate() - 45);
    try { const old = db.prepare('SELECT progress FROM sessions WHERE id=?').get(oldId)!; const progress = JSON.parse(String(old.progress)); progress.passes = 0; progress.played.forEach((item: { completed: number }) => { item.completed = 0; }); db.prepare('UPDATE sessions SET started_at=?, progress=?, status=\'stopped\' WHERE id=?').run(date.toISOString(), JSON.stringify(progress), oldId); } finally { db.close(); }
    app = await launch(); page = await app.firstWindow();
    page.on('pageerror', error => errors.push(error.message));

    await page.getByRole('button', { name: 'Mijn oefensessies', exact: true }).click();
    await page.getByRole('button', { name: 'Voortgang', exact: true }).click();
    await expect(page.getByTestId('dashboard-time')).toHaveText('0:28');
    await expect(page.getByTestId('dashboard-days')).toHaveText('1');
    await expect(page.getByTestId('dashboard-sessions')).toHaveText('3');
    await expect(page.getByLabel('Periode voortgang').locator('option')).toHaveCount(4);
    const tempos = page.getByRole('img', { name: 'Gespeelde tempo’s van alle zichtbare oefeningen', exact: true });
    await expect(page.getByRole('heading', { name: 'Score-ontwikkeling', exact: true })).toHaveCount(0);
    const ratings = page.getByRole('img', { name: 'Beoordelingen van alle zichtbare oefeningen', exact: true });
    await expect(tempos.locator('circle')).toHaveCount(3);
    await expect(tempos.locator('circle').filter({ hasText: '90 BPM' })).toHaveCount(1);
    await expect(tempos.locator('circle').filter({ hasText: '110 BPM' })).toHaveCount(0);
    await expect(tempos.locator('circle').filter({ hasText: '60 BPM' })).toHaveCount(1);
    await expect(page.getByTestId('exercise-frequency')).toHaveCount(2);
    const firstFrequency = await page.getByTestId('exercise-frequency').allTextContents();
    await expect(page.getByRole('heading', { name: 'Laatste resultaat voor dit onderdeel' })).toHaveCount(0);
    await expect(page.getByText('Fragmenten en evaluaties bekijken', { exact: true })).toHaveCount(0);
    await expect(page.locator('.activity-day')).toHaveCount(30);
    const latestRange = await page.getByTestId('activity-range').innerText();
    await expect(page.getByRole('button', { name: 'Volgende 30 dagen', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Vorige 30 dagen', exact: true }).click();
    await expect(page.getByTestId('activity-range')).not.toHaveText(latestRange);
    await expect(page.getByRole('button', { name: 'Vorige 30 dagen', exact: true })).toBeDisabled();
    await expect(page.getByTestId('dashboard-time')).toHaveText('0:28');
    await page.getByText('Oefentijd per dag bekijken', { exact: true }).click();
    await expect(page.getByRole('table')).toContainText('0:02');
    await page.getByRole('button', { name: 'Volgende 30 dagen', exact: true }).click();
    await expect(page.getByTestId('activity-range')).toHaveText(latestRange);
    await page.getByRole('checkbox', { name: 'Wisselslag', exact: true }).uncheck();
    await expect(tempos.locator('circle')).toHaveCount(1);
    await expect(ratings).toHaveCount(0);
    await expect(page.getByTestId('dashboard-time')).toHaveText('0:28');
    expect(await page.getByTestId('exercise-frequency').allTextContents()).toEqual(firstFrequency);
    await page.getByRole('checkbox', { name: 'Ritme', exact: true }).uncheck();
    await expect(tempos).toHaveCount(0);
    await expect(page.getByText('Geen zichtbare meetpunten in deze periode.', { exact: true })).toHaveCount(1);
    await page.getByRole('checkbox', { name: 'Wisselslag', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Ritme', exact: true }).check();
    for (const period of ['month', 'year', 'all']) {
      await page.getByLabel('Periode voortgang').selectOption(period);
      await expect(page.getByTestId('dashboard-time')).toHaveText(period === 'month' ? '0:28' : '0:30');
    }
    await expect(tempos.locator('text').filter({ hasText: date.toLocaleDateString('nl-NL', {day:'numeric',month:'short',year:'numeric'}) })).toHaveCount(1);
    await page.getByText('Oefentijd per dag bekijken', { exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: 'test-results/release-1.1-dashboard.png', fullPage: true });
    const original = await page.evaluate(() => window.hitthebeat!.listSessions());
    await page.evaluate(async () => { const routine = (await window.hitthebeat!.listRoutines()).find(item => item.title === 'Dagelijkse techniek')!; await window.hitthebeat!.saveRoutine({ ...routine, title: 'Gewijzigde training', blocks: routine.blocks.map(block => ({ ...block, steps: block.steps.map(step => ({ ...step, bpm: 130 })) })) }); });
    await app.close(); app = await launch(); page = await app.firstWindow();
    await page.context().setOffline(true);
    await page.getByRole('button', { name: 'Voortgang', exact: true }).click();
    await page.getByLabel('Periode voortgang').selectOption('all');
    await expect(page.getByTestId('dashboard-time')).toHaveText('0:30');
    await expect(page.getByRole('img', { name: 'Gespeelde tempo’s van alle zichtbare oefeningen', exact: true }).locator('circle').filter({ hasText: 'Wisselslag' })).toHaveCount(2);
    expect(await page.evaluate(() => window.hitthebeat!.listSessions())).toEqual(original);
    await page.setViewportSize({ width: 960, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('checkbox', { name: 'Ritme', exact: true }).focus();
    await page.getByRole('checkbox', { name: 'Ritme', exact: true }).press('Space');
    await expect(page.getByRole('checkbox', { name: 'Ritme', exact: true })).not.toBeChecked();
    await page.evaluate(() => window.hitthebeat!.setLanguage('en'));
    const englishChart = page.getByRole('img', { name: 'Tempos played for all visible exercises', exact: true });
    await expect(englishChart).toBeVisible();
    await expect(englishChart.locator('circle').filter({ hasText: 'Wisselslag' })).toHaveCount(2);
    await expect(englishChart.locator('circle').filter({ hasText: 'Volledige track' })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'Ritme', exact: true })).not.toBeChecked();
    await expect(page.getByLabel('Progress period')).toHaveValue('all');
    expect(errors).toEqual([]);
  } finally { await app.close(); await rm(root, { recursive: true, force: true }); }
});

test('dashboard settings persist period/tempo across navigation and restart without changing language', async () => {
 const root=await mkdtemp(path.join(tmpdir(),'htb-dash-settings-'));
 const launch=()=>electron.launch({args:['.','--lang=nl-NL',`--user-data-dir=${root}`],env:{...process.env,HITTHEBEAT_DEV:'0'}});
 let app=await launch();
 try {
  let page=await app.firstWindow(); await page.getByRole('button',{name:'Instellingen',exact:true}).click();
  await expect(page.getByLabel('Standaardperiode')).toHaveValue('all'); await expect(page.getByLabel('Getoond tempo')).toHaveValue('min');
  await page.getByLabel('Standaardperiode').selectOption('year'); await expect(page.getByLabel('Getoond tempo')).toBeEnabled();
  await page.getByLabel('Getoond tempo').selectOption('average'); await expect(page.getByLabel('Getoond tempo')).toBeEnabled();
  await page.getByRole('button',{name:'Voortgang',exact:true}).click(); await expect(page.getByLabel('Periode voortgang')).toHaveValue('year');
  await page.getByLabel('Periode voortgang').selectOption('week');
  await page.getByRole('button',{name:'Instellingen',exact:true}).click(); await expect(page.getByLabel('Standaardperiode')).toHaveValue('year');
  await app.close();app=await launch();page=await app.firstWindow();
  await page.getByRole('button',{name:'Voortgang',exact:true}).click();await expect(page.getByLabel('Periode voortgang')).toHaveValue('year');
  expect(await page.evaluate(()=>window.hitthebeat!.getDashboardSettings())).toEqual({period:'year',tempo:'average'});
 } finally {await app.close();await rm(root,{recursive:true,force:true});}
});
