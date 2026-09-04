import React from 'react';
import { Logo } from '../components/Logo';
import { CulturalPattern } from '../components/CulturalPattern';
import { CulturalLayer } from '../components/CulturalLayer';
import { PageTransition } from '../components/PageTransition';

interface LandingPageProps {
  onSelectRole: (role: 'patient_login' | 'guardian_login') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        background: '#fdfbf7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Regional Textile Pattern Layer (5% opacity) */}
        <CulturalPattern opacity={0.05} color="#0f766e" />

        {/* Regional Watermark Script */}
        <CulturalLayer region="assam" language="as" />

        {/* Top Header / Branding */}
        <div style={{ textAlign: 'center', zIndex: 2, marginTop: '1rem' }}>
          <Logo size="large" />
          
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#0f766e',
            marginTop: '1.25rem',
            letterSpacing: '0.02em'
          }}>
            Memory Assistance & Neural Adaptive System
          </h2>

          <p style={{
            fontSize: '1.65rem',
            fontWeight: 600,
            color: '#334155',
            marginTop: '0.4rem',
            fontStyle: 'italic'
          }}>
            "Helping memories stay connected."
          </p>
        </div>

        {/* Primary Role Options Box */}
        <div style={{
          maxWidth: '740px',
          width: '100%',
          margin: '2rem auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          zIndex: 2
        }}>
          {/* Option 1: PATIENT */}
          <button
            onClick={() => onSelectRole('patient_login')}
            style={{
              background: '#ffffff',
              border: '4px solid #134e4a',
              borderRadius: '28px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 16px 32px -8px rgba(19, 78, 74, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>👵 / 👴</div>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                PATIENT
              </h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f766e', marginTop: '0.25rem' }}>
                Continue with MANAS
              </p>
            </div>
          </button>

          {/* Option 2: GUARDIAN */}
          <button
            onClick={() => onSelectRole('guardian_login')}
            style={{
              background: '#ffffff',
              border: '4px solid #94a3b8',
              borderRadius: '28px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 16px 32px -8px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>👨‍👩‍👧</div>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                GUARDIAN
              </h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4338ca', marginTop: '0.25rem' }}>
                Caregiver Dashboard
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', zIndex: 2, color: '#64748b' }}>
          <p style={{ fontSize: '1.15rem', fontWeight: 600, color: '#475569' }}>
            "Your privacy and dignity matter."
          </p>
        </div>
      </div>
    </PageTransition>
  );
};
