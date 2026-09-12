import React from 'react';
import { AlertCircle, ArrowLeft, Play } from 'lucide-react';
import { useNavigation } from '../../../../context/NavigationContext';

export const ExitConfirmationModal: React.FC = () => {
  const { isExitModalOpen, triggerPendingBack, cancelPendingBack } = useNavigation();

  if (!isExitModalOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        maxWidth: '480px',
        width: '100%',
        padding: '2.25rem 2rem',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        border: '3px solid #f43f5e',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          background: '#ffe4e6',
          color: '#e11d48',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <AlertCircle size={40} />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Leave this activity?
        </h2>

        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#475569', lineHeight: 1.4, marginBottom: '1.75rem' }}>
          Your current progress may be lost if you leave now.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <button
            onClick={cancelPendingBack}
            style={{
              width: '100%',
              padding: '1.1rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(15, 118, 110, 0.3)'
            }}
          >
            <Play size={22} /> Continue Activity
          </button>

          <button
            onClick={triggerPendingBack}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '18px',
              background: '#fff1f2',
              border: '2px solid #f43f5e',
              color: '#be123c',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} /> Leave Activity
          </button>
        </div>
      </div>
    </div>
  );
};
