import { useState } from 'react';
import { t,m,getLanguage,setLanguage,messageText } from '../../electron/i18n.mjs';
export function LanguagePicker({compact=false}:{compact?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <div className={compact?'language-picker compact':'language-picker'}><label>{!compact&&t('Taal')}<select aria-label={t(compact?'Kies je taal':'Taal')} value={getLanguage()} disabled={busy} onChange={async event=>{
 const value=event.target.value as 'nl'|'en';setBusy(true);setError('');try{if(window.hitthebeat)setLanguage(await window.hitthebeat.setLanguage(value));else setLanguage(value);}catch{setError(m('De taal kon niet worden opgeslagen. Probeer opnieuw.'));}finally{setBusy(false);}
 }}><option value="nl">{compact?'NL · ':''}Nederlands</option><option value="en">{compact?'EN · ':''}English</option></select></label>{error&&<p className="error" role="alert">{messageText(error)}</p>}</div>;
}
