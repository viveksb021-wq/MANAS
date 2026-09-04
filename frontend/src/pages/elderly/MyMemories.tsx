import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, MapPin, Calendar, Users, Heart } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { speakText } from '../../utils/speech';

interface MyMemoriesProps {
  onBack: () => void;
}

export const MyMemories: React.FC<MyMemoriesProps> = ({ onBack }) => {
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    fetchApi<any[]>('/memories')
      .then(data => {
        if (data && data.length > 0) {
          setMemories(data);
        } else {
          setMemories([
            {
              id: 1,
              title: "Family Trip to Shillong Peak",
              description: "Beautiful sunny morning overlooking the pine hills of Shillong with Ravi and young Arun.",
              place: "Shillong, Meghalaya",
              people_involved: "Ravi, Arun",
              memory_date: "November 2024",
              photo_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
              tags: "Shillong, Family"
            },
            {
              id: 2,
              title: "Bihu Festival Celebration",
              description: "Traditional Assam Bihu festival at home with homemade Pitha sweets and folk music.",
              place: "Guwahati, Assam",
              people_involved: "Whole Family",
              memory_date: "April 2025",
              photo_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
              tags: "Bihu, Tradition"
            },
            {
              id: 3,
              title: "Tea Garden Stroll in Majuli",
              description: "Walking through lush green tea gardens while birds sang softly in the early mist.",
              place: "Majuli Island, Assam",
              people_involved: "Vivek, Ravi",
              memory_date: "January 2026",
              photo_url: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80",
              tags: "Majuli, Tea Garden"
            }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSpeakMemory = (mem: any) => {
    speakText(`Memory: ${mem.title}. ${mem.description}. Location: ${mem.place || 'Home'}. Date: ${mem.memory_date || ''}.`);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={22} /> Home
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          MY MEMORIES
        </h1>
      </div>

      {/* List of Memories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {memories.map((mem) => (
          <div
            key={mem.id}
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              overflow: 'hidden',
              border: '3px solid #cbd5e1',
              boxShadow: '0 15px 35px -5px rgba(0,0,0,0.06)'
            }}
          >
            {/* Memory Image */}
            <div style={{ position: 'relative', height: '240px' }}>
              <img
                src={mem.photo_url}
                alt={mem.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => handleSpeakMemory(mem)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  bottom: '1rem',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(225, 29, 72, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={32} />
              </button>
            </div>

            {/* Content Details */}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {mem.title}
              </h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 500, color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                "{mem.description}"
              </p>

              {/* Metadata Badges */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {mem.place && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffe4e6', color: '#e11d48', padding: '0.4rem 0.85rem', borderRadius: '14px', fontWeight: 700, fontSize: '1rem' }}>
                    <MapPin size={18} /> {mem.place}
                  </div>
                )}
                {mem.memory_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', color: '#475569', padding: '0.4rem 0.85rem', borderRadius: '14px', fontWeight: 700, fontSize: '1rem' }}>
                    <Calendar size={18} /> {mem.memory_date}
                  </div>
                )}
                {mem.people_involved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem 0.85rem', borderRadius: '14px', fontWeight: 700, fontSize: '1rem' }}>
                    <Users size={18} /> {mem.people_involved}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
