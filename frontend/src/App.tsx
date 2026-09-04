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

type AppFlow = 'landing' | 'patient_login' | 'guardian_login' | 'patient_app' | 'guardian_app';

const MainAppContent: React.FC = () => {
  const { role, login } = useAuth();
  const [appFlow, setAppFlow] = useState<AppFlow>('landing');
  const [currentPatientScreen, setCurrentPatientScreen] = useState<string>('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

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
