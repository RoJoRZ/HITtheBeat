import { m } from '../../electron/i18n.mjs';
import { useEffect, useState } from 'react';
import type { Exercise } from '../library/types';

export function useNotationContext(item: Exercise) {
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true; setError('');
    void window.hitthebeat?.setNotation({ id: item.id, title: item.title }).catch(() => { if (alive) setError(m("Het tablatuurvenster kan niet worden bijgewerkt.")); });
    return () => { alive = false; void window.hitthebeat?.setNotation(null).catch(() => {}); };
  }, [item.id, item.title, item.updatedAt]);
  return { error, open: () => { void window.hitthebeat?.openNotation().catch(() => setError(m("Het tablatuurvenster kan niet worden geopend."))); } };
}
