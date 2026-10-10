export interface Exercise {
  id: string; title: string; description: string; bpm: number; detectedBpm: number | null;
  analysisStatus: 'estimated' | 'unavailable' | 'failed'; duration: number;
  audioName: string; imageName: string | null; imageMime: string | null; updatedAt: string;
}
export interface Asset { name: string; bytes: Uint8Array }
export interface SaveInput {
  id?: string; title: string; description: string; bpm: number; detectedBpm: number | null;
  analysisStatus: Exercise['analysisStatus']; duration: number; audio?: Asset; image?: Asset | null;
}

export interface RoutineStep { id: string; repetitions: number; bpm: number; start: number | null; end: number | null }
export interface RoutineBlock { id: string; exerciseId: string; steps: RoutineStep[] }
export interface RoutineInput { id?: string; title: string; blocks: RoutineBlock[] }
export interface Routine extends RoutineInput { id: string; updatedAt: string }

export type SessionProgress = import('../../electron/session-model.mjs').Progress;
export type Played = import('../../electron/session-model.mjs').Played;
export type Evaluation = import('../../electron/session-model.mjs').Evaluation & { savedAt?: string };
export interface SessionRecord {
  id: string; startedAt: string; updatedAt: string; endedAt: string | null;
  status: 'running' | 'completed' | 'partial' | 'stopped' | 'interrupted';
  routine: Routine; exercises: Exercise[]; progress: SessionProgress; evaluations: Evaluation[];
}
