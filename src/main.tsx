import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/varela-round/latin-400.css';
import './app/app.css';
import { App } from './app/App';
import { SOUNDS } from './config/sounds';
import { preloadSounds, resumeAudioOnGestures } from './lib/audio';
import { requestPersistentStorage } from './lib/persistentStorage';
import { useAppData } from './stores/appData';

if (useAppData.getState().meta.visited) void requestPersistentStorage();
resumeAudioOnGestures();
if (useAppData.getState().settings.sounds) {
  preloadSounds(Object.values(SOUNDS).map((sound) => sound.url));
}

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
