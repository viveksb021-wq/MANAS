import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Circle, Bell, Droplet, Pill, Activity, Sun, Volume2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { speakText } from '../../utils/speech';

interface TodayScheduleProps {
  onBack: () => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ onBack }) => {
  const [routines, setRoutines] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  const loadScheduleData = () => {
    fetchApi<any[]>('/routines')
      .then(data => {
        if (data && data.length > 0) setRoutines(data);
        else setRoutines([
          { id: 1, time_of_day: '07:30 AM', title: 'Morning Tea & Gentle Breathing', icon_symbol: '☀️', status: 'Completed' },
          { id: 2, time_of_day: '08:00 AM', title: 'Blood Pressure Medicine', icon_symbol: '💊', status: 'Completed' },
          { id: 3, time_of_day: '10:00 AM', title: 'Cognitive Training Activity', icon_symbol: '🧠', status: 'Pending' },
          { id: 4, time_of_day: '01:00 PM', title: 'Hydration & Lunch', icon_symbol: '💧', status: 'Pending' },
          { id: 5, time_of_day: '06:00 PM', title: 'Evening Walk in Garden', icon_symbol: '🚶', status: 'Pending' },
          { id: 6, time_of_day: '08:00 PM', title: 'Night Medicine', icon_symbol: '💊', status: 'Pending' }
        ]);
      })
      .catch(() => {});

    fetchApi<any[]>('/reminders')
      .then(data => {
        if (data && data.length > 0) setReminders(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadScheduleData();
  }, []);

  const handleToggleRoutine = async (item: any) => {
    const isCompleted = item.status === 'Completed';
    const newStatus = isCompleted ? 'Pending' : 'Completed';

    setRoutines(prev => prev.map(r => r.id === item.id ? { ...r, status: newStatus } : r));

    if (!isCompleted) {
      speakText(`Marked ${item.title} as completed! Well done Vivek.`);
    }

    try {
      await fetchApi(`/routines/${item.id}/toggle`, { method: 'POST' });
    } catch (e) {
      console.log('Routine toggle saved locally');
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={22} /> Home
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          TODAY'S SCHEDULE
        </h1>
      </div>

      {/* Routine Timeline Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {routines.map((item) => {
          const isDone = item.status === 'Completed';
          return (
            <div
              key={item.id}
              onClick={() => handleToggleRoutine(item)}
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
    </div>
  );
};
