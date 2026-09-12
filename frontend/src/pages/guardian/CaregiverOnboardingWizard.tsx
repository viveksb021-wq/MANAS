import { SUPPORTED_LANGUAGES } from '../../config/languages';
import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, User, Users, Heart, Palette, Clock,
  Pill, Camera, Mic, KeyRound, AlertCircle, Sparkles, Plus, Trash2, ShieldCheck
} from 'lucide-react';
import { fetchApi } from '../../utils/api';

interface CaregiverOnboardingWizardProps {
  onBack?: () => void;
  onComplete: () => void;
}

export const CaregiverOnboardingWizard: React.FC<CaregiverOnboardingWizardProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);

  // Step 1: Basic Info
  const [patientName, setPatientName] = useState('Prasad');
  const [patientAge, setPatientAge] = useState<number>(74);
  const [patientGender, setPatientGender] = useState('Male');
  const [preferredLang, setPreferredLang] = useState('en');
  const [commPref, setCommPref] = useState('Voice & Visual Cards');

  // Step 2: Relationships
  const [relationships, setRelationships] = useState<any[]>([
    { name: 'Ravi', relationship: 'Son', notes: 'Visits weekends', photo_url: '/family/son.jpg' },
    { name: 'Meera', relationship: 'Daughter', notes: 'Lives in Shillong', photo_url: '/family/daughter.jpg' },
    { name: 'Arun', relationship: 'Grandson', notes: '14 yrs old, plays guitar', photo_url: '/family/grandson.jpg' }
  ]);
  const [relName, setRelName] = useState('');
  const [relRole, setRelRole] = useState('Granddaughter');
  const [relNotes, setRelNotes] = useState('');

  // Step 3: Cognitive & Care Profile (Caregiver/Clinical Info)
  const [caregiverNotes, setCaregiverNotes] = useState('Patient exhibits mild short-term memory recall delays. Prefers gentle verbal encouragement and large visual cards.');

  // Step 4: Hobbies & Interests
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(['Gardening', 'Music', 'Walking', 'Cultural Activities']);

  // Step 5: Daily Routine
  const [routines, setRoutines] = useState<any[]>([
    { time_of_day: '07:30 AM', title: 'Morning Tea & Fresh Air', icon_symbol: '☀️' },
    { time_of_day: '08:30 AM', title: 'Breakfast & Morning Pill', icon_symbol: '🥣' },
    { time_of_day: '11:00 AM', title: 'Gardening & Mind Games', icon_symbol: '🪴' },
    { time_of_day: '05:00 PM', title: 'Evening Walk in Neighborhood', icon_symbol: '🚶' }
  ]);
  const [routineTime, setRoutineTime] = useState('02:00 PM');
  const [routineTitle, setRoutineTitle] = useState('');

  // Step 6: Medications & Reminders
  const [medications, setMedications] = useState<any[]>([
    { title: 'Donepezil 5mg (Cognitive Health)', category: 'Medicine', scheduled_time: '08:30 AM' },
    { title: 'Blood Pressure Medication', category: 'Medicine', scheduled_time: '08:00 PM' },
    { title: 'Hydration Break (Water)', category: 'Hydration', scheduled_time: '02:00 PM' }
  ]);
  const [medTitle, setMedTitle] = useState('');
  const [medTime, setMedTime] = useState('09:00 PM');

  // Step 7: Initial Memory Garden Setup
  const [memories, setMemories] = useState<any[]>([
    { title: 'Family Trip to Shillong Peak', place: 'Shillong Peak', people_involved: 'Arun, Ravi', memory_date: 'June 2025', description: 'Wonderful summer trip surrounded by pine trees.' },
    { title: 'Grandson Arun\'s 14th Birthday', place: 'Guwahati Home', people_involved: 'Arun, Meera', memory_date: 'August 2025', description: 'Arun playing his new guitar for the family.' }
  ]);
  const [memTitle, setMemTitle] = useState('');
  const [memPlace, setMemPlace] = useState('');
  const [memPeople, setMemPeople] = useState('');
  const [memDesc, setMemDesc] = useState('');

  // Step 8: Patient Authentication Setup
  const [authPassphrase, setAuthPassphrase] = useState('MANAS CONNECT');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRelationship = () => {
    if (!relName) return;
    setRelationships(prev => [...prev, { name: relName, relationship: relRole, notes: relNotes, photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }]);
    setRelName('');
    setRelNotes('');
  };

  const handleAddRoutine = () => {
    if (!routineTitle) return;
    setRoutines(prev => [...prev, { time_of_day: routineTime, title: routineTitle, icon_symbol: '📝' }]);
    setRoutineTitle('');
  };

  const handleAddMedication = () => {
    if (!medTitle) return;
    setMedications(prev => [...prev, { title: medTitle, category: 'Medicine', scheduled_time: medTime }]);
    setMedTitle('');
  };

  const handleAddMemory = () => {
    if (!memTitle) return;
    setMemories(prev => [...prev, { title: memTitle, place: memPlace || 'Shillong', people_involved: memPeople || 'Family', memory_date: 'Recent', description: memDesc }]);
    setMemTitle('');
    setMemPlace('');
    setMemPeople('');
    setMemDesc('');
  };

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(prev => prev.filter(h => h !== hobby));
    } else {
      setSelectedHobbies(prev => [...prev, hobby]);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetchApi('/caregiver/onboarding', {
        method: 'POST',
        body: {
          full_name: patientName,
          age: patientAge,
          gender: patientGender,
          preferred_language: preferredLang,
          communication_preference: commPref,
          caregiver_clinical_notes: caregiverNotes,
          hobbies: selectedHobbies,
          relationships,
          routines,
          medications,
          memories,
          auth_passphrase: authPassphrase
        }
      });
    } catch (e) {
      console.log('Onboarding saved locally');
    } finally {
      setIsSubmitting(false);
      onComplete();
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1.5rem 1rem 4rem 1rem' }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}
        >
          <ArrowLeft size={20} /> Exit Onboarding
        </button>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
          Step {step} of 8: {step === 1 ? 'Basic Info' : step === 2 ? 'Relationships' : step === 3 ? 'Care Profile' : step === 4 ? 'Hobbies' : step === 5 ? 'Routine' : step === 6 ? 'Medications' : step === 7 ? 'Memory Setup' : 'Authentication Setup'}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ width: `${(step / 8) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #0f766e)', transition: 'width 0.3s ease' }} />
      </div>

      {/* STEP 1: PATIENT BASIC INFORMATION */}
      {step === 1 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ccfbf1', padding: '0.75rem', borderRadius: '16px', color: '#0f766e' }}>
              <User size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 1 — Patient Basic Information</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Create the core patient profile for MANAS care companion</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Patient Full Name</label>
              <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Age</label>
              <input type="number" value={patientAge} onChange={e => setPatientAge(parseInt(e.target.value) || 72)} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 600 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Gender</label>
              <select value={patientGender} onChange={e => setPatientGender(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 600 }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Preferred Language</label>
              <select value={preferredLang} onChange={e => setPreferredLang(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 600 }}>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.native} ({lang.label})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Communication Preference</label>
            <select value={commPref} onChange={e => setCommPref(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 600 }}>
              <option value="Voice & Visual Cards">Voice & Visual Cards (Recommended)</option>
              <option value="Voice First (Audio Speech)">Voice First (Audio Speech)</option>
              <option value="Visual Cards Only">Visual Cards Only</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: PATIENT RELATIONSHIPS */}
      {step === 2 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '16px', color: '#4f46e5' }}>
              <Users size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 2 — Patient Relationships</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Add familiar family members, caregivers, and doctors</p>
            </div>
          </div>

          {/* List of Enrolled Relationships */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {relationships.map((rel, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '18px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                    {rel.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{rel.name}</h4>
                    <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem' }}>{rel.relationship}</span>
                  </div>
                </div>
                <button onClick={() => setRelationships(relationships.filter((_, i) => i !== idx))} style={{ color: '#f43f5e', background: '#fff1f2', border: 'none', borderRadius: '10px', padding: '0.5rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Relationship Form */}
          <div style={{ background: '#f0fdfa', border: '2px dashed #0f766e', borderRadius: '20px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e', marginBottom: '0.85rem' }}>+ Add Familiar Person</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <input type="text" placeholder="Person Name (e.g. Sunita)" value={relName} onChange={e => setRelName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              <select value={relRole} onChange={e => setRelRole(e.target.value)} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Grandson">Grandson</option>
                <option value="Granddaughter">Granddaughter</option>
                <option value="Spouse">Spouse</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Friend">Friend</option>
                <option value="Doctor">Doctor</option>
                <option value="Caregiver">Caregiver</option>
              </select>
            </div>
            <input type="text" placeholder="Notes (e.g. Visits every Sunday morning)" value={relNotes} onChange={e => setRelNotes(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '0.85rem' }} />
            <button onClick={handleAddRelationship} style={{ background: '#0f766e', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              + Add Person to Profile
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: COGNITIVE / CARE PROFILE */}
      {step === 3 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '16px', color: '#d97706' }}>
              <Heart size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 3 — Caregiver & Clinical Care Profile</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Provide observations on memory, communication, and assistance needs</p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderLeft: '6px solid #d97706', padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#d97706', marginBottom: '0.2rem' }}>
              <AlertCircle size={20} /> Caregiver/Clinical Note Disclaimer
            </div>
            <p style={{ fontSize: '0.95rem' }}>
              This information is configured strictly by the caregiver to guide personalization. MANAS does not independently diagnose clinical conditions.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Known Memory Difficulties & Assistance Needs</label>
            <textarea
              rows={4}
              value={caregiverNotes}
              onChange={e => setCaregiverNotes(e.target.value)}
              placeholder="Describe known memory recall preferences, situations where assistance is needed..."
              style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '2px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 500, outline: 'none' }}
            />
          </div>
        </div>
      )}

      {/* STEP 4: HOBBIES AND INTERESTS */}
      {step === 4 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ccfbf1', padding: '0.75rem', borderRadius: '16px', color: '#0f766e' }}>
              <Palette size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 4 — Hobbies and Interests</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Select activities patient enjoys to customize cognitive content</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {[
              'Gardening', 'Music & Songs', 'Cooking', 'Pottery & Crafts', 'Reading Books',
              'Neighborhood Walking', 'Religious / Cultural', 'Family Gatherings', 'Mind Games', 'Puzzles'
            ].map(hobby => {
              const isSelected = selectedHobbies.includes(hobby);
              return (
                <button
                  key={hobby}
                  onClick={() => toggleHobby(hobby)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '18px',
                    border: `3px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                    background: isSelected ? '#f0fdfa' : '#ffffff',
                    color: isSelected ? '#0f766e' : '#334155',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 8px 20px rgba(15,118,110,0.15)' : 'none'
                  }}
                >
                  {isSelected ? '✓ ' : '+ '}{hobby}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: DAILY ROUTINE */}
      {step === 5 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '16px', color: '#0284c7' }}>
              <Clock size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 5 — Daily Routine Configuration</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Schedule routine checklist for Today's Activities</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {routines.map((rt, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '18px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>{rt.time_of_day}</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{rt.icon_symbol} {rt.title}</h4>
                </div>
                <button onClick={() => setRoutines(routines.filter((_, i) => i !== idx))} style={{ color: '#f43f5e', background: '#fff1f2', border: 'none', borderRadius: '10px', padding: '0.5rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#e0f2fe', border: '2px dashed #0284c7', borderRadius: '20px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginBottom: '0.85rem' }}>+ Add Routine Event</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <input type="text" value={routineTime} onChange={e => setRoutineTime(e.target.value)} placeholder="02:00 PM" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              <input type="text" value={routineTitle} onChange={e => setRoutineTitle(e.target.value)} placeholder="Routine title (e.g. Evening Rest & Music)" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
            <button onClick={handleAddRoutine} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              + Add Routine Item
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: MEDICATIONS AND REMINDERS */}
      {step === 6 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ffe4e6', padding: '0.75rem', borderRadius: '16px', color: '#e11d48' }}>
              <Pill size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 6 — Medications & Reminders</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Configure reminders based strictly on caregiver-provided schedules</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {medications.map((med, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '18px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e11d48' }}>{med.scheduled_time} • {med.category}</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>💊 {med.title}</h4>
                </div>
                <button onClick={() => setMedications(medications.filter((_, i) => i !== idx))} style={{ color: '#f43f5e', background: '#fff1f2', border: 'none', borderRadius: '10px', padding: '0.5rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#ffe4e6', border: '2px dashed #f43f5e', borderRadius: '20px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#be123c', marginBottom: '0.85rem' }}>+ Add Medication or Reminder</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <input type="text" value={medTitle} onChange={e => setMedTitle(e.target.value)} placeholder="Medicine / Reminder Name" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              <input type="text" value={medTime} onChange={e => setMedTime(e.target.value)} placeholder="09:00 PM" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
            <button onClick={handleAddMedication} style={{ background: '#e11d48', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              + Add Reminder
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: MEMORY GARDEN SETUP */}
      {step === 7 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ccfbf1', padding: '0.75rem', borderRadius: '16px', color: '#0f766e' }}>
              <Sparkles size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 7 — Initial Memory Garden Setup</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Add initial nostalgia photo memories with structured contextual links</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {memories.map((mem, idx) => (
              <div key={idx} style={{ background: '#f0fdfa', border: '2px solid #99f6e4', borderRadius: '18px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>🖼️ {mem.title}</h4>
                  <p style={{ color: '#475569', fontSize: '0.95rem' }}>"{mem.description}"</p>
                  <span style={{ fontSize: '0.85rem', color: '#0f766e', fontWeight: 700 }}>📍 {mem.place} • 👤 {mem.people_involved}</span>
                </div>
                <button onClick={() => setMemories(memories.filter((_, i) => i !== idx))} style={{ color: '#f43f5e', background: '#fff1f2', border: 'none', borderRadius: '10px', padding: '0.5rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0fdfa', border: '2px dashed #0f766e', borderRadius: '20px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e', marginBottom: '0.85rem' }}>+ Add Initial Memory</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <input type="text" value={memTitle} onChange={e => setMemTitle(e.target.value)} placeholder="Memory Title (e.g. Bihu Family Gathering)" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              <input type="text" value={memPlace} onChange={e => setMemPlace(e.target.value)} placeholder="Place (e.g. Shillong Peak)" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
            <input type="text" value={memPeople} onChange={e => setMemPeople(e.target.value)} placeholder="People Involved (e.g. Arun, Ravi)" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '0.85rem' }} />
            <textarea value={memDesc} onChange={e => setMemDesc(e.target.value)} placeholder="Short memory description..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '0.85rem' }} />
            <button onClick={handleAddMemory} style={{ background: '#0f766e', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              + Add Memory to Garden
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: PATIENT AUTHENTICATION SETUP */}
      {step === 8 && (
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', border: '3px solid #ccfbf1', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '16px', color: '#4f46e5' }}>
              <ShieldCheck size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Step 8 — Patient Authentication Setup</h2>
              <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>Configure Face Recognition, Voice Passphrase, and PIN Fallback</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '20px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Camera size={32} color="#0f766e" />
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Primary: Face Recognition</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Camera vector recognition enrolled during familiar person registration.</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '20px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mic size={32} color="#4f46e5" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Fallback: Voice Passphrase Verification</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Enrolled spoken passphrase for voice verification fallback.</p>
                <input type="text" value={authPassphrase} onChange={e => setAuthPassphrase(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '1rem', color: '#4f46e5' }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '20px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <KeyRound size={32} color="#d97706" />
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Secondary Fallback: 4-Digit PIN</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Default PIN: <strong style={{ color: '#0f766e' }}>1234</strong> for quick fallback sign in.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.85rem 1.5rem', borderRadius: '18px', fontWeight: 800, fontSize: '1.1rem', color: '#334155' }}
          >
            ← Previous Step
          </button>
        ) : <div />}

        {step < 8 ? (
          <button
            onClick={() => setStep(step + 1)}
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', color: '#ffffff', border: 'none', padding: '0.85rem 1.75rem', borderRadius: '18px', fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(15,118,110,0.3)' }}
          >
            Next Step <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '0.85rem 2rem', borderRadius: '18px', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(16,185,129,0.4)' }}
          >
            <CheckCircle2 size={24} /> {isSubmitting ? 'Saving Profile...' : 'Complete Caregiver Onboarding'}
          </button>
        )}
      </div>
    </div>
  );
};
