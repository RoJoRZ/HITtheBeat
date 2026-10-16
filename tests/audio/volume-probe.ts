import { waitAudio } from './audio-clock';
import { AudioEngine } from '../../src/audio/engine';
import { normalizationLevel } from '../../src/audio/normalization';
export async function volumeProbe() {
  async function measure(amplitude: number) {
    const engine = new AudioEngine();
    const internals = engine as unknown as { context: AudioContext; output: GainNode };
    const analyser = internals.context.createAnalyser(); analyser.fftSize = 8192;
    const samples = new Float32Array(analyser.fftSize);
    const rms = () => { analyser.getFloatTimeDomainData(samples); return Math.sqrt(samples.reduce((sum, value) => sum + value ** 2, 0) / samples.length); };
    try {
      const buffer = internals.context.createBuffer(1, internals.context.sampleRate * 4, internals.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i++) channel[i] = amplitude * Math.sin(2 * Math.PI * 440 * i / buffer.sampleRate);
      const level = normalizationLevel([channel], buffer.sampleRate);
      await engine.loadBuffer(buffer, level.db); internals.output.connect(analyser);
      engine.setVolume(0);
      await engine.playSegment(.2, 2.2, 1);
      await waitAudio(internals.context,0.2); const initialMuted = rms(); engine.setVolume(1);
      await waitAudio(internals.context,0.3); const full = rms();
      engine.setVolume(.5); await waitAudio(internals.context,0.25); const half = rms();
      engine.setVolume(0); await waitAudio(internals.context,0.25); const muted = rms();
      engine.setVolume(.5); await waitAudio(internals.context,0.25); const restored = rms();
      // Changing volume near the end must not cancel the scheduled B gate.
      await engine.playSegment(.2, .6, .5); await waitAudio(internals.context,0.2); engine.setVolume(.75);
      await waitAudio(internals.context,1); const afterEnd = rms();
      await engine.configure(2, 3, .1, .4, true); await engine.seek(.1); await engine.playPause();
      await waitAudio(internals.context,0.3); const loop = rms(); engine.setVolume(0); await waitAudio(internals.context,0.25); const loopMuted = rms();
      return { initialMuted, full, half, muted, restored, afterEnd, loop, loopMuted };
    } finally { engine.dispose(); }
  }
  return { quiet: await measure(.05), loud: await measure(.5) };
}
