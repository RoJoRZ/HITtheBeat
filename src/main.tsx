import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/source-sans-3/700.css';
import { NotationWindow } from './ui/NotationWindow';
import { App } from './ui/App';
import './ui/styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode>{new URLSearchParams(location.search).get('view') === 'notation' ? <NotationWindow /> : <App />}</React.StrictMode>);
