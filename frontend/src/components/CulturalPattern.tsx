import React from 'react';

interface CulturalPatternProps {
  opacity?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CulturalPattern
 * An abstract geometric vector pattern inspired by traditional North Eastern (NER)
 * woven textiles (such as Assamese Gamocha/Bihu motifs and Mizo/Manipuri handloom weaves).
 * Rendered subtly (3-8% opacity) to provide authentic visual identity without reducing readability.
 */
export const CulturalPattern: React.FC<CulturalPatternProps> = ({
  opacity = 0.05,
  color = '#0f766e',
  style,
  className = ''
}) => {
  return (
    <div
      className={`cultural-pattern-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        opacity,
        ...style
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ner-textile-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamond Weave Motif */}
            <path
              d="M 40 0 L 80 40 L 40 80 L 0 40 Z"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
            />
            <path
              d="M 40 10 L 70 40 L 40 70 L 10 40 Z"
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Inner Star/Flora Center */}
            <circle cx="40" cy="40" r="4" fill={color} />
            <path
              d="M 40 25 L 40 55 M 25 40 L 55 40 M 30 30 L 50 50 M 30 50 L 50 30"
              stroke={color}
              strokeWidth="1"
            />
            {/* Outer Border Accents */}
            <path
              d="M 0 0 L 10 10 M 80 0 L 70 10 M 80 80 L 70 70 M 0 80 L 10 70"
              stroke={color}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ner-textile-pattern)" />
      </svg>
    </div>
  );
};
