import React, { useState } from 'react';
import { User } from 'lucide-react';

interface FamilyImageProps {
  src?: string;
  alt: string;
  relationship?: string;
  name?: string;
  style?: React.CSSProperties;
  className?: string;
  size?: number | string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
}

export const FamilyImage: React.FC<FamilyImageProps> = ({
  src,
  alt,
  relationship,
  name,
  style = {},
  className = '',
  size,
  objectFit,
  objectPosition
}) => {
  const [hasError, setHasError] = useState(false);

  const finalStyle: React.CSSProperties = {
    objectFit: objectFit || style.objectFit || 'cover',
    objectPosition: objectPosition || style.objectPosition || 'center 20%',
    width: size || style.width || '100%',
    height: size || style.height || '100%',
    borderRadius: style.borderRadius || '20px',
    border: style.border !== undefined ? style.border : '3px solid #0f766e',
    display: 'block',
    ...style
  };

  if (!src || hasError) {
    // Professional Fallback Placeholder Card
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : (relationship ? relationship.substring(0, 2).toUpperCase() : 'FM');

    return (
      <div
        className={className}
        style={{
          ...finalStyle,
          background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
        }}
      >
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ccfbf1', marginBottom: '0.2rem' }}>
          {initials}
        </div>
        {relationship && (
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>
            {relationship}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={finalStyle}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};
