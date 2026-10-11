import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboard, localDay } from '../src/library/progress.mjs';
const now = new Date('2026-10-11T12:00:00Z'), timeZone = 'Europe/Amsterdam';
const options = { now, timeZone, period: 'all' };
function session(id, date = '2026-10-10T12:00:00Z', patch = {}) {
  return { id, startedAt: date, status: 'completed', routine: { id: 'routine', title: 'Techniek', blocks: [{ id: 'block', exerciseId: 'exercise', steps: [{ start: null, end: null, bpm: 90 }] }] }, exercises: [{ id: 'exercise', title: 'Wisselslag', duration: 20, bpm: 120 }], evaluations: [], progress: { times: { planned: 10, fragment: 0, pause: 30 }, played: [{ mode: 'planned', block: 0, step: 0, a: 0, b: 20, bpm: 90, pitch: 0, seconds: 10, completed: 1 }] }, ...patch };
}
test('empty history has zero totals and real calendar days, without tempo points', () => {
  const data = buildDashboard([], { now, timeZone, period: 'week' });
  assert.equal(data.totalSeconds, 0); assert.equal(data.practiceDays, 0); assert.equal(data.practicedSessions, 0); assert.deepEqual(data.groups, []);
  assert.equal(data.from, '2026-10-05'); assert.equal(data.days.length, 7); assert.ok(data.days.every(day => day.seconds === 0));
});
test('actual planned and free time counts across statuses, pauses and unplayed sessions do not', () => {
  const records = ['completed','partial','stopped','interrupted','running'].map((status, index) => session(`${index}`, undefined, { status }));
  records[1].progress.times.fragment = 5;
  const unplayed = session('unplayed'); unplayed.progress.times.planned = 0; unplayed.progress.played = [];
  const data = buildDashboard([...records, unplayed], options);
  assert.equal(data.totalSeconds, 55); assert.equal(data.plannedSeconds, 50); assert.equal(data.fragmentSeconds, 5); assert.equal(data.practiceDays, 1); assert.equal(data.practicedSessions, 5); assert.equal(data.completedSessions, 1);
  assert.equal(data.days.find(day => day.day === '2026-10-10').seconds, 55);
});
test('local day, DST fall-back, Monday and month boundaries use the chosen timezone', () => {
  assert.equal(localDay('2026-10-25T00:30:00Z', timeZone), '2026-10-25');
  assert.equal(localDay('2026-10-25T01:30:00Z', timeZone), '2026-10-25');
  assert.equal(localDay('2026-03-31T22:30:00Z', timeZone), '2026-04-01');
  const records = [session('sunday', '2026-10-25T22:30:00Z'), session('monday', '2026-10-25T23:30:00Z'), session('future', '2026-10-27T12:00:00Z')];
  const data = buildDashboard(records, { period: 'week', now: new Date('2026-10-26T12:00:00Z'), timeZone });
  assert.equal(data.from, '2026-10-26'); assert.deepEqual(data.sessions.map(item => item.id), ['monday']); assert.equal(data.days.length, 1);
  const month = buildDashboard([session('old', '2026-03-31T21:30:00Z'), session('new', '2026-03-31T22:30:00Z')], { period: 'month', now: new Date('2026-04-01T12:00:00Z'), timeZone });
  assert.deepEqual(month.sessions.map(item => item.id), ['new']);
  assert.equal(buildDashboard([session('tokyo', '2026-10-10T23:30:00Z')], { ...options, timeZone: 'Asia/Tokyo' }).days.at(-1).seconds, 10);
});
test('tempo uses completed planned passes, with one max point per session and no fabricated rating', () => {
  const first = session('first', '2026-10-09T12:00:00Z');
  first.routine.blocks[0].steps.push({ start: 0, end: 20, bpm: 110 });
  first.progress.played.push({ ...first.progress.played[0], step: 1, bpm: 110, completed: 2 });
  const second = session('second'); second.progress.played[0].bpm = 100;
  const unfinished = session('unfinished'); unfinished.progress.played[0].completed = 0; unfinished.progress.played[0].bpm = 200;
  const data = buildDashboard([unfinished, second, first], options);
  assert.equal(data.groups.length, 1); assert.deepEqual(data.groups[0].points.map(point => point.bpm), [110,100]); assert.equal(data.groups[0].points[0].completed, 3); assert.equal(data.groups[0].points[0].rating, undefined); assert.equal(data.totalSeconds, 30);
  assert.equal(buildDashboard([unfinished], options).groups[0].points.length, 0);
});
test('full track, fragments, routines, blocks, pitch and source corrections stay separate', () => {
  const base = session('full');
  const fragment = session('fragment'); fragment.routine.blocks[0].steps[0] = { start: 2, end: 4, bpm: 100, fragmentName: 'Overgang' }; fragment.progress.played[0] = { ...fragment.progress.played[0], a: 2, b: 4, bpm: 100 };
  const other = session('other'); other.routine.id = 'warmup';
  const block = session('block'); block.routine.blocks[0].id = 'other-block';
  const corrected = session('corrected'); corrected.exercises[0].bpm = 110;
  const free = session('free'); free.progress.played[0] = { ...free.progress.played[0], mode: 'fragment', completed: 0 };
  const pitch = structuredClone(free); pitch.id = 'pitch'; pitch.progress.played[0].pitch = 3;
  const data = buildDashboard([base, fragment, other, block, corrected, free, pitch], options);
  assert.equal(data.groups.length, 7); assert.equal(data.groups.filter(group => group.part === 'Volledige track').length, 6); assert.ok(data.groups.some(group => group.part === 'Overgang · 2–4 s'));
  const freeGroup = data.groups.find(group => group.mode === 'fragment' && group.pitch === 0); assert.equal(freeGroup.points[0].completed, 0); assert.equal(freeGroup.points[0].bpm, 90);
});
test('ratings and notes belong to the matching series; repeated assessments use last stored choice', () => {
  const record = session('rated'); record.routine.blocks[0].steps.push({ start: 2, end: 4, bpm: 100 });
  record.progress.played.push({ ...record.progress.played[0], step: 1, a: 2, b: 4, bpm: 100 });
  record.evaluations = [{ block: 0, fromStep: 0, toStep: 0, rating: 2, note: 'Nog lastig', action: 'repeat', delta: 0 }, { block: 0, fromStep: 0, toStep: 0, rating: 4, note: 'Ontspannen', action: 'faster', delta: 5 }, { block: 0, fromStep: 1, toStep: 1, rating: 1, note: 'Overgang lastig', action: 'slower', delta: -5 }];
  const data = buildDashboard([record], options);
  const full = data.groups.find(group => group.part === 'Volledige track').points[0]; const fragment = data.groups.find(group => group.part !== 'Volledige track').points[0];
  assert.equal(full.rating, 4); assert.equal(full.delta, 5); assert.equal(full.note, 'Ontspannen'); assert.equal(fragment.rating, 1); assert.equal(fragment.delta, -5);
});
test('aggregation leaves immutable source records intact and all-time chart only shows last 28 days', () => {
  const records = [session('old', '2026-01-01T12:00:00Z'), session('new')], original = structuredClone(records);
  const data = buildDashboard(records, options);
  assert.deepEqual(records, original); assert.equal(data.totalSeconds, 20); assert.equal(data.days.length, 28); assert.equal(data.days.reduce((sum, day) => sum + day.seconds, 0), 10); assert.equal(data.groups[0].points.length, 2);
});
