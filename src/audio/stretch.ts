import SignalsmithStretch from 'signalsmith-stretch';
import moduleUrl from 'signalsmith-stretch?url';

// Load the bundled worklet directly: no generated scripts or network requests.
SignalsmithStretch.moduleUrl = moduleUrl;
export const createStretch = (context: BaseAudioContext) => SignalsmithStretch(context, {
  numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2],
});
