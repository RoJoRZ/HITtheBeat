import { scheduleClick } from './click';
import type { fitTapTempo } from './tap-tempo.mjs';
type Result = NonNullable<ReturnType<typeof fitTapTempo>>;
/** One disposable local source for the modal; clicks share its audio clock. */
export class TapPlayer {
  private context = new AudioContext();
  private output = this.context.createGain();
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private tones: OscillatorNode[] = [];
  private anchor = 0;
  private disposed = false;
  private generation = 0;
  constructor(private ended: () => void) { this.output.connect(this.context.destination); }
  async load(bytes: ArrayBuffer) {
    const buffer = await this.context.decodeAudioData(bytes);
    if (!this.disposed) this.buffer = buffer;
  }
  setVolume(value: number) { if (!this.disposed) this.output.gain.setValueAtTime(value, this.context.currentTime); }
  tapPosition(eventTime: number) {
    const stamp = this.context.getOutputTimestamp?.();
    const clock = stamp && stamp.performanceTime != null && stamp.contextTime != null && stamp.performanceTime > 0 ? stamp.contextTime + (eventTime - stamp.performanceTime) / 1000 : this.context.currentTime;
    return clock - this.anchor;
  }
  stop() {
    this.generation++;
    if (this.source) { this.source.onended = null; try { this.source.stop(); } catch { /* Already ended. */ } this.source.disconnect(); this.source = null; }
    for (const tone of this.tones) { try { tone.stop(); } catch { /* Already ended. */ } }
    this.tones = [];
  }
  async play(result?: Result) {
    this.stop(); const generation = this.generation;
    await this.context.resume();
    if (this.disposed || !this.buffer || generation !== this.generation) return false;
    const source = this.context.createBufferSource(); source.buffer = this.buffer; source.connect(this.output);
    this.source = source; this.anchor = this.context.currentTime + .05;
    const end = result ? Math.min(this.buffer.duration, result.beatOffset + 16 * 60 / result.bpm) : this.buffer.duration;
    source.onended = () => { if (this.source === source) { this.stop(); this.ended(); } };
    source.start(this.anchor, 0, end);
    if (result) for (let i = 0; i < 16; i++) {
      const at = result.beatOffset + i * 60 / result.bpm;
      if (at >= end) break;
      this.tones.push(scheduleClick(this.context, this.output, this.anchor + at, 1000, Math.min(.035, end - at)));
    }
    return true;
  }
  dispose() { if (this.disposed) return; this.disposed = true; this.stop(); this.output.disconnect(); void this.context.close(); }
}
