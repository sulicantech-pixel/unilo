import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { COLORS } from '../utils/designSystem';

let L;

function formatPrice(price) {
  const n = Number(price);
  if (!n) return '—';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

// Nominatim geocode search (OpenStreetMap — free, no key needed)
async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Nigeria')}&limit=5&countrycodes=ng`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return res.json();
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markersRef = useRef([]);

  const [listings, setListings]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Load Leaflet CSS + JS once
  useEffect(() => {
    if (document.querySelector('#leaflet-css')) { setLeafletReady(true); return; }
    const link = document.createElement('link');
    link.id   = 'leaflet-css';
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    import('leaflet').then(mod => { L = mod.default ?? mod; setLeafletReady(true); });
  }, []);

  // Fetch listings
  useEffect(() => {
    api.get('/listings?limit=200')
      .then(r => setListings(r.data.listings ?? []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapObj.current) return;
    mapObj.current = L.map(mapRef.current, {
      center: [6.5244, 3.3792],
      zoom: 11,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(mapObj.current);
    L.control.zoom({ position: 'bottomright' }).addTo(mapObj.current);
    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, [leafletReady]);

  // Add markers
  useEffect(() => {
    if (!mapObj.current || !L || listings.length === 0) return;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    let first = null;
    listings.forEach(listing => {
      const lat = listing.latitude  ?? listing.lat;
      const lng = listing.longitude ?? listing.lng ?? listing.lon;
      if (!lat || !lng) return;

      const icon = L.divIcon({
        html: `<div style="background:#ff6b00;color:#fff;padding:4px 9px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;font-family:'DM Sans',sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.4);border:1.5px solid rgba(255,255,255,0.2);cursor:pointer">${formatPrice(listing.price)}</div>`,
        className: '',
        iconAnchor: [0, 0],
      });
      const marker = L.marker([lat, lng], { icon }).addTo(mapObj.current);
      marker.on('click', () => setSelected(listing));
      markersRef.current.push(marker);
      if (!first) first = [lat, lng];
    });

    if (first) mapObj.current.setView(first, 13);
  }, [listings, leafletReady]);

  // Nominatim search
  const handleSearch = useCallback(async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 3) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    try {
      const results = await geocodeNominatim(val);
      setSearchResults(results);
      setShowResults(true);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  const handleSelectResult = useCallback((result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (mapObj.current) {
      mapObj.current.setView([lat, lng], 15);
      // Drop a blue search marker
      const searchIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        className: '',
        iconAnchor: [8, 8],
      });
      L.marker([lat, lng], { icon: searchIcon }).addTo(mapObj.current);
    }
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(','));
    setShowResults(false);
    setSelected(null);
  }, []);

  // Close results on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <style>{`
        .leaflet-container { background: #1a1a1a !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif' }}>

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 500, padding: '12px 16px', paddingTop: 'max(12px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)}
            style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {/* Search box */}
          <div ref={searchRef} style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,10,10,0.90)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search area, junction, university…"
                value={searchQuery}
                onChange={handleSearch}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}
              />
              {searching && (
                <div style={{ width: 14, height: 14, border: '2px solid #ff6b00', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
              )}
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                  ✕
                </button>
              )}
            </div>

            {/* Results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: 'rgba(17,17,17,0.98)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                overflow: 'hidden', zIndex: 600,
              }}>
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => handleSelectResult(r)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 14px',
                      background: 'none', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,107,0,0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                        {r.display_name.split(',').slice(0, 2).join(',')}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {r.display_name.split(',').slice(2, 4).join(',').trim()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!loading && (
            <div style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#ff6b00', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {listings.length} rooms
            </div>
          )}
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Loading */}
        {(loading || !leafletReady) && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 32, height: 32, border: '2.5px solid #ff6b00', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>Loading map…</p>
          </div>
        )}

        {/* No coordinates notice */}
        {!loading && listings.length > 0 && markersRef.current.length === 0 && (
          <div style={{ position: 'absolute', bottom: 'calc(90px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', background: 'rgba(17,17,17,0.95)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            📍 No listings with map coordinates yet
          </div>
        )}

        {/* Selected listing card */}
        {selected && (
          <div style={{ position: 'absolute', bottom: 'calc(80px + env(safe-area-inset-bottom))', left: 16, right: 16, zIndex: 500 }}>
            <div
              onClick={() => navigate(`/listing/${selected.id}`)}
              style={{ background: 'rgba(17,17,17,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 14, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            >
              <div style={{ width: 72, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                {selected.cover_photo?.url || selected.photos?.[0]?.url
                  ? <img src={selected.cover_photo?.url || selected.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏠</div>}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {selected.city}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#ff6b00', margin: '5px 0 0' }}>
                  {formatPrice(selected.price)}<span style={{ fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/yr</span>
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); setSelected(null); }}
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
