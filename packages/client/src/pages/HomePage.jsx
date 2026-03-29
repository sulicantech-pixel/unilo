import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const UNIVERSITIES = [
  { label: 'Any university', value: '' },
  { label: 'University of Lagos (UNILAG)', value: 'unilag' },
  { label: 'University of Port Harcourt (UNIPORT)', value: 'uniport' },
  { label: 'Obafemi Awolowo University (OAU)', value: 'oau' },
  { label: 'University of Nigeria (UNN)', value: 'unn' },
  { label: 'Ahmadu Bello University (ABU)', value: 'abu' },
  { label: 'University of Ibadan (UI)', value: 'ui' },
  { label: 'Federal University of Technology Akure (FUTA)', value: 'futa' },
  { label: 'Covenant University', value: 'covenant' },
  { label: 'Babcock University', value: 'babcock' },
  { label: 'Rivers State University (RSU)', value: 'rsu' },
];

const CAMPUS_OPTIONS = ['Any campus', 'On campus', 'Off campus', 'Near gate', 'Town'];
const ACCOMMODATION_OPTIONS = ['Any accommodation', 'Room', 'Roommate', 'Self-contain', 'Mini flat', 'Apartment', 'BQ'];
const ROOM_REGION_OPTIONS = ['Any room region', 'On campus', 'Off campus', 'Near gate', 'Town'];
const JUNCTION_OPTIONS = ['Any junction', 'Main gate', 'Back gate', 'School road', 'Market area', 'Town center'];
const DISTANCE_OPTIONS = ['Any distance', '< 5 min walk', '5–10 min', '10–20 min', '20–30 min', '> 30 min'];
const PRICE_OPTIONS = ['Any price / year', 'Under ₦100k', '₦100k–₦200k', '₦200k–₦400k', '₦400k–₦700k', '₦700k+'];

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: 'trending', label: 'Trending', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  { id: 'on_campus', label: 'On Campus', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> },
  { id: 'off_campus', label: 'Off Campus', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
  { id: 'clusters', label: 'Clusters', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
];

function FilterPanel({ filters, setFilters, onSearch, onClose, isMobile }) {
  const [uniSearch, setUniSearch] = useState('');
  const filtered = UNIVERSITIES.filter(u =>
    u.label.toLowerCase().includes(uniSearch.toLowerCase())
  );

  const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 36,
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: isMobile ? '8px 0 0' : '24px 0 0',
    }}>
      {isMobile && (
        <div style={{
          width: 40, height: 4,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 100,
          margin: '0 auto 8px',
        }} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
        {/* University with search */}
        <Field label="University">
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingLeft: 36 }}
              placeholder="Search university…"
              value={uniSearch || (filters.university ? UNIVERSITIES.find(u => u.value === filters.university)?.label : '')}
              onChange={e => { setUniSearch(e.target.value); if (!e.target.value) setFilters(f => ({ ...f, university: '' })); }}
            />
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {uniSearch && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#1a2436', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: 'auto',
              }}>
                {filtered.map(u => (
                  <div key={u.value}
                    onClick={() => { setFilters(f => ({ ...f, university: u.value })); setUniSearch(''); }}
                    style={{ padding: '10px 14px', fontSize: 13, color: '#fff', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,107,0,0.15)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >{u.label}</div>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Campus">
          <select style={selectStyle} value={filters.campus} onChange={e => setFilters(f => ({ ...f, campus: e.target.value }))}>
            {CAMPUS_OPTIONS.map(o => <option key={o} value={o === 'Any campus' ? '' : o} style={{ background: '#1a2436' }}>{o}</option>)}
          </select>
        </Field>

        <Field label="Accommodation">
          <select style={selectStyle} value={filters.accommodation} onChange={e => setFilters(f => ({ ...f, accommodation: e.target.value }))}>
            {ACCOMMODATION_OPTIONS.map(o => <option key={o} value={o === 'Any accommodation' ? '' : o} style={{ background: '#1a2436' }}>{o}</option>)}
          </select>
        </Field>

        <Field label="Room Region">
          <select style={selectStyle} value={filters.roomRegion} onChange={e => setFilters(f => ({ ...f, roomRegion: e.target.value }))}>
            {ROOM_REGION_OPTIONS.map(o => <option key={o} value={o === 'Any room region' ? '' : o} style={{ background: '#1a2436' }}>{o}</option>)}
          </select>
        </Field>

        <Field label="Junction">
          <select style={selectStyle} value={filters.junction} onChange={e => setFilters(f => ({ ...f, junction: e.target.value }))}>
            {JUNCTION_OPTIONS.map(o => <option key={o} value={o === 'Any junction' ? '' : o} style={{ background: '#1a2436' }}>{o}</option>)}
          </select>
        </Field>

        <Field label="Distance">
          <select style={selectStyle} value={filters.distance} onChange={e => setFilters(f => ({ ...f, distance: e.target.value }))}>
            {DISTANCE_OPTIONS.map(o => <option key={o} value={o === 'Any distance' ? '' : o} style={{ background: '#1a2436' }}>{o}</option>)}
          </select>
        </Field>

        <Field label="Move-in Date">
          <input type="date" style={inputStyle} value={filters.moveIn} onChange={e => setFilters(f => ({ ...f, moveIn: e.target.value }))} />
        </Field>

        <Field label="Price / Year">
          <select style={selectStyle} value={filters.price} onChange={e => setFilters(f => ({ ...f, price: e.target.value }))}>
            {PRICE_OPTIONS.map(o => <option key={o} value={o === 'Any price / year' ? '' : o} style={{ background: '#1a2436' }}>{o}</option>)}
          </select>
        </Field>
      </div>

      <button
        onClick={onSearch}
        style={{
          background: '#ff6b00',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 28px',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search Rooms
      </button>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '', campus: '', accommodation: '',
    roomRegion: '', junction: '', distance: '', moveIn: '', price: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => api.get('/listings?limit=8').then(r => r.data),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/search?${params}`);
    setShowFilters(false);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <main style={{
      fontFamily: "'DM Sans', sans-serif",
      background: '#0D1B2A',
      minHeight: '100vh',
      paddingBottom: 100,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');

        * { box-sizing: border-box; }

        .hero-section {
          position: relative;
          padding: 56px 20px 40px;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .hero-section { padding: 80px 48px 56px; }
        }

        .hero-glow {
          position: absolute;
          top: -80px; right: -80px;
          width: 460px; height: 460px;
          background: radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-glow-2 {
          position: absolute;
          bottom: 0; left: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,107,0,0.12);
          border: 1px solid rgba(255,107,0,0.25);
          color: #ff6b00;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .hero-title {
          font-family: 'Clash Display', 'DM Sans', sans-serif;
          font-size: clamp(2.4rem, 7vw, 4.2rem);
          font-weight: 700;
          line-height: 1.08;
          color: #fff;
          margin: 0 0 14px;
          letter-spacing: -0.025em;
        }

        .hero-title .accent { color: #ff6b00; }

        .hero-sub {
          color: rgba(255,255,255,0.5);
          font-size: 15px;
          line-height: 1.65;
          margin-bottom: 32px;
          max-width: 480px;
        }

        .search-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px;
          padding: 14px 20px;
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          cursor: pointer;
          width: 100%;
          max-width: 460px;
          transition: all 0.2s;
          backdrop-filter: blur(12px);
        }

        .search-trigger-btn:hover {
          border-color: rgba(255,107,0,0.4);
          background: rgba(255,107,0,0.06);
          color: rgba(255,255,255,0.75);
        }

        .search-trigger-right {
          margin-left: auto;
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        /* Desktop filter dropdown */
        .filter-dropdown {
          background: rgba(13,27,42,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 24px;
          margin-top: 12px;
          backdrop-filter: blur(24px);
          max-width: 700px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        @media (min-width: 768px) {
          .search-trigger-btn { max-width: 560px; }
          .filter-dropdown { max-width: 800px; }
        }

        /* Category tabs */
        .cat-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 0 20px;
          scrollbar-width: none;
          margin-bottom: 28px;
        }

        .cat-tabs::-webkit-scrollbar { display: none; }

        @media (min-width: 768px) {
          .cat-tabs { padding: 0 48px; }
        }

        .cat-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.55);
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .cat-tab:hover { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.2); }

        .cat-tab.active {
          background: #ff6b00;
          border-color: #ff6b00;
          color: #fff;
          font-weight: 600;
        }

        /* Cluster banner */
        .cluster-banner {
          margin: 0 20px 28px;
          background: linear-gradient(135deg, #ff6b00 0%, #e55500 100%);
          border-radius: 18px;
          padding: 20px 20px 20px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cluster-banner:hover { transform: scale(1.01); }

        @media (min-width: 768px) {
          .cluster-banner { margin: 0 48px 36px; }
        }

        /* Listings grid */
        .listings-section { padding: 0 20px; }

        @media (min-width: 768px) { .listings-section { padding: 0 48px; } }

        .listings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .section-title {
          font-family: 'Clash Display', 'DM Sans', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        .see-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ff6b00;
          font-size: 13px;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 900px) {
          .listings-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1200px) {
          .listings-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .skeleton-card {
          background: rgba(255,255,255,0.04);
          border-radius: 14px;
          height: 260px;
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Mobile bottom sheet overlay */
        .sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 200;
          backdrop-filter: blur(4px);
        }

        .sheet-panel {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #0D1B2A;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px 24px 0 0;
          z-index: 201;
          padding: 16px 20px 40px;
          max-height: 90svh;
          overflow-y: auto;
        }

        /* Landlord bar */
        .landlord-bar {
          margin: 36px 20px 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        @media (min-width: 768px) {
          .landlord-bar { margin: 36px 48px 0; }
        }

        .landlord-icon {
          width: 44px; height: 44px;
          background: rgba(255,107,0,0.12);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .list-now-btn {
          margin-left: auto;
          background: transparent;
          border: 1px solid #ff6b00;
          color: #ff6b00;
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .list-now-btn:hover { background: #ff6b00; color: #fff; }

        select option { background: #0D1B2A; }
      `}</style>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <motion.div
          style={{ position: 'relative', zIndex: 1 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="badge-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            Nigeria's #1 Student Housing
          </div>

          <h1 className="hero-title">
            Find your room<br />
            near <span className="accent">your university.</span>
          </h1>

          <p className="hero-sub">
            Verified rooms · No broker fees · Split rent with Cluster
          </p>

          {/* Search trigger button */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <button
              className="search-trigger-btn"
              onClick={() => setShowFilters(v => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search rooms, university, area…
              <span className="search-trigger-right" onClick={e => { e.stopPropagation(); setShowFilters(true); }}>
                Search Rooms
              </span>
            </button>

            {/* Desktop filter dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="filter-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'block' }}
                >
                  <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    onSearch={handleSearch}
                    onClose={() => setShowFilters(false)}
                    isMobile={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              style={{ display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'none' : 'block' }}
            />
            <motion.div
              className="sheet-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{ display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'none' : 'block' }}
            >
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onSearch={handleSearch}
                onClose={() => setShowFilters(false)}
                isMobile={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CLUSTER BANNER (only on Clusters tab) */}
      <AnimatePresence>
        {activeTab === 'clusters' && (
          <motion.div
            className="cluster-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => navigate('/clusters')}
          >
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 3 }}>
                Split rent with Cluster 🔥
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                Can't afford a room alone? Find a compatible roommate and split the cost. Lock in for just ₦5,000.
              </div>
            </div>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CATEGORY TABS */}
      <div className="cat-tabs" style={{ marginBottom: activeTab === 'clusters' ? 0 : 28 }}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            className={`cat-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <button className="cat-tab" style={{ gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/></svg>
          Filter
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {/* LISTINGS */}
      <div className="listings-section">
        <div className="listings-header">
          <h2 className="section-title">
            {activeTab === 'clusters' ? 'Open Clusters' : activeTab === 'trending' ? 'Trending Now' : activeTab === 'on_campus' ? 'On Campus' : activeTab === 'off_campus' ? 'Off Campus' : 'Recent Listings'}
          </h2>
          <button className="see-all-btn" onClick={() => navigate('/search')}>
            See all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>

        <div className="listings-grid">
          {isLoading
            ? [...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)
            : data?.listings?.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
        </div>
      </div>

      {/* LANDLORD BAR */}
      <div className="landlord-bar">
        <div className="landlord-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff' }}>Are you a landlord?</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Reach thousands of verified students near your property</div>
        </div>
        <button className="list-now-btn" onClick={() => navigate('/login')}>List Now</button>
      </div>
    </main>
  );
}
