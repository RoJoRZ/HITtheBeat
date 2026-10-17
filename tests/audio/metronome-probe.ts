import { clickPlan, scheduleClick, MetronomeEngine } from '../../src/audio/metronome';

export async function metronomeProbe() {
  const results = [];
  for (const [meter, duration, rate] of [['3/4', 1.5, 1], ['4/4', 2, 2], ['6/8', 1.5, .5]] as const) {
    const sampleRate = 44100, context = new OfflineAudioContext(1, Math.ceil((duration / rate + .1) * sampleRate), sampleRate);
    for (const click of clickPlan(meter, 120, duration)) scheduleClick(context, context.destination, click.position / rate, click.frequency);
    const samples = (await context.startRendering()).getChannelData(0), onsets: number[] = [];
    let silent = true;
    for (let start = 0; start < samples.length; start += 44) {
      const loud = samples.subarray(start, start + 44).some(sample => Math.abs(sample) > .01);
      if (loud && silent) onsets.push(start / sampleRate);
      silent = !loud;
    }
    results.push({ meter, onsets, lastPeak: Math.max(...samples.slice(-2205).map(Math.abs)) });
  }
  // Observe actual engine output; muting before the first scheduled click must stay silent.
  const engine = new MetronomeEngine(1.5, '6/8', 120);
  const internals = engine as unknown as { context: AudioContext; output: GainNode };
  const silence = internals.context.createConstantSource(); silence.offset.value = 0; silence.connect(internals.output); silence.start();
  const analyser = internals.context.createAnalyser(); analyser.fftSize = 4096; internals.output.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const peak = () => { analyser.getFloatTimeDomainData(samples); return Math.max(...samples.map(Math.abs)); };
  const capture = async (ms: number) => { let maximum = 0; const until = performance.now() + ms; do { await wait(5); maximum = Math.max(maximum, peak()); } while (performance.now() < until); return maximum; };
  try {
    engine.setVolume(0); await engine.playSegment(0, 1.5, 1); const muted = await capture(300);
    engine.setVolume(1); await engine.seek(0); const full = await capture(300);
    await engine.pause(); const stoppedAt = engine.position; await wait(50); const pausedPosition = engine.position;
    await wait(100); const paused = peak();
    return { results, muted, full, paused, stoppedAt, pausedPosition };
  } finally { silence.stop(); silence.disconnect(); engine.dispose(); }
}
