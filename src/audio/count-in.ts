import { countInSeconds } from '../../electron/count-in-model.mjs';
import { meterBeats } from '../../electron/exercise-model.mjs';
import { scheduleClick } from './click.ts';
export type CountIn = import('../../electron/count-in-model.mjs').CountIn;
/** One bar, on the same audio clock as the following music. Distinct triangle clicks. */
export function scheduleCountIn(context: BaseAudioContext, output: AudioNode, settings: CountIn | undefined, bpm: number, start: number) {
  const seconds = countInSeconds({ countIn: settings }, bpm);
  if (!seconds || !settings) return { seconds: 0, nodes: [] as OscillatorNode[] };
  const beats = meterBeats(settings.meter), interval = seconds / beats;
  const nodes = Array.from({ length: beats }, (_, index) => scheduleClick(context, output, start + index * interval, index === 0 ? 3000 : 2300, Math.min(.018, interval * .6), 'triangle'));
  return { seconds, nodes };
}
