import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Unregister stale service worker to prevent dynamic asset caching issues during development
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
          .then((success) => {
            if (success) {
              console.log('Stale service worker successfully unregistered.');
              // Reload page once to ensure clean cache if we had to unregister
              window.location.reload();
            }
          });
      }
    })
    .catch((err) => console.warn('Failed to unregister service worker:', err));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
