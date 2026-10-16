import { t } from '../../electron/i18n.mjs';
import { bpmText } from '../../electron/tempo-display.mjs';
import { useEffect, useRef, useState } from 'react';
import type { Evaluation } from '../library/types';

type Choice = 'same' | 'faster' | 'slower';
export function SessionReview({ disabled, choice, setChoice, delta, setDelta, rating, setRating, note, setNote, preview, invalid, submit, nextLabel, tempoRule = t("25–300% van het originele BPM") }: {
  disabled: boolean; choice: Choice; setChoice: (value: Choice) => void;
  delta: number; setDelta: (value: number) => void; rating: number; setRating: (value: number) => void;
  note: string; setNote: (value: string) => void; preview: string; invalid: boolean;
  submit: (action: Evaluation['action']) => void; nextLabel: string; tempoRule?: string;
}) {
  const root = useRef<HTMLDivElement>(null), tempo = useRef<HTMLFieldSetElement>(null), amount = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState('rating');
  useEffect(() => { root.current?.focus(); }, []);
  function grade(value: number) { setRating(value); setStage('tempo'); tempo.current?.focus(); }
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
    if (stage === 'rating' && /^[1-5]$/.test(event.key)) { event.preventDefault(); grade(Number(event.key)); }
    else if (stage === 'tempo' && /^[1-3]$/.test(event.key)) { event.preventDefault(); speed(({ '1': 'slower', '2': 'same', '3': 'faster' } as const)[event.key as '1'|'2'|'3']); }
  }}>
    <p className="caption">{t("Cijfer → tempo → aantal BPM. Enter bewaart je keuzes en gaat door. Standaard: 3/5 en tempo gelijk.")}</p>
    <fieldset disabled={disabled} data-review-stage="rating" className={`review-step${stage === 'rating' ? ' active' : ''}`}><legend>{t("1. Hoe ging het? ")}<span className="caption">{t("Cijfertoetsen 1–5")}</span></legend><div className="review-options">{[1,2,3,4,5].map(value => <button type="button" className="secondary" aria-label={t("Beoordeling {0} van 5", value)} aria-pressed={rating === value} key={value} onClick={() => grade(value)}>{value}</button>)}</div></fieldset>
    <fieldset ref={tempo} tabIndex={-1} disabled={disabled} data-review-stage="tempo" className={`review-step${stage === 'tempo' ? ' active' : ''}`}><legend>{t("2. Volgende keer ")}<span className="caption">{t("Cijfertoetsen 1–3")}</span></legend><div className="review-options">{([{ value: 'slower', label: t("1 · Langzamer") }, { value: 'same', label: t("2 · Gelijk houden") }, { value: 'faster', label: t("3 · Sneller") }] as const).map(option => <button type="button" className="secondary" aria-pressed={choice === option.value} key={option.value} onClick={() => speed(option.value)}>{option.label}</button>)}</div></fieldset>
    {choice !== 'same' && <div data-review-stage="amount" className={`review-step${stage === 'amount' ? ' active' : ''}`}><label>{t("3. Aanpassing in BPM")}<input ref={amount} disabled={disabled} type="number" min="1" max="1000" step="1" value={Number.isFinite(delta) ? bpmText(delta) : ''} onChange={event => setDelta(Math.round(event.target.valueAsNumber))} /></label><p data-testid="tempo-preview">{preview}{t(" BPM")}</p><p className="caption">{t("Geldt voor alle stappen en herhalingen van alleen deze oefening in deze sessie. Deze huidige sessie blijft op de oorspronkelijke tempo’s spelen.")}</p>{invalid && <p role="alert" className="error">{t("Kies een positieve aanpassing van maximaal 1000 BPM waarmee alle stappen binnen ")}{tempoRule}{t(" blijven.")}</p>}</div>}
    <label className="review-note" data-review-stage="note">{t("Notitie (optioneel)")}<textarea disabled={disabled} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label>
    <div className="row-actions"><button className="secondary" disabled={disabled} onClick={() => submit('repeat')}>{t("Deze serie opnieuw")}</button><button className="primary" aria-label={nextLabel} disabled={disabled || invalid} onClick={() => submit(choice)}>{nextLabel}{t(" · Enter")}</button></div>
  </div>;
}
