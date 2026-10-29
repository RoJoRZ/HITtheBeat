import { t } from '../../electron/i18n.mjs';
import { bpmText } from '../../electron/tempo-display.mjs';
import { useEffect, useRef, useState } from 'react';
import type { Evaluation } from '../library/types';

type Choice = 'same' | 'faster' | 'slower';
export function SessionReview({ disabled, choice, setChoice, delta, setDelta, preview, invalid, submit, nextLabel, audioModes, setAudioModes, stepLabels = [], tempoRule = t("25–300% van het originele BPM") }: {
  audioModes?: ('audio'|'metronome')[]; setAudioModes?: (modes: ('audio'|'metronome')[]) => void; stepLabels?: string[];
  disabled: boolean; choice: Choice; setChoice: (value: Choice) => void;
  delta: number; setDelta: (value: number) => void;
  preview: string; invalid: boolean;
  submit: (action: Evaluation['action']) => void; nextLabel: string; tempoRule?: string;
}) {
  const root = useRef<HTMLDivElement>(null), tempo = useRef<HTMLFieldSetElement>(null), amount = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState(audioModes ? 'menu' : 'tempo');
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
    if (stage === 'menu' && ['1','2'].includes(event.key)) { event.preventDefault(); setStage(event.key === '1' ? 'tempo' : 'sound'); return; }
    if (stage === 'tempo' && /^[1-3]$/.test(event.key)) { event.preventDefault(); speed(({ '1': 'slower', '2': 'same', '3': 'faster' } as const)[event.key as '1'|'2'|'3']); }
  }}>
    {audioModes && <div className="review-options"><button type="button" className="secondary" disabled={disabled} aria-pressed={stage === 'tempo' || stage === 'amount'} onClick={() => setStage('tempo')}>{t("Tempo aanpassen")}</button><button type="button" className="secondary" disabled={disabled} aria-pressed={stage === 'sound'} onClick={() => setStage('sound')}>{t("Audio/metronoom kiezen")}</button></div>}
    {audioModes && stage === 'menu' && <p className="caption">{t("1: tempo · 2: audio/metronoom · Enter: ongewijzigd doorgaan")}</p>}
    {audioModes && stage === 'sound' && <fieldset disabled={disabled} className="review-step"><legend>{t("Audio per stap")}</legend>{audioModes.map((mode, index) => <label key={index} className="normalization-choice"><input type="checkbox" checked={mode === 'metronome'} onChange={event => setAudioModes?.(audioModes.map((value, i) => i === index ? event.target.checked ? 'metronome' : 'audio' : value))} />{stepLabels[index]} · {t("Alleen metronoom")}</label>)}<p className="caption">{t("Vanaf de volgende gespeelde herhaling in deze sessie. Het aantal tellen blijft gelijk; de duur volgt het BPM. Uitgevinkt speelt de audio.")}</p></fieldset>}
    {(!audioModes || stage === 'tempo' || stage === 'amount') && <><p className="caption">{t("Tempo → aantal BPM. Enter bewaart je keuze en gaat door. Standaard: tempo gelijk.")}</p>
    <fieldset ref={tempo} tabIndex={-1} disabled={disabled} data-review-stage="tempo" className={`review-step${stage === 'tempo' ? ' active' : ''}`}><legend>{t("1. Volgende keer ")}<span className="caption">{t("Cijfertoetsen 1–3")}</span></legend><div className="review-options">{([{ value: 'slower', label: t("1 · Langzamer") }, { value: 'same', label: t("2 · Gelijk houden") }, { value: 'faster', label: t("3 · Sneller") }] as const).map(option => <button type="button" className="secondary" aria-pressed={choice === option.value} key={option.value} onClick={() => speed(option.value)}>{option.label}</button>)}</div></fieldset>
    {choice !== 'same' && <div data-review-stage="amount" className={`review-step${stage === 'amount' ? ' active' : ''}`}><label>{t("2. Aanpassing in BPM")}<input ref={amount} disabled={disabled} type="number" min="1" max="1000" step="1" value={Number.isFinite(delta) ? bpmText(delta) : ''} onChange={event => setDelta(Math.round(event.target.valueAsNumber))} /></label><p data-testid="tempo-preview">{preview}{t(" BPM")}</p><p className="caption">{t("Geldt voor alle stappen en herhalingen van alleen deze oefening in deze sessie. Deze huidige sessie blijft op de oorspronkelijke tempo’s spelen.")}</p>{invalid && <p role="alert" className="error">{t("Kies een positieve aanpassing van maximaal 1000 BPM waarmee alle stappen binnen ")}{tempoRule}{t(" blijven.")}</p>}</div>}
    </>}
    <div className="row-actions"><button className="secondary" disabled={disabled} onClick={() => submit('repeat')}>{t("Deze serie opnieuw")}</button><button className="primary" aria-label={nextLabel} disabled={disabled || invalid} onClick={() => submit(choice)}>{nextLabel}{t(" · Enter")}</button></div>
  </div>;
}
