import { useEffect, useRef, useState } from 'react';
import type { Exercise, Fragment, RoutineStep } from '../library/types';
import { validateFragment } from '../../electron/fragment-model.mjs';

const errorText = (reason: unknown) => (reason instanceof Error ? reason.message : 'Opslaan is niet gelukt.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
export function DecimalInput({ label, value, change, disabled = false }: { label: string; value: number; change: (value: number) => void; disabled?: boolean }) {
  const [draft, setDraft] = useState(String(Number.isFinite(value) ? value : ''));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setDraft(String(Number.isFinite(value) ? value : '')); }, [value]);
  return <input aria-label={label} type="text" inputMode="decimal" value={draft} disabled={disabled} onFocus={() => { focused.current = true; }} onBlur={() => { focused.current = false; }} onChange={event => {
    const raw = event.target.value; setDraft(raw);
    const normalized = raw.trim().replace(',', '.');
    change(normalized && /^\d*(\.\d*)?$/.test(normalized) ? Number(normalized) : NaN);
  }} />;
}
export function FragmentSelect({ label, step, fragments, duration, change }: { label: string; step: Pick<RoutineStep, 'start'|'end'|'fragmentId'|'fragmentName'>; fragments: Fragment[]; duration: number; change: (value: Pick<RoutineStep, 'start'|'end'|'fragmentId'|'fragmentName'>) => void }) {
  const matches = fragments.find(item => item.id === step.fragmentId && item.name === step.fragmentName && item.start === step.start && item.end === step.end);
  const value = step.start === null ? 'full' : matches?.id ?? (step.fragmentId ? 'saved-copy' : 'fragment');
  return <select aria-label={label} value={value} onChange={event => {
    const chosen = fragments.find(item => item.id === event.target.value);
    change(chosen ? { start: chosen.start, end: chosen.end, fragmentId: chosen.id, fragmentName: chosen.name } : event.target.value === 'full' ? { start: null, end: null, fragmentId: undefined, fragmentName: undefined } : { start: 0, end: duration, fragmentId: undefined, fragmentName: undefined });
  }}><option value="full">Volledige track</option>{fragments.map(item => <option key={item.id} value={item.id}>{item.name} · {item.start}–{item.end} s</option>)}{value === 'saved-copy' && <option value="saved-copy">{step.fragmentName} · bewaarde selectie ({step.start}–{step.end} s)</option>}<option value="fragment">Eigen fragment A–B</option></select>;
}
function FragmentForm({ exercise, initial, saved, cancel }: { exercise: Exercise; initial?: Fragment; saved: (item: Exercise) => void; cancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? ''), [start, setStart] = useState(initial?.start ?? 0), [end, setEnd] = useState(initial?.end ?? exercise.duration);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <form className="fragment-form" onSubmit={async event => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { const input = { id: initial?.id, name, start, end }; validateFragment(input, exercise.duration); saved(await window.hitthebeat!.saveFragment(exercise.id, input)); }
    catch (reason) { setError(errorText(reason)); } finally { setBusy(false); }
  }}><fieldset disabled={busy}><legend>{initial ? 'Fragment bewerken' : 'Nieuw fragment'}</legend><label>Fragmentnaam<input required maxLength={160} value={name} onChange={event => setName(event.target.value)} /></label><div className="fragment-boundaries"><label>Begin A (seconden)<DecimalInput label="Fragment begin A (seconden)" value={start} change={setStart} /></label><label>Einde B (seconden)<DecimalInput label="Fragment einde B (seconden)" value={end} change={setEnd} /></label></div>{error && <p role="alert" className="error">{error}</p>}<div className="row-actions"><button type="button" className="secondary" onClick={cancel}>Annuleren</button><button className="primary">{busy ? 'Opslaan…' : 'Fragment opslaan'}</button></div></fieldset></form>;
}
export function FragmentLibrary({ exercise, changed }: { exercise: Exercise; changed: (item: Exercise) => void }) {
  const [form, setForm] = useState<Fragment | 'new' | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [status, setStatus] = useState('');
  useEffect(() => { setForm(null); setError(''); setStatus(''); }, [exercise.id]);
  return <section className="panel fragment-library"><div className="panel-heading"><h2>Opgeslagen fragmenten</h2><button className="secondary" disabled={busy || Boolean(form)} onClick={() => { setForm('new'); setError(''); setStatus(''); }}>Fragment toevoegen</button></div><p className="caption">Geef een passage een naam en kies die later in je oefensessies. Tijden zijn seconden in de originele track.</p>{error && <p role="alert" className="error">{error}</p>}{status && <p role="status">{status}</p>}{!(exercise.fragments?.length) && !form && <p>Nog geen fragmenten opgeslagen.</p>}<ul className="fragment-list">{exercise.fragments?.map(item => <li key={item.id}><span><strong>{item.name}</strong><small>{item.start}–{item.end} s</small></span><div className="row-actions"><button className="text-button" disabled={busy || Boolean(form)} onClick={() => { setForm(item); setStatus(''); }}>Bewerk {item.name}</button><button className="text-button" disabled={busy || Boolean(form)} onClick={async () => { setBusy(true); setError(''); try { changed(await window.hitthebeat!.deleteFragment(exercise.id, item.id)); setStatus(`Fragment ${item.name} verwijderd. Bestaande sessie-opbouwen behouden hun selectie.`); } catch (reason) { setError(errorText(reason)); } finally { setBusy(false); } }}>Verwijder {item.name}</button></div></li>)}</ul>{form && <FragmentForm key={form === 'new' ? 'new' : form.id} exercise={exercise} initial={form === 'new' ? undefined : form} cancel={() => setForm(null)} saved={item => { changed(item); setForm(null); setStatus('Fragment opgeslagen.'); }} />}<p className="caption">Bewerken of verwijderen verandert eerder opgeslagen sessie-opbouwen niet. Kies daar opnieuw het fragment om nieuwe grenzen over te nemen.</p></section>;
}
export function SaveCurrentFragment({ exerciseId, start, end, disabled, saved }: { exerciseId: string; start: number; end: number; disabled: boolean; saved?: (item: Exercise) => void }) {
  const [open, setOpen] = useState(false), [name, setName] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [status, setStatus] = useState('');
  return <div className="save-current-fragment">{!open ? <button className="secondary" disabled={disabled} onClick={() => { setOpen(true); setName(''); setStatus(''); setError(''); }}>Fragment opslaan</button> : <form className="fragment-inline" onSubmit={async event => {
    event.preventDefault(); if (busy || disabled) return; setBusy(true); setError('');
    try { const item = await window.hitthebeat!.saveFragment(exerciseId, { name, start, end }); saved?.(item); setOpen(false); setStatus(`Fragment ‘${name.trim()}’ (${start}–${end} s) opgeslagen bij deze oefening.`); }
    catch (reason) { setError(errorText(reason)); } finally { setBusy(false); }
  }}><label>Fragmentnaam<input required maxLength={160} disabled={busy || disabled} value={name} onChange={event => setName(event.target.value)} /></label><span className="caption">A–B: {start}–{end} s · beschikbaar voor toekomstige oefensessies</span><button className="primary" disabled={busy || disabled}>{busy ? 'Opslaan…' : 'Fragment bewaren'}</button><button type="button" className="secondary" disabled={busy} onClick={() => setOpen(false)}>Annuleren</button></form>}{error && <p role="alert" className="error">{error}</p>}{status && <p role="status" className="success-message">{status}</p>}</div>;
}
