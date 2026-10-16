import { bpmText } from '../../electron/tempo-display.mjs';
import { WaveformEditor } from './WaveformEditor';
import { buildWaveform, type Waveform } from '../audio/waveform.mjs';
import { outputVolume, useOutput } from '../audio/output-volume';
import { SaveCurrentFragment } from './FragmentControls';
import { VolumeControl } from './VolumeControl';
import { useEffect, useId, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Repeat2, Minus, Plus } from 'lucide-react';
import type { Exercise } from '../library/types';
import { AudioEngine, validateAudioSettings } from '../audio/engine';

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function NumberField({ label, value, change, disabled, step }: { label: string; value: number; change: (value: number) => void; disabled: boolean; step: number }) {
  const id = useId();
  const tempo = label.includes('BPM');
  const formatted = tempo ? bpmText(value) : String(Number(value.toFixed(3)));
  const edited = useRef(false);
  const [draft, setDraft] = useState(formatted);
  useEffect(() => { setDraft(formatted); edited.current = false; }, [formatted]);
  return <div className="audio-number-field"><label htmlFor={id}>{label}</label><div className="audio-stepper"><button type="button" className="adjust" aria-label={`${label} verlagen`} disabled={disabled} onClick={() => change((tempo ? Math.round(value) : value) - step)}><Minus size={16} /></button><input id={id} type="number" step={step} value={draft} disabled={disabled} onChange={event => { edited.current = true; setDraft(event.target.value); }} onBlur={() => { if (edited.current) change(draft.trim() ? tempo ? Math.round(Number(draft)) : Number(draft) : NaN); edited.current = false; setDraft(formatted); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><button type="button" className="adjust" aria-label={`${label} verhogen`} disabled={disabled} onClick={() => change((tempo ? Math.round(value) : value) + step)}><Plus size={16} /></button></div></div>;
}

export function AudioLab({ saved, onFragmentSaved }: { saved: Exercise; onFragmentSaved?: (item: Exercise) => void }) {
  const originalBpm = saved.bpm;
  const output = useOutput();
  const engine = useRef<AudioEngine | null>(null);
  const generation = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [wave, setWave] = useState<Waveform | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState(90);
  const [target, setTarget] = useState(90);
  const [pitch, setPitch] = useState(0);
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [loop, setLoop] = useState(false);
  const configuration = useRef({ source: 90, target: 90, pitch: 0, a: 0, b: 0, loop: false });

  useEffect(() => {
    const timer = setInterval(() => {
      const audio = engine.current;
      if (audio) { setPosition(audio.position); setPlaying(audio.playing && !audio.ended); }
    }, 50);
    return () => { clearInterval(timer); generation.current++; engine.current?.dispose(); };
  }, []);

  useEffect(() => { engine.current?.setVolume(outputVolume()); }, [output]);
  const command = (operation: Promise<unknown> | undefined) => { void operation?.catch(reason => setError(reason instanceof Error ? reason.message : 'Afspelen is niet gelukt.')); };
  const toggle = () => command(engine.current?.playPause());
  const restart = () => command(engine.current?.seek(loop ? a : 0));
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || !duration || busy) return;
      if ((event.target as HTMLElement).closest('input, textarea, select, button, a, [contenteditable]')) return;
      if (event.code === 'Space') { event.preventDefault(); toggle(); }
      if (event.key === '1') { event.preventDefault(); restart(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function load() {
    const id = ++generation.current;
    engine.current?.dispose();
    const audio = new AudioEngine();
    engine.current = audio; audio.setVolume(outputVolume());
    setBusy(true); setError(''); setDuration(0); setName(''); setWave(null); setPlaying(false); setPosition(0);
    try {
      const buffer = await audio.load(new Uint8Array((await window.hitthebeat!.readAudio(saved.id)).bytes).buffer, saved.normalizeAudio !== false ? saved.normalizationDb ?? null : null);
      if (id !== generation.current) return;
      setWave(buildWaveform(Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i)), buffer.sampleRate));
      setName(saved.audioName); setDuration(buffer.duration);
      setA(0); setB(buffer.duration); setLoop(false); setSource(originalBpm); setTarget(originalBpm); setPitch(0);
      configuration.current = { source: originalBpm, target: originalBpm, pitch: 0, a: 0, b: buffer.duration, loop: false };
    } catch (reason) {
      audio.dispose();
      if (id === generation.current) setError(reason instanceof Error ? reason.message : 'Dit audiobestand kan niet worden geopend.');
    } finally { if (id === generation.current) setBusy(false); }
  }
  useEffect(() => { void load(); }, [saved.id, saved.bpm, saved.normalizationDb, saved.normalizeAudio]);

  function settings(next: { source?: number; target?: number; pitch?: number; a?: number; b?: number; loop?: boolean }) {
    const values = { ...configuration.current, ...next };
    if (!(values.source > 0) || !(values.target > 0)) { setError('Vul een BPM groter dan nul in.'); return; }
    const audio = engine.current;
    if (!audio) return;
    try { validateAudioSettings(values.target / values.source, values.pitch, values.a, values.b, audio.duration); }
    catch (reason) { setError((reason as Error).message); return; }
    configuration.current = values;
    setSource(values.source); setTarget(values.target); setPitch(values.pitch); setA(values.a); setB(values.b); setLoop(values.loop); setError('');
    command(audio.configure(values.target / values.source, values.pitch, values.a, values.b, values.loop));
  }
  async function selectFragment(range: { a: number; b: number }, preview = false) {
    const audio = engine.current; if (!audio || busy) return;
    setBusy(true); setError('');
    try {
      await audio.pause(); settings({ ...range, loop: true }); await audio.seek(range.a);
      if (preview) await audio.playPause();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Fragment afspelen is niet gelukt.'); }
    finally { if (engine.current === audio) setBusy(false); }
  }
  const field = (label: string, value: number, change: (value: number) => void, step = 1) => <NumberField label={label} value={value} change={change} disabled={!duration || busy} step={step} />;
  return <section className="audio-lab audio-embedded" aria-label="Oefeningspeler">
    {error && <p role="alert" className="error">{error}</p>}
    <div className="player-card" aria-busy={busy}>
      <p className="eyebrow">SPELER · EIGEN OEFENING</p><h2>{busy ? 'Audio laden…' : name || 'Kies een track om te beginnen'}</h2>
      <WaveformEditor wave={wave} duration={duration} position={position} a={a} b={b} disabled={!duration || busy} select={range => void selectFragment(range)} preview={() => void selectFragment({ a, b }, true)} label="Golfvorm van de track" />
      <input className="seek" aria-label="Afspeelpositie" type="range" min="0" max={duration || 1} step="0.01" value={position} disabled={!duration || busy} onChange={event => command(engine.current?.seek(event.target.valueAsNumber))} />
      <div className="time-row"><span>{time(position)}</span><span>{time(duration)} · bij dit tempo {time(duration * source / target)}</span></div>
      <div className="playback-controls"><div className="transport"><button className="secondary" aria-label="Terug naar start" disabled={!duration || busy} onClick={restart}><RotateCcw size={21} /></button><button className="primary play-button" disabled={!duration || busy} onClick={toggle}>{playing ? <Pause size={23} /> : <Play size={23} />}{playing ? 'Pauzeren' : 'Afspelen'}</button><button className="secondary" aria-pressed={loop} disabled={!duration || busy} onClick={() => settings({ loop: !loop })}><Repeat2 size={21} /> Loop</button></div>
      <div className="audio-settings">{field('Speeltempo BPM', target, value => settings({ target: value }))}{field('Toonhoogte (halve tonen)', pitch, value => settings({ pitch: value }))}</div></div>
      <VolumeControl />
      <div className="loop-settings">{field('Begin A (seconden)', a, value => settings({ a: value }), .1)}<button className="secondary" disabled={!duration || busy} onClick={() => settings({ a: position })}>A hier</button>{field('Einde B (seconden)', b, value => settings({ b: value }), .1)}<button className="secondary" disabled={!duration || busy} onClick={() => settings({ b: position })}>B hier</button></div>
      <SaveCurrentFragment exerciseId={saved.id} start={a} end={Math.min(b, saved.duration)} disabled={!duration || busy} saved={onFragmentSaved} />
    </div>
    <aside className="audio-note"><strong>Oefen in je eigen tempo</strong><p>Spatie: afspelen / pauzeren · 1: terug naar start (bij een loop naar A). Klik eerst buiten een invoerveld of knop om deze toetsen te gebruiken.</p><p>Origineel tempo: {bpmText(saved.bpm)} BPM. Pas dit aan via Bewerken. Bevestig getallen met Enter of verlaat het veld. Tempo: 25–300% · toonhoogte: −12 tot +12 halve tonen. Deze oefening is opgeslagen in je lokale bibliotheek.</p></aside>
  </section>;
}
