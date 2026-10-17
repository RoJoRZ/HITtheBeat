import { countInSeconds, countInForBlock, hasCountIn } from '../../electron/count-in-model.mjs';
import { isMetronome, exerciseBars, validTempo, meterBeats } from '../../electron/exercise-model.mjs';
import { MetronomeEngine } from '../audio/metronome';
type PlayerEngine = AudioEngine | MetronomeEngine;
import { outputVolume, useOutput } from '../audio/output-volume';
import { SessionReview } from './SessionReview';
import { SaveCurrentFragment } from './FragmentControls';
import { VolumeControl } from './VolumeControl';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Play, Pause, RotateCcw, Expand, X } from 'lucide-react';
import { AudioEngine, validateAudioSettings } from '../audio/engine';
import { advance, createRun, current, remainingSeconds, remainingPreparation, series, type Run } from '../session/runner';
import type { Exercise, SessionRecord, Played, SessionProgress, Evaluation } from '../library/types';
import { NumberField } from './AudioLab';
import { durationLabel } from './controls';
const readable = (reason: unknown) => (reason instanceof Error ? reason.message : 'Afspelen is niet gelukt.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
type Free = { a: number; b: number; bpm: number; pitch: number; loop: boolean };
type Totals = { planned: number; fragment: number; pause: number; preparation: number };

function Notation({ item }: { item: Exercise }) {
  const [url, setUrl] = useState(''), [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    let alive = true, value = ''; setUrl(''); setError('');
    if (item.imageName) window.hitthebeat!.readImage(item.id).then(asset => {
      if (alive && asset) { value = URL.createObjectURL(new Blob([new Uint8Array(asset.bytes)], { type: asset.mime })); setUrl(value); }
    }).catch(reason => { if (alive) setError(readable(reason)); });
    return () => { alive = false; if (value) URL.revokeObjectURL(value); };
  }, [item.id, item.updatedAt]);
  return <div className={`practice-top${item.imageName ? '' : ' without-tab'}`}>
    {item.imageName && <section className="panel tab-panel"><div className="panel-heading"><h2>Tablatuur</h2><button className="icon-button" aria-label="Tablatuur vergroten" disabled={!url} onClick={() => dialog.current?.showModal()}><Expand size={19} /></button></div>{url && <img src={url} alt={`Tablatuur bij ${item.title}`} />}{error && <p role="alert" className="error">{error}</p>}<dialog ref={dialog} className="tab-dialog"><div className="panel-heading"><h2>{item.title}</h2><button className="icon-button" aria-label="Vergrote tablatuur sluiten" onClick={() => dialog.current?.close()}><X /></button></div>{url && <img src={url} alt="Vergrote tablatuur" />}</dialog></section>}
    <section className="panel assignment-panel"><h2>Opdracht</h2><div className="assignment-scroll"><p>{item.description || 'Geen geschreven opdracht toegevoegd.'}</p></div>{!item.imageName && <p className="caption">Geen tablatuur bij deze oefening.</p>}</section>
  </div>;
}

export function SessionPlayer({ session, active, leave, finished, stopRef }: { session: SessionRecord; active: boolean; leave: () => void; finished: () => void; stopRef: MutableRefObject<(() => Promise<void>) | null> }) {
  const { routine, exercises } = session;
  const output = useOutput();
  const [run, setRun] = useState(() => createRun(routine, exercises));
  const state = useRef(run), audioRef = useRef<PlayerEngine | null>(null), assetId = useRef('');
  const activeRef = useRef(active); activeRef.current = active;
  const generation = useRef(0), locked = useRef(true), alive = useRef(true);
  const [busy, setBusy] = useState(true), [error, setError] = useState(''), [loaded, setLoaded] = useState(false);
  const [countRemaining, setCountRemaining] = useState(0);
  const [position, setPosition] = useState(0), [wave, setWave] = useState<number[]>([]);
  const [free, setFree] = useState<Free>({ a: 0, b: 1, bpm: 90, pitch: 0, loop: true });
  const freeRef = useRef(free), [freePlaying, setFreePlaying] = useState(false);
  const totals = useRef<Totals>({ planned: 0, fragment: 0, pause: 0, preparation: 0 }), [times, setTimes] = useState(totals.current);
  const last = useRef<{ audio: PlayerEngine; clock: number; bucket: keyof Totals | null; remaining: number; playbackStart: number; settings: Omit<Played, 'seconds'|'completed'> } | null>(null);
  const played = useRef<Played[]>([]), sequence = useRef(0), saving = useRef<Promise<unknown>>(Promise.resolve());
  const [reviewError, setReviewError] = useState('');
  const [saveError, setSaveError] = useState(''), [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [choice, setChoice] = useState<'same'|'faster'|'slower'>('same'), [delta, setDelta] = useState(5), [note, setNote] = useState('');
  const [rating, setRating] = useState(3);
  const evaluationId = useRef(crypto.randomUUID());
  useEffect(() => { setReviewError(''); }, [choice, delta, rating, note]);
  const { exercise, step, block } = current(run);
  const countIn = countInForBlock(routine, block);
  useEffect(() => { audioRef.current?.setVolume(outputVolume()); }, [output]);
  function entry(settings: Omit<Played, 'seconds'|'completed'>) {
    let item = played.current.find(item => item.mode === settings.mode && item.block === settings.block && item.step === settings.step && item.a === settings.a && item.b === settings.b && item.bpm === settings.bpm && item.pitch === settings.pitch);
    if (!item) { item = { ...settings, seconds: 0, completed: 0 }; played.current.push(item); }
    return item;
  }
  function settings(snapshot: Run, audio: PlayerEngine): Omit<Played, 'seconds'|'completed'> {
    const selection = current(snapshot), isFree = snapshot.phase === 'fragment';
    return { mode: isFree ? 'fragment' : 'planned', block: snapshot.block, step: snapshot.step, a: isFree ? freeRef.current.loop ? freeRef.current.a : 0 : selection.step.start ?? 0, b: isFree ? freeRef.current.loop ? freeRef.current.b : selection.exercise.duration : selection.step.end ?? selection.exercise.duration, bpm: isFree ? freeRef.current.bpm : selection.step.bpm, pitch: isFree ? freeRef.current.pitch : 0 };
  }
  function persist(status: 'running'|'stopped'|'completed'|'partial' = 'running') {
    measure();
    const snapshot = state.current;
    const progress: SessionProgress = { seq: ++sequence.current, block: snapshot.block, step: snapshot.step, repetition: snapshot.repetition, phase: snapshot.phase, passes: snapshot.passes, statuses: [...snapshot.statuses], times: { ...totals.current }, played: structuredClone(played.current) };
    const task = saving.current.catch(() => {}).then(() => window.hitthebeat!.saveSession(session.id, progress, status));
    saving.current = task;
    return task.then(value => { if (alive.current) setSaveError(''); return value; }, reason => { if (alive.current) setSaveError(readable(reason)); throw reason; });
  }
  useEffect(() => {
    stopRef.current = async () => { await audioRef.current?.pause(); measure(); await persist('stopped'); };
    const timer = setInterval(() => { if (state.current.phase !== 'complete') void persist().catch(() => {}); }, 1000);
    return () => { clearInterval(timer); stopRef.current = null; };
  }, []);
  function commit(next: Run) { if (next.revision !== state.current.revision) { locked.current = true; setBusy(true); } state.current = next; setRun(next); }
  function measure() {
    const audio = audioRef.current; if (!audio) return;
    const before = last.current;
    if (before?.audio === audio && before.bucket) {
      const elapsed = Math.max(0, Math.min(audio.clock - before.clock, before.remaining));
      const preparation = before.bucket === 'planned' ? Math.max(0, Math.min(audio.clock, before.playbackStart) - before.clock) : 0;
      const music = Math.max(0, elapsed - preparation);
      totals.current = { ...totals.current, [before.bucket]: totals.current[before.bucket] + music, preparation: totals.current.preparation + preparation };
      if (before.bucket !== 'pause' && music > 0) entry(before.settings).seconds += music;
    }
    const snapshot = state.current, selection = current(snapshot);
    const bucket = audio.playing && !audio.ended ? snapshot.phase === 'fragment' ? 'fragment' : ['playing','countin'].includes(snapshot.phase) ? 'planned' : null : snapshot.phase === 'paused' || snapshot.phase === 'fragment' ? 'pause' : null;
    const end = snapshot.phase === 'fragment' ? audio.duration : selection.step.end ?? audio.duration;
    last.current = { audio, clock: audio.clock, bucket, remaining: bucket === 'pause' || audio.loop ? Infinity : audio.countRemaining + Math.max(0, (end - audio.position) / audio.rate), playbackStart: audio.playbackStart, settings: settings(snapshot, audio) };
    setTimes(totals.current);
  }
  useEffect(() => {
    alive.current = true;
    const timer = setInterval(() => {
      const audio = audioRef.current; if (!audio) return;
      measure(); setPosition(audio.position); setCountRemaining(audio.countRemaining); setFreePlaying(audio.playing && !audio.ended);
      if (!locked.current && state.current.phase === 'countin' && audio.playing && !audio.counting) commit(advance(state.current, 'counted'));
      if (!locked.current && state.current.phase === 'playing' && audio.ended) { entry(settings(state.current, audio)).completed++; commit(advance(state.current, 'ended')); }
    }, 50);
    return () => { alive.current = false; generation.current++; clearInterval(timer); audioRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    const snapshot = state.current;
    if (snapshot.phase === 'review' || snapshot.phase === 'complete') {
      setError(''); setReviewError(''); setChoice('same'); setRating(3); setDelta(5); setNote(''); evaluationId.current = crypto.randomUUID();
      locked.current = true; setBusy(true);
      void persist(snapshot.phase === 'complete' ? snapshot.statuses.includes('skipped') ? 'partial' : 'completed' : 'running').then(() => { if (snapshot.phase === 'complete' && alive.current) finished(); }).catch(() => {}).finally(() => { if (alive.current && state.current.revision === snapshot.revision) { locked.current = false; setBusy(false); } });
      return;
    }
    const selected = current(snapshot), token = ++generation.current;
    locked.current = true; setBusy(true); setError('');
    void (async () => {
      measure(); await audioRef.current?.pause(); measure();
      if (!alive.current || token !== generation.current) return;
      let audio = audioRef.current;
      if (!audio || assetId.current !== `${selected.block.id}:${isMetronome(selected.exercise) ? selected.exercise.duration : ''}` || !loaded) {
        if (isMetronome(selected.exercise)) {
          audio?.dispose(); audio = new MetronomeEngine(selected.exercise.duration, selected.exercise.meter ?? '4/4', selected.exercise.bpm); audio.setVolume(outputVolume()); audioRef.current = audio; setWave([]);
        } else {
          audio?.dispose(); audio = new AudioEngine(); audio.setVolume(outputVolume()); audioRef.current = audio; assetId.current = ''; setLoaded(false); setWave([]);
          const bytes = await window.hitthebeat!.readAudio(selected.exercise.id);
          if (!alive.current || token !== generation.current) return;
          const buffer = await audio.load(new Uint8Array(bytes.bytes).buffer, selected.exercise.normalizeAudio !== false ? selected.exercise.normalizationDb ?? null : null);
          if (!alive.current || token !== generation.current) return;
          const data = buffer.getChannelData(0);
          const peaks = Array.from({ length: 220 }, (_, index) => { let peak = 0; for (let i = Math.floor(index * data.length / 220); i < Math.floor((index + 1) * data.length / 220); i++) peak = Math.max(peak, Math.abs(data[i])); return peak; });
          const maximum = Math.max(.001, ...peaks); setWave(peaks.map(value => value / maximum));
        }
        assetId.current = `${selected.block.id}:${isMetronome(selected.exercise) ? selected.exercise.duration : ''}`; setLoaded(true);
      }
      await audio.playSegment(selected.step.start ?? 0, selected.step.end ?? audio.duration, selected.step.bpm / selected.exercise.bpm, 0, ['playing','countin'].includes(snapshot.phase), snapshot.phase === 'countin' ? countInForBlock(snapshot.routine, selected.block) : undefined, selected.step.bpm);
      if (!alive.current || token !== generation.current) return;
      if (!activeRef.current && ['playing','countin'].includes(state.current.phase)) { await audio.pause(); commit(advance(state.current, 'pause')); }
      setPosition(audio.position); setCountRemaining(audio.countRemaining); measure();
      void persist().catch(() => {});
    })().catch(reason => {
      if (alive.current && token === generation.current) { setError(readable(reason)); setLoaded(false); commit(advance(state.current, 'pause')); }
    }).finally(() => { if (alive.current && token === generation.current) { locked.current = false; setBusy(false); } });
  }, [run.revision]);

  async function operate(task: (audio: PlayerEngine) => Promise<void>) {
    const audio = audioRef.current; if (locked.current || !audio || !loaded) return;
    const token = generation.current, revision = state.current.revision;
    locked.current = true; setBusy(true); setError('');
    try { measure(); await task(audio); if (!activeRef.current && ['playing','countin'].includes(state.current.phase)) { await audio.pause(); commit(advance(state.current, 'pause')); } measure(); if (alive.current) { setPosition(audio.position); setCountRemaining(audio.countRemaining); } }
    catch (reason) { if (alive.current) setError(readable(reason)); }
    finally { if (alive.current && token === generation.current && revision === state.current.revision) { locked.current = false; setBusy(false); } }
  }
  const toggle = () => operate(async audio => {
    if (state.current.phase === 'fragment') await audio.playPause();
    else {
      const wasPlaying = ['playing','countin'].includes(state.current.phase), next = advance(state.current, wasPlaying ? 'pause' : 'play');
      if (wasPlaying) await audio.pause();
      else if (next.phase === 'countin') { const selected = current(next); await audio.playSegment(selected.step.start ?? 0, selected.step.end ?? audio.duration, selected.step.bpm / selected.exercise.bpm, 0, true, countInForBlock(next.routine, selected.block), selected.step.bpm); }
      else await audio.playPause();
      commit(next);
    }
  });
  const restart = () => operate(async audio => {
    if (state.current.phase !== 'fragment' && countIn?.enabled) { await audio.pause(); commit(advance(state.current, 'restart')); }
    else await audio.seek(state.current.phase === 'fragment' ? freeRef.current.loop ? freeRef.current.a : 0 : current(state.current).step.start ?? 0);
  });
  async function enterFragment() {
    await operate(async audio => {
      const settings = { a: step.start ?? 0, b: step.end ?? audio.duration, bpm: step.bpm, pitch: 0, loop: true };
      await audio.pause(); commit(advance(state.current, 'fragment'));
      freeRef.current = settings; setFree(settings);
      await audio.configure(settings.bpm / exercise.bpm, 0, settings.a, settings.b, true); await audio.seek(settings.a);
    });
  }
  async function returnToRound() {
    await operate(async audio => { await audio.pause(); commit(advance(state.current, 'return')); });
  }
  function freeSettings(change: Partial<Free>) {
    const audio = audioRef.current;
    if (!audio || locked.current || state.current.phase !== 'fragment') return;
    const next = { ...freeRef.current, ...change };
    try { validateAudioSettings(next.bpm / exercise.bpm, next.pitch, next.a, next.b, audio.duration); }
    catch (reason) { setError(readable(reason)); return; }
    measure(); freeRef.current = next; setFree(next); setError('');
    if (last.current) last.current.settings = settings(state.current, audio);
    // The engine serializes configuration and transport. Leaving an input
    // must not swallow the subsequent Play or Return click.
    void audio.configure(next.bpm / exercise.bpm, next.pitch, next.a, next.b, next.loop)
      .then(() => { if (alive.current) measure(); })
      .catch(reason => { if (alive.current) setError(readable(reason)); });
  }
  function move(action: 'skip' | 'next' | 'repeat') {
    if (action === 'skip' && !loaded && !locked.current) { commit(advance(state.current, 'skip')); return; }
    void operate(async audio => { await audio.pause(); commit(advance(state.current, action)); });
  }
  async function evaluate(action: Evaluation['action']) {
    if (locked.current || !active || state.current.phase !== 'review') return;
    locked.current = true; setBusy(true); setReviewError('');
    try {
      const range = series(state.current), adjustment = action === 'faster' ? delta : action === 'slower' ? -delta : 0;
      if ((action === 'faster' || action === 'slower') && (!Number.isFinite(delta) || delta <= 0 || delta > 1000)) throw new Error('Kies een positieve BPM-aanpassing.');
      await persist();
      const result = await window.hitthebeat!.reviewSession(session.id, { id: evaluationId.current, block: state.current.block, fromStep: range.start, toStep: range.end, action, delta: adjustment, note, rating });
      setEvaluations(result.evaluations);
      commit(advance(state.current, action === 'repeat' ? 'repeat' : 'next'));
    } catch (reason) { if (alive.current) { setReviewError(readable(reason)); locked.current = false; setBusy(false); } }
  }
  useEffect(() => {
    if (active) return;
    void operate(async audio => { await audio.pause(); commit(advance(state.current, 'pause')); });
  }, [active]);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (!active || event.repeat || event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement).closest('input,textarea,select,button,a,[contenteditable],dialog') || !['ready', 'playing', 'countin', 'paused', 'fragment'].includes(state.current.phase)) return;
      if (event.code === 'Space') { event.preventDefault(); void toggle(); }
      if (event.key === '1') { event.preventDefault(); void restart(); }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  const isCounting = run.phase === 'countin', isFree = run.phase === 'fragment', review = run.phase === 'review', complete = run.phase === 'complete';
  const range = series(run), lastSeries = run.step + 1 === block.steps.length;
  const previousDelta = evaluations.filter(item => item.block === run.block).reduce((sum, item) => sum + item.delta, 0);
  const adjustment = choice === 'faster' ? delta : choice === 'slower' ? -delta : 0;
  const preview = block.steps.map(item => ({ before: item.bpm + previousDelta, after: item.bpm + previousDelta + adjustment }));
  const invalidAdjustment = choice !== 'same' && (!Number.isFinite(delta) || delta <= 0 || delta > 1000 || preview.some(item => !validTempo(item.after, exercise)));
  const a = isFree ? free.a : step.start ?? 0, b = isFree ? free.b : step.end ?? exercise.duration;
  const field = (label: string, value: number, change: (value: number) => void, increment = 1) => <NumberField label={label} value={value} change={change} step={increment} disabled={busy || !active} />;
  return <div className="screen-stack session-player">
    <div className="player-context"><span>{routine.title} · Oefening {run.block + 1} van {routine.blocks.length}</span><button className="text-button" onClick={leave}>{complete ? 'Terug naar sessies' : 'Sessie stoppen'}</button></div>
    <section className="panel round-playlist" aria-label="Oefeningen in deze sessie"><h2>De hele oefensessie</h2><ol>{routine.blocks.map((item, index) => <li key={item.id} aria-current={index === run.block && !complete ? 'step' : undefined}><div className="queue-item"><strong>{index + 1}. {exercises.find(source => source.id === item.exerciseId)!.title}</strong><small>{run.statuses[index] === 'completed' ? 'Afgerond' : run.statuses[index] === 'skipped' ? 'Overgeslagen' : index === run.block ? isFree ? 'Huidig · fragmenttraining' : 'Huidige oefening' : 'Hierna'}</small></div></li>)}</ol></section>
    {reviewError && <p role="alert" className="error">{reviewError}</p>}
    {saveError && <div role="alert" className="error"><p>Bewaren is niet gelukt: {saveError}</p><button className="secondary" disabled={busy} onClick={() => { void persist(complete ? run.statuses.includes('skipped') ? 'partial' : 'completed' : 'running').then(() => { if (complete) finished(); }).catch(() => {}); }}>Opnieuw bewaren</button></div>}
    {error && <div role="alert" className="error"><p>{error}</p><button className="secondary" onClick={() => commit({ ...state.current, phase: 'paused', revision: state.current.revision + 1 })}>Audio opnieuw laden</button><button className="text-button" onClick={leave}>Terug naar sessies</button></div>}
    {complete ? <section className="panel"><h2>{run.statuses.includes('skipped') ? 'Sessie beëindigd' : 'Sessie afgerond'}</h2><p>{run.passes} speelbeurten afgerond. {run.statuses.filter(value => value === 'skipped').length} oefeningen overgeslagen.</p><p>{busy ? 'Resultaten bewaren…' : saveError ? 'Bewaar je resultaten voordat je dit scherm verlaat.' : 'Je resultaten zijn bewaard bij Voortgang.'}</p><button className="primary" disabled={busy || Boolean(saveError)} onClick={leave}>Terug naar mijn sessies</button></section> : <><h2 className="session-exercise-title">{exercise.title}</h2><Notation item={exercise} />
    {review ? <section className="panel session-review"><h2>{lastSeries ? 'Oefening afgerond' : 'Fragmentserie afgerond'}</h2><p>{exercise.title} · Stappen {range.start + 1}–{range.end + 1} · {isMetronome(exercise) ? `Metronoom ${exercise.meter} · ${exerciseBars(step, exercise)} maten` : step.start === null ? 'Volledige track' : `${step.fragmentName ? `${step.fragmentName} · ` : 'Fragment '}${step.start}–${step.end} seconden`}</p><SessionReview tempoRule={isMetronome(exercise) ? '20–300 BPM' : undefined} disabled={busy || !active} choice={choice} setChoice={setChoice} delta={delta} setDelta={setDelta} rating={rating} setRating={setRating} note={note} setNote={setNote} preview={preview.map(item => `${item.before} → ${Number.isFinite(item.after) ? item.after : '—'}`).join(' · ')} invalid={invalidAdjustment} submit={action => void evaluate(action)} nextLabel={!lastSeries ? 'Verder met volgende fragment' : run.block + 1 === routine.blocks.length ? 'Sessie afronden' : 'Verder met volgende oefening'} /></section> : <section className="audio-lab audio-embedded" aria-label="Sessiespeler"><div className="player-card" aria-busy={busy}>
      {isCounting && <div className="count-in-panel" role="status" aria-live="off" data-testid="count-in"><strong>Aftellen · {countIn!.meter}</strong><span>Tel {Math.min(meterBeats(countIn!.meter), Math.floor((countInSeconds({ countIn }, step.bpm) - Math.min(countInSeconds({ countIn }, step.bpm), countRemaining)) / (countInSeconds({ countIn }, step.bpm) / meterBeats(countIn!.meter))) + 1)} van {meterBeats(countIn!.meter)} · {step.bpm} BPM</span></div>}
      <div className="session-pass"><strong>{isFree ? 'Vrij fragment oefenen' : `Stap ${run.step + 1} van ${block.steps.length} · Herhaling ${run.repetition + 1} van ${step.repetitions}`}</strong><span data-testid="session-bpm">{isFree ? free.bpm : step.bpm} BPM</span></div>
      {!isFree && <p className="caption" data-testid="planned-settings">{isMetronome(exercise) ? `Metronoom ${exercise.meter} · ${exerciseBars(step, exercise)} maten` : step.start === null ? 'Volledige track' : `${step.fragmentName ? `${step.fragmentName} · ` : 'Fragment '}${step.start}–${step.end} seconden`}{!isMetronome(exercise) && ' · Toonhoogte origineel'}</p>}
      <p className="caption">{busy ? 'Audio voorbereiden…' : isFree ? 'Je plek in de sessie blijft bewaard. Vrije loops tellen niet mee als herhalingen.' : 'De volgende herhaling en stap beginnen automatisch.'}</p>
      {isMetronome(exercise) ? <p className="metronome-display" role="status">Metronoom · {exercise.meter} · {exerciseBars(step, exercise)} maten · BPM per kwartnoot · Tel {Math.min(meterBeats(exercise.meter ?? '4/4'), Math.floor(position / (60 / exercise.bpm * (exercise.meter === '6/8' ? .5 : 1))) % meterBeats(exercise.meter ?? '4/4') + 1)}</p> : <svg className="waveform" viewBox="0 0 880 140" role="img" aria-label="Golfvorm van de oefening" preserveAspectRatio="none"><rect x={a / exercise.duration * 880} y="0" width={(b - a) / exercise.duration * 880} height="140" fill="currentColor" opacity=".12" />{wave.map((peak, index) => <line key={index} x1={index * 4 + 2} x2={index * 4 + 2} y1={70 - Math.max(2, peak * 60)} y2={70 + Math.max(2, peak * 60)} stroke="currentColor" strokeWidth="2" opacity={index / 220 * exercise.duration <= position ? 1 : .38} />)}<line x1={position / exercise.duration * 880} x2={position / exercise.duration * 880} y1="0" y2="140" stroke="#f2f4f6" /></svg>}
      <div className="time-row"><span>{durationLabel(position * (isMetronome(exercise) ? exercise.bpm / step.bpm : 1))} / {durationLabel(exercise.duration * (isMetronome(exercise) ? exercise.bpm / step.bpm : 1))}</span><span>Resterend sessie: <strong data-testid="session-remaining">{durationLabel(remainingSeconds(run, position) + remainingPreparation(run, countRemaining))}</strong></span></div>
      <div className="session-transport"><button className="secondary" aria-label="Terug naar begin van de herhaling" disabled={busy || !loaded || !active} onClick={() => void restart()}><RotateCcw size={20} /></button><button className="primary play-button" disabled={busy || !loaded || !active} onClick={() => void toggle()}>{(isFree ? freePlaying : ['playing','countin'].includes(run.phase)) ? <Pause size={22} /> : <Play size={22} />}{(isFree ? freePlaying : ['playing','countin'].includes(run.phase)) ? 'Pauzeren' : 'Afspelen'}</button>{isFree ? <button className="secondary" disabled={busy || !active} onClick={() => void returnToRound()}>Terug naar sessie</button> : <><button className="secondary" disabled={busy || !loaded || !active || isMetronome(exercise)} onClick={() => { if (!isMetronome(exercise)) void enterFragment(); }}>Fragment oefenen</button><button className="text-button" disabled={busy || !active} onClick={() => move('skip')}>Oefening overslaan</button></>}</div>
      <VolumeControl />
      {isFree && <><div className="audio-settings">{field('Speeltempo BPM', free.bpm, bpm => freeSettings({ bpm }))}{field('Toonhoogte (halve tonen)', free.pitch, pitch => freeSettings({ pitch }))}<button className="secondary" aria-pressed={free.loop} onClick={() => freeSettings({ loop: !free.loop })} disabled={busy}>Loop</button></div><div className="loop-settings">{field('Begin A (seconden)', free.a, a => freeSettings({ a }), .1)}<button className="secondary" disabled={busy} onClick={() => freeSettings({ a: position })}>A hier</button>{field('Einde B (seconden)', free.b, b => freeSettings({ b }), .1)}<button className="secondary" disabled={busy} onClick={() => freeSettings({ b: position })}>B hier</button></div><SaveCurrentFragment exerciseId={exercise.id} start={free.a} end={Math.min(free.b, exercise.duration)} disabled={busy || !active} /></>}
    </div></section>}</>}
    <section className="panel session-times" aria-label="Tijd in deze sessie"><span>Sessie afgespeeld <strong data-testid="time-planned">{durationLabel(times.planned)}</strong></span><span>Fragmenttraining <strong data-testid="time-fragment">{durationLabel(times.fragment)}</strong></span>{hasCountIn(routine) && <span>Aftellen <strong data-testid="time-preparation">{durationLabel(times.preparation)}</strong></span>}<span>Gepauzeerd <strong>{durationLabel(times.pause)}</strong></span></section>
    <p className="caption">{review ? 'Evaluatie: cijfer 1–5 → tempo 1–3 → aantal BPM. Enter bewaart en gaat door.' : 'Spatie: afspelen/pauzeren · 1: herhaling opnieuw, in vrije loop naar A.'} Toetsen blijven beschikbaar voor invoervelden en knoppen. Oefentijd is sessie-afspelen plus fragmenttraining; pauzes, aftellen en evaluaties tellen niet mee. Aftellen begint opnieuw na pauzeren tijdens de aftelmaat, herstarten of terugkeer uit fragmenttraining.</p>
  </div>;
}
