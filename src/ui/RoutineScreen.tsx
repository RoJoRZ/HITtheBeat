import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { Exercise, Routine, RoutineBlock, RoutineInput, RoutineStep } from '../library/types';
import { plannedSeconds, validateRoutine } from '../../electron/routine-model.mjs';
import { durationLabel } from './controls';

const uuid = () => crypto.randomUUID();
const newStep = (bpm: number): RoutineStep => ({ id: uuid(), bpm, repetitions: 1, start: null, end: null });
const newBlock = (item: Exercise): RoutineBlock => ({ id: uuid(), exerciseId: item.id, steps: [newStep(item.bpm)] });
const errorText = (reason: unknown) => (reason instanceof Error ? reason.message : 'Dit is niet gelukt.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
const reorder = <T,>(items: T[], index: number, direction: number) => { const copy = [...items]; [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]]; return copy; };
function Numeric({ label, value, change, step = .1, min, max }: { label: string; value: number; change: (value: number) => void; step?: number; min: number; max: number }) {
  return <input aria-label={label} type="number" step={step} min={min} max={max} value={Number.isFinite(value) ? value : ''} onChange={event => change(event.target.value.trim() ? event.target.valueAsNumber : NaN)} />;
}

export function RoutineScreen({ active, library }: { active: boolean; library: () => void }) {
  const [items, setItems] = useState<Routine[]>([]), [exercises, setExercises] = useState<Exercise[]>([]);
  const [draft, setDraft] = useState<RoutineInput | null>(null), [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(''), [status, setStatus] = useState('');
  const initialized = useRef(false), dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<(() => void) | null>(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    if (!window.hitthebeat) { setLoading(false); setError('Open rondjes in de desktopapp.'); return; }
    Promise.all([window.hitthebeat.listRoutines(), window.hitthebeat.listExercises()]).then(([rounds, sources]) => {
      if (!alive) return;
      setItems(rounds); setExercises(sources);
      if (!initialized.current) { setDraft(rounds[0] ?? null); initialized.current = true; }
    }).catch(reason => { if (alive) setError(errorText(reason)); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [active]);
  function edit(next: RoutineInput) { setDraft(next); setDirty(true); setStatus(''); setError(''); }
  function switchTo(next: () => void) {
    if (dirty) { pending.current = next; setDeleting(false); dialog.current?.showModal(); }
    else next();
  }
  function choose(item: RoutineInput | null) { setDraft(item); setDirty(false); setError(''); setStatus(''); }
  function create() { switchTo(() => { choose({ title: 'Nieuw oefenrondje', blocks: exercises[0] ? [newBlock(exercises[0])] : [] }); setDirty(true); }); }
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
      setDraft(saved); setDirty(false); setStatus('Oefenrondje opgeslagen.');
    } catch (reason) { setError(errorText(reason)); }
    finally { setSaving(false); }
  }
  return <div className="screen-stack routine-editor" aria-busy={saving || loading}>
    <div className="round-heading"><label className="round-picker">Mijn rondjes<select aria-label="Opgeslagen oefenrondje" value={draft?.id ?? ''} disabled={saving || loading} onChange={event => { const selected = items.find(item => item.id === event.target.value); if (selected) switchTo(() => choose(selected)); }}><option value="" disabled>{draft ? 'Nieuw rondje' : 'Kies een rondje'}</option>{items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><button className="secondary" onClick={create} disabled={saving || loading || !exercises.length}><Plus size={18} />Oefenrondje maken</button></div>
    {error && <p role="alert" className="error">{error}</p>}
    {!loading && !exercises.length && <section className="panel"><h2>Begin met jouw oefeningen</h2><p>Voeg eerst een MP3 toe. Daarna kun je oefeningen samenbrengen in een rondje.</p><button className="primary" onClick={library}>Naar oefeningen</button></section>}
    {!loading && exercises.length > 0 && !draft && <section className="panel"><h2>Jouw eerste oefenrondje</h2><p>Maak bijvoorbeeld een warming-up of een rondje voor techniek.</p></section>}
    {draft && <fieldset className="routine-fields" disabled={saving || loading}><div className="round-heading"><label className="routine-name">Naam van het rondje<input maxLength={160} value={draft.title} onChange={event => edit({ ...draft, title: event.target.value })} /></label><div className="total-duration"><span>Totale duur · gepland</span><strong data-testid="own-round-duration" aria-live="polite">{invalid ? '—' : durationLabel(total)} <small>min</small></strong></div></div>
      <section className="panel table-panel"><div className="table-scroll"><table className="routine-table own-routine-table"><caption>Tempo-opbouw per oefening. Fragmentgrenzen zijn seconden in de originele track.</caption><thead><tr><th>Fragment</th><th>Begin A</th><th>Einde B</th><th>Herhalingen</th><th>BPM</th><th>Stapacties</th></tr></thead>{draft.blocks.map((block, blockIndex) => {
        const exercise = exercises.find(item => item.id === block.exerciseId);
        return <tbody key={block.id}><tr className="block-heading"><th colSpan={6}><div className="block-toolbar"><label>Oefening {blockIndex + 1}<select aria-label={`Oefening blok ${blockIndex + 1}`} value={block.exerciseId} onChange={event => { const next = exercises.find(item => item.id === event.target.value)!; blockChange(block.id, { exerciseId: next.id, steps: block.steps.map(step => ({ ...step, bpm: next.bpm, start: null, end: null })) }); }}>{!exercise && <option value={block.exerciseId}>Oefening ontbreekt</option>}{exercises.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><span className="caption">{exercise ? `${exercise.bpm} BPM origineel · ${durationLabel(exercise.duration)}` : 'Kies een beschikbare oefening'}</span><div className="row-actions"><button className="icon-button" aria-label={`Oefening ${blockIndex + 1} omhoog`} disabled={blockIndex === 0} onClick={() => edit({ ...draft, blocks: reorder(draft.blocks, blockIndex, -1) })}><ArrowUp size={17} /></button><button className="icon-button" aria-label={`Oefening ${blockIndex + 1} omlaag`} disabled={blockIndex === draft.blocks.length - 1} onClick={() => edit({ ...draft, blocks: reorder(draft.blocks, blockIndex, 1) })}><ArrowDown size={17} /></button><button className="icon-button" aria-label={`Oefening ${blockIndex + 1} verwijderen`} onClick={() => edit({ ...draft, blocks: draft.blocks.filter(item => item.id !== block.id) })}><Trash2 size={17} /></button></div></div></th></tr>
        {block.steps.map((step, index) => { const suffix = `oefening ${blockIndex + 1} stap ${index + 1}`; return <tr key={step.id}><td><select aria-label={`Fragment ${suffix}`} value={step.start === null ? 'full' : 'fragment'} onChange={event => stepChange(block, step.id, event.target.value === 'full' ? { start: null, end: null } : { start: 0, end: exercise?.duration ?? .1 })}><option value="full">Volledige track</option><option value="fragment">Fragment A–B</option></select></td><td>{step.start === null ? '—' : <Numeric label={`Begin A ${suffix}`} value={step.start} min={0} max={exercise?.duration ?? 0} change={value => stepChange(block, step.id, { start: value })} />}</td><td>{step.end === null ? '—' : <Numeric label={`Einde B ${suffix}`} value={step.end} min={.1} max={exercise?.duration ?? 0} change={value => stepChange(block, step.id, { end: value })} />}</td><td><Numeric label={`Herhalingen ${suffix}`} value={step.repetitions} min={1} max={99} step={1} change={value => stepChange(block, step.id, { repetitions: value })} /></td><td><Numeric label={`BPM ${suffix}`} value={step.bpm} min={(exercise?.bpm ?? 0) * .25} max={(exercise?.bpm ?? 0) * 3} change={value => stepChange(block, step.id, { bpm: value })} /></td><td><div className="row-actions"><button className="icon-button" aria-label={`Stap omhoog ${suffix}`} disabled={index === 0} onClick={() => blockChange(block.id, { steps: reorder(block.steps, index, -1) })}><ArrowUp size={16} /></button><button className="icon-button" aria-label={`Stap omlaag ${suffix}`} disabled={index === block.steps.length - 1} onClick={() => blockChange(block.id, { steps: reorder(block.steps, index, 1) })}><ArrowDown size={16} /></button><button className="icon-button" aria-label={`Stap verwijderen ${suffix}`} disabled={block.steps.length === 1} onClick={() => blockChange(block.id, { steps: block.steps.filter(item => item.id !== step.id) })}><Trash2 size={16} /></button></div></td></tr>; })}
        <tr><td colSpan={6}><button className="text-button" onClick={() => blockChange(block.id, { steps: [...block.steps, newStep(block.steps.at(-1)!.bpm)] })}><Plus size={17} />Stap toevoegen aan oefening {blockIndex + 1}</button></td></tr></tbody>;
      })}</table></div><div className="table-footer"><button className="secondary" disabled={!exercises.length || draft.blocks.length >= 100} onClick={() => edit({ ...draft, blocks: [...draft.blocks, newBlock(exercises[0])] })}><Plus size={18} />Oefening toevoegen aan rondje</button><span className="caption">Iedere oefening heeft hier haar eigen opbouw.</span></div></section>
      {invalid && <p role="alert" className="error">{invalid}</p>}
      <div className="detail-footer"><span role="status">{status || (dirty ? 'Wijzigingen nog niet opgeslagen.' : 'Opgeslagen rondje')}</span><div className="row-actions">{draft.id && <button className="secondary" onClick={() => { setDeleting(true); dialog.current?.showModal(); }}>Rondje verwijderen</button>}<button className="primary" disabled={Boolean(invalid) || !dirty} onClick={() => void save()}>Rondje opslaan</button></div></div>
      <p className="caption">Automatisch afspelen van het hele rondje volgt in de volgende fase. Toonhoogte per stap is nog een open keuze.</p>
    </fieldset>}
    <dialog ref={dialog} className="tab-dialog" onCancel={() => { pending.current = null; }}><h2>{deleting ? 'Rondje verwijderen?' : 'Je hebt nog wijzigingen'}</h2><p>{deleting ? 'De oefeningen in je bibliotheek blijven bewaard.' : 'Sla eerst op om deze opbouw te bewaren, of verwerp je wijzigingen.'}</p><div className="row-actions"><button className="secondary" onClick={() => { pending.current = null; dialog.current?.close(); }}>Verder bewerken</button><button className="primary" onClick={async () => {
      if (deleting && draft?.id) {
        try { await window.hitthebeat!.deleteRoutine(draft.id); const remaining = items.filter(item => item.id !== draft.id); setItems(remaining); choose(remaining[0] ?? null); }
        catch (reason) { setError(errorText(reason)); }
      } else pending.current?.();
      pending.current = null; dialog.current?.close();
    }}>{deleting ? 'Rondje verwijderen' : 'Wijzigingen verwerpen'}</button></div></dialog>
  </div>;
}
