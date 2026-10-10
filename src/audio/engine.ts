import { createStretch } from './stretch';
import type { StretchNode } from 'signalsmith-stretch';

export function validateAudioSettings(rate: number, semitones: number, a: number, b: number, duration: number) {
  if (![rate, semitones, a, b].every(Number.isFinite) || rate < .25 || rate > 3 || Math.abs(semitones) > 12 || a < 0 || b > duration || b - a < .1) throw new Error('Kies een tempo van 25–300%, toonhoogte van −12 tot +12 en een fragment van minstens 0,1 seconde.');
}

export class AudioEngine {
  private context = new AudioContext();
  private gain = this.context.createGain();
  private output = this.context.createGain();
  private node?: StretchNode;
  private anchorTime = 0;
  private anchorPosition = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;
  private segmentStart = 0;
  private segmentEnd: number | null = null;
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
    let value = this.anchorPosition + (this.playing ? (this.context.currentTime - this.anchorTime) * this.rate : 0);
    if (this.loop && value >= this.b) value = this.a + (value - this.a) % (this.b - this.a);
    return Math.max(0, Math.min(this.segmentEnd ?? this.duration, value));
  }
  get ended() { return this.playing && !this.loop && this.position >= (this.segmentEnd ?? this.duration); }
  async load(bytes: ArrayBuffer, normalizationDb: number | null = null) {
    const buffer = await this.context.decodeAudioData(bytes);
    await this.loadBuffer(buffer, normalizationDb);
    return buffer;
  }
  async loadBuffer(buffer: AudioBuffer, normalizationDb: number | null = null) {
    if (this.disposed) return;
    this.node = await createStretch(this.context);
    if (this.disposed) { this.node.disconnect(); return; }
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
    if (normalizationDb !== null) {
      if (!Number.isFinite(normalizationDb) || normalizationDb < -60 || normalizationDb > 12 + 1e-9) throw new Error('Ongeldige volumenormalisatie.');
      let peak = 0; for (const channel of channels) for (const sample of channel) peak = Math.max(peak, Math.abs(sample));
      const gain = Math.min(Math.pow(10, normalizationDb / 20), peak ? Math.pow(10, -1 / 20) / peak : 1);
      await this.node.addBuffers(channels.map(channel => Float32Array.from(channel, sample => sample * gain)));
    } else await this.node.addBuffers(channels);
    this.node.connect(this.gain);
    this.gain.connect(this.output);
    this.output.connect(this.context.destination);
    this.duration = buffer.duration;
    this.b = buffer.duration;
  }
  demo(duration = 8, bpm = 90) {
    const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    const notes = [220, 261.63, 329.63, 392, 329.63, 261.63];
    for (let i = 0; i < channel.length; i++) {
      const time = i / buffer.sampleRate;
      const beat = time * bpm / 60;
      const age = (beat % 1) * 60 / bpm;
      const phase = 2 * Math.PI * notes[Math.floor(beat) % notes.length] * age;
      channel[i] = .28 * Math.min(1, age * 200) * Math.exp(-age * 5) * (Math.sin(phase) + .25 * Math.sin(phase * 2));
    }
    return this.loadBuffer(buffer).then(() => buffer);
  }
  setVolume(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error('Kies een volume van 0–100%.');
    if (this.disposed) return;
    const now = this.context.currentTime;
    this.output.gain.cancelAndHoldAtTime(now);
    // A new or paused player must already be muted before audio starts.
    if (!this.playing || this.ended || this.context.state !== 'running') this.output.gain.setValueAtTime(value, now);
    else this.output.gain.setTargetAtTime(value, now, .005);
  }
  private async schedule() {
    if (!this.node) return;
    this.anchorTime = this.context.currentTime;
    await this.node.schedule({ active: this.playing, input: this.anchorPosition, output: this.anchorTime,
      rate: this.rate, semitones: this.semitones, loopStart: this.loop ? this.a : 0, loopEnd: this.loop ? this.b : 0 });
    // Gate the output on the audio clock, including in background windows.
    this.gain.gain.cancelScheduledValues(this.anchorTime);
    this.gain.gain.setValueAtTime(this.playing ? 1 : 0, this.context.currentTime);
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
  playSegment(a: number, b: number, rate: number, semitones = 0, playing = true) {
    return this.serialize(async () => {
      validateAudioSettings(rate, semitones, a, b, this.duration);
      if (playing) await this.context.resume();
      this.segmentStart = a; this.segmentEnd = b;
      this.a = a; this.b = b; this.rate = rate; this.semitones = semitones; this.loop = false;
      this.anchorPosition = a; this.playing = playing; await this.schedule();
    });
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.playing = false;
    this.node?.disconnect();
    void this.context.close();
  }
}
