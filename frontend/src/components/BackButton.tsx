import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: 'patient' | 'caregiver' | 'minimal';
  style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  onClick,
  variant = 'patient',
  style
}) => {
  const { goBack } = useNavigation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      goBack();
    }
  };

  if (variant === 'caregiver') {
    return (
      <button
        onClick={handleClick}
        className="touch-target"
        aria-label={`Go back - ${label}`}
        style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '0.5rem 1rem',
          minHeight: '44px',
          minWidth: '44px',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: '#334155',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          transition: 'all 0.15s ease',
          ...style
        }}
      >
        <ArrowLeft size={18} /> {label}
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className="touch-target"
        aria-label={`Go back - ${label}`}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          minHeight: '44px',
          minWidth: '44px',
          fontWeight: 700,
          fontSize: '1rem',
          color: '#0f766e',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
          ...style
        }}
      >
        <ArrowLeft size={20} /> {label}
      </button>
    );
  }

  // Primary Patient Portal Large Touch Target Variant (Min 56px height)
  return (
    <button
      onClick={handleClick}
      className="touch-target"
      aria-label={`Go back - ${label}`}
      style={{
        background: '#ffffff',
        border: '3px solid #cbd5e1',
        borderRadius: '20px',
        padding: '0.75rem 1.4rem',
        minHeight: '56px',
        minWidth: '56px',
        fontWeight: 800,
        fontSize: '1.15rem',
        color: '#0f172a',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.15s ease',
        ...style
      }}
    >
      <ArrowLeft size={24} color="#0f766e" /> {label}
    </button>
  );
};
