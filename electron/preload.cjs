const { contextBridge, ipcRenderer } = require('electron');

// Only this narrow API crosses the isolated renderer boundary.
contextBridge.exposeInMainWorld('hitthebeat', Object.freeze({
  getAppInfo: () => ipcRenderer.invoke('app:info'),
}));
