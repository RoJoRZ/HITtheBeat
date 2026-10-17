import { bpmText } from '../../electron/tempo-display.mjs';
import { useNotationContext } from './notation';
import { Expand } from 'lucide-react';
import { isMetronome, meters } from '../../electron/exercise-model.mjs';
import { MetronomePlayer } from './MetronomePlayer';
import { audioFormat } from '../../electron/audio-format.mjs';
import { useEffect, useRef, useState } from 'react';
import type { Asset, Exercise } from '../library/types';
import { analyzeAudio } from '../library/analyze';
import { FragmentLibrary } from './FragmentControls';
import { AudioLab } from './AudioLab';
import { durationLabel } from './controls';

const message = (error: unknown) => error instanceof Error ? error.message : 'Dit is niet gelukt. Probeer opnieuw.';

function ExerciseForm({ initial, done, cancel }: { initial?: Exercise; done: (item: Exercise) => void; cancel: () => void }) {
  const [kind, setKind] = useState(initial?.kind ?? 'audio'), [meter, setMeter] = useState(initial?.meter ?? '4/4');
  const [bars, setBars] = useState(String(initial?.bars ?? 8));
  const metro = kind === 'metronome';
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [bpm, setBpm] = useState(String(initial?.bpm ?? ''));
  const [detected, setDetected] = useState(initial?.detectedBpm ?? null);
  const [duration, setDuration] = useState(initial?.duration ?? 0);
  const [normalizationDb, setNormalizationDb] = useState<number | null>(initial?.normalizationDb ?? null);
  const [normalizeAudio, setNormalizeAudio] = useState(initial?.normalizeAudio ?? true);
  const [levelNote, setLevelNote] = useState('');
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
    if (file) { setAudio(undefined); setDuration(0); setDetected(null); setNormalizationDb(null); setLevelNote(''); }
    try {
      if (file && (!/\.(mp3|m4a)$/i.test(file.name) || file.size > 50 * 1024 * 1024)) throw new Error('Kies een MP3 of M4A van maximaal 50 MB.');
      const bytes = file ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array((await window.hitthebeat!.readAudio(initial!.id)).bytes);
      if (file) audioFormat(file.name, bytes);
      const result = await analyzeAudio(bytes.slice().buffer, controller.signal);
      if (controller.signal.aborted) return;
      setDuration(result.duration); setDetected(result.estimate.bpm); setNormalizationDb(result.normalization.db);
      setLevelNote(result.normalization.quiet ? 'Stilte of vrijwel onhoorbare audio: het niveau blijft ongewijzigd.' : result.normalization.limited ? 'Aanpassing begrensd om pieken en sterke versterking te beperken.' : 'Het geluidsniveau is gemeten.');
      if (file) { setAudio({ name: file.name, bytes }); setTitle(current => current.trim() ? current : file.name.replace(/\.(mp3|m4a)$/i, '')); }
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
      const item = await window.hitthebeat!.saveExercise({ id: initial?.id, kind, meter, bars: metro ? Number(bars) : undefined, title, description, bpm: Number(bpm), detectedBpm: detected, analysisStatus: detected ? 'estimated' : 'unavailable', duration: metro ? 0 : duration, audio: metro ? undefined : audio, image, normalizationDb: metro ? null : normalizationDb, normalizeAudio: metro ? false : normalizeAudio });
      done(item);
    } catch (reason) { setError(message(reason)); }
    finally { setSaving(false); }
  }}><fieldset disabled={saving} className="library-fields">
    <label>Oefentype<select aria-label="Oefentype" disabled={Boolean(initial)} value={kind} onChange={event => { abort.current?.abort(); setBusy(false); setError(''); setKind(event.target.value); if (!bpm) setBpm('120'); }}><option value="audio">Audiotrack</option><option value="metronome">Metronoom zonder audiobestand</option></select></label>
    {metro ? <><label>Maatsoort<select aria-label="Maatsoort" value={meter} onChange={event => setMeter(event.target.value)}>{meters.map(value => <option key={value}>{value}</option>)}</select></label><label>Maten per herhaling<input type="number" min="1" max="128" step="1" required value={bars} onChange={event => setBars(event.target.value)} /></label><p className="caption">BPM is kwartnoten per minuut, ook bij 6/8. Dit aantal maten wordt gebruikt in je oefensessies. Opslaan past ook bestaande sessie-opbouwen aan; gespeelde resultaten blijven behouden.</p></> : <>
    <label>{initial ? 'Audiobestand vervangen (MP3 of M4A)' : 'Audiobestand (MP3 of M4A)'}<input type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a" onChange={event => { const file = event.target.files?.[0]; if (file) void analyze(file); }} /></label>
    {initial && <p className="caption">Vervangen gebeurt bij opslaan. Naam, opdracht, tablatuur en fragmenten blijven bewaard. Controleer daarna of de fragmenten nog bij de nieuwe audio passen.</p>}
    {initial && <p>{audio?.name ?? initial.audioName} <button type="button" className="secondary" disabled={busy || Boolean(audio)} onClick={() => void analyze()}>BPM opnieuw analyseren</button></p>}
    <p role="status">{busy ? 'Audio lezen en tempo analyseren…' : duration ? detected ? `Geschat tempo: ${bpmText(detected)} BPM · controleer dit met je gehoor.` : 'Geen duidelijk tempo gevonden. Vul het BPM zelf in.' : 'Kies een MP3 of M4A met AAC om te beginnen.'}</p>
    <div className="normalization-setting"><label className="normalization-choice"><input type="checkbox" checked={normalizeAudio} onChange={event => setNormalizeAudio(event.target.checked)} />Geluidsniveau normaliseren</label><p className="caption">{normalizationDb === null ? 'Het geluidsniveau wordt bij het toevoegen gemeten.' : `Gemeten aanpassing: ${normalizationDb >= 0 ? '+' : ''}${normalizationDb.toFixed(1)} dB.`} {levelNote} Het originele audiobestand blijft bewaard.</p>{initial && <button type="button" className="secondary" disabled={busy || Boolean(audio)} onClick={() => { setNormalizeAudio(true); void analyze(); }}>Volume normaliseren</button>}</div>
    </>}
    <label>Naam<input required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} /></label>
    <label>{metro ? 'BPM' : 'Origineel BPM'}<input type="number" required min={metro ? 20 : 0} max={metro ? 300 : 1000} step="1" value={bpm === '' ? '' : bpmText(Number(bpm))} onChange={event => { manual.current = true; setBpm(event.target.value.trim() ? String(Math.round(event.target.valueAsNumber)) : ''); }} /></label>
    {!metro && detected !== null && <button type="button" className="text-button" onClick={() => { manual.current = true; setBpm(String(detected)); }}>Gebruik schatting ({bpmText(detected)} BPM)</button>}
    {!metro && <div className="row-actions bpm-correction"><button type="button" className="secondary" disabled={!(Number(bpm) >= 2)} onClick={() => { manual.current = true; setBpm(String(Math.round(Number(bpm) / 2))); }}>Halveer BPM</button><button type="button" className="secondary" disabled={!(Number(bpm) > 0 && Number(bpm) <= 500)} onClick={() => { manual.current = true; setBpm(String(Math.round(Number(bpm) * 2))); }}>Verdubbel BPM</button><span className="caption">Een schatting kan de halve of dubbele tel volgen. Kies wat bij de oefening hoort.</span></div>}
    <label>Opdracht<textarea rows={5} maxLength={20000} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <label>Tablatuur of foto (optioneel)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void chooseImage(file); }} /></label>
    <p className="caption">{image === null ? 'Geen afbeelding' : image?.name ?? initial?.imageName ?? 'Nog geen afbeelding'} · PNG, JPEG of WebP, maximaal 12 MB</p>
    {(image || (initial?.imageName && image !== null)) && <button type="button" className="text-button" onClick={() => setImage(null)}>Afbeelding verwijderen</button>}
    {error && <p role="alert" className="error">{error}</p>}
    <div className="detail-footer"><button type="button" className="secondary" onClick={cancel}>Annuleren</button><button className="primary" disabled={busy || imageBusy || (!metro && (!duration || (!initial && !audio))) || !(Number(bpm) > 0)}>{saving ? 'Opslaan…' : 'Oefening opslaan'}</button></div>
  </fieldset></form></section>;
}

function Detail({ item, edit, changed }: { item: Exercise; edit: () => void; changed: (item: Exercise) => void }) {
  const [url, setUrl] = useState(''); const [error, setError] = useState('');
  const notation = useNotationContext(item);
  useEffect(() => {
    let active = true, objectUrl = ''; setUrl(''); setError('');
    if (item.imageName) window.hitthebeat!.readImage(item.id).then(image => {
      if (active && image) { objectUrl = URL.createObjectURL(new Blob([new Uint8Array(image.bytes)], { type: image.mime })); setUrl(objectUrl); }
    }).catch(reason => { if (active) setError(message(reason)); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [item.id, item.updatedAt]);
  return <div className="screen-stack"><section className="panel exercise-detail"><div className="panel-heading"><h2>{item.title}</h2><button className="secondary" onClick={edit}>Bewerken</button></div>{isMetronome(item) ? <dl className="exercise-metadata"><div><dt>Oefentype</dt><dd>Metronoom</dd></div><div><dt>Tempo</dt><dd>{bpmText(item.bpm)} BPM per kwartnoot</dd></div><div><dt>Maatsoort</dt><dd>{item.meter}</dd></div><div><dt>Maten per herhaling</dt><dd>{item.bars ?? 8}</dd></div></dl> : <dl className="exercise-metadata"><div><dt>Audiobestand</dt><dd>{item.audioName}</dd></div><div><dt>Origineel tempo</dt><dd>{bpmText(item.bpm)} BPM</dd></div><div><dt>BPM-analyse</dt><dd>{item.detectedBpm ? `${bpmText(item.detectedBpm)} BPM geschat` : 'Geen schatting beschikbaar'}</dd></div><div><dt>Trackduur</dt><dd>{durationLabel(item.duration)}</dd></div><div><dt>Geluidsniveau</dt><dd>{item.normalizationDb == null ? 'Nog niet gemeten' : item.normalizeAudio === false ? 'Normalisatie uit' : `Genormaliseerd (${item.normalizationDb >= 0 ? '+' : ''}${item.normalizationDb.toFixed(1)} dB)`}</dd></div></dl>}<div className={`practice-top${url ? '' : ' without-tab'}`}>
    {url && <section className="tab-panel"><div className="panel-heading"><h3>Tablatuur</h3><button className="secondary" aria-label="Tablatuur vergroten" onClick={notation.open}><Expand size={18} />Vergroten</button></div><img src={url} alt={`Tablatuur bij ${item.title}`} /></section>}
    <section className="instruction-inset"><h3>Opdracht</h3><p className="saved-instruction">{item.description || 'Geen opdracht toegevoegd.'}</p></section></div>{error && <p role="alert" className="error">{error}</p>}
    {notation.error && <p role="alert" className="error">{notation.error}</p>}{!item.imageName && <p className="caption">Geen tablatuur toegevoegd.</p>}</section>{isMetronome(item) ? <MetronomePlayer key={item.id + item.updatedAt} exercise={item} /> : <><AudioLab key={item.id} saved={item} onFragmentSaved={changed} /><FragmentLibrary key={item.id} exercise={item} changed={changed} /></>}</div>;
}

export function LibraryScreen() {
  const [items, setItems] = useState<Exercise[]>([]), [selected, setSelected] = useState('');
  const [query, setQuery] = useState(''), [error, setError] = useState('');
  const [form, setForm] = useState<'new' | 'edit' | null>(null), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; window.hitthebeat?.listExercises().then(result => { if (active) { setItems(result); setSelected(result[0]?.id ?? ''); } }).catch(reason => { if (active) setError(message(reason)); }).finally(() => { if (active) setLoading(false); }); if (!window.hitthebeat) { setError('Open deze bibliotheek in de desktopapp.'); setLoading(false); } return () => { active = false; }; }, []);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const item = items.find(row => row.id === selected);
  return <div className="screen-stack"><div className="panel-heading"><p className="muted">Audio en afbeeldingen worden naar je lokale bibliotheek gekopieerd.</p><button className="primary" onClick={() => setForm('new')} disabled={Boolean(form)}>Oefening toevoegen</button></div>{error && <p role="alert" className="error">{error}</p>}
    {form ? <ExerciseForm key={form + selected} initial={form === 'edit' ? item : undefined} cancel={() => setForm(null)} done={saved => { setItems(current => [...current.filter(row => row.id !== saved.id), saved].sort((a, b) => a.title.localeCompare(b.title))); setSelected(saved.id); setForm(null); }} /> : <div className="library-layout"><section className="panel exercise-list"><label className="search-label">Zoek oefeningen<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="exercise-options">{items.filter(row => row.title.toLowerCase().includes(query.toLowerCase())).map(row => <button key={row.id} aria-pressed={row.id === selected} onClick={() => setSelected(row.id)}><span><strong>{row.title}</strong><small>{bpmText(row.bpm)} BPM · {isMetronome(row) ? `Metronoom ${row.meter}` : durationLabel(row.duration)}</small></span></button>)}</div><p className="caption">{loading ? 'Bibliotheek laden…' : !items.length ? 'Voeg je eerste oefening toe.' : 'Opgeslagen op deze computer'}</p></section>{item ? <div><button className="secondary" onClick={() => deleteDialog.current?.showModal()}>Oefening verwijderen</button><Detail item={item} edit={() => setForm('edit')} changed={saved => setItems(current => current.map(row => row.id === saved.id ? saved : row))} /></div> : <section className="panel exercise-detail"><h2>Jouw muziek begint hier</h2><p>Voeg een audiotrack of metronoom-oefening toe en schrijf op waar je op wilt letten.</p></section>}</div>}
    <dialog ref={deleteDialog} className="tab-dialog" onCancel={event => { if (deleting) event.preventDefault(); }}><h2>Oefening verwijderen?</h2><p>“{item?.title}” en de bijbehorende audio, tablatuur en fragmenten worden uit de bibliotheek verwijderd. Eerdere sessieresultaten blijven bewaard. Een oefening die nog in een opgeslagen sessie staat kun je pas verwijderen nadat je haar daaruit hebt gehaald.</p><div className="row-actions"><button className="secondary" disabled={deleting} onClick={() => deleteDialog.current?.close()}>Annuleren</button><button className="primary" disabled={deleting} onClick={async () => {
      if (!item) return; setDeleting(true); setError('');
      try { await window.hitthebeat!.deleteExercise(item.id); const remaining = items.filter(row => row.id !== item.id); setItems(remaining); setSelected(remaining[0]?.id ?? ''); }
      catch (reason) { setError(message(reason)); }
      finally { setDeleting(false); deleteDialog.current?.close(); }
    }}>Definitief verwijderen</button></div></dialog>
  </div>;
}
