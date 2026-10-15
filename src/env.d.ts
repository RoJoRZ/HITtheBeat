/// <reference types="vite/client" />

interface Window {
  notationViewer?: {
    getState(): Promise<import('../electron/notation-window.mjs').NotationState>;
    onChange(listener: (state: import('../electron/notation-window.mjs').NotationState) => void): () => void;
    toggleFullscreen(): Promise<void>;
    close(): Promise<void>;
  };
  hitthebeat?: {
    setNotation(context: { id: string; title: string } | null): Promise<void>;
    openNotation(): Promise<void>;
    startSession(id: string): Promise<import('./library/types').SessionRecord>;
    listSessions(): Promise<import('./library/types').SessionRecord[]>;
    saveSession(id: string, progress: import('./library/types').SessionProgress, status: 'running'|'stopped'|'completed'|'partial'): Promise<import('./library/types').SessionRecord>;
    reviewSession(id: string, evaluation: import('./library/types').Evaluation): Promise<import('./library/types').SessionRecord>;
    listRoutines(): Promise<import('./library/types').Routine[]>;
    saveRoutine(input: import('./library/types').RoutineInput): Promise<import('./library/types').Routine>;
    deleteRoutine(id: string): Promise<void>;
    listExercises(): Promise<import('./library/types').Exercise[]>;
    deleteExercise(id: string): Promise<void>;
    saveExercise(input: import('./library/types').SaveInput): Promise<import('./library/types').Exercise>;
    saveFragment(exerciseId: string, input: import('../electron/fragment-model.mjs').FragmentInput): Promise<import('./library/types').Exercise>;
    deleteFragment(exerciseId: string, fragmentId: string): Promise<import('./library/types').Exercise>;
    readAudio(id: string): Promise<{bytes: Uint8Array; mime: string}>;
    readImage(id: string): Promise<{bytes: Uint8Array; mime: string} | null>;
    openLibraryFolder(): Promise<void>;
    getAppInfo(): Promise<{ version: string; platform: string }>;
  };
}
