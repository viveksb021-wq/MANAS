import React from 'react';
import { Brain, Heart, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', lightText = false }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const iconSize = isLarge ? 56 : (isSmall ? 24 : 36);
  const titleSize = isLarge ? '3rem' : (isSmall ? '1.4rem' : '2rem');
  const subtitleSize = isLarge ? '1rem' : (isSmall ? '0.75rem' : '0.85rem');

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isLarge ? '1rem' : '0.65rem' }}>
      {/* Visual Icon Mark */}
      <div style={{
        width: isLarge ? '90px' : (isSmall ? '42px' : '60px'),
        height: isLarge ? '90px' : (isSmall ? '42px' : '60px'),
        borderRadius: isLarge ? '26px' : (isSmall ? '12px' : '18px'),
        background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isLarge ? '0 15px 30px rgba(13, 148, 136, 0.35)' : '0 6px 15px rgba(13, 148, 136, 0.25)',
        position: 'relative'
      }}>
        <Brain size={iconSize} />
        <Heart
          size={isLarge ? 24 : (isSmall ? 10 : 16)}
          fill="#f43f5e"
          color="#f43f5e"
          style={{
            position: 'absolute',
            bottom: isLarge ? '12px' : (isSmall ? '4px' : '8px'),
            right: isLarge ? '12px' : (isSmall ? '4px' : '8px'),
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />
      </div>

      {/* Typography Wordmark */}
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontSize: titleSize,
          fontWeight: 800,
          color: lightText ? '#ffffff' : '#0f172a',
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}>
          MANAS
        </div>
        {!isSmall && (
          <div style={{
            fontSize: subtitleSize,
            fontWeight: 700,
            color: lightText ? '#ccfbf1' : '#0d9488',
            marginTop: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Neural Memory Companion
          </div>
        )}
      </div>
    </div>
  );
};
