const { contextBridge, ipcRenderer } = require('electron');

// Only this narrow API crosses the isolated renderer boundary.
contextBridge.exposeInMainWorld('hitthebeat', Object.freeze({
  getLanguage: () => ipcRenderer.invoke('language:get'),
  setLanguage: (/** @type {'nl'|'en'} */ language) => ipcRenderer.invoke('language:set', language),
  onLanguageChange: (/** @type {(language:'nl'|'en')=>void} */ listener) => {
    const receive = (/** @type {Electron.IpcRendererEvent} */ _event, /** @type {'nl'|'en'} */ language) => listener(language);
    ipcRenderer.on('language:changed',receive); return () => ipcRenderer.removeListener('language:changed',receive);
  },
  exportExercise: (/** @type {string} */ id, /** @type {unknown} */ credit) => ipcRenderer.invoke('sharing:export', id, credit),
  previewImport: () => ipcRenderer.invoke('sharing:preview'),
  confirmImport: (/** @type {string} */ token, /** @type {string} */ title) => ipcRenderer.invoke('sharing:confirm',token,title),
  cancelImport: (/** @type {string} */ token) => ipcRenderer.invoke('sharing:cancel',token),
  startSession: (/** @type {string} */ id) => ipcRenderer.invoke('sessions:start', id),
  listSessions: () => ipcRenderer.invoke('sessions:list'),
  saveSession: (/** @type {string} */ id, /** @type {import('./session-model.mjs').Progress} */ progress, /** @type {string} */ status) => ipcRenderer.invoke('sessions:save', id, progress, status),
  reviewSession: (/** @type {string} */ id, /** @type {import('./session-model.mjs').Evaluation} */ evaluation) => ipcRenderer.invoke('sessions:review', id, evaluation),
  listRoutines: () => ipcRenderer.invoke('routines:list'),
  saveRoutine: (/** @type {import('./routine-model.mjs').RoutineInput} */ input) => ipcRenderer.invoke('routines:save', input),
  deleteRoutine: (/** @type {string} */ id) => ipcRenderer.invoke('routines:delete', id),
  listExercises: () => ipcRenderer.invoke('library:list'),
  deleteExercise: (/** @type {string} */ id) => ipcRenderer.invoke('library:delete', id),
  saveExercise: (/** @type {import('./library.mjs').SaveInput} */ input) => ipcRenderer.invoke('library:save', input),
  saveFragment: (/** @type {string} */ id, /** @type {import('./fragment-model.mjs').FragmentInput} */ input) => ipcRenderer.invoke('library:fragment-save', id, input),
  deleteFragment: (/** @type {string} */ id, /** @type {string} */ fragmentId) => ipcRenderer.invoke('library:fragment-delete', id, fragmentId),
  readAudio: (/** @type {string} */ id) => ipcRenderer.invoke('library:audio', id),
  readImage: (/** @type {string} */ id) => ipcRenderer.invoke('library:image', id),
  openLibraryFolder: () => ipcRenderer.invoke('library:folder'),
  setNotation: (/** @type {{id:string,title:string}|null} */ context) => ipcRenderer.invoke('notation:context', context),
  openNotation: () => ipcRenderer.invoke('notation:open'),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
}));
