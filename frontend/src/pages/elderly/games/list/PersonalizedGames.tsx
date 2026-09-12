import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Heart, Users, MapPin, Sparkles } from 'lucide-react';
import { speakText } from '../../../../utils/speech';
import { usePatient, DEFAULT_FAMILY_MEMBERS_P1 } from '../../../../context/PatientContext';
import { FamilyImage } from '../../../../components/FamilyImage';

// ==========================================
// GAME 23: MY FAMILY REINFORCEMENT
// ==========================================
interface MyFamilyContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const MyFamilyContent: React.FC<MyFamilyContentProps> = ({ level, recordAttempt, finishGame }) => {
  const { familyMembers } = usePatient();
  const pool = (familyMembers && familyMembers.length >= 2) ? familyMembers : DEFAULT_FAMILY_MEMBERS_P1;
  const nonPatientMembers = pool.filter(m => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');
  const validPool = nonPatientMembers.length > 0 ? nonPatientMembers : pool;

  const [selectedMember] = useState(() => {
    // Pick member by level offset for variety
    return validPool[(level - 1) % validPool.length];
  });
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = () => {
    if (acknowledged) return;
    setAcknowledged(true);
    recordAttempt(true);
    if (selectedMember) {
      speakText(`${selectedMember.name} is your ${selectedMember.relationship}.`);
    }
    setTimeout(() => finishGame(100), 1000);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #0f766e', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid #0f766e',
          boxShadow: '0 8px 20px rgba(15, 118, 110, 0.2)',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FamilyImage
            src={selectedMember.imagePath}
            alt={selectedMember.name}
            name={selectedMember.name}
            relationship={selectedMember.relationship}
            size="140px"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              border: 'none'
            }}
          />
        </div>
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{selectedMember.name}</h3>
      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem' }}>{selectedMember.relationship}</p>
      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem', fontStyle: 'italic' }}>
        "{selectedMember.notes || 'A beloved and cherished member of your family.'}"
      </p>
      <button
        onClick={handleAcknowledge}
        disabled={acknowledged}
        style={{
          width: '100%',
          padding: '1.15rem',
          borderRadius: '20px',
          background: acknowledged ? '#10b981' : '#0f766e',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.25rem',
          border: 'none',
          cursor: acknowledged ? 'default' : 'pointer',
          minHeight: '56px',
          boxShadow: '0 4px 15px rgba(15, 118, 110, 0.3)',
          transition: 'all 0.15s ease'
        }}
      >
        {acknowledged ? '✓ Remembered!' : `I Remember ${selectedMember.name} ❤️`}
      </button>
    </div>
  );
};

export const MyFamilyActivity: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="my_family_activity"
      title="My Family Reinforcement"
      domainName="Personalized Memory"
      instructions="Review your family member profile card."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <MyFamilyContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 24: MY SPECIAL MOMENT
// ==========================================
interface MySpecialMomentContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const MOMENT_LEVELS = [
  { title: 'Bihu Festival Celebration', prompt: 'Do you remember this traditional celebration with homemade Pitha sweets?', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', feedback: 'Thank you for sharing. This is your Bihu Festival celebration memory.' },
  { title: 'Family Garden Afternoon Tea', prompt: 'Do you remember drinking warm Assam tea in the garden with your daughter Meera?', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', feedback: 'Wonderful memory! Garden afternoon tea brings warmth and peace.' }
];

const MySpecialMomentContent: React.FC<MySpecialMomentContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = MOMENT_LEVELS[(level - 1) % MOMENT_LEVELS.length];
  const [chosen, setChosen] = useState<string | null>(null);

  const handleChoice = (answer: string) => {
    if (chosen !== null) return;
    setChosen(answer);
    recordAttempt(true);
    speakText(current.feedback);
    setTimeout(() => finishGame(100), 1000);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <img
        src={current.image}
        alt={current.title}
        style={{ width: '100%', height: '210px', borderRadius: '20px', objectFit: 'cover', marginBottom: '1.25rem' }}
      />
      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
        {current.title} (Level {level})
      </h3>
      <p style={{ fontSize: '1.15rem', color: '#334155', marginBottom: '1.5rem', lineHeight: 1.4 }}>
        {current.prompt}
      </p>
      <div style={{ display: 'flex', gap: '0.85rem' }}>
        <button
          onClick={() => handleChoice('Yes')}
          disabled={chosen !== null}
          style={{
            flex: 1,
            padding: '1.1rem',
            borderRadius: '20px',
            background: chosen === 'Yes' ? '#10b981' : '#0f766e',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.2rem',
            border: 'none',
            cursor: chosen ? 'default' : 'pointer',
            minHeight: '56px',
            transition: 'all 0.15s ease'
          }}
        >
          Yes, I do!
        </button>
        <button
          onClick={() => handleChoice('Not Sure')}
          disabled={chosen !== null}
          style={{
            flex: 1,
            padding: '1.1rem',
            borderRadius: '20px',
            background: chosen === 'Not Sure' ? '#94a3b8' : '#f1f5f9',
            color: chosen === 'Not Sure' ? '#ffffff' : '#475569',
            fontWeight: 800,
            fontSize: '1.2rem',
            border: 'none',
            cursor: chosen ? 'default' : 'pointer',
            minHeight: '56px',
            transition: 'all 0.15s ease'
          }}
        >
          Not sure
        </button>
      </div>
    </div>
  );
};

export const MySpecialMomentActivity: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="my_special_moment"
      title="My Special Moment"
      domainName="Personalized Memory"
      instructions="Look at this special memory card saved by your caregiver."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <MySpecialMomentContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 25: WHERE DID WE GO?
// ==========================================
interface WhereDidWeGoContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const WhereDidWeGoContent: React.FC<WhereDidWeGoContentProps> = ({ level, recordAttempt, finishGame }) => {
  const { familyMembers } = usePatient();
  const pool = (familyMembers && familyMembers.length >= 2) ? familyMembers : DEFAULT_FAMILY_MEMBERS_P1;
  const nonPatientMembers = pool.filter(m => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');
  const son = nonPatientMembers.find(m => m.id === 'son') || nonPatientMembers[0] || { name: 'Ravi' };
  const nephewOrGrandson = nonPatientMembers.find(m => m.id === 'brother1-son') || nonPatientMembers[1] || { name: 'Arun' };

  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: '🌲 Shillong Peak Viewpoint', isCorrect: true },
    { label: '🏬 City Shopping Mall', isCorrect: false }
  ];

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? `Correct! You visited Shillong Peak with ${nephewOrGrandson.name} and ${son.name}.` : "Good try!");
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1200);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.3 }}>
        Where did you go on a sunny trip with {nephewOrGrandson.name} and {son.name}? (Level {level})
      </h3>

      {/* NEUTRAL BUTTONS BEFORE ANSWERING: No pre-highlight! */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {options.map((opt, i) => {
          const isChosen = selected === opt.label;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selected !== null) {
            if (isChosen) {
              bg = opt.isCorrect ? '#dcfce7' : '#fee2e2';
              border = opt.isCorrect ? '#16a34a' : '#dc2626';
              color = opt.isCorrect ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleChoice(opt)}
              disabled={selected !== null && opt.isCorrect}
              style={{
                padding: '1.15rem',
                borderRadius: '20px',
                border: `3px solid ${border}`,
                background: bg,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: color,
                cursor: selected ? 'default' : 'pointer',
                minHeight: '56px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const WhereDidWeGoActivity: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="where_did_we_go"
      title="Where Did We Go?"
      domainName="Personalized Memory"
      instructions="Contextual memory link: Identify where you visited with your family."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <WhereDidWeGoContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
