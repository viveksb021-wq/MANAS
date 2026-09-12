import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu, X, Sun, Moon, Globe, Eye, Volume2, ShieldCheck,
  Wifi, WifiOff, RefreshCw, LogOut, PhoneCall, AlertTriangle,
  User, CheckCircle, Sliders, Zap, Lock, Bell
} from 'lucide-react';
import { useAuth, LanguageCode, VoiceSpeed } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { useOffline } from '../context/OfflineContext';
import { usePatient } from '../context/PatientContext';
import { usePatientLiveLocation } from '../hooks/usePatientLiveLocation';
import { useNavigation } from '../context/NavigationContext';

export const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const {
    user, role, logout, language, setLanguage,
    isHighContrast, toggleHighContrast,
    textSizeScale, setTextSizeScale,
    isReduceMotion, toggleReduceMotion,
    isVoiceEnabled, toggleVoiceEnabled,
    voiceSpeed, setVoiceSpeed,
    isSoundEnabled, toggleSoundEnabled,
    isTouchFeedbackEnabled, toggleTouchFeedbackEnabled
  } = useAuth();

  const { isOnline, syncStatus, pendingSyncCount, triggerManualSync } = useOffline();
  const { patientProfile, currentPatientId } = usePatient();
  const { navigate } = useNavigation();
  const { locationSharingEnabled, setSharing, permissionState } = usePatientLiveLocation();

  const [isEmergencySoundEnabled, setIsEmergencySoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(`manas:patient:${currentPatientId}:emergency_sound`);
    return val !== 'off';
  });

  const toggleEmergencySound = () => {
    const nextVal = !isEmergencySoundEnabled;
    setIsEmergencySoundEnabled(nextVal);
    localStorage.setItem(`manas:patient:${currentPatientId}:emergency_sound`, nextVal ? 'on' : 'off');
  };

  const playEmergencyTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.4);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn('Emergency sound playback restricted:', e);
    }
  };

  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Close drawer on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirm) setShowLogoutConfirm(false);
        else if (showEmergencyModal) setShowEmergencyModal(false);
        else if (isOpen) setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showLogoutConfirm, showEmergencyModal]);

  // Lock body scroll when drawer or modal is open
  useEffect(() => {
    if (isOpen || showLogoutConfirm || showEmergencyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, showLogoutConfirm, showEmergencyModal]);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsOpen(false);
    logout();
    navigate('patient_login', {}, 'patient_login');
  };

  const displayName = patientProfile?.full_name || user?.name || (role === 'guardian' ? 'Ravi' : 'Prasad');
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* 3-Line Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target"
        aria-label={isOpen ? 'Close settings and options' : 'Open settings and options'}
        aria-expanded={isOpen}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: isOpen ? '#0d9488' : '#f1f5f9',
          color: isOpen ? '#ffffff' : '#0f172a',
          border: `1.5px solid ${isOpen ? '#0f766e' : '#cbd5e1'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 16px rgba(13, 148, 136, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isOpen ? 2200 : 1100,
          position: 'relative'
        }}
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Portal backdrop, drawer, and modals to document.body */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          {isOpen && (
            <div
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 2000,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
          )}

          {/* Right-Side Drawer Panel - Warm Healthcare Glass Design */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
        aria-label="MANAS Quick Settings & Controls"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: isHighContrast ? '#000000' : '#ffffff',
          color: isHighContrast ? '#ffff00' : '#0f172a',
          zIndex: 2100,
          boxShadow: '-10px 0 50px rgba(15, 118, 110, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
          borderLeft: isHighContrast ? '2px solid #ffff00' : '1.5px solid rgba(226, 232, 240, 0.9)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: isHighContrast ? '#111111' : 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
          borderBottom: isHighContrast ? '2px solid #ffff00' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isHighContrast ? '#ffff00' : '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#0d9488' }}>MANAS</span> Settings
            </div>
            <p style={{ fontSize: '0.85rem', color: isHighContrast ? '#ffffff' : '#64748b', fontWeight: 600 }}>
              Neural Care & Accessibility Controls
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="touch-target"
            aria-label="Close Settings Drawer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isHighContrast ? '#ffff00' : '#f1f5f9',
              color: isHighContrast ? '#000000' : '#64748b',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Scrollable Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>

          {/* SECTION 1: ACCOUNT / PROFILE BADGE */}
          <div style={{
            background: isHighContrast ? '#111111' : '#f8fafc',
            borderRadius: '22px',
            padding: '1.15rem 1.25rem',
            border: isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.35rem',
              boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
            }}>
              {avatarInitial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isHighContrast ? '#ffff00' : '#0f172a' }}>
                {displayName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{
                  background: role === 'guardian' ? '#e0e7ff' : '#ccfbf1',
                  color: role === 'guardian' ? '#4f46e5' : '#0f766e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  {role === 'guardian' ? 'Caregiver' : 'Patient'}
                </span>
                <span style={{ fontSize: '0.85rem', color: isHighContrast ? '#ffffff' : '#64748b', fontWeight: 600 }}>
                  ID #{user?.id || 1}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: QUICK NETWORK & SYNC STATUS */}
          <div style={{
            background: isHighContrast ? '#111111' : '#ffffff',
            borderRadius: '22px',
            padding: '1.2rem',
            border: isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wifi size={16} /> Connection & Sync Status
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isHighContrast ? '#ffffff' : '#334155' }}>Network Status</span>
              <span style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                background: !isOnline ? '#fff1f2' : (syncStatus === 'syncing' ? '#fef3c7' : '#f0fdfa'),
                color: !isOnline ? '#be123c' : (syncStatus === 'syncing' ? '#b45309' : '#0f766e'),
                border: `1px solid ${!isOnline ? '#fecdd3' : (syncStatus === 'syncing' ? '#fde68a' : '#ccfbf1')}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                {!isOnline ? <WifiOff size={15} /> : <Wifi size={15} />}
                {!isOnline ? 'Offline' : (syncStatus === 'syncing' ? 'Syncing...' : 'Online & Synced')}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: isHighContrast ? '#ffffff' : '#64748b', fontWeight: 500 }}>
              Last checked: {formattedTime} • {pendingSyncCount > 0 ? `${pendingSyncCount} pending updates` : 'All local changes synchronized'}
            </div>

            {isOnline && pendingSyncCount > 0 && (
              <button
                onClick={triggerManualSync}
                className="touch-target"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.65rem',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
                }}
              >
                <RefreshCw size={16} /> Sync Pending Updates Now
              </button>
            )}
          </div>

          {/* SECTION 3: LANGUAGE SELECTION */}
          <div style={{
            background: isHighContrast ? '#111111' : '#ffffff',
            borderRadius: '22px',
            padding: '1.2rem',
            border: isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={16} /> Interface Language
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="touch-target"
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '14px',
                    border: language === lang.code ? '2px solid #0d9488' : (isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0'),
                    background: language === lang.code ? (isHighContrast ? '#ffff00' : '#f0fdfa') : (isHighContrast ? '#000000' : '#ffffff'),
                    color: language === lang.code ? (isHighContrast ? '#000000' : '#0f766e') : (isHighContrast ? '#ffffff' : '#1e293b'),
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{lang.native}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{lang.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: ACCESSIBILITY & DISPLAY CONTROLS */}
          <div style={{
            background: isHighContrast ? '#111111' : '#ffffff',
            borderRadius: '22px',
            padding: '1.2rem',
            border: isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={16} /> Accessibility & Display
            </div>

            {/* Text Size Scale */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#334155', marginBottom: '0.5rem' }}>Text Size</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[
                  { label: 'Small', val: 1.0 },
                  { label: 'Medium', val: 1.15 },
                  { label: 'Large', val: 1.25 },
                  { label: 'XL', val: 1.5 }
                ].map(item => (
                  <button
                    key={item.val}
                    onClick={() => setTextSizeScale(item.val)}
                    className="touch-target"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: textSizeScale === item.val ? '2px solid #0d9488' : (isHighContrast ? '1px solid #ffff00' : '1px solid #cbd5e1'),
                      background: textSizeScale === item.val ? (isHighContrast ? '#ffff00' : '#0d9488') : (isHighContrast ? '#000000' : '#f8fafc'),
                      color: textSizeScale === item.val ? (isHighContrast ? '#000000' : '#ffffff') : (isHighContrast ? '#ffffff' : '#0f172a'),
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* High Contrast */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#334155' }}>High Contrast</span>
                <button
                  onClick={toggleHighContrast}
                  className="touch-target"
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: isHighContrast ? '#ffff00' : '#e2e8f0',
                    color: isHighContrast ? '#000000' : '#0f172a',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isHighContrast ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reduce Motion */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#334155' }}>Reduce Motion</span>
                <button
                  onClick={toggleReduceMotion}
                  className="touch-target"
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: isReduceMotion ? '#0d9488' : '#e2e8f0',
                    color: isReduceMotion ? '#ffffff' : '#0f172a',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isReduceMotion ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Voice Assistance */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#334155' }}>Voice Assistance</span>
                <button
                  onClick={toggleVoiceEnabled}
                  className="touch-target"
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: isVoiceEnabled ? '#0d9488' : '#e2e8f0',
                    color: isVoiceEnabled ? '#ffffff' : '#0f172a',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isVoiceEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Voice Speed */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#334155' }}>Voice Speed</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {(['slow', 'normal', 'fast'] as VoiceSpeed[]).map(sp => (
                    <button
                      key={sp}
                      onClick={() => setVoiceSpeed(sp)}
                      className="touch-target"
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        background: voiceSpeed === sp ? '#0d9488' : '#f1f5f9',
                        color: voiceSpeed === sp ? '#ffffff' : '#334155',
                        border: voiceSpeed === sp ? 'none' : '1px solid #cbd5e1',
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: PATIENT SAFETY & LOCATION SETTINGS */}
          <div style={{
            background: isHighContrast ? '#111111' : '#ffffff',
            borderRadius: '22px',
            padding: '1.2rem',
            border: isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Safety & Location Settings
            </div>

            {/* LOCATION SHARING TOGGLE */}
            <div style={{ padding: '0.75rem', borderRadius: '16px', background: isHighContrast ? '#222222' : '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#1e293b' }}>
                  Share my location with my caregiver
                </span>
                <button
                  onClick={() => setSharing(!locationSharingEnabled)}
                  className="touch-target"
                  aria-label="Toggle location sharing with caregiver"
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: locationSharingEnabled ? (isHighContrast ? '#ffff00' : '#0d9488') : (isHighContrast ? '#333333' : '#e2e8f0'),
                    color: locationSharingEnabled ? (isHighContrast ? '#000000' : '#ffffff') : (isHighContrast ? '#ffffff' : '#64748b'),
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {locationSharingEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: isHighContrast ? '#ffffff' : '#64748b', lineHeight: 1.4, margin: 0 }}>
                {locationSharingEnabled
                  ? 'Your caregiver can see your current location.'
                  : 'Location sharing is currently OFF.'}
              </p>
            </div>

            {/* EMERGENCY SOUND TOGGLE & CONTROL */}
            <div style={{ padding: '0.75rem', borderRadius: '16px', background: isHighContrast ? '#222222' : '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isHighContrast ? '#ffff00' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Volume2 size={16} /> Emergency Sound
                </span>
                <button
                  onClick={toggleEmergencySound}
                  className="touch-target"
                  aria-label="Toggle Emergency Sound control"
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: isEmergencySoundEnabled ? (isHighContrast ? '#ffff00' : '#0d9488') : (isHighContrast ? '#333333' : '#e2e8f0'),
                    color: isEmergencySoundEnabled ? (isHighContrast ? '#000000' : '#ffffff') : (isHighContrast ? '#ffffff' : '#64748b'),
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isEmergencySoundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: isHighContrast ? '#ffffff' : '#64748b', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                Patient safety siren for manual emergency assistance. Never auto-plays for routine overdue reminders.
              </p>
              {isEmergencySoundEnabled && (
                <button
                  onClick={playEmergencyTestSound}
                  className="touch-target"
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '10px',
                    background: isHighContrast ? '#ffff00' : '#fee2e2',
                    color: isHighContrast ? '#000000' : '#b91c1c',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    border: '1px solid #fecdd3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Volume2 size={14} /> Test Siren Sound
                </button>
              )}
            </div>

            {/* EMERGENCY CONTACTS BUTTON */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="touch-target"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(225, 29, 72, 0.25)'
              }}
            >
              <PhoneCall size={18} /> Emergency Help & Contacts
            </button>
          </div>

          {/* SECTION 6: PRIVACY & SECURITY */}
          <div style={{
            background: isHighContrast ? '#111111' : '#f8fafc',
            borderRadius: '22px',
            padding: '1.15rem',
            border: isHighContrast ? '1px solid #ffff00' : '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={16} /> Privacy & Security
            </div>
            <div style={{ fontSize: '0.85rem', color: isHighContrast ? '#ffffff' : '#475569', lineHeight: 1.5 }}>
              • Biometric Encryption: <strong style={{ color: '#059669' }}>64-dim Encrypted</strong><br />
              • Offline Local Storage: <strong style={{ color: '#059669' }}>Protected</strong><br />
              • Caregiver Auditing: <strong style={{ color: '#0284c7' }}>Active Protection</strong>
            </div>
          </div>

          {/* SECTION 7: LOGOUT BUTTON */}
          <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="touch-target"
              aria-label="Log Out of MANAS"
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '16px',
                background: '#fee2e2',
                color: '#be123c',
                fontWeight: 800,
                fontSize: '1.05rem',
                border: '1.5px solid #fecdd3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer'
              }}
            >
              <LogOut size={20} /> Log Out
            </button>
          </div>

        </div>
      </div>

      {/* CONFIRMATION LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            color: '#0f172a'
          }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '50%', width: '64px', height: '64px', margin: '0 auto 1.25rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={32} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
              Log Out of MANAS?
            </h2>

            <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to log out? Your daily memories, routines, and game progress will remain safely saved.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="touch-target"
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '16px',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Stay Logged In
              </button>

              <button
                onClick={handleConfirmLogout}
                className="touch-target"
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '16px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(239, 68, 68, 0.3)'
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY CONTACT MODAL */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            color: '#0f172a'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#ffe4e6', color: '#e11d48', padding: '0.75rem', borderRadius: '16px' }}>
                  <PhoneCall size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>Emergency Care Contacts</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Direct family & medical contacts</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="touch-target"
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {patientProfile?.emergency_contact ? (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Primary Caregiver</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{patientProfile.emergency_contact}</div>
                  </div>
                  <a
                    href={`tel:${patientProfile.emergency_contact.replace(/[^\d+]/g, '')}`}
                    style={{ background: '#10b981', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <PhoneCall size={16} /> Call Caregiver
                  </a>
                </div>
              ) : (
                <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '18px', border: '1.5px solid #fecdd3', color: '#9f1239', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
                  Caregiver phone number is not available.
                </div>
              )}

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Dr. Haren Barua</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Memory Specialist (Shillong Medical)</div>
                </div>
                <a
                  href="tel:+919864012345"
                  style={{ background: '#0284c7', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <PhoneCall size={16} /> Call Doctor
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="touch-target"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
              }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}
        </>,
        document.body
      )}
    </>
  );
};
