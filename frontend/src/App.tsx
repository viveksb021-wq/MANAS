import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider, usePatient } from './context/PatientContext';
import { OfflineProvider } from './context/OfflineContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
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
import { CognitiveAssessmentHub } from './pages/elderly/CognitiveAssessmentHub';
import { GuardianDashboard } from './pages/guardian/GuardianDashboard';
import { AccessibilityModal } from './components/AccessibilityModal';
import { ManasFloatingAssistant } from './components/ManasFloatingAssistant';
import { PatientAppShell } from './components/PatientAppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SihDemoBar } from './components/SihDemoBar';

const MainAppContent: React.FC = () => {
  const { role, login, isAuthenticated, isHighContrast } = useAuth();
  const { switchPatient } = usePatient();
  const { currentLocation, navigate } = useNavigation();
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const { flow, screen } = currentLocation;

  // ROUTE PROTECTION GUARD (FAIL-CLOSED)
  useEffect(() => {
    if (flow === 'patient_app' && (!isAuthenticated || role !== 'patient')) {
      console.warn('Unauthorized access attempt to Patient App. Redirecting to Patient Login.');
      navigate('patient_login', {}, 'patient_login');
    } else if (flow === 'guardian_app' && (!isAuthenticated || role !== 'guardian')) {
      console.warn('Unauthorized access attempt to Guardian App. Redirecting to Guardian Login.');
      navigate('guardian_login', {}, 'guardian_login');
    }
  }, [flow, isAuthenticated, role]);

  const metaEnv = (import.meta as any).env || {};
  const showDemoBar = metaEnv.DEV || metaEnv.VITE_ENABLE_DEMO_BAR === 'true';

  return (
    <div className={isHighContrast ? 'high-contrast' : ''} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: isHighContrast ? '#000000' : '#fdfbf7' }}>
      {/* Main View Router based on NavigationContext history */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {flow === 'landing' && (
          <LandingPage
            onSelectRole={(choice) => {
              if (choice === 'patient_login') navigate('patient_login', {}, 'patient_login');
              else navigate('guardian_login', {}, 'guardian_login');
            }}
          />
        )}

        {flow === 'patient_login' && (
          <ElderlyLogin
            onSuccessLogin={(method) => {
              login('patient', 1, method || 'pin');
              switchPatient(1);
              navigate('home', {}, 'patient_app');
            }}
          />
        )}

        {flow === 'guardian_login' && (
          <GuardianLogin
            onBack={() => navigate('landing', {}, 'landing')}
            onSuccessLogin={(dest) => {
              login('guardian', 1, 'credentials');
              navigate('overview', dest === 'onboarding' ? { tab: 'onboarding' } : {}, 'guardian_app');
            }}
          />
        )}

        {flow === 'patient_app' && isAuthenticated && role === 'patient' && (
          <PatientAppShell>
            {screen === 'home' && (
              <PatientHome onNavigate={(s) => navigate(s, {}, 'patient_app')} />
            )}
            {screen === 'games' && (
              <PlayAndTrainHub onBack={() => navigate('home', {}, 'patient_app')} />
            )}
            {screen === 'people' && (
              <PeopleIKnow />
            )}
            {screen === 'memories' && (
              <MyMemories />
            )}
            {screen === 'places' && (
              <PlacesIKnow initialSelectedPlaceId={selectedPlaceId} />
            )}
            {screen === 'ask' && (
              <AskManasPage
                onNavigate={(s, placeId) => {
                  if (placeId) setSelectedPlaceId(placeId);
                  const targetScreen = s === '/places' ? 'places' : (s === '/today' ? 'today' : (s === '/memories' ? 'memories' : 'home'));
                  navigate(targetScreen, {}, 'patient_app');
                }}
              />
            )}
            {screen === 'today' && (
              <TodaySchedule />
            )}
            {screen === 'assessment' && (
              <CognitiveAssessmentHub />
            )}
          </PatientAppShell>
        )}

        {flow === 'guardian_app' && isAuthenticated && role === 'guardian' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {showDemoBar && <SihDemoBar />}
            <GuardianDashboard />
          </div>
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
    <ErrorBoundary>
      <AuthProvider>
        <PatientProvider>
          <OfflineProvider>
            <NavigationProvider>
              <MainAppContent />
            </NavigationProvider>
          </OfflineProvider>
        </PatientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
