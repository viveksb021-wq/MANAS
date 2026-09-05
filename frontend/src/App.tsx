import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { LandingPage } from './pages/LandingPage';
import { ElderlyLogin } from './pages/elderly/ElderlyLogin';
import { GuardianLogin } from './pages/guardian/GuardianLogin';
import { PatientHome } from './pages/elderly/PatientHome';
import { PlayAndTrainHub } from './pages/elderly/games/PlayAndTrainHub';
import { PeopleIKnow } from './pages/elderly/PeopleIKnow';
import { MyMemories } from './pages/elderly/MyMemories';
import { PlacesIKnow } from './pages/elderly/PlacesIKnow';
import { AskManasPage } from './pages/elderly/AskManasPage';
import { TodaySchedule } from './pages/elderly/TodaySchedule';
import { GuardianDashboard } from './pages/guardian/GuardianDashboard';
import { AccessibilityModal } from './components/AccessibilityModal';
import { ArrowRight } from 'lucide-react';

type AppFlow = 'landing' | 'patient_login' | 'guardian_login' | 'patient_app' | 'guardian_app';

const MainAppContent: React.FC = () => {
  const { role, login } = useAuth();
  const [showOpeningSplash, setShowOpeningSplash] = useState(true);
  const [appFlow, setAppFlow] = useState<AppFlow>('landing');
  const [currentPatientScreen, setCurrentPatientScreen] = useState<string>('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  if (showOpeningSplash) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem'
      }}>
        <div style={{
          maxWidth: '680px',
          width: '100%',
          background: '#1e293b',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '2px solid #334155',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Opening Video Animation Player */}
          <div style={{ width: '100%', maxHeight: '440px', background: '#000000', display: 'flex', justifyContent: 'center' }}>
            <video
              src="/opening_animation.mp4"
              autoPlay
              muted
              playsInline
              onEnded={() => setShowOpeningSplash(false)}
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Branding & Enter App Control */}
          <div style={{
            width: '100%',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1e293b'
          }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                MANAS
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
                Neural Memory Companion • Opening Log Animation
              </p>
            </div>

            <button
              onClick={() => setShowOpeningSplash(false)}
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(13, 148, 136, 0.4)'
              }}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdfbf7' }}>
      {/* Main View Router based on App Flow */}
      <div style={{ flex: 1 }}>
        {appFlow === 'landing' && (
          <LandingPage
            onSelectRole={(choice) => {
              if (choice === 'patient_login') setAppFlow('patient_login');
              else setAppFlow('guardian_login');
            }}
          />
        )}

        {appFlow === 'patient_login' && (
          <ElderlyLogin
            onBack={() => setAppFlow('landing')}
            onSuccessLogin={() => {
              login('patient');
              setAppFlow('patient_app');
              setCurrentPatientScreen('home');
            }}
          />
        )}

        {appFlow === 'guardian_login' && (
          <GuardianLogin
            onBack={() => setAppFlow('landing')}
            onSuccessLogin={() => {
              login('guardian');
              setAppFlow('guardian_app');
            }}
          />
        )}

        {appFlow === 'patient_app' && (
          <div>
            {currentPatientScreen === 'home' && (
              <PatientHome onNavigate={(screen) => setCurrentPatientScreen(screen)} />
            )}
            {currentPatientScreen === 'games' && (
              <PlayAndTrainHub onBack={() => setCurrentPatientScreen('home')} />
            )}
            {currentPatientScreen === 'people' && (
              <PeopleIKnow onBack={() => setCurrentPatientScreen('home')} />
            )}
            {currentPatientScreen === 'memories' && (
              <MyMemories onBack={() => setCurrentPatientScreen('home')} />
            )}
            {currentPatientScreen === 'places' && (
              <PlacesIKnow onBack={() => setCurrentPatientScreen('home')} initialSelectedPlaceId={selectedPlaceId} />
            )}
            {currentPatientScreen === 'ask' && (
              <AskManasPage
                onBack={() => setCurrentPatientScreen('home')}
                onNavigate={(screen, placeId) => {
                  if (placeId) setSelectedPlaceId(placeId);
                  setCurrentPatientScreen(screen === '/places' ? 'places' : (screen === '/today' ? 'today' : (screen === '/memories' ? 'memories' : 'home')));
                }}
              />
            )}
            {currentPatientScreen === 'today' && (
              <TodaySchedule onBack={() => setCurrentPatientScreen('home')} />
            )}
          </div>
        )}

        {appFlow === 'guardian_app' && (
          <GuardianDashboard />
        )}
      </div>

      {/* Accessibility Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <OfflineProvider>
        <MainAppContent />
      </OfflineProvider>
    </AuthProvider>
  );
};

export default App;
