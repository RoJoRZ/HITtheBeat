import { t } from '../../electron/i18n.mjs';
import { bpmText } from '../../electron/tempo-display.mjs';
import { useEffect, useRef, useState } from 'react';
import type { Evaluation } from '../library/types';

type Choice = 'same' | 'faster' | 'slower';
export function SessionReview({ disabled, choice, setChoice, delta, setDelta, preview, invalid, submit, nextLabel, tempoRule = t("25–300% van het originele BPM") }: {
  disabled: boolean; choice: Choice; setChoice: (value: Choice) => void;
  delta: number; setDelta: (value: number) => void;
  preview: string; invalid: boolean;
  submit: (action: Evaluation['action']) => void; nextLabel: string; tempoRule?: string;
}) {
  const root = useRef<HTMLDivElement>(null), tempo = useRef<HTMLFieldSetElement>(null), amount = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState('tempo');
  useEffect(() => { root.current?.focus(); }, []);
  function speed(value: Choice) {
    setChoice(value); setStage(value === 'same' ? 'tempo' : 'amount');
    if (value !== 'same') requestAnimationFrame(() => { amount.current?.focus(); amount.current?.select(); });
  }
  return <div ref={root} tabIndex={-1} className="review-controls" aria-label={t("Evaluatie met toetsenbord")} onFocusCapture={event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-review-stage]');
    if (target) setStage(target.dataset.reviewStage!);
  }} onKeyDown={event => {
    if (disabled || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); submit(choice); return; }
    if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable]')) return;
    if (stage === 'tempo' && /^[1-3]$/.test(event.key)) { event.preventDefault(); speed(({ '1': 'slower', '2': 'same', '3': 'faster' } as const)[event.key as '1'|'2'|'3']); }
  }}>
    <p className="caption">{t("Tempo → aantal BPM. Enter bewaart je keuze en gaat door. Standaard: tempo gelijk.")}</p>
    <fieldset ref={tempo} tabIndex={-1} disabled={disabled} data-review-stage="tempo" className={`review-step${stage === 'tempo' ? ' active' : ''}`}><legend>{t("1. Volgende keer ")}<span className="caption">{t("Cijfertoetsen 1–3")}</span></legend><div className="review-options">{([{ value: 'slower', label: t("1 · Langzamer") }, { value: 'same', label: t("2 · Gelijk houden") }, { value: 'faster', label: t("3 · Sneller") }] as const).map(option => <button type="button" className="secondary" aria-pressed={choice === option.value} key={option.value} onClick={() => speed(option.value)}>{option.label}</button>)}</div></fieldset>
    {choice !== 'same' && <div data-review-stage="amount" className={`review-step${stage === 'amount' ? ' active' : ''}`}><label>{t("2. Aanpassing in BPM")}<input ref={amount} disabled={disabled} type="number" min="1" max="1000" step="1" value={Number.isFinite(delta) ? bpmText(delta) : ''} onChange={event => setDelta(Math.round(event.target.valueAsNumber))} /></label><p data-testid="tempo-preview">{preview}{t(" BPM")}</p><p className="caption">{t("Geldt voor alle stappen en herhalingen van alleen deze oefening in deze sessie. Deze huidige sessie blijft op de oorspronkelijke tempo’s spelen.")}</p>{invalid && <p role="alert" className="error">{t("Kies een positieve aanpassing van maximaal 1000 BPM waarmee alle stappen binnen ")}{tempoRule}{t(" blijven.")}</p>}</div>}
    <div className="row-actions"><button className="secondary" disabled={disabled} onClick={() => submit('repeat')}>{t("Deze serie opnieuw")}</button><button className="primary" aria-label={nextLabel} disabled={disabled || invalid} onClick={() => submit(choice)}>{nextLabel}{t(" · Enter")}</button></div>
  </div>;
}
