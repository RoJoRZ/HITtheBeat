import { dashboardSettings } from './dashboard-settings.mjs';
import { languageSettings } from './language-settings.mjs';
import { getLanguage, setLanguage, subscribeLanguage, localizedHandle } from './i18n.mjs';
import { t, LocalizedError } from './i18n.mjs';
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
  const preferences = await languageSettings(app.getPath('userData'), app.commandLine.getSwitchValue('lang') || app.getPreferredSystemLanguages()[0] || app.getLocale());
  setLanguage(preferences.get());
  subscribeLanguage(() => { updateMenu(); for (const current of BrowserWindow.getAllWindows()) current.webContents.send('language:changed', getLanguage()); });
  const dashboardPreferences = await dashboardSettings(app.getPath('userData'));
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
  localizedHandle(ipcMain, 'language:get', event => { authorize(event); return getLanguage(); });
  localizedHandle(ipcMain, 'language:set', async (event, value) => { authorize(event); const language=await preferences.set(value); setLanguage(language); return language; });
  const sharing = sharingDialogs({library,dialog,owner:()=> { if (!window) throw new LocalizedError("Geen hoofdvenster."); return window; }});
  localizedHandle(ipcMain, 'sharing:export', (event,id,credit)=>{ authorize(event); return sharing.export(id,credit); });
  localizedHandle(ipcMain, 'sharing:preview', event=>{ authorize(event); return sharing.preview(); });
  localizedHandle(ipcMain, 'sharing:confirm', (event,token,title)=>{ authorize(event); return sharing.confirm(token,title); });
  localizedHandle(ipcMain, 'sharing:cancel', (event,token)=>{ authorize(event); return sharing.cancel(token); });
  localizedHandle(ipcMain, 'app:info', event => { authorize(event); return { version: app.getVersion(), platform: process.platform }; });
  localizedHandle(ipcMain, 'sessions:start', (event, id) => { authorize(event); return library.startSession(id); });
  localizedHandle(ipcMain, 'dashboard:progress', event => { authorize(event); return library.listPracticeProgress(); });
  localizedHandle(ipcMain, 'dashboard:delete-progress', async (event, id) => {
    authorize(event);
    const preview = library.practiceDeletionPreview(id);
    if (!window) throw new LocalizedError('Geen hoofdvenster.');
    const answer = await dialog.showMessageBox(window, { type: 'warning', title: t('Bewaarde voortgang verwijderen'), message: t('Voortgang van {0} definitief verwijderen?', preview.title), detail: t('{0} sessies · {1} seconden oefentijd. Deze resultaten verdwijnen uit alle grafieken en totalen. De oefening zelf en andere oefenresultaten blijven behouden. Dit kan niet ongedaan worden gemaakt.', preview.sessions, Math.round(preview.seconds)), buttons: [t('Voortgang verwijderen'), t('Annuleren')], defaultId: 1, cancelId: 1, noLink: true });
    authorize(event);
    if (answer.response !== 0) return false;
    return library.deletePracticeProgress(id, preview.fingerprint);
  });
  localizedHandle(ipcMain, 'dashboard:get', event => { authorize(event); return dashboardPreferences.get(); });
  localizedHandle(ipcMain, 'dashboard:set', (event, value) => { authorize(event); return dashboardPreferences.set(value); });
  localizedHandle(ipcMain, 'sessions:list', event => { authorize(event); return library.listSessions(); });
  localizedHandle(ipcMain, 'sessions:save', (event, id, progress, status) => { authorize(event); return library.saveSession(id, progress, status); });
  localizedHandle(ipcMain, 'sessions:review', (event, id, evaluation) => { authorize(event); return library.reviewSession(id, evaluation); });
  localizedHandle(ipcMain, 'routines:list', event => { authorize(event); return library.listRoutines(); });
  localizedHandle(ipcMain, 'routines:save', (event, input) => { authorize(event); return library.saveRoutine(input); });
  localizedHandle(ipcMain, 'routines:delete', (event, id) => { authorize(event); return library.deleteRoutine(id); });
  localizedHandle(ipcMain, 'library:list', event => { authorize(event); return library.list(); });
  localizedHandle(ipcMain, 'library:delete', (event, id) => { authorize(event); return library.deleteExercise(id); });
  localizedHandle(ipcMain, 'library:save', (event, input) => { authorize(event); return library.save(input); });
  localizedHandle(ipcMain, 'library:fragment-save', (event, id, input) => { authorize(event); return library.saveFragment(id, input); });
  localizedHandle(ipcMain, 'library:fragment-delete', (event, id, fragmentId) => { authorize(event); return library.deleteFragment(id, fragmentId); });
  localizedHandle(ipcMain, 'library:audio', (event, id) => { authorize(event); return library.read(id, 'audio'); });
  localizedHandle(ipcMain, 'library:image', (event, id) => { authorize(event); return library.read(id, 'image'); });
  localizedHandle(ipcMain, 'library:folder', async event => { authorize(event); const error = await shell.openPath(library.root); if (error) throw new LocalizedError("De bibliotheekmap kan niet worden geopend."); });
  function updateMenu() { Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ label: 'HITtheBeat', submenu: [{ label: t('Over HITtheBeat'), role: /** @type {const} */ ('about') }, { type: /** @type {const} */ ('separator') }, { label: t('Afsluiten'), role: /** @type {const} */ ('quit') }] }] : []),
    { label: t("Bewerken"), submenu: [{ label: t('Ongedaan maken'), role: 'undo' }, { label: t('Opnieuw'), role: 'redo' }, { type: 'separator' }, { label: t('Knippen'), role: 'cut' }, { label: t('Kopiëren'), role: 'copy' }, { label: t('Plakken'), role: 'paste' }, { label: t('Alles selecteren'), role: 'selectAll' }] },
    { label: t("Venster"), submenu: [{ label: t('Minimaliseren'), role: 'minimize' }, { label: t('Zoomen'), role: 'zoom' }, { label: t('Sluiten'), role: 'close' }] },
  ])); }
  updateMenu();
  await createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
}).catch((error) => {
  console.error(t("HITtheBeat kon niet starten:"), error);
  app.exit(1);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
