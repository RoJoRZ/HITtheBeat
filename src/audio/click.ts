export function scheduleClick(context: BaseAudioContext, output: AudioNode, at: number, frequency: number, length = .035, shape: OscillatorType = 'sine') {
  const tone = context.createOscillator(), envelope = context.createGain();
  tone.frequency.value = frequency; tone.type = shape;
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(.35, at + Math.min(.002, length / 4));
  envelope.gain.exponentialRampToValueAtTime(.0001, at + length);
  tone.connect(envelope); envelope.connect(output); tone.start(at); tone.stop(at + length);
  tone.onended = () => { tone.disconnect(); envelope.disconnect(); };
  return tone;
}
