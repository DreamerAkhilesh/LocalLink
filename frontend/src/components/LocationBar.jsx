import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';

/**
 * Address search with autocomplete using Nominatim (free, no API key)
 */
const AddressSearch = ({ onSelect, placeholder = 'Search any location...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
      }
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
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6&addressdetails=1`,
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
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
        />
        {searching && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>}
        {query && !searching && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="mr-3 text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">📍</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.display_name.split(',').slice(1, 4).join(',')}
                  </p>
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
 * LocationBar — shown at top of every page
 * Customers can search any address or use GPS
 */
const LocationBar = () => {
  const { location, radius, loading, error, locationEnabled, detectLocation, clearLocation, updateRadius, saveLocation } = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showRadiusPicker, setShowRadiusPicker] = useState(false);

  const handleAddressSelect = ({ lat, lng, address }) => {
    saveLocation({ lat, lng, address });
    setShowSearch(false);
  };

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Location pin icon + current location display */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 min-w-0"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-xs">
              {locationEnabled && location ? location.address : 'Set your location'}
            </span>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Radius picker */}
          {locationEnabled && (
            <div className="relative">
              <button
                onClick={() => setShowRadiusPicker(!showRadiusPicker)}
                className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-50"
              >
                within {radius} km ▾
              </button>
              {showRadiusPicker && (
                <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-lg p-2 z-50 w-44">
                  {[2, 5, 10, 20, 50].map(r => (
                    <button
                      key={r}
                      onClick={() => { updateRadius(r); setShowRadiusPicker(false); }}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 ${radius === r ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                    >
                      {r} km — {r === 2 ? 'Hyperlocal' : r === 5 ? 'Nearby' : r === 10 ? 'Local' : r === 20 ? 'City-wide' : 'Wide area'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {error && <span className="text-xs text-red-600">{error}</span>}
            {locationEnabled && (
              <button onClick={clearLocation} className="text-xs text-gray-400 hover:text-red-500">
                Clear
              </button>
            )}
            <button
              onClick={detectLocation}
              disabled={loading}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {loading
                ? <><div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div> Detecting...</>
                : '⊕ Use GPS'
              }
            </button>
          </div>
        </div>

        {/* Expandable search box */}
        {showSearch && (
          <div className="mt-2 pb-1">
            <AddressSearch
              onSelect={handleAddressSelect}
              placeholder="Search city, area, or full address..."
            />
            <p className="text-xs text-gray-400 mt-1.5 ml-1">
              Type any location — e.g. "Connaught Place Delhi" or "Bandra Mumbai"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationBar;
