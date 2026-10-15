export type Fragment = import('../../electron/fragment-model.mjs').Fragment;
export interface Exercise {
  kind?: string; meter?: string; bars?: number;
  fragments?: Fragment[];
  id: string; title: string; description: string; bpm: number; detectedBpm: number | null;
  analysisStatus: 'estimated' | 'unavailable' | 'failed'; duration: number;
  audioName: string; imageName: string | null; imageMime: string | null; updatedAt: string; normalizationDb: number | null; normalizeAudio: boolean;
}
export interface Asset { name: string; bytes: Uint8Array }
export interface SaveInput {
  kind?: string; meter?: string; bars?: number;
  id?: string; title: string; description: string; bpm: number; detectedBpm: number | null;
  analysisStatus: Exercise['analysisStatus']; duration: number; audio?: Asset; image?: Asset | null; normalizationDb?: number | null; normalizeAudio?: boolean;
}

export interface RoutineStep { bars?: number; fragmentId?: string; fragmentName?: string; id: string; repetitions: number; bpm: number; start: number | null; end: number | null }
export interface RoutineBlock { countIn?: { enabled: boolean; meter: string }; id: string; exerciseId: string; steps: RoutineStep[] }
export interface RoutineInput { countIn?: { enabled: boolean; meter: string };  id?: string; title: string; blocks: RoutineBlock[] }
export interface Routine extends RoutineInput { id: string; updatedAt: string }

export type SessionProgress = import('../../electron/session-model.mjs').Progress;
export type Played = import('../../electron/session-model.mjs').Played;
export type Evaluation = import('../../electron/session-model.mjs').Evaluation & { savedAt?: string };
export interface SessionRecord {
  id: string; startedAt: string; updatedAt: string; endedAt: string | null;
  status: 'running' | 'completed' | 'partial' | 'stopped' | 'interrupted';
  routine: Routine; exercises: Exercise[]; progress: SessionProgress; evaluations: Evaluation[];
}
