import { sharingDialogs } from './sharing-dialogs.mjs';
import { setupNotationWindow } from './notation-window.mjs';
import { openLibrary } from './library.mjs';
import { app, BrowserWindow, dialog, ipcMain, Menu, net, protocol, session, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { resolveAsset } from './local-assets.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const productionUrl = 'hitthebeat://app/';
// The development server is local and only enabled by our dev launcher.
const development = !app.isPackaged && process.env.HITTHEBEAT_DEV === '1';
const entryUrl = development ? 'http://127.0.0.1:5173/' : productionUrl;
/** @type {BrowserWindow | null} */
let window = null;
let interruptSessions = () => {};
let closeNotation = () => {};

protocol.registerSchemesAsPrivileged([
  { scheme: 'hitthebeat', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const explicitData = app.commandLine.getSwitchValue('user-data-dir');
if (explicitData) app.setPath('userData', path.resolve(explicitData));
else if (process.env.HITTHEBEAT_TEST_DATA && !app.isPackaged) {
  app.setPath('userData', path.resolve(process.env.HITTHEBEAT_TEST_DATA));
} else app.setPath('userData', path.join(app.getPath('appData'), 'HITtheBeat'));

async function createWindow() {
  const current = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 680,
    title: 'HITtheBeat',
    icon: path.join(here, '..', 'build', 'icon.png'),
    backgroundColor: '#141719',
    show: false,
    webPreferences: {
      preload: path.join(here, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      // Keep session transitions responsive while the detached notation covers the player.
      backgroundThrottling: false,
    },
  });
  window = current;
  current.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  current.webContents.on('will-navigate', (event, destination) => {
    if (destination !== entryUrl) event.preventDefault();
  });
  current.on('closed', () => { if (window === current) { window = null; closeNotation(); interruptSessions(); } });
  await current.loadURL(entryUrl);
  current.show();
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  protocol.handle('hitthebeat', async (request) => {
    const asset = resolveAsset(request.url, path.join(here, '..', 'dist'));
    if (!asset) return new Response('Not found', { status: 404 });
    try {
      return await net.fetch(pathToFileURL(asset).href);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
  if (process.platform === 'darwin') app.dock?.setIcon(path.join(here, '..', 'build', 'icon.png'));
  const library = await openLibrary(path.join(app.getPath('userData'), 'library'));
  interruptSessions = () => library.interruptSessions();
  app.on('will-quit', () => { interruptSessions(); library.close(); });
  /** @param {Electron.IpcMainInvokeEvent} event */
  function authorize(event) {
    if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== entryUrl) {
      throw new Error('Unknown application frame');
    }
  }
  closeNotation = setupNotationWindow({ entryUrl, authorize, readImage: id => library.read(id, 'image') });
  const sharing = sharingDialogs({library,dialog,owner:()=> { if (!window) throw new Error('Geen hoofdvenster.'); return window; }});
  ipcMain.handle('sharing:export', (event,id,credit)=>{ authorize(event); return sharing.export(id,credit); });
  ipcMain.handle('sharing:preview', event=>{ authorize(event); return sharing.preview(); });
  ipcMain.handle('sharing:confirm', (event,token,title)=>{ authorize(event); return sharing.confirm(token,title); });
  ipcMain.handle('sharing:cancel', (event,token)=>{ authorize(event); return sharing.cancel(token); });
  ipcMain.handle('app:info', event => { authorize(event); return { version: app.getVersion(), platform: process.platform }; });
  ipcMain.handle('sessions:start', (event, id) => { authorize(event); return library.startSession(id); });
  ipcMain.handle('sessions:list', event => { authorize(event); return library.listSessions(); });
  ipcMain.handle('sessions:save', (event, id, progress, status) => { authorize(event); return library.saveSession(id, progress, status); });
  ipcMain.handle('sessions:review', (event, id, evaluation) => { authorize(event); return library.reviewSession(id, evaluation); });
  ipcMain.handle('routines:list', event => { authorize(event); return library.listRoutines(); });
  ipcMain.handle('routines:save', (event, input) => { authorize(event); return library.saveRoutine(input); });
  ipcMain.handle('routines:delete', (event, id) => { authorize(event); return library.deleteRoutine(id); });
  ipcMain.handle('library:list', event => { authorize(event); return library.list(); });
  ipcMain.handle('library:delete', (event, id) => { authorize(event); return library.deleteExercise(id); });
  ipcMain.handle('library:save', (event, input) => { authorize(event); return library.save(input); });
  ipcMain.handle('library:fragment-save', (event, id, input) => { authorize(event); return library.saveFragment(id, input); });
  ipcMain.handle('library:fragment-delete', (event, id, fragmentId) => { authorize(event); return library.deleteFragment(id, fragmentId); });
  ipcMain.handle('library:audio', (event, id) => { authorize(event); return library.read(id, 'audio'); });
  ipcMain.handle('library:image', (event, id) => { authorize(event); return library.read(id, 'image'); });
  ipcMain.handle('library:folder', async event => { authorize(event); const error = await shell.openPath(library.root); if (error) throw new Error('De bibliotheekmap kan niet worden geopend.'); });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ label: 'HITtheBeat', submenu: [{ role: /** @type {const} */ ('about') }, { type: /** @type {const} */ ('separator') }, { role: /** @type {const} */ ('quit') }] }] : []),
    { label: 'Bewerken', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'Venster', submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }] },
  ]));
  await createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
}).catch((error) => {
  console.error('HITtheBeat kon niet starten:', error);
  app.exit(1);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
