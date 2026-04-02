import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegisterSW } from 'virtual:pwa-register/react';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

// ── SW Update Banner ──────────────────────────────────────────────────────────
// Shows a small "New version available" prompt instead of silently swapping
// assets mid-session (which caused the mixed version / blank page problem)
function SWUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px', // above BottomNav
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a',
      border: '1px solid rgba(255,107,0,0.4)',
      borderRadius: '100px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
        🆕 New version available
      </span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#ff6b00',
          color: '#fff',
          border: 'none',
          borderRadius: '100px',
          padding: '6px 16px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Update
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <SWUpdatePrompt />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
