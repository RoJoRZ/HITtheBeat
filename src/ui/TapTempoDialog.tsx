import { useEffect, useMemo, useRef, useState } from 'react';
import { t, errorMessage, messageText } from '../../electron/i18n.mjs';
import { bpmText } from '../../electron/tempo-display.mjs';
import { fitTapTempo } from '../audio/tap-tempo.mjs';
import { TapPlayer } from '../audio/tap-player';
import { outputVolume, useOutput } from '../audio/output-volume';
import { VolumeControl } from './VolumeControl';

type Result = NonNullable<ReturnType<typeof fitTapTempo>>;
export function TapTempoDialog({read,close,apply}:{read:()=>Promise<ArrayBuffer>;close:()=>void;apply:(result:Result)=>void}) {
  const dialog=useRef<HTMLDialogElement>(null),player=useRef<TapPlayer|null>(null),alive=useRef(false),tapsRef=useRef<number[]>([]);
  const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[mode,setMode]=useState<'tap'|'preview'|null>(null),modeRef=useRef(mode);
  const [taps,setTaps]=useState<number[]>([]),[error,setError]=useState(''),output=useOutput();
  const result=useMemo(()=>fitTapTempo(taps),[taps]);
  function changeMode(value:typeof mode) {modeRef.current=value;setMode(value);}
  useEffect(()=>{
    let current=true;alive.current=true; dialog.current?.showModal();
    const audio=new TapPlayer(()=>{if(current)changeMode(null);});player.current=audio;audio.setVolume(outputVolume());
    void read().then(bytes=>{if(current)return audio.load(bytes);}).then(()=>{if(current)setReady(true);}).catch(reason=>{if(current)setError(errorMessage(reason));});
    return()=>{current=false;alive.current=false;audio.dispose();player.current=null;};
  },[]);
  useEffect(()=>{player.current?.setVolume(outputVolume());},[output]);
  async function play(preview=false) {
    if(!player.current || busy || (preview&&!result))return;
    setBusy(true);setError('');changeMode(null);
    if(!preview){tapsRef.current=[];setTaps([]);}
    try {if(await player.current.play(preview?result!:undefined))if(alive.current)changeMode(preview?'preview':'tap');}
    catch(reason){if(alive.current)setError(errorMessage(reason));}
    finally{if(alive.current)setBusy(false);}
  }
  function stop(){player.current?.stop();changeMode(null);}
  function key(event:React.KeyboardEvent) {
    if(event.code!=='Space')return;
    event.preventDefault();event.stopPropagation();
    if(event.repeat || modeRef.current!=='tap' || tapsRef.current.length>=16)return;
    const position=player.current?.tapPosition(event.timeStamp);
    if(position==null || position<0)return;
    const next=[...tapsRef.current,position];tapsRef.current=next;setTaps(next);
    if(next.length===16)stop();
  }
  return <dialog ref={dialog} className="tab-dialog tap-tempo-dialog" aria-labelledby="tap-title" onKeyDown={key} onCancel={event=>{event.preventDefault();close();}}>
    <h2 id="tap-title">{t("Bepaal BPM")}</h2>
    <p>{t("Luister op originele snelheid en tik kwartnoten mee met Spatie. Maximaal 16 tikken; je mag eerder stoppen.")}</p>
    <p>{t("Vanaf drie tikken vergelijken we intervallen. Een korte meting geeft minder zekerheid. Dit bepaalt geen eerste tel van een maat.")}</p>
    <div role="status" aria-label={t("Tikmeting")} aria-live="polite"><p>{!ready?t("Audio laden…"):mode==='tap'?t("Tik mee met Spatie · {0}/16",taps.length):mode==='preview'?t("Luister of de klikken bij de opname passen."):t("{0} tikken",taps.length)}</p>
    {mode!=='tap' && taps.length>0 && (!result?<p>{t("Geen stabiel tempo gevonden — tik opnieuw.")}</p>:<><p>{result.short?t("Korte meting"):t("Stabiele reeks")} · {bpmText(result.bpm)}{' BPM · '}{t("Telpositie {0} seconden",result.beatOffset.toFixed(3))}</p><p>{t("{0} van {1} tikken gebruikt. Regelmaat is geen garantie dat je precies met de opname meetikt.",result.used,result.total)}</p></>)}</div>
    {error&&<p role="alert" className="error">{messageText(error)}</p>}
    <div className="row-actions"><button type="button" className="primary" disabled={!ready||busy} onClick={()=>void play()}>{taps.length?t("Opnieuw tikken"):t("Start meetikken")}</button><button type="button" className="secondary" disabled={!mode||busy} onClick={stop}>{t("Stop meetikken / beluisteren")}</button><button type="button" className="secondary" disabled={!result||mode==='tap'||busy} onClick={()=>void play(true)}>{t("Resultaat beluisteren")}</button></div>
    <VolumeControl />
    <div className="detail-footer"><button type="button" className="secondary" onClick={close}>{t("Annuleren")}</button><button type="button" className="primary" disabled={!result||mode==='tap'||busy} onClick={()=>{if(result)apply(result);}}>{t("Overnemen")}</button></div>
  </dialog>;
}
