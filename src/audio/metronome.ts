import { LocalizedError } from '../../electron/i18n.mjs';
import { scheduleClick } from './click.ts';
export { scheduleClick } from './click.ts';
import { scheduleCountIn, type CountIn } from './count-in.ts';
import { meterBeats } from '../../electron/exercise-model.mjs';

/** Finite click schedule on the audio clock; quarter-note BPM, also in compound meters. */
export function clickPlan(meter: string, bpm: number, duration: number) {
  const beats = meterBeats(meter), interval = 60 / bpm * (meter === '6/8' ? .5 : 1);
  const count = Math.round(duration / interval);
  return Array.from({ length: count }, (_, index) => ({ position: index * interval, frequency: index % beats === 0 ? 1800 : meter === '6/8' && index % beats === 3 ? 1400 : 1000 }));
}


export class MetronomeEngine {
  private context = new AudioContext();
  private output = this.context.createGain();
  private anchorTime = 0;
  private anchorPosition = 0;
  private end = 0;
  private tones: OscillatorNode[] = [];
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;
  playing = false;
  rate = 1;
  loop = false;
  duration: number;
  private meter: string;
  private bpm: number;
  constructor(duration: number, meter: string, bpm: number) { this.duration = duration; this.meter = meter; this.bpm = bpm; this.end = duration; this.output.connect(this.context.destination); }
  get playbackStart() { return this.anchorTime; }
  get countRemaining() { return this.playing ? Math.max(0, this.anchorTime - this.clock) : 0; }
  get counting() { return this.countRemaining > 0; }
  get clock() { return this.context.currentTime; }
  get position() { return Math.min(this.end, this.anchorPosition + (this.playing ? Math.max(0, this.clock - this.anchorTime) * this.rate : 0)); }
  get ended() { return this.playing && this.position >= this.end; }
  setVolume(value: number) { if (!Number.isFinite(value) || value < 0 || value > 1) throw new LocalizedError("Kies een volume van 0–100%."); if (!this.disposed) { this.output.gain.cancelAndHoldAtTime(this.clock); if (!this.playing || this.ended || this.context.state !== 'running') this.output.gain.setValueAtTime(value, this.clock); else this.output.gain.setTargetAtTime(value, this.clock, .005); } }
  private serialize(action: () => Promise<void>) { const result = this.queue.then(async () => { if (!this.disposed) await action(); }); this.queue = result.catch(() => {}); return result; }
  private cancel() { for (const tone of this.tones) { try { tone.stop(); } catch { /* Already ended. */ } } this.tones = []; }
  private schedule(countIn?: CountIn) {
    this.cancel(); const now = this.clock; this.anchorTime = now;
    if (!this.playing) return;
    const lead = scheduleCountIn(this.context, this.output, countIn, this.bpm * this.rate, now);
    this.tones.push(...lead.nodes); this.anchorTime += lead.seconds;
    for (const click of clickPlan(this.meter, this.bpm, this.duration)) {
      if (click.position < this.anchorPosition - 1e-8 || click.position >= this.end - 1e-8) continue;
      const at = this.anchorTime + Math.max(0, click.position - this.anchorPosition) / this.rate;
      const length = Math.min(.035, (this.end - click.position) / this.rate);
      this.tones.push(scheduleClick(this.context, this.output, at, click.frequency, length));
    }
  }
  playPause() { return this.serialize(async () => { await this.context.resume(); const ended = this.ended; this.anchorPosition = ended ? 0 : this.position; this.playing = ended || !this.playing; this.schedule(); }); }
  pause() { return this.serialize(async () => { this.anchorPosition = this.position; this.playing = false; this.schedule(); }); }
  seek(value: number) { return this.serialize(async () => { this.anchorPosition = Math.max(0, Math.min(this.end, value)); this.schedule(); }); }
  playSegment(a: number, b: number, rate: number, pitch = 0, playing = true, countIn?: CountIn, _countBpm?: number, _metronomeOnly?: boolean) {
    return this.serialize(async () => {
      if (a !== 0 || b !== this.duration || pitch !== 0 || !Number.isFinite(rate) || rate <= 0) throw new LocalizedError("Ongeldige metronoomstap.");
      if (playing) await this.context.resume();
      this.end = b; this.rate = rate; this.anchorPosition = 0; this.playing = playing; this.schedule(countIn);
    });
  }
  async configure() { throw new LocalizedError("Een metronoom heeft geen audiofragment of toonhoogte."); }
  dispose() { if (this.disposed) return; this.disposed = true; this.playing = false; this.cancel(); void this.context.close(); }
}
