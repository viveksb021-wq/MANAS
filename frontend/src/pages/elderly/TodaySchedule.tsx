import React from 'react';
import { CheckCircle, Circle, Calendar, Bell, Clock } from 'lucide-react';
import { speakText } from '../../utils/speech';
import { BackButton } from '../../components/BackButton';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { getTranslations } from '../../config/translations';
import { EmptyState } from '../../components/EmptyState';

interface TodayScheduleProps {
  onBack?: () => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ onBack }) => {
  const { routines: contextRoutines, reminders: contextReminders, toggleRoutine, completeReminder } = usePatient();
  const { language } = useAuth();
  const t = getTranslations(language);

  const routines = contextRoutines.map(r => ({
    id: r.id,
    type: 'routine' as const,
    time_of_day: r.time || r.time_of_day,
    title: r.title,
    description: r.description,
    icon_symbol: r.category === 'Medicine' ? '💊' : (r.category === 'Exercise' ? '🚶' : (r.icon_symbol || '🧠')),
    status: r.completed ? 'Completed' : 'Pending',
    category: r.category
  }));

  const reminders = contextReminders.map(rem => ({
    id: rem.id,
    type: 'reminder' as const,
    time_of_day: rem.scheduled_time,
    title: rem.title,
    description: rem.category,
    icon_symbol: rem.category === 'Medicine' ? '💊' : (rem.category.toLowerCase().includes('water') ? '💧' : '🔔'),
    status: rem.status === 'Completed' ? 'Completed' : 'Pending',
    category: rem.category
  }));

  const allItems = [...reminders, ...routines];

  const handleToggleItem = (item: typeof allItems[0]) => {
    if (item.type === 'reminder') {
      completeReminder(item.id);
      speakText(`Marked reminder ${item.title} as completed!`, language);
    } else {
      toggleRoutine(item.id);
      const nextStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
      if (nextStatus === 'Completed') {
        speakText(`Marked routine ${item.title} as completed! Well done.`, language);
      }
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <BackButton label={t.nav.home} onClick={onBack} variant="patient" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {t.schedule_page.title}
        </h1>
      </div>

      {/* Routine & Reminder Timeline Cards */}
      {allItems.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Schedule Tasks Today"
          description="Your daily schedule is empty right now. Your caregiver can set up morning tea, medication, and exercise reminders!"
          accentColor="#0d9488"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allItems.map((item) => {
            const isDone = item.status === 'Completed';
            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleToggleItem(item)}
                className="touch-target"
                tabIndex={0}
                role="button"
                aria-label={`Task: ${item.title} at ${item.time_of_day}, ${item.status}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleItem(item);
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
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      background: item.type === 'reminder' ? '#fee2e2' : '#e0e7ff',
                      color: item.type === 'reminder' ? '#b91c1c' : '#3730a3'
                    }}>
                      {item.type === 'reminder' ? 'Reminder' : 'Routine'}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    color: isDone ? '#0f172a' : '#1e293b',
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.8 : 1,
                    marginTop: '0.2rem'
                  }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                      {item.description}
                    </p>
                  )}
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
