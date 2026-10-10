declare module 'signalsmith-stretch' {
  export interface StretchNode extends AudioWorkletNode {
    addBuffers(channels: Float32Array[]): Promise<void>;
    schedule(options: { active: boolean; input?: number; output?: number; rate?: number; semitones?: number; loopStart?: number; loopEnd?: number }): Promise<unknown>;
  }
  const create: {
    (context: BaseAudioContext, options?: AudioWorkletNodeOptions): Promise<StretchNode>;
    moduleUrl: string;
  };
  export default create;
}
