import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Handles map click
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); }
  });
  return null;
};

// Flies map to a position
const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.2 });
  }, [position, map]);
  return null;
};

/**
 * Address search autocomplete using Nominatim
 */
const AddressSearchBox = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setResults([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
  };

  const handleSelect = (item) => {
    const address = item.display_name.split(',').slice(0, 4).join(', ');
    setQuery(address);
    setResults([]);
    onSelect({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), address });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search any city, area or address..."
          className="flex-1 px-3 py-2 text-sm outline-none"
        />
        {searching && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3 flex-shrink-0"></div>}
        {query && !searching && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="mr-3 text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-52 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">📍</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.display_name.split(',')[0]}</p>
                  <p className="text-xs text-gray-500 truncate">{item.display_name.split(',').slice(1, 4).join(',')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * LocationPicker modal
 * Props:
 *   onConfirm({ lat, lng, address })
 *   onClose()
 *   initialLat, initialLng
 */
const LocationPicker = ({ onConfirm, onClose, initialLat, initialLng }) => {
  const defaultPos = { lat: 20.5937, lng: 78.9629 }; // center of India
  const [marker, setMarker] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [flyTo, setFlyTo] = useState(null);

  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      setAddress(data.display_name?.split(',').slice(0, 4).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    setGeocoding(false);
  };

  const handleMapClick = (lat, lng) => {
    setMarker({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handleSearchSelect = ({ lat, lng, address: addr }) => {
    setMarker({ lat, lng });
    setAddress(addr);
    setFlyTo([lat, lng]);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarker({ lat: latitude, lng: longitude });
        setFlyTo([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setDetecting(false);
      },
      () => { alert('Could not get GPS location. Search or click on the map instead.'); setDetecting(false); },
      { timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!marker) return alert('Please select a location first');
    onConfirm({ lat: marker.lat, lng: marker.lng, address });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Set Business Location</h2>
            <p className="text-xs text-gray-500 mt-0.5">Search an address, use GPS, or click on the map</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center">&times;</button>
        </div>

        {/* Search + GPS row */}
        <div className="px-5 py-3 border-b flex-shrink-0 space-y-2">
          <AddressSearchBox onSelect={handleSearchSelect} />
          <div className="flex items-center gap-3">
            <button
              onClick={handleDetectGPS}
              disabled={detecting}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {detecting
                ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> Detecting...</>
                : <>⊕ Use my current GPS location</>
              }
            </button>
            <span className="text-xs text-gray-400">or click anywhere on the map below</span>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1" style={{ minHeight: '300px' }}>
          <MapContainer
            center={marker ? [marker.lat, marker.lng] : [defaultPos.lat, defaultPos.lng]}
            zoom={marker ? 15 : 5}
            style={{ height: '100%', width: '100%', minHeight: '300px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            {flyTo && <FlyTo position={flyTo} />}
            {marker && <Marker position={[marker.lat, marker.lng]} />}
          </MapContainer>
        </div>

        {/* Selected address display */}
        <div className="px-5 py-3 border-t bg-gray-50 flex-shrink-0 min-h-[52px]">
          {marker ? (
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5 flex-shrink-0">📌</span>
              <div className="min-w-0">
                {geocoding
                  ? <span className="text-sm text-gray-500">Getting address...</span>
                  : <span className="text-sm text-gray-700">{address || `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`}</span>
                }
                <p className="text-xs text-gray-400 mt-0.5">{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No location selected yet</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!marker || geocoding}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-40 text-sm"
          >
            Confirm Location
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
