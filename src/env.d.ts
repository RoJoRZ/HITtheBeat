/// <reference types="vite/client" />

interface Window {
  hitthebeat?: {
    listExercises(): Promise<import('./library/types').Exercise[]>;
    saveExercise(input: import('./library/types').SaveInput): Promise<import('./library/types').Exercise>;
    readAudio(id: string): Promise<{bytes: Uint8Array; mime: string}>;
    readImage(id: string): Promise<{bytes: Uint8Array; mime: string} | null>;
    openLibraryFolder(): Promise<void>;
    getAppInfo(): Promise<{ version: string; platform: string }>;
  };
}
