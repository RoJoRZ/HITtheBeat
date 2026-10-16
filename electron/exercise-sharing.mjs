import { LocalizedError } from './i18n.mjs';
import { createHash } from 'node:crypto';
import { audioFormat } from './audio-format.mjs';
import { validateFragment } from './fragment-model.mjs';
import { meterBeats, validTempo } from './exercise-model.mjs';

export const MAX_PACKAGE_BYTES = 84 * 1024 * 1024;
const invalid = () => new LocalizedError("Dit is geen geldig HITtheBeat-oefenbestand.");
/** @param {unknown} value @param {number} max */
function text(value, max) {
  if (typeof value !== 'string' || value.length > max || value.includes('\0')) throw invalid();
  return value.trim();
}
/** Informal attribution, deliberately no identity/authenticity claim. @param {unknown} value */
export function validateCredit(value) {
  if (value == null) return null;
  if (typeof value !== 'object' || !('name' in value) || !('message' in value)) throw invalid();
  const name = text(value.name, 120), message = text(value.message, 1000);
  if (!name && message) throw new LocalizedError("Vul een makernaam in bij je boodschap.");
  return name ? { name, message } : null;
}
/** @param {import('./library.mjs').Asset|null|undefined} asset */
function encodeAsset(asset) {
  return asset ? { name: asset.name, data: Buffer.from(asset.bytes).toString('base64'), sha256: createHash('sha256').update(asset.bytes).digest('hex') } : null;
}
/** @param {any} value @param {'audio'|'image'} kind */
function decodeAsset(value, kind) {
  if (value === null) return undefined;
  const max = (kind === 'audio' ? 50 : 12) * 1024 * 1024;
  if (!value || typeof value.data !== 'string' || value.data.length > 4 * Math.ceil(max / 3) || (value.data.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(value.data))) throw invalid();
  const name = text(value.name, 240), bytes = Buffer.from(value.data, 'base64');
  if (bytes.length < 12 || bytes.length > max || bytes.toString('base64') !== value.data || createHash('sha256').update(bytes).digest('hex') !== value.sha256) throw invalid();
  if (kind === 'audio') audioFormat(name, bytes);
  else if (!(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) || (bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP'))) throw invalid();
  return {name, bytes: new Uint8Array(bytes)};
}
/** @param {import('./library.mjs').Exercise & {audio?:import('./library.mjs').Asset,image?:import('./library.mjs').Asset|null}} source @param {unknown} credit */
export function encodeExercise(source, credit) {
  const {kind = 'audio', title, description, bpm, detectedBpm, analysisStatus, duration, normalizationDb, normalizeAudio, meter = '4/4', bars = 8} = source;
  const bytes = Buffer.from(JSON.stringify({format:'hitthebeat-exercise',version:1,exercise:{kind,title,description,bpm,detectedBpm,analysisStatus,duration,normalizationDb,normalizeAudio,meter,bars,credit:validateCredit(credit),fragments:(source.fragments ?? []).map(({name,start,end})=>({name,start,end}))},audio:encodeAsset(source.audio),image:encodeAsset(source.image)}));
  // Export validates with the very same rules used by the recipient.
  decodeExercise(bytes);
  return bytes;
}
/** @param {Uint8Array} bytes */
export function decodeExercise(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length > MAX_PACKAGE_BYTES) throw invalid();
  let value;
  try { value = JSON.parse(Buffer.from(bytes).toString('utf8')); } catch { throw invalid(); }
  if (!value || value.format !== 'hitthebeat-exercise' || value.version !== 1 || !value.exercise) throw new LocalizedError("Onbekend of niet ondersteund HITtheBeat-oefenbestand.");
  const e = value.exercise;
  const title = text(e.title,160), description = text(e.description,20000), kind = e.kind;
  if (!title || !['audio','metronome'].includes(kind) || typeof e.bpm !== 'number' || !Number.isFinite(e.bpm) || e.bpm <= 0 || e.bpm > 1000 || !['estimated','unavailable','failed'].includes(e.analysisStatus) || !(e.detectedBpm === null || (typeof e.detectedBpm === 'number' && Number.isFinite(e.detectedBpm) && e.detectedBpm >= 40 && e.detectedBpm <= 240))) throw invalid();
  if (typeof e.duration !== 'number' || !Number.isFinite(e.duration) || (kind === 'audio' ? e.duration < .1 || e.duration > 86400 : e.duration !== 0)) throw invalid();
  if (typeof e.normalizeAudio !== 'boolean' || !(e.normalizationDb === null || (typeof e.normalizationDb === 'number' && Number.isFinite(e.normalizationDb) && e.normalizationDb >= -60 && e.normalizationDb <= 12 + 1e-9))) throw invalid();
  if (kind === 'metronome') { meterBeats(e.meter); if (!validTempo(e.bpm,{kind,bpm:e.bpm,duration:0}) || !Number.isInteger(e.bars) || e.bars < 1 || e.bars > 128 || value.audio !== null) throw invalid(); }
  const audio = decodeAsset(value.audio,'audio'), image = decodeAsset(value.image,'image');
  if (kind === 'audio' && !audio) throw invalid();
  if (!Array.isArray(e.fragments) || e.fragments.length > 100 || (kind === 'metronome' && e.fragments.length)) throw invalid();
  const fragments = e.fragments.map((/** @type {any} */ f)=>validateFragment({name:f?.name,start:f?.start,end:f?.end},e.duration));
  if (new Set(fragments.map((/** @type {{name:string}} */ f)=>f.name.toLocaleLowerCase('nl'))).size !== fragments.length) throw invalid();
  const input = {title,description,kind,bpm:e.bpm,detectedBpm:e.detectedBpm,analysisStatus:e.analysisStatus,duration:e.duration,normalizationDb:e.normalizationDb,normalizeAudio:e.normalizeAudio,meter:kind === 'metronome' ? e.meter : '4/4',bars:kind === 'metronome' ? e.bars : 8,credit:validateCredit(e.credit),audio,image};
  return {input,fragments};
}
