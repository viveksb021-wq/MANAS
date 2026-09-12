import React, { useState, useEffect } from 'react';
import {
  Brain, Target, Sparkles, Calculator, ShieldAlert, Eye, Calendar, Heart, Award, TrendingUp, Search
} from 'lucide-react';
import { BackButton } from '../../../components/BackButton';
import { fetchApi } from '../../../utils/api';
import { useNavigation } from '../../../context/NavigationContext';

// Game Imports
import { FamilyMemoryMatchGame, WhoIsThisGame, PhotoRecallGame, SequenceMemoryGame, ObjectRecallGame } from './list/MemoryGames';
import { FindTheObjectGame, TargetTapGame, DifferentOneGame, ReactionActivityGame } from './list/AttentionGames';
import { CompletePatternGame, ColorSequenceGame, ShapeSequenceGame } from './list/PatternGames';
import { SimpleSudokuGame, NumberPatternGame, SimplePuzzlesGame } from './list/ReasoningGames';
import { SimplifiedChessGame, BoardPuzzleGame } from './list/StrategyGames';
import { PersonRecognitionGame, PlaceRecognitionGame, ObjectRecognitionGame } from './list/RecognitionGames';
import { WhatComesNextGame, DailyPlanRecallGame } from './list/RoutineGames';
import { MyFamilyActivity, MySpecialMomentActivity, WhereDidWeGoActivity } from './list/PersonalizedGames';
import { OrientationRecallGame } from './list/OrientationGames';
import { CognitiveAssessmentHub } from '../CognitiveAssessmentHub';

interface PlayAndTrainHubProps {
  onBack?: () => void;
}

export const GAME_CATALOG = [
  // 🧠 MEMORY
  { id: 'family_memory_match', name: '1. Family Memory Match', desc: 'Flip and match familiar photos from your Memory Garden.', domain: 'Memory', icon: Heart, difficulty: 'Easy', duration: '3-5 min', component: FamilyMemoryMatchGame },
  { id: 'who_is_this', name: '2. Who Is This?', desc: 'Recognize family members from People I Know.', domain: 'Memory', icon: Heart, difficulty: 'Easy', duration: '2-4 min', component: WhoIsThisGame },
  { id: 'photo_recall', name: '3. Photo Recall', desc: 'Memorize photo details and answer recall questions.', domain: 'Memory', icon: Heart, difficulty: 'Medium', duration: '3-5 min', component: PhotoRecallGame },
  { id: 'sequence_memory', name: '4. Sequence Memory', desc: 'Remember and reproduce item sequences in order.', domain: 'Memory', icon: Heart, difficulty: 'Medium', duration: '3-5 min', component: SequenceMemoryGame },
  { id: 'object_recall', name: '5. Object Recall', desc: 'Identify missing items from morning table settings.', domain: 'Memory', icon: Heart, difficulty: 'Easy', duration: '2-3 min', component: ObjectRecallGame },

  // 🎯 ATTENTION
  { id: 'find_the_object', name: '6. Find The Object', desc: 'Search and tap target items in scene layouts.', domain: 'Attention', icon: Target, difficulty: 'Easy', duration: '2-4 min', component: FindTheObjectGame },
  { id: 'target_tap', name: '7. Target Tap', desc: 'Focus task: tap circles while avoiding distractors.', domain: 'Attention', icon: Target, difficulty: 'Medium', duration: '3-5 min', component: TargetTapGame },
  { id: 'different_one', name: '8. Spot the Different One', desc: 'Identify the unique item among visual symbols.', domain: 'Attention', icon: Target, difficulty: 'Easy', duration: '2-3 min', component: DifferentOneGame },
  { id: 'reaction_activity', name: '9. Calm Reaction Tap', desc: 'Relaxed target tapping to measure reaction speed.', domain: 'Attention', icon: Target, difficulty: 'Easy', duration: '2-3 min', component: ReactionActivityGame },

  // 🔷 PATTERN RECOGNITION
  { id: 'complete_pattern', name: '10. Complete The Pattern', desc: 'Identify logical visual symbol sequences.', domain: 'Pattern', icon: Sparkles, difficulty: 'Easy', duration: '3-4 min', component: CompletePatternGame },
  { id: 'color_sequence', name: '11. Color Sequence', desc: 'Predict the next color in rhythmic patterns.', domain: 'Pattern', icon: Sparkles, difficulty: 'Easy', duration: '2-3 min', component: ColorSequenceGame },
  { id: 'shape_sequence', name: '12. Shape Sequence', desc: 'Complete geometric shape progression series.', domain: 'Pattern', icon: Sparkles, difficulty: 'Medium', duration: '3-4 min', component: ShapeSequenceGame },

  // 🔢 REASONING
  { id: 'simple_sudoku', name: '13. Beginner 4x4 Sudoku', desc: 'Elderly-friendly 4x4 Sudoku with missing number hints.', domain: 'Reasoning', icon: Calculator, difficulty: 'Medium', duration: '4-6 min', component: SimpleSudokuGame },
  { id: 'number_pattern', name: '14. Number Pattern', desc: 'Arithmetic number series logic puzzles.', domain: 'Reasoning', icon: Calculator, difficulty: 'Easy', duration: '2-3 min', component: NumberPatternGame },
  { id: 'simple_puzzles', name: '15. Logical Fit Puzzle', desc: 'Match logical items based on daily scenario association.', domain: 'Reasoning', icon: Calculator, difficulty: 'Easy', duration: '2-4 min', component: SimplePuzzlesGame },

  // ♟ STRATEGIC THINKING
  { id: 'simplified_chess', name: '16. Simplified Chess Puzzle', desc: 'Tactical Rook movement puzzle to capture unprotected piece.', domain: 'Strategy', icon: ShieldAlert, difficulty: 'Medium', duration: '3-5 min', component: SimplifiedChessGame },
  { id: 'board_puzzle', name: '17. Path Finding Board Puzzle', desc: 'Guide companion avatar along safe path to home.', domain: 'Strategy', icon: ShieldAlert, difficulty: 'Easy', duration: '3-4 min', component: BoardPuzzleGame },

  // 👁 RECOGNITION
  { id: 'person_recognition', name: '18. Familiar Person Recognition', desc: 'Identify enrolled relatives with supportive non-shaming feedback.', domain: 'Recognition', icon: Eye, difficulty: 'Easy', duration: '2-3 min', component: PersonRecognitionGame },
  { id: 'place_recognition', name: '19. Familiar Place Recognition', desc: 'Identify saved places from Places I Know.', domain: 'Recognition', icon: Eye, difficulty: 'Easy', duration: '2-4 min', component: PlaceRecognitionGame },
  { id: 'object_recognition', name: '20. Everyday Object Naming', desc: 'Name household and personal wellness items.', domain: 'Recognition', icon: Eye, difficulty: 'Easy', duration: '2-3 min', component: ObjectRecognitionGame },

  // 📅 DAILY ROUTINE RECALL
  { id: 'what_comes_next', name: '21. Daily Routine Sequence', desc: 'Recall sequential routine steps based on caregiver setup.', domain: 'Routine', icon: Calendar, difficulty: 'Easy', duration: '2-4 min', component: WhatComesNextGame },
  { id: 'daily_plan_recall', name: '22. Today\'s Plan Recall', desc: 'Recall today\'s scheduled afternoon activity.', domain: 'Routine', icon: Calendar, difficulty: 'Easy', duration: '2-3 min', component: DailyPlanRecallGame },

  // ❤️ PERSONALIZED MEMORY ACTIVITIES
  { id: 'my_family_activity', name: '23. My Family Reinforcement', desc: 'Review loving family profile cards.', domain: 'Personalized', icon: Heart, difficulty: 'Easy', duration: '2-3 min', component: MyFamilyActivity },
  { id: 'my_special_moment', name: '24. My Special Moment', desc: 'Reflect on special memories saved by your caregiver.', domain: 'Personalized', icon: Heart, difficulty: 'Easy', duration: '2-3 min', component: MySpecialMomentActivity },
  { id: 'where_did_we_go', name: '25. Where Did We Go?', desc: 'Contextual recall linking Person, Memory, and Place.', domain: 'Personalized', icon: Heart, difficulty: 'Easy', duration: '2-4 min', component: WhereDidWeGoActivity },

  // 🧭 ORIENTATION & RECALL
  { id: 'orientation_recall', name: '26. Orientation & Daily Recall', desc: 'Identify today\'s day of the week, month, or season.', domain: 'Orientation', icon: Calendar, difficulty: 'Easy', duration: '2-3 min', component: OrientationRecallGame }
];

export const DOMAIN_CATEGORIES = [
  { id: 'all', label: 'All Activities', icon: Brain },
  { id: 'Memory', label: '🧠 Memory', icon: Heart },
  { id: 'Attention', label: '🎯 Attention', icon: Target },
  { id: 'Pattern', label: '🔷 Patterns', icon: Sparkles },
  { id: 'Reasoning', label: '🔢 Reasoning', icon: Calculator },
  { id: 'Strategy', label: '♟ Strategy', icon: ShieldAlert },
  { id: 'Recognition', label: '👁 Recognition', icon: Eye },
  { id: 'Routine', label: '📅 Routine', icon: Calendar },
  { id: 'Orientation', label: '🧭 Orientation', icon: Calendar },
  { id: 'Personalized', label: '❤️ Personalized', icon: Heart }
];

export const PlayAndTrainHub: React.FC<PlayAndTrainHubProps> = ({ onBack }) => {
  const { navigate } = useNavigation();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [recentTrend, setRecentTrend] = useState<string>('Consistent High Engagement');

  const handleBack = onBack || (() => navigate('home', {}, 'patient_app'));

  useEffect(() => {
    fetchApi<any>('/patient/cognitive-profile')
      .then(res => {
        if (res && res.current_difficulty) {
          setDifficulty(res.current_difficulty);
          if (res.recent_trend) setRecentTrend(res.recent_trend);
        }
      })
      .catch(() => {});
  }, []);

  if (activeGameId === 'assessment') {
    return <CognitiveAssessmentHub onBack={() => setActiveGameId(null)} />;
  }

  const currentGame = GAME_CATALOG.find(g => g.id === activeGameId);
  if (currentGame) {
    const GameComp = currentGame.component;
    return <GameComp onBack={() => setActiveGameId(null)} />;
  }

  const filteredGames = selectedDomain === 'all'
    ? GAME_CATALOG
    : GAME_CATALOG.filter(g => g.domain === selectedDomain);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <BackButton label="Home" onClick={handleBack} variant="patient" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          COGNITIVE ENGINE
        </h1>
      </div>

      <style>{`
        @keyframes brainFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
      `}</style>

      {/* 3D MANAS Brain Mascot Welcome Portal Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)',
        border: '3px solid #0f766e',
        borderRadius: '28px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 10px 25px rgba(15, 118, 110, 0.12)'
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src="/images/manas_brain_mascot.png"
            alt="MANAS AI Brain Coach"
            style={{
              width: '88px',
              height: '88px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(15, 118, 110, 0.3))',
              animation: 'brainFloat 3s infinite ease-in-out'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#0f766e', color: '#ffffff', padding: '0.2rem 0.65rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            <Sparkles size={12} /> COGNITIVE GYM
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Welcome to Brain Training!
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600, margin: 0 }}>
            Choose any activity to stimulate memory, attention, logic, and orientation. Advance through fun levels!
          </p>
        </div>
      </div>

      {/* Adaptive Profile Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        color: '#ffffff',
        borderRadius: '28px',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 15px 25px rgba(13, 148, 136, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Award size={22} color="#5eead4" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ccfbf1' }}>Performance-Based Adaptive Engine</span>
          </div>
          <p style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            Difficulty: Level {difficulty} • {recentTrend}
          </p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.65rem 1.1rem', borderRadius: '18px', textAlign: 'center' }}>
          <TrendingUp size={24} />
          <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '2px' }}>Auto Tuning</div>
        </div>
      </div>

      {/* 7-Domain Checkup Launcher Banner */}
      <button
        onClick={() => setActiveGameId('assessment')}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '1.25rem 1.5rem',
          border: 'none',
          boxShadow: '0 12px 25px rgba(15, 118, 110, 0.3)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.85rem', borderRadius: '18px', color: '#ffffff' }}>
          <Award size={36} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>7-Domain Cognitive Checkup</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 500, color: '#ccfbf1' }}>Comprehensive wellness & memory evaluation</div>
        </div>
      </button>

      {/* 8 Domain Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {DOMAIN_CATEGORIES.map(cat => {
          const isSelected = selectedDomain === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedDomain(cat.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.65rem 1.1rem',
                borderRadius: '18px',
                fontWeight: 800,
                fontSize: '1rem',
                border: `2px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                background: isSelected ? '#ccfbf1' : '#ffffff',
                color: isSelected ? '#0f766e' : '#475569',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 25 Cognitive Games Catalog Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredGames.map(game => {
          const IconComponent = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => setActiveGameId(game.id)}
              className="patient-card-btn"
              style={{
                background: '#ffffff',
                borderColor: '#cbd5e1',
                borderRadius: '24px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                minHeight: '84px'
              }}
            >
              <div style={{ background: '#f0fdfa', padding: '0.85rem', borderRadius: '18px', color: '#0f766e' }}>
                <IconComponent size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{game.name}</span>
                  <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                    {game.difficulty} • {game.duration}
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#64748b' }}>{game.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
