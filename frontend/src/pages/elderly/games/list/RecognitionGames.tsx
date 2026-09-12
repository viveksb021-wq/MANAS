import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Eye, Users, MapPin } from 'lucide-react';
import { speakText } from '../../../../utils/speech';
import { usePatient, FamilyMember, DEFAULT_FAMILY_MEMBERS_P1 } from '../../../../context/PatientContext';
import { FamilyImage } from '../../../../components/FamilyImage';

// ==========================================
// GAME 18: FAMILIAR PERSON RECOGNITION (WHO IS THIS?)
// ==========================================
interface PersonRecognitionContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const PersonRecognitionContent: React.FC<PersonRecognitionContentProps> = ({ level, recordAttempt, finishGame }) => {
  const { familyMembers } = usePatient();
  const rawMembers: FamilyMember[] = (familyMembers && familyMembers.length >= 2) ? familyMembers : DEFAULT_FAMILY_MEMBERS_P1;
  // Patient is the player — exclude patient from games
  const members: FamilyMember[] = rawMembers.filter((m: FamilyMember) => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');

  const [currentTarget] = useState<FamilyMember>(() => {
    return members[Math.floor(Math.random() * members.length)];
  });

  const [options] = useState<{ label: string; isCorrect: boolean }[]>(() => {
    const distractors = members.filter(m => m.id !== currentTarget.id);
    const randomDistractor = distractors.length > 0
      ? distractors[Math.floor(Math.random() * distractors.length)]
      : { name: 'Suren', relationship: 'Neighbor' };

    return [
      { label: `${currentTarget.name} (${currentTarget.relationship})`, isCorrect: true },
      { label: `${randomDistractor.name} (${randomDistractor.relationship})`, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  });

  const [selectedOpt, setSelectedOpt] = useState<{ label: string; isCorrect: boolean } | null>(null);

  const handleAnswer = (choice: { label: string; isCorrect: boolean }) => {
    if (selectedOpt) return;
    setSelectedOpt(choice);
    recordAttempt(choice.isCorrect);

    if (choice.isCorrect) {
      speakText(`That's right! This is ${currentTarget.name}, your ${currentTarget.relationship}.`);
    } else {
      speakText(`That's okay. This is ${currentTarget.name}, your ${currentTarget.relationship}.`);
    }

    setTimeout(() => finishGame(choice.isCorrect ? 100 : 70), 1200);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          width: '220px',
          height: '220px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(15, 118, 110, 0.15)',
          border: '4px solid #0f766e',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FamilyImage
            src={currentTarget.imagePath}
            alt={currentTarget.name}
            name={currentTarget.name}
            relationship={currentTarget.relationship}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              borderRadius: '20px',
              border: 'none'
            }}
          />
        </div>
      </div>

      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
        Who is this? (Level {level})
      </h3>

      {/* NEUTRAL BUTTONS BEFORE ANSWERING */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {options.map((opt, idx) => {
          const isChosen = selectedOpt?.label === opt.label;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selectedOpt !== null) {
            if (isChosen) {
              bg = opt.isCorrect ? '#dcfce7' : '#fee2e2';
              border = opt.isCorrect ? '#16a34a' : '#dc2626';
              color = opt.isCorrect ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={selectedOpt !== null}
              style={{
                padding: '1.1rem',
                borderRadius: '20px',
                border: `3px solid ${border}`,
                background: bg,
                fontSize: '1.15rem',
                fontWeight: 800,
                color: color,
                cursor: selectedOpt ? 'default' : 'pointer',
                minHeight: '56px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
              }}
            >
              👤 {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PersonRecognitionGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="person_recognition"
      title="Familiar Person Recognition"
      domainName="Recognition"
      instructions="Look at the photo of your family member and select the correct relationship and name."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <PersonRecognitionContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 19: FAMILIAR PLACE RECOGNITION
// ==========================================
interface PlaceRecognitionContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const PLACE_LEVELS = [
  { prompt: 'Where is this saved place?', correct: '🏥 Shillong Medical Centre', wrong: '🌸 Lotus Park Pond', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80', feedback: 'Correct! This is Shillong Medical Centre.' },
  { prompt: 'Where did you take morning walks?', correct: '🌸 Lotus Park Pond & Gardens', wrong: '✈️ Airport Terminal', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80', feedback: 'Correct! This is Lotus Park Pond.' },
  { prompt: 'Where is your favorite tea garden view?', correct: '🍃 Happy Valley Tea Estate', wrong: '🏬 City Metro Station', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', feedback: 'Correct! This is Happy Valley Tea Estate.' }
];

const PlaceRecognitionContent: React.FC<PlaceRecognitionContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = PLACE_LEVELS[(level - 1) % PLACE_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: current.correct, isCorrect: true },
    { label: current.wrong, isCorrect: false }
  ];

  const handleAnswer = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? current.feedback : "Good try! Look at the scenery.");
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1200);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <img
        src={current.image}
        alt="Place"
        style={{ width: '100%', maxHeight: '220px', borderRadius: '20px', objectFit: 'cover', marginBottom: '1.25rem' }}
      />
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
        {current.prompt} (Level {level})
      </h3>

      {/* NEUTRAL BUTTONS: No pre-answer green background! */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {options.map((opt, idx) => {
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
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null && opt.isCorrect}
              style={{
                padding: '1.15rem',
                borderRadius: '20px',
                border: `3px solid ${border}`,
                background: bg,
                fontSize: '1.2rem',
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

export const PlaceRecognitionGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="place_recognition"
      title="Familiar Place Recognition"
      domainName="Recognition"
      instructions="Look at the image from Places I Know and select the correct location name."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <PlaceRecognitionContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 20: OBJECT RECOGNITION
// ==========================================
interface ObjectRecognitionContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const OBJECT_REC_LEVELS = [
  { icon: '⏰', prompt: 'What object is shown above?', correct: '⏰ Wall Clock', wrong: '📱 Smartphone', feedback: 'Correct! This is a wall clock.' },
  { icon: '🍵', prompt: 'What object is shown above?', correct: '🍵 Tea Cup', wrong: '🍳 Frying Pan', feedback: 'Correct! This is your favorite tea cup.' },
  { icon: '📙', prompt: 'What object is shown above?', correct: '📙 Reading Book', wrong: '🥾 Walking Shoes', feedback: 'Correct! This is a reading book.' }
];

const ObjectRecognitionContent: React.FC<ObjectRecognitionContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = OBJECT_REC_LEVELS[(level - 1) % OBJECT_REC_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: current.correct, isCorrect: true },
    { label: current.wrong, isCorrect: false }
  ];

  const handleAnswer = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? current.feedback : "Good try!");
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1000);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'floatShape 3s infinite ease-in-out' }}>
        {current.icon}
      </div>

      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
        {current.prompt} (Level {level})
      </h3>

      {/* NEUTRAL BUTTONS: No pre-answer green background! */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {options.map((opt, idx) => {
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
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null && opt.isCorrect}
              style={{
                padding: '1.15rem',
                borderRadius: '20px',
                border: `3px solid ${border}`,
                background: bg,
                fontSize: '1.2rem',
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

export const ObjectRecognitionGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="object_recognition"
      title="Everyday Object Naming"
      domainName="Recognition"
      instructions="Look at the image of the everyday object and select its name."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <ObjectRecognitionContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
