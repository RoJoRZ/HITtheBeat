import { audioFormat } from './audio-format.mjs';
import { validateFragment } from './fragment-model.mjs';
import { sessionId, validateProgress, validateEvaluation } from './session-model.mjs';
import { validateRoutine } from './routine-model.mjs';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

/** @typedef {{ id:string, title:string, description:string, bpm:number, detectedBpm:number|null, analysisStatus:string, duration:number, audioName:string, imageName:string|null, imageMime:string|null, updatedAt:string, normalizationDb:number|null, normalizeAudio:boolean, fragments:import('./fragment-model.mjs').Fragment[] }} Exercise */
/** @typedef {{ name:string, bytes:Uint8Array }} Asset */
/** @typedef {{ id?:string, title:string, description:string, bpm:number, detectedBpm:number|null, analysisStatus:string, duration:number, audio?:Asset, image?:Asset|null, normalizationDb?:number|null, normalizeAudio?:boolean }} SaveInput */
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
  if (!asset || !(asset.bytes instanceof Uint8Array) || asset.bytes.length < 12 || asset.bytes.length > (kind === 'audio' ? 50 : 12) * 1024 * 1024) throw new Error(kind === 'audio' ? 'Kies een MP3 of M4A van maximaal 50 MB.' : 'Kies een PNG, JPEG of WebP van maximaal 12 MB.');
  const name = text(asset.name, 240);
  const bytes = asset.bytes;
  if (kind === 'audio') {
    return { ...audioFormat(name, bytes), name };
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
  db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;');
  const version = /** @type {{user_version:number}} */ (db.prepare('PRAGMA user_version').get()).user_version;
  if (version > 5) { db.close(); throw new Error('Deze bibliotheek is gemaakt met een nieuwere appversie.'); }
  if (version === 0) db.exec(`BEGIN IMMEDIATE;
    CREATE TABLE exercises (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      bpm REAL NOT NULL CHECK(bpm>0), detected_bpm REAL, analysis_status TEXT NOT NULL, duration REAL NOT NULL,
      audio_name TEXT NOT NULL, audio_file TEXT NOT NULL, image_name TEXT, image_file TEXT, image_mime TEXT,
      updated_at TEXT NOT NULL) STRICT;
    PRAGMA user_version=1; COMMIT;`);
  if (version < 2) db.exec(`BEGIN IMMEDIATE;
    CREATE TABLE routines (id TEXT PRIMARY KEY, title TEXT NOT NULL, updated_at TEXT NOT NULL) STRICT;
    CREATE TABLE routine_blocks (id TEXT PRIMARY KEY, routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id), position INTEGER NOT NULL) STRICT;
    CREATE TABLE routine_steps (id TEXT PRIMARY KEY, block_id TEXT NOT NULL REFERENCES routine_blocks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL, repetitions INTEGER NOT NULL CHECK(repetitions>0), bpm REAL NOT NULL CHECK(bpm>0),
      start REAL, end REAL) STRICT;
    PRAGMA user_version=2; COMMIT;`);
  if (version < 3) db.exec(`BEGIN IMMEDIATE;
    CREATE TABLE sessions (id TEXT PRIMARY KEY, started_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      ended_at TEXT, status TEXT NOT NULL, snapshot TEXT NOT NULL, progress TEXT NOT NULL,
      evaluations TEXT NOT NULL, routine_version TEXT NOT NULL) STRICT;
    PRAGMA user_version=3; COMMIT;`);
  if (version < 4) db.exec(`BEGIN IMMEDIATE;
    ALTER TABLE exercises ADD COLUMN normalization_db REAL;
    ALTER TABLE exercises ADD COLUMN normalize_audio INTEGER NOT NULL DEFAULT 1 CHECK(normalize_audio IN (0,1));
    PRAGMA user_version=4; COMMIT;`);
  if (version < 5) db.exec(`BEGIN IMMEDIATE;
    ALTER TABLE exercises ADD COLUMN fragments TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE routine_steps ADD COLUMN fragment_id TEXT;
    ALTER TABLE routine_steps ADD COLUMN fragment_name TEXT;
    PRAGMA user_version=5; COMMIT;`);
  // An unclosed run is preserved, never promoted to a completed session.
  db.prepare("UPDATE sessions SET status='interrupted', ended_at=updated_at WHERE status='running'").run();
  /** @param {string} id */
  const sessionRow = id => {
    const row = db.prepare('SELECT * FROM sessions WHERE id=?').get(sessionId(id));
    if (!row) throw new Error('Deze sessie bestaat niet meer.');
    return row;
  };
  /** @param {Record<string, any>} row */
  const sessionFrom = row => ({ id: String(row.id), startedAt: String(row.started_at), updatedAt: String(row.updated_at), endedAt: row.ended_at, status: String(row.status), ...JSON.parse(String(row.snapshot)), progress: JSON.parse(String(row.progress)), evaluations: JSON.parse(String(row.evaluations)) });
  /** @param {Record<string, any>} row */
  const routineFrom = row => ({ id: String(row.id), title: String(row.title), updatedAt: String(row.updated_at),
    blocks: db.prepare('SELECT * FROM routine_blocks WHERE routine_id=? ORDER BY position').all(String(row.id)).map(block => ({
      id: String(block.id), exerciseId: String(block.exercise_id),
      steps: db.prepare('SELECT * FROM routine_steps WHERE block_id=? ORDER BY position').all(String(block.id)).map(step => ({
        id: String(step.id), repetitions: Number(step.repetitions), bpm: Number(step.bpm),
        ...(step.fragment_id ? { fragmentId: String(step.fragment_id), fragmentName: String(step.fragment_name) } : {}),
        start: step.start === null ? null : Number(step.start), end: step.end === null ? null : Number(step.end),
      })),
    })),
  });
  /** @param {Record<string, any>} row @returns {Exercise} */
  const present = row => ({ id: row.id, title: row.title, description: row.description, bpm: row.bpm, detectedBpm: row.detected_bpm, analysisStatus: row.analysis_status, duration: row.duration, audioName: row.audio_name, imageName: row.image_name, imageMime: row.image_mime, updatedAt: row.updated_at, normalizationDb: row.normalization_db, normalizeAudio: Boolean(row.normalize_audio), fragments: JSON.parse(String(row.fragments)) });
  /** @param {unknown} id */
  const rowFor = id => {
    const row = db.prepare('SELECT * FROM exercises WHERE id=?').get(validId(id));
    if (!row) throw new Error('Deze oefening is niet meer beschikbaar.');
    return row;
  };
  /** @param {string} filename */
  const mediaPath = filename => {
    if (!/^[0-9a-f-]{36}\.(mp3|m4a|png|jpg|webp)$/.test(filename)) throw new Error('Ongeldig bibliotheekbestand.');
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
      const normalizationDb = input.normalizationDb === undefined ? old?.normalization_db ?? null : input.normalizationDb;
      const normalizeAudio = input.normalizeAudio === undefined ? Boolean(old?.normalize_audio ?? true) : input.normalizeAudio;
      if ((normalizationDb !== null && (typeof normalizationDb !== 'number' || !Number.isFinite(normalizationDb) || normalizationDb < -60 || normalizationDb > 12 + 1e-9)) || typeof normalizeAudio !== 'boolean') throw new Error('Ongeldige volumenormalisatie.');
      if (!old && !input.audio) throw new Error('Kies een MP3- of M4A-bestand.');
      if (old && input.audio) {
        const fragments = present(old).fragments;
        if (fragments.some(fragment => fragment.end > duration)) throw new Error('De nieuwe audio is korter dan een opgeslagen fragment. Pas eerst de fragmentgrenzen aan.');
        const sources = this.list().map(item => item.id === old.id ? { ...item, bpm, duration } : item);
        for (const routine of this.listRoutines().filter(item => item.blocks.some(block => block.exerciseId === old.id))) {
          try { validateRoutine(routine, sources); }
          catch { throw new Error(`De nieuwe audio past niet bij de grenzen of BPM in sessie “${routine.title}”. Pas eerst deze sessie aan.`); }
        }
      }
      const audioInfo = input.audio ? validateAsset(input.audio, 'audio') : null;
      const imageInfo = input.image ? validateAsset(input.image, 'image') : null;
      const audioFile = audioInfo ? `${randomUUID()}.${audioInfo.extension}` : String(old?.audio_file);
      const imageFile = imageInfo ? `${randomUUID()}.${imageInfo.extension}` : input.image === null ? null : old?.image_file ?? null;
      /** @type {string[]} */ const created = [];
      const id = input.id ?? randomUUID(), updated = new Date().toISOString();
      try {
        if (input.audio) { created.push(audioFile); await writeFile(mediaPath(audioFile), input.audio.bytes, { flag: 'wx', mode: 0o600 }); }
        if (input.image && typeof imageFile === 'string') { created.push(imageFile); await writeFile(mediaPath(imageFile), input.image.bytes, { flag: 'wx', mode: 0o600 }); }
        db.prepare(`INSERT INTO exercises (id,title,description,bpm,detected_bpm,analysis_status,duration,audio_name,audio_file,image_name,image_file,image_mime,updated_at,normalization_db,normalize_audio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, bpm=excluded.bpm,
          detected_bpm=excluded.detected_bpm, analysis_status=excluded.analysis_status, duration=excluded.duration,
          audio_name=excluded.audio_name, audio_file=excluded.audio_file, image_name=excluded.image_name,
          image_file=excluded.image_file, image_mime=excluded.image_mime, updated_at=excluded.updated_at,
          normalization_db=excluded.normalization_db, normalize_audio=excluded.normalize_audio`).run(
          id, title, description, bpm, detected, input.analysisStatus, duration,
          audioInfo?.name ?? String(old?.audio_name), audioFile,
          imageInfo?.name ?? (input.image === null ? null : old?.image_name ?? null), imageFile,
          imageInfo?.mime ?? (input.image === null ? null : old?.image_mime ?? null), updated, normalizationDb, normalizeAudio ? 1 : 0);
      } catch (error) {
        await Promise.all(created.map(file => rm(mediaPath(file), { force: true })));
        throw error;
      }
      if (old?.audio_file && old.audio_file !== audioFile) await rm(mediaPath(String(old.audio_file)), { force: true }).catch(() => {});
      if (old?.image_file && old.image_file !== imageFile) await rm(mediaPath(String(old.image_file)), { force: true }).catch(() => {});
      return present(rowFor(id));
    },
    /** @param {string} id */
    async deleteExercise(id) {
      const row = rowFor(id);
      const used = this.listRoutines().filter(item => item.blocks.some(block => block.exerciseId === id));
      if (used.length) throw new Error(`Verwijder deze oefening eerst uit de opgeslagen sessies: ${used.map(item => item.title).join(', ')}.`);
      db.prepare('DELETE FROM exercises WHERE id=?').run(id);
      await Promise.all([row.audio_file, row.image_file].filter(Boolean).map(file => rm(mediaPath(String(file)), { force: true }).catch(() => {})));
    },
    /** @param {string} exerciseId @param {import('./fragment-model.mjs').FragmentInput} input */
    saveFragment(exerciseId, input) {
      const row = rowFor(exerciseId), fragments = present(row).fragments;
      const clean = validateFragment(input, Number(row.duration));
      if (input.id && !fragments.some(item => item.id === input.id)) throw new Error('Dit fragment bestaat niet meer.');
      if (fragments.some(item => item.id !== clean.id && item.name.toLocaleLowerCase('nl') === clean.name.toLocaleLowerCase('nl'))) throw new Error('Kies een unieke fragmentnaam bij deze oefening.');
      if (!input.id && fragments.length >= 100) throw new Error('Bewaar maximaal 100 fragmenten per oefening.');
      const next = input.id ? fragments.map(item => item.id === clean.id ? clean : item) : [...fragments, clean];
      db.prepare('UPDATE exercises SET fragments=?, updated_at=? WHERE id=?').run(JSON.stringify(next), new Date().toISOString(), exerciseId);
      return present(rowFor(exerciseId));
    },
    /** @param {string} exerciseId @param {string} fragmentId */
    deleteFragment(exerciseId, fragmentId) {
      validId(fragmentId);
      const fragments = present(rowFor(exerciseId)).fragments;
      if (!fragments.some(item => item.id === fragmentId)) throw new Error('Dit fragment bestaat niet meer.');
      db.prepare('UPDATE exercises SET fragments=?, updated_at=? WHERE id=?').run(JSON.stringify(fragments.filter(item => item.id !== fragmentId)), new Date().toISOString(), exerciseId);
      return present(rowFor(exerciseId));
    },
    /** @param {unknown} id @param {'audio'|'image'} kind */
    async read(id, kind) {
      const row = rowFor(id);
      const filename = kind === 'audio' ? row.audio_file : row.image_file;
      if (!filename) return null;
      try { return { bytes: new Uint8Array(await readFile(mediaPath(String(filename)))), mime: kind === 'audio' ? (String(filename).endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg') : String(row.image_mime) }; }
      catch { throw new Error('Het bibliotheekbestand ontbreekt of kan niet worden gelezen.'); }
    },
    listRoutines() { return db.prepare('SELECT * FROM routines ORDER BY title COLLATE NOCASE, id').all().map(routineFrom); },
    /** @param {import('./routine-model.mjs').RoutineInput} input */
    saveRoutine(input) {
      const clean = validateRoutine(input, db.prepare('SELECT id,bpm,duration FROM exercises').all().map(row => ({ id: String(row.id), bpm: Number(row.bpm), duration: Number(row.duration) })));
      const id = clean.id ?? randomUUID();
      if (clean.id && !db.prepare('SELECT id FROM routines WHERE id=?').get(id)) throw new Error('Deze sessie bestaat niet meer.');
      db.exec('BEGIN IMMEDIATE;');
      try {
        db.prepare('INSERT INTO routines VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, updated_at=excluded.updated_at').run(id, clean.title, new Date(Math.max(Date.now(), Date.parse(String(db.prepare('SELECT updated_at FROM routines WHERE id=?').get(id)?.updated_at ?? '1970-01-01')) + 1)).toISOString());
        db.prepare('DELETE FROM routine_blocks WHERE routine_id=?').run(id);
        clean.blocks.forEach((block, index) => {
          db.prepare('INSERT INTO routine_blocks VALUES (?,?,?,?)').run(block.id, id, block.exerciseId, index);
          block.steps.forEach((step, position) => db.prepare('INSERT INTO routine_steps VALUES (?,?,?,?,?,?,?,?,?)').run(step.id, block.id, position, step.repetitions, step.bpm, step.start, step.end, step.fragmentId ?? null, step.fragmentName ?? null));
        });
        db.exec('COMMIT;');
      } catch (error) { db.exec('ROLLBACK;'); throw error; }
      return routineFrom(db.prepare('SELECT * FROM routines WHERE id=?').get(id) ?? {});
    },
    /** @param {string} id */
    deleteRoutine(id) { const result = db.prepare('DELETE FROM routines WHERE id=?').run(validId(id)); if (!result.changes) throw new Error('Deze sessie bestaat niet meer.'); },
    /** @param {string} routineId */
    startSession(routineId) {
      const row = db.prepare('SELECT * FROM routines WHERE id=?').get(validId(routineId));
      if (!row) throw new Error('Deze sessie bestaat niet meer.');
      const routine = routineFrom(row), exercises = this.list().filter(item => routine.blocks.some(block => block.exerciseId === item.id));
      validateRoutine(routine, exercises);
      const id = randomUUID(), now = new Date().toISOString();
      const progress = { seq: 0, block: 0, step: 0, repetition: 0, phase: 'ready', passes: 0, statuses: routine.blocks.map(() => 'pending'), times: { planned: 0, fragment: 0, pause: 0 }, played: [] };
      db.prepare('INSERT INTO sessions VALUES (?,?,?,?,?,?,?,?,?)').run(id, now, now, null, 'running', JSON.stringify({ routine, exercises }), JSON.stringify(progress), '[]', routine.updatedAt);
      return sessionFrom(sessionRow(id));
    },
    listSessions() { return db.prepare('SELECT * FROM sessions ORDER BY started_at DESC, id').all().map(sessionFrom); },
    /** @param {string} id @param {import('./session-model.mjs').Progress} input @param {'running'|'stopped'|'completed'|'partial'} [status] */
    saveSession(id, input, status = 'running') {
      const row = sessionRow(id);
      const old = JSON.parse(String(row.progress));
      if (!['running','stopped','completed','partial'].includes(status)) throw new Error('Ongeldige sessiestatus.');
      if (row.status !== 'running') return sessionFrom(row);
      const progress = validateProgress(input, JSON.parse(String(row.snapshot)));
      if (progress.seq <= old.seq) return sessionFrom(row);
      if (progress.passes < old.passes || ['planned','fragment','pause'].some(key => progress.times[/** @type {keyof typeof progress.times} */ (key)] < old.times[key] - 1e-6)) throw new Error('Sessieresultaten mogen niet teruglopen.');
      if ((status === 'completed' || status === 'partial') && (progress.phase !== 'complete' || progress.statuses.includes('pending') || (status === 'completed' && progress.statuses.includes('skipped')) || (status === 'partial' && !progress.statuses.includes('skipped')))) throw new Error('Deze sessie is nog niet volledig doorlopen.');
      const now = new Date().toISOString();
      db.prepare('UPDATE sessions SET progress=?, status=?, updated_at=?, ended_at=? WHERE id=?').run(JSON.stringify(progress), status, now, status === 'running' ? null : now, id);
      return sessionFrom(sessionRow(id));
    },
    /** Save evaluation and its future tempo adjustment atomically, once per ID.
     * @param {string} id @param {import('./session-model.mjs').Evaluation} input */
    reviewSession(id, input) {
      const row = sessionRow(id), evaluations = JSON.parse(String(row.evaluations));
      sessionId(input?.id);
      if (evaluations.some((/** @type {{id:string}} */ item) => item.id === input.id)) return sessionFrom(row);
      if (row.status !== 'running') throw new Error('Deze sessie is al afgesloten.');
      const snapshot = JSON.parse(String(row.snapshot)), progress = JSON.parse(String(row.progress));
      const evaluation = validateEvaluation(input, snapshot, progress);
      db.exec('BEGIN IMMEDIATE;');
      try {
        let routineVersion = String(row.routine_version);
        if (evaluation.delta !== 0) {
          const saved = db.prepare('SELECT * FROM routines WHERE id=?').get(snapshot.routine.id);
          if (!saved || saved.updated_at !== routineVersion) throw new Error('De sessie is intussen gewijzigd. Bewaar deze evaluatie zonder BPM-aanpassing en pas de sessie daarna aan in de editor.');
          const routine = routineFrom(saved);
          const block = routine.blocks.find(item => item.id === snapshot.routine.blocks[evaluation.block].id);
          if (!block) throw new Error('Deze oefening staat niet meer in de sessie.');
          block.steps = block.steps.map(step => ({ ...step, bpm: Math.round((step.bpm + evaluation.delta) * 1000000) / 1000000 }));
          validateRoutine(routine, this.list());
          // Monotonic version even when two saves happen in the same millisecond.
          routineVersion = new Date(Math.max(Date.now(), Date.parse(routineVersion) + 1)).toISOString();
          db.prepare('UPDATE routines SET updated_at=? WHERE id=?').run(routineVersion, routine.id);
          block.steps.forEach(step => db.prepare('UPDATE routine_steps SET bpm=? WHERE id=? AND block_id=?').run(step.bpm, step.id, block.id));
        }
        const savedEvaluation = { ...evaluation, savedAt: new Date().toISOString() };
        db.prepare('UPDATE sessions SET evaluations=?, routine_version=?, updated_at=? WHERE id=?').run(JSON.stringify([...evaluations, savedEvaluation]), routineVersion, savedEvaluation.savedAt, id);
        db.exec('COMMIT;');
      } catch (error) { db.exec('ROLLBACK;'); throw error; }
      return sessionFrom(sessionRow(id));
    },
    interruptSessions() { db.prepare("UPDATE sessions SET status='interrupted', ended_at=updated_at WHERE status='running'").run(); },
    close() { db.close(); },
  };
}
