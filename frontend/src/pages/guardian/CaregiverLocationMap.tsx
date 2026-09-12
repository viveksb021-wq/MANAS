import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapPin, RefreshCw, Wifi, WifiOff, Shield, ShieldOff,
  AlertTriangle, Navigation, Clock, Crosshair
} from 'lucide-react';
import { fetchApi } from '../../utils/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet asset paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface PatientLocationResponse {
  patient_id: number;
  patient_name?: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  is_sharing_enabled: boolean;
  is_online: boolean;
  status: 'live' | 'offline' | 'unavailable' | 'sharing_off';
  timestamp?: string | null;
  updated_at?: string | null;
}

interface CaregiverLocationMapProps {
  patientId: number | string;
  patientName: string;
}

export const CaregiverLocationMap: React.FC<CaregiverLocationMapProps> = ({
  patientId,
  patientName
}) => {
  const [location, setLocation] = useState<PatientLocationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchApi<PatientLocationResponse>(
        `/guardian/patient-location?requested_patient_id=${patientId}`
      );
      setLocation(res);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to fetch patient location:', err);
      setError(err?.message || 'Unable to retrieve patient location.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Initial fetch and polling every 20 seconds
  useEffect(() => {
    setLoading(true);
    fetchLocation();

    const interval = setInterval(() => {
      fetchLocation();
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchLocation]);

  // Initialize or update Leaflet map when valid coordinates exist
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const hasCoordinates =
      location &&
      location.is_sharing_enabled &&
      location.latitude !== null &&
      location.longitude !== null;

    if (!hasCoordinates) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
      return;
    }

    const lat = location.latitude!;
    const lng = location.longitude!;
    const isLive = location.is_online && location.status === 'live';

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom pulsing patient avatar icon
      const customPinIcon = L.divIcon({
        className: 'custom-patient-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${isLive ? '#0d9488' : '#d97706'}; opacity: 0.35; animation: ping 1.8s infinite;"></div>
            <div style="position: relative; width: 34px; height: 34px; border-radius: 50%; background: ${isLive ? '#0f766e' : '#b45309'}; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 14px;">
              ${(patientName || 'P').charAt(0).toUpperCase()}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${patientName}</div>
          <div style="font-size: 12px; color: ${isLive ? '#0f766e' : '#b45309'}; font-weight: 700; margin: 3px 0;">
            ${isLive ? '🟢 Live Location' : '🟠 Last Known Location'}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}
          </div>
          ${location.accuracy ? `<div style="font-size: 11px; color: #64748b;">Accuracy: ±${Math.round(location.accuracy)}m</div>` : ''}
        </div>
      `);

      let circle: L.Circle | null = null;
      if (location.accuracy) {
        circle = L.circle([lat, lng], {
          radius: location.accuracy,
          color: isLive ? '#0d9488' : '#d97706',
          fillColor: isLive ? '#14b8a6' : '#f59e0b',
          fillOpacity: 0.15,
          weight: 1.5
        }).addTo(map);
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      if (circleRef.current && location.accuracy) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(location.accuracy);
      }
    }

    return () => {
      // Intentionally keep map across re-renders unless coordinates disappear
    };
  }, [location, patientName]);

  // Clean up Leaflet on full unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const formatTime = (iso?: string | null) => {
    if (!iso) return 'Unknown';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const handleCenterMap = () => {
    if (mapInstanceRef.current && location?.latitude && location?.longitude) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 16, { animate: true });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                background: '#ccfbf1',
                color: '#0f766e',
                padding: '0.6rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Patient Live Location
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Monitoring safe perimeter and active coordinates for <strong style={{ color: '#0f172a' }}>{patientName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {location?.latitude && location?.longitude && (
            <button
              onClick={handleCenterMap}
              className="touch-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Crosshair size={16} /> Re-center
            </button>
          )}

          <button
            onClick={() => {
              setLoading(true);
              fetchLocation();
            }}
            className="touch-target"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
              opacity: loading ? 0.75 : 1
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Location'}
          </button>
        </div>
      </div>

      {/* Connection & Status Banner */}
      {location && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* State Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* 1. SHARING STATE */}
            {location.is_sharing_enabled ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '12px',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '1px solid #99f6e4'
                }}
              >
                <Shield size={16} /> LOCATION SHARING ON
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1'
                }}
              >
                <ShieldOff size={16} /> LOCATION SHARING OFF
              </span>
            )}

            {/* 2. ONLINE / OFFLINE STATUS */}
            {location.is_online ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '12px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '1px solid #bbf7d0'
                }}
              >
                <Wifi size={16} /> Patient Online
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '12px',
                  background: '#fff7ed',
                  color: '#c2410c',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '1px solid #fed7aa'
                }}
              >
                <WifiOff size={16} /> Patient Offline
              </span>
            )}

            {/* 3. TRACKING FRESHNESS */}
            {location.is_sharing_enabled && location.latitude !== null ? (
              location.is_online && location.status === 'live' ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '12px',
                    background: '#ecfdf5',
                    color: '#059669',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', animation: 'ping 1.5s infinite' }} />
                  Live location updated {formatTime(location.timestamp)}
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '12px',
                    background: '#fefce8',
                    color: '#a16207',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: '1px solid #fef08a'
                  }}
                >
                  <Clock size={16} />
                  Last known location {formatTime(location.timestamp)}
                </span>
              )
            ) : null}
          </div>

          {/* Accuracy & Sync meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {location.accuracy && location.is_sharing_enabled && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Navigation size={14} /> Accuracy: ±{Math.round(location.accuracy)} meters
              </span>
            )}
            <span>Portal checked: {formatTime(lastRefreshedAt.toISOString())}</span>
          </div>
        </div>
      )}

      {/* Main Map or Explicit States */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* STATE 1: LOCATION SHARING OFF */}
        {location && !location.is_sharing_enabled ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: '#f8fafc'
            }}
          >
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '2px solid #e2e8f0'
              }}
            >
              <ShieldOff size={38} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              Location Sharing is OFF
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '420px', lineHeight: 1.6 }}>
              {patientName} has disabled location sharing. In accordance with MANAS privacy rules, no live coordinates or map markers will be tracked or displayed.
            </p>
          </div>
        ) : location && location.latitude !== null && location.longitude !== null ? (
          /* STATE 2: LOCATION SHARING ON & VALID COORDINATES (LIVE OR LAST KNOWN) */
          <div style={{ position: 'relative', flex: 1, width: '100%', height: '480px' }}>
            <div
              ref={mapContainerRef}
              style={{ width: '100%', height: '100%', zIndex: 1 }}
            />
            {/* Status Floating Pill overlay on top of map */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '60px',
                zIndex: 500,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '0.6rem 1rem',
                borderRadius: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: location.is_online && location.status === 'live' ? '#10b981' : '#f59e0b'
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                {location.is_online && location.status === 'live'
                  ? `LIVE • Updated ${formatTime(location.timestamp)}`
                  : `OFFLINE • Last known ${formatTime(location.timestamp)}`}
              </span>
            </div>
          </div>
        ) : (
          /* STATE 3: LOCATION UNAVAILABLE */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: '#fdf2f2'
            }}
          >
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '2px solid #fecdd3'
              }}
            >
              <AlertTriangle size={38} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
              Location Unavailable
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#b91c1c', maxWidth: '440px', lineHeight: 1.6 }}>
              {error || 'Location permission, device GPS, or network connectivity is currently unavailable for this patient. No fake coordinates are shown.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
