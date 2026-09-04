import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PageTransition
 * Smooth fade + 8px vertical lift (250ms cubic-bezier transition)
 * Ensures polished product UX between major screens.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`page-transition-container ${className}`}
      style={{
        animation: 'pageSlideFade 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        width: '100%',
        ...style
      }}
    >
      <style>{`
        @keyframes pageSlideFade {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {children}
    </div>
  );
};
