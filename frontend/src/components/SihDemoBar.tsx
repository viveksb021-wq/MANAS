import React from 'react';
import { useAuth, LanguageCode } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff, RefreshCw, UserCheck, ShieldCheck, Sun, Moon, Globe } from 'lucide-react';

interface SihDemoBarProps {
  onOpenAccessibility?: () => void;
}

export const SihDemoBar: React.FC<SihDemoBarProps> = ({ onOpenAccessibility }) => {
  const { role, login, language, setLanguage, isHighContrast, toggleHighContrast } = useAuth();
  const { isOnline, syncStatus, pendingSyncCount, toggleSimulatedOffline, triggerManualSync } = useOffline();

  return (
    <div style={{
      background: '#0f172a',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      borderBottom: '2px solid #334155',
      zIndex: 1000,
      position: 'relative'
    }}>
      {/* SIH Hackathon Identifier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          background: '#0d9488',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '4px'
        }}>
          SIH 2026
        </span>
        <span style={{ fontWeight: 600 }}>MANAS Demo Toolbar</span>
      </div>

      {/* Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Role Switcher */}
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '2px' }}>
          <button
            onClick={() => login('patient')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: role === 'patient' ? '#0d9488' : 'transparent',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <UserCheck size={14} /> Elderly (Vivek)
          </button>
          <button
            onClick={() => login('guardian')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: role === 'guardian' ? '#6366f1' : 'transparent',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldCheck size={14} /> Guardian (Ravi)
          </button>
        </div>

        {/* Offline / Online Network Status Toggle */}
        <button
          onClick={toggleSimulatedOffline}
          title="Click to toggle network online/offline mode to test offline synchronization"
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: !isOnline ? '#ef4444' : (syncStatus === 'syncing' ? '#eab308' : '#10b981'),
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          {!isOnline ? <WifiOff size={14} /> : <Wifi size={14} />}
          {!isOnline ? '🔴 Simulated Offline' : (syncStatus === 'syncing' ? '🟡 Syncing...' : '🟢 Synced')}
          {pendingSyncCount > 0 && ` (${pendingSyncCount} queued)`}
        </button>

        {/* Manual Sync Trigger */}
        {isOnline && pendingSyncCount > 0 && (
          <button
            onClick={triggerManualSync}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '6px',
              background: '#334155',
              color: '#ffffff'
            }}
          >
            <RefreshCw size={14} /> Sync
          </button>
        )}

        {/* Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
          <Globe size={14} style={{ color: '#94a3b8' }} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="en" style={{ background: '#1e293b' }}>English</option>
            <option value="as" style={{ background: '#1e293b' }}>অসমীয়া (Assamese)</option>
            <option value="bn" style={{ background: '#1e293b' }}>বাংলা (Bengali)</option>
            <option value="mn" style={{ background: '#1e293b' }}>মৈতৈলোন্ (Manipuri)</option>
            <option value="hi" style={{ background: '#1e293b' }}>हिंदी (Hindi)</option>
          </select>
        </div>

        {/* High Contrast Accessibility Toggle */}
        <button
          onClick={toggleHighContrast}
          title="Toggle High Contrast Mode for Low Vision"
          style={{
            padding: '0.35rem 0.5rem',
            borderRadius: '6px',
            background: isHighContrast ? '#ffff00' : '#334155',
            color: isHighContrast ? '#000000' : '#ffffff',
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          {isHighContrast ? <Sun size={14} /> : <Moon size={14} />}
          {isHighContrast ? 'Contrast ON' : 'Contrast OFF'}
        </button>

        {onOpenAccessibility && (
          <button
            onClick={onOpenAccessibility}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '6px',
              background: '#0d9488',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            Accessibility
          </button>
        )}
      </div>
    </div>
  );
};
