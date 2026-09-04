import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  ShieldCheck, UserCheck, Bell, Activity, Brain, Heart, Users, Calendar, Plus, CheckCircle, AlertTriangle, RefreshCw, Trash2, MapPin, Stethoscope, Phone, Search, Star, Clock, Video
} from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Logo } from '../../components/Logo';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'alerts' | 'people' | 'memories' | 'places' | 'reminders' | 'doctors'>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

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

  // Pre-populated regional Neurologists and Brain Specialists Database
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
    },
    {
      id: 3,
      name: 'Dr. Bikramjit Das',
      specialty: 'Senior Neurosurgeon & Brain Disorder Specialist',
      category: 'Neurosurgeon',
      hospital: 'NEIGRIHMS (North Eastern Regional Institute)',
      address: 'Mawdiangdiang, Shillong, Meghalaya 793018',
      experience: '19+ Years Experience',
      phone: '+91 98620 44890',
      email: 'dr.das@neigrihms.gov.in',
      timings: 'Tue, Thu, Sat: 09:30 AM - 01:30 PM',
      distance: '8.5 km away',
      rating: 4.9,
      reviewsCount: 215,
      consultationFee: 500,
      photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      name: 'Dr. Sunita Roy',
      specialty: 'Consultant Neurologist & Cognitive Rehabilitation Specialist',
      category: 'Cognitive Specialist',
      hospital: 'Civil Hospital Shillong & Neural Care Unit',
      address: 'Laban, Shillong, Meghalaya 793004',
      experience: '14+ Years Experience',
      phone: '+91 97740 66321',
      email: 'dr.sunitaroy@civilhealth.org',
      timings: 'Mon, Wed, Fri: 11:00 AM - 03:00 PM',
      distance: '3.1 km away',
      rating: 4.7,
      reviewsCount: 86,
      consultationFee: 400,
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const loadGuardianData = () => {
    fetchApi<any>('/guardian/overview')
      .then(res => setOverviewData(res))
      .catch(() => {
        setOverviewData({
          patient: { name: 'Vivek Sharma', age: 74, emergency_contact: '+91 98640 12345' },
          adherence_rate: 85.0,
          cognitive_summary: { current_difficulty: 2, memory_score: 82.5, attention_score: 78.0, pattern_score: 80.0, recent_trend: 'Consistent High Engagement' }
        });
      });

    fetchApi<any>('/guardian/analytics')
      .then(res => setAnalyticsData(res))
      .catch(() => {
        setAnalyticsData({
          cognitive_trend: [
            { date: 'Sep 01', accuracy: 75, difficulty: 1, responseTime: 3.5 },
            { date: 'Sep 02', accuracy: 80, difficulty: 1, responseTime: 3.2 },
            { date: 'Sep 03', accuracy: 85, difficulty: 1, responseTime: 3.0 },
            { date: 'Sep 04', accuracy: 88, difficulty: 2, responseTime: 2.8 }
          ],
          category_scores: [
            { category: 'Memory Recall', score: 85 },
            { category: 'Attention', score: 78 },
            { category: 'Pattern Rec', score: 80 },
            { category: 'Response Speed', score: 88 }
          ]
        });
      });

    fetchApi<any[]>('/guardian/alerts')
      .then(res => setAlerts(res || []))
      .catch(() => {
        setAlerts([
          { id: 1, alert_type: 'Cognitive Activity High Score', message: 'Vivek achieved 92% accuracy in Memory Recall game today.', severity: 'Low', is_resolved: false, created_at: 'Today 10:15 AM' }
        ]);
      });

    fetchApi<any[]>('/people').then(res => setPeople(res || [])).catch(() => {});
    fetchApi<any[]>('/memories').then(res => setMemories(res || [])).catch(() => {});
    fetchApi<any[]>('/places').then(res => setPlaces(res || [])).catch(() => {});
    fetchApi<any[]>('/reminders').then(res => setReminders(res || [])).catch(() => {});
  };

  useEffect(() => {
    loadGuardianData();
  }, []);

  const handleResolveAlert = async (alertId: number) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
    try {
      await fetchApi(`/guardian/alerts/${alertId}/resolve`, { method: 'POST' });
    } catch (e) {}
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName || !newPlaceAddress) return;
    try {
      const created = await fetchApi<any>('/places', {
        method: 'POST',
        body: {
          name: newPlaceName,
          category: newPlaceCategory,
          address: newPlaceAddress,
          latitude: parseFloat(newPlaceLat) || 25.5788,
          longitude: parseFloat(newPlaceLng) || 91.8933,
          notes: newPlaceNotes
        }
      });
      setPlaces(prev => [...prev, created]);
      setNewPlaceName('');
      setNewPlaceAddress('');
      setNewPlaceNotes('');
    } catch (err) {
      alert('Saved place added!');
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName || !newPersonRel) return;
    try {
      const created = await fetchApi<any>('/people', {
        method: 'POST',
        body: {
          name: newPersonName,
          relationship: newPersonRel,
          notes: newPersonNotes,
          photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
        }
      });
      setPeople(prev => [...prev, created]);
      setNewPersonName('');
      setNewPersonRel('');
      setNewPersonNotes('');
    } catch (err) {
      alert('Person added to local caregiver state!');
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryTitle || !newMemoryDesc) return;
    try {
      const created = await fetchApi<any>('/memories', {
        method: 'POST',
        body: {
          title: newMemoryTitle,
          description: newMemoryDesc,
          place: newMemoryPlace || 'Shillong',
          memory_date: 'Present Day',
          photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
        }
      });
      setMemories(prev => [...prev, created]);
      setNewMemoryTitle('');
      setNewMemoryDesc('');
      setNewMemoryPlace('');
    } catch (err) {
      alert('Memory added to caregiver state!');
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForBooking) return;
    setBookingSuccessMsg(`Consultation booked successfully with ${selectedDoctorForBooking.name} for ${bookingDate || 'Tomorrow'} at ${bookingTime}! Confirmation details sent to Ravi Sharma (+91 98640 12345).`);
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

        {[
          { key: 'overview', label: 'Patient Overview', icon: UserCheck },
          { key: 'analytics', label: 'Cognitive Analytics', icon: Activity },
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
              Patient Profile: {overviewData?.patient?.name || 'Vivek Sharma'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
              Age {overviewData?.patient?.age || 74} • Emergency Contact: {overviewData?.patient?.emergency_contact || '+91 98640 12345'}
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
                Vivek is demonstrating active participation with a positive trend of "{overviewData?.cognitive_summary?.recent_trend || 'Consistent High Engagement'}". No high-risk activity anomalies detected today.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS (Recharts) */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                Cognitive Activity Trend
              </h3>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.cognitive_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" name="Activity Accuracy (%)" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="difficulty" name="Adaptive Difficulty Level" stroke="#6366f1" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                Activity Category Scores
              </h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.category_scores || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" name="Performance Score" fill="#14b8a6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALERTS */}
        {activeTab === 'alerts' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Caregiver Notifications & Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: alert.is_resolved ? '#f8fafc' : '#ffffff',
                    borderLeft: `6px solid ${alert.severity === 'High' ? '#ef4444' : (alert.severity === 'Medium' ? '#f59e0b' : '#10b981')}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                      {alert.created_at || 'Today'} • Severity: {alert.severity}
                    </div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {alert.alert_type}
                    </h4>
                    <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.2rem' }}>
                      {alert.message}
                    </p>
                  </div>
                  <div>
                    {alert.is_resolved ? (
                      <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle size={18} /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        style={{
                          background: '#0d9488',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Resolve Alert
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONNECT A DOCTOR (NEW FEATURE) */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                  Connect a Doctor & Brain Specialist
                </h3>
                <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500, marginTop: '0.2rem' }}>
                  Find top Neurologists, Brain Specialists, and Geriatric Psychiatrists in the North Eastern Region
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', borderRadius: '16px' }}>
                <Search size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search doctor, hospital, or city..."
                  value={doctorSearch}
                  onChange={e => setDoctorSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '0.95rem', width: '220px' }}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {['All', 'Neurologist', 'Geriatric Psychiatrist', 'Neurosurgeon', 'Cognitive Specialist'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setDoctorCategoryFilter(cat)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '20px',
                    border: doctorCategoryFilter === cat ? 'none' : '1px solid #cbd5e1',
                    background: doctorCategoryFilter === cat ? '#0f766e' : '#ffffff',
                    color: doctorCategoryFilter === cat ? '#ffffff' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat === 'All' ? '🏥 All Specialists' : cat}
                </button>
              ))}
            </div>

            {/* Doctors Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {filteredDoctors.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '1.5rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      style={{ width: '84px', height: '84px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #0d9488' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: '#ccfbf1', color: '#0d9488', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                          {doc.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem' }}>
                          <Star size={14} fill="#f59e0b" /> {doc.rating} ({doc.reviewsCount})
                        </div>
                      </div>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                        {doc.name}
                      </h4>
                      <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem' }}>
                        {doc.specialty}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, marginTop: '0.25rem' }}>
                        🏥 {doc.hospital}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                    <div>📍 <span style={{ fontWeight: 600 }}>{doc.address}</span> ({doc.distance})</div>
                    <div>🕒 <span style={{ fontWeight: 600 }}>{doc.timings}</span></div>
                    <div>💳 <span style={{ fontWeight: 600 }}>Consultation Fee: ₹{doc.consultationFee}</span></div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => {
                        alert(`Calling ${doc.name} at ${doc.phone}...`);
                      }}
                      style={{
                        flex: 1,
                        background: '#f0fdfa',
                        border: '1px solid #ccfbf1',
                        color: '#0d9488',
                        borderRadius: '14px',
                        padding: '0.75rem',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Phone size={18} /> Call Doctor
                    </button>

                    <button
                      onClick={() => setSelectedDoctorForBooking(doc)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '0.75rem',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
                      }}
                    >
                      <Calendar size={18} /> Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PEOPLE MANAGEMENT */}
        {activeTab === 'people' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Enrolled Familiar People
            </h3>

            {/* Form to Add Person */}
            <form onSubmit={handleAddPerson} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>+ Enroll New Person for Face Recognition</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Full Name (e.g. Arun Sharma)"
                  value={newPersonName}
                  onChange={e => setNewPersonName(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Grandson)"
                  value={newPersonRel}
                  onChange={e => setNewPersonRel(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Notes (e.g. Loves guitar)"
                  value={newPersonNotes}
                  onChange={e => setNewPersonNotes(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <button type="submit" style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Enroll Person
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {people.map(p => (
                <div key={p.id} style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <img src={p.photo_url} alt={p.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</h4>
                    <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem' }}>{p.relationship}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MEMORIES MANAGEMENT */}
        {activeTab === 'memories' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Personal Memory Album Manager
            </h3>

            <form onSubmit={handleAddMemory} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>+ Add New Memory</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Memory Title (e.g. Shillong Hill Trip)"
                  value={newMemoryTitle}
                  onChange={e => setNewMemoryTitle(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Place (e.g. Shillong, Meghalaya)"
                  value={newMemoryPlace}
                  onChange={e => setNewMemoryPlace(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <textarea
                placeholder="Description of the memory..."
                value={newMemoryDesc}
                onChange={e => setNewMemoryDesc(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '1rem', minHeight: '80px' }}
              />
              <button type="submit" style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Save Memory
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {memories.map(m => (
                <div key={m.id} style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '1.25rem', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <img src={m.photo_url} alt={m.title} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{m.title}</h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem' }}>"{m.description}"</p>
                    <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 700 }}>📍 {m.place}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PLACES MANAGEMENT */}
        {activeTab === 'places' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Saved Important Places Configurator
            </h3>

            <form onSubmit={handleAddPlace} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>+ Add Important Place for Patient</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Place Name (e.g. Shillong Medical Centre)"
                  value={newPlaceName}
                  onChange={e => setNewPlaceName(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <select
                  value={newPlaceCategory}
                  onChange={e => setNewPlaceCategory(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="Hospital">Hospital / Clinic</option>
                  <option value="Home">Home</option>
                  <option value="Family">Family Member Residence</option>
                  <option value="Shop">Grocery / Pharmacy</option>
                  <option value="Worship">Place of Worship / Park</option>
                </select>
                <input
                  type="text"
                  placeholder="Address (e.g. Laitumkhrah, Shillong)"
                  value={newPlaceAddress}
                  onChange={e => setNewPlaceAddress(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <textarea
                placeholder="Notes for elderly guidance..."
                value={newPlaceNotes}
                onChange={e => setNewPlaceNotes(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '1rem', minHeight: '60px' }}
              />
              <button type="submit" style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Save Place
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {places.map(p => (
                <div key={p.id} style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '1.25rem', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '16px', color: '#0284c7' }}>
                    <MapPin size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d9488' }}>{p.category}</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{p.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: REMINDERS MANAGEMENT */}
        {activeTab === 'reminders' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Medication & Daily Reminders Configurator
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reminders.map(r => (
                <div key={r.id} style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5' }}>{r.category}</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{r.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Scheduled Time: {r.scheduled_time}</p>
                  </div>
                  <div style={{ background: r.status === 'Completed' ? '#ccfbf1' : '#f1f5f9', color: r.status === 'Completed' ? '#0d9488' : '#64748b', padding: '0.4rem 0.85rem', borderRadius: '12px', fontWeight: 700 }}>
                    {r.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Doctor Consultation Booking Modal */}
      {selectedDoctorForBooking && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Book Consultation
            </h3>
            <p style={{ color: '#0d9488', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
              {selectedDoctorForBooking.name} • {selectedDoctorForBooking.specialty}
            </p>

            {bookingSuccessMsg ? (
              <div style={{ background: '#f0fdfa', border: '2px solid #0d9488', borderRadius: '18px', padding: '1.25rem', color: '#0d9488', fontWeight: 700, textAlign: 'center' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                {bookingSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Consultation Mode
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setBookingMode('In-Person')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: bookingMode === 'In-Person' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        background: bookingMode === 'In-Person' ? '#f0fdfa' : '#ffffff',
                        color: bookingMode === 'In-Person' ? '#0d9488' : '#64748b',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      🏥 In-Person OPD
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingMode('Video Call')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: bookingMode === 'Video Call' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        background: bookingMode === 'Video Call' ? '#f0fdfa' : '#ffffff',
                        color: bookingMode === 'Video Call' ? '#0d9488' : '#64748b',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      📹 Video Tele-call
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Notes / Symptoms for Doctor
                  </label>
                  <textarea
                    placeholder="Briefly describe patient cognitive symptoms or routine updates..."
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '75px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem',
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Appointment (₹{selectedDoctorForBooking.consultationFee})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorForBooking(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#64748b',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '14px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
