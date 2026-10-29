import { waitAudio } from './audio-clock';
import { AudioEngine } from '../../src/audio/engine';
export async function segmentProbe() {
  const engine = new AudioEngine();
  // Tap the actual output so the check verifies silence, not just a UI counter.
  const internals = engine as unknown as { context: AudioContext; gain: GainNode };
  const analyser = internals.context.createAnalyser(); analyser.fftSize = 2048;
  const samples = new Float32Array(analyser.fftSize);
  const rms = () => { analyser.getFloatTimeDomainData(samples); return Math.sqrt(samples.reduce((sum, value) => sum + value ** 2, 0) / samples.length); };
  try {
    const buffer = internals.context.createBuffer(1, internals.context.sampleRate * 3, internals.context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) channel[i] = .3 * Math.sin(2 * Math.PI * 440 * i / buffer.sampleRate);
    await engine.loadBuffer(buffer); internals.gain.connect(analyser);
    await engine.playSegment(.2, .6, .5);
    await waitAudio(internals.context,.25); const during = rms();
    await waitAudio(internals.context,.85); const after = rms(), end = engine.position, ended = engine.ended;
    await engine.pause();
    await engine.configure(1, 0, .1, .3, true); await engine.seek(.1); await engine.playPause();
    await waitAudio(internals.context,.9);
    const loopPosition = engine.position, loopEnded = engine.ended, loopRms = rms();
    // A loaded replacement must stop the old playing worklet, even when the new source is silent.
    const silence = internals.context.createBuffer(1, internals.context.sampleRate, internals.context.sampleRate);
    await engine.loadBuffer(silence);
    await engine.playSegment(0, 1, 1);
    await waitAudio(internals.context, .25);
    const replacementRms = rms();
    return { during, after, end, ended, loopPosition, loopEnded, loopRms, replacementRms };
  } finally { engine.dispose(); }
}
