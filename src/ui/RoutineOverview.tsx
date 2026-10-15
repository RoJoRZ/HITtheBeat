import { plannedPreparation } from '../../electron/count-in-model.mjs';
import { useState } from 'react';
import type { Exercise, Routine, SessionRecord } from '../library/types';
import { plannedSeconds, validateRoutine } from '../../electron/routine-model.mjs';
import { durationLabel } from './controls';

export function RoutineOverview({ items, exercises, sessions, edit, start, create, loading }: {
  items: Routine[]; exercises: Exercise[]; sessions: SessionRecord[]; edit: (item: Routine) => void;
  start: (item: Routine, exercises: Exercise[]) => void; create: () => void; loading: boolean;
}) {
  const [all, setAll] = useState(false), [query, setQuery] = useState('');
  const lastPlayed = new Map<string, string>();
  for (const session of sessions) {
    const previous = lastPlayed.get(session.routine.id);
    if (!previous || session.startedAt > previous) lastPlayed.set(session.routine.id, session.startedAt);
  }
  const sorted = [...items].sort((a, b) => (lastPlayed.get(b.id) ?? b.updatedAt).localeCompare(lastPlayed.get(a.id) ?? a.updatedAt) || a.title.localeCompare(b.title, 'nl') || a.id.localeCompare(b.id));
  const visible = all ? sorted.filter(item => item.title.toLocaleLowerCase('nl').includes(query.trim().toLocaleLowerCase('nl'))) : sorted.slice(0, 10);
  return <section className="screen-stack" aria-label="Overzicht oefensessies">
    <div className="round-heading"><div><h2>{all ? 'Alle oefensessies' : 'Recente oefensessies'}</h2><p className="caption">Kies wat je vandaag wilt oefenen.</p></div><button className="primary" disabled={loading || !exercises.length} onClick={create}>Nieuwe oefensessie</button></div>
    {all && <div className="round-heading"><label className="routine-name">Zoek op naam<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="secondary" onClick={() => { setAll(false); setQuery(''); }}>Terug naar recente sessies</button></div>}
    {!loading && exercises.length > 0 && !items.length && <section className="panel"><h2>Jouw eerste oefensessie</h2><p>Maak bijvoorbeeld een warming-up of een sessie voor techniek.</p></section>}
    {!loading && all && items.length > 0 && !visible.length && <p role="status">Geen oefensessies gevonden.</p>}
    <div className="session-cards">{visible.map(item => {
      let seconds = 0, invalid = '';
      try { validateRoutine(item, exercises); seconds = item.blocks.reduce((sum, block) => sum + block.steps.reduce((total, step) => total + plannedSeconds(step, exercises.find(source => source.id === block.exerciseId)!), 0), 0); }
      catch (reason) { invalid = reason instanceof Error ? reason.message : 'Controleer deze sessie.'; }
      const played = lastPlayed.get(item.id);
      return <article className="panel session-card" key={item.id} aria-label={item.title}>
        <h3>{item.title}</h3><p>{item.blocks.length} {item.blocks.length === 1 ? 'oefening' : 'oefeningen'} · {invalid ? 'Duur niet beschikbaar' : `${durationLabel(seconds + plannedPreparation(item))} gepland`}</p>{item.countIn?.enabled && !invalid && <p className="caption">Waarvan {durationLabel(plannedPreparation(item))} aftellen · {item.countIn.meter}</p>}
        <p className="caption">{played ? <>Laatst geoefend: <time dateTime={played}>{new Date(played).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}</time></> : 'Nog niet geoefend'}</p>
        {invalid && <p className="error">{invalid}</p>}
        <div className="row-actions"><button className="primary" disabled={loading || Boolean(invalid)} onClick={() => start(item, exercises)}>Starten</button><button className="secondary" disabled={loading} onClick={() => edit(item)}>Bewerken</button></div>
      </article>;
    })}</div>
    {!all && items.length > 10 && <div><button className="secondary" onClick={() => setAll(true)}>Alle oefensessies</button></div>}
  </section>;
}
