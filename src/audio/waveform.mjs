import { LocalizedError } from '../../electron/i18n.mjs';
/** @typedef {{levels:Float32Array[],binSeconds:number,duration:number}} Waveform */
/** Compact peak pyramid preserving transients in every channel.
 * @param {Float32Array[]} channels @param {number} sampleRate @returns {Waveform}
 */
export function buildWaveform(channels, sampleRate) {
  const length = channels[0]?.length ?? 0;
  if (!length || !Number.isFinite(sampleRate) || sampleRate <= 0 || channels.some(channel => channel.length !== length)) throw new LocalizedError("Ongeldige audiodata.");
  const size = Math.max(1, Math.ceil(length / 65536)), base = new Float32Array(Math.ceil(length / size));
  let maximum = .001;
  for (const channel of channels) for (let i = 0; i < channel.length; i++) { const value = Math.abs(channel[i]), bin = Math.floor(i / size); if (value > base[bin]) base[bin] = value; maximum = Math.max(maximum, value); }
  for (let i = 0; i < base.length; i++) base[i] /= maximum;
  const levels = [base];
  while (levels.at(-1).length > 1) {
    const previous = levels.at(-1), next = new Float32Array(Math.ceil(previous.length / 2));
    for (let i = 0; i < next.length; i++) next[i] = Math.max(previous[i * 2], previous[i * 2 + 1] ?? 0);
    levels.push(next);
  }
  return { levels, binSeconds: size / sampleRate, duration: length / sampleRate };
}
/** @param {Waveform|null} wave @param {number} start @param {number} end @param {number} columns */
export function visiblePeaks(wave, start, end, columns = 440) {
  if (!wave || end <= start) return [];
  const level = Math.max(0, Math.min(wave.levels.length - 1, Math.floor(Math.log2(Math.max(1, (end - start) / columns / wave.binSeconds)))));
  const peaks = wave.levels[level], bin = wave.binSeconds * 2 ** level;
  return Array.from({ length: columns }, (_, index) => {
    const from = Math.max(0, Math.floor((start + index / columns * (end - start)) / bin));
    const to = Math.min(peaks.length, Math.ceil((start + (index + 1) / columns * (end - start)) / bin));
    let peak = 0; for (let i = from; i < to; i++) peak = Math.max(peak, peaks[i]); return peak;
  });
}
export const minimumSelection = .101;
/** @param {number} from @param {number} to @param {number} duration */
export function selectionRange(from, to, duration) {
  const min = Math.min(minimumSelection, duration);
  let a = Math.max(0, Math.min(duration - min, Math.min(from, to))), b = Math.min(duration, Math.max(from, to, a + min));
  return { a, b };
}
/** @param {number} x @param {number} left @param {number} width @param {number} start @param {number} end */
export function timeAt(x, left, width, start, end) { return start + Math.max(0, Math.min(1, (x - left) / Math.max(1, width))) * (end - start); }
/** @param {number} start @param {number} span @param {number} duration */
export function viewportRange(start, span, duration) {
  const length = Math.min(duration, Math.max(Math.min(.1, duration), span));
  const a = Math.max(0, Math.min(duration - length, start)); return { start: a, end: a + length };
}

/** Snap within allowed bounds; preserve endpoints when no grid point fits.
 * @param {number} value @param {number} bpm @param {number} offset @param {number} min @param {number} max
 */
export function snapBeat(value, bpm, offset, min, max) {
  if (!(bpm > 0) || !Number.isFinite(offset) || max < min) return Math.max(min, Math.min(max, value));
  const interval = 60 / bpm, first = Math.ceil((min - offset) / interval - 1e-9), last = Math.floor((max - offset) / interval + 1e-9);
  if (first > last) return Math.max(min, Math.min(max, value));
  return offset + Math.max(first, Math.min(last, Math.round((value - offset) / interval))) * interval;
}
