export function rhythm(bpm, { duration=20, pattern=[1], division=1, swing=false, accompaniment=false, jitter=0, intro=.37 }={}) {
  const sampleRate=22050, samples=new Float32Array(Math.ceil(sampleRate*duration));
  let seed=17; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const period=60/bpm;
  for(let beat=0;intro+beat*period<duration;beat++) {
    for(let sub=0;sub<division;sub++) {
      const index=beat*division+sub, amplitude=pattern[index%pattern.length];
      const time=intro+beat*period+(swing&&division===2&&sub===1 ? 2/3 : sub/division)*period+(random()-.5)*jitter;
      const start=Math.round(time*sampleRate), length=Math.round(sampleRate*(accompaniment ? .13 : .025));
      const frequency=accompaniment?[220,277.18,329.63,440][beat%4]:1100;
      for(let i=0;i<length&&start+i<samples.length;i++) {const age=i/sampleRate;samples[start+i]+=amplitude*.45*Math.exp(-age*(accompaniment?24:150))*(Math.sin(2*Math.PI*frequency*age)+(accompaniment ? .35*Math.sin(2*Math.PI*frequency*1.5*age) : 0));}
    }
  }
  return {samples,sampleRate};
}
export const tempoCases=[
 ...[55,65,85,100,115].map(bpm=>({name:`geaccentueerde achtsten ${bpm}`,bpm,options:{division:2,pattern:[1,.6],accompaniment:true}})),
 ...[40,45,60,75,90,95,120,180,220,240].map(bpm=>({name:`puls ${bpm}`,bpm,options:{}})),
 ...[60,72,96,120].map(bpm=>({name:`achtsten ${bpm}`,bpm,options:{division:2,pattern:[1,.28]}})),
 ...[75,96,120].map(bpm=>({name:`zestienden ${bpm}`,bpm,options:{division:4,pattern:[1,.08,.3,.08],accompaniment:true}})),
 ...[80,110,145].map(bpm=>({name:`swing ${bpm}`,bpm,options:{division:2,pattern:[1,.25],swing:true,accompaniment:true}})),
 ...[70,105,160,210].map(bpm=>({name:`muziekfrase ${bpm}`,bpm,options:{pattern:[.7,1,.65,1],accompaniment:true,jitter:.008}})),
];
// Identical audible pulses can express either a slow beat or every other fast beat.
export const ambiguousTempoCases=[
 {name:'accented quarter notes at 180',bpm:180,options:{pattern:[1,.6]}},
 {name:'same accents as eighths at 90',bpm:90,options:{division:2,pattern:[1,.6]}},
 {name:'sparse 180',bpm:180,options:{pattern:[1,0]}},
 {name:'same audible pulse at 90',bpm:90,options:{}},
];
