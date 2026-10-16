import { t, LocalizedError } from './i18n.mjs';
import { randomUUID } from 'node:crypto';
import { open, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { decodeExercise, encodeExercise, MAX_PACKAGE_BYTES } from './exercise-sharing.mjs';

/** @param {{ library:Awaited<ReturnType<typeof import('./library.mjs').openLibrary>>, dialog:Pick<typeof import('electron').dialog,'showOpenDialog'|'showSaveDialog'>, owner:()=>import('electron').BrowserWindow }} options */
export function sharingDialogs({library,dialog,owner}) {
  /** Only a single pending preview is retained, no paths or media bytes cross IPC. @type {{token:string, data:ReturnType<typeof decodeExercise>}|null} */
  let pending = null;
  let busy = false;
  const filters = [{get name() {return t("HITtheBeat-oefening");},extensions:['htbexercise']}];
  return {
    /** @param {string} id @param {unknown} credit */
    async export(id, credit) {
      if (busy) throw new LocalizedError("Rond eerst de andere bestandsactie af.");
      busy = true;
      try {
        const source = await library.exportExercise(id), bytes = encodeExercise(source,credit);
        let filename = source.title.replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').replace(/[. ]+$/g,'').slice(0,100) || t("Oefening");
        if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(filename)) filename=t("Oefening-{0}", filename);
        const result = await dialog.showSaveDialog(owner(),{title:t("Oefening exporteren"),defaultPath:`${filename}.htbexercise`,filters});
        if (result.canceled || !result.filePath) return false;
        const temp = path.join(path.dirname(result.filePath),`.hitthebeat-${randomUUID()}.tmp`);
        try { await writeFile(temp,bytes,{flag:'wx',mode:0o600}); await rename(temp,result.filePath); }
        finally { await rm(temp,{force:true}); }
        return true;
      } finally { busy=false; }
    },
    async preview() {
      if (busy) throw new LocalizedError("Rond eerst de andere bestandsactie af.");
      busy=true; pending=null;
      try {
        const result = await dialog.showOpenDialog(owner(),{title:t("Oefening importeren"),properties:['openFile'],filters});
        if (result.canceled || !result.filePaths[0]) return null;
        const handle = await open(result.filePaths[0],'r');
        let bytes;
        try {
          const stat = await handle.stat();
          if (!stat.isFile() || stat.size > MAX_PACKAGE_BYTES) throw new LocalizedError("Kies een HITtheBeat-oefenbestand van maximaal 84 MB.");
          // Bounded read even if another process grows the file after stat.
          bytes=Buffer.alloc(stat.size+1); let bytesRead=0;
          while (bytesRead < bytes.length) { const result=await handle.read(bytes,bytesRead,bytes.length-bytesRead,bytesRead); if (!result.bytesRead) break; bytesRead+=result.bytesRead; }
          if (bytesRead !== stat.size) throw new LocalizedError("Het oefenbestand is tijdens het lezen gewijzigd.");
          bytes=bytes.subarray(0,bytesRead);
        } finally { await handle.close(); }
        const data=decodeExercise(bytes),token=randomUUID(); pending={token,data};
        const {title,description,kind,bpm,credit}=data.input;
        return {token,title,description,kind,bpm,credit,fragmentCount:data.fragments.length};
      } finally {busy=false;}
    },
    /** @param {string} token @param {string} title */
    async confirm(token,title) {
      if (busy || !pending || pending.token !== token) throw new LocalizedError("Kies het oefenbestand opnieuw.");
      busy=true;
      const data=pending.data;
      try { const saved=await library.save({...data.input,title},data.fragments); pending=null; return saved; }
      finally {busy=false;}
    },
    /** @param {string} token */
    cancel(token) { if (!busy && pending?.token === token) pending=null; },
  };
}
