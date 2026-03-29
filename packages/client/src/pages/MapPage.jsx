import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

// Dynamically import Leaflet to avoid SSR issues
let L;
let mapInitialized = false;

function formatPrice(price) {
  const n = Number(price);
  if (!n) return '—';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef   = useRef(null);
  const mapObj   = useRef(null);
  const [listings,  setListings]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    if (document.querySelector('#leaflet-css')) {
      setLeafletReady(true);
      return;
    }
    const link = document.createElement('link');
    link.id   = 'leaflet-css';
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    import('leaflet').then(mod => {
      L = mod.default ?? mod;
      setLeafletReady(true);
    });
  }, []);

  // Fetch listings with coords
  useEffect(() => {
    api.get('/listings?limit=100&has_coords=true')
      .then(r => setListings(r.data.listings ?? r.data.data ?? []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapObj.current) return;

    mapObj.current = L.map(mapRef.current, {
      center: [6.5244, 3.3792], // Lagos default
      zoom: 11,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(mapObj.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapObj.current);

    return () => {
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, [leafletReady]);

  // Add markers
  useEffect(() => {
    if (!mapObj.current || !L || listings.length === 0) return;

    listings.forEach(listing => {
      const lat = listing.latitude  ?? listing.lat;
      const lng = listing.longitude ?? listing.lng ?? listing.lon;
      if (!lat || !lng) return;

      const icon = L.divIcon({
        html: `<div style="background:#ff6b00;color:#fff;padding:4px 8px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;font-family:DM Sans,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:1.5px solid rgba(255,255,255,0.2);">${formatPrice(listing.price)}</div>`,
        className: '',
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(mapObj.current);
      marker.on('click', () => setSelected(listing));
    });

    if (listings[0]) {
      const lat = listings[0].latitude ?? listings[0].lat;
      const lng = listings[0].longitude ?? listings[0].lng ?? listings[0].lon;
      if (lat && lng) mapObj.current.setView([lat, lng], 13);
    }
  }, [listings, leafletReady]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,600&display=swap');
        * { box-sizing: border-box; }
        .leaflet-container { background: #1a1a1a !important; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif' }}>

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 500, padding: '12px 16px', paddingTop: 'max(12px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)}
            style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex: 1, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Search on map…</span>
          </div>
          {!loading && (
            <div style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 600, color: '#ff6b00', whiteSpace: 'nowrap' }}>
              {listings.length} rooms
            </div>
          )}
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Loading overlay */}
        {(loading || !leafletReady) && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 32, height: 32, border: '2.5px solid #ff6b00', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>Loading map…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
                {selected.photos?.[0] ? (
                  <img src={selected.photos[0].url ?? selected.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏠</div>}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {selected.city}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#ff6b00', margin: '5px 0 0' }}>{formatPrice(selected.price)}<span style={{ fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/yr</span></p>
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
