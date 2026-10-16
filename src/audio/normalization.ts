import { LocalizedError } from '../../electron/i18n.mjs';
// A fixed gain per MP3 preserves musical dynamics. This is gated RMS matching,
// not a claim of LUFS/true-peak conformance or dynamic compression.
export function normalizationLevel(channels: Float32Array[], sampleRate: number) {
  if (!channels.length || !Number.isFinite(sampleRate) || sampleRate <= 0 || !channels[0].length || channels.some(channel => channel.length !== channels[0].length)) throw new LocalizedError("Ongeldige audio voor volumenormalisatie.");
  const size = Math.max(1, Math.round(sampleRate * .4)), windows: { energy: number; samples: number }[] = [];
  let peak = 0, loudest = 0;
  for (let start = 0; start < channels[0].length; start += size) {
    const end = Math.min(start + size, channels[0].length); let sum = 0;
    for (const channel of channels) for (let i = start; i < end; i++) {
      const value = channel[i]; if (!Number.isFinite(value)) throw new LocalizedError("De audio bevat ongeldige samples.");
      peak = Math.max(peak, Math.abs(value)); sum += value * value;
    }
    const samples = (end - start) * channels.length, energy = sum / samples;
    windows.push({ energy, samples }); loudest = Math.max(loudest, energy);
  }
  // Leave silence/near-silence alone; do not turn a noise floor into an exercise.
  if (loudest < 1e-6) return { db: 0, peak, rms: Math.sqrt(loudest), limited: false, quiet: true };
  const active = windows.filter(window => window.energy >= Math.max(1e-6, loudest * .001));
  const rms = Math.sqrt(active.reduce((sum, window) => sum + window.energy * window.samples, 0) / active.reduce((sum, window) => sum + window.samples, 0));
  const desired = Math.pow(10, -18 / 20) / rms;
  const gain = Math.max(1e-3, Math.min(desired, Math.pow(10, -1 / 20) / peak, Math.pow(10, 12 / 20)));
  return { db: 20 * Math.log10(gain), peak, rms, limited: gain < desired - 1e-9, quiet: false };
}
