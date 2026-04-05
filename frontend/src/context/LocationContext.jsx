import React, { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};

const STORAGE_KEY = 'userLocation';
const DEFAULT_RADIUS = 10; // km

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [radius, setRadius] = useState(() => {
    return parseInt(localStorage.getItem('userRadius') || DEFAULT_RADIUS);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(!!location);

  const saveLocation = (loc) => {
    setLocation(loc);
    setLocationEnabled(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  };

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using free API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name?.split(',').slice(0, 3).join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          saveLocation({ lat: latitude, lng: longitude, address });
        } catch {
          saveLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        }
        setLoading(false);
      },
      (err) => {
        setError(err.code === 1 ? 'Location permission denied' : 'Could not get your location');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  const clearLocation = () => {
    setLocation(null);
    setLocationEnabled(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateRadius = (r) => {
    setRadius(r);
    localStorage.setItem('userRadius', r);
  };

  // Build query params to append to API calls
  const getLocationParams = () => {
    if (!locationEnabled || !location) return {};
    return { lat: location.lat, lng: location.lng, radius };
  };

  return (
    <LocationContext.Provider value={{
      location, radius, loading, error,
      locationEnabled, detectLocation, clearLocation,
      updateRadius, getLocationParams, saveLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};
