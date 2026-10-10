import { normalizationLevel } from '../audio/normalization';
import type { TempoEstimate } from '../audio/bpm';

export async function analyzeAudio(bytes: ArrayBuffer, signal: AbortSignal) {
  const context = new OfflineAudioContext(2, 1, 44100);
  let buffer: AudioBuffer;
  try { buffer = await context.decodeAudioData(bytes); }
  catch { throw new Error('Deze MP3 kan niet worden gelezen. Kies een ander bestand.'); }
  if (signal.aborted) throw new DOMException('Geannuleerd', 'AbortError');
  if (buffer.duration < .1) throw new Error('De audiotrack is te kort.');
  const normalization = normalizationLevel(Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index)), buffer.sampleRate);
  if (signal.aborted) throw new DOMException('Geannuleerd', 'AbortError');
  const length = Math.min(buffer.length, buffer.sampleRate * 90);
  const samples = new Float32Array(length);
  // Choose the loudest channel to avoid cancellation between stereo channels.
  let bestChannel = 0, bestEnergy = -1;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c); let sum = 0;
    for (let i = 0; i < length; i += 8) sum += data[i] ** 2;
    if (sum > bestEnergy) { bestChannel = c; bestEnergy = sum; }
  }
  samples.set(buffer.getChannelData(bestChannel).subarray(0, length));
  const estimate = await new Promise<TempoEstimate>((resolve, reject) => {
    const worker = new Worker(new URL('../audio/bpm.worker.ts', import.meta.url), { type: 'module' });
    const finish = () => { clearTimeout(timer); worker.terminate(); signal.removeEventListener('abort', abort); };
    const abort = () => { finish(); reject(new DOMException('Geannuleerd', 'AbortError')); };
    const timer = setTimeout(() => { finish(); resolve({ bpm: null, strength: 0 }); }, 20_000);
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = event => { finish(); resolve(event.data.result ?? { bpm: null, strength: 0 }); };
    worker.onerror = () => { finish(); resolve({ bpm: null, strength: 0 }); };
    worker.postMessage({ samples, sampleRate: buffer.sampleRate }, [samples.buffer]);
  });
  return { duration: buffer.duration, estimate, normalization };
}
