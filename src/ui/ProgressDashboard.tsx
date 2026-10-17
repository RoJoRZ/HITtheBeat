import { useState } from 'react';
import type { SessionRecord } from '../library/types';
import { buildDashboard } from '../library/progress.mjs';
import { durationLabel } from './controls';

type Dashboard = ReturnType<typeof buildDashboard>;
const statuses = { running: 'Bezig', completed: 'Afgerond', partial: 'Oefeningen overgeslagen', stopped: 'Gestopt', interrupted: 'Onderbroken' };
const actions: Record<string, string> = { repeat: 'Serie opnieuw', same: 'Tempo gelijk houden', faster: 'Sneller', slower: 'Langzamer' };
const dayLabel = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('nl-NL', { timeZone: 'UTC', day: 'numeric', month: 'short' });
function TempoChart({ group }: { group: Dashboard['groups'][number] }) {
  const points = group.points;
  if (!points.length) return <p role="status">Nog geen afgeronde speelbeurt voor dit onderdeel. De afgespeelde tijd telt wel mee.</p>;
  const min = Math.max(0, Math.floor(Math.min(...points.map(point => point.bpm)) / 10) * 10 - 5);
  const max = Math.ceil(Math.max(...points.map(point => point.bpm)) / 10) * 10 + 5;
  const start = Date.parse(points[0].date), end = Date.parse(points.at(-1)!.date);
  const x = (index: number) => end === start ? 340 : 70 + (Date.parse(points[index].date) - start) / (end - start) * 540;
  const y = (bpm: number) => 210 - (bpm - min) / (max - min) * 160;
  return <><svg viewBox="0 0 660 270" className="tempo-chart" role="img" aria-label={`Gespeeld tempo voor ${group.exercise}, ${group.part}. ${points.length} meetpunten; laatst ${points.at(-1)!.bpm} BPM.`}>
    {[0, 1, 2, 3, 4].map(tick => { const bpm = min + (max - min) * tick / 4; return <g key={tick}><line x1="60" y1={y(bpm)} x2="630" y2={y(bpm)} /><text x="48" y={y(bpm) + 4} textAnchor="end">{Math.round(bpm)}</text></g>; })}
    <text x="12" y="25">BPM</text>
    {points.length > 1 && <polyline points={points.map((point, index) => `${x(index)},${y(point.bpm)}`).join(' ')} />}
    {points.map((point, index) => <circle key={point.sessionId} cx={x(index)} cy={y(point.bpm)} r="5"><title>{dayLabel(point.day)} · {point.bpm} BPM · {statuses[point.status]}{point.rating !== undefined ? ` · cijfer ${point.rating}/5` : ''}</title></circle>)}
    {[...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])].map(index => <text key={index} x={x(index)} y="245" textAnchor="middle">{dayLabel(points[index].day)}</text>)}
  </svg><p className="caption">{group.mode === 'planned' ? 'Hoogste BPM met een afgeronde speelbeurt per sessie. Ook afgeronde speelbeurten uit gestopte sessies tellen mee.' : 'Hoogste werkelijk afgespeelde BPM per sessie in vrije fragmenttraining; dit zegt niets over afgeronde speelbeurten.'} {points.length === 1 ? 'In deze periode is één meetpunt bewaard.' : 'Een hoger tempo zegt niet automatisch dat je beter speelt.'}</p>
    <details><summary>Meetpunten bekijken</summary><div className="table-scroll"><table className="history-table"><caption>Werkelijk gespeelde resultaten voor dit onderdeel</caption><thead><tr><th>Datum</th><th>BPM</th><th>Speelbeurten</th><th>Beoordeling</th><th>Sessie</th></tr></thead><tbody>{points.map(point => <tr key={point.sessionId}><td>{new Date(point.date).toLocaleString('nl-NL')}</td><td>{point.bpm}</td><td>{group.mode === 'planned' ? point.completed : 'Vrij oefenen'}</td><td>{point.rating === undefined ? 'Niet beoordeeld' : `${point.rating}/5`}</td><td>{statuses[point.status]}</td></tr>)}</tbody></table></div></details>
  </>;
}
export function ProgressDashboard({ sessions, period, changePeriod }: { sessions: SessionRecord[]; period: 'week' | 'month' | 'all'; changePeriod: (value: 'week' | 'month' | 'all') => void }) {
  const data = buildDashboard(sessions, { period });
  const [selection, setSelection] = useState('');
  const group = data.groups.find(item => item.key === selection) ?? data.groups[0];
  const latest = group?.points.at(-1);
  const maximum = Math.max(1, ...data.days.map(day => day.seconds));
  return <div className="screen-stack progress-dashboard">
    <div className="round-heading"><p>Maak zichtbaar wat je oefent, stap voor stap.</p><label className="round-picker">Periode<select aria-label="Periode voortgang" value={period} onChange={event => changePeriod(event.target.value as typeof period)}><option value="week">Deze week</option><option value="month">Deze maand</option><option value="all">Alle tijd</option></select></label></div>
    <div className="stats-grid"><section className="panel stat-card"><h2>Geoefende tijd</h2><strong data-testid="dashboard-time">{durationLabel(data.totalSeconds)}</strong><p>min:sec · sessie {durationLabel(data.plannedSeconds)} · vrij {durationLabel(data.fragmentSeconds)}</p></section><section className="panel stat-card"><h2>Oefendagen</h2><strong data-testid="dashboard-days">{data.practiceDays}</strong><p>Dagen met afgespeelde muziek</p></section><section className="panel stat-card"><h2>Geoefende sessies</h2><strong data-testid="dashboard-sessions">{data.practicedSessions}</strong><p>{data.completedSessions} volledig afgerond</p></section></div>
    <p className="caption">Pauzes en evaluaties tellen niet mee. Gestopte en onderbroken sessies tellen mee voor hun afgespeelde tijd. Dagindeling: {data.timeZone}; tijd wordt toegerekend aan de startdag van de sessie.</p>

    {!data.practicedSessions && <section className="panel"><h2>Elke oefening telt</h2><p>In deze periode is nog geen afgespeelde oefentijd bewaard. Start een oefensessie of kies een andere periode.</p></section>}
    {group && <div className="progress-detail-grid"><section className="panel progress-chart"><div className="panel-heading"><h2>Tempo-ontwikkeling</h2></div><label className="progress-selection">Oefening en onderdeel<select aria-label="Onderdeel tempo-ontwikkeling" value={group.key} onChange={event => setSelection(event.target.value)}>{data.groups.map(item => <option key={item.key} value={item.key}>{item.routine} · oefening {item.block}: {item.exercise} · {item.part} · {item.mode === 'planned' ? 'Sessie' : 'Vrije training'} · {item.originalBpm} BPM origineel{item.kind !== 'metronome' && <> · bron {durationLabel(item.sourceDuration)}</>}{item.pitch ? ` · ${item.pitch > 0 ? '+' : ''}${item.pitch} halve tonen` : ''}</option>)}</select></label><p className="chart-context">{group.exercise} · {group.part}</p><p className="caption">{group.routine} · oefening {group.block} · {group.mode === 'planned' ? 'Geplande training' : 'Vrije fragmenttraining'} · {group.originalBpm} BPM origineel{group.kind !== 'metronome' && <> · bron {durationLabel(group.sourceDuration)} · {group.pitch === 0 ? 'Originele toonhoogte' : `${group.pitch > 0 ? '+' : ''}${group.pitch} halve tonen`}</>}</p><TempoChart group={group} /></section>
    <section className="panel"><h2>Laatste resultaat voor dit onderdeel</h2>{latest ? <><p><strong>{latest.bpm} BPM</strong> · {dayLabel(latest.day)} · {statuses[latest.status]}</p><p>{latest.rating === undefined ? 'Geen cijfer bewaard.' : `Jouw beoordeling: ${latest.rating}/5`}</p>{latest.rating !== undefined && <p className="caption">Het cijfer hoort bij de laatste bewaarde evaluatie van dit onderdeel in deze sessie.</p>}{latest.note && <p>Notitie: {latest.note}</p>}{latest.action && <p>Destijds gekozen: {actions[latest.action]}{latest.delta ? ` (${latest.delta > 0 ? '+' : ''}${latest.delta} BPM voor dit oefenblok)` : ''}.</p>}<p className="caption">Een cijfer is jouw eigen evaluatie, geen automatische meting van nauwkeurigheid.</p></> : <p>Er is nog geen meetpunt. Je oefentijd is wel bewaard.</p>}</section></div>}
    <section className="panel"><h2>Jouw oefenritme</h2><p className="caption">{period === 'all' ? 'De laatste 28 dagen' : period === 'week' ? 'Deze week tot vandaag' : 'Deze maand tot vandaag'}</p><div className="activity-chart" role="img" aria-label={`Oefentijd per dag: ${period === 'all' ? 'de laatste 28 dagen' : 'de gekozen periode tot vandaag'}. Open de tabel voor exacte tijden.`}>{data.days.map(day => <div className="activity-day" key={day.day} title={`${dayLabel(day.day)}: ${durationLabel(day.seconds)} geoefend`}><div className="activity-track"><span style={{ height: `${day.seconds / maximum * 100}%` }} /></div><span>{Number(day.day.slice(-2))}</span></div>)}</div><details><summary>Oefentijd per dag bekijken</summary><div className="table-scroll"><table className="history-table"><thead><tr><th>Datum</th><th>Oefentijd</th></tr></thead><tbody>{data.days.map(day => <tr key={day.day}><td>{dayLabel(day.day)}</td><td>{durationLabel(day.seconds)}</td></tr>)}</tbody></table></div></details></section>
  </div>;
}
