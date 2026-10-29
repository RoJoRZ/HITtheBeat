import { AudioEngine } from '../../src/audio/engine';
import { waitAudio } from './audio-clock';
export async function soundModeProbe() {
  const engine=new AudioEngine(), state=engine as unknown as {context:AudioContext;output:GainNode};
  const ctx=state.context, analyser=ctx.createAnalyser();analyser.fftSize=512;state.output.connect(analyser);
  const samples=new Float32Array(analyser.fftSize);
  const peak=()=>{analyser.getFloatTimeDomainData(samples);return Math.max(...samples.map(Math.abs));};
  try {
    const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate), channel=buffer.getChannelData(0);
    for(let i=0;i<channel.length;i++)channel[i]=.3*Math.sin(2*Math.PI*440*i/ctx.sampleRate);
    await engine.loadBuffer(buffer);
    await engine.playSegment(.2,1.2,.5,0,true,undefined,60,true); // 2 quarter beats, exactly 2 seconds.
    const start=engine.playbackStart, pulses:number[]=[];let wasLoud=false,between=1;
    while(ctx.currentTime-start<2.15){
      await waitAudio(ctx,.005);const at=ctx.currentTime-start,loud=peak()>.015;
      if(loud&&!wasLoud)pulses.push(at);wasLoud=loud;
      if(at>.25&&at<.45)between=Math.min(between,peak());
    }
    const end=engine.position,ended=engine.ended,after=peak();
    await engine.playSegment(.2,1.2,1,0,true,undefined,120,false);
    await waitAudio(ctx,.15);const restored=peak();
    await engine.playSegment(.2,1.2,.5,0,true,undefined,60,true);await waitAudio(ctx,.05);await engine.pause();
    await waitAudio(ctx,1.1);const paused=peak();
    return {pulses,between,end,ended,after,restored,paused};
  } finally {engine.dispose();}
}
