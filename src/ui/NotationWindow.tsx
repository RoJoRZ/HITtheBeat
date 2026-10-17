import {getLanguage} from '../../electron/i18n.mjs';
import { t, m, messageText } from '../../electron/i18n.mjs';
import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Minus, Plus, X } from 'lucide-react';
import type { NotationState } from '../../electron/notation-window.mjs';

export function NotationWindow() {
  const [state, setState] = useState<NotationState>({ version: -1, context: 0, title: '', image: null, loading: true, error: '', fullscreen: false });
  const [url, setUrl] = useState(''), [zoom, setZoom] = useState(1), [error, setError] = useState('');
  const [natural, setNatural] = useState({ width: 1, height: 1 }), [size, setSize] = useState({ width: 1, height: 1 });
  const viewport = useRef<HTMLDivElement>(null);
  const api = window.notationViewer;
  useEffect(() => {
    if (!api) { setError(m("Open de tablatuur vanuit HITtheBeat.")); return; }
    let alive = true;
    const receive = (next: NotationState) => { if (alive) setState(previous => next.version > previous.version ? next : previous); };
    const unsubscribe = api.onChange(receive);
    void api.getState().then(receive).catch(() => { if (alive) setError(m("De tablatuur kan niet worden geladen.")); });
    return () => { alive = false; unsubscribe(); };
  }, []);
  useEffect(() => {
    if (state.context > 0) setError('');
    setUrl(''); setZoom(1); setNatural({ width: 1, height: 1 });
    if (!state.image) return;
    const next = URL.createObjectURL(new Blob([new Uint8Array(state.image.bytes)], { type: state.image.mime }));
    setUrl(next);
    if (viewport.current) viewport.current.scrollTo(0, 0);
    return () => URL.revokeObjectURL(next);
  }, [state.context, Boolean(state.image)]);
  useEffect(() => {
    const element = viewport.current; if (!element) return;
    const observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; setSize({ width, height }); });
    observer.observe(element); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    document.title = state.title ? t("{0} — Tablatuur — HITtheBeat", state.title) : t("Tablatuur — HITtheBeat");
  }, [state.title, getLanguage()]);
  const fit = Math.max(.001, Math.min((size.width - 48) / natural.width, (size.height - 48) / natural.height, 1));
  function changeZoom(factor: number) { setZoom(value => Math.max(.25, Math.min(8, Math.round(value * factor * 100) / 100))); }
  function fullscreen() { void api?.toggleFullscreen().catch(() => setError(m("Volledig scherm kan niet worden gewijzigd."))); }
  return <div className="notation-window" onKeyDown={event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (['+','=', '-', '0', 'f','F'].includes(event.key) || (event.key === 'Escape' && state.fullscreen)) {
      event.preventDefault();
      if (event.key === '+' || event.key === '=') changeZoom(1.25);
      else if (event.key === '-') changeZoom(.8);
      else if (event.key === '0') setZoom(1);
      else fullscreen();
    }
  }}>
    <header className="notation-toolbar"><div><p className="eyebrow">{t("TABLATUUR")}</p><h1>{state.title || t("Geen oefening actief")}</h1></div><div className="notation-actions" aria-label={t("Tablatuurbediening")}>
      <button className="icon-button" aria-label={t("Uitzoomen")} disabled={!url || zoom <= .25} onClick={() => changeZoom(.8)}><Minus size={20} /></button>
      <output aria-label={t("Afbeeldingszoom")}>{Math.round(zoom * 100)}%</output>
      <button className="icon-button" aria-label={t("Inzoomen")} disabled={!url || zoom >= 8} onClick={() => changeZoom(1.25)}><Plus size={20} /></button>
      <button className="secondary" disabled={!url} onClick={() => setZoom(1)}>{t("Passend")}</button>
      <button className="icon-button" aria-label={state.fullscreen ? t("Volledig scherm verlaten") : t("Volledig scherm")} onClick={fullscreen}>{state.fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
      <button className="icon-button" aria-label={t("Tablatuurvenster sluiten")} onClick={() => void api?.close().catch(() => setError(m("Sluiten is niet gelukt.")))}><X size={20} /></button>
    </div></header>
    {(error || state.error) && <p className="error" role="alert">{messageText(error || state.error)}</p>}
    <div className="notation-viewport" ref={viewport} aria-label={t("Vergrote tablatuur")} aria-busy={state.loading}>
      {url ? <div className="notation-canvas"><img src={url} alt={t("Tablatuur bij {0}", state.title)} draggable={false} style={{ width: natural.width * fit * zoom, height: natural.height * fit * zoom }} onLoad={event => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => { setUrl(''); setError(m("Deze afbeelding kan niet worden getoond.")); }} /></div> : <p className="notation-empty">{state.loading ? t("Tablatuur laden…") : state.title ? t("Geen tablatuur bij deze oefening.") : t("Kies een oefening om de tablatuur te bekijken.")}</p>}
    </div>
    <footer className="notation-footer">{t("Volgt de actieve oefening · + / −: zoomen · 0: passend · F: volledig scherm · Sluiten laat de sessie doorspelen")}</footer>
  </div>;
}
