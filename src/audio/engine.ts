import { LocalizedError } from '../../electron/i18n.mjs';
import { scheduleCountIn, type CountIn } from './count-in';
import { createStretch } from './stretch';
import type { StretchNode } from 'signalsmith-stretch';

export function validateAudioSettings(rate: number, semitones: number, a: number, b: number, duration: number) {
  if (![rate, semitones, a, b].every(Number.isFinite) || rate < .25 || rate > 3 || Math.abs(semitones) > 12 || a < 0 || b > duration || b - a < .1) throw new LocalizedError("Kies een tempo van 25–300%, toonhoogte van −12 tot +12 en een fragment van minstens 0,1 seconde.");
}

export class AudioEngine {
  private context = new AudioContext();
  private countTones: OscillatorNode[] = [];
  private gain = this.context.createGain();
  private output = this.context.createGain();
  private node?: StretchNode;
  private anchorTime = 0;
  private anchorPosition = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;
  constructor() {
    this.gain.connect(this.output);
    this.output.connect(this.context.destination);
  }
  private segmentStart = 0;
  private segmentEnd: number | null = null;
  get playbackStart() { return this.anchorTime; }
  get countRemaining() { return this.playing ? Math.max(0, this.anchorTime - this.clock) : 0; }
  get counting() { return this.countRemaining > 0; }
  get clock() { return this.context.currentTime; }
  duration = 0;
  playing = false;
  rate = 1;
  semitones = 0;
  loop = false;
  a = 0;
  b = 0;

  private serialize(action: () => Promise<void>) {
    const result = this.queue.then(async () => { if (!this.disposed) await action(); });
    this.queue = result.catch(() => {});
    return result;
  }
  get position() {
    let value = this.anchorPosition + (this.playing ? Math.max(0, this.context.currentTime - this.anchorTime) * this.rate : 0);
    if (this.loop && value >= this.b) value = this.a + (value - this.a) % (this.b - this.a);
    return Math.max(0, Math.min(this.segmentEnd ?? this.duration, value));
  }
  get ended() { return this.playing && !this.loop && this.position >= (this.segmentEnd ?? this.duration); }
  async load(bytes: ArrayBuffer, normalizationDb: number | null = null) {
    const buffer = await this.context.decodeAudioData(bytes);
    await this.loadBuffer(buffer, normalizationDb);
    return buffer;
  }
  loadBuffer(buffer: AudioBuffer, normalizationDb: number | null = null) {
    return this.serialize(async () => {
      if (normalizationDb !== null && (!Number.isFinite(normalizationDb) || normalizationDb < -60 || normalizationDb > 12 + 1e-9)) throw new LocalizedError("Ongeldige volumenormalisatie.");
      // Replace ownership atomically: a previous worklet must never remain audible.
      this.playing = false; this.cancelCountIn();
      this.gain.gain.cancelScheduledValues(this.clock); this.gain.gain.setValueAtTime(0, this.clock);
      this.node?.disconnect(); this.node = undefined;
      const node = await createStretch(this.context);
      try {
        if (this.disposed) return;
        const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
        if (normalizationDb !== null) {
          let peak = 0; for (const channel of channels) for (const sample of channel) peak = Math.max(peak, Math.abs(sample));
          const gain = Math.min(Math.pow(10, normalizationDb / 20), peak ? Math.pow(10, -1 / 20) / peak : 1);
          await node.addBuffers(channels.map(channel => Float32Array.from(channel, sample => sample * gain)));
        } else await node.addBuffers(channels);
        if (this.disposed) return;
        this.node = node; node.connect(this.gain);
        this.duration = buffer.duration; this.b = buffer.duration;
        this.anchorPosition = 0; this.segmentStart = 0; this.segmentEnd = null; this.loop = false;
      } finally { if (this.node !== node) node.disconnect(); }
    });
  }
  setVolume(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new LocalizedError("Kies een volume van 0–100%.");
    if (this.disposed) return;
    const now = this.context.currentTime;
    this.output.gain.cancelAndHoldAtTime(now);
    // A new or paused player must already be muted before audio starts.
    if (!this.playing || this.ended || this.context.state !== 'running') this.output.gain.setValueAtTime(value, now);
    else this.output.gain.setTargetAtTime(value, now, .005);
  }
  private cancelCountIn() { for (const tone of this.countTones) { try { tone.stop(); } catch { /* Already ended. */ } } this.countTones = []; }
  private async schedule(countIn?: CountIn, countBpm = 1) {
    this.cancelCountIn();
    if (this.disposed || !this.node) return;
    const now = this.context.currentTime;
    const lead = this.playing ? scheduleCountIn(this.context, this.output, countIn, countBpm, now) : { seconds: 0, nodes: [] };
    this.countTones = lead.nodes; this.anchorTime = now + lead.seconds;
    if (lead.seconds || !this.playing) { this.gain.gain.cancelScheduledValues(now); this.gain.gain.setValueAtTime(0, now); }
    try { await this.node.schedule({ active: this.playing, input: this.anchorPosition, output: this.anchorTime,
      rate: this.rate, semitones: this.semitones, loopStart: this.loop ? this.a : 0, loopEnd: this.loop ? this.b : 0 }); }
    catch (reason) { this.cancelCountIn(); this.playing = false; throw reason; }
    if (this.disposed) return;
    // Gate the output on the audio clock, including in background windows.
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.playing && !lead.seconds ? 1 : 0, this.context.currentTime);
    if (this.playing && lead.seconds) this.gain.gain.setValueAtTime(1, this.anchorTime);
    if (this.playing && !this.loop) this.gain.gain.setValueAtTime(0, this.anchorTime + ((this.segmentEnd ?? this.duration) - this.anchorPosition) / this.rate);
  }
  playPause() {
    return this.serialize(async () => {
      await this.context.resume();
      const ended = this.ended;
      this.anchorPosition = this.position;
      if (ended) this.playing = false;
      this.playing = !this.playing;
      if (this.playing && (this.anchorPosition >= (this.segmentEnd ?? this.duration) || (this.loop && (this.anchorPosition < this.a || this.anchorPosition >= this.b)))) this.anchorPosition = this.loop ? this.a : this.segmentStart;
      await this.schedule();
    });
  }
  seek(position: number) {
    return this.serialize(async () => {
      this.anchorPosition = Math.max(this.loop ? this.a : this.segmentStart, Math.min(this.loop ? this.b - .001 : this.segmentEnd ?? this.duration, position));
      await this.schedule();
    });
  }
  configure(rate: number, semitones: number, a: number, b: number, loop: boolean) {
    return this.serialize(async () => {
      validateAudioSettings(rate, semitones, a, b, this.duration);
      const ended = this.ended;
      this.anchorPosition = this.position;
      if (ended) this.playing = false;
      this.segmentStart = 0; this.segmentEnd = null;
      this.rate = rate; this.semitones = semitones; this.a = a; this.b = b; this.loop = loop;
      if (loop && (this.anchorPosition < a || this.anchorPosition >= b)) this.anchorPosition = a;
      await this.schedule();
    });
  }
  pause() {
    return this.serialize(async () => {
      this.anchorPosition = this.position; this.playing = false; await this.schedule();
    });
  }
  playSegment(a: number, b: number, rate: number, semitones = 0, playing = true, countIn?: CountIn, countBpm = 1) {
    return this.serialize(async () => {
      validateAudioSettings(rate, semitones, a, b, this.duration);
      if (playing) await this.context.resume();
      this.segmentStart = a; this.segmentEnd = b;
      this.a = a; this.b = b; this.rate = rate; this.semitones = semitones; this.loop = false;
      this.anchorPosition = a; this.playing = playing; await this.schedule(countIn, countBpm);
    });
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.playing = false;
    this.cancelCountIn();
    this.gain.disconnect(); this.output.disconnect();
    this.node?.disconnect();
    void this.context.close();
  }
}
