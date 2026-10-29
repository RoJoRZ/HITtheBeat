import { AudioEngine } from '../../src/audio/engine';
import { waitAudio } from './audio-clock';
export async function soundModeProbe() {
  const engine=new AudioEngine(), state=engine as unknown as {context:AudioContext;output:GainNode};
  const ctx=state.context, analyser=ctx.createAnalyser();analyser.fftSize=512;state.output.connect(analyser);
  await ctx.audioWorklet.addModule(new URL('./capture-worklet.js',import.meta.url).href);
  const recorder=new AudioWorkletNode(ctx,'test-capture');state.output.connect(recorder);recorder.connect(ctx.destination);
  type Chunk = {at:number;data:Float32Array};
  function record(command:'start'|'flush') {return new Promise<Chunk[]>(resolve=>{recorder.port.onmessage=({data})=>resolve(data.chunks??[]);recorder.port.postMessage(command);});}
  const samples=new Float32Array(analyser.fftSize);
  const peak=()=>{analyser.getFloatTimeDomainData(samples);return Math.max(...samples.map(Math.abs));};
  try {
    const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate), channel=buffer.getChannelData(0);
    for(let i=0;i<channel.length;i++)channel[i]=.3*Math.sin(2*Math.PI*440*i/ctx.sampleRate);
    await engine.loadBuffer(buffer);
    await record('start');
    await engine.playSegment(.2,1.2,.5,0,true,undefined,60,true); // 2 quarter beats, exactly 2 seconds.
    const start=engine.playbackStart, pulses:number[]=[];let wasLoud=false,between=0;
    await waitAudio(ctx,2.15);
    const chunks=await record('flush');
    for(const chunk of chunks)for(let i=0;i<chunk.data.length;i++){
      const at=chunk.at+i/ctx.sampleRate-start;if(at<0)continue;
      const level=Math.abs(chunk.data[i]),loud=level>.015;
      if(loud&&!wasLoud&&(pulses.length===0||at-pulses[pulses.length-1]>.05))pulses.push(at);
      wasLoud=loud;if(at>.25&&at<.45)between=Math.max(between,level);
    }
    const end=engine.position,ended=engine.ended,after=peak();
    await engine.playSegment(.2,1.2,1,0,true,undefined,120,false);
    await waitAudio(ctx,.15);const restored=peak();
    await record('start');
    await engine.playSegment(.2,1.2,.5,0,true,undefined,60,true);const pauseStart=engine.playbackStart;
    await waitAudio(ctx,.05);await engine.pause();await waitAudio(ctx,1.1);
    const pausedChunks=await record('flush');let paused=0;
    for(const chunk of pausedChunks)for(let i=0;i<chunk.data.length;i++)if(chunk.at+i/ctx.sampleRate-pauseStart>.12)paused=Math.max(paused,Math.abs(chunk.data[i]));
    return {pulses,between,end,ended,after,restored,paused};
  } finally {recorder.disconnect();engine.dispose();}
}
