const { contextBridge, ipcRenderer } = require('electron');

// Only this narrow API crosses the isolated renderer boundary.
contextBridge.exposeInMainWorld('hitthebeat', Object.freeze({
  listRoutines: () => ipcRenderer.invoke('routines:list'),
  saveRoutine: (/** @type {import('./routine-model.mjs').RoutineInput} */ input) => ipcRenderer.invoke('routines:save', input),
  deleteRoutine: (/** @type {string} */ id) => ipcRenderer.invoke('routines:delete', id),
  listExercises: () => ipcRenderer.invoke('library:list'),
  saveExercise: (/** @type {import('./library.mjs').SaveInput} */ input) => ipcRenderer.invoke('library:save', input),
  readAudio: (/** @type {string} */ id) => ipcRenderer.invoke('library:audio', id),
  readImage: (/** @type {string} */ id) => ipcRenderer.invoke('library:image', id),
  openLibraryFolder: () => ipcRenderer.invoke('library:folder'),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
}));
