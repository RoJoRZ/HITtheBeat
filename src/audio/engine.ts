import { createStretch } from './stretch';
import type { StretchNode } from 'signalsmith-stretch';

export function validateAudioSettings(rate: number, semitones: number, a: number, b: number, duration: number) {
  if (![rate, semitones, a, b].every(Number.isFinite) || rate < .5 || rate > 2 || Math.abs(semitones) > 12 || a < 0 || b > duration || b - a < .1) throw new Error('Kies een tempo van 50–200%, toonhoogte van −12 tot +12 en een fragment van minstens 0,1 seconde.');
}

export class AudioEngine {
  private context = new AudioContext();
  private gain = this.context.createGain();
  private node?: StretchNode;
  private anchorTime = 0;
  private anchorPosition = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;
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
    return Math.max(0, Math.min(this.duration, value));
  }
  get ended() { return this.playing && !this.loop && this.position >= this.duration; }
  async load(bytes: ArrayBuffer) {
    const buffer = await this.context.decodeAudioData(bytes);
    await this.loadBuffer(buffer);
    return buffer;
  }
  async loadBuffer(buffer: AudioBuffer) {
    if (this.disposed) return;
    this.node = await createStretch(this.context);
    if (this.disposed) { this.node.disconnect(); return; }
    await this.node.addBuffers(Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i)));
    this.node.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.duration = buffer.duration;
    this.b = buffer.duration;
  }
  demo() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 8, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    const notes = [220, 261.63, 329.63, 392, 329.63, 261.63];
    for (let i = 0; i < channel.length; i++) {
      const time = i / buffer.sampleRate;
      const beat = time * 1.5;
      const age = (beat % 1) / 1.5;
      const phase = 2 * Math.PI * notes[Math.floor(beat) % notes.length] * age;
      channel[i] = .28 * Math.min(1, age * 200) * Math.exp(-age * 5) * (Math.sin(phase) + .25 * Math.sin(phase * 2));
    }
    return this.loadBuffer(buffer).then(() => buffer);
  }
  private async schedule() {
    if (!this.node) return;
    this.anchorTime = this.context.currentTime;
    await this.node.schedule({ active: this.playing, input: this.anchorPosition, output: this.anchorTime,
      rate: this.rate, semitones: this.semitones, loopStart: this.loop ? this.a : 0, loopEnd: this.loop ? this.b : 0 });
    // Gate the output on the audio clock, including in background windows.
    this.gain.gain.cancelScheduledValues(this.anchorTime);
    this.gain.gain.setValueAtTime(this.playing ? 1 : 0, this.context.currentTime);
    if (this.playing && !this.loop) this.gain.gain.setValueAtTime(0, this.anchorTime + (this.duration - this.anchorPosition) / this.rate);
  }
  playPause() {
    return this.serialize(async () => {
      await this.context.resume();
      const ended = this.ended;
      this.anchorPosition = this.position;
      if (ended) this.playing = false;
      this.playing = !this.playing;
      if (this.playing && (this.anchorPosition >= this.duration || (this.loop && (this.anchorPosition < this.a || this.anchorPosition >= this.b)))) this.anchorPosition = this.loop ? this.a : 0;
      await this.schedule();
    });
  }
  seek(position: number) {
    return this.serialize(async () => {
      this.anchorPosition = Math.max(this.loop ? this.a : 0, Math.min(this.loop ? this.b - .001 : this.duration, position));
      await this.schedule();
    });
  }
  configure(rate: number, semitones: number, a: number, b: number, loop: boolean) {
    return this.serialize(async () => {
      validateAudioSettings(rate, semitones, a, b, this.duration);
      const ended = this.ended;
      this.anchorPosition = this.position;
      if (ended) this.playing = false;
      this.rate = rate; this.semitones = semitones; this.a = a; this.b = b; this.loop = loop;
      if (loop && (this.anchorPosition < a || this.anchorPosition >= b)) this.anchorPosition = a;
      await this.schedule();
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
