import { useState, useEffect } from 'react';
import { createApiUrl } from '../config/api';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(createApiUrl('api/health'), {
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      const data = await response.json();
      if (data.status === 'OK') {
        setStatus('connected');
        setVersion(data.version || '1.0.0');
      } else {
        setStatus('disconnected');
      }
    } catch (error: any) {
      // Silently handle connection errors (backend not running)
      if (error.name !== 'AbortError' && !error.message?.includes('Failed to fetch')) {
        // Only log non-connection errors
      }
      setStatus('disconnected');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: status === 'connected' ? 'linear-gradient(135deg, #2D6A4F, #52B788)' : 
                  status === 'disconnected' ? 'linear-gradient(135deg, #E63946, #F77F00)' : 
                  'linear-gradient(135deg, #FCA311, #FFD60A)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '50px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'Inter, sans-serif',
      border: '2px solid rgba(255,255,255,0.3)',
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: 'white',
        animation: status === 'connected' ? 'pulse 2s infinite' : 'none'
      }} />
      <span>
        {status === 'connected' && `Backend Connected v${version}`}
        {status === 'disconnected' && 'Backend Offline'}
        {status === 'checking' && 'Checking Backend...'}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}


