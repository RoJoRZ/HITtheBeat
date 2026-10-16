import { english } from './translations.mjs';
/** @typedef {'nl'|'en'} Language */
/** @type {Language} */ let language='nl';
/** @type {Set<()=>void>} */ const listeners=new Set();
/** @param {unknown} value @returns {value is Language} */
export const isLanguage=value=>value==='nl'||value==='en';
/** @param {string} value @returns {Language} */
export const systemLanguage=value=>/^nl(?:[-_]|$)/i.test(value)?'nl':'en';
export const getLanguage=()=>language;
export const locale=()=>language==='nl'?'nl-NL':'en-GB';
/** @param {Language} value */
export function setLanguage(value){if(!isLanguage(value))throw new Error('Invalid language');if(language!==value){language=value;listeners.forEach(listener=>listener());}}
/** @param {()=>void} listener */
export function subscribeLanguage(listener){listeners.add(listener);return()=>{listeners.delete(listener);};}
/** Substitution is one pass: braces inside user content are never interpreted. @param {string} key @param {...unknown} args */
export function t(key,...args){const template=language==='en'?/** @type {Record<string,string>} */(english)[key]??key:key;return template.replace(/\{(\d+)\}/g,(match,index)=>Number(index)<args.length?String(args[Number(index)]):match);}
const marker='HTB_MESSAGE:';
/** Store a message without freezing its display language. @param {string} key @param {...unknown} args */
export const m=(key,...args)=>marker+JSON.stringify({key,args});
/** @param {unknown} value */
export function messageText(value){if(typeof value!=='string')return '';const clean=value.replace(/^Error invoking remote method '[^']+': (?:Error: )?/,'');if(!clean.startsWith(marker))return clean;try{const data=JSON.parse(clean.slice(marker.length));if(typeof data.key==='string'&&Object.hasOwn(english,data.key)&&Array.isArray(data.args))return t(data.key,...data.args);}catch{}return clean;}
export class LocalizedError extends Error {
  /** @param {string} key @param {...unknown} args */
  constructor(key,...args){super(t(key,...args));this.key=key;this.args=args;}
}
/** @param {unknown} reason */
export function errorMessage(reason){return reason instanceof LocalizedError?m(reason.key,...reason.args):reason instanceof Error?reason.message:m('Dit is niet gelukt. Probeer opnieuw.');}
/** @param {Electron.IpcMain} ipc @param {string} channel @param {(event:Electron.IpcMainInvokeEvent,...args:any[])=>any} handler */
export function localizedHandle(ipc,channel,handler){ipc.handle(channel,async(event,...args)=>{try{return await handler(event,...args);}catch(reason){throw new Error(errorMessage(reason));}});}
/** @param {number} count */
export const barsLabel=count=>t(count===1?'{0} maat':'{0} maten',count);
