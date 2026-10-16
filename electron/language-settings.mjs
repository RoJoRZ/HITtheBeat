import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { isLanguage, systemLanguage, LocalizedError } from './i18n.mjs';
/** @param {string} directory @param {string} system */
export async function languageSettings(directory,system){
 const file=path.join(directory,'preferences.json');let language=systemLanguage(system);
 try {const saved=JSON.parse(await readFile(file,'utf8'));if(saved.version===1&&isLanguage(saved.language))language=saved.language;}catch{}
 let queue=Promise.resolve();
 return {get:()=>language,
 /** @param {unknown} value */
 async set(value){if(!isLanguage(value))throw new LocalizedError('Ongeldige taalkeuze.');
 const operation=queue.then(async()=>{const temp=path.join(directory,`.preferences-${randomUUID()}.tmp`);try{await writeFile(temp,JSON.stringify({version:1,language:value}),{flag:'wx',mode:0o600});await rename(temp,file);language=value;return language;}catch{throw new LocalizedError('De taal kon niet worden opgeslagen. Probeer opnieuw.');}finally{await rm(temp,{force:true}).catch(()=>{});}});
 queue=operation.then(()=>{},()=>{});return operation;
 }};
}
