/** Fit quarter-note taps to one regular grid. Times are source seconds.
 * Stability describes the taps, not their accuracy against the recording.
 * @param {number[]} taps
 */
export function fitTapTempo(taps) {
  const n = taps.length;
  if (n < 3 || n > 16 || taps.some((t,i) => !Number.isFinite(t) || t < 0 || (i > 0 && t <= taps[i-1]))) return null;
  const tolerance = period => Math.max(.015, Math.min(.04, period * .05));
  const required = n <= 4 ? n : Math.max(4, Math.ceil(n * .75));
  function regression(indices) {
    const x = indices.reduce((s,i)=>s+i,0)/indices.length, y=indices.reduce((s,i)=>s+taps[i],0)/indices.length;
    const denominator=indices.reduce((s,i)=>s+(i-x)**2,0);
    const period=indices.reduce((s,i)=>s+(i-x)*(taps[i]-y),0)/denominator;
    return {period, origin:y-period*x};
  }
  let best = null;
  for(let i=0;i<n-1;i++)for(let j=i+1;j<n;j++) {
    let period=(taps[j]-taps[i])/(j-i),origin=taps[i]-i*period;
    let indices=[];
    for(let iteration=0;iteration<3;iteration++) {
      indices=taps.map((_,k)=>k).filter(k=>Math.abs(taps[k]-origin-k*period)<=tolerance(period)*1.8);
      if(indices.length<required)break;
      ({period,origin}=regression(indices));
    }
    if(indices.length<required || !(period>=.06 && period<=60))continue;
    if(taps.some((value,k)=>!indices.includes(k) && Math.abs(value-origin-k*period)<=Math.max(tolerance(period)*2.5,period*.15)))continue;
    const rms=Math.sqrt(indices.reduce((s,k)=>s+(taps[k]-origin-k*period)**2,0)/indices.length);
    if(rms>tolerance(period))continue;
    // Short sequences must still contain comparable intervals; don't make
    // an irregular sequence look regular by fitting just its endpoints.
    const intervals=indices.slice(1).map((k,index)=>(taps[k]-taps[indices[index]])/(k-indices[index]));
    if(intervals.some(value=>Math.abs(value-period)>Math.max(.025,period*.10)))continue;
    if(intervals.length>=4) {
      const half=Math.floor(intervals.length/2), mean=values=>values.reduce((s,v)=>s+v,0)/values.length;
      if(Math.abs(mean(intervals.slice(0,half))-mean(intervals.slice(-half)))>period*.06)continue;
    }
    let beatOffset=((origin%period)+period)%period;
    if(period-beatOffset<1e-8 || beatOffset<1e-8)beatOffset=0;
    const result={bpm:60/period,beatOffset,rms,used:indices.length,total:n,short:indices.length<8};
    if(!best || result.used>best.used || (result.used===best.used && rms<best.rms))best=result;
  }
  return best;
}
