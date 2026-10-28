import { t, locale, getLanguage } from '../../electron/i18n.mjs';
import { bpmText } from '../../electron/tempo-display.mjs';
import { useMemo, useState } from 'react';
import type { SessionRecord } from '../library/types';
import { buildDashboard, buildActivity } from '../library/progress.mjs';
import type { Period } from '../library/progress.mjs';
import { durationLabel } from './controls';

type Dashboard = ReturnType<typeof buildDashboard>;
const palette = ['#FF922E', '#67C6E3', '#C6A0F6', '#9BCA72', '#F28DB0', '#F1D06A', '#7AD4BB', '#A4AFF5'];
const dayLabel = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString(locale(), { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
const dayTime = (day: string) => Date.parse(`${day}T12:00:00Z`);
const color = (id: string) => palette[[...id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0) % palette.length];
function context(group: Dashboard['groups'][number]) {
  return `${group.exercise} · ${group.routine}${t(" · oefening ")}${group.block} · ${group.part} · ${group.mode === 'planned' ? t("Sessie") : t("Vrije training")} · ${bpmText(group.originalBpm)}${t(" BPM origineel")}${group.kind !== 'metronome' ? `${t(" · bron ")}${durationLabel(group.sourceDuration)}` : ''}${group.pitch ? t(" · {0}{1} halve tonen", group.pitch > 0 ? '+' : '', group.pitch) : ''}`;
}
function TrendChart({ data, hidden, metric }: { data: Dashboard; hidden: Set<string>; metric: 'bpm' | 'rating' }) {
  const candidates: {key:string;exerciseId:string;label:string;points:{sessionId:string;day:string;bpm:number;rating?:number}[]}[] = metric === 'bpm' ? data.tempoGroups.map(group => ({ ...group, label: group.exercise })) : data.groups.map(group => ({ ...group, label: context(group) }));
  const groups = candidates.filter(group => !hidden.has(group.exerciseId) && group.points.some(point => point[metric] !== undefined));
  const values = groups.flatMap(group => group.points.flatMap(point => point[metric] === undefined ? [] : [point[metric]!]));
  const score = metric === 'rating';
  const label = score ? t("Beoordelingen van alle zichtbare oefeningen") : t("Gespeelde tempo’s van alle zichtbare oefeningen");
  if (!values.length) return <p role="status">{t("Geen zichtbare meetpunten in deze periode.")}</p>;
  const min = score ? 1 : Math.max(0, Math.floor(Math.min(...values) / 10) * 10 - 5);
  const max = score ? 5 : Math.ceil(Math.max(...values) / 10) * 10 + 5;
  const from = data.from === '0000-00-00' ? (candidates.flatMap(group => group.points.map(point => point.day)).sort()[0] ?? data.today) : data.from;
  const start = dayTime(from), end = dayTime(data.today), span = end - start;
  const x = (day: string) => span === 0 ? 400 : 65 + (dayTime(day) - start) / span * 700;
  const y = (value: number) => 220 - (value - min) / (max - min) * 175;
  return <svg viewBox="0 0 830 285" className="dashboard-chart" role="img" aria-label={label}>
    {[0, 1, 2, 3, 4].map(tick => { const value = min + (max - min) * tick / 4; return <g key={tick}><line x1="60" y1={y(value)} x2="775" y2={y(value)} /><text x="48" y={y(value) + 4} textAnchor="end">{Math.round(value)}</text></g>; })}
    <text x="12" y="23">{score ? t("Cijfer") : 'BPM'}</text>
    {groups.map((group, index) => {
      const points = group.points.filter(point => point[metric] !== undefined);
      return <g key={group.key} data-exercise={group.exerciseId} data-testid={`trend-${metric}-series`}>
        {points.length > 1 && <polyline style={{ stroke: color(group.exerciseId) }} strokeDasharray={index % 3 === 0 ? undefined : index % 3 === 1 ? '8 4' : '2 4'} points={points.map(point => `${x(point.day)},${y(point[metric]!)}`).join(' ')} />}
        {points.map(point => { const text = `${dayLabel(point.day)} · ${group.label} · ${score ? `${point.rating}/5` : `${bpmText(point.bpm)} BPM`}`; return <circle key={point.sessionId} cx={x(point.day)} cy={y(point[metric]!)} r="5" style={{ fill: color(group.exerciseId) }} tabIndex={0} aria-label={text}><title>{text}</title></circle>; })}
      </g>;
    })}
    {[...new Set([start, Math.round((start + end) / 2), end])].map(date => <text key={date} x={span === 0 ? 400 : 65 + (date - start) / span * 700} y="260" textAnchor="middle">{dayLabel(new Date(date).toISOString().slice(0, 10))}</text>)}
  </svg>;
}
function FrequencyChart({ exercises }: { exercises: Dashboard['exercises'] }) {
  if (!exercises.length) return <p>{t("Nog geen oefeningen gespeeld in deze periode.")}</p>;
  const width = Math.max(830, 90 + exercises.length * 100), step = (width - 90) / exercises.length, maximum = Math.max(1, ...exercises.map(item => item.count));
  return <div className="table-scroll"><svg viewBox={`0 0 ${width} 340`} style={{ minWidth: width }} className="dashboard-chart frequency-chart" role="img" aria-label={t("Aantal keer geoefend per oefening")}>
    {[0, Math.ceil(maximum / 2), maximum].filter((value, i, all) => all.indexOf(value) === i).map(value => <g key={value}><line x1="55" x2={width - 20} y1={205 - value / maximum * 160} y2={205 - value / maximum * 160} /><text x="45" y={209 - value / maximum * 160} textAnchor="end">{value}</text></g>)}
    {exercises.map((item, index) => { const x = 65 + index * step, height = item.count / maximum * 160; return <g key={item.id} data-testid="exercise-frequency"><rect x={x + step * .15} y={205 - height} width={step * .55} height={height} fill={color(item.id)} tabIndex={0} aria-label={`${item.title}: ${item.count}`}><title>{item.title}: {item.count}</title></rect><text x={x + step * .42} y={195 - height} textAnchor="middle">{item.count}</text><text transform={`translate(${x + step * .3},225) rotate(45)`}>{item.title.length > 24 ? `${item.title.slice(0, 23)}…` : item.title}<title>{item.title}</title></text></g>; })}
  </svg></div>;
}
export function ProgressDashboard({ sessions, period, changePeriod, tempo }: { tempo: 'min'|'max'|'average'; sessions: SessionRecord[]; period: Period; changePeriod: (value: Period) => void }) {
  const language = getLanguage();
  const data = useMemo(() => buildDashboard(sessions, { period, tempo }), [sessions, period, tempo, language]);
  const [hidden, setHidden] = useState<Set<string>>(new Set()), [offset, setOffset] = useState(0);
  const activity = useMemo(() => buildActivity(sessions, { offset }), [sessions, offset]);
  const maximum = Math.max(1, ...activity.days.map(day => day.seconds));
  function toggle(id: string) { setHidden(before => { const next = new Set(before); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  return <div className="screen-stack progress-dashboard">
    <div className="round-heading"><p>{t("Maak zichtbaar wat je oefent, stap voor stap.")}</p><label className="round-picker">{t("Periode")}<select aria-label={t("Periode voortgang")} value={period} onChange={event => changePeriod(event.target.value as Period)}><option value="week">{t("Week")}</option><option value="month">{t("Maand")}</option><option value="year">{t("Jaar · laatste 12 maanden")}</option><option value="all">{t("Altijd")}</option></select></label></div>
    <div className="stats-grid"><section className="panel stat-card"><h2>{t("Geoefende tijd")}</h2><strong data-testid="dashboard-time">{durationLabel(data.totalSeconds)}</strong><p>{t("min:sec · sessie ")}{durationLabel(data.plannedSeconds)}{t(" · vrij ")}{durationLabel(data.fragmentSeconds)}</p></section><section className="panel stat-card"><h2>{t("Oefendagen")}</h2><strong data-testid="dashboard-days">{data.practiceDays}</strong><p>{t("Dagen met afgespeelde muziek")}</p></section><section className="panel stat-card"><h2>{t("Geoefende sessies")}</h2><strong data-testid="dashboard-sessions">{data.practicedSessions}</strong><p>{data.completedSessions}{t(" volledig afgerond")}</p></section></div>
    <p className="caption">{t("Pauzes en evaluaties tellen niet mee. Gestopte en onderbroken sessies tellen mee voor hun afgespeelde tijd. Dagindeling: ")}{data.timeZone}{t("; tijd wordt toegerekend aan de startdag van de sessie.")}</p>
    {!data.practicedSessions && <section className="panel"><h2>{t("Elke oefening telt")}</h2><p>{t("In deze periode is nog geen afgespeelde oefentijd bewaard. Start een oefensessie of kies een andere periode.")}</p></section>}
    {!!data.exercises.length && <fieldset className="panel exercise-legend"><legend>{t("Oefeningen in de tempografiek")}</legend><p className="caption">{t("Vink oefeningen uit om ze in de tempografiek te verbergen. Totalen en staafdiagram blijven gelijk.")}</p><div>{data.exercises.map(item => <label key={item.id}><input type="checkbox" checked={!hidden.has(item.id)} onChange={() => toggle(item.id)} /><span className="legend-swatch" style={{ background: color(item.id) }} />{item.title}</label>)}</div></fieldset>}
    <section className="panel progress-chart"><h2>{t("Tempo-ontwikkeling")}</h2><TrendChart data={data} hidden={hidden} metric="bpm" /><p className="caption">{t("Eén lijn per oefening, inclusief alle gespeelde fragmenten. Minimum, maximum of tijdgewogen gemiddelde per sessie volgens je instellingen. Een hoger tempo betekent niet automatisch beter spel.")}</p></section>
    <section className="panel"><h2>{t("Aantal keer geoefend per oefening")}</h2><p className="caption">{t("Een oefening telt eenmaal per sessie met gespeelde tijd, ook bij meerdere fragmenten of herhalingen. Vrije training en gedeeltelijk gespeelde sessies tellen mee.")}</p><FrequencyChart exercises={data.exercises} /></section>
    <section className="panel"><div className="round-heading"><div><h2>{t("Jouw oefenritme")}</h2><p data-testid="activity-range">{dayLabel(activity.from)} – {dayLabel(activity.end)}</p></div><div className="row-actions"><button className="secondary" disabled={!activity.canGoBack} onClick={() => setOffset(value => value + 1)}>{t("Vorige 30 dagen")}</button><button className="secondary" disabled={offset === 0} onClick={() => setOffset(value => Math.max(0, value - 1))}>{t("Volgende 30 dagen")}</button></div></div><p className="caption">{t("Dertig dagen oefentijd, onafhankelijk van de periode hierboven.")}</p><div className="activity-chart" role="img" aria-label={t("Oefentijd per dag, 30 dagen")}>
      {activity.days.map(day => <div className="activity-day" key={day.day} title={t("{0}: {1} geoefend", dayLabel(day.day), durationLabel(day.seconds))}><div className="activity-track"><span style={{ height: `${day.seconds / maximum * 100}%` }} /></div><span>{Number(day.day.slice(-2))}</span></div>)}
    </div><details><summary>{t("Oefentijd per dag bekijken")}</summary><div className="table-scroll"><table className="history-table"><thead><tr><th>{t("Datum")}</th><th>{t("Oefentijd")}</th></tr></thead><tbody>{activity.days.map(day => <tr key={day.day}><td>{dayLabel(day.day)}</td><td>{durationLabel(day.seconds)}</td></tr>)}</tbody></table></div></details></section>
  </div>;
}
