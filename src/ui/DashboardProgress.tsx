import { useEffect, useState } from 'react';
import { t, m, messageText } from '../../electron/i18n.mjs';
import { durationLabel } from './controls';
type Item = Awaited<ReturnType<NonNullable<Window['hitthebeat']>['listPracticeProgress']>>[number];
export function DashboardProgress() {
  const [items, setItems] = useState<Item[]>([]), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState('');
  useEffect(() => { let alive = true; window.hitthebeat!.listPracticeProgress().then(value => { if (alive) setItems(value); }).catch(() => { if (alive) setError(m('De voortgang kon niet worden geladen. Open Instellingen opnieuw.')); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, []);
  async function remove(item: Item) {
    setBusy(true); setError(''); setDone('');
    try {
      if (await window.hitthebeat!.deletePracticeProgress(item.id)) setDone(item.title);
      setItems(await window.hitthebeat!.listPracticeProgress());
    } catch { setError(m('De voortgang kon niet worden verwijderd. Stop een eventuele sessie en open Instellingen opnieuw.')); }
    finally { setBusy(false); }
  }
  return <div aria-busy={loading || busy}><h3>{t('Bewaarde voortgang verwijderen')}</h3><p>{t('Verwijder historische resultaten per oefening. De oefening zelf blijft behouden; nieuwe training verschijnt weer in het dashboard.')}</p>
    {loading ? <p role="status">{t('Voortgang laden…')}</p> : !items.length ? <p>{t('Geen bewaarde oefenresultaten.')}</p> : <div className="table-scroll"><table className="history-table"><thead><tr><th>{t('Oefening')}</th><th>{t('Sessies')}</th><th>{t('Oefentijd')}</th><th>{t('Actie')}</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{item.title}</td><td>{item.sessions}</td><td>{durationLabel(item.seconds)}</td><td><button className="secondary" disabled={busy || item.running} aria-label={t('Voortgang van {0} verwijderen', item.title)} onClick={() => void remove(item)}>{t('Voortgang verwijderen')}</button>{item.running && <p className="caption">{t('Stop eerst de lopende sessie voordat je voortgang verwijdert.')}</p>}</td></tr>)}</tbody></table></div>}
    {error && <p role="alert" className="error">{messageText(error)}</p>}{done && <p role="status">{t('De bewaarde voortgang van {0} is verwijderd.', done)}</p>}
  </div>;
}
