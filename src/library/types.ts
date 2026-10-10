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
