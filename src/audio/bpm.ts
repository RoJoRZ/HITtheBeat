export interface TempoEstimate { bpm: number | null; strength: number }

// Independent implementation: onset energy changes followed by normalized
// autocorrelation. This estimates a pulse, not the intended musical beat unit.
export function estimateTempo(samples: Float32Array, sampleRate: number): TempoEstimate {
  const unavailable = { bpm: null, strength: 0 };
  if (!Number.isFinite(sampleRate) || sampleRate < 4000 || samples.length / sampleRate < 4) return unavailable;
  const hop = Math.round(sampleRate / 100), frames = Math.floor(samples.length / hop);
  const fps = sampleRate / hop;
  const energies = new Float32Array(frames);
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0;
    for (let i = frame * hop; i < (frame + 1) * hop; i++) sum += samples[i] ** 2;
    energies[frame] = Math.sqrt(sum / hop);
  }
  const maximum = Math.max(...energies);
  if (maximum < .0001) return unavailable;
  const onsets = new Float32Array(frames);
  let peaks = 0, energy = 0;
  for (let i = 2; i < frames; i++) {
    const previous = (energies[i - 1] + energies[i - 2]) / 2;
    const difference = Math.max(0, energies[i] - previous - maximum * .025);
    onsets[i] = difference / maximum;
    energy += onsets[i] ** 2;
    if (onsets[i] > .08 && onsets[i - 1] <= .08) peaks++;
  }
  if (peaks < 4 || energy < .01) return unavailable;
  const minLag = Math.floor(fps * 60 / 240), maxLag = Math.ceil(fps * 60 / 40);
  const correlations = new Float64Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag + 1; lag++) {
    let product = 0, left = 0, right = 0;
    for (let i = lag; i < frames; i++) { product += onsets[i] * onsets[i - lag]; left += onsets[i] ** 2; right += onsets[i - lag] ** 2; }
    correlations[lag] = product / Math.max(1e-12, Math.sqrt(left * right));
  }
  // Broaden each peak by one frame so a fractional beat period does not
  // lose to a slower multiple that happens to align with the frame grid.
  const smooth = correlations.slice();
  for (let lag = minLag; lag <= maxLag; lag++) smooth[lag] = correlations[lag] + .5 * (correlations[lag - 1] + correlations[lag + 1]);
  let bestLag = 0, bestScore = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    // Prefer the first strong periodicity over its slower multiples.
    const score = smooth[lag] * (1 - .25 * Math.log2(lag / minLag));
    if (score > bestScore) { bestScore = score; bestLag = lag; }
  }
  if (bestScore < .28 || !bestLag) return unavailable;
  // Alternating strong/weak onsets often represent subdivisions. Correct the
  // octave only when the longer period has materially stronger repeatability;
  // equal pulses do not justify halving a genuinely fast track.
  const center = bestLag * 2;
  let longer = 0;
  for (let lag = Math.max(minLag, center - 2); lag <= Math.min(maxLag, center + 2); lag++) if (!longer || smooth[lag] > smooth[longer]) longer = lag;
  const support = (lag: number) => { let score = 0; for (let offset = -2; offset <= 2; offset++) score += correlations[lag + offset] || 0; return score; };
  if (longer && support(longer) > support(bestLag) * 1.1) bestLag = longer;
  const left = smooth[bestLag - 1] || 0, middle = smooth[bestLag], right = smooth[bestLag + 1] || 0;
  const offset = Math.max(-.5, Math.min(.5, .5 * (left - right) / (left - 2 * middle + right || 1)));
  const bpm = Math.round(fps * 60 / (bestLag + offset) * 10) / 10;
  return bpm >= 40 && bpm <= 240 ? { bpm, strength: Math.min(1, middle) } : unavailable;
}
