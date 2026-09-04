import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Volume2, Heart, Plus } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { speakText } from '../../utils/speech';
import { FaceCamera } from './FaceCamera';

interface PeopleIKnowProps {
  onBack: () => void;
}

export const PeopleIKnow: React.FC<PeopleIKnowProps> = ({ onBack }) => {
  const [people, setPeople] = useState<any[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    fetchApi<any[]>('/people')
      .then(data => {
        if (data && data.length > 0) {
          setPeople(data);
        } else {
          // Pre-populated fallback with clear family roles & local photos
          setPeople([
            {
              id: 1,
              name: 'Ravi Sharma',
              relationship: 'Son',
              photo_url: '/family/son.jpg',
              notes: 'Your son. Visits every weekend and calls daily.'
            },
            {
              id: 2,
              name: 'Meera Sharma',
              relationship: 'Daughter',
              photo_url: '/family/daughter.jpg',
              notes: 'Your daughter. Lives nearby in Shillong.'
            },
            {
              id: 3,
              name: 'Arun Sharma',
              relationship: 'Grandson',
              photo_url: '/family/grandson.jpg',
              notes: 'Your grandson. 14 years old. Loves playing guitar.'
            },
            {
              id: 4,
              name: 'Sunita Sharma',
              relationship: 'Daughter-in-law',
              photo_url: '/family/daughter_in_law.jpg',
              notes: 'Your daughter-in-law. Coordinates morning tea & medications.'
            }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSpeakPerson = (person: any) => {
    speakText(`This is ${person.name}. Your ${person.relationship}. ${person.notes || ''}`);
  };

  if (isCameraOpen) {
    return <FaceCamera onBack={() => setIsCameraOpen(false)} />;
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={22} /> Home
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          PEOPLE I KNOW
        </h1>
      </div>

      {/* Face Recognition Camera Launch Button */}
      <button
        onClick={() => setIsCameraOpen(true)}
        className="patient-card-btn"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: '#ffffff',
          border: 'none',
          marginBottom: '2rem',
          boxShadow: '0 12px 25px rgba(79, 70, 229, 0.3)'
        }}
      >
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.85rem', borderRadius: '18px', color: '#ffffff' }}>
          <Camera size={36} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>RECOGNIZE FACE</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.9 }}>Open camera to identify a familiar person</div>
        </div>
      </button>

      {/* Grid of Enrolled People */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {people.map((person) => (
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
            <img
              src={person.photo_url}
              alt={person.name}
              style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '3px solid #4f46e5' }}
            />
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
              style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer' }}
            >
              <Volume2 size={28} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
