const { contextBridge, ipcRenderer } = require('electron');

// Only this narrow API crosses the isolated renderer boundary.
contextBridge.exposeInMainWorld('hitthebeat', Object.freeze({
  startSession: (/** @type {string} */ id) => ipcRenderer.invoke('sessions:start', id),
  listSessions: () => ipcRenderer.invoke('sessions:list'),
  saveSession: (/** @type {string} */ id, /** @type {import('./session-model.mjs').Progress} */ progress, /** @type {string} */ status) => ipcRenderer.invoke('sessions:save', id, progress, status),
  reviewSession: (/** @type {string} */ id, /** @type {import('./session-model.mjs').Evaluation} */ evaluation) => ipcRenderer.invoke('sessions:review', id, evaluation),
  listRoutines: () => ipcRenderer.invoke('routines:list'),
  saveRoutine: (/** @type {import('./routine-model.mjs').RoutineInput} */ input) => ipcRenderer.invoke('routines:save', input),
  deleteRoutine: (/** @type {string} */ id) => ipcRenderer.invoke('routines:delete', id),
  listExercises: () => ipcRenderer.invoke('library:list'),
  saveExercise: (/** @type {import('./library.mjs').SaveInput} */ input) => ipcRenderer.invoke('library:save', input),
  saveFragment: (/** @type {string} */ id, /** @type {import('./fragment-model.mjs').FragmentInput} */ input) => ipcRenderer.invoke('library:fragment-save', id, input),
  deleteFragment: (/** @type {string} */ id, /** @type {string} */ fragmentId) => ipcRenderer.invoke('library:fragment-delete', id, fragmentId),
  readAudio: (/** @type {string} */ id) => ipcRenderer.invoke('library:audio', id),
  readImage: (/** @type {string} */ id) => ipcRenderer.invoke('library:image', id),
  openLibraryFolder: () => ipcRenderer.invoke('library:folder'),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
}));
