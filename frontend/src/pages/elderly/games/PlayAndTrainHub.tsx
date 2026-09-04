import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Target, Sparkles, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { MemoryRecallGame } from './MemoryRecallGame';
import { AttentionChallengeGame } from './AttentionChallengeGame';
import { PatternRecognitionGame } from './PatternRecognitionGame';
import { fetchApi } from '../../../utils/api';

interface PlayAndTrainHubProps {
  onBack: () => void;
}

export const PlayAndTrainHub: React.FC<PlayAndTrainHubProps> = ({ onBack }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number>(2);
  const [recentTrend, setRecentTrend] = useState<string>('Consistent High Engagement');
  const [resultModalData, setResultModalData] = useState<any | null>(null);

  useEffect(() => {
    // Fetch active cognitive difficulty level
    fetchApi<any>('/patient/cognitive-profile')
      .then(res => {
        if (res && res.current_difficulty) {
          setDifficulty(res.current_difficulty);
          if (res.recent_trend) setRecentTrend(res.recent_trend);
        }
      })
      .catch(() => {});
  }, []);

  const handleGameFinish = (resultData: any) => {
    setActiveGame(null);
    if (resultData && resultData.adaptiveResult) {
      setResultModalData(resultData);
      if (resultData.adaptiveResult.new_difficulty) {
        setDifficulty(resultData.adaptiveResult.new_difficulty);
      }
    }
  };

  const getDifficultyLabel = (lvl: number) => {
    switch (lvl) {
      case 1: return '1 (Very Easy)';
      case 2: return '2 (Easy)';
      case 3: return '3 (Medium)';
      case 4: return '4 (Hard)';
      case 5: return '5 (Advanced)';
      default: return `${lvl}`;
    }
  };

  if (activeGame === 'memory_recall') {
    return <MemoryRecallGame onBack={() => setActiveGame(null)} onFinish={handleGameFinish} currentDifficulty={difficulty} />;
  }
  if (activeGame === 'attention') {
    return <AttentionChallengeGame onBack={() => setActiveGame(null)} onFinish={handleGameFinish} currentDifficulty={difficulty} />;
  }
  if (activeGame === 'pattern') {
    return <PatternRecognitionGame onBack={() => setActiveGame(null)} onFinish={handleGameFinish} currentDifficulty={difficulty} />;
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={22} /> Home
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          PLAY & TRAIN
        </h1>
      </div>

      {/* Adaptive Profile Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        color: '#ffffff',
        borderRadius: '28px',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: '0 15px 25px rgba(13, 148, 136, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Award size={24} color="#f59e0b" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Adaptive Activity Engine</span>
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Current Difficulty: {getDifficultyLabel(difficulty)}
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Activity Trend: {recentTrend}
          </p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.75rem 1.25rem', borderRadius: '20px', textAlign: 'center' }}>
          <TrendingUp size={28} />
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>Auto Tuning</div>
        </div>
      </div>

      {/* 3 Cognitive Games Selection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Game 1: Memory Recall */}
        <button
          onClick={() => setActiveGame('memory_recall')}
          className="patient-card-btn"
          style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
        >
          <div style={{ background: '#ccfbf1', padding: '0.85rem', borderRadius: '18px', color: '#0d9488' }}>
            <Brain size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>1. Memory Recall</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>Memorize objects & identify missing item</div>
          </div>
        </button>

        {/* Game 2: Attention Challenge */}
        <button
          onClick={() => setActiveGame('attention')}
          className="patient-card-btn"
          style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
        >
          <div style={{ background: '#e0e7ff', padding: '0.85rem', borderRadius: '18px', color: '#4f46e5' }}>
            <Target size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>2. Attention Challenge</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>Spot changed & matching regional icons</div>
          </div>
        </button>

        {/* Game 3: Pattern Recognition */}
        <button
          onClick={() => setActiveGame('pattern')}
          className="patient-card-btn"
          style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
        >
          <div style={{ background: '#fef3c7', padding: '0.85rem', borderRadius: '18px', color: '#d97706' }}>
            <Sparkles size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>3. Pattern Recognition</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>Complete visual symbol sequences</div>
          </div>
        </button>
      </div>

      {/* Adaptive Result Modal */}
      {resultModalData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{ background: '#ccfbf1', color: '#0d9488', width: '72px', height: '72px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={40} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Activity Completed!
            </h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#475569', marginBottom: '1.5rem' }}>
              {resultModalData.isCorrect ? '✨ Excellent performance!' : '👍 Great effort completing the activity!'}
            </p>

            {/* Adaptive Engine Decision Box */}
            <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d9488', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} /> Neural Adaptive Feedback
              </div>
              <p style={{ fontSize: '1.05rem', color: '#334155', fontWeight: 600 }}>
                {resultModalData.adaptiveResult?.reason || 'Difficulty auto-adjusted to match your response speed.'}
              </p>
              <div style={{ marginTop: '0.75rem', fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
                Updated Level: {getDifficultyLabel(difficulty)}
              </div>
            </div>

            <button
              onClick={() => setResultModalData(null)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '18px',
                background: '#0d9488',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.25rem',
                border: 'none'
              }}
            >
              Continue Training
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
