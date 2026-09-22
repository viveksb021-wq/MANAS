import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchApi } from '../utils/api';

export interface FamilyMember {
  id: string; // Stable ID, e.g. String(person.id)
  name: string;
  relationship: string;
  imagePath: string; // /images/family/<filename> or URL
  photo_url?: string;
  notes?: string;
  date_of_birth?: string;
  is_active?: boolean;
}

export interface PatientProfile {
  id: string | number;
  full_name: string;
  age: number;
  gender?: string;
  preferred_language: string;
  voice_preference?: string;
  emergency_contact?: string;
  photo_url?: string;
  pin: string;
  voice_passphrase: string;
  onboarding_completed?: boolean;
}

export interface PersonItem {
  id: number | string;
  name: string;
  relationship: string;
  photo_url: string;
  notes?: string;
  date_of_birth?: string;
  is_active?: boolean;
}

export interface MemoryItem {
  id: number;
  title: string;
  description: string;
  place?: string;
  people_involved?: string;
  people_ids?: number[];
  memory_date?: string;
  photo_url?: string;
  voice_note_url?: string;
  category?: string;
  tags?: string;
  associated_person_id?: number;
  associated_place_id?: number;
}

export interface PlaceItem {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
  photo_url?: string;
}

export interface RoutineItem {
  id: number;
  time: string;
  time_of_day: string;
  title: string;
  description?: string;
  category: string;
  icon_symbol?: string;
  status?: string;
  completed: boolean;
}

export interface ReminderItem {
  id: number;
  title: string;
  category: string;
  scheduled_time: string;
  is_recurring: boolean;
  status: string; // 'Pending' | 'Completed' | 'Missed' | 'Skipped'
  completed_at?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface PatientContextType {
  currentPatientId: string | number;
  patientProfile: PatientProfile;
  familyMembers: FamilyMember[];
  activeFamilyMembers: FamilyMember[];
  relationships: PersonItem[];
  memories: MemoryItem[];
  places: PlaceItem[];
  routines: RoutineItem[];
  reminders: ReminderItem[];
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  switchPatient: (patientId: string | number) => void;
  updateProfile: (updated: Partial<PatientProfile>) => Promise<void>;
  
  // Person CRUD
  addPerson: (person: Omit<PersonItem, 'id'>) => Promise<void>;
  updatePerson: (id: string | number, updated: Partial<PersonItem>) => Promise<void>;
  updateFamilyMember: (id: string, updated: Partial<FamilyMember>) => Promise<void>;
  deletePerson: (id: string | number) => Promise<void>;

  // Memory CRUD
  addMemory: (memory: Omit<MemoryItem, 'id'>) => Promise<void>;
  updateMemory: (id: number, updated: Partial<MemoryItem>) => Promise<void>;
  deleteMemory: (id: number) => Promise<void>;

  // Place CRUD
  addPlace: (place: Omit<PlaceItem, 'id'>) => Promise<void>;
  updatePlace: (id: number, updated: Partial<PlaceItem>) => Promise<void>;
  deletePlace: (id: number) => Promise<void>;

  // Routine CRUD
  addRoutine: (routine: Omit<RoutineItem, 'id' | 'completed'>) => Promise<void>;
  updateRoutine: (id: number, updated: Partial<RoutineItem>) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  toggleRoutine: (routineId: number) => Promise<void>;

  // Reminder CRUD
  addReminder: (reminder: Omit<ReminderItem, 'id'>) => Promise<void>;
  updateReminder: (id: number, updated: Partial<ReminderItem>) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  completeReminder: (reminderId: number) => Promise<void>;

  refreshAll: (silent?: boolean) => Promise<void>;
  clearPatientState: () => void;
  getStorageKey: (key: string) => string;
}

export const DEFAULT_FAMILY_MEMBERS_P1: FamilyMember[] = [
  {
    id: 'patient',
    name: 'Prasad',
    relationship: 'Patient',
    imagePath: '/images/family/patient.jpeg',
    photo_url: '/images/family/patient.jpeg',
    notes: 'Self profile - 74 years old, retired school principal in Shillong.',
    is_active: true
  },
  {
    id: 'wife',
    name: 'Sunita',
    relationship: 'Wife',
    imagePath: '/images/family/wife.jpeg',
    photo_url: '/images/family/wife.jpeg',
    notes: 'Coordinates morning tea, daily medications & garden strolls.',
    is_active: true
  },
  {
    id: 'son',
    name: 'Ravi',
    relationship: 'Son',
    imagePath: '/images/family/son.jpeg',
    photo_url: '/images/family/son.jpeg',
    notes: 'Your elder son. Visits every weekend from Guwahati and calls daily.',
    is_active: true
  },
  {
    id: 'daughter',
    name: 'Meera',
    relationship: 'Daughter',
    imagePath: '/images/family/daughter.webp',
    photo_url: '/images/family/daughter.webp',
    notes: 'Your daughter. Lives nearby in Laitumkhrah, Shillong.',
    is_active: true
  },
  {
    id: 'brother1',
    name: 'Biren',
    relationship: '1st Brother',
    imagePath: '/images/family/brother-1.jpeg',
    photo_url: '/images/family/brother-1.jpeg',
    notes: 'Your eldest brother. Retired engineer living in Jorhat.',
    is_active: true
  },
  {
    id: 'brother1-wife',
    name: 'Kamla',
    relationship: "1st Brother's Wife",
    imagePath: '/images/family/brother-1-wife.jpeg',
    photo_url: '/images/family/brother-1-wife.jpeg',
    notes: 'Sister-in-law. Loves baking traditional Pitha sweets.',
    is_active: true
  },
  {
    id: 'brother1-son',
    name: 'Arun',
    relationship: "1st Brother's Son",
    imagePath: '/images/family/brother-1-son.jpeg',
    photo_url: '/images/family/brother-1-son.jpeg',
    notes: 'Nephew. 14 years old. Loves playing classical guitar.',
    is_active: true
  },
  {
    id: 'brother1-daughter',
    name: 'Pooja',
    relationship: "1st Brother's Daughter",
    imagePath: '/images/family/brother-1-daughter.jpeg',
    photo_url: '/images/family/brother-1-daughter.jpeg',
    notes: 'Niece. Studying medical science in Dibrugarh.',
    is_active: true
  },
  {
    id: 'brother2',
    name: 'Vikram',
    relationship: '2nd Brother',
    imagePath: '/images/family/brother-2.jpeg',
    photo_url: '/images/family/brother-2.jpeg',
    notes: 'Your younger brother. Visits during Bihu festival.',
    is_active: true
  },
  {
    id: 'brother2-wife',
    name: 'Asha',
    relationship: "2nd Brother's Wife",
    imagePath: '/images/family/brother-2-wife.jpeg',
    photo_url: '/images/family/brother-2-wife.jpeg',
    notes: 'Younger sister-in-law. Coordinates family video calls.',
    is_active: true
  },
  {
    id: 'doctor',
    name: 'Dr. Haren Barua',
    relationship: 'Family Doctor',
    imagePath: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    notes: 'Physician at Shillong Medical Center.',
    is_active: true
  },
  {
    id: 'spouse',
    name: 'JYOTHIKA',
    relationship: 'Spouse',
    imagePath: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    notes: 'Cherished family member enrolled by caregiver.',
    is_active: true
  }
];

export const DEFAULT_FAMILY_MEMBERS_P2: FamilyMember[] = [
  {
    id: 'patient',
    name: 'Biren Das',
    relationship: 'Patient',
    imagePath: '/images/family/patient.jpg',
    photo_url: '/images/family/patient.jpg',
    notes: 'Self profile - 79 years old, retired tea estate supervisor.',
    is_active: true
  },
  {
    id: 'daughter',
    name: 'Meera Das',
    relationship: 'Daughter',
    imagePath: '/images/family/daughter.jpg',
    photo_url: '/images/family/daughter.jpg',
    notes: 'Primary caregiver for Biren. Calls every morning.',
    is_active: true
  },
  {
    id: 'son',
    name: 'Pritam Das',
    relationship: 'Son',
    imagePath: '/images/family/son.jpg',
    photo_url: '/images/family/son.jpg',
    notes: 'Son living in Guwahati. Brings groceries on Saturdays.',
    is_active: true
  }
];

const DEFAULT_PATIENT_001: PatientProfile = {
  id: 1,
  full_name: 'Prasad',
  age: 74,
  gender: 'Male',
  preferred_language: 'en',
  voice_preference: 'gentle_female',
  emergency_contact: '+91 98640 55789',
  photo_url: '/images/family/patient.jpg',
  pin: '1234',
  voice_passphrase: 'Hello MANAS'
};

const DEFAULT_PATIENT_002: PatientProfile = {
  id: 2,
  full_name: 'Biren Das',
  age: 79,
  gender: 'Male',
  preferred_language: 'as',
  voice_preference: 'warm_male',
  emergency_contact: '+91 94350 11223',
  photo_url: '/images/family/patient.jpg',
  pin: '5678',
  voice_passphrase: 'MANAS Assist'
};

const DEFAULT_MEMORIES_P1: MemoryItem[] = [
  {
    id: 1,
    title: 'Family Trip to Shillong Peak',
    description: 'Beautiful sunny morning overlooking the pine hills of Shillong with Ravi and young Arun.',
    place: 'Shillong, Meghalaya',
    people_involved: 'Ravi, Arun',
    memory_date: 'November 2024',
    photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    category: 'family',
    tags: 'Shillong, Family'
  },
  {
    id: 2,
    title: 'Bihu Festival Celebration',
    description: 'Traditional Assam Bihu festival at home with homemade Pitha sweets and folk music.',
    place: 'Guwahati, Assam',
    people_involved: 'Whole Family',
    memory_date: 'April 2025',
    photo_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
    category: 'milestone',
    tags: 'Bihu, Tradition'
  }
];

const DEFAULT_PLACES_P1: PlaceItem[] = [
  {
    id: 1,
    name: 'Home - Shillong Residence',
    category: 'Home',
    address: 'House #42, Pine Ridge Road, Laitumkhrah, Shillong',
    latitude: 25.5788,
    longitude: 91.8933,
    notes: 'Primary residence. Quiet area near Cathedral.',
    photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
  }
];

const DEFAULT_ROUTINES_P1: RoutineItem[] = [
  { id: 1, time: '07:30 AM', time_of_day: '07:30 AM', title: 'Morning BP Medication & Tea', description: 'Take 1 tablet of Amlodipine with warm tea', category: 'Medicine', completed: true },
  { id: 2, time: '08:30 AM', time_of_day: '08:30 AM', title: 'Gentle Garden Walk', description: '15-minute mild walk in front yard', category: 'Exercise', completed: true },
  { id: 3, time: '11:00 AM', time_of_day: '11:00 AM', title: 'Cognitive Memory Game', description: 'Complete 1 Memory Match activity on MANAS', category: 'Brain', completed: false }
];

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPatientId, setCurrentPatientId] = useState<string | number>(() => {
    return localStorage.getItem('manas_active_patient_id') || 1;
  });

  const [patientProfile, setPatientProfile] = useState<PatientProfile>(DEFAULT_PATIENT_001);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_FAMILY_MEMBERS_P1);
  const [memories, setMemories] = useState<MemoryItem[]>(DEFAULT_MEMORIES_P1);
  const [places, setPlaces] = useState<PlaceItem[]>(DEFAULT_PLACES_P1);
  const [routines, setRoutines] = useState<RoutineItem[]>(DEFAULT_ROUTINES_P1);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Broadcast Channel for cross-tab instant real-time sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  const getStorageKey = useCallback((key: string) => `manas:patient:${currentPatientId}:${key}`, [currentPatientId]);

  // Load from local storage cache initially or on error
  const loadFromCache = useCallback((pid: string | number) => {
    try {
      const cached = localStorage.getItem(`manas_patient_cache_${pid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.patientProfile) setPatientProfile(parsed.patientProfile);
        if (parsed.familyMembers) setFamilyMembers(parsed.familyMembers);
        if (parsed.memories) setMemories(parsed.memories);
        if (parsed.places) setPlaces(parsed.places);
        if (parsed.routines) setRoutines(parsed.routines);
        if (parsed.reminders) setReminders(parsed.reminders);
        return true;
      }
    } catch (e) {
      console.warn('[PatientContext] Error reading cache:', e);
    }
    return false;
  }, []);

  // Save current state to local cache
  const saveToCache = useCallback((pid: string | number, state: any) => {
    try {
      localStorage.setItem(`manas_patient_cache_${pid}`, JSON.stringify(state));
    } catch (e) {
      console.warn('[PatientContext] Error writing cache:', e);
    }
  }, []);

  // Atomic state persistence helper
  const persistState = useCallback((partial: any) => {
    try {
      const key = `manas_patient_cache_${currentPatientId}`;
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : {};
      const merged = { ...existing, ...partial };
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (e) {
      console.warn('[PatientContext] Error writing atomic cache:', e);
    }
  }, [currentPatientId]);

  // Notify other tabs
  const broadcastChange = useCallback((entity: string) => {
    try {
      channelRef.current?.postMessage({
        type: 'DATA_CHANGED',
        patientId: currentPatientId,
        entity,
        timestamp: Date.now()
      });
    } catch (e) {
      // Ignore
    }
  }, [currentPatientId]);

  // Master refresh from authoritative backend
  const refreshAll = useCallback(async (silent: boolean = false) => {
    if (!silent) setSyncStatus('syncing');
    const pid = currentPatientId;
    const pidParam = `?requested_patient_id=${pid}`;

    try {
      const [profRes, peopleRes, memsRes, placesRes, routinesRes, remindersRes] = await Promise.allSettled([
        fetchApi<any>(`/patient/profile${pidParam}`),
        fetchApi<any[]>(`/people?include_inactive=true&requested_patient_id=${pid}`),
        fetchApi<any[]>(`/memories${pidParam}`),
        fetchApi<any[]>(`/places${pidParam}`),
        fetchApi<any[]>(`/routines${pidParam}`),
        fetchApi<any[]>(`/reminders${pidParam}`)
      ]);

      let newProfile = patientProfile;
      let newFamily = familyMembers;
      let newMemories = memories;
      let newPlaces = places;
      let newRoutines = routines;
      let newReminders = reminders;

      if (profRes.status === 'fulfilled' && profRes.value) {
        const p = profRes.value;
        newProfile = {
          id: p.id || pid,
          full_name: p.full_name || p.user?.full_name || (Number(pid) === 2 ? 'Biren Das' : 'Prasad'),
          age: p.age ?? (Number(pid) === 2 ? 79 : 74),
          gender: p.gender || 'Male',
          preferred_language: p.preferred_language || (Number(pid) === 2 ? 'as' : 'en'),
          voice_preference: p.voice_preference || 'gentle_female',
          emergency_contact: p.emergency_contact || '+91 98640 55789',
          photo_url: p.photo_url || '/images/family/patient.jpg',
          pin: p.pin || (Number(pid) === 2 ? '5678' : '1234'),
          voice_passphrase: p.voice_passphrase || 'Hello MANAS',
          onboarding_completed: p.onboarding_completed
        };
        setPatientProfile(newProfile);
      }

      if (peopleRes.status === 'fulfilled' && Array.isArray(peopleRes.value) && peopleRes.value.length > 0) {
        newFamily = peopleRes.value.map(p => ({
          id: String(p.id),
          name: p.name,
          relationship: p.relationship,
          imagePath: p.photo_url || '/images/family/son.jpg',
          photo_url: p.photo_url || '/images/family/son.jpg',
          notes: p.notes || '',
          date_of_birth: p.date_of_birth || '',
          is_active: p.is_active !== false
        }));
        setFamilyMembers(prev => {
          const offlineOnly = prev.filter(m => m.id.startsWith('temp_'));
          return [...offlineOnly, ...newFamily];
        });
      }

      if (memsRes.status === 'fulfilled' && Array.isArray(memsRes.value) && memsRes.value.length > 0) {
        newMemories = memsRes.value;
        setMemories(newMemories);
      }

      if (placesRes.status === 'fulfilled' && Array.isArray(placesRes.value) && placesRes.value.length > 0) {
        newPlaces = placesRes.value;
        setPlaces(newPlaces);
      }

      if (routinesRes.status === 'fulfilled' && Array.isArray(routinesRes.value) && routinesRes.value.length > 0) {
        newRoutines = routinesRes.value.map((r: any) => ({
          id: r.id,
          time: r.time_of_day,
          time_of_day: r.time_of_day,
          title: r.title,
          description: r.description || '',
          category: r.category || 'Daily',
          icon_symbol: r.icon_symbol || '☀️',
          status: r.status || 'Pending',
          completed: r.status === 'Completed'
        }));
        setRoutines(newRoutines);
      }

      if (remindersRes.status === 'fulfilled' && Array.isArray(remindersRes.value) && remindersRes.value.length > 0) {
        newReminders = remindersRes.value;
        setReminders(newReminders);
      }

      setSyncStatus('synced');
      setLastSyncedAt(new Date());

      saveToCache(pid, {
        patientProfile: newProfile,
        familyMembers: newFamily,
        memories: newMemories,
        places: newPlaces,
        routines: newRoutines,
        reminders: newReminders
      });
    } catch (e) {
      console.warn('[PatientContext] Sync encountered issue:', e);
      setSyncStatus(navigator.onLine ? 'error' : 'offline');
    }
  }, [currentPatientId, patientProfile, familyMembers, memories, places, routines, reminders, loadFromCache, saveToCache]);

  // Setup Broadcast Channel & Polling
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('manas_patient_sync');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'DATA_CHANGED' && String(event.data?.patientId) === String(currentPatientId)) {
          refreshAll(true);
        }
      };

      return () => {
        channel.close();
      };
    }
    return undefined;
  }, [currentPatientId, refreshAll]);

  // Background polling every 4 seconds when tab is active and online
  useEffect(() => {
    refreshAll();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden && navigator.onLine) {
        refreshAll(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentPatientId]);

  const switchPatient = useCallback((pid: string | number) => {
    setCurrentPatientId(pid);
    localStorage.setItem('manas_active_patient_id', String(pid));
    loadFromCache(pid);
    fetchApi('/voice/reset-context', { method: 'POST' }).catch(() => {});
  }, [loadFromCache]);

  // Profile update
  const updateProfile = useCallback(async (updated: Partial<PatientProfile>) => {
    setPatientProfile(prev => ({ ...prev, ...updated }));
    try {
      await fetchApi(`/patient/profile?requested_patient_id=${currentPatientId}`, {
        method: 'PUT',
        body: updated
      });
      broadcastChange('profile');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] updateProfile failed:', e);
    }
  }, [currentPatientId, broadcastChange, refreshAll]);

  // Person CRUD
  const addPerson = useCallback(async (person: Omit<PersonItem, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const initialMember: FamilyMember = {
      id: tempId,
      name: person.name,
      relationship: person.relationship,
      imagePath: person.photo_url || '/images/family/son.jpeg',
      photo_url: person.photo_url || '/images/family/son.jpeg',
      notes: person.notes || '',
      date_of_birth: person.date_of_birth || '',
      is_active: person.is_active !== false
    };

    setFamilyMembers(prev => {
      const next = [initialMember, ...prev];
      persistState({ familyMembers: next });
      return next;
    });

    try {
      const res = await fetchApi<any>(`/people?requested_patient_id=${currentPatientId}`, {
        method: 'POST',
        body: {
          name: person.name,
          relationship: person.relationship,
          photo_url: person.photo_url || '/images/family/son.jpeg',
          notes: person.notes || '',
          date_of_birth: person.date_of_birth || null,
          is_active: person.is_active !== false
        }
      });
      if (res && res.id) {
        const authMember: FamilyMember = {
          id: String(res.id),
          name: res.name,
          relationship: res.relationship,
          imagePath: res.photo_url,
          photo_url: res.photo_url,
          notes: res.notes,
          date_of_birth: res.date_of_birth,
          is_active: res.is_active
        };
        setFamilyMembers(prev => {
          const next = [authMember, ...prev.filter(m => m.id !== tempId && m.id !== String(res.id))];
          persistState({ familyMembers: next });
          return next;
        });
      }
      broadcastChange('person');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] addPerson sync warning:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const updatePerson = useCallback(async (id: string | number, updated: Partial<PersonItem>) => {
    setFamilyMembers(prev => {
      const next = prev.map(m => m.id === String(id) ? {
        ...m,
        name: updated.name !== undefined ? updated.name : m.name,
        relationship: updated.relationship !== undefined ? updated.relationship : m.relationship,
        notes: updated.notes !== undefined ? updated.notes : m.notes,
        date_of_birth: updated.date_of_birth !== undefined ? updated.date_of_birth : m.date_of_birth,
        photo_url: updated.photo_url || m.photo_url,
        imagePath: updated.photo_url || m.imagePath,
        is_active: updated.is_active !== undefined ? updated.is_active : m.is_active
      } : m);
      persistState({ familyMembers: next });
      return next;
    });

    const numericId = parseInt(String(id).replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await fetchApi(`/people/${numericId}?requested_patient_id=${currentPatientId}`, {
          method: 'PUT',
          body: updated
        });
        broadcastChange('person');
        refreshAll(true);
      } catch (e) {
        console.warn('[PatientContext] updatePerson failed:', e);
      }
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const updateFamilyMember = useCallback(async (id: string, updated: Partial<FamilyMember>) => {
    return updatePerson(id, {
      ...updated,
      photo_url: updated.imagePath || updated.photo_url
    });
  }, [updatePerson]);

  const deletePerson = useCallback(async (id: string | number) => {
    setFamilyMembers(prev => {
      const next = prev.filter(m => m.id !== String(id));
      persistState({ familyMembers: next });
      return next;
    });
    const numericId = parseInt(String(id).replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await fetchApi(`/people/${numericId}?requested_patient_id=${currentPatientId}`, {
          method: 'DELETE'
        });
        broadcastChange('person');
        refreshAll(true);
      } catch (e) {
        console.warn('[PatientContext] deletePerson failed:', e);
      }
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  // Memory CRUD
  const addMemory = useCallback(async (memory: Omit<MemoryItem, 'id'>) => {
    const tempId = Date.now();
    const initialMem: MemoryItem = { ...memory, id: tempId };
    setMemories(prev => {
      const next = [initialMem, ...prev];
      persistState({ memories: next });
      return next;
    });

    try {
      const res = await fetchApi<any>(`/memories?requested_patient_id=${currentPatientId}`, {
        method: 'POST',
        body: memory
      });
      if (res && res.id) {
        setMemories(prev => {
          const next = [res, ...prev.filter(m => m.id !== tempId && m.id !== res.id)];
          persistState({ memories: next });
          return next;
        });
      }
      broadcastChange('memory');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] addMemory sync warning:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const updateMemory = useCallback(async (id: number, updated: Partial<MemoryItem>) => {
    setMemories(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...updated } : m);
      persistState({ memories: next });
      return next;
    });
    try {
      await fetchApi(`/memories/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'PUT',
        body: updated
      });
      broadcastChange('memory');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] updateMemory failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const deleteMemory = useCallback(async (id: number) => {
    setMemories(prev => {
      const next = prev.filter(m => m.id !== id);
      persistState({ memories: next });
      return next;
    });
    try {
      await fetchApi(`/memories/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'DELETE'
      });
      broadcastChange('memory');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] deleteMemory failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  // Place CRUD
  const addPlace = useCallback(async (place: Omit<PlaceItem, 'id'>) => {
    const tempId = Date.now();
    const initialPlace: PlaceItem = { ...place, id: tempId };
    setPlaces(prev => {
      const next = [initialPlace, ...prev];
      persistState({ places: next });
      return next;
    });

    try {
      const res = await fetchApi<any>(`/places?requested_patient_id=${currentPatientId}`, {
        method: 'POST',
        body: place
      });
      if (res && res.id) {
        setPlaces(prev => {
          const next = [res, ...prev.filter(p => p.id !== tempId && p.id !== res.id)];
          persistState({ places: next });
          return next;
        });
      }
      broadcastChange('place');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] addPlace sync warning:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const updatePlace = useCallback(async (id: number, updated: Partial<PlaceItem>) => {
    setPlaces(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updated } : p);
      persistState({ places: next });
      return next;
    });
    try {
      await fetchApi(`/places/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'PUT',
        body: updated
      });
      broadcastChange('place');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] updatePlace failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const deletePlace = useCallback(async (id: number) => {
    setPlaces(prev => {
      const next = prev.filter(p => p.id !== id);
      persistState({ places: next });
      return next;
    });
    try {
      await fetchApi(`/places/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'DELETE'
      });
      broadcastChange('place');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] deletePlace failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  // Routine CRUD
  const addRoutine = useCallback(async (routine: Omit<RoutineItem, 'id' | 'completed'>) => {
    const tempId = Date.now();
    const initialRoutine: RoutineItem = {
      id: tempId,
      time: routine.time_of_day || routine.time,
      time_of_day: routine.time_of_day || routine.time,
      title: routine.title,
      description: routine.description,
      category: routine.category,
      icon_symbol: routine.icon_symbol || '☀️',
      status: routine.status || 'Pending',
      completed: routine.status === 'Completed'
    };
    setRoutines(prev => {
      const next = [...prev, initialRoutine];
      persistState({ routines: next });
      return next;
    });

    try {
      const res = await fetchApi<any>(`/routines?requested_patient_id=${currentPatientId}`, {
        method: 'POST',
        body: {
          time_of_day: routine.time_of_day || routine.time,
          title: routine.title,
          description: routine.description,
          category: routine.category,
          icon_symbol: routine.icon_symbol || '☀️',
          status: routine.status || 'Pending'
        }
      });
      if (res && res.id) {
        const item: RoutineItem = {
          id: res.id,
          time: res.time_of_day,
          time_of_day: res.time_of_day,
          title: res.title,
          description: res.description,
          category: res.category,
          icon_symbol: res.icon_symbol,
          status: res.status,
          completed: res.status === 'Completed'
        };
        setRoutines(prev => {
          const next = [...prev.filter(r => r.id !== tempId && r.id !== res.id), item];
          persistState({ routines: next });
          return next;
        });
      }
      broadcastChange('routine');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] addRoutine sync warning:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const updateRoutine = useCallback(async (id: number, updated: Partial<RoutineItem>) => {
    setRoutines(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updated } : r);
      persistState({ routines: next });
      return next;
    });
    try {
      await fetchApi(`/routines/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'PUT',
        body: {
          time_of_day: updated.time_of_day || updated.time,
          title: updated.title,
          description: updated.description,
          category: updated.category,
          icon_symbol: updated.icon_symbol,
          status: updated.status
        }
      });
      broadcastChange('routine');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] updateRoutine failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const deleteRoutine = useCallback(async (id: number) => {
    setRoutines(prev => {
      const next = prev.filter(r => r.id !== id);
      persistState({ routines: next });
      return next;
    });
    try {
      await fetchApi(`/routines/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'DELETE'
      });
      broadcastChange('routine');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] deleteRoutine failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const toggleRoutine = useCallback(async (routineId: number) => {
    setRoutines(prev => {
      const next = prev.map(r => r.id === routineId ? { ...r, completed: !r.completed, status: !r.completed ? 'Completed' : 'Pending' } : r);
      persistState({ routines: next });
      return next;
    });
    try {
      await fetchApi(`/routines/${routineId}/toggle?requested_patient_id=${currentPatientId}`, {
        method: 'POST'
      });
      broadcastChange('routine');
    } catch (e) {
      console.warn('[PatientContext] toggleRoutine API error:', e);
    }
  }, [currentPatientId, persistState, broadcastChange]);

  // Reminder CRUD
  const addReminder = useCallback(async (reminder: Omit<ReminderItem, 'id'>) => {
    const tempId = Date.now();
    const initialRem: ReminderItem = { ...reminder, id: tempId };
    setReminders(prev => {
      const next = [...prev, initialRem];
      persistState({ reminders: next });
      return next;
    });

    try {
      const res = await fetchApi<any>(`/reminders?requested_patient_id=${currentPatientId}`, {
        method: 'POST',
        body: reminder
      });
      if (res && res.id) {
        setReminders(prev => {
          const next = [...prev.filter(r => r.id !== tempId && r.id !== res.id), res];
          persistState({ reminders: next });
          return next;
        });
      }
      broadcastChange('reminder');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] addReminder sync warning:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const updateReminder = useCallback(async (id: number, updated: Partial<ReminderItem>) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updated } : r);
      persistState({ reminders: next });
      return next;
    });
    try {
      await fetchApi(`/reminders/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'PUT',
        body: updated
      });
      broadcastChange('reminder');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] updateReminder failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const deleteReminder = useCallback(async (id: number) => {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id);
      persistState({ reminders: next });
      return next;
    });
    try {
      await fetchApi(`/reminders/${id}?requested_patient_id=${currentPatientId}`, {
        method: 'DELETE'
      });
      broadcastChange('reminder');
      refreshAll(true);
    } catch (e) {
      console.warn('[PatientContext] deleteReminder failed:', e);
    }
  }, [currentPatientId, persistState, broadcastChange, refreshAll]);

  const completeReminder = useCallback(async (reminderId: number) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === reminderId ? { ...r, status: 'Completed' } : r);
      persistState({ reminders: next });
      return next;
    });
    try {
      await fetchApi(`/reminders/${reminderId}/complete?requested_patient_id=${currentPatientId}`, {
        method: 'POST'
      });
      broadcastChange('reminder');
    } catch (e) {
      console.warn('[PatientContext] completeReminder failed:', e);
    }
  }, [currentPatientId, broadcastChange]);

  const clearPatientState = useCallback(() => {
    setPatientProfile(DEFAULT_PATIENT_001);
    setFamilyMembers(DEFAULT_FAMILY_MEMBERS_P1);
    setMemories(DEFAULT_MEMORIES_P1);
    setPlaces(DEFAULT_PLACES_P1);
    setRoutines(DEFAULT_ROUTINES_P1);
    setReminders([]);
  }, []);

  // Filtered active family members (for games, patient views, family tree)
  const activeFamilyMembers = useMemo(() => {
    return familyMembers.filter(m => m.is_active !== false);
  }, [familyMembers]);

  // Backward compatibility relationships array
  const relationships: PersonItem[] = useMemo(() => {
    return familyMembers.map(m => ({
      id: m.id,
      name: m.name,
      relationship: m.relationship,
      photo_url: m.imagePath || m.photo_url || '/images/family/son.jpg',
      notes: m.notes,
      date_of_birth: m.date_of_birth,
      is_active: m.is_active !== false
    }));
  }, [familyMembers]);

  return (
    <PatientContext.Provider
      value={{
        currentPatientId,
        patientProfile,
        familyMembers,
        activeFamilyMembers,
        relationships,
        memories,
        places,
        routines,
        reminders,
        syncStatus,
        lastSyncedAt,
        switchPatient,
        updateProfile,
        addPerson,
        updatePerson,
        updateFamilyMember,
        deletePerson,
        addMemory,
        updateMemory,
        deleteMemory,
        addPlace,
        updatePlace,
        deletePlace,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleRoutine,
        addReminder,
        updateReminder,
        deleteReminder,
        completeReminder,
        refreshAll,
        clearPatientState,
        getStorageKey
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatient must be used within a PatientProvider');
  return context;
};
