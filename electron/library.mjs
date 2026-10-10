import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

/** @typedef {{ id:string, title:string, description:string, bpm:number, detectedBpm:number|null, analysisStatus:string, duration:number, audioName:string, imageName:string|null, imageMime:string|null, updatedAt:string }} Exercise */
/** @typedef {{ name:string, bytes:Uint8Array }} Asset */
/** @typedef {{ id?:string, title:string, description:string, bpm:number, detectedBpm:number|null, analysisStatus:string, duration:number, audio?:Asset, image?:Asset|null }} SaveInput */
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** @param {unknown} id */
function validId(id) { if (typeof id !== 'string' || !idPattern.test(id)) throw new Error('Ongeldige oefening.'); return id; }
/** @param {unknown} value @param {number} maximum */
function text(value, maximum) {
  if (typeof value !== 'string' || value.length > maximum || value.includes('\0')) throw new Error('Controleer de ingevoerde tekst.');
  return value.trim();
}
/** @param {unknown} value */
function number(value) { if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Controleer tempo en duur.'); return value; }
/** @param {Asset} asset @param {'audio'|'image'} kind */
function validateAsset(asset, kind) {
  if (!asset || !(asset.bytes instanceof Uint8Array) || asset.bytes.length < 12 || asset.bytes.length > (kind === 'audio' ? 50 : 12) * 1024 * 1024) throw new Error(kind === 'audio' ? 'Kies een MP3 van maximaal 50 MB.' : 'Kies een PNG, JPEG of WebP van maximaal 12 MB.');
  const name = text(asset.name, 240);
  const bytes = asset.bytes;
  if (kind === 'audio') {
    if (!name.toLowerCase().endsWith('.mp3') || !(Buffer.from(bytes.subarray(0, 3)).toString() === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224))) throw new Error('Dit bestand is geen herkenbare MP3.');
    return { extension: 'mp3', mime: 'audio/mpeg', name };
  }
  if (Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { extension: 'png', mime: 'image/png', name };
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { extension: 'jpg', mime: 'image/jpeg', name };
  if (Buffer.from(bytes.subarray(0, 4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8, 12)).toString() === 'WEBP') return { extension: 'webp', mime: 'image/webp', name };
  throw new Error('Kies een PNG, JPEG of WebP-afbeelding.');
}

/** @param {string} root */
export async function openLibrary(root) {
  const media = path.join(root, 'media');
  await mkdir(media, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path.join(root, 'library.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
  const version = /** @type {{user_version:number}} */ (db.prepare('PRAGMA user_version').get()).user_version;
  if (version > 1) { db.close(); throw new Error('Deze bibliotheek is gemaakt met een nieuwere appversie.'); }
  if (version === 0) db.exec(`BEGIN IMMEDIATE;
    CREATE TABLE exercises (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      bpm REAL NOT NULL CHECK(bpm>0), detected_bpm REAL, analysis_status TEXT NOT NULL, duration REAL NOT NULL,
      audio_name TEXT NOT NULL, audio_file TEXT NOT NULL, image_name TEXT, image_file TEXT, image_mime TEXT,
      updated_at TEXT NOT NULL) STRICT;
    PRAGMA user_version=1; COMMIT;`);
  /** @param {Record<string, any>} row @returns {Exercise} */
  const present = row => ({ id: row.id, title: row.title, description: row.description, bpm: row.bpm, detectedBpm: row.detected_bpm, analysisStatus: row.analysis_status, duration: row.duration, audioName: row.audio_name, imageName: row.image_name, imageMime: row.image_mime, updatedAt: row.updated_at });
  /** @param {unknown} id */
  const rowFor = id => {
    const row = db.prepare('SELECT * FROM exercises WHERE id=?').get(validId(id));
    if (!row) throw new Error('Deze oefening is niet meer beschikbaar.');
    return row;
  };
  /** @param {string} filename */
  const mediaPath = filename => {
    if (!/^[0-9a-f-]{36}\.(mp3|png|jpg|webp)$/.test(filename)) throw new Error('Ongeldig bibliotheekbestand.');
    return path.join(media, filename);
  };
  return {
    root,
    list() { return db.prepare('SELECT * FROM exercises ORDER BY title COLLATE NOCASE, id').all().map(present); },
    /** @param {SaveInput} input */
    async save(input) {
      if (!input || typeof input !== 'object') throw new Error('Ongeldige oefening.');
      const title = text(input.title, 160), description = text(input.description, 20000);
      const bpm = number(input.bpm), duration = number(input.duration);
      const detected = input.detectedBpm === null ? null : number(input.detectedBpm);
      if (!title || bpm <= 0 || bpm > 1000 || duration < .1 || duration > 86400 || (detected !== null && (detected < 40 || detected > 240)) || !['estimated', 'unavailable', 'failed'].includes(input.analysisStatus)) throw new Error('Controleer de naam, het BPM en de audiogegevens.');
      const old = input.id ? rowFor(input.id) : null;
      if (!old && !input.audio) throw new Error('Kies een MP3-bestand.');
      if (old && input.audio) throw new Error('Voeg een gewijzigde audiotrack als nieuwe oefening toe.');
      const audioInfo = input.audio ? validateAsset(input.audio, 'audio') : null;
      const imageInfo = input.image ? validateAsset(input.image, 'image') : null;
      const audioFile = audioInfo ? `${randomUUID()}.mp3` : String(old?.audio_file);
      const imageFile = imageInfo ? `${randomUUID()}.${imageInfo.extension}` : input.image === null ? null : old?.image_file ?? null;
      /** @type {string[]} */ const created = [];
      const id = input.id ?? randomUUID(), updated = new Date().toISOString();
      try {
        if (input.audio) { created.push(audioFile); await writeFile(mediaPath(audioFile), input.audio.bytes, { flag: 'wx', mode: 0o600 }); }
        if (input.image && typeof imageFile === 'string') { created.push(imageFile); await writeFile(mediaPath(imageFile), input.image.bytes, { flag: 'wx', mode: 0o600 }); }
        db.prepare(`INSERT INTO exercises VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, bpm=excluded.bpm,
          detected_bpm=excluded.detected_bpm, analysis_status=excluded.analysis_status, image_name=excluded.image_name,
          image_file=excluded.image_file, image_mime=excluded.image_mime, updated_at=excluded.updated_at`).run(
          id, title, description, bpm, detected, input.analysisStatus, duration,
          audioInfo?.name ?? String(old?.audio_name), audioFile,
          imageInfo?.name ?? (input.image === null ? null : old?.image_name ?? null), imageFile,
          imageInfo?.mime ?? (input.image === null ? null : old?.image_mime ?? null), updated);
      } catch (error) {
        await Promise.all(created.map(file => rm(mediaPath(file), { force: true })));
        throw error;
      }
      if (old?.image_file && old.image_file !== imageFile) await rm(mediaPath(String(old.image_file)), { force: true }).catch(() => {});
      return present(rowFor(id));
    },
    /** @param {unknown} id @param {'audio'|'image'} kind */
    async read(id, kind) {
      const row = rowFor(id);
      const filename = kind === 'audio' ? row.audio_file : row.image_file;
      if (!filename) return null;
      try { return { bytes: new Uint8Array(await readFile(mediaPath(String(filename)))), mime: kind === 'audio' ? 'audio/mpeg' : String(row.image_mime) }; }
      catch { throw new Error('Het bibliotheekbestand ontbreekt of kan niet worden gelezen.'); }
    },
    close() { db.close(); },
  };
}
