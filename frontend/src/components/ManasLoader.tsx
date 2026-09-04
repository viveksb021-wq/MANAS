import React, { useEffect, useState } from 'react';
import { Brain, Heart, MapPin, Sparkles } from 'lucide-react';

export type LoaderType = 'sunrise' | 'ai' | 'map' | 'rhino';

interface ManasLoaderProps {
  type?: LoaderType;
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
  onComplete?: () => void;
}

export const ManasLoader: React.FC<ManasLoaderProps> = ({
  type = 'sunrise',
  message,
  submessage,
  fullScreen = true,
  onComplete
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Render Sun Rising Animation using Reference Artwork
  const renderSunRisingLoader = () => (
    <div style={{ textAlign: 'center', position: 'relative', width: '100%', maxWidth: '480px', padding: '1rem' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        background: '#ffffff',
        borderRadius: '28px',
        padding: '1.5rem 1rem 0.75rem',
        boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
        border: '3px solid #ccfbf1',
        overflow: 'hidden'
      }}>
        {/* Reference Stippled Mountain Artwork Frame */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/sunrise_reference.jpg"
            alt="MANAS Sun Rising Reference Artwork"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '260px',
              objectFit: 'contain',
              display: 'block'
            }}
          />

          {/* Animated Rising Sun Overlay - Sun rises from behind mountain ridge into sky */}
          {!reducedMotion && (
            <div style={{
              position: 'absolute',
              top: '16%',
              right: '37%',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ef4444 0%, #f97316 60%, rgba(245, 158, 11, 0) 100%)',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.75)',
              animation: 'sunRiseUp 3.2s infinite cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none'
            }} />
          )}

          {/* Animated SVG Flying Birds Overlay matching diagonal path to red sun */}
          {!reducedMotion && (
            <svg
              viewBox="0 0 400 200"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            >
              <g style={{ animation: 'birdsAscend 5.5s infinite ease-in-out' }}>
                <path d="M 180 125 Q 185 119, 190 125 Q 195 119, 200 125" fill="none" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 205 110 Q 210 105, 215 110 Q 220 105, 225 110" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
                <path d="M 220 95 Q 224 90, 228 95 Q 232 90, 236 95" fill="none" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* MANAS Neural Emblem & Text */}
      <div style={{
        marginTop: '1.25rem',
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(15, 118, 110, 0.35)',
          position: 'relative'
        }}>
          <Brain size={34} />
          <Heart size={15} fill="#f43f5e" color="#f43f5e" style={{ position: 'absolute', bottom: '6px', right: '6px' }} />
        </div>
        <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.75rem', letterSpacing: '-0.02em' }}>
          {message || 'MANAS'}
        </h3>
        <p style={{ fontSize: '1.05rem', color: '#0f766e', fontWeight: 600, marginTop: '0.2rem' }}>
          {submessage || 'Helping memories stay connected...'}
        </p>
      </div>
    </div>
  );

  // Render Map Loader (Places I Know & Route Guidance)
  const renderMapLoader = () => (
    <div style={{ textAlign: 'center', maxWidth: '380px', width: '100%', padding: '1.5rem' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 1.25rem',
        borderRadius: '50%',
        background: '#ccfbf1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0f766e',
        boxShadow: '0 0 0 12px rgba(15, 118, 110, 0.1)',
        animation: reducedMotion ? 'none' : 'pulse-subtle 2s infinite ease-in-out'
      }}>
        <MapPin size={44} />
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
        {message || 'Finding your place...'}
      </h3>
      <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '0.35rem' }}>
        {submessage || 'Preparing step-by-step route guidance...'}
      </p>
    </div>
  );

  // Render AI Loader (Ask MANAS Voice Assistant thinking)
  const renderAiLoader = () => (
    <div style={{ textAlign: 'center', maxWidth: '380px', width: '100%', padding: '1.5rem' }}>
      <div style={{
        width: '90px',
        height: '90px',
        margin: '0 auto 1.25rem',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 30px rgba(15, 118, 110, 0.35)',
        position: 'relative',
        animation: reducedMotion ? 'none' : 'aiPulse 2.2s infinite ease-in-out'
      }}>
        <Brain size={50} />
        <Sparkles size={22} color="#fef08a" style={{ position: 'absolute', top: '8px', right: '8px' }} />
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
        {message || 'MANAS is thinking...'}
      </h3>
      <p style={{ fontSize: '0.95rem', color: '#0f766e', fontWeight: 600, marginTop: '0.35rem' }}>
        {submessage || 'Searching stored memories, people, and routines...'}
      </p>
    </div>
  );

  return (
    <div
      role="status"
      aria-label={message || 'Loading MANAS'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: fullScreen ? '#fdfbf7' : 'transparent',
        minHeight: fullScreen ? '100vh' : '260px',
        width: '100%',
        padding: '2rem'
      }}
    >
      <style>{`
        @keyframes sunRiseUp {
          0% { transform: translateY(42px) scale(0.65); opacity: 0.15; filter: blur(3px); }
          40% { transform: translateY(12px) scale(0.9); opacity: 0.7; filter: blur(1px); }
          75%, 100% { transform: translateY(0px) scale(1.08); opacity: 1; filter: blur(0px); }
        }
        @keyframes birdsAscend {
          0% { transform: translate(-15px, 20px) scale(0.85); opacity: 0.5; }
          50% { transform: translate(5px, 0px) scale(1); opacity: 1; }
          100% { transform: translate(25px, -18px) scale(1.1); opacity: 0.85; }
        }
        @keyframes aiPulse {
          0%, 100% { transform: scale(1); boxShadow: 0 12px 30px rgba(15, 118, 110, 0.35); }
          50% { transform: scale(1.06); boxShadow: 0 18px 40px rgba(15, 118, 110, 0.5); }
        }
      `}</style>

      {type === 'map' ? renderMapLoader() : (type === 'ai' ? renderAiLoader() : renderSunRisingLoader())}
    </div>
  );
};
