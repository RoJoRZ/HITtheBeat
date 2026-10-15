/** Shared source coordinates: audio seconds, or reference-tempo seconds for a metronome. */
/** @typedef {{kind?:string,meter?:string,bars?:number,bpm:number,duration:number}} Source */
/** @param {Source} source */
export const isMetronome = source => source.kind === 'metronome';
export const meters = ['3/4', '4/4', '6/8'];
/** @param {string} meter */
export function meterBeats(meter) {
  if (!meters.includes(meter)) throw new Error('Kies maatsoort 3/4, 4/4 of 6/8.');
  return Number(meter.split('/')[0]);
}
/** @param {Source} source @param {number} bars */
export function metronomeSeconds(source, bars = source.bars ?? 8) {
  if (!Number.isInteger(bars) || bars < 1 || bars > 128) throw new Error('Kies 1 tot 128 maten per herhaling.');
  return bars * meterBeats(source.meter ?? '4/4') * (source.meter === '6/8' ? .5 : 1) * 60 / source.bpm;
}
/** @param {{bars?:number,start?:number|null,end?:number|null}} step @param {Source} source */
export function sourceSeconds(step, source) { return isMetronome(source) ? metronomeSeconds(source, step.bars ?? source.bars ?? 8) : source.duration; }
/** @param {number} bpm @param {Source} source */
export function validTempo(bpm, source) { return Number.isFinite(bpm) && (isMetronome(source) ? bpm >= 20 && bpm <= 300 : bpm >= source.bpm * .25 - 1e-9 && bpm <= source.bpm * 3 + 1e-9); }

/** @param {{bars?:number}} step @param {Source} source */
export const exerciseBars = (step, source) => step.bars ?? source.bars ?? 8;
