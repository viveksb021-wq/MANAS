import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapPin, RefreshCw, Wifi, WifiOff, Shield, ShieldOff,
  AlertTriangle, Navigation, Clock, Crosshair, ExternalLink,
  Layers, ZoomIn, ZoomOut, Radio, CheckCircle2
} from 'lucide-react';
import { fetchApi } from '../../utils/api';

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

declare global {
  interface Window {
    google?: any;
    initGoogleMapCallback?: () => void;
  }
}

export const CaregiverLocationMap: React.FC<CaregiverLocationMapProps> = ({
  patientId,
  patientName
}) => {
  const [location, setLocation] = useState<PatientLocationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingGps, setSyncingGps] = useState<boolean>(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [zoomLevel, setZoomLevel] = useState<number>(16);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [useJsApi, setUseJsApi] = useState<boolean>(false);

  const googleMapDivRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);
  const googleCircleRef = useRef<any>(null);

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // 1. Fetch Location from backend
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

  // Initial fetch and polling every 10 seconds
  useEffect(() => {
    setLoading(true);
    fetchLocation();

    const interval = setInterval(() => {
      fetchLocation();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchLocation]);

  // 2. Broadcast / Sync Current Device Live GPS
  const handleSyncCurrentDeviceGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('Geolocation is not supported on this browser/device.');
      return;
    }

    setSyncingGps(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        const nowIso = new Date(pos.timestamp).toISOString();

        try {
          // Send to backend endpoint
          await fetchApi('/patient/location', {
            method: 'POST',
            body: {
              latitude: lat,
              longitude: lng,
              accuracy: acc,
              is_sharing_enabled: true,
              is_online: true,
              timestamp: nowIso
            }
          });

          // Update local state immediately
          setLocation({
            patient_id: Number(patientId),
            patient_name: patientName,
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            is_sharing_enabled: true,
            is_online: true,
            status: 'live',
            timestamp: nowIso,
            updated_at: nowIso
          });

          setLastRefreshedAt(new Date());
          setGpsSuccessMsg(`Real-time GPS locked: ${lat.toFixed(5)}°, ${lng.toFixed(5)}° (±${Math.round(acc)}m)`);
          setTimeout(() => setGpsSuccessMsg(null), 4500);
        } catch (err: any) {
          console.error('Failed to sync live GPS to backend:', err);
          // Still show coordinates locally
          setLocation({
            patient_id: Number(patientId),
            patient_name: patientName,
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            is_sharing_enabled: true,
            is_online: true,
            status: 'live',
            timestamp: nowIso,
            updated_at: nowIso
          });
          setGpsSuccessMsg('Live GPS acquired from browser.');
          setTimeout(() => setGpsSuccessMsg(null), 4000);
        } finally {
          setSyncingGps(false);
        }
      },
      (err) => {
        setSyncingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access was denied. Please allow location permissions in your browser bar.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Live GPS signal is temporarily unavailable.');
        } else if (err.code === err.TIMEOUT) {
          setError('Live GPS request timed out. Retrying...');
        } else {
          setError('Unable to acquire live GPS coordinates.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  // 3. Optional Google Maps JavaScript SDK Initialization if API Key is configured
  useEffect(() => {
    if (!apiKey || !location?.latitude || !location?.longitude) {
      setUseJsApi(false);
      return;
    }

    const lat = location.latitude;
    const lng = location.longitude;

    const initMap = () => {
      if (!googleMapDivRef.current || !window.google?.maps) return;

      const mapOptions = {
        center: { lat, lng },
        zoom: zoomLevel,
        mapTypeId: mapType === 'satellite' ? window.google.maps.MapTypeId.HYBRID : window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: false,
        fullscreenControl: true
      };

      if (!googleMapInstanceRef.current) {
        googleMapInstanceRef.current = new window.google.maps.Map(googleMapDivRef.current, mapOptions);

        googleMarkerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapInstanceRef.current,
          title: patientName,
          animation: window.google.maps.Animation.DROP
        });

        if (location.accuracy) {
          googleCircleRef.current = new window.google.maps.Circle({
            map: googleMapInstanceRef.current,
            center: { lat, lng },
            radius: location.accuracy,
            fillColor: '#0d9488',
            fillOpacity: 0.15,
            strokeColor: '#0f766e',
            strokeOpacity: 0.8,
            strokeWeight: 1.5
          });
        }
      } else {
        googleMapInstanceRef.current.panTo({ lat, lng });
        googleMapInstanceRef.current.setZoom(zoomLevel);
        if (googleMarkerRef.current) {
          googleMarkerRef.current.setPosition({ lat, lng });
        }
        if (googleCircleRef.current) {
          googleCircleRef.current.setCenter({ lat, lng });
          if (location.accuracy) googleCircleRef.current.setRadius(location.accuracy);
        }
      }
      setUseJsApi(true);
    };

    if (!window.google?.maps) {
      const existingScript = document.getElementById('google-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        script.onerror = () => setUseJsApi(false);
        document.head.appendChild(script);
      }
    } else {
      initMap();
    }
  }, [apiKey, location?.latitude, location?.longitude, zoomLevel, mapType, patientName]);

  const formatTime = (iso?: string | null) => {
    if (!iso) return 'Unknown';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const hasValidCoordinates =
    location &&
    location.is_sharing_enabled &&
    location.latitude !== null &&
    location.longitude !== null;

  const lat = location?.latitude ?? 0;
  const lng = location?.longitude ?? 0;
  const isLive = location?.is_online && location?.status === 'live';

  // Google Maps Embed URL (Interactive, works seamlessly without API key)
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${zoomLevel}&t=${mapType === 'satellite' ? 'k' : 'm'}&output=embed`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
              color: '#0f766e',
              padding: '0.75rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)'
            }}
          >
            <MapPin size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Patient Live Location
              </h2>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1'
                }}
              >
                Google Maps
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              Real-time GPS tracking and safe perimeter monitoring for <strong style={{ color: '#0f172a' }}>{patientName}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Sync / Broadcast Real-Time GPS */}
          <button
            onClick={handleSyncCurrentDeviceGps}
            disabled={syncingGps}
            className="touch-target"
            title="Acquire live GPS from device and sync instantly"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: syncingGps ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Radio size={16} className={syncingGps ? 'animate-pulse' : ''} />
            {syncingGps ? 'Locking GPS...' : 'Sync Real-Time GPS'}
          </button>

          {/* Refresh Location from Backend */}
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
              padding: '0.65rem 1.1rem',
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
            {loading ? 'Updating...' : 'Refresh'}
          </button>

          {/* Open in Google Maps navigation */}
          {hasValidCoordinates && (
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Navigation size={16} color="#0d9488" /> Navigate <ExternalLink size={14} color="#64748b" />
            </a>
          )}
        </div>
      </div>

      {/* GPS Success Notification Toast */}
      {gpsSuccessMsg && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 700,
            fontSize: '0.92rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{gpsSuccessMsg}</span>
        </div>
      )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
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
            {hasValidCoordinates && (
              isLive ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
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
                  Live GPS updated {formatTime(location.timestamp)}
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
            )}
          </div>

          {/* Accuracy & Coordinates readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {hasValidCoordinates && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: 700 }}>
                <Crosshair size={14} color="#0d9488" /> {lat.toFixed(5)}°, {lng.toFixed(5)}°
              </span>
            )}
            {location.accuracy && location.is_sharing_enabled && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Navigation size={14} /> Accuracy: ±{Math.round(location.accuracy)}m
              </span>
            )}
            <span>Checked: {formatTime(lastRefreshedAt.toISOString())}</span>
          </div>
        </div>
      )}

      {/* Main Google Maps Viewport Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* STATE 1: LOCATION SHARING DISABLED */}
        {location && !location.is_sharing_enabled ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              textAlign: 'center',
              background: '#f8fafc'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
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
              <ShieldOff size={40} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              Location Sharing is Disabled
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {patientName} currently has location sharing turned off. No live tracking or GPS coordinates are broadcast.
            </p>
            <button
              onClick={handleSyncCurrentDeviceGps}
              className="touch-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '16px',
                background: '#0d9488',
                color: '#ffffff',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)'
              }}
            >
              <Radio size={18} /> Enable & Broadcast Live GPS Now
            </button>
          </div>
        ) : hasValidCoordinates ? (
          /* STATE 2: VALID COORDINATES -> GOOGLE MAPS ACTIVE */
          <div style={{ position: 'relative', flex: 1, width: '100%', height: '520px' }}>
            {/* Interactive Floating Map Controls on top of Google Maps */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              {/* Live Status Pill */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isLive ? '#10b981' : '#f59e0b',
                    boxShadow: `0 0 8px ${isLive ? '#10b981' : '#f59e0b'}`
                  }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  {isLive
                    ? `GOOGLE MAPS LIVE • ${formatTime(location.timestamp)}`
                    : `LAST KNOWN • ${formatTime(location.timestamp)}`}
                </span>
              </div>

              {/* Satellite / Roadmap Toggle */}
              <button
                onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
                className="touch-target"
                title="Toggle Satellite / Road Map view"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #e2e8f0',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
              >
                <Layers size={15} color="#0f766e" />
                {mapType === 'roadmap' ? 'Satellite View' : 'Default Map'}
              </button>
            </div>

            {/* Zoom Controls Overlay (Top Right) */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 1, 20))}
                className="touch-target"
                title="Zoom in"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 1, 10))}
                className="touch-target"
                title="Zoom out"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <ZoomOut size={18} />
              </button>
            </div>

            {/* Google Maps Viewport */}
            {useJsApi ? (
              <div ref={googleMapDivRef} style={{ width: '100%', height: '100%' }} />
            ) : (
              <iframe
                title="Google Maps Patient Live Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
                src={googleMapsEmbedUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}

            {/* Bottom Floating Info Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#ffffff',
                padding: '0.85rem 1.25rem',
                borderRadius: '18px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    boxShadow: '0 0 10px rgba(13, 148, 136, 0.6)'
                  }}
                >
                  {(patientName || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{patientName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    GPS: {lat.toFixed(5)}°, {lng.toFixed(5)}° {location.accuracy ? `(±${Math.round(location.accuracy)}m)` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px'
                  }}
                >
                  <ExternalLink size={14} /> Full View in Google Maps
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* STATE 3: NO COORDINATES YET -> PROMPT REAL-TIME GPS SYNC */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              textAlign: 'center',
              background: '#f8fafc'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '2px solid #bae6fd'
              }}
            >
              <Radio size={40} className="animate-pulse" />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Real-Time Location Pending
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {error || `No recent GPS signal recorded for ${patientName}. Click below to broadcast real-time GPS coordinates directly to Google Maps.`}
            </p>
            <button
              onClick={handleSyncCurrentDeviceGps}
              disabled={syncingGps}
              className="touch-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.9rem 1.75rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                border: 'none',
                cursor: syncingGps ? 'not-allowed' : 'pointer',
                fontSize: '1.05rem',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Radio size={20} className={syncingGps ? 'animate-pulse' : ''} />
              {syncingGps ? 'Acquiring Device GPS...' : 'Broadcast My Live GPS Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
