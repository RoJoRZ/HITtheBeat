import React, {useSyncExternalStore} from 'react';
import {getLanguage, setLanguage, subscribeLanguage, systemLanguage} from '../electron/i18n.mjs';
import { createRoot } from 'react-dom/client';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/source-sans-3/700.css';
import { NotationWindow } from './ui/NotationWindow';
import { App } from './ui/App';
import './ui/styles.css';

const notation=new URLSearchParams(location.search).get('view') === 'notation';
const api=notation?window.notationViewer:window.hitthebeat;
setLanguage(api?await api.getLanguage():systemLanguage(navigator.language));
document.documentElement.lang=getLanguage();
api?.onLanguageChange(language=>setLanguage(language));
subscribeLanguage(()=>{document.documentElement.lang=getLanguage();});
function Root(){useSyncExternalStore(subscribeLanguage,getLanguage);return notation?<NotationWindow/>:<App/>;}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
