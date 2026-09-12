import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { useOffline } from '../context/OfflineContext';
import { SihDemoBar } from './SihDemoBar';
import { ManasFloatingAssistant } from './ManasFloatingAssistant';
import { usePatientLiveLocation } from '../hooks/usePatientLiveLocation';
import { PatientLocationPermissionModal } from './PatientLocationPermissionModal';
import { evaluateMissedReminders, flushPendingOfflineReminders } from '../utils/reminderSafetyEngine';

interface PatientAppShellProps {
  children: React.ReactNode;
}

export const PatientAppShell: React.FC<PatientAppShellProps> = ({ children }) => {
  const { isHighContrast, isReduceMotion, role } = useAuth();
  const { currentPatientId, patientProfile, routines } = usePatient();
  const { isOnline } = useOffline();
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    permissionState,
    handleAllowPermission,
    handleDenyPermission
  } = usePatientLiveLocation();

  // Periodic safety check for 30-minute missed reminders
  useEffect(() => {
    if (role !== 'patient') return;

    evaluateMissedReminders(currentPatientId, patientProfile.full_name, routines, isOnline);

    const interval = setInterval(() => {
      evaluateMissedReminders(currentPatientId, patientProfile.full_name, routines, isOnline);
    }, 60000);

    return () => clearInterval(interval);
  }, [role, currentPatientId, patientProfile.full_name, routines, isOnline]);

  // Flush pending offline reminders when online
  useEffect(() => {
    if (role === 'patient' && isOnline) {
      flushPendingOfflineReminders(currentPatientId);
    }
  }, [role, isOnline, currentPatientId]);

  // Smooth entrance transition when entering patient environment
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`patient-app-environment ${isHighContrast ? 'high-contrast-env' : ''}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // High contrast overrides to solid pure black
        backgroundColor: isHighContrast ? '#000000' : '#eef2f6'
      }}
    >
      {/* LAYER 1: EXACT REFERENCE BACKGROUND IMAGE */}
      {!isHighContrast && (
        <div
          aria-hidden="true"
          className="patient-env-bg-layer"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: "url('/images/patient_app_bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: isLoaded ? 1 : 0,
            transition: isReduceMotion ? 'none' : 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      )}

      {/* LAYER 2: SUBTLE TRANSLUCENT DAYLIGHT COLOR WASH */}
      {!isHighContrast && (
        <div
          aria-hidden="true"
          className="patient-env-wash-layer"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(240, 249, 255, 0.18) 50%, rgba(248, 250, 252, 0.28) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: isLoaded ? 1 : 0,
            transition: isReduceMotion ? 'none' : 'opacity 0.7s ease'
          }}
        />
      )}

      {/* LAYER 3: SUBTLE AMBIENT DIFFUSION BEHIND MAIN CONTENT COLUMN */}
      {!isHighContrast && (
        <div
          aria-hidden="true"
          className="patient-env-ambient-light"
          style={{
            position: 'fixed',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            maxWidth: '96vw',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(240, 253, 250, 0.15) 50%, transparent 75%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* LAYER 4: MINIMAL TRANSLUCENT GLASS HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <SihDemoBar />
      </div>

      {/* LAYER 4 CONTINUED: SCROLLING APPLICATION UI CONTENT */}
      <main
        role="main"
        className="patient-main-content-scroll"
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded || isReduceMotion ? 'translateY(0px)' : 'translateY(12px)',
          transition: isReduceMotion ? 'none' : 'opacity 0.5s ease 0.15s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s'
        }}
      >
        {children}
      </main>

      {/* LAYER 5: FLOATING MANAS AI ASSISTANT WITH NEON RADIATION */}
      <ManasFloatingAssistant />

      {/* PATIENT LOCATION PERMISSION MODAL */}
      {role === 'patient' && (
        <PatientLocationPermissionModal
          isOpen={permissionState === 'undecided'}
          onAllow={handleAllowPermission}
          onDeny={handleDenyPermission}
        />
      )}
    </div>
  );
};
