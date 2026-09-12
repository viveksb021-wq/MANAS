import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

export interface FamilyMember {
  id: string; // Stable ID: 'patient', 'wife', 'son', 'daughter', 'brother1', 'brother1-wife', 'brother1-son', 'brother1-daughter', 'brother2', 'brother2-wife'
  name: string;
  relationship: string;
  imagePath: string; // /images/family/<filename>
  notes?: string;
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
}

export interface MemoryItem {
  id: number;
  title: string;
  description: string;
  place?: string;
  people_involved?: string;
  memory_date?: string;
  photo_url?: string;
  category?: string;
  tags?: string;
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
  title: string;
  description?: string;
  category: string;
  completed: boolean;
}

export interface PatientContextType {
  currentPatientId: string | number;
  patientProfile: PatientProfile;
  familyMembers: FamilyMember[];
  relationships: PersonItem[];
  memories: MemoryItem[];
  places: PlaceItem[];
  routines: RoutineItem[];
  switchPatient: (patientId: string | number) => void;
  updateProfile: (updated: Partial<PatientProfile>) => void;
  updateFamilyMember: (id: string, updated: Partial<FamilyMember>) => void;
  addPerson: (person: Omit<PersonItem, 'id'>) => void;
  addMemory: (memory: Omit<MemoryItem, 'id'>) => void;
  addPlace: (place: Omit<PlaceItem, 'id'>) => void;
  toggleRoutine: (routineId: number) => void;
  clearPatientState: () => void;
  getStorageKey: (key: string) => string;
}

export const DEFAULT_FAMILY_MEMBERS_P1: FamilyMember[] = [
  {
    id: 'patient',
    name: 'Prasad',
    relationship: 'Patient',
    imagePath: '/images/family/patient.jpeg',
    notes: 'Self profile - 74 years old, retired school principal in Shillong.'
  },
  {
    id: 'wife',
    name: 'Sunita',
    relationship: 'Wife',
    imagePath: '/images/family/wife.jpeg',
    notes: 'Coordinates morning tea, daily medications & garden strolls.'
  },
  {
    id: 'son',
    name: 'Ravi',
    relationship: 'Son',
    imagePath: '/images/family/son.jpeg',
    notes: 'Your elder son. Visits every weekend from Guwahati and calls daily.'
  },
  {
    id: 'daughter',
    name: 'Meera',
    relationship: 'Daughter',
    imagePath: '/images/family/daughter.webp',
    notes: 'Your daughter. Lives nearby in Laitumkhrah, Shillong.'
  },
  {
    id: 'brother1',
    name: 'Biren',
    relationship: '1st Brother',
    imagePath: '/images/family/brother-1.jpeg',
    notes: 'Your eldest brother. Retired engineer living in Jorhat.'
  },
  {
    id: 'brother1-wife',
    name: 'Kamla',
    relationship: "1st Brother's Wife",
    imagePath: '/images/family/brother-1-wife.jpeg',
    notes: 'Sister-in-law. Loves baking traditional Pitha sweets.'
  },
  {
    id: 'brother1-son',
    name: 'Arun',
    relationship: "1st Brother's Son",
    imagePath: '/images/family/brother-1-son.jpeg',
    notes: 'Nephew. 14 years old. Loves playing classical guitar.'
  },
  {
    id: 'brother1-daughter',
    name: 'Pooja',
    relationship: "1st Brother's Daughter",
    imagePath: '/images/family/brother-1-daughter.jpeg',
    notes: 'Niece. Studying medical science in Dibrugarh.'
  },
  {
    id: 'brother2',
    name: 'Vikram',
    relationship: '2nd Brother',
    imagePath: '/images/family/brother-2.jpeg',
    notes: 'Your younger brother. Visits during Bihu festival.'
  },
  {
    id: 'brother2-wife',
    name: 'Asha',
    relationship: "2nd Brother's Wife",
    imagePath: '/images/family/brother-2-wife.jpeg',
    notes: 'Younger sister-in-law. Coordinates family video calls.'
  }
];

export const DEFAULT_FAMILY_MEMBERS_P2: FamilyMember[] = [
  {
    id: 'patient',
    name: 'Biren Das',
    relationship: 'Patient',
    imagePath: '/images/family/patient.jpg',
    notes: 'Self profile - 79 years old, retired tea estate supervisor.'
  },
  {
    id: 'daughter',
    name: 'Meera Das',
    relationship: 'Daughter',
    imagePath: '/images/family/daughter.jpg',
    notes: 'Primary caregiver for Biren. Calls every morning.'
  },
  {
    id: 'son',
    name: 'Pritam Das',
    relationship: 'Son',
    imagePath: '/images/family/son.jpg',
    notes: 'Son living in Guwahati. Brings groceries on Saturdays.'
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
  { id: 1, time: '07:30 AM', title: 'Morning BP Medication & Tea', description: 'Take 1 tablet of Amlodipine with warm tea', category: 'Medicine', completed: true },
  { id: 2, time: '08:30 AM', title: 'Gentle Garden Walk', description: '15-minute mild walk in front yard', category: 'Exercise', completed: true },
  { id: 3, time: '11:00 AM', title: 'Cognitive Memory Game', description: 'Complete 1 Memory Match activity on MANAS', category: 'Brain', completed: false }
];

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPatientId, setCurrentPatientId] = useState<string | number>(1);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(DEFAULT_PATIENT_001);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_FAMILY_MEMBERS_P1);
  const [memories, setMemories] = useState<MemoryItem[]>(DEFAULT_MEMORIES_P1);
  const [places, setPlaces] = useState<PlaceItem[]>(DEFAULT_PLACES_P1);
  const [routines, setRoutines] = useState<RoutineItem[]>(DEFAULT_ROUTINES_P1);

  const getStorageKey = (key: string) => `manas:patient:${currentPatientId}:${key}`;

  const loadPatientData = (pid: string | number) => {
    setCurrentPatientId(pid);
    const pidNum = Number(pid);

    if (pidNum === 2) {
      setPatientProfile(DEFAULT_PATIENT_002);
      setFamilyMembers(DEFAULT_FAMILY_MEMBERS_P2);
      setMemories([
        {
          id: 101,
          title: 'Biren Golden Jubilee Anniversary',
          description: 'Celebrating 50 years in Jorhat.',
          place: 'Jorhat, Assam',
          people_involved: 'Kavita, Pritam',
          memory_date: 'December 2023',
          photo_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
          category: 'milestone',
          tags: 'Anniversary, Family'
        }
      ]);
      setPlaces([]);
      setRoutines([
        { id: 101, time: '08:00 AM', title: 'Biren Morning Pills', description: 'Hypertension medicine', category: 'Medicine', completed: false }
      ]);
    } else {
      setPatientProfile(DEFAULT_PATIENT_001);
      setFamilyMembers(DEFAULT_FAMILY_MEMBERS_P1);
      setMemories(DEFAULT_MEMORIES_P1);
      setPlaces(DEFAULT_PLACES_P1);
      setRoutines(DEFAULT_ROUTINES_P1);
    }
  };

  const switchPatient = (pid: string | number) => {
    loadPatientData(pid);
    fetchApi('/voice/reset-context', { method: 'POST' }).catch(() => {});
  };

  const updateProfile = (updated: Partial<PatientProfile>) => {
    setPatientProfile(prev => ({ ...prev, ...updated }));
  };

  const updateFamilyMember = (id: string, updated: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
  };

  const addPerson = (person: Omit<PersonItem, 'id'>) => {
    const newMember: FamilyMember = {
      id: `member_${Date.now()}`,
      name: person.name,
      relationship: person.relationship,
      imagePath: person.photo_url || '/images/family/son.jpg',
      notes: person.notes
    };
    setFamilyMembers(prev => [newMember, ...prev]);
  };

  const addMemory = (memory: Omit<MemoryItem, 'id'>) => {
    const newMemory: MemoryItem = { ...memory, id: Date.now() };
    setMemories(prev => [newMemory, ...prev]);
  };

  const addPlace = (place: Omit<PlaceItem, 'id'>) => {
    const newPlace: PlaceItem = { ...place, id: Date.now() };
    setPlaces(prev => [newPlace, ...prev]);
  };

  const toggleRoutine = (routineId: number) => {
    setRoutines(prev => prev.map(r => r.id === routineId ? { ...r, completed: !r.completed } : r));
  };

  const clearPatientState = () => {
    setPatientProfile(DEFAULT_PATIENT_001);
    setFamilyMembers(DEFAULT_FAMILY_MEMBERS_P1);
    setMemories(DEFAULT_MEMORIES_P1);
    setPlaces(DEFAULT_PLACES_P1);
    setRoutines(DEFAULT_ROUTINES_P1);
  };

  // Convert familyMembers to PersonItem format for backwards compatibility
  const relationships: PersonItem[] = familyMembers.map(m => ({
    id: m.id,
    name: m.name,
    relationship: m.relationship,
    photo_url: m.imagePath,
    notes: m.notes
  }));

  return (
    <PatientContext.Provider
      value={{
        currentPatientId,
        patientProfile,
        familyMembers,
        relationships,
        memories,
        places,
        routines,
        switchPatient,
        updateProfile,
        updateFamilyMember,
        addPerson,
        addMemory,
        addPlace,
        toggleRoutine,
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
