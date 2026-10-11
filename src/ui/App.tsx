import { SessionHistory } from './SessionHistory';
import { SessionPlayer } from './SessionPlayer';
import type { SessionRecord } from '../library/types';
import { RoutineScreen } from './RoutineScreen';
import { LibraryScreen } from './LibraryScreen';
import { SettingsScreen } from './SettingsScreen';
import { useEffect, useRef, useState } from 'react';
import { AudioLines, ChartNoAxesColumnIncreasing, CirclePlay, FolderOpen, Music2, Settings } from 'lucide-react';

const pages = {
  routines: { title: 'Mijn oefensessies', subtitle: 'Vind je ritme, ontwikkel je spel.' },
  exercises: { title: 'Oefeningen', subtitle: 'Jouw verzameling oefeningen.' },
  progress: { title: 'Jouw voortgang', subtitle: 'Stap voor stap vooruit.' },
  settings: { title: 'Instellingen', subtitle: 'Jouw app, jouw voorkeuren.' },
} as const;
type Page = keyof typeof pages | 'session';
const navigation = [
  { id: 'routines', label: 'Mijn oefensessies', icon: CirclePlay },
  { id: 'exercises', label: 'Oefeningen', icon: Music2 },
  { id: 'progress', label: 'Voortgang', icon: ChartNoAxesColumnIncreasing },
  { id: 'settings', label: 'Instellingen', icon: Settings },
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
  const current = page === 'session' ? { title: session?.routine.title ?? 'Oefenen', subtitle: 'Jouw hele rondje in de speler.' } : pages[page];
  return (
    <div className={`app-shell${page === 'session' ? ' playing-layout' : ''}`}>
      <a href="#main" className="skip-link">Naar inhoud</a>
      <aside className="sidebar">
        <div className="brand" aria-label="HITtheBeat"><AudioLines aria-hidden="true" /><span><strong>HIT</strong>the<strong>Beat</strong></span></div>
        <nav aria-label="Hoofdnavigatie">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-item" aria-current={page === id || (id === 'routines' && page === 'session') ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={23} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><span className="local-label"><FolderOpen size={17} aria-hidden="true" /> Jouw muziek, dichtbij</span><span className="version">{version ? `HITtheBeat · v${version}` : 'HITtheBeat · Voorvertoning'}</span></div>
      </aside>
      <main id="main" tabIndex={-1}>
        <header className="page-header"><div><p className="eyebrow">JOUW MUZIEKMOMENT</p><h1>{current.title}</h1><p className="subtitle">{current.subtitle}</p></div><span className="header-mark"><AudioLines size={27} aria-hidden="true" /></span></header>
        {sessionError && <p role="alert" className="error">{sessionError}</p>}
        {desktopError && <p role="alert" className="error">De appgegevens konden niet worden geladen. Sluit de app en probeer opnieuw.</p>}
        {page === 'session' && session ? <SessionPlayer session={session} stopRef={stopSession} active={!leaving} leave={() => navigate('routines')} finished={() => setSessionDone(true)} /> : page === 'settings' ? <SettingsScreen /> : page === 'exercises' ? <LibraryScreen /> : page === 'progress' ? <SessionHistory /> : null}
        <div hidden={page !== 'routines'}><RoutineScreen overviewKey={overviewKey} active={page === 'routines'} library={() => setPage('exercises')} start={async routine => { if (starting.current) return; starting.current = true; setSessionError(''); try { const saved = await window.hitthebeat!.startSession(routine.id); setSession(saved); setSessionDone(false); setLeaving(false); setPage('session'); window.scrollTo(0, 0); } catch (reason) { setSessionError(reason instanceof Error ? reason.message : 'Het rondje kon niet starten.'); } finally { starting.current = false; } }} /></div>
        <dialog ref={exitDialog} className="tab-dialog" onCancel={event => { if (stopping) event.preventDefault(); else setLeaving(false); }}><h2>Rondje stoppen?</h2>{sessionError && <p role="alert" className="error">{sessionError}</p>}<p>Je opgeslagen rondje blijft bewaard. Je gespeelde tijd en resultaten worden bewaard als gestopte sessie.</p><div className="row-actions"><button className="secondary" disabled={stopping} onClick={() => { setLeaving(false); exitDialog.current?.close(); }}>Verder oefenen</button><button className="primary" disabled={stopping} onClick={async () => { setStopping(true); setSessionError(''); try { if (!stopSession.current) throw new Error('De speler is nog niet gereed.'); await stopSession.current(); setOverviewKey(value => value + 1); setSession(null); setPage(destination.current); setLeaving(false); exitDialog.current?.close(); } catch { setSessionError('De sessie kon niet worden bewaard. Probeer opnieuw of kies Verder oefenen.'); } finally { setStopping(false); } }}>Stoppen en terug</button></div></dialog>
      </main>
    </div>
  );
}
