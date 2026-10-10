import { AudioEngine } from '../../src/audio/engine';
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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
    await wait(250); const during = rms();
    await wait(850); const after = rms(), end = engine.position, ended = engine.ended;
    await engine.pause();
    await engine.configure(1, 0, .1, .3, true); await engine.seek(.1); await engine.playPause();
    await wait(900);
    return { during, after, end, ended, loopPosition: engine.position, loopEnded: engine.ended, loopRms: rms() };
  } finally { engine.dispose(); }
}
