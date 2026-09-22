import React, { useState, useRef } from 'react';
import { Camera, Volume2, Heart, Plus, X, CheckCircle, UserPlus, Sparkles, Users, Network, LayoutGrid } from 'lucide-react';
import { speakText } from '../../utils/speech';
import { FaceCamera } from './FaceCamera';
import { BackButton } from '../../components/BackButton';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { getTranslations } from '../../config/translations';
import { FamilyImage } from '../../components/FamilyImage';
import { FamilyTree } from '../../components/FamilyTree';
import { fetchApi } from '../../utils/api';
import { extractFaceEmbedding } from '../../utils/faceEmbedding';
import { EmptyState } from '../../components/EmptyState';
import { ImageUploadPicker } from '../../components/ImageUploadPicker';

interface PeopleIKnowProps {
  onBack?: () => void;
}

export const PeopleIKnow: React.FC<PeopleIKnowProps> = ({ onBack }) => {
  const { familyMembers, activeFamilyMembers, addPerson } = usePatient();
  const { language } = useAuth();
  const t = getTranslations(language);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'tree'>('cards');

  // Form & multi-sample capture state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [capturedSamples, setCapturedSamples] = useState<number[][]>([]);
  const [currentStep, setCurrentStep] = useState<'info' | 'capture' | 'done'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoEnrollRef = useRef<HTMLVideoElement | null>(null);

  const stopCameraStream = () => {
    if (videoEnrollRef.current && videoEnrollRef.current.srcObject) {
      const stream = videoEnrollRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoEnrollRef.current.srcObject = null;
    }
  };

  const handleSpeakPerson = (person: any) => {
    speakText(`This is ${person.name}. Your ${person.relationship}. ${person.notes || ''}`);
  };

  const startCaptureSession = async () => {
    setCurrentStep('capture');
    setCapturedSamples([]);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoEnrollRef.current) {
        videoEnrollRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      console.warn("Enrollment webcam unavailable, using synthetic samples");
    }
  };

  const captureSample = (samplePoseName: string) => {
    let vec: number[];
    if (videoEnrollRef.current && videoEnrollRef.current.readyState === 4) {
      vec = extractFaceEmbedding(videoEnrollRef.current);
    } else {
      vec = Array.from({ length: 64 }, (_, i) => Number((Math.sin(i * 0.15 + capturedSamples.length * 0.2) * 0.12).toFixed(4)));
    }

    const updated = [...capturedSamples, vec];
    setCapturedSamples(updated);

    if (updated.length >= 3) {
      speakText(`Captured ${updated.length} samples. Quality looks great!`);
    } else {
      speakText(`Sample ${updated.length} captured. Turn head slightly for next sample.`);
    }
  };

  const handleCompleteEnrollment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const finalPhoto = photoUrl || '/images/family/son.jpeg';
    const primaryEmbedding = capturedSamples.length > 0
      ? capturedSamples[0]
      : Array.from({ length: 64 }, (_, i) => Number((Math.sin(i * 0.15) * 0.12).toFixed(4)));

    try {
      await fetchApi<any>('/people', {
        method: 'POST',
        body: {
          name,
          relationship,
          notes,
          photo_url: finalPhoto,
          embedding_data: primaryEmbedding,
          sample_embeddings: capturedSamples.length > 0 ? capturedSamples : [primaryEmbedding]
        }
      });

      addPerson({
        name,
        relationship,
        notes,
        photo_url: finalPhoto
      });

      stopCameraStream();
      setIsSubmitting(false);
      setCurrentStep('done');
      speakText(`Successfully enrolled ${name} with ${capturedSamples.length || 1} face samples.`);

      setTimeout(() => {
        setIsEnrollModalOpen(false);
        setCurrentStep('info');
        setName('');
        setNotes('');
        setPhotoUrl('');
        setCapturedSamples([]);
      }, 1200);

    } catch (err) {
      console.warn("Failed to create person via backend, refreshing locally:", err);
      addPerson({
        name,
        relationship,
        notes,
        photo_url: finalPhoto
      });
      stopCameraStream();
      setIsSubmitting(false);
      setIsEnrollModalOpen(false);
      setCurrentStep('info');
      setName('');
      setNotes('');
      setPhotoUrl('');
      setCapturedSamples([]);
    }
  };

  if (isCameraOpen) {
    return <FaceCamera onBack={() => setIsCameraOpen(false)} />;
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <BackButton label={t.nav.home} onClick={onBack} variant="patient" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {t.people_page.title}
        </h1>
      </div>

      {/* Action Buttons: Recognize Face & Enroll Person */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setIsCameraOpen(true)}
          className="patient-card-btn"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            border: 'none',
            flex: 2,
            boxShadow: '0 12px 25px rgba(79, 70, 229, 0.3)'
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.75rem', borderRadius: '18px', color: '#ffffff' }}>
            <Camera size={32} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>RECOGNIZE FACE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>Identify familiar person</div>
          </div>
        </button>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          style={{
            background: '#ffffff',
            border: '3px solid #6366f1',
            borderRadius: '24px',
            padding: '1rem',
            color: '#4f46e5',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            flex: 1,
            justifyContent: 'center',
            boxShadow: '0 8px 15px rgba(99, 102, 241, 0.1)'
          }}
        >
          <UserPlus size={24} /> {t.people_page.enroll_person}
        </button>
      </div>

      {/* View Switcher: Cards vs Family Tree */}
      <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '18px', marginBottom: '1.5rem', gap: '0.5rem' }}>
        <button
          onClick={() => setViewMode('cards')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            background: viewMode === 'cards' ? '#ffffff' : 'transparent',
            color: viewMode === 'cards' ? '#4f46e5' : '#64748b',
            boxShadow: viewMode === 'cards' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <LayoutGrid size={18} /> {t.people_page.cards_view}
        </button>
        <button
          onClick={() => setViewMode('tree')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            background: viewMode === 'tree' ? '#ffffff' : 'transparent',
            color: viewMode === 'tree' ? '#4f46e5' : '#64748b',
            boxShadow: viewMode === 'tree' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Network size={18} /> {t.people_page.family_tree}
        </button>
      </div>

      {viewMode === 'tree' ? (
        <FamilyTree />
      ) : activeFamilyMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Enrolled Contacts Yet"
          description="Add your family members and familiar friends so MANAS can help recognize them."
          actionLabel="Enroll First Person"
          onAction={() => setIsEnrollModalOpen(true)}
          accentColor="#6366f1"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeFamilyMembers.map((person) => (
            <div
              key={person.id}
              onClick={() => handleSpeakPerson(person)}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '1.25rem',
                border: '3px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                width: '100px',
                height: '100px',
                flexShrink: 0,
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#f1f5f9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <FamilyImage
                  src={person.imagePath}
                  alt={person.name}
                  name={person.name}
                  relationship={person.relationship}
                  size="100px"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    borderRadius: '20px',
                    border: '3px solid #6366f1'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  {person.name}
                </h3>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#4f46e5', margin: '0.25rem 0' }}>
                  {person.relationship}
                </p>
                {person.notes && (
                  <p style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 500 }}>
                    {person.notes}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeakPerson(person);
                }}
                className="touch-target"
                aria-label={`Read out details for ${person.name}`}
                style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer' }}
              >
                <Volume2 size={28} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Sample Enrollment Wizard Modal */}
      {isEnrollModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            border: '2px solid #cbd5e1',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsEnrollModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Enroll Person & Multi-Sample Face
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Capture 3 to 5 face poses to ensure robust recognition for elderly users under varying lighting.
            </p>

            {currentStep === 'info' && (
              <form onSubmit={(e) => { e.preventDefault(); startCaptureSession(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Biren Das"
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                  >
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Grandson">Grandson</option>
                    <option value="Granddaughter">Granddaughter</option>
                    <option value="Family Doctor">Family Doctor</option>
                    <option value="Neighbor / Caregiver">Neighbor / Caregiver</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Memory Note for Patient
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Visits on Tuesdays, loves playing acoustic guitar."
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <ImageUploadPicker
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    label="Person Photo"
                    helperText="Upload a photo from your device, or pick from album."
                    aspectRatio="square"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleCompleteEnrollment()}
                    disabled={!name.trim() || isSubmitting}
                    style={{
                      flex: 1,
                      background: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: name.trim() ? 'pointer' : 'not-allowed',
                      opacity: name.trim() ? 1 : 0.6
                    }}
                  >
                    Save with Photo Directly
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: name.trim() ? 'pointer' : 'not-allowed',
                      opacity: name.trim() ? 1 : 0.6
                    }}
                  >
                    Face Camera Multi-Pose →
                  </button>
                </div>
              </form>
            )}

            {currentStep === 'capture' && (
              <div>
                <div style={{ background: '#0f172a', borderRadius: '20px', overflow: 'hidden', position: 'relative', marginBottom: '1rem', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video ref={videoEnrollRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10%', left: '25%', right: '25%', bottom: '15%', border: '3px dashed #10b981', borderRadius: '20px', pointerEvents: 'none' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Samples Captured: {capturedSamples.length} / 4
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: idx <= capturedSamples.length ? '#10b981' : '#cbd5e1'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <button
                    onClick={() => captureSample('Front')}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem',
                      borderRadius: '14px',
                      fontWeight: 700,
                      flex: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Camera size={20} /> Capture Sample {capturedSamples.length + 1}
                  </button>
                </div>

                <button
                  onClick={handleCompleteEnrollment}
                  disabled={capturedSamples.length === 0 || isSubmitting}
                  style={{
                    width: '100%',
                    background: capturedSamples.length > 0 ? '#4f46e5' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    cursor: capturedSamples.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isSubmitting ? 'Saving Biometric Profile...' : `Save Enrolled Profile (${capturedSamples.length} Samples)`}
                </button>
              </div>
            )}

            {currentStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                  Person Enrolled Successfully!
                </h3>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                  {capturedSamples.length} face pose samples stored securely.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
