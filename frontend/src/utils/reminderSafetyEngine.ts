import { fetchApi } from './api';
import { enqueueOfflineAction } from './db';
import { RoutineItem } from '../context/PatientContext';

export interface MissedReminderRecord {
  occurrence_key: string;
  patient_id: number;
  reminder_id: number;
  title: string;
  scheduled_time: string;
  skipped_at: string;
  synced: boolean;
}

export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatCurrentTimeString(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function evaluateMissedReminders(
  patientId: number | string,
  patientName: string,
  routines: RoutineItem[],
  isOnline: boolean,
  currentTimeStr?: string
): Promise<MissedReminderRecord[]> {
  const pIdNum = Number(patientId);
  const todayStr = getTodayDateString();
  const nowTime = currentTimeStr || formatCurrentTimeString();
  const currentMinutes = parseTimeToMinutes(nowTime);

  if (currentMinutes === null) return [];

  const storageKey = `manas:patient:${patientId}:missed_reminders`;
  let recordedMap: Record<string, MissedReminderRecord> = {};

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) recordedMap = JSON.parse(raw);
  } catch {
    recordedMap = {};
  }

  const newMissed: MissedReminderRecord[] = [];

  for (const routine of routines) {
    // If acknowledged / completed, do NOT trigger
    if (routine.completed) continue;

    const schedMinutes = parseTimeToMinutes(routine.time);
    if (schedMinutes === null) continue;

    // Difference in minutes past scheduled time
    const diff = currentMinutes - schedMinutes;

    // Rule: Must be AT LEAST 30 minutes past scheduled time.
    // Do not trigger at 0-29 mins.
    if (diff >= 30 && diff <= 720) {
      // Unique occurrence identifier: patientId + reminderId + scheduledOccurrence
      const occKey = `missed_p${pIdNum}_r${routine.id}_${todayStr}`;

      if (!recordedMap[occKey]) {
        const record: MissedReminderRecord = {
          occurrence_key: occKey,
          patient_id: pIdNum,
          reminder_id: routine.id,
          title: routine.title,
          scheduled_time: routine.time,
          skipped_at: new Date().toISOString(),
          synced: isOnline
        };

        recordedMap[occKey] = record;
        newMissed.push(record);

        if (isOnline) {
          try {
            await fetchApi('/patient/reminders/check-missed', {
              method: 'POST',
              body: {
                current_time_str: nowTime,
                client_date: todayStr
              }
            });
          } catch (err) {
            console.warn('Online sync for missed reminder failed, queuing locally:', err);
            record.synced = false;
            await enqueueOfflineAction('/patient/reminders/check-missed', {
              current_time_str: nowTime,
              client_date: todayStr,
              occurrence_key: occKey
            });
          }
        } else {
          // Offline handling: record locally, queue for synchronization
          record.synced = false;
          await enqueueOfflineAction('/patient/reminders/check-missed', {
            current_time_str: nowTime,
            client_date: todayStr,
            occurrence_key: occKey
          });
        }
      }
    }
  }

  if (newMissed.length > 0) {
    localStorage.setItem(storageKey, JSON.stringify(recordedMap));
  }

  return newMissed;
}

export async function flushPendingOfflineReminders(patientId: number | string) {
  const storageKey = `manas:patient:${patientId}:missed_reminders`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const map: Record<string, MissedReminderRecord> = JSON.parse(raw);
    let updated = false;

    for (const key of Object.keys(map)) {
      if (!map[key].synced && navigator.onLine) {
        try {
          await fetchApi('/patient/reminders/check-missed', {
            method: 'POST',
            body: {
              current_time_str: map[key].scheduled_time,
              client_date: getTodayDateString()
            }
          });
          map[key].synced = true;
          updated = true;
        } catch (e) {
          console.warn('Sync pending missed reminder error:', e);
        }
      }
    }

    if (updated) {
      localStorage.setItem(storageKey, JSON.stringify(map));
    }
  } catch (err) {
    console.warn('flushPendingOfflineReminders error:', err);
  }
}
