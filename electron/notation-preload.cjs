const { contextBridge, ipcRenderer } = require('electron');
// This window can only view the published notation and control its own window.
contextBridge.exposeInMainWorld('notationViewer', Object.freeze({
  getState: () => ipcRenderer.invoke('notation:state'),
  onChange: (/** @type {(state:import('./notation-window.mjs').NotationState)=>void} */ listener) => {
    const receive = (/** @type {Electron.IpcRendererEvent} */ _event, /** @type {import('./notation-window.mjs').NotationState} */ state) => listener(state);
    ipcRenderer.on('notation:changed', receive);
    return () => ipcRenderer.removeListener('notation:changed', receive);
  },
  toggleFullscreen: () => ipcRenderer.invoke('notation:fullscreen'),
  close: () => ipcRenderer.invoke('notation:close'),
}));
