import { barsLabel, t } from '../../electron/i18n.mjs';
import { isMetronome, exerciseBars, sourceSeconds } from '../../electron/exercise-model.mjs';
/** @typedef {import('./types').SessionRecord} Session */
/** @typedef {'week'|'month'|'year'|'all'} Period */
/** @param {Date|string} value @param {string} timeZone */
export function localDay(value, timeZone) {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
/** @param {string} day @param {number} amount */
function shiftDay(day, amount) { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10); }
/** Calendar subtraction clamps leap day to February 28. @param {string} day */
function yearAgo(day) { const year = Number(day.slice(0, 4)) - 1, month = Number(day.slice(5, 7)); const last = new Date(Date.UTC(year, month, 0)).getUTCDate(); return `${year}-${day.slice(5, 7)}-${String(Math.min(Number(day.slice(8)), last)).padStart(2, '0')}`; }
/** @param {Session[]} sessions @param {{offset?:number,now?:Date,timeZone?:string}} options */
export function buildActivity(sessions, { offset = 0, now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {}) {
  const today = localDay(now, timeZone), end = shiftDay(today, -30 * Math.max(0, Math.floor(offset))), from = shiftDay(end, -29);
  /** @type {Map<string,number>} */
  const totals = new Map();
  for (const session of sessions) { const day = localDay(session.startedAt, timeZone); if (day >= from && day <= end) totals.set(day, (totals.get(day) ?? 0) + session.progress.times.planned + session.progress.times.fragment); }
  const days = [];
  for (let day = from; day <= end; day = shiftDay(day, 1)) days.push({ day, seconds: totals.get(day) ?? 0 });
  return { from, end, days, canGoBack: sessions.some(session => localDay(session.startedAt, timeZone) < from && session.progress.times.planned + session.progress.times.fragment > 0) };
}
/** @param {Session[]} sessions @param {{period?:Period,tempo?:'min'|'max'|'average',now?:Date,timeZone?:string}} options */
export function buildDashboard(sessions, { period = 'all', tempo = 'min', now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {}) {
  const today = localDay(now, timeZone);
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const from = period === 'week' ? shiftDay(today, -((weekday + 6) % 7)) : period === 'month' ? `${today.slice(0, 7)}-01` : period === 'year' ? yearAgo(today) : '0000-00-00';
  const selected = sessions.filter(session => { const day = localDay(session.startedAt, timeZone); return day >= from && day <= today; }).sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id));
  const practiced = selected.filter(session => session.progress.times.planned + session.progress.times.fragment > 0);
  const dayTotals = new Map();
  let planned = 0, fragment = 0;
  for (const session of practiced) {
    planned += session.progress.times.planned; fragment += session.progress.times.fragment;
    const day = localDay(session.startedAt, timeZone);
    dayTotals.set(day, (dayTotals.get(day) ?? 0) + session.progress.times.planned + session.progress.times.fragment);
  }
  const days = buildActivity(sessions, { now, timeZone }).days;
  /** @type {Map<string,{id:string,title:string,count:number}>} */
  const exercises = new Map();
  /** @type {Map<string, {key:string,exerciseId:string,routine:string,exercise:string,part:string,kind:string,mode:string,pitch:number,originalBpm:number,sourceDuration:number,block:number,points:{sessionId:string,date:string,day:string,bpm:number,completed:number,seconds:number,status:Session['status'],rating:number|undefined,note:string,action:string,delta:number}[]}>} */
  const groups = new Map();
  for (const session of [...practiced].reverse()) {
    /** @type {Map<string, {bpm:number,completed:number,seconds:number,steps:Set<number>}>} */
    const points = new Map();
    const practicedIds = new Set();
    for (const played of session.progress.played) {
      if (played.seconds <= 0) continue;
      const block = session.routine.blocks[played.block], source = session.exercises.find(item => item.id === block.exerciseId);
      if (!source) continue;
      const summary = exercises.get(source.id) ?? { id: source.id, title: source.title, count: 0 };
      summary.title = source.title;
      if (!practicedIds.has(source.id)) { summary.count++; practicedIds.add(source.id); }
      exercises.set(source.id, summary);
      const step = block.steps[played.step];
      // Planned boundaries come from the immutable selection, avoiding decoder-duration drift.
      const a = played.mode === 'planned' ? step.start ?? 0 : played.a;
      const b = played.mode === 'planned' ? step.end ?? sourceSeconds(step, source) : played.b;
      const full = a === 0 && b === sourceSeconds(step, source);
      const key = JSON.stringify([session.routine.id, block.id, source.id, source.bpm, source.duration, isMetronome(source) ? [source.kind, source.meter, exerciseBars(step, source)] : full ? 'full' : [a, b], played.mode, played.pitch]);
      const part = isMetronome(source) ? t("Metronoom {0} · {1}", source.meter, barsLabel(exerciseBars(step, source))) : full ? t("Volledige track") : t("{0}{1}–{2} s", played.mode === 'planned' && step.fragmentName ? `${step.fragmentName} · ` : t("Fragment "), a, b);
      const group = groups.get(key) ?? { key, exerciseId: source.id, routine: session.routine.title, exercise: source.title, part, kind: source.kind ?? 'audio', mode: played.mode, pitch: played.pitch, originalBpm: source.bpm, sourceDuration: source.duration, block: played.block + 1, points: [] };
      group.routine = session.routine.title; group.exercise = source.title; group.part = part;
      groups.set(key, group);
      // An unfinished planned pass contributes practice time, but no completed-pass BPM point.
      if (played.mode === 'planned' && played.completed === 0) continue;
      const point = points.get(key) ?? { bpm: 0, completed: 0, seconds: 0, steps: new Set() };
      point.bpm = Math.max(point.bpm, played.bpm); point.completed += played.completed; point.seconds += played.seconds; point.steps.add(played.step);
      points.set(key, point);
    }
    for (const [key, point] of points) {
      const group = groups.get(key);
      if (!group) continue;
      const review = group.mode === 'planned' ? session.evaluations.filter(item => item.block === group.block - 1 && [...point.steps].some(step => step >= item.fromStep && step <= item.toStep)).at(-1) : undefined;
      group.points.push({ sessionId: session.id, date: session.startedAt, day: localDay(session.startedAt, timeZone), bpm: point.bpm, completed: point.completed, seconds: point.seconds, status: session.status, rating: review?.rating, note: review?.note ?? '', action: review?.action ?? '', delta: review?.delta ?? 0 });
    }
  }
  /** @type {Map<string,{key:string,exerciseId:string,exercise:string,points:{sessionId:string,day:string,bpm:number,seconds:number}[]}>} */
  const tempoGroups = new Map();
  for (const session of [...practiced].reverse()) {
    /** @type {Map<string,{min:number,max:number,weighted:number,seconds:number}>} */
    const totals = new Map();
    for (const played of session.progress.played) {
      if (!(played.seconds > 0) || !(played.bpm > 0)) continue;
      const id = session.routine.blocks[played.block]?.exerciseId;
      const source = session.exercises.find(item => item.id === id); if (!source) continue;
      const group = tempoGroups.get(source.id) ?? { key: source.id, exerciseId: source.id, exercise: source.title, points: [] };
      group.exercise = source.title; tempoGroups.set(source.id, group);
      const total = totals.get(source.id) ?? { min: Infinity, max: 0, weighted: 0, seconds: 0 };
      total.min = Math.min(total.min, played.bpm); total.max = Math.max(total.max, played.bpm);
      total.weighted += played.bpm * played.seconds; total.seconds += played.seconds; totals.set(source.id, total);
    }
    for (const [id, total] of totals) tempoGroups.get(id)?.points.push({ sessionId: session.id, day: localDay(session.startedAt, timeZone), seconds: total.seconds, bpm: tempo === 'min' ? total.min : tempo === 'max' ? total.max : total.weighted / total.seconds });
  }
  return { tempoGroups: [...tempoGroups.values()], from, today, timeZone, sessions: selected, totalSeconds: planned + fragment, plannedSeconds: planned, fragmentSeconds: fragment, practiceDays: dayTotals.size, practicedSessions: practiced.length, completedSessions: practiced.filter(session => session.status === 'completed').length, days, exercises: [...exercises.values()].sort((a, b) => a.title.localeCompare(b.title, 'nl') || a.id.localeCompare(b.id)), groups: [...groups.values()].sort((a, b) => a.routine.localeCompare(b.routine, 'nl') || a.block - b.block || a.part.localeCompare(b.part, 'nl') || a.mode.localeCompare(b.mode) || a.pitch - b.pitch) };
}
