import { useState } from 'react';
import { t,m,getLanguage,setLanguage,messageText } from '../../electron/i18n.mjs';
export function LanguagePicker(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <div className="language-picker"><label>{t('Taal')}<select aria-label={t('Taal')} value={getLanguage()} disabled={busy} onChange={async event=>{
 const value=event.target.value as 'nl'|'en';setBusy(true);setError('');try{if(window.hitthebeat)setLanguage(await window.hitthebeat.setLanguage(value));else setLanguage(value);}catch{setError(m('De taal kon niet worden opgeslagen. Probeer opnieuw.'));}finally{setBusy(false);}
 }}><option value="nl">Nederlands</option><option value="en">English</option></select></label>{error&&<p className="error" role="alert">{messageText(error)}</p>}</div>;
}
