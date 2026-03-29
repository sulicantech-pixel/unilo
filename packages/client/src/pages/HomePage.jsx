import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

/* ─── Data ─────────────────────────────────────────────────────────── */
const NIGERIAN_UNIVERSITIES = [
  'University of Port Harcourt (UniPort)',
  'Rivers State University (RSU)',
  'Obafemi Awolowo University (OAU)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU)',
  'University of Benin (UNIBEN)',
  'Lagos State University (LASU)',
  'Covenant University',
  'Babcock University',
  'Pan-Atlantic University',
];

const CAMPUS_OPTIONS    = ['Any campus', 'On Campus', 'Off Campus', 'Near Gate', 'Town'];
const ACCOM_TYPES       = ['Any accommodation', 'Room', 'Roommate', 'Self-contain', 'Mini flat', 'Apartment', 'BQ'];
const ROOM_REGIONS      = ['Any room region', 'On Campus', 'Off Campus', 'Near Gate', 'Town'];
const JUNCTIONS         = ['Any junction', 'Main Gate', 'Back Gate', 'School Road', 'Market Area', 'Town Center'];
const DISTANCES         = ['Any distance', '< 5 min', '5–10 min', '10–20 min', '20–30 min', '> 30 min'];
const PRICE_RANGES      = ['Any price / year', 'Under ₦50k', '₦50k–₦100k', '₦100k–₦200k', '₦200k–₦400k', 'Above ₦400k'];
const CATEGORY_TABS     = ['All', 'Trending', 'On Campus', 'Off Campus', 'Clusters', 'Filter ⋯'];

/* ─── Component ─────────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [activeUni, setActiveUni]   = useState(NIGERIAN_UNIVERSITIES[0]);
  const [showUniDrop, setShowUniDrop] = useState(false);
  const [activeTab, setActiveTab]   = useState('All');
  const [search, setSearch]         = useState({
    university: '',
    campus: '',
    accommodation: '',
    roomRegion: '',
    junction: '',
    distance: '',
    moveIn: '',
    price: '',
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['listings', 'trending'],
    queryFn: () => api.get('/listings?limit=3&category=trending').then(r => r.data),
  });

  const { data: campusData, isLoading: campusLoading } = useQuery({
    queryKey: ['listings', 'on-campus'],
    queryFn: () => api.get('/listings?limit=3&category=on_campus').then(r => r.data),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/search?${params}`);
  };

  /* ── inline styles (avoids Tailwind token issues) ── */
  const S = {
    page: {
      fontFamily: "'Outfit', sans-serif",
      background: '#0a0a0a',
      minHeight: '100vh',
      paddingBottom: 120,
      color: '#fff',
    },

    /* ── University pill ── */
    uniWrap: { padding: '20px 20px 0', position: 'relative', display: 'inline-block' },
    uniPill: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.35)',
      color: '#ff6b00', padding: '8px 16px', borderRadius: 100,
      fontSize: 13, fontWeight: 600, cursor: 'pointer', userSelect: 'none',
    },
    uniDrop: {
      position: 'absolute', top: '110%', left: 0, zIndex: 100,
      background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '8px 0', minWidth: 280,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    },
    uniDropItem: {
      padding: '10px 18px', fontSize: 13, cursor: 'pointer', color: '#fff',
    },

    /* ── Hero text ── */
    heroSection: { padding: '24px 20px 32px' },
    heroTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: 'clamp(2.4rem, 9vw, 4.5rem)',
      fontWeight: 900, lineHeight: 1.05,
      color: '#fff', margin: '0 0 10px',
    },
    heroTitleOrange: { color: '#ff6b00' },
    heroSub: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 400 },

    /* ── Search grid ── */
    searchCard: {
      margin: '0 16px',
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 20, padding: 16,
    },
    searchGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 1,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 12, overflow: 'hidden',
    },
    searchField: {
      background: '#141414',
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 3,
    },
    searchLabel: {
      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
    },
    searchSelect: {
      background: 'transparent', border: 'none', outline: 'none',
      color: '#fff', fontSize: 13, fontWeight: 500,
      fontFamily: "'Outfit', sans-serif", cursor: 'pointer', width: '100%',
    },
    searchInput: {
      background: 'transparent', border: 'none', outline: 'none',
      color: '#fff', fontSize: 13, fontWeight: 500,
      fontFamily: "'Outfit', sans-serif", width: '100%',
    },
    searchBtn: {
      marginTop: 12, width: '100%',
      background: '#ff6b00', color: '#fff',
      border: 'none', borderRadius: 12,
      padding: '14px 0', fontSize: 15, fontWeight: 600,
      fontFamily: "'Outfit', sans-serif",
      cursor: 'pointer', letterSpacing: '0.01em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    },

    /* ── Category tabs ── */
    tabsWrap: {
      display: 'flex', gap: 8, overflowX: 'auto',
      padding: '24px 16px 0', scrollbarWidth: 'none',
    },
    tab: (active) => ({
      padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
      whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
      fontFamily: "'Outfit', sans-serif",
      background: active ? '#ff6b00' : 'rgba(255,255,255,0.07)',
      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
      transition: 'all 0.18s',
    }),

    /* ── Section header ── */
    secHeader: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '28px 20px 14px',
    },
    secTitle: { fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 },
    secSub:   { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
    seeAll:   { color: '#ff6b00', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },

    /* ── Grid ── */
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '0 16px' },
    gridDesktop: { gridTemplateColumns: 'repeat(3, 1fr)' },

    /* ── Skeleton ── */
    skeleton: { background: 'rgba(255,255,255,0.05)', borderRadius: 14, height: 220, animation: 'pulse 1.4s ease-in-out infinite' },

    /* ── Landlord CTA ── */
    cta: {
      margin: '32px 16px 0',
      background: 'linear-gradient(135deg,rgba(255,107,0,0.12),rgba(255,107,0,0.04))',
      border: '1px solid rgba(255,107,0,0.25)', borderRadius: 18,
      padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14,
    },
    ctaIcon: { fontSize: 30, flexShrink: 0 },
    ctaTitle: { fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 },
    ctaSub:   { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
    ctaBtn:   {
      marginLeft: 'auto', flexShrink: 0,
      background: '#ff6b00', color: '#fff', border: 'none',
      borderRadius: 100, padding: '10px 18px', fontSize: 13, fontWeight: 600,
      fontFamily: "'Outfit', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap',
    },
  };

  const SEARCH_FIELDS = [
    { key: 'university',     label: 'University',            type: 'select', options: ['Any university', ...NIGERIAN_UNIVERSITIES] },
    { key: 'campus',         label: 'Campus',                type: 'select', options: CAMPUS_OPTIONS },
    { key: 'accommodation',  label: 'Accommodation',         type: 'select', options: ACCOM_TYPES },
    { key: 'roomRegion',     label: 'Room Region',           type: 'select', options: ROOM_REGIONS },
    { key: 'junction',       label: 'Junction',              type: 'select', options: JUNCTIONS },
    { key: 'distance',       label: 'Distance from School',  type: 'select', options: DISTANCES },
    { key: 'moveIn',         label: 'Move-in Date',          type: 'date' },
    { key: 'price',          label: 'Price / Year',          type: 'select', options: PRICE_RANGES },
  ];

  const fieldIcon = (key) => ({
    university: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    campus: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    accommodation: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    roomRegion: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
    junction: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    distance: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
    moveIn: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    price: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  }[key]);

  const Skeleton = () => (
    <div style={{ ...S.skeleton }} />
  );

  const listings = (data) => data?.listings ?? data?.data ?? [];

  return (
    <main style={S.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .search-select option { background: #1a1a1a; color: #fff; }
        .search-input-date::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        .tab-btn:hover { opacity: 0.85; }
        .search-btn-el:hover { background: #e55f00 !important; }
        .cta-btn-el:hover { background: #e55f00 !important; }
        @media (min-width: 768px) {
          .search-grid-el { grid-template-columns: repeat(4, 1fr) !important; }
          .listings-grid-el { grid-template-columns: repeat(3, 1fr) !important; }
          .hero-title-el { font-size: 4rem !important; }
          .hero-section-el { padding: 32px 40px 40px !important; }
          .search-card-el { margin: 0 40px !important; }
          .tabs-wrap-el { padding: 28px 40px 0 !important; }
          .sec-header-el { padding: 32px 40px 16px !important; }
          .grid-el { padding: 0 40px !important; }
          .cta-el { margin: 40px 40px 0 !important; }
          .uni-wrap-el { padding: 28px 40px 0 !important; }
        }
      `}</style>

      {/* ── University Selector ── */}
      <div style={S.uniWrap} className="uni-wrap-el">
        <div
          style={S.uniPill}
          onClick={() => setShowUniDrop((v) => !v)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          {activeUni}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        {showUniDrop && (
          <div style={S.uniDrop}>
            {NIGERIAN_UNIVERSITIES.map((u) => (
              <div
                key={u}
                style={{
                  ...S.uniDropItem,
                  background: u === activeUni ? 'rgba(255,107,0,0.1)' : 'transparent',
                  color: u === activeUni ? '#ff6b00' : '#fff',
                }}
                onClick={() => { setActiveUni(u); setShowUniDrop(false); setSearch(s => ({ ...s, university: u })); }}
              >
                {u}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Hero Title ── */}
      <section style={S.heroSection} className="hero-section-el">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 style={S.heroTitle} className="hero-title-el">
            Find your room<br />
            near <span style={S.heroTitleOrange}>{activeUni.replace(/\s*\(.*\)/, '')}</span>
          </h1>
          <p style={S.heroSub}>Verified rooms · No broker fees · Split rent with Cluster</p>
        </motion.div>
      </section>

      {/* ── 8-Field Search Card ── */}
      <div style={S.searchCard} className="search-card-el">
        <div style={S.searchGrid} className="search-grid-el">
          {SEARCH_FIELDS.map((field, i) => (
            <div
              key={field.key}
              style={{
                ...S.searchField,
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <span style={{ ...S.searchLabel, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'rgba(255,107,0,0.7)' }}>{fieldIcon(field.key)}</span>
                {field.label}
              </span>
              {field.type === 'select' ? (
                <select
                  className="search-select"
                  style={S.searchSelect}
                  value={search[field.key]}
                  onChange={(e) => setSearch(s => ({ ...s, [field.key]: e.target.value }))}
                >
                  {field.options.map(o => <option key={o} value={o === field.options[0] ? '' : o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="date"
                  className="search-input-date"
                  style={S.searchInput}
                  value={search[field.key]}
                  onChange={(e) => setSearch(s => ({ ...s, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <button
          style={S.searchBtn}
          className="search-btn-el"
          onClick={handleSearch}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Search Rooms
        </button>
      </div>

      {/* ── Category Tabs ── */}
      <div style={S.tabsWrap} className="tabs-wrap-el">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            className="tab-btn"
            style={S.tab(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'All' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 4 }}>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Trending Section ── */}
      <div style={S.secHeader} className="sec-header-el">
        <div>
          <h2 style={S.secTitle}>
            {activeTab === 'All' ? 'Filtered' : activeTab}
          </h2>
          <p style={S.secSub}>near {activeUni.replace(/\s*\(.*\)/, '')}</p>
        </div>
        <button style={S.seeAll} onClick={() => navigate('/search')}>See all →</button>
      </div>

      <div style={S.grid} className="listings-grid-el grid-el">
        {trendingLoading
          ? [0, 1, 2].map(i => <Skeleton key={i} />)
          : listings(trendingData).map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
      </div>

      {/* ── On Campus Section ── */}
      <div style={S.secHeader} className="sec-header-el">
        <div>
          <h2 style={S.secTitle}>On Campus</h2>
          <p style={S.secSub}>Campus hostels & student housing</p>
        </div>
        <button style={S.seeAll} onClick={() => navigate('/search?campus=on_campus')}>See all →</button>
      </div>

      <div style={S.grid} className="listings-grid-el grid-el">
        {campusLoading
          ? [0, 1, 2].map(i => <Skeleton key={i} />)
          : listings(campusData).map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
      </div>

      {/* ── Landlord CTA ── */}
      <div style={S.cta} className="cta-el">
        <span style={S.ctaIcon}>🏡</span>
        <div>
          <div style={S.ctaTitle}>Are you a landlord?</div>
          <div style={S.ctaSub}>List your property, reach thousands of students free</div>
        </div>
        <button style={S.ctaBtn} className="cta-btn-el" onClick={() => navigate('/login')}>
          List Now
        </button>
      </div>
    </main>
  );
}
