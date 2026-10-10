import { SessionHistory } from './SessionHistory';
import { SessionPlayer } from './SessionPlayer';
import type { SessionRecord } from '../library/types';
import { RoutineScreen } from './RoutineScreen';
import { LibraryScreen } from './LibraryScreen';
import { ExampleScreens, type ExamplePage } from './ExampleScreens';
import { findExercise } from './examples';
import { AudioLab } from './AudioLab';
import { useEffect, useRef, useState } from 'react';
import { AudioLines, ChartNoAxesColumnIncreasing, CirclePlay, FolderOpen, Headphones, Music2, Plus, ArrowUpRight } from 'lucide-react';

const pages = {
  routines: { title: 'Mijn oefenrondjes', subtitle: 'Maak ruimte voor je dagelijkse muziek.', empty: 'Jouw eerste oefenrondje', description: 'Bundel straks je oefeningen in een rondje, met je eigen tempo en herhalingen.', action: 'Oefenrondje maken', icon: Headphones },
  exercises: { title: 'Oefeningen', subtitle: 'Jouw verzameling oefeningen.', empty: 'Een plek voor jouw oefeningen', description: 'Hier komen je MP3-bestanden, tablatuur en de opdracht bij elke oefening samen.', action: 'Oefening toevoegen', icon: Music2 },
  progress: { title: 'Jouw voortgang', subtitle: 'Stap voor stap vooruit.', empty: 'Je vooruitgang begint met oefenen', description: 'Hier zie je straks je oefentijd en tempo-ontwikkeling, met ruimte voor hoe het ging.', action: null, icon: ChartNoAxesColumnIncreasing },
} as const;
type Page = ExamplePage | 'audio' | 'session';
const navigation = [
  { id: 'routines', label: 'Mijn oefenrondjes', icon: CirclePlay },
  { id: 'exercises', label: 'Oefeningen', icon: Music2 },
  { id: 'progress', label: 'Voortgang', icon: ChartNoAxesColumnIncreasing },
  { id: 'audio', label: 'Audioproef', icon: AudioLines },
] as const;

export function App() {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [sessionDone, setSessionDone] = useState(false), [leaving, setLeaving] = useState(false);
  const stopSession = useRef<(() => Promise<void>) | null>(null), starting = useRef(false);
  const [sessionError, setSessionError] = useState(''), [stopping, setStopping] = useState(false);
  const exitDialog = useRef<HTMLDialogElement>(null), destination = useRef<Page>('routines');
  function navigate(next: Page) {
    if (page === 'session' && !sessionDone) { destination.current = next; setLeaving(true); exitDialog.current?.showModal(); }
    else { setSession(null); setPage(next); window.scrollTo(0, 0); }
  }
  const [page, setPage] = useState<Page>('routines');
  const [examples, setExamples] = useState(true);
  const [selected, setSelected] = useState('wisselslag');
  const [version, setVersion] = useState('');
  const [desktopError, setDesktopError] = useState(false);
  useEffect(() => {
    if (window.hitthebeat) {
      window.hitthebeat.getAppInfo().then(info => setVersion(info.version)).catch(() => setDesktopError(true));
    }
  }, []);
  const current = page === 'session' ? { ...pages.routines, title: session?.routine.title ?? 'Oefenen', subtitle: 'Jouw hele rondje in de speler.' } : page === 'audio' ? { ...pages.routines, title: 'Jouw muziek, jouw tempo', subtitle: 'Een eerste proef met de audiomotor.' } : page === 'player' ? { ...pages.routines, title: findExercise(selected).title, subtitle: 'Ruimte voor je muziek.' } : page === 'evaluation' ? { ...pages.routines, title: 'Even terugkijken', subtitle: 'Een kleine stap naar de volgende keer.' } : pages[page];
  const EmptyIcon = current.icon;
  return (
    <div className={`app-shell${page === 'player' || page === 'session' ? ' playing-layout' : ''}`}>
      <a href="#main" className="skip-link">Naar inhoud</a>
      <aside className="sidebar">
        <div className="brand" aria-label="HITtheBeat"><AudioLines aria-hidden="true" /><span><strong>HIT</strong>the<strong>Beat</strong></span></div>
        <nav aria-label="Hoofdnavigatie">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-item" aria-current={page === id || (id === 'routines' && (page === 'player' || page === 'evaluation' || page === 'session')) ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={23} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><span className="local-label"><FolderOpen size={17} aria-hidden="true" /> Jouw muziek, dichtbij</span><span className="version">{version ? `HITtheBeat · v${version}` : 'HITtheBeat · Voorvertoning'}</span></div>
      </aside>
      <main id="main" tabIndex={-1}>
        <header className="page-header"><div><p className="eyebrow">JOUW OEFENPLEK</p><h1>{current.title}</h1><p className="subtitle">{current.subtitle}</p></div><span className="header-mark"><AudioLines size={27} aria-hidden="true" /></span></header>
        {sessionError && <p role="alert" className="error">{sessionError}</p>}
        {desktopError && <p role="alert" className="error">De appgegevens konden niet worden geladen. Sluit de app en probeer opnieuw.</p>}
        {page !== 'audio' && page !== 'session' && <div className="example-banner"><div><strong>{examples ? 'Voorbeeldschermen' : 'Eigen bibliotheek'}</strong><span>{examples ? 'Alle oefeningen, opbouw en resultaten zijn voorbeelden. Wijzigingen worden niet opgeslagen.' : 'Je oefeningen en rondjes worden lokaal bewaard.'}</span></div><button className="secondary" onClick={() => { setExamples(!examples); if (page === 'player' || page === 'evaluation') setPage('routines'); }}>{examples ? 'Eigen bibliotheek bekijken' : 'Voorbeeldschermen bekijken'}</button></div>}
        {page === 'session' && session ? <SessionPlayer session={session} stopRef={stopSession} active={!leaving} leave={() => navigate('routines')} finished={() => setSessionDone(true)} /> : page === 'session' ? null : page === 'audio' ? <AudioLab /> : examples ? <ExampleScreens page={page} navigate={next => { setPage(next); window.scrollTo(0, 0); }} selected={selected} select={setSelected} /> : page === 'exercises' ? <LibraryScreen /> : page === 'routines' ? null : page === 'progress' ? <SessionHistory /> : <><section className="empty-panel" aria-labelledby="empty-heading" key={page}>
          <div className="empty-icon"><EmptyIcon size={42} strokeWidth={1.4} aria-hidden="true" /></div>
          <p className="eyebrow">ELKE OEFENING TELT</p>
          <h2 id="empty-heading">{current.empty}</h2>
          <p className="empty-description">{current.description}</p>
          {current.action && <button className="primary" disabled><Plus size={20} aria-hidden="true" />{current.action}</button>}
          <p className="preview-note">Dit is de eerste proefversie. Eigen oefeningen voeg je toe in de bibliotheek. Rondjes bewaren en uitvoeren volgen later.</p>
        </section>
        <section className="below-panel" aria-label="Over je oefenplek"><div><span className="small-icon"><Music2 size={21} aria-hidden="true" /></span><div><h2>Jouw oefeningen, jouw tempo</h2><p>Van rustig beginnen tot die lastige passage.</p></div></div></section></>}
        <div hidden={examples || page !== 'routines'}><RoutineScreen active={!examples && page === 'routines'} library={() => setPage('exercises')} start={async routine => { if (starting.current) return; starting.current = true; setSessionError(''); try { const saved = await window.hitthebeat!.startSession(routine.id); setSession(saved); setSessionDone(false); setLeaving(false); setPage('session'); window.scrollTo(0, 0); } catch (reason) { setSessionError(reason instanceof Error ? reason.message : 'Het rondje kon niet starten.'); } finally { starting.current = false; } }} /></div>
        <dialog ref={exitDialog} className="tab-dialog" onCancel={event => { if (stopping) event.preventDefault(); else setLeaving(false); }}><h2>Rondje stoppen?</h2>{sessionError && <p role="alert" className="error">{sessionError}</p>}<p>Je opgeslagen rondje blijft bewaard. Je gespeelde tijd en resultaten worden bewaard als gestopte sessie.</p><div className="row-actions"><button className="secondary" disabled={stopping} onClick={() => { setLeaving(false); exitDialog.current?.close(); }}>Verder oefenen</button><button className="primary" disabled={stopping} onClick={async () => { setStopping(true); setSessionError(''); try { if (!stopSession.current) throw new Error('De speler is nog niet gereed.'); await stopSession.current(); setSession(null); setPage(destination.current); setLeaving(false); exitDialog.current?.close(); } catch { setSessionError('De sessie kon niet worden bewaard. Probeer opnieuw of kies Verder oefenen.'); } finally { setStopping(false); } }}>Stoppen en terug</button></div></dialog>
      </main>
    </div>
  );
}
