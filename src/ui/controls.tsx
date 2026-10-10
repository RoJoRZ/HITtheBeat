import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export function Stepper({ label, value, min, max, onChange, disabled = false }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; disabled?: boolean }) {
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setDraft(String(value)); setInvalid(false); }, [value]);
  const update = (next: number) => {
    if (!Number.isInteger(next) || next < min || next > max) { setInvalid(true); return; }
    setInvalid(false); setDraft(String(next)); onChange(next);
  };
  return <div className="stepper-wrap"><div className="stepper">
    <button type="button" aria-label={`${label} verlagen`} disabled={disabled || value <= min} onClick={() => update(value - 1)}><Minus size={16} aria-hidden="true" /></button>
    <input type="number" aria-label={label} min={min} max={max} step="1" value={draft} disabled={disabled} aria-invalid={invalid} onChange={event => setDraft(event.target.value)} onBlur={() => update(draft.trim() ? Number(draft) : NaN)} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') { setDraft(String(value)); setInvalid(false); } }} />
    <button type="button" aria-label={`${label} verhogen`} disabled={disabled || value >= max} onClick={() => update(value + 1)}><Plus size={16} aria-hidden="true" /></button>
  </div>{invalid && <span className="field-error" role="alert">Kies {min}–{max}.</span>}</div>;
}

export const durationLabel = (seconds: number) => `${Math.floor(Math.round(seconds) / 60)}:${String(Math.round(seconds) % 60).padStart(2, '0')}`;
