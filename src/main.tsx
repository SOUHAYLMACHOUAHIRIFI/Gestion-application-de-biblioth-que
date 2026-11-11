import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Forcer le défilement au tout début de la page lors du rechargement
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });
}

createRoot(document.getElementById('root')!).render(<App />);
