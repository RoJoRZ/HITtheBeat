import { isMetronome, exerciseBars } from '../../electron/exercise-model.mjs';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { Exercise, Routine, RoutineBlock, RoutineInput, RoutineStep, SessionRecord } from '../library/types';
import { plannedSeconds, validateRoutine } from '../../electron/routine-model.mjs';
import { DecimalInput, FragmentSelect } from './FragmentControls';
import { durationLabel } from './controls';
import { RoutineOverview } from './RoutineOverview';

const uuid = () => crypto.randomUUID();
const newStep = (bpm: number, exercise?: Exercise): RoutineStep => ({  id: uuid(), bpm, repetitions: 1, start: null, end: null });
const newBlock = (item: Exercise): RoutineBlock => ({ id: uuid(), exerciseId: item.id, steps: [newStep(item.bpm, item)] });
const errorText = (reason: unknown) => (reason instanceof Error ? reason.message : 'Dit is niet gelukt.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
const reorder = <T,>(items: T[], index: number, direction: number) => { const copy = [...items]; [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]]; return copy; };
function Numeric({ label, value, change, step = .1, min, max }: { label: string; value: number; change: (value: number) => void; step?: number; min: number; max: number }) {
  return <input aria-label={label} type="number" step={step} min={min} max={max} value={Number.isFinite(value) ? value : ''} onChange={event => change(event.target.value.trim() ? event.target.valueAsNumber : NaN)} />;
}

export function RoutineScreen({ active, overviewKey, library, start }: { active: boolean; overviewKey: number; library: () => void; start: (routine: Routine, exercises: Exercise[]) => void }) {
  const [items, setItems] = useState<Routine[]>([]), [exercises, setExercises] = useState<Exercise[]>([]);
  const [draft, setDraft] = useState<RoutineInput | null>(null), [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(''), [status, setStatus] = useState('');
  const [sessions, setSessions] = useState<SessionRecord[]>([]), [editor, setEditor] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<(() => void) | null>(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    if (!window.hitthebeat) { setLoading(false); setError('Open sessies in de desktopapp.'); return; }
    Promise.all([window.hitthebeat.listRoutines(), window.hitthebeat.listExercises(), window.hitthebeat.listSessions()]).then(([rounds, sources, history]) => {
      if (!alive) return;
      setItems(rounds); setExercises(sources); setSessions(history);
      if (!dirty) setDraft(current => current?.id ? rounds.find(item => item.id === current.id) ?? null : current);
    }).catch(reason => { if (alive) setError(errorText(reason)); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [active, overviewKey]);
  useEffect(() => { setEditor(false); setDraft(null); setDirty(false); setError(''); setStatus(''); }, [overviewKey]);
  function edit(next: RoutineInput) { setDraft(next); setDirty(true); setStatus(''); setError(''); }
  function switchTo(next: () => void) {
    if (dirty) { pending.current = next; setDeleting(false); dialog.current?.showModal(); }
    else next();
  }
  function choose(item: RoutineInput | null) { setEditor(Boolean(item)); setDraft(item); setDirty(false); setError(''); setStatus(''); }
  function create() { switchTo(() => { choose({ title: 'Nieuwe oefensessie', blocks: exercises[0] ? [newBlock(exercises[0])] : [] }); setDirty(true); }); }
  function blockChange(id: string, change: Partial<RoutineBlock>) { if (draft) edit({ ...draft, blocks: draft.blocks.map(block => block.id === id ? { ...block, ...change } : block) }); }
  function stepChange(block: RoutineBlock, id: string, change: Partial<RoutineStep>) { blockChange(block.id, { steps: block.steps.map(step => step.id === id ? { ...step, ...change } : step) }); }
  let invalid = '', total = 0;
  if (draft) {
    try { validateRoutine(draft, exercises); total = draft.blocks.reduce((sum, block) => sum + block.steps.reduce((seconds, step) => seconds + plannedSeconds(step, exercises.find(item => item.id === block.exerciseId)!), 0), 0); }
    catch (reason) { invalid = errorText(reason); }
  }
  async function save() {
    if (!draft || invalid) return;
    setSaving(true); setError('');
    try {
      const saved = await window.hitthebeat!.saveRoutine(draft);
      setItems(current => [...current.filter(item => item.id !== saved.id), saved].sort((a, b) => a.title.localeCompare(b.title)));
      setDraft(saved); setDirty(false); setStatus('Oefensessie opgeslagen.');
    } catch (reason) { setError(errorText(reason)); }
    finally { setSaving(false); }
  }
  return <div className="screen-stack routine-editor" aria-busy={saving || loading}>
    {editor && <div className="round-heading"><button className="secondary" disabled={saving || loading} onClick={() => switchTo(() => choose(null))}>Terug naar overzicht</button><label className="round-picker">Mijn sessies<select aria-label="Opgeslagen oefensessie" value={draft?.id ?? ''} disabled={saving || loading} onChange={event => { const selected = items.find(item => item.id === event.target.value); if (selected) switchTo(() => choose(selected)); }}><option value="" disabled>{draft ? 'Nieuwe sessie' : 'Kies een sessie'}</option>{items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><button className="secondary" onClick={create} disabled={saving || loading || !exercises.length}><Plus size={18} />Nieuwe oefensessie</button></div>}
    {error && <p role="alert" className="error">{error}</p>}
    {!loading && !exercises.length && <section className="panel"><h2>Begin met jouw oefeningen</h2><p>Voeg eerst een audiotrack of metronoom-oefening toe. Daarna kun je oefeningen samenbrengen in een sessie.</p><button className="primary" onClick={library}>Naar oefeningen</button></section>}
    {!editor && <RoutineOverview key={overviewKey} items={items} exercises={exercises} sessions={sessions} loading={loading} create={create} edit={item => choose(item)} start={start} />}
    {draft && <fieldset className="routine-fields" disabled={saving || loading}><div className="round-heading"><label className="routine-name">Naam van de sessie<input maxLength={160} value={draft.title} onChange={event => edit({ ...draft, title: event.target.value })} /></label><div className="total-duration"><span>Totale duur · gepland</span><strong data-testid="own-round-duration" aria-live="polite">{invalid ? '—' : durationLabel(total)} <small>min</small></strong></div></div>
      <section className="panel table-panel"><div className="table-scroll"><table className="routine-table own-routine-table"><caption>Kies een track/fragment of gebruik het aantal maten van je metronoom-oefening. A–B-tijden zijn bronseconden; BPM is kwartnoten per minuut.</caption><thead><tr><th>Fragment / maten</th><th>Begin A</th><th>Einde B</th><th>Herhalingen</th><th>BPM</th><th>Stapacties</th></tr></thead>{draft.blocks.map((block, blockIndex) => {
        const exercise = exercises.find(item => item.id === block.exerciseId);
        return <tbody key={block.id}><tr className="block-heading"><th colSpan={6}><div className="block-toolbar"><label>Oefening {blockIndex + 1}<select aria-label={`Oefening blok ${blockIndex + 1}`} value={block.exerciseId} onChange={event => { const next = exercises.find(item => item.id === event.target.value)!; blockChange(block.id, { exerciseId: next.id, steps: block.steps.map(step => ({ ...step, bpm: next.bpm, start: null, end: null, fragmentId: undefined, fragmentName: undefined, bars: undefined })) }); }}>{!exercise && <option value={block.exerciseId}>Oefening ontbreekt</option>}{exercises.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><span className="caption">{exercise ? isMetronome(exercise) ? `${exercise.meter} · BPM per kwartnoot` : `${exercise.bpm} BPM origineel · ${durationLabel(exercise.duration)}` : 'Kies een beschikbare oefening'}</span><div className="row-actions"><button className="icon-button" aria-label={`Oefening ${blockIndex + 1} omhoog`} disabled={blockIndex === 0} onClick={() => edit({ ...draft, blocks: reorder(draft.blocks, blockIndex, -1) })}><ArrowUp size={17} /></button><button className="icon-button" aria-label={`Oefening ${blockIndex + 1} omlaag`} disabled={blockIndex === draft.blocks.length - 1} onClick={() => edit({ ...draft, blocks: reorder(draft.blocks, blockIndex, 1) })}><ArrowDown size={17} /></button><button className="icon-button" aria-label={`Oefening ${blockIndex + 1} verwijderen`} onClick={() => edit({ ...draft, blocks: draft.blocks.filter(item => item.id !== block.id) })}><Trash2 size={17} /></button></div></div></th></tr>
        {block.steps.map((step, index) => { const suffix = `oefening ${blockIndex + 1} stap ${index + 1}`; return <tr key={step.id}><td>{exercise && isMetronome(exercise) ? <span>{exerciseBars(step, exercise)} maten{step.bars !== undefined && <small> · Oude stapinstelling; bewerk de oefening om dit gelijk te trekken.</small>}</span> : <FragmentSelect label={`Fragment ${suffix}`} step={step} fragments={exercise?.fragments ?? []} duration={exercise?.duration ?? .1} change={change => stepChange(block, step.id, change)} />}</td><td>{step.start === null ? '—' : <DecimalInput label={`Begin A ${suffix}`} value={step.start} change={value => stepChange(block, step.id, { start: value, fragmentId: undefined, fragmentName: undefined })} />}</td><td>{step.end === null ? '—' : <DecimalInput label={`Einde B ${suffix}`} value={step.end} change={value => stepChange(block, step.id, { end: value, fragmentId: undefined, fragmentName: undefined })} />}</td><td><Numeric label={`Herhalingen ${suffix}`} value={step.repetitions} min={1} max={99} step={1} change={value => stepChange(block, step.id, { repetitions: value })} /></td><td><Numeric label={`BPM ${suffix}`} value={step.bpm} min={exercise && isMetronome(exercise) ? 20 : (exercise?.bpm ?? 0) * .25} max={exercise && isMetronome(exercise) ? 300 : (exercise?.bpm ?? 0) * 3} change={value => stepChange(block, step.id, { bpm: value })} /></td><td><div className="row-actions"><button className="icon-button" aria-label={`Stap omhoog ${suffix}`} disabled={index === 0} onClick={() => blockChange(block.id, { steps: reorder(block.steps, index, -1) })}><ArrowUp size={16} /></button><button className="icon-button" aria-label={`Stap omlaag ${suffix}`} disabled={index === block.steps.length - 1} onClick={() => blockChange(block.id, { steps: reorder(block.steps, index, 1) })}><ArrowDown size={16} /></button><button className="icon-button" aria-label={`Stap verwijderen ${suffix}`} disabled={block.steps.length === 1} onClick={() => blockChange(block.id, { steps: block.steps.filter(item => item.id !== step.id) })}><Trash2 size={16} /></button></div></td></tr>; })}
        <tr><td colSpan={6}><button className="text-button" onClick={() => blockChange(block.id, { steps: [...block.steps, newStep(block.steps.at(-1)!.bpm, exercise)] })}><Plus size={17} />Stap toevoegen aan oefening {blockIndex + 1}</button></td></tr></tbody>;
      })}</table></div><div className="table-footer"><button className="secondary" disabled={!exercises.length || draft.blocks.length >= 100} onClick={() => edit({ ...draft, blocks: [...draft.blocks, newBlock(exercises[0])] })}><Plus size={18} />Oefening toevoegen aan sessie</button><span className="caption">Iedere oefening heeft hier haar eigen opbouw.</span></div></section>
      {invalid && <p role="alert" className="error">{invalid}</p>}
      <div className="detail-footer"><span role="status">{status || (dirty ? 'Wijzigingen nog niet opgeslagen.' : 'Opgeslagen sessie')}</span><div className="row-actions">{draft.id && <button className="secondary" onClick={() => { setDeleting(true); dialog.current?.showModal(); }}>Sessie verwijderen</button>}<button className="primary" disabled={Boolean(invalid) || !dirty} onClick={() => void save()}>Sessie opslaan</button><button className="primary" disabled={Boolean(invalid) || dirty || !draft.id} onClick={() => start(draft as Routine, exercises)}>Sessie starten</button></div></div>
      <p className="caption">Sla je wijzigingen op voordat je de sessie start. Toonhoogte per stap is nog een open keuze.</p>
    </fieldset>}
    <dialog ref={dialog} className="tab-dialog" onCancel={() => { pending.current = null; }}><h2>{deleting ? 'Sessie verwijderen?' : 'Je hebt nog wijzigingen'}</h2><p>{deleting ? 'De oefeningen in je bibliotheek blijven bewaard.' : 'Sla eerst op om deze opbouw te bewaren, of verwerp je wijzigingen.'}</p><div className="row-actions"><button className="secondary" onClick={() => { pending.current = null; dialog.current?.close(); }}>Verder bewerken</button><button className="primary" onClick={async () => {
      if (deleting && draft?.id) {
        try { await window.hitthebeat!.deleteRoutine(draft.id); const remaining = items.filter(item => item.id !== draft.id); setItems(remaining); choose(null); }
        catch (reason) { setError(errorText(reason)); }
      } else pending.current?.();
      pending.current = null; dialog.current?.close();
    }}>{deleting ? 'Sessie verwijderen' : 'Wijzigingen verwerpen'}</button></div></dialog>
  </div>;
}
