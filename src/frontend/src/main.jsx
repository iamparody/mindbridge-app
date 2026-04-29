import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './index.css';
import App from './App.jsx';

// Register FCM on first authenticated load
if ('Notification' in window && 'serviceWorker' in navigator) {
  window.addEventListener('mb:register-fcm', async (e) => {
    const token = e.detail?.fcmToken;
    if (!token) return;
    try {
      const { default: client } = await import('./api/client.js');
      await client.patch('/api/profile', { fcm_token: token }).catch(() => {});
    } catch {}
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
