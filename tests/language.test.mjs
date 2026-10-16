import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {english} from '../electron/translations.mjs';
import {t,m,setLanguage,getLanguage,systemLanguage,messageText,LocalizedError,errorMessage} from '../electron/i18n.mjs';
import {languageSettings} from '../electron/language-settings.mjs';

test('system fallback, manual language persistence, invalid/corrupt settings and failed writes',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hitthebeat-language-'));
 try {
  for(const value of ['nl','nl-NL','NL_be'])assert.equal(systemLanguage(value),'nl');for(const value of ['en','de-DE','fr',''])assert.equal(systemLanguage(value),'en');
  let settings=await languageSettings(root,'nl-NL');assert.equal(settings.get(),'nl');await settings.set('en');settings=await languageSettings(root,'nl-NL');assert.equal(settings.get(),'en');
  await assert.rejects(settings.set('de'));assert.equal(settings.get(),'en');assert.deepEqual(JSON.parse(await readFile(path.join(root,'preferences.json'),'utf8')),{version:1,language:'en'});
  await writeFile(path.join(root,'preferences.json'),'broken');assert.equal((await languageSettings(root,'nl-BE')).get(),'nl');
  await writeFile(path.join(root,'preferences.json'),JSON.stringify({version:1,language:'de'}));assert.equal((await languageSettings(root,'fr')).get(),'en');
  const unavailable=await languageSettings(path.join(root,'missing'),'nl');await assert.rejects(unavailable.set('en'));assert.equal(unavailable.get(),'nl');
  assert.equal((await readdir(root)).filter(name=>name.endsWith('.tmp')).length,0);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('messages translate live while substitution preserves user text and braces exactly',()=>{
 try {setLanguage('nl');const user='Mijn oefening {1} <b>één</b>',message=m('De nieuwe audio past niet bij de grenzen of BPM in sessie “{0}”. Pas eerst deze sessie aan.',user);const error=new LocalizedError('Kies een beoordeling van 1 tot en met 5.');assert.match(error.message,/beoordeling/);
 setLanguage('en');assert.equal(messageText(errorMessage(error)),'Choose a rating from 1 to 5.');assert.ok(messageText(message).includes(user));assert.match(messageText(message),/^The new audio/);assert.equal(messageText(user),user);assert.equal(getLanguage(),'en');
 }finally{setLanguage('nl');}
});

test('English catalog covers every source key and preserves every placeholder',async()=>{
 const require=createRequire(import.meta.url);const {parseSync}=await import(createRequire(require.resolve('vite')).resolve('rolldown/experimental'));
 const roots=['src','electron'];
 async function scan(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await scan(file);else if(/\.(mjs|tsx?|cjs)$/.test(file)&&entry.name!=='translations.mjs'){
 const code=await readFile(file,'utf8');const tree=parseSync(file,code).program;
 function walk(n,parent=null){if(!n||typeof n!=='object')return;const key=(n.type==='CallExpression'&&['t','m'].includes(n.callee.name)||n.type==='NewExpression'&&n.callee.name==='LocalizedError')&&n.arguments[0];if(key?.type==='Literal'&&typeof key.value==='string')assert.ok(Object.hasOwn(english,key.value),`${file}: missing translation for ${key.value}`);if(n.type==='JSXText'&&/[A-Za-z]/.test(n.value))assert.ok(['HIT','Beat','BPM','Nederlands','English'].includes(n.value.trim()),`${file}: untranslated JSX text ${n.value}`);
 for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(child=>walk(child,n));else if(v&&typeof v==='object'&&v.type)walk(v,n);}}walk(tree);
 }}}
 for(const root of roots)await scan(root);
 for(const [key,value]of Object.entries(english)){assert.deepEqual((value.match(/\{\d+\}/g)??[]).sort(),(key.match(/\{\d+\}/g)??[]).sort(),key);setLanguage('en');assert.equal(t(key,...['a','b','c','d']),value.replace(/\{(\d+)\}/g,(_,n)=>['a','b','c','d'][n]??`{${n}}`));}setLanguage('nl');
});
