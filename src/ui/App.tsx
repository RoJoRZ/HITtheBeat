import { AboutDialog } from './AboutDialog';
import {LanguagePicker} from './LanguagePicker';
import { t, m, errorMessage, messageText, LocalizedError } from '../../electron/i18n.mjs';
import { SessionHistory } from './SessionHistory';
import { SessionPlayer } from './SessionPlayer';
import type { SessionRecord } from '../library/types';
import { RoutineScreen } from './RoutineScreen';
import { LibraryScreen } from './LibraryScreen';
import { SettingsScreen } from './SettingsScreen';
import { useEffect, useRef, useState } from 'react';
import { AudioLines, ChartNoAxesColumnIncreasing, CirclePlay, FolderOpen, Music2, Settings } from 'lucide-react';

const pages = {
  routines: { get title() { return t("Mijn oefensessies"); }, get subtitle() { return t("Vind je ritme, ontwikkel je spel."); } },
  exercises: { get title() { return t("Oefeningen"); }, get subtitle() { return t("Jouw verzameling oefeningen."); } },
  progress: { get title() { return t("Jouw voortgang"); }, get subtitle() { return t("Stap voor stap vooruit."); } },
  settings: { get title() { return t("Instellingen"); }, get subtitle() { return t("Jouw app, jouw voorkeuren."); } },
} as const;
type Page = keyof typeof pages | 'session';
const navigation = [
  { id: 'routines', get label() { return t("Mijn oefensessies"); }, icon: CirclePlay },
  { id: 'exercises', get label() { return t("Oefeningen"); }, icon: Music2 },
  { id: 'progress', get label() { return t("Voortgang"); }, icon: ChartNoAxesColumnIncreasing },
  { id: 'settings', get label() { return t("Instellingen"); }, icon: Settings },
] as const;

export function App() {
  const [overviewKey, setOverviewKey] = useState(0);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [sessionDone, setSessionDone] = useState(false), [leaving, setLeaving] = useState(false);
  const stopSession = useRef<(() => Promise<void>) | null>(null), starting = useRef(false);
  const [sessionError, setSessionError] = useState(''), [stopping, setStopping] = useState(false);
  const exitDialog = useRef<HTMLDialogElement>(null), destination = useRef<Page>('routines');
  function navigate(next: Page) {
    if (page === 'session' && !sessionDone) { destination.current = next; setLeaving(true); exitDialog.current?.showModal(); }
    else { if (page === 'session') setOverviewKey(value => value + 1); setSession(null); setPage(next); window.scrollTo(0, 0); }
  }
  const [page, setPage] = useState<Page>('routines');
  const [version, setVersion] = useState('');
  const [desktopError, setDesktopError] = useState(false);
  useEffect(() => {
    if (window.hitthebeat) {
      window.hitthebeat.getAppInfo().then(info => setVersion(info.version)).catch(() => setDesktopError(true));
    }
  }, []);
  const current = page === 'session' ? { title: session?.routine.title ?? t("Oefenen"), subtitle: t("Jouw hele sessie in de speler.") } : pages[page];
  return (
    <div className={`app-shell${page === 'session' ? ' playing-layout' : ''}`}>
      <a href="#main" className="skip-link">{t("Naar inhoud")}</a>
      <aside className="sidebar">
        <div className="brand" aria-label="HITtheBeat"><AudioLines aria-hidden="true" /><span><strong>HIT</strong>{t("the")}<strong>Beat</strong></span></div>
        <nav aria-label={t("Hoofdnavigatie")}>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-item" aria-current={page === id || (id === 'routines' && page === 'session') ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={23} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><AboutDialog version={version} /><span className="local-label"><FolderOpen size={17} aria-hidden="true" />{t(" Jouw muziek, dichtbij")}</span><span className="version">{version ? t("HITtheBeat · v{0}", version) : t("HITtheBeat · Voorvertoning")}</span></div>
      </aside>
      <main id="main" tabIndex={-1}>
        <header className="page-header"><div><p className="eyebrow">{t("JOUW MUZIEKMOMENT")}</p><h1>{current.title}</h1><p className="subtitle">{current.subtitle}</p></div><div className="header-preferences"><LanguagePicker compact /><span className="header-mark"><AudioLines size={27} aria-hidden="true" /></span></div></header>
        {sessionError && <p role="alert" className="error">{messageText(sessionError)}</p>}
        {desktopError && <p role="alert" className="error">{t("De appgegevens konden niet worden geladen. Sluit de app en probeer opnieuw.")}</p>}
        {page === 'session' && session ? <SessionPlayer session={session} stopRef={stopSession} active={!leaving} leave={() => navigate('routines')} finished={() => setSessionDone(true)} /> : page === 'settings' ? <SettingsScreen /> : page === 'exercises' ? <LibraryScreen /> : page === 'progress' ? <SessionHistory /> : null}
        <div hidden={page !== 'routines'}><RoutineScreen overviewKey={overviewKey} active={page === 'routines'} library={() => setPage('exercises')} start={async routine => { if (starting.current) return; starting.current = true; setSessionError(''); try { const saved = await window.hitthebeat!.startSession(routine.id); setSession(saved); setSessionDone(false); setLeaving(false); setPage('session'); window.scrollTo(0, 0); } catch (reason) { setSessionError(reason instanceof Error ? errorMessage(reason) : m("De sessie kon niet starten.")); } finally { starting.current = false; } }} /></div>
        <dialog ref={exitDialog} className="tab-dialog" onCancel={event => { if (stopping) event.preventDefault(); else setLeaving(false); }}><h2>{t("Sessie stoppen?")}</h2>{sessionError && <p role="alert" className="error">{messageText(sessionError)}</p>}<p>{t("Je opgeslagen sessie blijft bewaard. Je gespeelde tijd en resultaten worden bewaard als gestopte sessie.")}</p><div className="row-actions"><button className="secondary" disabled={stopping} onClick={() => { setLeaving(false); exitDialog.current?.close(); }}>{t("Verder oefenen")}</button><button className="primary" disabled={stopping} onClick={async () => { setStopping(true); setSessionError(''); try { if (!stopSession.current) throw new LocalizedError("De speler is nog niet gereed."); await stopSession.current(); setOverviewKey(value => value + 1); setSession(null); setPage(destination.current); setLeaving(false); exitDialog.current?.close(); } catch { setSessionError(m("De sessie kon niet worden bewaard. Probeer opnieuw of kies Verder oefenen.")); } finally { setStopping(false); } }}>{t("Stoppen en terug")}</button></div></dialog>
      </main>
    </div>
  );
}
