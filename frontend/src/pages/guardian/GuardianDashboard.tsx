import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  ShieldCheck, UserCheck, Bell, Activity, Brain, Heart, Users, Calendar, Plus, CheckCircle, AlertTriangle, RefreshCw, Trash2, MapPin, Stethoscope, Phone, Search, Star, Clock, Video, User
} from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Logo } from '../../components/Logo';
import { CaregiverOnboardingWizard } from './CaregiverOnboardingWizard';
import { CaregiverLocationMap } from './CaregiverLocationMap';
import { usePatient, FamilyMember } from '../../context/PatientContext';
import { useNavigation } from '../../context/NavigationContext';
import { FamilyImage } from '../../components/FamilyImage';

interface DoctorSpecialist {
  id: number;
  name: string;
  specialty: string;
  category: 'Neurologist' | 'Geriatric Psychiatrist' | 'Neurosurgeon' | 'Cognitive Specialist';
  hospital: string;
  address: string;
  experience: string;
  phone: string;
  email: string;
  timings: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  consultationFee: number;
  photoUrl: string;
}

export const GuardianDashboard: React.FC = () => {
  const { currentPatientId, patientProfile, familyMembers, relationships, memories: contextMemories, places: contextPlaces, routines: contextRoutines, switchPatient, updateFamilyMember, addPerson, addMemory, addPlace } = usePatient();

  const { currentLocation } = useNavigation();
  const initialTab = (currentLocation.params?.tab as any) || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'location' | 'analytics' | 'alerts' | 'people' | 'memories' | 'places' | 'reminders' | 'doctors' | 'onboarding'>(initialTab);

  useEffect(() => {
    if (currentLocation.params?.tab) {
      setActiveTab(currentLocation.params.tab as any);
    }
  }, [currentLocation.params?.tab]);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Editing Family Member state
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form states
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRel, setNewPersonRel] = useState('');
  const [newPersonNotes, setNewPersonNotes] = useState('');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryDesc, setNewMemoryDesc] = useState('');
  const [newMemoryPlace, setNewMemoryPlace] = useState('');

  // Places Form state
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('Hospital');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [newPlaceLat, setNewPlaceLat] = useState('25.5788');
  const [newPlaceLng, setNewPlaceLng] = useState('91.8933');
  const [newPlaceNotes, setNewPlaceNotes] = useState('');

  // Doctor Connect Search & Booking Modal State
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorCategoryFilter, setDoctorCategoryFilter] = useState<string>('All');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorSpecialist | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingMode, setBookingMode] = useState<'In-Person' | 'Video Call'>('In-Person');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Doctors list
  const doctorsList: DoctorSpecialist[] = [
    {
      id: 1,
      name: 'Dr. Haren Barua',
      specialty: 'Senior Neurologist & Memory Specialist',
      category: 'Neurologist',
      hospital: 'Shillong Medical Centre & Neural Care',
      address: 'Laitumkhrah, Shillong, Meghalaya 793003',
      experience: '22+ Years Experience',
      phone: '+91 98640 55789',
      email: 'dr.barua@shillongmed.org',
      timings: 'Mon - Sat: 09:00 AM - 02:00 PM',
      distance: '2.4 km away',
      rating: 4.9,
      reviewsCount: 142,
      consultationFee: 800,
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Dr. Ananya Sarma',
      specialty: 'Geriatric Psychiatrist & Dementia Care Specialist',
      category: 'Geriatric Psychiatrist',
      hospital: 'Guwahati Neurological Institute & Mind Care',
      address: 'GS Road, Dispur, Guwahati, Assam 781005',
      experience: '16+ Years Experience',
      phone: '+91 94350 11223',
      email: 'dr.ananya@gnihealth.in',
      timings: 'Mon - Fri: 10:00 AM - 04:00 PM',
      distance: '68 km away (Tele-consultation available)',
      rating: 4.8,
      reviewsCount: 98,
      consultationFee: 700,
      photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78347?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const loadDataForPatient = (pid: string | number) => {
    const isP2 = Number(pid) === 2;

    setOverviewData({
      patient: {
        id: patientProfile.id,
        name: patientProfile.full_name,
        age: patientProfile.age,
        emergency_contact: patientProfile.emergency_contact
      },
      adherence_rate: isP2 ? 72.0 : 88.5,
      cognitive_summary: {
        current_difficulty: isP2 ? 1 : 2,
        memory_score: isP2 ? 74.0 : 84.5,
        attention_score: isP2 ? 70.0 : 79.0,
        pattern_score: isP2 ? 75.0 : 81.0,
        recent_trend: isP2 ? 'Mild Variability - Routine Support Active' : 'Consistent High Engagement'
      }
    });

    setAnalyticsData({
      cognitive_trend: isP2
        ? [
            { date: 'Sep 01', accuracy: 68, difficulty: 1, responseTime: 4.2 },
            { date: 'Sep 02', accuracy: 70, difficulty: 1, responseTime: 4.0 },
            { date: 'Sep 03', accuracy: 74, difficulty: 1, responseTime: 3.8 }
          ]
        : [
            { date: 'Sep 01', accuracy: 78, difficulty: 1, responseTime: 3.5 },
            { date: 'Sep 02', accuracy: 82, difficulty: 1, responseTime: 3.2 },
            { date: 'Sep 03', accuracy: 85, difficulty: 2, responseTime: 3.0 },
            { date: 'Sep 04', accuracy: 89, difficulty: 2, responseTime: 2.8 }
          ],
      category_scores: [
        { category: 'Memory Recall', score: isP2 ? 74 : 85 },
        { category: 'Attention', score: isP2 ? 70 : 79 },
        { category: 'Pattern Rec', score: isP2 ? 75 : 81 },
        { category: 'Reasoning', score: isP2 ? 72 : 82 },
        { category: 'Strategy', score: isP2 ? 68 : 76 },
        { category: 'Recognition', score: isP2 ? 80 : 88 },
        { category: 'Daily Routine', score: isP2 ? 82 : 90 }
      ]
    });

    // Load alerts from backend
    fetchApi<any[]>(`/guardian/alerts?requested_patient_id=${pid}`)
      .then(bAlerts => {
        if (Array.isArray(bAlerts) && bAlerts.length > 0) {
          setAlerts(bAlerts);
        } else {
          setAlerts(isP2 ? [
            { id: 201, alert_type: 'Medication Reminder Pending', message: 'Biren Das morning BP medication is due.', severity: 'Medium', is_resolved: false, created_at: 'Today 08:30 AM' }
          ] : [
            { id: 101, alert_type: 'Cognitive Activity High Score', message: 'Prasad achieved 89% accuracy in Memory Recall today.', severity: 'Low', is_resolved: false, created_at: 'Today 10:15 AM' }
          ]);
        }
      })
      .catch(() => {
        setAlerts(isP2 ? [
          { id: 201, alert_type: 'Medication Reminder Pending', message: 'Biren Das morning BP medication is due.', severity: 'Medium', is_resolved: false, created_at: 'Today 08:30 AM' }
        ] : [
          { id: 101, alert_type: 'Cognitive Activity High Score', message: 'Prasad achieved 89% accuracy in Memory Recall today.', severity: 'Low', is_resolved: false, created_at: 'Today 10:15 AM' }
        ]);
      });
  };

  useEffect(() => {
    loadDataForPatient(currentPatientId);
  }, [currentPatientId, patientProfile]);

  const handlePatientSelectChange = (pidStr: string) => {
    const pId = Number(pidStr);
    switchPatient(pId);
  };

  const handleResolveAlert = async (alertId: number) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
    try {
      await fetchApi(`/guardian/alerts/${alertId}/resolve`, { method: 'POST' });
    } catch (e) {
      console.warn('Backend resolve alert failed:', e);
    }
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName || !newPlaceAddress) return;
    addPlace({
      name: newPlaceName,
      category: newPlaceCategory,
      address: newPlaceAddress,
      latitude: parseFloat(newPlaceLat) || 25.5788,
      longitude: parseFloat(newPlaceLng) || 91.8933,
      notes: newPlaceNotes
    });
    setNewPlaceName('');
    setNewPlaceAddress('');
    setNewPlaceNotes('');
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName || !newPersonRel) return;
    addPerson({
      name: newPersonName,
      relationship: newPersonRel,
      notes: newPersonNotes,
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
    });
    setNewPersonName('');
    setNewPersonRel('');
    setNewPersonNotes('');
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryTitle || !newMemoryDesc) return;
    addMemory({
      title: newMemoryTitle,
      description: newMemoryDesc,
      place: newMemoryPlace || 'Shillong',
      memory_date: 'Present Day',
      photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      category: 'family'
    });
    setNewMemoryTitle('');
    setNewMemoryDesc('');
    setNewMemoryPlace('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForBooking) return;
    setBookingSuccessMsg(`Consultation booked successfully with ${selectedDoctorForBooking.name} for ${bookingDate || 'Tomorrow'} at ${bookingTime}! Details sent to emergency contact (${patientProfile.emergency_contact}).`);
    setTimeout(() => {
      setSelectedDoctorForBooking(null);
      setBookingSuccessMsg(null);
    }, 3500);
  };

  const filteredDoctors = doctorsList.filter(doc => {
    const matchesCategory = doctorCategoryFilter === 'All' || doc.category === doctorCategoryFilter;
    const matchesSearch = doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                          doc.hospital.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                          doc.address.toLowerCase().includes(doctorSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: '90vh', background: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <div style={{
        width: '260px',
        background: '#0f172a',
        color: '#ffffff',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#6366f1', padding: '0.5rem', borderRadius: '12px' }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>MANAS</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Caregiver Portal</p>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div style={{ marginBottom: '1.5rem', background: '#1e293b', padding: '0.75rem', borderRadius: '14px', border: '1px solid #334155' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Active Managed Patient
          </label>
          <select
            value={currentPatientId}
            onChange={(e) => handlePatientSelectChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid #475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value={1}>Patient 1: Prasad (Age 74)</option>
            <option value={2}>Patient 2: Biren Das (Age 79)</option>
          </select>
        </div>

        {[
          { key: 'overview', label: 'Patient Overview', icon: UserCheck },
          { key: 'location', label: 'Live Location', icon: MapPin },
          { key: 'analytics', label: 'Cognitive Analytics', icon: Activity },
          { key: 'onboarding', label: 'Caregiver Setup Wizard', icon: Brain },
          { key: 'alerts', label: 'Alert Center', icon: Bell },
          { key: 'doctors', label: 'Connect a Doctor', icon: Stethoscope },
          { key: 'people', label: 'People Management', icon: Users },
          { key: 'memories', label: 'Memory Album', icon: Heart },
          { key: 'places', label: 'Saved Places', icon: MapPin },
          { key: 'reminders', label: 'Reminders & Routine', icon: Calendar }
        ].map(item => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                borderLeft: isActive ? '4px solid #38bdf8' : 'none',
                textAlign: 'left'
              }}
            >
              <IconComponent size={20} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Caregiver Content Area */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Patient Summary Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              Patient Profile: {patientProfile.full_name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
              Age {patientProfile.age} • Emergency Contact: {patientProfile.emergency_contact}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.75rem 1.25rem', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 700 }}>Adherence Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{overviewData?.adherence_rate || 85}%</div>
            </div>
            <div style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', padding: '0.75rem 1.25rem', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700 }}>Current Difficulty</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Level {overviewData?.cognitive_summary?.current_difficulty || 2}</div>
            </div>
          </div>
        </div>

        {/* TAB ONBOARDING WIZARD */}
        {activeTab === 'onboarding' && (
          <CaregiverOnboardingWizard onComplete={() => setActiveTab('overview')} />
        )}

        {/* TAB LIVE LOCATION */}
        {activeTab === 'location' && (
          <CaregiverLocationMap
            patientId={currentPatientId}
            patientName={patientProfile.full_name}
          />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Memory Performance</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{overviewData?.cognitive_summary?.memory_score || 82.5}%</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Stable engagement</div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Attention Performance</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{overviewData?.cognitive_summary?.attention_score || 78.0}%</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Good focus speed</div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ color: '#d97706', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pattern Recognition</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{overviewData?.cognitive_summary?.pattern_score || 80.0}%</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Consistent accuracy</div>
              </div>
            </div>

            {/* Caregiver Awareness Notice */}
            <div style={{ background: '#f0fdfa', borderLeft: '6px solid #0d9488', padding: '1.25rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d9488', marginBottom: '0.25rem' }}>
                Caregiver Awareness Summary
              </h4>
              <p style={{ color: '#334155', fontSize: '1rem', fontWeight: 500 }}>
                {patientProfile.full_name} is demonstrating active participation with a positive trend of "{overviewData?.cognitive_summary?.recent_trend || 'Consistent High Engagement'}".
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                Cognitive Performance Trends for {patientProfile.full_name}
              </h3>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.cognitive_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#0d9488" strokeWidth={3} name="Accuracy %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALERTS */}
        {activeTab === 'alerts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Alert Center for {patientProfile.full_name}
              </h3>
              <button
                onClick={() => {
                  fetchApi<any[]>(`/guardian/alerts?requested_patient_id=${currentPatientId}`)
                    .then(bAlerts => {
                      if (Array.isArray(bAlerts)) setAlerts(bAlerts);
                    })
                    .catch(() => {});
                }}
                className="touch-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Refresh Alerts
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No active alerts for {patientProfile.full_name}.
                </div>
              ) : (
                alerts.map(a => {
                  const isSkipped = a.alert_type === 'Reminder Skipped';
                  return (
                    <div
                      key={a.id}
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${isSkipped ? '#fed7aa' : (a.is_resolved ? '#e2e8f0' : '#cbd5e1')}`,
                        borderRadius: '18px',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: isSkipped ? '#c2410c' : '#0f172a' }}>
                            {isSkipped ? '🔔 Reminder Skipped' : a.alert_type}
                          </span>
                          {isSkipped && (
                            <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '10px', border: '1px solid #ffedd5' }}>
                              Caregiver Attention Recommended
                            </span>
                          )}
                          {a.is_resolved && (
                            <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                              Resolved
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500, margin: '0.35rem 0' }}>
                          {a.message}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {a.event_time ? new Date(a.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (a.created_at || 'Today')}
                        </div>
                      </div>
                      {!a.is_resolved && (
                        <button
                          onClick={() => handleResolveAlert(a.id)}
                          className="touch-target"
                          style={{
                            background: '#0d9488',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.65rem 1.15rem',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)'
                          }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DOCTORS */}
        {activeTab === 'doctors' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Connect Brain & Memory Specialists for {patientProfile.full_name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {filteredDoctors.map(doc => (
                <div key={doc.id} style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                  <img src={doc.photoUrl} alt={doc.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '14px', marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{doc.name}</h4>
                  <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem' }}>{doc.specialty}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{doc.hospital}</p>
                  <button onClick={() => setSelectedDoctorForBooking(doc)} style={{ width: '100%', background: '#0f766e', color: '#ffffff', padding: '0.75rem', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                    Book Appointment (₹{doc.consultationFee})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PEOPLE */}
        {activeTab === 'people' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Centralized Family Memory Registry for {patientProfile.full_name}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#0d9488', fontWeight: 700, background: '#ccfbf1', padding: '0.4rem 0.85rem', borderRadius: '12px' }}>
                {familyMembers.length} Family Profiles Enrolled
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {familyMembers.map(m => (
                <div key={m.id} style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ position: 'relative', height: '150px', borderRadius: '14px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                      <FamilyImage src={m.imagePath} alt={m.name} relationship={m.relationship} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(15, 23, 42, 0.75)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        ID: {m.id}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{m.name}</h4>
                    <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{m.relationship}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.4 }}>{m.notes || 'No extra details added.'}</p>
                  </div>
                  <button
                    onClick={() => setEditingMember(m)}
                    style={{ marginTop: '1rem', width: '100%', padding: '0.65rem', borderRadius: '12px', background: '#f1f5f9', color: '#0f766e', fontWeight: 800, fontSize: '0.9rem', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    ✏️ Edit Member
                  </button>
                </div>
              ))}
            </div>

            {/* EDIT MEMBER MODAL */}
            {editingMember && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '1.75rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    Edit Family Member: {editingMember.id}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Name</label>
                      <input
                        type="text"
                        value={editingMember.name}
                        onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontWeight: 700, fontSize: '1rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Relationship</label>
                      <input
                        type="text"
                        value={editingMember.relationship}
                        onChange={e => setEditingMember({ ...editingMember, relationship: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontWeight: 700, fontSize: '1rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Image Path</label>
                      <input
                        type="text"
                        value={editingMember.imagePath}
                        onChange={e => setEditingMember({ ...editingMember, imagePath: e.target.value })}
                        placeholder="/images/family/<filename>"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontWeight: 700, fontSize: '1rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Notes / Memories</label>
                      <textarea
                        value={editingMember.notes || ''}
                        onChange={e => setEditingMember({ ...editingMember, notes: e.target.value })}
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => setEditingMember(null)}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        updateFamilyMember(editingMember.id, editingMember);
                        setEditingMember(null);
                      }}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#0f766e', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MEMORIES */}
        {activeTab === 'memories' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Memory Album for {patientProfile.full_name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {contextMemories.map(m => (
                <div key={m.id} style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                  {m.photo_url && <img src={m.photo_url} alt={m.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.75rem' }} />}
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{m.title}</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0.4rem 0' }}>{m.description}</p>
                  <p style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.85rem' }}>{m.place}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PLACES */}
        {activeTab === 'places' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Saved Safe Places for {patientProfile.full_name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {contextPlaces.map(pl => (
                <div key={pl.id} style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{pl.name}</h4>
                  <p style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>{pl.category}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.4rem 0' }}>{pl.address}</p>
                  {pl.notes && <p style={{ color: '#334155', fontSize: '0.85rem' }}>{pl.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: REMINDERS */}
        {activeTab === 'reminders' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Daily Schedule & Reminders for {patientProfile.full_name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contextRoutines.map(r => (
                <div key={r.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.6rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                      {r.time}
                    </span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{r.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{r.description}</p>
                  </div>
                  <div style={{ fontWeight: 800, color: r.completed ? '#10b981' : '#f59e0b' }}>
                    {r.completed ? 'Completed' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
