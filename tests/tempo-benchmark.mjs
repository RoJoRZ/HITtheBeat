import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { estimateTempo } from '../src/audio/bpm.ts';
import { rhythm, tempoCases, ambiguousTempoCases } from './tempo-fixtures.mjs';
// Archived pre-issue implementation is measured only when explicitly provided.
const baselinePath=process.env.HITTHEBEAT_BPM_BASELINE;
const before=baselinePath?(await import(baselinePath.startsWith('file:') ? baselinePath : pathToFileURL(path.resolve(baselinePath)).href)).estimateTempo:null;
const results=[...tempoCases.map(item=>({...item,ambiguous:false})),...ambiguousTempoCases.map(item=>({...item,ambiguous:true}))].map(({name,bpm,options,ambiguous})=>{
 const {samples,sampleRate}=rhythm(bpm,options), current=estimateTempo(samples,sampleRate).bpm, previous=before?.(samples,sampleRate).bpm??null;
 return {name,reference:bpm,ambiguous,before:previous,after:current,correct:current!==null&&Math.abs(current-bpm)<2};
});
console.log(JSON.stringify(results,null,2));
