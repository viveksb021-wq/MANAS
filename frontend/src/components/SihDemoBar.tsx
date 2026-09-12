import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { User, Wifi, WifiOff } from 'lucide-react';
import { HamburgerMenu } from './HamburgerMenu';

interface SihDemoBarProps {
  onOpenAccessibility?: () => void;
}

export const SihDemoBar: React.FC<SihDemoBarProps> = () => {
  const { user, role } = useAuth();
  const { isOnline, syncStatus, pendingSyncCount, toggleSimulatedOffline } = useOffline();

  const patientName = user?.name || (role === 'guardian' ? 'Ravi' : 'Prasad');

  const getStatusDotColor = () => {
    if (!isOnline) return '#ef4444';
    if (syncStatus === 'syncing') return '#f59e0b';
    return '#10b981';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing...';
    return 'Online';
  };

  return (
    <header
      role="banner"
      className="app-main-header"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: '#0f172a',
        padding: '0.65rem 1.5rem',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '64px',
        maxHeight: '70px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.65)',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        zIndex: 1000,
        position: 'sticky',
        top: 0
      }}
    >
      {/* Left: Minimal / Clean Area */}
      <div style={{ display: 'flex', alignItems: 'center' }} />

      {/* Right Cluster: STATUS -> PATIENT -> HAMBURGER SETTINGS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Compact Online/Offline Status Indicator */}
        <button
          onClick={toggleSimulatedOffline}
          className="touch-target"
          title="Click to toggle network online/offline simulation mode"
          aria-label={`Network status: ${getStatusText()}. Click to toggle.`}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: !isOnline ? '#fff1f2' : (syncStatus === 'syncing' ? '#fef3c7' : '#f0fdfa'),
            color: !isOnline ? '#be123c' : (syncStatus === 'syncing' ? '#b45309' : '#0f766e'),
            border: `1px solid ${!isOnline ? '#fecdd3' : (syncStatus === 'syncing' ? '#fde68a' : '#ccfbf1')}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getStatusDotColor(),
              display: 'inline-block',
              boxShadow: `0 0 6px ${getStatusDotColor()}80`
            }}
          />
          <span>{getStatusText()}</span>
          {pendingSyncCount > 0 && (
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>({pendingSyncCount})</span>
          )}
        </button>

        {/* Patient Account Indicator */}
        <div
          aria-label={`Logged in account: ${patientName}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f8fafc',
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: role === 'guardian' ? '#e0e7ff' : '#ccfbf1',
              color: role === 'guardian' ? '#4f46e5' : '#0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}
          >
            <User size={15} />
          </div>
          <span className="header-patient-name">{patientName}</span>
        </div>

        {/* 3-Line Hamburger Menu Entry Point */}
        <HamburgerMenu />
      </div>
    </header>
  );
};
