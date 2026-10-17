import { t, m, errorMessage, messageText } from '../../electron/i18n.mjs';
import { useEffect, useRef, useState } from 'react';
import type { Credit, Exercise, ImportPreview } from '../library/types';
import { bpmText } from '../../electron/tempo-display.mjs';

const message = (error: unknown) => error instanceof Error ? errorMessage(error) : m("Dit is niet gelukt. Probeer opnieuw.");
export function MakerCredit({credit}: {credit?: Credit | null}) {
  return credit ? <aside className="maker-credit"><strong>{t("Gemaakt door ")}{credit.name}</strong>{credit.message && <p className="saved-instruction">{credit.message}</p>}</aside> : null;
}
export function ExportExercise({exercise}: {exercise: Exercise}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [name,setName]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
  return <><button className="secondary" onClick={()=>{setName(exercise.credit?.name ?? '');setNote(exercise.credit?.message ?? '');setError('');setStatus('');dialog.current?.showModal();}}>{t("Exporteren")}</button>
    {status && <p role="status">{messageText(status)}</p>}
    <dialog ref={dialog} className="tab-dialog sharing-dialog" aria-label={t("Oefening exporteren")} onCancel={e=>{if(busy)e.preventDefault();}}>
      <h2>{t("Deel jouw oefening")}</h2><p>“{exercise.title}{t("” wordt één bestand met audio, tablatuur, opdracht, instellingen en opgeslagen fragmenten.")}</p>
      <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try { const saved=await window.hitthebeat!.exportExercise(exercise.id,name.trim() || note.trim() ? {name,message:note} : null);if(saved){dialog.current?.close();setStatus(m("Oefening geëxporteerd. Klaar om te delen!"));} }catch(reason){setError(message(reason));}finally{setBusy(false);}}}>
        <fieldset disabled={busy} className="library-fields"><label>{t("Makernaam of artiestennaam (optioneel)")}<input maxLength={120} value={name} onChange={e=>setName(e.target.value)} /></label>
          <label>{t("Persoonlijke boodschap (optioneel)")}<textarea rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} /></label>
          <p className="caption">{t("Een kleine erkenning voor de maker. Deze vermelding blijft bij de geïmporteerde oefening staan. Je bewerkt hier de vermelding voor dit exportbestand.")}</p>
          {error && <p role="alert" className="error">{messageText(error)}</p>}
          <div className="row-actions"><button type="button" className="secondary" onClick={()=>dialog.current?.close()}>{t("Annuleren")}</button><button className="primary">{busy ? t("Exporteren…") : t("Bestand opslaan")}</button></div>
        </fieldset>
      </form>
    </dialog></>;
}
export function ImportExercise({items,disabled,imported}: {items: Exercise[];disabled:boolean;imported:(exercise:Exercise)=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [preview,setPreview]=useState<ImportPreview|null>(null),[title,setTitle]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{if(preview)dialog.current?.showModal();},[preview]);
  useEffect(()=>()=>{if(preview)void window.hitthebeat?.cancelImport(preview.token).catch(()=>{});},[preview]);
  const duplicate=items.some(item=>item.title.normalize('NFC').toLocaleLowerCase('nl')===title.trim().normalize('NFC').toLocaleLowerCase('nl'));
  function cancel(){if(busy)return;dialog.current?.close();setPreview(null);setError('');}
  return <><button className="secondary" disabled={disabled || busy} onClick={async()=>{setError('');setBusy(true);try{const result=await window.hitthebeat!.previewImport();if(result){setTitle(result.title);setPreview(result);}}catch(reason){setError(message(reason));}finally{setBusy(false);}}}>{t("Oefening importeren")}</button>
    {!preview && error && <p role="alert" className="error">{messageText(error)}</p>}
    <dialog ref={dialog} className="tab-dialog sharing-dialog" aria-label={t("Oefening importeren")} onCancel={e=>{e.preventDefault();cancel();}}>
      <h2>{t("Welkom in je bibliotheek")}</h2>{preview && <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const saved=await window.hitthebeat!.confirmImport(preview.token,title);dialog.current?.close();setPreview(null);imported(saved);}catch(reason){setError(message(reason));}finally{setBusy(false);}}}>
        <fieldset disabled={busy} className="library-fields"><label>{t("Naam van de geïmporteerde oefening")}<input autoFocus required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} /></label>
          {duplicate && <p role="status" className="import-warning">{t("Er bestaat al een oefening met deze naam. Kies eventueel een andere naam. Importeren voegt altijd een nieuwe oefening toe.")}</p>}
          <p className="caption">{preview.kind==='metronome'?t("Metronoom"):t("Audiotrack")} · {bpmText(preview.bpm)}{t(" BPM · ")}{preview.fragmentCount}{t(" opgeslagen fragmenten")}</p>
          <MakerCredit credit={preview.credit} />
          <section className="instruction-inset"><h3>{t("Opdracht")}</h3><p className="saved-instruction">{preview.description || t("Geen opdracht toegevoegd.")}</p></section>
          {error && <p role="alert" className="error">{messageText(error)}</p>}
          <div className="row-actions"><button className="secondary" type="button" onClick={cancel}>{t("Annuleren")}</button><button className="primary">{busy?t("Importeren…"):duplicate?t("Als nieuwe oefening importeren"):t("Importeren")}</button></div>
        </fieldset>
      </form>}
    </dialog></>;
}
