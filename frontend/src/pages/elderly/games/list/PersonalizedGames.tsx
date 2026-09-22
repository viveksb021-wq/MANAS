import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Heart, Users, MapPin, Sparkles, Image } from 'lucide-react';
import { speakText } from '../../../../utils/speech';
import { usePatient, FamilyMember } from '../../../../context/PatientContext';
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
  const { activeFamilyMembers } = usePatient();
  const validPool = activeFamilyMembers.filter(m => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');

  if (validPool.length === 0) {
    return (
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
        <Users size={48} color="#0f766e" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          No Family Members Enrolled
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5 }}>
          Your caregiver can add family members in People I Know to practice familiar faces.
        </p>
      </div>
    );
  }

  const selectedMember = validPool[(level - 1) % validPool.length];
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
            src={selectedMember.photo_url || selectedMember.imagePath}
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

const MySpecialMomentContent: React.FC<MySpecialMomentContentProps> = ({ level, recordAttempt, finishGame }) => {
  const { memories } = usePatient();

  if (memories.length === 0) {
    return (
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
        <Image size={48} color="#0f766e" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          No Memories Saved Yet
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5 }}>
          Your caregiver can add special memories, photos, and stories in Memory Garden.
        </p>
      </div>
    );
  }

  const current = memories[(level - 1) % memories.length];
  const [chosen, setChosen] = useState<string | null>(null);

  const handleChoice = (answer: string) => {
    if (chosen !== null) return;
    setChosen(answer);
    recordAttempt(true);
    speakText(`Thank you for sharing! This is your memory: ${current.title}.`);
    setTimeout(() => finishGame(100), 1000);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      {current.photo_url && (
        <img
          src={current.photo_url}
          alt={current.title}
          style={{ width: '100%', height: '210px', borderRadius: '20px', objectFit: 'cover', marginBottom: '1.25rem' }}
        />
      )}
      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
        {current.title}
      </h3>
      <p style={{ fontSize: '1.15rem', color: '#334155', marginBottom: '1.5rem', lineHeight: 1.4 }}>
        {current.description || `Do you remember this special moment at ${current.place || 'home'}?`}
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
  const { places, memories } = usePatient();

  const memoryWithPlace = memories.find(m => m.place && m.place.trim().length > 0);
  const targetPlaceName = memoryWithPlace ? memoryWithPlace.place! : (places.length > 0 ? places[0].name : null);

  if (!targetPlaceName) {
    return (
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
        <MapPin size={48} color="#0f766e" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          No Visited Places Recorded
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5 }}>
          Your caregiver can add visited places or vacation memories in the Caregiver Portal.
        </p>
      </div>
    );
  }

  const otherPlaces = places.filter(p => p.name !== targetPlaceName);
  const distractorName = otherPlaces.length > 0 ? otherPlaces[0].name : 'City Centre Market';

  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: `📍 ${targetPlaceName}`, isCorrect: true },
    { label: `📍 ${distractorName}`, isCorrect: false }
  ].sort(() => Math.random() - 0.5);

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? `Correct! You visited ${targetPlaceName}.` : `Good try! The place was ${targetPlaceName}.`);
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1200);
  };

  const questionTitle = memoryWithPlace
    ? `Where did you go in this memory: "${memoryWithPlace.title}"?`
    : `Which of these places is saved in your familiar locations?`;

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.3 }}>
        {questionTitle}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {options.map((opt, i) => {
          const isChosen = selected === opt.label;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selected !== null) {
            if (isChosen) {
              bg = opt.isCorrect ? '#10b981' : '#f43f5e';
              border = opt.isCorrect ? '#059669' : '#e11d48';
              color = '#ffffff';
            } else if (opt.isCorrect) {
              bg = '#d1fae5';
              border = '#10b981';
              color = '#065f46';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleChoice(opt)}
              disabled={selected !== null}
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                borderRadius: '20px',
                border: `3px solid ${border}`,
                background: bg,
                color: color,
                fontWeight: 800,
                fontSize: '1.25rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: selected ? 'default' : 'pointer',
                minHeight: '64px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{opt.label}</span>
              {selected !== null && opt.isCorrect && <span>✓</span>}
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
      instructions="Identify the familiar place from your memories or visits."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <WhereDidWeGoContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
