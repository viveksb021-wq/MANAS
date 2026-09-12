import React, { useState } from 'react';

export type ManasAssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error';

interface ManasBrainCharacterProps {
  state: ManasAssistantState;
  isHovered: boolean;
  onClick: () => void;
  isReduceMotion?: boolean;
}

export const ManasBrainCharacter: React.FC<ManasBrainCharacterProps> = ({
  state,
  isHovered,
  onClick,
  isReduceMotion = false
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setTilt({
      x: deltaY * -10, // Tilt X axis
      y: deltaX * 12   // Tilt Y axis
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Determine state animation class
  let animClass = 'brain-idle-float';
  if (isReduceMotion) {
    animClass = '';
  } else if (state === 'listening') {
    animClass = 'brain-listening-pulse';
  } else if (state === 'thinking') {
    animClass = 'brain-thinking-glow';
  } else if (state === 'speaking') {
    animClass = 'brain-idle-float';
  }

  // Active state elevated lift
  const isActive = state === 'listening' || state === 'thinking' || state === 'speaking';
  const hoverScale = isHovered ? 1.06 : (isActive ? 1.04 : 1);
  const hoverY = isHovered ? -8 : (isActive ? -6 : 0);

  // Dynamic Aura Glow Colors & Scale based on State
  let auraOpacity = 0.7;
  let auraScale = 1;
  let auraGradient = 'radial-gradient(circle, rgba(0, 242, 254, 0.45) 0%, rgba(56, 189, 248, 0.35) 35%, rgba(139, 92, 246, 0.22) 60%, rgba(217, 70, 239, 0.12) 75%, transparent 88%)';

  if (state === 'listening') {
    auraOpacity = 1;
    auraScale = 1.25;
    auraGradient = 'radial-gradient(circle, rgba(0, 242, 254, 0.75) 0%, rgba(56, 189, 248, 0.5) 40%, rgba(13, 148, 136, 0.35) 65%, transparent 85%)';
  } else if (state === 'thinking') {
    auraOpacity = 0.95;
    auraScale = 1.2;
    auraGradient = 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(217, 70, 239, 0.5) 45%, rgba(0, 242, 254, 0.4) 70%, transparent 88%)';
  } else if (state === 'speaking') {
    auraOpacity = 0.9;
    auraScale = 1.15;
    auraGradient = 'radial-gradient(circle, rgba(0, 242, 254, 0.6) 0%, rgba(139, 92, 246, 0.45) 50%, rgba(56, 189, 248, 0.25) 75%, transparent 88%)';
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open MANAS AI assistant"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        perspective: '900px',
        padding: '12px 14px'
      }}
    >
      {/* LAYER A: ENVIRONMENT LIGHT SPILL (Soft wash on surrounding background) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-45px',
          left: '-45px',
          right: '-45px',
          bottom: '-25px',
          borderRadius: '50%',
          background: auraGradient,
          filter: 'blur(32px)',
          opacity: auraOpacity * 0.75,
          transform: `scale(${auraScale})`,
          transition: isReduceMotion ? 'none' : 'all 0.45s ease-out',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* LAYER B: LUMINOUS NEON CORE AURA */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-18px',
          left: '-18px',
          right: '-18px',
          bottom: '-5px',
          borderRadius: '50%',
          background: auraGradient,
          filter: 'blur(16px)',
          opacity: auraOpacity,
          transform: `scale(${auraScale})`,
          transition: isReduceMotion ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* LAYER C: ORBITING LIGHT ENERGY RING */}
      {!isReduceMotion && (
        <div
          aria-hidden="true"
          className="neon-orbiting-ring"
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '18px',
            borderRadius: '50%',
            border: '1.5px solid transparent',
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(0, 242, 254, 0.5) 25%, rgba(139, 92, 246, 0.45) 50%, rgba(217, 70, 239, 0.3) 75%, transparent 100%)',
            maskImage: 'radial-gradient(circle, transparent 62%, black 65%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 62%, black 65%)',
            pointerEvents: 'none',
            zIndex: 2,
            animation: state === 'thinking' ? 'spinOrbit 3s linear infinite' : 'spinOrbit 9s linear infinite',
            opacity: isHovered || isActive ? 0.9 : 0.45
          }}
        />
      )}

      {/* LAYER D: 3D BRAIN CHARACTER WITH DEPTH & RIM LIGHT */}
      <div
        className={animClass}
        style={{
          position: 'relative',
          zIndex: 3,
          transition: isReduceMotion ? 'none' : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hoverY}px) scale(${hoverScale})`,
          filter: isActive
            ? 'drop-shadow(0 18px 24px rgba(15, 23, 42, 0.4)) drop-shadow(0 0 20px rgba(0, 242, 254, 0.75)) brightness(1.06)'
            : (isHovered
              ? 'drop-shadow(0 16px 22px rgba(15, 23, 42, 0.35)) drop-shadow(0 0 16px rgba(0, 242, 254, 0.55)) brightness(1.04)'
              : 'drop-shadow(0 14px 20px rgba(15, 23, 42, 0.32)) drop-shadow(0 0 12px rgba(0, 242, 254, 0.35))')
        }}
      >
        {/* Base Character Graphic */}
        <img
          src="/images/manas_brain_mascot.png"
          alt="MANAS AI Assistant"
          className="manas-brain-character-img"
          style={{
            width: '124px',
            height: '124px',
            objectFit: 'contain',
            display: 'block'
          }}
        />

        {/* Neural Thought Pulsing Wave on Cranium during Thinking */}
        {state === 'thinking' && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '12px',
              left: '20px',
              right: '20px',
              height: '46px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(0, 242, 254, 0.85) 50%, transparent 80%)',
              filter: 'blur(7px)',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              animation: 'neuralGlow 1.6s infinite ease-in-out'
            }}
          />
        )}

        {/* Dynamic Lip-Sync Mouth Animation during Speaking */}
        {state === 'speaking' && (
          <div
            aria-hidden="true"
            className="brain-mouth-talk"
            style={{
              position: 'absolute',
              bottom: '44px',
              left: '52px',
              width: '20px',
              height: '10px',
              borderRadius: '0 0 10px 10px',
              background: '#500724',
              border: '2px solid #be123c',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '3px',
                background: '#ffffff',
                margin: '0 auto',
                borderRadius: '0 0 2px 2px'
              }}
            />
          </div>
        )}
      </div>

      {/* LAYER E: GROUND CONTACT NEON RING (Floor reflection) */}
      <div
        aria-hidden="true"
        style={{
          width: '88px',
          height: '16px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0, 242, 254, 0.45) 0%, rgba(139, 92, 246, 0.25) 45%, transparent 75%)',
          filter: 'blur(4px)',
          marginTop: '-12px',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: isActive ? 0.95 : (isHovered ? 0.8 : 0.55),
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* LAYER F: GROUND CONTACT SHADOW (Synced with Floating Bob) */}
      <div
        aria-hidden="true"
        className={isReduceMotion ? '' : 'brain-shadow-float'}
        style={{
          width: '74px',
          height: '12px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0) 75%)',
          marginTop: '-10px',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'transform 0.3s ease'
        }}
      />
    </div>
  );
};
