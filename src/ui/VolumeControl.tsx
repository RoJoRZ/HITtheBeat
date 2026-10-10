import { useId } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { setOutput, useOutput } from '../audio/output-volume';
export function VolumeControl() {
  const id = useId(), output = useOutput();
  return <div className="volume-control"><button type="button" className="icon-button" aria-label={output.muted ? 'Dempen opheffen' : 'Geluid dempen'} aria-pressed={output.muted} onClick={() => setOutput({ muted: !output.muted })}>{output.muted || output.volume === 0 ? <VolumeX size={21} /> : <Volume2 size={21} />}</button><label htmlFor={id}>Volume</label><input id={id} aria-valuetext={`${output.volume}%${output.muted ? ' · gedempt' : ''}`} type="range" min="0" max="100" step="1" value={output.volume} onChange={event => setOutput({ volume: event.target.valueAsNumber, muted: false })} /><output htmlFor={id}>{output.muted ? 'Gedempt' : `${output.volume}%`}</output></div>;
}
