import { AudioLab } from './AudioLab';
import { useEffect, useState } from 'react';
import { AudioLines, ChartNoAxesColumnIncreasing, CirclePlay, FolderOpen, Headphones, Music2, Plus, ArrowUpRight } from 'lucide-react';

const pages = {
  routines: { title: 'Mijn oefenrondjes', subtitle: 'Maak ruimte voor je dagelijkse muziek.', empty: 'Jouw eerste oefenrondje', description: 'Bundel straks je oefeningen in een rondje, met je eigen tempo en herhalingen.', action: 'Oefenrondje maken', icon: Headphones },
  exercises: { title: 'Oefeningen', subtitle: 'Jouw verzameling oefeningen.', empty: 'Een plek voor jouw oefeningen', description: 'Hier komen je MP3-bestanden, tablatuur en de opdracht bij elke oefening samen.', action: 'Oefening toevoegen', icon: Music2 },
  progress: { title: 'Jouw voortgang', subtitle: 'Stap voor stap vooruit.', empty: 'Je vooruitgang begint met oefenen', description: 'Hier zie je straks je oefentijd en tempo-ontwikkeling, met ruimte voor hoe het ging.', action: null, icon: ChartNoAxesColumnIncreasing },
} as const;
type Page = keyof typeof pages | 'audio';
const navigation = [
  { id: 'audio', label: 'Audioproef', icon: AudioLines },
  { id: 'routines', label: 'Mijn oefenrondjes', icon: CirclePlay },
  { id: 'exercises', label: 'Oefeningen', icon: Music2 },
  { id: 'progress', label: 'Voortgang', icon: ChartNoAxesColumnIncreasing },
] as const;

export function App() {
  const [page, setPage] = useState<Page>('routines');
  const [version, setVersion] = useState('');
  const [desktopError, setDesktopError] = useState(false);
  useEffect(() => {
    if (window.hitthebeat) {
      window.hitthebeat.getAppInfo().then(info => setVersion(info.version)).catch(() => setDesktopError(true));
    }
  }, []);
  const current = page === 'audio' ? { ...pages.routines, title: 'Jouw muziek, jouw tempo', subtitle: 'Een eerste proef met de audiomotor.' } : pages[page];
  const EmptyIcon = current.icon;
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Naar inhoud</a>
      <aside className="sidebar">
        <div className="brand" aria-label="HITtheBeat"><AudioLines aria-hidden="true" /><span><strong>HIT</strong>the<strong>Beat</strong></span></div>
        <nav aria-label="Hoofdnavigatie">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-item" aria-current={page === id ? 'page' : undefined} onClick={() => setPage(id)}>
              <Icon size={23} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><span className="local-label"><FolderOpen size={17} aria-hidden="true" /> Jouw muziek, dichtbij</span><span className="version">{version ? `HITtheBeat · v${version}` : 'HITtheBeat · Voorvertoning'}</span></div>
      </aside>
      <main id="main" tabIndex={-1}>
        <header className="page-header"><div><p className="eyebrow">JOUW OEFENPLEK</p><h1>{current.title}</h1><p className="subtitle">{current.subtitle}</p></div><span className="header-mark"><AudioLines size={27} aria-hidden="true" /></span></header>
        {desktopError && <p role="alert" className="error">De appgegevens konden niet worden geladen. Sluit de app en probeer opnieuw.</p>}
        {page === 'audio' ? <AudioLab /> : <><section className="empty-panel" aria-labelledby="empty-heading" key={page}>
          <div className="empty-icon"><EmptyIcon size={42} strokeWidth={1.4} aria-hidden="true" /></div>
          <p className="eyebrow">{page === 'routines' ? 'IN JOUW RITME' : page === 'exercises' ? 'JOUW BIBLIOTHEEK' : 'ELKE OEFENING TELT'}</p>
          <h2 id="empty-heading">{current.empty}</h2>
          <p className="empty-description">{current.description}</p>
          {current.action && <button className="primary" disabled><Plus size={20} aria-hidden="true" />{current.action}</button>}
          <p className="preview-note">Dit is de eerste proefversie. Oefeningen toevoegen en afspelen volgen in de volgende stappen.</p>
        </section>
        <section className="below-panel" aria-label="Over je oefenplek"><div><span className="small-icon"><Music2 size={21} aria-hidden="true" /></span><div><h2>Jouw oefeningen, jouw tempo</h2><p>Van rustig beginnen tot die lastige passage.</p></div></div>{page === 'routines' && <button className="text-button" onClick={() => setPage('exercises')}>Naar oefeningen <ArrowUpRight size={18} aria-hidden="true" /></button>}</section></>}
      </main>
    </div>
  );
}
