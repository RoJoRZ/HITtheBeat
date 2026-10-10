import { estimateTempo } from './bpm';
self.onmessage = (event: MessageEvent<{ samples: Float32Array; sampleRate: number }>) => {
  try { self.postMessage({ result: estimateTempo(event.data.samples, event.data.sampleRate) }); }
  catch { self.postMessage({ error: 'BPM-analyse is niet gelukt. Vul het tempo handmatig in.' }); }
};
