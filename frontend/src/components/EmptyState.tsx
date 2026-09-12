import React from 'react';
import { LucideIcon, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = '#0d9488',
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '3rem 2rem',
        border: '3px dashed #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          background: `${accentColor}15`,
          color: accentColor,
          padding: '1.25rem',
          borderRadius: '50%',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={48} aria-hidden="true" />
      </div>

      <h3
        style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '1.1rem',
          color: '#64748b',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: actionLabel && onAction ? '1.75rem' : '0',
          fontWeight: 500,
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="touch-target"
          aria-label={actionLabel}
          style={{
            minHeight: '48px',
            padding: '0.75rem 1.5rem',
            borderRadius: '16px',
            background: accentColor,
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 8px 20px ${accentColor}40`,
          }}
        >
          <PlusCircle size={20} aria-hidden="true" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
