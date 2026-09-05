import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', lightText = false }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const titleSize = isLarge ? '3.25rem' : (isSmall ? '1.4rem' : '2.25rem');
  const subtitleSize = isLarge ? '1rem' : (isSmall ? '0.75rem' : '0.85rem');

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {/* Typography Wordmark */}
      <div style={{
        fontSize: titleSize,
        fontWeight: 900,
        color: lightText ? '#ffffff' : '#0f172a',
        letterSpacing: '-0.04em',
        lineHeight: 1
      }}>
        MANAS
      </div>
      {!isSmall && (
        <div style={{
          fontSize: subtitleSize,
          fontWeight: 700,
          color: lightText ? '#ccfbf1' : '#0d9488',
          marginTop: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Neural Memory Companion
        </div>
      )}
    </div>
  );
};
