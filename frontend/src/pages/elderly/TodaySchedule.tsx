import React, { useEffect } from 'react';
import { CheckCircle, Circle, Calendar } from 'lucide-react';
import { speakText } from '../../utils/speech';
import { BackButton } from '../../components/BackButton';
import { usePatient } from '../../context/PatientContext';
import { EmptyState } from '../../components/EmptyState';

interface TodayScheduleProps {
  onBack?: () => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ onBack }) => {
  const { routines: contextRoutines, toggleRoutine } = usePatient();

  const routines = contextRoutines.map(r => ({
    id: r.id,
    time_of_day: r.time,
    title: r.title,
    icon_symbol: r.category === 'Medicine' ? '💊' : (r.category === 'Exercise' ? '🚶' : '🧠'),
    status: r.completed ? 'Completed' : 'Pending'
  }));

  const handleToggleRoutine = (item: any) => {
    toggleRoutine(item.id);
    const nextStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    if (nextStatus === 'Completed') {
      speakText(`Marked ${item.title} as completed! Well done.`);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <BackButton label="Home" onClick={onBack} variant="patient" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          TODAY'S SCHEDULE
        </h1>
      </div>

      {/* Routine Timeline Cards */}
      {routines.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Schedule Tasks Today"
          description="Your daily schedule is empty right now. Your caregiver can set up morning tea, medication, and exercise reminders!"
          accentColor="#0d9488"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {routines.map((item) => {
            const isDone = item.status === 'Completed';
            return (
              <div
                key={item.id}
                onClick={() => handleToggleRoutine(item)}
                className="touch-target"
                tabIndex={0}
                role="button"
                aria-label={`Task: ${item.title} at ${item.time_of_day}, ${item.status}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleRoutine(item);
                  }
                }}
                style={{
                  background: isDone ? '#f0fdfa' : '#ffffff',
                  border: `3px solid ${isDone ? '#0d9488' : '#cbd5e1'}`,
                  borderRadius: '24px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Checkbox Icon */}
                <div style={{ color: isDone ? '#0d9488' : '#94a3b8' }}>
                  {isDone ? <CheckCircle size={44} /> : <Circle size={44} />}
                </div>

                {/* Time & Title */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.icon_symbol}</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: isDone ? '#0d9488' : '#64748b' }}>
                      {item.time_of_day}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    color: isDone ? '#0f172a' : '#1e293b',
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.8 : 1
                  }}>
                    {item.title}
                  </h3>
                </div>

                {/* Status Pill */}
                <div style={{
                  background: isDone ? '#ccfbf1' : '#f1f5f9',
                  color: isDone ? '#0d9488' : '#64748b',
                  padding: '0.5rem 1rem',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  {isDone ? '✓ Done' : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
