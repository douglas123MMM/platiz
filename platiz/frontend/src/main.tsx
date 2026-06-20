import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles/index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace">ERROR: #root not found</div>';
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(99,102,241,0.2)' } }} />
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    ).render;
  } catch (e: any) {
    rootEl.innerHTML = '<div style="color:#FFD700;background:#111;padding:20px;font-family:monospace"><h2>React Error</h2><pre>' + (e?.message || e) + '</pre></div>';
  }
}
