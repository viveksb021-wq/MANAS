import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Phone, Globe } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { speakText } from '../../utils/speech';
import { useOffline } from '../../context/OfflineContext';
import { ManasLoader } from '../../components/ManasLoader';
import { PageTransition } from '../../components/PageTransition';

interface PlacesIKnowProps {
  onBack: () => void;
  initialSelectedPlaceId?: number | null;
}

export const PlacesIKnow: React.FC<PlacesIKnowProps> = ({ onBack, initialSelectedPlaceId }) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [isGuidanceActive, setIsGuidanceActive] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const { isOnline } = useOffline();

  useEffect(() => {
    fetchApi<any[]>('/places')
      .then(data => {
        if (data && data.length > 0) {
          setPlaces(data);
          if (initialSelectedPlaceId) {
            const found = data.find(p => p.id === initialSelectedPlaceId);
            if (found) setSelectedPlace(found);
            else setSelectedPlace(data[0]);
          } else {
            setSelectedPlace(data[0]);
          }
        } else {
          // Pre-populated fallback
          const fallbackPlaces = [
            { id: 1, name: 'Shillong Medical Centre', category: 'Hospital', address: 'Laitumkhrah, Shillong, Meghalaya 793003', latitude: 25.5788, longitude: 91.8933, notes: "Dr. Haren Barua's clinic. Open 9 AM - 5 PM.", photo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80' },
            { id: 2, name: 'Home in Laitumkhrah', category: 'Home', address: 'Main Road, Laitumkhrah, Shillong', latitude: 25.5711, longitude: 91.8890, notes: 'Family residence.', photo_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80' },
            { id: 3, name: "Arun's Residence", category: 'Family', address: 'GS Road, Guwahati, Assam 781005', latitude: 26.1445, longitude: 91.7362, notes: "Grandson Arun's home.", photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
            { id: 4, name: "Ward's Lake & Park", category: 'Worship', address: 'Police Bazar, Shillong, Meghalaya', latitude: 25.5760, longitude: 91.8845, notes: 'Favorite morning walk spot with pine trees.', photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' }
          ];
          setPlaces(fallbackPlaces);
          setSelectedPlace(fallbackPlaces[0]);
        }
      })
      .catch(() => {});
  }, [initialSelectedPlaceId]);

  const handleSelectPlace = (place: any) => {
    setSelectedPlace(place);
    speakText(`Selected ${place.name}. ${place.category} located at ${place.address}.`);
  };

  const handleShowRoute = () => {
    setIsCalculatingRoute(true);
    speakText(`Calculating route to ${selectedPlace.name}. Distance: 2.4 km.`);
    setTimeout(() => {
      setIsCalculatingRoute(false);
      setIsGuidanceActive(true);
    }, 1200);
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'hospital': return '🏥';
      case 'home': return '🏠';
      case 'family': return '👨‍👩‍👦';
      case 'shop': return '🏪';
      default: return '📍';
    }
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <button onClick={onBack} style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
            <ArrowLeft size={22} /> Home
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            PLACES I KNOW
          </h1>
        </div>

        {/* Network / Offline Map Banner */}
        <div style={{
          background: isOnline ? '#f0fdfa' : '#fff1f2',
          border: `2px solid ${isOnline ? '#ccfbf1' : '#f43f5e'}`,
          borderRadius: '16px',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '1rem',
          color: isOnline ? '#0f766e' : '#be123c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} />
            <span>{isOnline ? '🟢 Connected (Live Map Tiles Active)' : '🔴 Offline Maps Active (Saved Tile Data)'}</span>
          </div>
          <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>OpenStreetMap</span>
        </div>

        {/* Calculating Route Loader Overlay */}
        {isCalculatingRoute ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '2rem',
            border: '3px solid #0f766e',
            marginBottom: '1.5rem'
          }}>
            <ManasLoader
              type="map"
              message="Finding your place..."
              submessage={`Calculating route to ${selectedPlace?.name}...`}
              fullScreen={false}
            />
          </div>
        ) : (
          /* Interactive OpenStreetMap Viewer Card */
          <div style={{
            background: '#0f172a',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 20px 30px rgba(0,0,0,0.12)',
            marginBottom: '1.5rem',
            position: 'relative',
            height: '320px',
            border: '3px solid #cbd5e1'
          }}>
            {/* OpenStreetMap Iframe Embed */}
            <iframe
              title="OpenStreetMap Places Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=91.8700%2C25.5600%2C91.9100%2C25.5900&amp;layer=mapnik&amp;marker=${selectedPlace ? selectedPlace.latitude : 25.5788}%2C${selectedPlace ? selectedPlace.longitude : 91.8933}`}
              style={{ border: 0, filter: 'contrast(1.05)' }}
            />

            {/* Selected Place Overlay Card */}
            {selectedPlace && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1rem 1.25rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                border: '2px solid #14b8a6'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(selectedPlace.category)}</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{selectedPlace.name}</h3>
                  </div>
                  <p style={{ fontSize: '1.05rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>{selectedPlace.address}</p>
                </div>

                <button
                  onClick={handleShowRoute}
                  style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 18px rgba(15, 118, 110, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <Navigation size={20} /> SHOW ROUTE
                </button>
              </div>
            )}
          </div>
        )}

        {/* Saved Places List */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Saved Locations ({places.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <div
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                style={{
                  background: isSelected ? '#f0fdfa' : '#ffffff',
                  border: `3px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                  borderRadius: '24px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '18px',
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  {getCategoryEmoji(place.category)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>
                    {place.category}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {place.name}
                  </h3>
                  <p style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 500 }}>
                    {place.address}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlace(place);
                  }}
                  style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '50%', padding: '0.85rem', cursor: 'pointer' }}
                >
                  <MapPin size={24} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Simplified Route Guidance Modal */}
        {isGuidanceActive && selectedPlace && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '32px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '1rem' }}>
                  Simple Guidance Active
                </span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  Route to {selectedPlace.name}
                </h2>
              </div>

              {/* Step-by-Step Guidance Sequence */}
              <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#0f766e', color: '#ffffff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>START</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>📍 Your Current Location</div>
                    </div>
                  </div>

                  <div style={{ height: '24px', borderLeft: '3px dashed #0f766e', marginLeft: '19px' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#0f766e', color: '#ffffff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>LANDMARK</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Turn right near Laitumkhrah Market</div>
                    </div>
                  </div>

                  <div style={{ height: '24px', borderLeft: '3px dashed #0f766e', marginLeft: '19px' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f43f5e', color: '#ffffff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>3</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>DESTINATION</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{selectedPlace.name}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 800, color: '#0f766e' }}>
                  <span>Distance: 2.4 km</span>
                  <span>Est. Time: ~8 mins</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    speakText(`Guidance started for ${selectedPlace.name}. Have a safe journey.`);
                    setIsGuidanceActive(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '1.15rem',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    border: 'none'
                  }}
                >
                  Start Guidance
                </button>

                <button
                  onClick={() => {
                    speakText("Calling your guardian Ravi Sharma.");
                    alert("Calling Guardian Ravi Sharma (+91 98640 12345)...");
                  }}
                  style={{
                    background: '#ffe4e6',
                    color: '#e11d48',
                    border: '2px solid #f43f5e',
                    borderRadius: '20px',
                    padding: '1rem',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Phone size={24} /> Call Guardian
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
