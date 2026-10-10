import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Expand, X } from 'lucide-react';
import { AudioEngine, validateAudioSettings } from '../audio/engine';
import { advance, createRun, current, remainingSeconds, type Run } from '../session/runner';
import type { Exercise, Routine } from '../library/types';
import { NumberField } from './AudioLab';
import { durationLabel } from './controls';
const readable = (reason: unknown) => (reason instanceof Error ? reason.message : 'Afspelen is niet gelukt.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
type Free = { a: number; b: number; bpm: number; pitch: number; loop: boolean };
type Totals = { planned: number; fragment: number; pause: number };

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

export function SessionPlayer({ routine, exercises, active, leave, finished }: { routine: Routine; exercises: Exercise[]; active: boolean; leave: () => void; finished: () => void }) {
  const [run, setRun] = useState(() => createRun(routine, exercises));
  const state = useRef(run), audioRef = useRef<AudioEngine | null>(null), assetId = useRef('');
  const activeRef = useRef(active); activeRef.current = active;
  const generation = useRef(0), locked = useRef(true), alive = useRef(true);
  const [busy, setBusy] = useState(true), [error, setError] = useState(''), [loaded, setLoaded] = useState(false);
  const [position, setPosition] = useState(0), [wave, setWave] = useState<number[]>([]);
  const [free, setFree] = useState<Free>({ a: 0, b: 1, bpm: 90, pitch: 0, loop: true });
  const freeRef = useRef(free), [freePlaying, setFreePlaying] = useState(false);
  const totals = useRef<Totals>({ planned: 0, fragment: 0, pause: 0 }), [times, setTimes] = useState(totals.current);
  const last = useRef<{ audio: AudioEngine; clock: number; bucket: keyof Totals | null; remaining: number } | null>(null);
  const { exercise, step, block } = current(run);
  function commit(next: Run) { if (next.revision !== state.current.revision) { locked.current = true; setBusy(true); } state.current = next; setRun(next); }
  function measure() {
    const audio = audioRef.current; if (!audio) return;
    const before = last.current;
    if (before?.audio === audio && before.bucket) totals.current = { ...totals.current, [before.bucket]: totals.current[before.bucket] + Math.max(0, Math.min(audio.clock - before.clock, before.remaining)) };
    const snapshot = state.current, selection = current(snapshot);
    const bucket = audio.playing && !audio.ended ? snapshot.phase === 'fragment' ? 'fragment' : snapshot.phase === 'playing' ? 'planned' : null : snapshot.phase === 'paused' || snapshot.phase === 'fragment' ? 'pause' : null;
    const end = snapshot.phase === 'fragment' ? audio.duration : selection.step.end ?? audio.duration;
    last.current = { audio, clock: audio.clock, bucket, remaining: bucket === 'pause' || audio.loop ? Infinity : Math.max(0, (end - audio.position) / audio.rate) };
    setTimes(totals.current);
  }
  useEffect(() => {
    alive.current = true;
    const timer = setInterval(() => {
      const audio = audioRef.current; if (!audio) return;
      measure(); setPosition(audio.position); setFreePlaying(audio.playing && !audio.ended);
      if (!locked.current && state.current.phase === 'playing' && audio.ended) commit(advance(state.current, 'ended'));
    }, 50);
    return () => { alive.current = false; generation.current++; clearInterval(timer); audioRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    const snapshot = state.current;
    if (snapshot.phase === 'review' || snapshot.phase === 'complete') { setError(''); setBusy(false); locked.current = false; if (snapshot.phase === 'complete') finished(); return; }
    const selected = current(snapshot), token = ++generation.current;
    locked.current = true; setBusy(true); setError('');
    void (async () => {
      measure(); await audioRef.current?.pause(); measure();
      if (!alive.current || token !== generation.current) return;
      let audio = audioRef.current;
      if (!audio || assetId.current !== selected.block.id || !loaded) {
        audio?.dispose(); audio = new AudioEngine(); audioRef.current = audio; assetId.current = ''; setLoaded(false); setWave([]);
        const bytes = await window.hitthebeat!.readAudio(selected.exercise.id);
        if (!alive.current || token !== generation.current) return;
        const buffer = await audio.load(new Uint8Array(bytes.bytes).buffer);
        if (!alive.current || token !== generation.current) return;
        const data = buffer.getChannelData(0);
        const peaks = Array.from({ length: 220 }, (_, index) => { let peak = 0; for (let i = Math.floor(index * data.length / 220); i < Math.floor((index + 1) * data.length / 220); i++) peak = Math.max(peak, Math.abs(data[i])); return peak; });
        const maximum = Math.max(.001, ...peaks); setWave(peaks.map(value => value / maximum));
        assetId.current = selected.block.id; setLoaded(true);
      }
      await audio.playSegment(selected.step.start ?? 0, selected.step.end ?? audio.duration, selected.step.bpm / selected.exercise.bpm, 0, snapshot.phase === 'playing');
      if (!alive.current || token !== generation.current) return;
      if (!activeRef.current && state.current.phase === 'playing') { await audio.pause(); commit(advance(state.current, 'pause')); }
      setPosition(audio.position); measure();
    })().catch(reason => {
      if (alive.current && token === generation.current) { setError(readable(reason)); setLoaded(false); commit(advance(state.current, 'pause')); }
    }).finally(() => { if (alive.current && token === generation.current) { locked.current = false; setBusy(false); } });
  }, [run.revision]);

  async function operate(task: (audio: AudioEngine) => Promise<void>) {
    const audio = audioRef.current; if (locked.current || !audio || !loaded) return;
    const token = generation.current, revision = state.current.revision;
    locked.current = true; setBusy(true); setError('');
    try { measure(); await task(audio); measure(); if (alive.current) setPosition(audio.position); }
    catch (reason) { if (alive.current) setError(readable(reason)); }
    finally { if (alive.current && token === generation.current && revision === state.current.revision) { locked.current = false; setBusy(false); } }
  }
  const toggle = () => operate(async audio => {
    if (state.current.phase === 'fragment') await audio.playPause();
    else { const wasPlaying = state.current.phase === 'playing'; await audio.playPause(); commit(advance(state.current, wasPlaying ? 'pause' : 'play')); }
  });
  const restart = () => operate(async audio => { await audio.seek(state.current.phase === 'fragment' ? freeRef.current.loop ? freeRef.current.a : 0 : current(state.current).step.start ?? 0); });
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
    freeRef.current = next; setFree(next); setError(''); measure();
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
  useEffect(() => {
    if (active) return;
    void operate(async audio => { await audio.pause(); commit(advance(state.current, 'pause')); });
  }, [active]);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (!active || event.repeat || event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement).closest('input,textarea,select,button,a,[contenteditable],dialog') || !['ready', 'playing', 'paused', 'fragment'].includes(state.current.phase)) return;
      if (event.code === 'Space') { event.preventDefault(); void toggle(); }
      if (event.key === '1') { event.preventDefault(); void restart(); }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  const isFree = run.phase === 'fragment', review = run.phase === 'review', complete = run.phase === 'complete';
  const a = isFree ? free.a : step.start ?? 0, b = isFree ? free.b : step.end ?? exercise.duration;
  const field = (label: string, value: number, change: (value: number) => void, increment = 1) => <NumberField label={label} value={value} change={change} step={increment} disabled={busy || !active} />;
  return <div className="screen-stack session-player">
    <div className="player-context"><span>{routine.title} · Oefening {run.block + 1} van {routine.blocks.length}</span><button className="text-button" onClick={leave}>{complete ? 'Terug naar rondjes' : 'Rondje stoppen'}</button></div>
    <section className="panel round-playlist" aria-label="Oefeningen in dit rondje"><h2>Het hele oefenrondje</h2><ol>{routine.blocks.map((item, index) => <li key={item.id} aria-current={index === run.block && !complete ? 'step' : undefined}><div className="queue-item"><strong>{index + 1}. {exercises.find(source => source.id === item.exerciseId)!.title}</strong><small>{run.statuses[index] === 'completed' ? 'Afgerond' : run.statuses[index] === 'skipped' ? 'Overgeslagen' : index === run.block ? isFree ? 'Huidig · fragmenttraining' : 'Huidige oefening' : 'Hierna'}</small></div></li>)}</ol></section>
    {error && <div role="alert" className="error"><p>{error}</p><button className="secondary" onClick={() => commit({ ...state.current, phase: 'paused', revision: state.current.revision + 1 })}>Audio opnieuw laden</button><button className="text-button" onClick={leave}>Terug naar rondjes</button></div>}
    {complete ? <section className="panel"><h2>{run.statuses.includes('skipped') ? 'Rondje beëindigd' : 'Rondje afgerond'}</h2><p>{run.passes} speelbeurten afgerond. {run.statuses.filter(value => value === 'skipped').length} oefeningen overgeslagen.</p><p>Goed moment om even je handen te ontspannen.</p><button className="primary" onClick={leave}>Terug naar mijn rondjes</button></section> : <><h2 className="session-exercise-title">{exercise.title}</h2><Notation item={exercise} />
    {review ? <section className="panel session-review"><h2>Oefening afgerond</h2><p>De hele opbouw van {exercise.title} is gespeeld. Evaluaties bewaren volgt in de volgende fase.</p><div className="row-actions"><button className="secondary" disabled={busy} onClick={() => move('repeat')}>Deze oefening opnieuw</button><button className="primary" disabled={busy} onClick={() => move('next')}>{run.block + 1 === routine.blocks.length ? 'Rondje afronden' : 'Verder met volgende oefening'}</button></div></section> : <section className="audio-lab audio-embedded" aria-label="Rondjespeler"><div className="player-card" aria-busy={busy}>
      <div className="session-pass"><strong>{isFree ? 'Vrij fragment oefenen' : `Stap ${run.step + 1} van ${block.steps.length} · Herhaling ${run.repetition + 1} van ${step.repetitions}`}</strong><span data-testid="session-bpm">{isFree ? free.bpm : step.bpm} BPM</span></div>
      {!isFree && <p className="caption" data-testid="planned-settings">{step.start === null ? 'Volledige track' : `Fragment ${step.start}–${step.end} seconden`} · Toonhoogte origineel</p>}
      <p className="caption">{busy ? 'Audio voorbereiden…' : isFree ? 'Je plek in het rondje blijft bewaard. Vrije loops tellen niet mee als herhalingen.' : 'De volgende herhaling en stap beginnen automatisch.'}</p>
      <svg className="waveform" viewBox="0 0 880 140" role="img" aria-label="Golfvorm van de oefening" preserveAspectRatio="none"><rect x={a / exercise.duration * 880} y="0" width={(b - a) / exercise.duration * 880} height="140" fill="currentColor" opacity=".12" />{wave.map((peak, index) => <line key={index} x1={index * 4 + 2} x2={index * 4 + 2} y1={70 - Math.max(2, peak * 60)} y2={70 + Math.max(2, peak * 60)} stroke="currentColor" strokeWidth="2" opacity={index / 220 * exercise.duration <= position ? 1 : .38} />)}<line x1={position / exercise.duration * 880} x2={position / exercise.duration * 880} y1="0" y2="140" stroke="#f2f4f6" /></svg>
      <div className="time-row"><span>{durationLabel(position)} / {durationLabel(exercise.duration)}</span><span>Resterend rondje: <strong data-testid="session-remaining">{durationLabel(remainingSeconds(run, position))}</strong></span></div>
      <div className="session-transport"><button className="secondary" aria-label="Terug naar begin van de herhaling" disabled={busy || !loaded || !active} onClick={() => void restart()}><RotateCcw size={20} /></button><button className="primary play-button" disabled={busy || !loaded || !active} onClick={() => void toggle()}>{(isFree ? freePlaying : run.phase === 'playing') ? <Pause size={22} /> : <Play size={22} />}{(isFree ? freePlaying : run.phase === 'playing') ? 'Pauzeren' : 'Afspelen'}</button>{isFree ? <button className="secondary" disabled={busy || !active} onClick={() => void returnToRound()}>Terug naar rondje</button> : <><button className="secondary" disabled={busy || !loaded || !active} onClick={() => void enterFragment()}>Fragment oefenen</button><button className="text-button" disabled={busy || !active} onClick={() => move('skip')}>Oefening overslaan</button></>}</div>
      {isFree && <><div className="audio-settings">{field('Speeltempo BPM', free.bpm, bpm => freeSettings({ bpm }))}{field('Toonhoogte (halve tonen)', free.pitch, pitch => freeSettings({ pitch }))}<button className="secondary" aria-pressed={free.loop} onClick={() => freeSettings({ loop: !free.loop })} disabled={busy}>Loop</button></div><div className="loop-settings">{field('Begin A (seconden)', free.a, a => freeSettings({ a }), .1)}<button className="secondary" disabled={busy} onClick={() => freeSettings({ a: position })}>A hier</button>{field('Einde B (seconden)', free.b, b => freeSettings({ b }), .1)}<button className="secondary" disabled={busy} onClick={() => freeSettings({ b: position })}>B hier</button></div></>}
    </div></section>}</>}
    <section className="panel session-times" aria-label="Tijd in deze sessie"><span>Rondje afgespeeld <strong data-testid="time-planned">{durationLabel(times.planned)}</strong></span><span>Fragmenttraining <strong data-testid="time-fragment">{durationLabel(times.fragment)}</strong></span><span>Gepauzeerd <strong>{durationLabel(times.pause)}</strong></span></section>
    <p className="caption">Spatie: afspelen/pauzeren · 1: herhaling opnieuw, in vrije loop naar A. Toetsen blijven beschikbaar voor invoervelden en knoppen. Tijden en resultaten worden in deze proef nog niet bewaard. Er is nog geen aftellen of extra pauze tussen herhalingen.</p>
  </div>;
}
