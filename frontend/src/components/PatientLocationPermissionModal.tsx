import React from 'react';
import { MapPin, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PatientLocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const PatientLocationPermissionModal: React.FC<PatientLocationPermissionModalProps> = ({
  isOpen,
  onAllow,
  onDeny
}) => {
  const { isHighContrast } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loc-perm-title"
      aria-describedby="loc-perm-desc"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: isHighContrast ? '#000000' : '#ffffff',
          color: isHighContrast ? '#ffff00' : '#0f172a',
          border: isHighContrast ? '3px solid #ffff00' : '2px solid rgba(13, 148, 136, 0.3)',
          borderRadius: '32px',
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}
      >
        {/* Safe Care Icon Badge */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: isHighContrast ? '#111111' : '#ccfbf1',
            color: isHighContrast ? '#ffff00' : '#0f766e',
            border: isHighContrast ? '2px solid #ffff00' : '3px solid #99f6e4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.25)'
          }}
        >
          <MapPin size={44} strokeWidth={2.5} />
        </div>

        {/* Prompt Heading */}
        <h2
          id="loc-perm-title"
          style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: '1rem',
            color: isHighContrast ? '#ffff00' : '#0f172a',
            letterSpacing: '-0.02em'
          }}
        >
          Allow MANAS to share your location with your caregiver?
        </h2>

        {/* Friendly explanation */}
        <p
          id="loc-perm-desc"
          style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: isHighContrast ? '#ffffff' : '#475569',
            lineHeight: 1.6,
            marginBottom: '2.25rem'
          }}
        >
          Your caregiver can see your current location while location sharing is turned on.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={onAllow}
            className="touch-target"
            style={{
              width: '100%',
              minHeight: '64px',
              padding: '1.1rem 1.5rem',
              borderRadius: '20px',
              background: isHighContrast ? '#ffff00' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: isHighContrast ? '#000000' : '#ffffff',
              fontSize: '1.3rem',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 8px 20px rgba(13, 148, 136, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <CheckCircle size={28} />
            ALLOW LOCATION
          </button>

          <button
            onClick={onDeny}
            className="touch-target"
            style={{
              width: '100%',
              minHeight: '56px',
              padding: '0.9rem 1.5rem',
              borderRadius: '20px',
              background: isHighContrast ? '#222222' : '#f1f5f9',
              color: isHighContrast ? '#ffffff' : '#64748b',
              fontSize: '1.15rem',
              fontWeight: 800,
              border: isHighContrast ? '1px solid #ffffff' : '1.5px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem'
            }}
          >
            <XCircle size={24} />
            DENY
          </button>
        </div>

        {/* Micro-hint for settings */}
        <div
          style={{
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: isHighContrast ? '#ffffff' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <ShieldCheck size={16} />
          You can change this anytime from the Menu
        </div>
      </div>
    </div>
  );
};
