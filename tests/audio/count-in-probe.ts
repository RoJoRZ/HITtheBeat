import { scheduleCountIn } from '../../src/audio/count-in';
import { clickPlan, scheduleClick } from '../../src/audio/metronome';
import { AudioEngine } from '../../src/audio/engine';

export async function countInProbe() {
  const sampleRate=44100,context=new OfflineAudioContext(1,Math.ceil(3.6*sampleRate),sampleRate);
  const lead=scheduleCountIn(context,context.destination,{enabled:true,meter:'3/4'},120,0);
  for(const click of clickPlan('4/4',120,2))scheduleClick(context,context.destination,lead.seconds+click.position,click.frequency);
  const samples=(await context.startRendering()).getChannelData(0),onsets:number[]=[];let silent=true;
  for(let start=0;start<samples.length;start+=44){const loud=samples.subarray(start,start+44).some(value=>Math.abs(value)>.01);if(loud&&silent)onsets.push(start/sampleRate);silent=!loud;}
  const frequency=(at:number)=>{const data=samples.slice(Math.round((at+.003)*sampleRate),Math.round((at+.013)*sampleRate));let crossings=0;for(let i=1;i<data.length;i++)if(data[i-1]<=0&&data[i]>0)crossings++;return crossings/(data.length/sampleRate);};
  const engine=new AudioEngine(),internals=engine as unknown as {context:AudioContext;output:GainNode};
  const silence=internals.context.createConstantSource();silence.offset.value=0;silence.connect(internals.output);silence.start();
  const analyser=internals.context.createAnalyser();analyser.fftSize=4096;internals.output.connect(analyser);
  const buffer=internals.context.createBuffer(1,Math.round(sampleRate*.6),sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=.25*Math.sin(2*Math.PI*440*i/sampleRate);
  const frame=new Float32Array(analyser.fftSize),wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
  const level=(hz:number)=>{analyser.getFloatTimeDomainData(frame);let real=0,imaginary=0;for(let i=0;i<frame.length;i++){const angle=2*Math.PI*hz*i/internals.context.sampleRate;real+=frame[i]*Math.cos(angle);imaginary+=frame[i]*Math.sin(angle);}return 2*Math.hypot(real,imaginary)/frame.length;};
  const peak=()=>{analyser.getFloatTimeDomainData(frame);return Math.max(...frame.map(Math.abs));};
  try {
    await engine.loadBuffer(buffer);engine.setVolume(1);
    await engine.playSegment(0,.6,1,0,true,{enabled:true,meter:'3/4'},180); // 1 second preparation.
    await wait(120);const musicDuringCount=level(440),counting=engine.counting,positionDuringCount=engine.position;
    await wait(1050);const musicAfterCount=level(440);
    await engine.playSegment(0,.6,1,0,true,{enabled:true,meter:'3/4'},180);await wait(80);await engine.pause();
    await wait(1200);const afterCancelledCount=peak(),pausedPosition=engine.position;
    engine.setVolume(0);await engine.playSegment(0,.6,1,0,true,{enabled:true,meter:'3/4'},180);
    let mutedPeak=0;for(let i=0;i<30;i++){await wait(20);mutedPeak=Math.max(mutedPeak,peak());}
    return {onsets,leadSeconds:lead.seconds,countFrequency:frequency(0),metroFrequency:frequency(1.5),musicDuringCount,musicAfterCount,counting,positionDuringCount,afterCancelledCount,pausedPosition,mutedPeak};
  }finally{silence.stop();silence.disconnect();engine.dispose();}
}
