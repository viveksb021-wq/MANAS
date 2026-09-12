import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { useOffline } from '../context/OfflineContext';

export interface PatientLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  isLive: boolean;
}

export function usePatientLiveLocation() {
  const { role } = useAuth();
  const { currentPatientId } = usePatient();
  const { isOnline } = useOffline();

  const [locationSharingEnabled, setLocationSharingEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem(`manas:patient:${currentPatientId}:location_sharing`);
    return val === 'on';
  });

  const [currentLocation, setCurrentLocation] = useState<PatientLocationData | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(`manas:patient:${currentPatientId}:last_location`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return { ...parsed, isLive: false };
      } catch {
        return null;
      }
    }
    return null;
  });

  const [permissionState, setPermissionState] = useState<'undecided' | 'granted' | 'denied'>(() => {
    if (typeof window === 'undefined') return 'undecided';
    const decision = localStorage.getItem(`manas:patient:${currentPatientId}:location_decision`);
    if (decision === 'allowed') return 'granted';
    if (decision === 'denied') return 'denied';
    return 'undecided';
  });

  const [locationError, setLocationError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const lastSentCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Sync state when currentPatientId changes
  useEffect(() => {
    const val = localStorage.getItem(`manas:patient:${currentPatientId}:location_sharing`);
    setLocationSharingEnabled(val === 'on');

    const decision = localStorage.getItem(`manas:patient:${currentPatientId}:location_decision`);
    if (decision === 'allowed') setPermissionState('granted');
    else if (decision === 'denied') setPermissionState('denied');
    else setPermissionState('undecided');

    const cached = localStorage.getItem(`manas:patient:${currentPatientId}:last_location`);
    if (cached) {
      try {
        setCurrentLocation({ ...JSON.parse(cached), isLive: false });
      } catch {
        setCurrentLocation(null);
      }
    } else {
      setCurrentLocation(null);
    }
  }, [currentPatientId]);

  // Send coordinates to caregiver portal backend
  const sendLocationUpdate = useCallback(async (
    lat: number | null,
    lng: number | null,
    acc: number | null,
    isSharing: boolean,
    onlineStatus: boolean,
    timestampStr?: string
  ) => {
    if (role !== 'patient') return;

    try {
      await fetchApi('/patient/location', {
        method: 'POST',
        body: {
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          is_sharing_enabled: isSharing,
          is_online: onlineStatus,
          timestamp: timestampStr || new Date().toISOString()
        }
      });
    } catch (err) {
      console.warn('Location sync queued or cached:', err);
    }
  }, [role]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Start tracking
  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser or device.');
      return;
    }

    stopTracking();

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 15000,
      timeout: 20000
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy;
      const ts = new Date(pos.timestamp).toISOString();

      const locData: PatientLocationData = {
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        timestamp: ts,
        isLive: isOnline
      };

      setCurrentLocation(locData);
      setLocationError(null);
      setPermissionState('granted');

      localStorage.setItem(`manas:patient:${currentPatientId}:last_location`, JSON.stringify(locData));

      const now = Date.now();
      const timeElapsed = now - lastSentTimeRef.current;
      let shouldSend = lastSentTimeRef.current === 0 || timeElapsed > 20000;

      if (!shouldSend && lastSentCoordsRef.current) {
        const dist = calculateDistance(
          lastSentCoordsRef.current.lat,
          lastSentCoordsRef.current.lng,
          lat,
          lng
        );
        if (dist > 25) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        lastSentTimeRef.current = now;
        lastSentCoordsRef.current = { lat, lng };
        sendLocationUpdate(lat, lng, acc, true, isOnline, ts);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionState('denied');
        setLocationError('Location permission was denied in browser/device settings.');
        stopTracking();
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationError('Location service is currently unavailable.');
      } else if (error.code === error.TIMEOUT) {
        setLocationError('Location request timed out.');
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
  }, [currentPatientId, isOnline, sendLocationUpdate, stopTracking]);

  useEffect(() => {
    if (role === 'patient' && locationSharingEnabled && permissionState === 'granted') {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [role, locationSharingEnabled, permissionState, startTracking, stopTracking]);

  useEffect(() => {
    if (role !== 'patient') return;

    if (!isOnline) {
      setCurrentLocation(prev => prev ? { ...prev, isLive: false } : null);
      if (locationSharingEnabled && currentLocation) {
        sendLocationUpdate(
          currentLocation.latitude,
          currentLocation.longitude,
          currentLocation.accuracy,
          true,
          false,
          currentLocation.timestamp
        );
      }
    } else if (locationSharingEnabled && permissionState === 'granted') {
      startTracking();
    }
  }, [isOnline]);

  const setSharing = useCallback(async (enable: boolean) => {
    setLocationSharingEnabled(enable);
    localStorage.setItem(`manas:patient:${currentPatientId}:location_sharing`, enable ? 'on' : 'off');

    if (!enable) {
      stopTracking();
      await sendLocationUpdate(null, null, null, false, isOnline);
    } else {
      localStorage.setItem(`manas:patient:${currentPatientId}:location_decision`, 'allowed');
      setPermissionState('granted');
      startTracking();
    }
  }, [currentPatientId, isOnline, sendLocationUpdate, startTracking, stopTracking]);

  const handleAllowPermission = useCallback(() => {
    localStorage.setItem(`manas:patient:${currentPatientId}:location_decision`, 'allowed');
    setPermissionState('granted');
    setSharing(true);
  }, [currentPatientId, setSharing]);

  const handleDenyPermission = useCallback(() => {
    localStorage.setItem(`manas:patient:${currentPatientId}:location_decision`, 'denied');
    setPermissionState('denied');
    setSharing(false);
  }, [currentPatientId, setSharing]);

  return {
    locationSharingEnabled,
    permissionState,
    currentLocation,
    locationError,
    isOnline,
    setSharing,
    handleAllowPermission,
    handleDenyPermission
  };
}
