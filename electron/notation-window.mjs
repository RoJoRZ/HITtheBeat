import { getLanguage, localizedHandle } from './i18n.mjs';
import { t, LocalizedError } from './i18n.mjs';
import { BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/** @typedef {{version:number,context:number,title:string,image:{bytes:Uint8Array,mime:string}|null,loading:boolean,error:string,fullscreen:boolean}} NotationState */
/** @param {{entryUrl:string,authorize:(event:Electron.IpcMainInvokeEvent)=>void,readImage:(id:string)=>Promise<{bytes:Uint8Array,mime:string}|null>}} options */
export function setupNotationWindow({ entryUrl, authorize, readImage }) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const viewerUrl = `${entryUrl}?view=notation`;
  /** @type {BrowserWindow|null} */
  let viewer = null;
  let request = 0;
  /** @type {NotationState} */
  let state = { version: 0, context: 0, title: '', image: null, loading: false, error: '', fullscreen: false };
  function publish() {
    state = { ...state, version: state.version + 1, fullscreen: viewer?.isFullScreen() ?? false };
    if (viewer && !viewer.isDestroyed()) viewer.webContents.send('notation:changed', state);
  }
  /** @param {Electron.IpcMainInvokeEvent} event */
  function authorizeViewer(event) {
    if (!viewer || event.sender !== viewer.webContents || event.senderFrame !== viewer.webContents.mainFrame || event.senderFrame.url !== viewerUrl) throw new Error('Unknown notation frame');
  }
  localizedHandle(ipcMain, 'notation:context', async (event, input) => {
    authorize(event);
    if (input !== null && (!input || typeof input.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(input.id) || typeof input.title !== 'string' || !input.title.trim() || input.title.length > 160 || input.title.includes('\0'))) throw new LocalizedError("Ongeldige tablatuurcontext.");
    const token = ++request;
    state = { ...state, context: token, title: input?.title ?? '', image: null, error: '', loading: input !== null }; publish();
    if (!input) return;
    try {
      const image = await readImage(input.id);
      if (token !== request) return;
      state = { ...state, image, loading: false }; publish();
    } catch {
      if (token !== request) return;
      state = { ...state, loading: false, error: t("De tablatuur kan niet worden geladen.") }; publish();
    }
  });
  localizedHandle(ipcMain, 'notation:open', async event => {
    authorize(event);
    if (viewer) { if (viewer.isMinimized()) viewer.restore(); viewer.show(); viewer.focus(); return; }
    const current = new BrowserWindow({ width: 1050, height: 800, minWidth: 480, minHeight: 360, title: t("Tablatuur — HITtheBeat"), backgroundColor: '#141719', show: false,
      webPreferences: { preload: path.join(here, 'notation-preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
    viewer = current;
    current.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    current.webContents.on('will-navigate', (navigation, url) => { if (url !== viewerUrl) navigation.preventDefault(); });
    current.on('closed', () => { if (viewer === current) viewer = null; });
    current.on('enter-full-screen', publish); current.on('leave-full-screen', publish);
    await current.loadURL(viewerUrl);
    if (!current.isDestroyed()) current.show();
  });
  localizedHandle(ipcMain, 'notation:language', event => { authorizeViewer(event); return getLanguage(); });
  localizedHandle(ipcMain, 'notation:state', event => { authorizeViewer(event); return { ...state, fullscreen: viewer?.isFullScreen() ?? false }; });
  localizedHandle(ipcMain, 'notation:fullscreen', event => { authorizeViewer(event); viewer?.setFullScreen(!viewer.isFullScreen()); });
  localizedHandle(ipcMain, 'notation:close', event => { authorizeViewer(event); viewer?.close(); });
  return () => { ++request; viewer?.close(); state = { version: state.version + 1, context: request, title: '', image: null, loading: false, error: '', fullscreen: false }; };
}
