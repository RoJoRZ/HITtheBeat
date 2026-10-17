import { t, m, messageText } from '../../electron/i18n.mjs';
import { useEffect, useState } from 'react';
import type { SessionRecord } from '../library/types';
import { ProgressDashboard } from './ProgressDashboard';
import type { Period } from '../library/progress.mjs';

export function SessionHistory() {
  const [period, setPeriod] = useState<Period>('week');
  const [sessions, setSessions] = useState<SessionRecord[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => { let alive = true; window.hitthebeat?.listSessions().then(items => { if (alive) setSessions(items); }).catch(() => { if (alive) setError(m("De sessiehistorie kon niet worden geladen. Open dit scherm opnieuw om het te proberen.")); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, []);
  return <div className="screen-stack session-history" aria-busy={loading}>{loading && <p role="status">{t("Voortgang laden…")}</p>}{!loading && !error && <ProgressDashboard sessions={sessions} period={period} changePeriod={setPeriod} />}{error && <p role="alert" className="error">{messageText(error)}</p>}</div>;
}
