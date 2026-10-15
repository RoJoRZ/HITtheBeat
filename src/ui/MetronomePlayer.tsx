import { useEffect, useRef, useState } from 'react';
import type { Exercise } from '../library/types';
import { metronomeSeconds } from '../../electron/exercise-model.mjs';
import { MetronomeEngine } from '../audio/metronome';
import { outputVolume, useOutput } from '../audio/output-volume';
import { VolumeControl } from './VolumeControl';
import { durationLabel } from './controls';

export function MetronomePlayer({ exercise }: { exercise: Exercise }) {
  const engine = useRef<MetronomeEngine | null>(null), output = useOutput();
  const [bpm, setBpm] = useState(exercise.bpm), [playing, setPlaying] = useState(false), [position, setPosition] = useState(0), [error, setError] = useState('');
  const bars = exercise.bars ?? 8;
  const duration = metronomeSeconds(exercise, bars);
  useEffect(() => {
    const audio = new MetronomeEngine(duration, exercise.meter ?? '4/4', exercise.bpm); engine.current = audio; audio.setVolume(outputVolume());
    const timer = setInterval(() => { setPlaying(audio.playing && !audio.ended); setPosition(audio.position); }, 50);
    return () => { clearInterval(timer); audio.dispose(); };
  }, [exercise.id, exercise.bpm, exercise.meter, bars]);
  useEffect(() => { engine.current?.setVolume(outputVolume()); }, [output]);
  const play = async () => { try { const audio = engine.current!; if (audio.playing && !audio.ended) await audio.pause(); else if (audio.position && !audio.ended && audio.rate === bpm / exercise.bpm) await audio.playPause(); else await audio.playSegment(0, duration, bpm / exercise.bpm); setError(''); } catch { setError('De metronoom kon niet starten. Probeer het opnieuw.'); } };
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement).closest('input,textarea,select,button,a,[contenteditable]')) return; if (event.code === 'Space') { event.preventDefault(); void play(); } if (event.key === '1') { event.preventDefault(); void engine.current?.seek(0); } };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  return <section className="panel" aria-label="Metronoomspeler"><h3>Metronoom · {exercise.meter}</h3><p>BPM per kwartnoot · {bars} maten · {durationLabel(duration * exercise.bpm / bpm)}</p><p aria-live="off">{durationLabel(position * exercise.bpm / bpm)}</p><div className="audio-settings"><label>Speeltempo BPM<input type="number" min={20} max={300} value={bpm} onChange={event => { const value = event.target.valueAsNumber; if (value >= 20 && value <= 300) { void engine.current?.pause(); setBpm(value); } }} /></label></div><div className="transport"><button className="primary" onClick={() => void play()}>{playing ? 'Pauzeren' : 'Afspelen'}</button><button className="secondary" onClick={() => void engine.current?.seek(0)}>Terug naar start</button></div><VolumeControl /><p className="caption">Spatie: afspelen/pauzeren · 1: terug naar start. Het aantal maten wijzig je via Bewerken bij deze oefening. Het speeltempo hier wijzigt je opgeslagen sessies niet.</p>{error && <p role="alert" className="error">{error}</p>}</section>;
}
