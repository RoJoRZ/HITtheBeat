import { useEffect, useId, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Repeat2, Upload, Minus, Plus } from 'lucide-react';
import type { Exercise } from '../library/types';
import { AudioEngine, validateAudioSettings } from '../audio/engine';

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function NumberField({ label, value, change, disabled, step }: { label: string; value: number; change: (value: number) => void; disabled: boolean; step: number }) {
  const id = useId();
  const formatted = String(Number(value.toFixed(3)));
  const [draft, setDraft] = useState(formatted);
  useEffect(() => setDraft(formatted), [formatted]);
  return <div className="audio-number-field"><label htmlFor={id}>{label}</label><div className="audio-stepper"><button type="button" className="adjust" aria-label={`${label} verlagen`} disabled={disabled} onClick={() => change(value - step)}><Minus size={16} /></button><input id={id} type="number" step={step} value={draft} disabled={disabled} onChange={event => setDraft(event.target.value)} onBlur={() => { change(draft.trim() ? Number(draft) : NaN); setDraft(formatted); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><button type="button" className="adjust" aria-label={`${label} verhogen`} disabled={disabled} onClick={() => change(value + step)}><Plus size={16} /></button></div></div>;
}

export interface DemoAudio { id: string; title: string; bpm: number; duration: number }
export function AudioLab({ demo, saved }: { demo?: DemoAudio; saved?: Exercise }) {
  const embedded = Boolean(demo || saved);
  const originalBpm = saved?.bpm ?? demo?.bpm ?? 90;
  const engine = useRef<AudioEngine | null>(null);
  const generation = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [wave, setWave] = useState<number[]>([]);
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

  async function load(file?: File) {
    const id = ++generation.current;
    engine.current?.dispose();
    const audio = new AudioEngine();
    engine.current = audio;
    setBusy(true); setError(''); setDuration(0); setName(''); setWave([]); setPlaying(false); setPosition(0);
    try {
      if (file && file.size > 50 * 1024 * 1024) throw new Error('Kies voor deze proef een bestand van maximaal 50 MB.');
      const buffer = saved ? await audio.load(new Uint8Array((await window.hitthebeat!.readAudio(saved.id)).bytes).buffer) : file ? await audio.load(await file.arrayBuffer()) : await audio.demo(demo?.duration, demo?.bpm);
      if (id !== generation.current) return;
      const data = buffer.getChannelData(0);
      const peaks = Array.from({ length: 220 }, (_, i) => {
        const begin = Math.floor(i * data.length / 220), end = Math.floor((i + 1) * data.length / 220);
        let peak = 0;
        for (let j = begin; j < end; j++) peak = Math.max(peak, Math.abs(data[j]));
        return peak;
      });
      const max = Math.max(.001, ...peaks);
      setWave(peaks.map(value => value / max));
      setName(saved?.audioName ?? file?.name ?? (demo ? `Voorbeeldaudio · ${demo.bpm} BPM` : 'Voorbeeldmelodie · 90 BPM')); setDuration(buffer.duration);
      setA(0); setB(buffer.duration); setLoop(false); setSource(originalBpm); setTarget(originalBpm); setPitch(0);
      configuration.current = { source: originalBpm, target: originalBpm, pitch: 0, a: 0, b: buffer.duration, loop: false };
    } catch (reason) {
      audio.dispose();
      if (id === generation.current) setError(reason instanceof Error ? reason.message : 'Dit audiobestand kan niet worden geopend.');
    } finally { if (id === generation.current) setBusy(false); }
  }
  useEffect(() => { if (demo || saved) void load(); }, [demo?.id, saved?.id, saved?.updatedAt]);

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
  const field = (label: string, value: number, change: (value: number) => void, step = 1) => <NumberField label={label} value={value} change={change} disabled={!duration || busy} step={step} />;
  return <section className={`audio-lab${embedded ? ' audio-embedded' : ''}`} aria-label="Audioproef">
    {!embedded && <div className="audio-import"><div><h2>Luister. Vertraag. Herhaal.</h2><p>Probeer de speler met je eigen MP3 of WAV.</p></div><div className="import-actions"><button className="secondary" disabled={busy} onClick={() => void load()}>Voorbeeldmelodie laden</button><label className="primary file-button"><Upload size={18} /> Bestand kiezen<input aria-label="Audiobestand kiezen" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) void load(file); event.target.value = ''; }} /></label></div></div>}
    {error && <p role="alert" className="error">{error}</p>}
    <div className="player-card" aria-busy={busy}>
      <p className="eyebrow">{saved ? 'SPELER · EIGEN OEFENING' : demo ? 'SPELER · VOORBEELDAUDIO' : 'FASE 1 · AUDIOPROEF'}</p><h2>{busy ? 'Audio laden…' : name || 'Kies een track om te beginnen'}</h2>
      <svg className="waveform" viewBox="0 0 880 140" role="img" aria-label="Golfvorm van de track" preserveAspectRatio="none">
        <rect x={duration ? a / duration * 880 : 0} y="0" width={duration ? (b - a) / duration * 880 : 880} height="140" fill="currentColor" opacity={loop ? .12 : .04} />
        {wave.map((peak, i) => <line key={i} x1={i * 4 + 2} x2={i * 4 + 2} y1={70 - Math.max(2, peak * 60)} y2={70 + Math.max(2, peak * 60)} stroke="currentColor" strokeWidth="2" opacity={i / wave.length * duration <= position ? 1 : .38} />)}
        <line x1={duration ? position / duration * 880 : 0} x2={duration ? position / duration * 880 : 0} y1="0" y2="140" stroke="#f2f4f6" />
      </svg>
      <input className="seek" aria-label="Afspeelpositie" type="range" min="0" max={duration || 1} step="0.01" value={position} disabled={!duration || busy} onChange={event => command(engine.current?.seek(event.target.valueAsNumber))} />
      <div className="time-row"><span>{time(position)}</span><span>{time(duration)} · bij dit tempo {time(duration * source / target)}</span></div>
      <div className="playback-controls"><div className="transport"><button className="secondary" aria-label="Terug naar start" disabled={!duration || busy} onClick={restart}><RotateCcw size={21} /></button><button className="primary play-button" disabled={!duration || busy} onClick={toggle}>{playing ? <Pause size={23} /> : <Play size={23} />}{playing ? 'Pauzeren' : 'Afspelen'}</button><button className="secondary" aria-pressed={loop} disabled={!duration || busy} onClick={() => settings({ loop: !loop })}><Repeat2 size={21} /> Loop</button></div>
      <div className="audio-settings">{!embedded && field('Origineel BPM', source, value => settings({ source: value }))}{field('Speeltempo BPM', target, value => settings({ target: value }))}{field('Toonhoogte (halve tonen)', pitch, value => settings({ pitch: value }))}</div></div>
      <div className="loop-settings">{field('Begin A (seconden)', a, value => settings({ a: value }), .1)}<button className="secondary" disabled={!duration || busy} onClick={() => settings({ a: position })}>A hier</button>{field('Einde B (seconden)', b, value => settings({ b: value }), .1)}<button className="secondary" disabled={!duration || busy} onClick={() => settings({ b: position })}>B hier</button></div>
    </div>
    <aside className="audio-note"><strong>{saved ? 'Oefen in je eigen tempo' : demo ? 'Voorbeeldaudio, vrij te bedienen' : 'Even proberen'}</strong><p>Spatie: afspelen / pauzeren · 1: terug naar start (bij een loop naar A). Klik eerst buiten een invoerveld of knop om deze toetsen te gebruiken.</p><p>{saved ? `Origineel tempo: ${saved.bpm} BPM. Pas dit aan via Bewerken.` : demo ? 'De melodie dient om de bediening te proberen en hoort niet bij de getoonde tablatuur.' : 'Origineel BPM vul je in deze proef zelf in.'} Bevestig getallen met Enter of verlaat het veld. Tempo: 25–300% · toonhoogte: −12 tot +12 halve tonen. {saved ? 'Deze oefening is opgeslagen in je lokale bibliotheek.' : 'Deze proef slaat het bestand niet op.'}</p></aside>
  </section>;
}
