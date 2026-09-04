import React from 'react';

interface CulturalLayerProps {
  region?: 'assam' | 'meghalaya' | 'manipur' | 'mizoram' | 'nagaland' | 'tripura' | 'arunachal' | 'sikkim';
  language?: string;
}

const REGIONAL_SCRIPTS: Record<string, { script: string; label: string; motif: string }> = {
  assam: { script: 'অসম • মন আৰু স্মৃতি', label: 'Assam • Mind & Memory', motif: 'Gamocha Weave' },
  meghalaya: { script: 'Khasi & Garo • Pine Hills', label: 'Meghalaya • Pine Hills', motif: 'Cloud Motif' },
  manipur: { script: 'মণিপুর • য়াাইবগী মফম', label: 'Manipur • Peaceful Realm', motif: 'Phanek Pattern' },
  mizoram: { script: 'Mizoram • Nunphung', label: 'Mizoram • Life & Harmony', motif: 'Puan Weave' },
  nagaland: { script: 'Nagaland • Friendship', label: 'Nagaland • Unity & Heritage', motif: 'Hornbill Weave' },
  tripura: { script: 'ত্রিপুরা • স্মৃতি সঙ্গী', label: 'Tripura • Memory Companion', motif: 'Rignai Motif' },
  arunachal: { script: 'Arunachal • Dawn Land', label: 'Arunachal • Dawn Land', motif: 'Sunrise Pattern' },
  sikkim: { script: 'Sikkim • Kanchenjunga', label: 'Sikkim • Kanchenjunga', motif: 'Lotus Motif' },
};

/**
 * CulturalLayer
 * Configurable regional script watermark and motif provider.
 * Keeps opacity extremely low (3-5%) so it acts as an elegant background accent.
 */
export const CulturalLayer: React.FC<CulturalLayerProps> = ({
  region = 'assam',
  language = 'as'
}) => {
  const config = REGIONAL_SCRIPTS[region] || REGIONAL_SCRIPTS['assam'];

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1.5rem',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.06,
        userSelect: 'none',
        textAlign: 'right'
      }}
    >
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f766e', fontFamily: 'serif' }}>
        {config.script}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#134e4a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {config.label}
      </div>
    </div>
  );
};
