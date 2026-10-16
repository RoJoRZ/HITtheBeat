// AudioContext.resume() may resolve before the device clock starts advancing.
// Measure against the clock that schedules the signal, with a bounded wall-clock timeout.
export async function captureAudio(context: AudioContext, seconds: number, read: () => number) {
  const end = context.currentTime + seconds, deadline = performance.now() + seconds * 1000 + 5000;
  let maximum = 0;
  do {
    await new Promise(resolve => setTimeout(resolve, 5)); maximum = Math.max(maximum, read());
    if (performance.now() > deadline) throw new Error('De audioklok loopt niet door tijdens de meting.');
  } while (context.currentTime < end);
  return maximum;
}
export async function waitAudio(context: AudioContext, seconds: number) { await captureAudio(context, seconds, () => 0); }
