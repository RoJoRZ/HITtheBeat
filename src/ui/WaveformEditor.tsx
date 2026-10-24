import { t } from '../../electron/i18n.mjs';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { minimumSelection, selectionRange, timeAt, viewportRange, visiblePeaks, type Waveform } from '../audio/waveform.mjs';
type Range = { a: number; b: number };
export function WaveformEditor({ wave, duration, position, a, b, disabled, select, preview, label }: {
  wave: Waveform | null; duration: number; position: number; a: number; b: number; disabled: boolean;
  select: (range: Range) => void; preview: () => void; label: string;
}) {
  const [view, setView] = useState({ start: 0, end: duration }), [draft, setDraft] = useState<Range | null>(null), [pan, setPan] = useState(false);
  const drag = useRef<{ id: number; kind: 'a'|'b'|'select'|'pan'; anchor: number; initial: Range; view: typeof view; moved: boolean } | null>(null);
  const latest = useRef<Range | null>(null);
  const fallbackCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => fallbackCleanup.current?.(), []);
  useEffect(() => { setView({ start: 0, end: duration }); setDraft(null); drag.current = null; fallbackCleanup.current?.(); }, [wave, duration]);
  const span = view.end - view.start, chosen = draft ?? { a, b };
  const peaks = useMemo(() => visiblePeaks(wave, view.start, view.end), [wave, view.start, view.end]);
  const x = (time: number) => (time - view.start) / (span || 1) * 880;
  const allowed = !disabled && duration >= minimumSelection && Boolean(wave);
  function coordinate(event: Pick<PointerEvent<SVGSVGElement>, 'pointerId' | 'clientX' | 'currentTarget'>) { const rect = event.currentTarget.getBoundingClientRect(); const selected = drag.current?.view ?? view; return timeAt(event.clientX, rect.left, rect.width, selected.start, selected.end); }
  function down(event: PointerEvent<SVGSVGElement>) {
    if (!allowed || event.button !== 0 || drag.current) return;
    const target = (event.target as Element).closest('[data-handle]')?.getAttribute('data-handle');
    const kind = target === 'a' || target === 'b' ? target : pan ? 'pan' : 'select';
    drag.current = { id: event.pointerId, kind, anchor: coordinate(event), initial: { a, b }, view, moved: false }; latest.current = null;
    event.preventDefault();
    try { event.currentTarget.setPointerCapture(event.pointerId); }
    catch {
      // Some input environments cannot acquire capture. Keep tracking outside
      // the SVG without accepting events from another pointer.
      const svg = event.currentTarget, pointerId = event.pointerId, clientX = event.clientX;
      const blur = () => finish({ pointerId, clientX, currentTarget: svg }, true);
      const adapt = (input: globalThis.PointerEvent) => ({ pointerId: input.pointerId, clientX: input.clientX, currentTarget: svg });
      const moving = (input: globalThis.PointerEvent) => move(adapt(input));
      const ending = (input: globalThis.PointerEvent) => finish(adapt(input));
      const cancelling = (input: globalThis.PointerEvent) => finish(adapt(input), true);
      window.addEventListener('pointermove', moving);
      window.addEventListener('pointerup', ending);
      window.addEventListener('pointercancel', cancelling);
      window.addEventListener('blur', blur);
      fallbackCleanup.current = () => {
        window.removeEventListener('pointermove', moving);
        window.removeEventListener('pointerup', ending);
        window.removeEventListener('pointercancel', cancelling);
        window.removeEventListener('blur', blur);
        fallbackCleanup.current = null;
      };
    }
  }
  function move(event: Pick<PointerEvent<SVGSVGElement>, 'pointerId' | 'clientX' | 'currentTarget'>) {
    const gesture = drag.current; if (!gesture || gesture.id !== event.pointerId) return;
    const at = coordinate(event); gesture.moved ||= Math.abs(at - gesture.anchor) > span / 880 * 2;
    if (gesture.kind === 'pan') { setView(viewportRange(gesture.view.start + gesture.anchor - at, gesture.view.end - gesture.view.start, duration)); return; }
    const next = gesture.kind === 'a' ? { a: Math.max(0, Math.min(gesture.initial.b - minimumSelection, at)), b: gesture.initial.b }
      : gesture.kind === 'b' ? { a: gesture.initial.a, b: Math.min(duration, Math.max(gesture.initial.a + minimumSelection, at)) }
      : selectionRange(gesture.anchor, at, duration);
    latest.current = next; setDraft(next);
  }
  function finish(event: Pick<PointerEvent<SVGSVGElement>, 'pointerId' | 'clientX' | 'currentTarget'>, cancelled = false) {
    const gesture = drag.current; if (!gesture || gesture.id !== event.pointerId) return;
    if (!cancelled) move(event); // Release can arrive without a final pointermove.
    if (!cancelled && gesture.kind !== 'pan' && latest.current && gesture.moved) select(latest.current);
    drag.current = null; latest.current = null; setDraft(null); fallbackCleanup.current?.();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function zoom(factor: number) {
    const next = Math.min(duration, Math.max(duration / 64, span * factor));
    const center = (a + b) / 2 >= view.start && (a + b) / 2 <= view.end ? (a + b) / 2 : (view.start + view.end) / 2;
    setView(viewportRange(center - next / 2, next, duration));
  }
  function handleKey(event: React.KeyboardEvent, kind: 'a'|'b') {
    if (!allowed || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const value = event.key === 'Home' ? 0 : event.key === 'End' ? duration : (kind === 'a' ? a : b) + (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? .1 : .01);
    select(kind === 'a' ? { a: Math.max(0, Math.min(b - minimumSelection, value)), b } : { a, b: Math.min(duration, Math.max(a + minimumSelection, value)) });
  }
  return <div className="waveform-editor">
    <div className="waveform-tools"><button className="icon-button" aria-label={t("Waveform uitzoomen")} disabled={!allowed || span >= duration} onClick={() => zoom(2)}><Minus size={18} /></button><span>{Math.round(duration / (span || 1))}{t("×")}</span><button className="icon-button" aria-label={t("Waveform inzoomen")} disabled={!allowed || span <= duration / 64} onClick={() => zoom(.5)}><Plus size={18} /></button><button className="secondary" disabled={!allowed} onClick={() => setView({ start: 0, end: duration })}>{t("Hele track")}</button><button className="secondary" disabled={!allowed} onClick={() => setView(viewportRange(a - (b - a) * .15, (b - a) * 1.3, duration))}>{t("Toon selectie")}</button><button className="secondary" aria-pressed={pan} disabled={!allowed} onClick={() => setPan(value => !value)}>{t("Verschuiven")}</button><button className="secondary" disabled={!allowed} onClick={preview}>{t("Fragment beluisteren")}</button></div>
    <svg className={`waveform interactive-waveform${pan ? ' panning' : ''}`} viewBox="0 0 880 140" role="group" aria-label={t("Waveformselectie")} preserveAspectRatio="none" onPointerDown={down} onPointerMove={move} onPointerUp={finish} onPointerCancel={event => finish(event, true)} onLostPointerCapture={event => finish(event, true)}>
      <defs><clipPath id={`wave-clip-${label.replaceAll(' ', '-')}`}><rect width="880" height="140" /></clipPath></defs>
      <g role="img" aria-label={label} clipPath={`url(#wave-clip-${label.replaceAll(' ', '-')})`}>
        <rect width="880" height="140" fill="transparent" />
        <rect x={x(chosen.a)} width={Math.max(0, x(chosen.b) - x(chosen.a))} height="140" fill="currentColor" opacity=".15" />
        {peaks.map((peak, index) => <line key={index} x1={index * 2 + 1} x2={index * 2 + 1} y1={70 - Math.max(1, peak * 58)} y2={70 + Math.max(1, peak * 58)} stroke="currentColor" strokeWidth="1" opacity={view.start + index / peaks.length * span <= position ? 1 : .45} />)}
        <line x1={x(position)} x2={x(position)} y1="0" y2="140" stroke="#f2f4f6" />
      </g>
      {(['a','b'] as const).map(kind => { const value = chosen[kind]; return value >= view.start && value <= view.end && <g key={kind} data-handle={kind} role="slider" tabIndex={allowed ? 0 : -1} aria-label={kind === 'a' ? t("Beginmarkering A") : t("Eindmarkering B")} aria-valuemin={0} aria-valuemax={duration} aria-valuenow={value} aria-valuetext={t('{0} seconden', value.toFixed(3))} aria-disabled={!allowed} onKeyDown={event => handleKey(event, kind)}>
        <rect x={Math.max(0, Math.min(860, x(value) - 10))} y="0" width="20" height="140" fill="transparent" />
        <line x1={x(value)} x2={x(value)} y1="0" y2="140" stroke="currentColor" strokeWidth="3" />
        <rect x={Math.max(0, Math.min(858, x(value) - 11))} y="1" width="22" height="24" rx="3" fill="currentColor" /><text x={Math.max(11, Math.min(869, x(value)))} y="18" textAnchor="middle" fill="#141719" fontSize="17">{kind.toUpperCase()}</text>
      </g>; })}
    </svg>
    <div className="waveform-pan"><button className="icon-button" aria-label={t("Waveform naar links")} disabled={!allowed || view.start <= 0} onClick={() => setView(viewportRange(view.start - span / 2, span, duration))}><ChevronLeft size={18} /></button><input aria-label={t("Zichtbaar begin (seconden)")} type="range" min="0" max={Math.max(0, duration - span)} step=".001" value={view.start} disabled={!allowed || span >= duration} onChange={event => setView(viewportRange(event.target.valueAsNumber, span, duration))} /><button className="icon-button" aria-label={t("Waveform naar rechts")} disabled={!allowed || view.end >= duration} onClick={() => setView(viewportRange(view.start + span / 2, span, duration))}><ChevronRight size={18} /></button></div>
    <p className="caption" data-testid="waveform-range">{t("Zichtbaar ")}{view.start.toFixed(3)}–{view.end.toFixed(3)}{t(" s · Selectie A ")}{chosen.a.toFixed(3)}{t("–B ")}{chosen.b.toFixed(3)}{t(" s")}</p><p className="caption">{t("Sleep een selectie of de A/B-markeringen. Verschuiven sleept het beeld. Beluisteren speelt de selectie als loop; pauze stopt de preview.")}</p>
  </div>;
}
