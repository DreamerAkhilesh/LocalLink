import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';

const AddressSearch = ({ onSelect, placeholder = 'Search any location...' }) => {
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
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: '1.5px solid var(--border)', borderRadius: 10,
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(6px)',
        overflow: 'hidden', transition: 'border-color 0.15s',
      }}
        onFocusWithin={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      >
        <svg style={{ width: 15, height: 15, color: 'var(--muted)', marginLeft: 11, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text" value={query} onChange={(e) => search(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '8px 10px', fontSize: '0.84rem', outline: 'none', background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'inherit' }}
        />
        {searching && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 10 }} />}
        {query && !searching && (
          <button onClick={() => { setQuery(''); setResults([]); }} style={{ marginRight: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1 }}>&times;</button>
        )}
      </div>

      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.14)', zIndex: 9999, maxHeight: 240, overflowY: 'auto',
        }}>
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelect(item)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px',
                borderBottom: '1px solid var(--border)', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                fontFamily: 'inherit', transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }}>📍</span>
              <div>
                <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>
                  {item.display_name.split(',')[0]}
                </p>
                <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>
                  {item.display_name.split(',').slice(1, 4).join(',')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LocationBar = () => {
  const { location, radius, loading, error, locationEnabled, detectLocation, clearLocation, updateRadius, saveLocation } = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showRadiusPicker, setShowRadiusPicker] = useState(false);

  const handleAddressSelect = ({ lat, lng, address }) => {
    saveLocation({ lat, lng, address });
    setShowSearch(false);
  };

  return (
    <div style={{
      background: 'rgba(245,243,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(139,92,246,0.1)',
      padding: '6px 16px',
      position: 'relative',
      zIndex: 40,          /* own stacking context so dropdowns (z:9999) float above page */
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

          {/* Location toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'inherit',
              padding: '4px 0',
            }}
          >
            <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {locationEnabled && location ? location.address : 'Set your location'}
            </span>
            <svg style={{ width: 11, height: 11, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Radius picker */}
          {locationEnabled && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowRadiusPicker(!showRadiusPicker)}
                style={{
                  fontSize: '0.76rem', fontWeight: 600, padding: '3px 10px',
                  background: 'var(--accent-100)', border: '1px solid rgba(124,58,237,0.2)',
                  color: 'var(--accent)', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                within {radius} km ▾
              </button>
              {showRadiusPicker && (
                <div style={{
                  position: 'absolute', left: 0, top: 'calc(100% + 4px)',
                  background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.14)', padding: 6, zIndex: 9999, width: 180,
                }}>
                  {[2, 5, 10, 20, 50].map(r => (
                    <button
                      key={r}
                      onClick={() => { updateRadius(r); setShowRadiusPicker(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', borderRadius: 8, border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.84rem',
                        fontWeight: radius === r ? 700 : 500,
                        color: radius === r ? 'var(--accent)' : 'var(--text-secondary)',
                        background: radius === r ? 'var(--accent-glow)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (radius !== r) e.currentTarget.style.background = 'rgba(124,58,237,0.04)'; }}
                      onMouseLeave={e => { if (radius !== r) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {r} km — {r === 2 ? 'Hyperlocal' : r === 5 ? 'Nearby' : r === 10 ? 'Local' : r === 20 ? 'City-wide' : 'Wide area'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {error && <span style={{ fontSize: '0.76rem', color: 'var(--danger)' }}>{error}</span>}
            {locationEnabled && (
              <button onClick={clearLocation} style={{ fontSize: '0.76rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'inherit' }}>
                Clear
              </button>
            )}
            <button
              onClick={detectLocation}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: '0.76rem', fontWeight: 600,
                background: 'linear-gradient(135deg,var(--accent),#8b5cf6)',
                color: 'white', border: 'none', padding: '5px 12px', borderRadius: 20,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                boxShadow: '0 2px 8px rgba(124,58,237,0.2)', fontFamily: 'inherit',
              }}
            >
              {loading
                ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Detecting…</>
                : '⊕ Use GPS'
              }
            </button>
          </div>
        </div>

        {showSearch && (
          <div style={{ marginTop: 8, paddingBottom: 4 }}>
            <AddressSearch onSelect={handleAddressSelect} placeholder="Search city, area, or full address…" />
            <p style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 6, marginLeft: 4 }}>
              Type any location — e.g. "Connaught Place Delhi" or "Bandra Mumbai"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationBar;
