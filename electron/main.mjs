import { app, BrowserWindow, ipcMain, Menu, net, protocol, session } from 'electron';
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

protocol.registerSchemesAsPrivileged([
  { scheme: 'hitthebeat', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

if (process.env.HITTHEBEAT_TEST_DATA && !app.isPackaged) {
  app.setPath('userData', path.resolve(process.env.HITTHEBEAT_TEST_DATA));
}

async function createWindow() {
  const current = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 680,
    title: 'HITtheBeat',
    backgroundColor: '#141719',
    show: false,
    webPreferences: {
      preload: path.join(here, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });
  window = current;
  current.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  current.webContents.on('will-navigate', (event, destination) => {
    if (destination !== entryUrl) event.preventDefault();
  });
  current.on('closed', () => { if (window === current) window = null; });
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
  ipcMain.handle('app:info', (event) => {
    if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== entryUrl) {
      throw new Error('Unknown application frame');
    }
    return { version: app.getVersion(), platform: process.platform };
  });
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
