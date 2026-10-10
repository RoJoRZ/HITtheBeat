import { createStretch } from '../../src/audio/stretch';

export async function probe(rate: number, pitch: number, loop: boolean) {
  const sampleRate = 44100;
  const duration = loop ? 60 : 2 / rate + .4;
  const context = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const input = Float32Array.from({ length: sampleRate * 2 }, (_, i) => .3 * Math.sin(2 * Math.PI * 440 * i / sampleRate));
  const node = await createStretch(context);
  await node.addBuffers([input]);
  node.connect(context.destination);
  await node.schedule({ active: true, input: loop ? .5 : 0, output: 0, rate, semitones: pitch, loopStart: loop ? .5 : 0, loopEnd: loop ? 1 : 0 });
  const rendered = await context.startRendering();
  const samples = rendered.getChannelData(0);
  let crossings = 0;
  const start = Math.floor(.15 * sampleRate), end = Math.floor(Math.min(.55, 2 / rate - .1) * sampleRate);
  for (let i = start + 1; i < end; i++) if (samples[i - 1] <= 0 && samples[i] > 0) crossings++;
  let last = 0, minimumRms = 1;
  for (let i = 0; i < samples.length; i++) if (Math.abs(samples[i]) > .01) last = i;
  for (let begin = Math.floor(.2 * sampleRate); begin < Math.floor((loop ? 59.8 : 2 / rate - .2) * sampleRate); begin += 2205) {
    let sum = 0;
    for (let i = begin; i < begin + 2205; i++) sum += samples[i] ** 2;
    minimumRms = Math.min(minimumRms, Math.sqrt(sum / 2205));
  }
  node.disconnect();
  return { rate, pitch, loop, frequency: crossings / ((end - start) / sampleRate), expectedFrequency: 440 * 2 ** (pitch / 12), end: last / sampleRate, expectedEnd: loop ? duration : 2 / rate, minimumRms };
}
