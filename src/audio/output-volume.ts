import { useSyncExternalStore } from 'react';
const key = 'hitthebeat.output-volume.v1';
type Output = { volume: number; muted: boolean };
let current: Output = { volume: 100, muted: false };
try {
  const value = JSON.parse(localStorage.getItem(key) ?? 'null');
  if (value && Number.isFinite(value.volume) && value.volume >= 0 && value.volume <= 100 && typeof value.muted === 'boolean') current = value;
} catch { /* Keep the default when preferences are unavailable. */ }
const listeners = new Set<() => void>();
export const outputVolume = () => current.muted ? 0 : current.volume / 100;
export function setOutput(change: Partial<Output>) {
  const next = { ...current, ...change };
  if (!Number.isFinite(next.volume) || next.volume < 0 || next.volume > 100) return;
  current = next;
  try { localStorage.setItem(key, JSON.stringify(current)); } catch { /* The controls still work for this app session. */ }
  listeners.forEach(listener => listener());
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const useOutput = () => useSyncExternalStore(subscribe, () => current);
