import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/varela-round/latin-400.css';
import './app/app.css';
import { App } from './app/App';
import { requestPersistentStorage } from './app/persistentStorage';
import { useAppData } from './app/store';

if (useAppData.getState().meta.visited) void requestPersistentStorage();

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
