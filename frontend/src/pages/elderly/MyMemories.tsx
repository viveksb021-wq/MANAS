import React, { useState } from 'react';
import { Volume2, MapPin, Calendar, Users, Heart, Award, Music, FileText, Activity, HelpCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { speakText, stopSpeech } from '../../utils/speech';
import { BackButton } from '../../components/BackButton';
import { usePatient } from '../../context/PatientContext';
import { FamilyImage } from '../../components/FamilyImage';
import { EmptyState } from '../../components/EmptyState';

interface MyMemoriesProps {
  onBack?: () => void;
}

export const MEMORY_CATEGORIES = [
  { id: 'all', label: 'All Memories', icon: Heart },
  { id: 'family', label: 'Family & Loved Ones', icon: Users },
  { id: 'milestone', label: 'Life Milestones', icon: Award },
  { id: 'places', label: 'Favorite Places', icon: MapPin },
  { id: 'routines', label: 'Daily Routines', icon: Activity },
  { id: 'hobbies', label: 'Music & Hobbies', icon: Music },
  { id: 'medical', label: 'Medical History', icon: Activity },
  { id: 'documents', label: 'Key Documents', icon: FileText }
];

export const MyMemories: React.FC<MyMemoriesProps> = ({ onBack }) => {
  const { memories: contextMemories } = usePatient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'recall'>('browse');

  // Recall activity state
  const [recallIndex, setRecallIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [recallResult, setRecallResult] = useState<{ correct: boolean; score: number } | null>(null);

  const memories = contextMemories;

  const handleSpeakMemory = (mem: any) => {
    speakText(`Memory: ${mem.title}. ${mem.description}. Location: ${mem.place || 'Home'}. Date: ${mem.memory_date || ''}.`);
  };

  const filteredMemories = selectedCategory === 'all'
    ? memories
    : memories.filter(m => m.category === selectedCategory || (m.tags && m.tags.toLowerCase().includes(selectedCategory)));

  const currentRecallMemory = memories[recallIndex % (memories.length || 1)];

  const handleCheckRecall = async () => {
    if (!currentRecallMemory) return;
    const isCorrect = Boolean(
      userAnswer.toLowerCase().trim().length > 0 &&
      (currentRecallMemory.title.toLowerCase().includes(userAnswer.toLowerCase()) ||
       (currentRecallMemory.people_involved && currentRecallMemory.people_involved.toLowerCase().includes(userAnswer.toLowerCase())))
    );

    const score = isCorrect ? (showHint ? 80 : 100) : 40;
    setRecallResult({ correct: isCorrect, score });

    if (isCorrect) {
      speakText("Wonderful! That is correct. Great memory recall!");
    } else {
      speakText(`This is ${currentRecallMemory.people_involved || currentRecallMemory.title}. Keep practicing!`);
    }

    try {
      await fetchApi('/memories/activity/submit', {
        method: 'POST',
        body: {
          patient_id: 1,
          activity_type: 'who_is_this',
          memory_id: currentRecallMemory.id,
          prompt_shown: `Who is in this photo? (${currentRecallMemory.title})`,
          user_response: userAnswer,
          is_correct: isCorrect,
          hints_used: showHint ? 1 : 0,
          recall_score: score
        }
      });
    } catch (e) {
      console.warn('Recall submit fallback', e);
    }
  };

  const handleNextRecall = () => {
    setRecallIndex(prev => prev + 1);
    setUserAnswer('');
    setShowHint(false);
    setRecallResult(null);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <BackButton label="Home" onClick={onBack} variant="patient" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          MEMORY GARDEN
        </h1>
      </div>

      {/* Primary Mode Tabs (Browse vs Recall Activity) */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '20px' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            flex: 1,
            padding: '0.85rem',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: 'none',
            background: activeTab === 'browse' ? '#0f766e' : 'transparent',
            color: activeTab === 'browse' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <Heart size={20} /> Browse Memories
        </button>

        <button
          onClick={() => setActiveTab('recall')}
          style={{
            flex: 1,
            padding: '0.85rem',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: 'none',
            background: activeTab === 'recall' ? '#0f766e' : 'transparent',
            color: activeTab === 'recall' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <HelpCircle size={20} /> "Who is this?" Practice
        </button>
      </div>

      {/* BROWSE MODE */}
      {activeTab === 'browse' && (
        <>
          {/* 7 Category Selector Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            {MEMORY_CATEGORIES.map(cat => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '18px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: `2px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                    background: isSelected ? '#ccfbf1' : '#ffffff',
                    color: isSelected ? '#0f766e' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <IconComp size={18} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* List of Memories */}
          {filteredMemories.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No Memories Found"
              description="No memories have been recorded for this category yet. Work with your family or caregiver to capture special moments!"
              accentColor="#0d9488"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: '3px solid #cbd5e1',
                  boxShadow: '0 15px 35px -5px rgba(0,0,0,0.06)'
                }}
              >
                {/* Memory Image */}
                <div style={{ position: 'relative', height: '250px' }}>
                  <FamilyImage
                    src={mem.photo_url}
                    alt={mem.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleSpeakMemory(mem)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      bottom: '1rem',
                      background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 20px rgba(15, 118, 110, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    <Volume2 size={32} />
                  </button>
                </div>

                {/* Content Details */}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {mem.title}
                  </h3>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500, color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    "{mem.description}"
                  </p>

                  {/* Metadata Badges */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {mem.place && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffe4e6', color: '#e11d48', padding: '0.4rem 0.85rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem' }}>
                        <MapPin size={18} /> {mem.place}
                      </div>
                    )}
                    {mem.memory_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', color: '#475569', padding: '0.4rem 0.85rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Calendar size={18} /> {mem.memory_date}
                      </div>
                    )}
                    {mem.people_involved && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem 0.85rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Users size={18} /> {mem.people_involved}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
      )}

      {/* RECALL PRACTICE MODE */}
      {activeTab === 'recall' && currentRecallMemory && (
        <div style={{ background: '#ffffff', borderRadius: '28px', border: '3px solid #0f766e', padding: '1.75rem', boxShadow: '0 20px 40px rgba(15, 118, 110, 0.12)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>
            Who or what is this? 🤔
          </h2>
          <p style={{ textAlign: 'center', color: '#0f766e', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            Tap the photo to hear audio clues or type your answer below!
          </p>

          <div style={{ position: 'relative', height: '260px', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <FamilyImage src={currentRecallMemory.photo_url} alt="Recall prompt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => speakText(`Clue: This memory was recorded at ${currentRecallMemory.place || 'home'} with ${currentRecallMemory.people_involved || 'family'}.`)}
              style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Volume2 size={28} />
            </button>
          </div>

          {showHint && (
            <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', padding: '1rem', borderRadius: '16px', color: '#92400e', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={22} color="#f59e0b" />
              Hint: People involved include "{currentRecallMemory.people_involved}" in {currentRecallMemory.place}.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="e.g. Ravi or Shillong Trip..."
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '18px',
                border: '3px solid #cbd5e1',
                fontSize: '1.25rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowHint(true)}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '16px',
                  background: '#fffbe8',
                  border: '2px solid #f59e0b',
                  color: '#b45309',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: 'pointer'
                }}
              >
                Need a Hint?
              </button>
              <button
                onClick={handleCheckRecall}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Submit Recall
              </button>
            </div>
          </div>

          {recallResult && (
            <div style={{
              background: recallResult.correct ? '#f0fdfa' : '#fff1f2',
              border: `2px solid ${recallResult.correct ? '#0f766e' : '#f43f5e'}`,
              borderRadius: '20px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: recallResult.correct ? '#0f766e' : '#be123c' }}>
                {recallResult.correct ? '🎉 Excellent Recall!' : '💡 Good effort!'}
              </h3>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginTop: '0.25rem' }}>
                Score: {recallResult.score}% • Answer: {currentRecallMemory.people_involved || currentRecallMemory.title}
              </p>
              <button
                onClick={handleNextRecall}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '16px',
                  background: '#0f766e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Next Photo →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
