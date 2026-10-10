const { contextBridge, ipcRenderer } = require('electron');

// Only this narrow API crosses the isolated renderer boundary.
contextBridge.exposeInMainWorld('hitthebeat', Object.freeze({
  listExercises: () => ipcRenderer.invoke('library:list'),
  saveExercise: (/** @type {import('./library.mjs').SaveInput} */ input) => ipcRenderer.invoke('library:save', input),
  readAudio: (/** @type {string} */ id) => ipcRenderer.invoke('library:audio', id),
  readImage: (/** @type {string} */ id) => ipcRenderer.invoke('library:image', id),
  openLibraryFolder: () => ipcRenderer.invoke('library:folder'),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
}));
