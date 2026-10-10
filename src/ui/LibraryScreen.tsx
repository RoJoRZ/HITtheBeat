import { useEffect, useRef, useState } from 'react';
import type { Asset, Exercise } from '../library/types';
import { analyzeAudio } from '../library/analyze';
import { AudioLab } from './AudioLab';
import { durationLabel } from './controls';

const message = (error: unknown) => error instanceof Error ? error.message : 'Dit is niet gelukt. Probeer opnieuw.';

function ExerciseForm({ initial, done, cancel }: { initial?: Exercise; done: (item: Exercise) => void; cancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [bpm, setBpm] = useState(String(initial?.bpm ?? ''));
  const [detected, setDetected] = useState(initial?.detectedBpm ?? null);
  const [duration, setDuration] = useState(initial?.duration ?? 0);
  const [audio, setAudio] = useState<Asset>();
  const [image, setImage] = useState<Asset | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);
  const manual = useRef(Boolean(initial));
  useEffect(() => () => abort.current?.abort(), []);
  async function analyze(file?: File) {
    abort.current?.abort();
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setError('');
    if (file) { setAudio(undefined); setDuration(0); setDetected(null); }
    try {
      if (file && (!file.name.toLowerCase().endsWith('.mp3') || file.size > 50 * 1024 * 1024)) throw new Error('Kies een MP3 van maximaal 50 MB.');
      const bytes = file ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array((await window.hitthebeat!.readAudio(initial!.id)).bytes);
      const result = await analyzeAudio(bytes.slice().buffer, controller.signal);
      if (controller.signal.aborted) return;
      setDuration(result.duration); setDetected(result.estimate.bpm);
      if (file) { setAudio({ name: file.name, bytes }); setTitle(current => current.trim() ? current : file.name.replace(/\.mp3$/i, '')); }
      if (!manual.current && result.estimate.bpm) setBpm(String(result.estimate.bpm));
    } catch (reason) { if (!controller.signal.aborted) setError(message(reason)); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  async function chooseImage(file: File) {
    setError(''); setImageBusy(true);
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) throw new Error('Kies een PNG, JPEG of WebP van maximaal 12 MB.');
      const bitmap = await createImageBitmap(file); bitmap.close();
      setImage({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) });
    } catch { setError('De afbeelding kan niet worden gelezen. Kies een PNG, JPEG of WebP van maximaal 12 MB.'); }
    finally { setImageBusy(false); }
  }
  return <section className="panel exercise-form" aria-label={initial ? 'Oefening bewerken' : 'Nieuwe oefening'}><h2>{initial ? 'Oefening bewerken' : 'Nieuwe oefening'}</h2><form onSubmit={async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const item = await window.hitthebeat!.saveExercise({ id: initial?.id, title, description, bpm: Number(bpm), detectedBpm: detected, analysisStatus: detected ? 'estimated' : 'unavailable', duration, audio, image });
      done(item);
    } catch (reason) { setError(message(reason)); }
    finally { setSaving(false); }
  }}><fieldset disabled={saving} className="library-fields">
    {!initial && <label>MP3-bestand<input type="file" accept=".mp3,audio/mpeg" onChange={event => { const file = event.target.files?.[0]; if (file) void analyze(file); }} /></label>}
    {initial && <p>{initial.audioName} <button type="button" className="secondary" disabled={busy} onClick={() => void analyze()}>BPM opnieuw analyseren</button></p>}
    <p role="status">{busy ? 'Audio lezen en tempo analyseren…' : duration ? detected ? `Geschat tempo: ${detected} BPM · controleer dit met je gehoor.` : 'Geen duidelijk tempo gevonden. Vul het BPM zelf in.' : 'Kies een MP3 om te beginnen.'}</p>
    <label>Naam<input required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} /></label>
    <label>Origineel BPM<input type="number" required min="0.1" max="1000" step="0.1" value={bpm} onChange={event => { manual.current = true; setBpm(event.target.value); }} /></label>
    {detected !== null && <button type="button" className="text-button" onClick={() => { manual.current = true; setBpm(String(detected)); }}>Gebruik schatting ({detected} BPM)</button>}
    <label>Opdracht<textarea rows={5} maxLength={20000} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <label>Tablatuur of foto (optioneel)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void chooseImage(file); }} /></label>
    <p className="caption">{image === null ? 'Geen afbeelding' : image?.name ?? initial?.imageName ?? 'Nog geen afbeelding'} · PNG, JPEG of WebP, maximaal 12 MB</p>
    {(image || (initial?.imageName && image !== null)) && <button type="button" className="text-button" onClick={() => setImage(null)}>Afbeelding verwijderen</button>}
    {error && <p role="alert" className="error">{error}</p>}
    <div className="detail-footer"><button type="button" className="secondary" onClick={cancel}>Annuleren</button><button className="primary" disabled={busy || imageBusy || !duration || (!initial && !audio) || !(Number(bpm) > 0)}>{saving ? 'Opslaan…' : 'Oefening opslaan'}</button></div>
  </fieldset></form></section>;
}

function Detail({ item, edit }: { item: Exercise; edit: () => void }) {
  const [url, setUrl] = useState(''); const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    let active = true, objectUrl = ''; setUrl(''); setError('');
    if (item.imageName) window.hitthebeat!.readImage(item.id).then(image => {
      if (active && image) { objectUrl = URL.createObjectURL(new Blob([new Uint8Array(image.bytes)], { type: image.mime })); setUrl(objectUrl); }
    }).catch(reason => { if (active) setError(message(reason)); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [item.id, item.updatedAt]);
  return <div className="screen-stack"><section className="panel exercise-detail"><div className="panel-heading"><h2>{item.title}</h2><button className="secondary" onClick={edit}>Bewerken</button></div><dl className="exercise-metadata"><div><dt>Audiobestand</dt><dd>{item.audioName}</dd></div><div><dt>Origineel tempo</dt><dd>{item.bpm} BPM</dd></div><div><dt>BPM-analyse</dt><dd>{item.detectedBpm ? `${item.detectedBpm} BPM geschat` : 'Geen schatting beschikbaar'}</dd></div><div><dt>Trackduur</dt><dd>{durationLabel(item.duration)}</dd></div></dl><div className={`practice-top${url ? '' : ' without-tab'}`}>
    {url && <section className="tab-panel"><div className="panel-heading"><h3>Tablatuur</h3><button className="secondary" onClick={() => dialog.current?.showModal()}>Vergroten</button></div><img src={url} alt={`Tablatuur bij ${item.title}`} /><dialog ref={dialog} className="tab-dialog"><button className="secondary" onClick={() => dialog.current?.close()}>Sluiten</button><img src={url} alt="Vergrote tablatuur" /></dialog></section>}
    <section className="instruction-inset"><h3>Opdracht</h3><p className="saved-instruction">{item.description || 'Geen opdracht toegevoegd.'}</p></section></div>{error && <p role="alert" className="error">{error}</p>}
    {!item.imageName && <p className="caption">Geen tablatuur toegevoegd.</p>}</section><AudioLab key={item.id} saved={item} /></div>;
}

export function LibraryScreen() {
  const [items, setItems] = useState<Exercise[]>([]), [selected, setSelected] = useState('');
  const [query, setQuery] = useState(''), [error, setError] = useState('');
  const [form, setForm] = useState<'new' | 'edit' | null>(null), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; window.hitthebeat?.listExercises().then(result => { if (active) { setItems(result); setSelected(result[0]?.id ?? ''); } }).catch(reason => { if (active) setError(message(reason)); }).finally(() => { if (active) setLoading(false); }); if (!window.hitthebeat) { setError('Open deze bibliotheek in de desktopapp.'); setLoading(false); } return () => { active = false; }; }, []);
  const item = items.find(row => row.id === selected);
  return <div className="screen-stack"><div className="panel-heading"><p className="muted">MP3 en afbeeldingen worden naar je lokale bibliotheek gekopieerd.</p><button className="primary" onClick={() => setForm('new')} disabled={Boolean(form)}>Oefening toevoegen</button></div>{error && <p role="alert" className="error">{error}</p>}
    {form ? <ExerciseForm key={form + selected} initial={form === 'edit' ? item : undefined} cancel={() => setForm(null)} done={saved => { setItems(current => [...current.filter(row => row.id !== saved.id), saved].sort((a, b) => a.title.localeCompare(b.title))); setSelected(saved.id); setForm(null); }} /> : <div className="library-layout"><section className="panel exercise-list"><label className="search-label">Zoek oefeningen<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="exercise-options">{items.filter(row => row.title.toLowerCase().includes(query.toLowerCase())).map(row => <button key={row.id} aria-pressed={row.id === selected} onClick={() => setSelected(row.id)}><span><strong>{row.title}</strong><small>{row.bpm} BPM · {durationLabel(row.duration)}</small></span></button>)}</div><p className="caption">{loading ? 'Bibliotheek laden…' : !items.length ? 'Voeg je eerste oefening toe.' : 'Opgeslagen op deze computer'}</p><button className="text-button" onClick={() => { void window.hitthebeat!.openLibraryFolder().catch(reason => setError(message(reason))); }}>Bibliotheekmap openen</button></section>{item ? <Detail item={item} edit={() => setForm('edit')} /> : <section className="panel exercise-detail"><h2>Jouw muziek begint hier</h2><p>Voeg een MP3 toe, controleer het BPM en schrijf op waar je op wilt letten.</p></section>}</div>}
  </div>;
}
