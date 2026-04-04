import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Port Harcourt (UNIPORT)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria Nsukka (UNN)',
  'Ahmadu Bello University (ABU)',
  'University of Ibadan (UI)',
  'University of Benin (UNIBEN)',
  'Federal University of Technology Owerri (FUTO)',
];

const TABS = [
  { id: 'all',        label: 'All' },
  { id: 'trending',   label: 'Trending' },
  { id: 'on_campus',  label: 'On Campus' },
  { id: 'off_campus', label: 'Off Campus' },
  { id: 'clusters',   label: 'Clusters' },
];

const FILTER_OPTIONS = [
  { id: 'near_school', label: 'Near School',   icon: NearIcon },
  { id: 'junction',    label: 'By Junction',   icon: JunctionIcon },
  { id: 'size',        label: 'By Size',       icon: SizeIcon },
  { id: 'university',  label: 'By University', icon: UniIcon },
  { id: 'favourites',  label: 'Favourites',    icon: HeartSmIcon },
  { id: 'new',         label: 'New',           icon: NewIcon },
  { id: 'map',         label: 'Map View',      icon: MapSmIcon },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('all');
  const [showFilter, setShowFilter]     = useState(false);
  const [showSearch, setShowSearch]     = useState(false);
  const [selectedUni, setSelectedUni]   = useState(UNIVERSITIES[0]);
  const [uniOpen, setUniOpen]           = useState(false);
  const filterRef = useRef(null);
  const uniRef    = useRef(null);

  // Search modal fields
  const [sUniversity, setSUniversity]   = useState('');
  const [sCampus, setSCampus]           = useState('');
  const [sAccomm, setSAccomm]           = useState('');
  const [sRegion, setSRegion]           = useState('');
  const [sJunction, setSJunction]       = useState('');
  const [sDistance, setSDistance]       = useState('');
  const [sMoveIn, setSMoveIn]           = useState('');
  const [sPrice, setSPrice]             = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', 'featured', activeTab],
    queryFn: () => api.get('/listings?limit=6').then(r => r.data),
    retry: 2,
    retryDelay: a => Math.min(1000 * 2 ** a, 8000),
    staleTime: 1000 * 60,
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const h = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (uniRef.current && !uniRef.current.contains(e.target)) setUniOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sUniversity) params.set('search', sUniversity);
    setShowSearch(false);
    navigate(`/search?${params}`);
  };

  const handleFilterSelect = (id) => {
    setShowFilter(false);
    if (id === 'map') { navigate('/map'); return; }
    navigate(`/search?filter=${id}`);
  };

  const listings = data?.listings ?? [];

  return (
    <main style={{ minHeight: '100dvh', background: '#0D0D0D', fontFamily: "'DM Sans', sans-serif", paddingBottom: 90, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .hero-section {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 20px 36px;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(13,13,13,0.15) 0%, rgba(13,13,13,0.55) 45%, rgba(13,13,13,0.97) 100%),
            url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=85') center/cover no-repeat;
          z-index: 0;
        }

        .hero-content { position: relative; z-index: 2; }

        /* University pill */
        .uni-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(12px);
          border-radius: 100px;
          padding: 8px 14px 8px 10px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: background 0.2s;
          max-width: calc(100vw - 40px);
        }
        .uni-pill:hover { background: rgba(255,255,255,0.15); }
        .uni-pill-icon {
          width: 28px; height: 28px;
          background: rgba(255,107,0,0.2);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .uni-pill-text {
          font-size: 13px; font-weight: 600; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 220px;
        }
        .uni-pill-chevron { flex-shrink: 0; opacity: 0.6; }

        /* Uni dropdown */
        .uni-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #1A1A1A;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 8px;
          min-width: 280px;
          z-index: 200;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        }
        .uni-option {
          display: block; width: 100%;
          text-align: left;
          padding: 10px 14px;
          border: none; background: transparent;
          color: rgba(255,255,255,0.75);
          font-size: 13px; font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .uni-option:hover, .uni-option.active {
          background: rgba(255,107,0,0.12);
          color: #ff6b00;
        }

        /* Hero title */
        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.6rem, 9vw, 4.5rem);
          font-weight: 700;
          line-height: 1.08;
          color: #fff;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .hero-title .orange { color: #ff6b00; font-style: italic; }

        .hero-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 28px;
          letter-spacing: 0.02em;
        }
        .hero-sub span { margin: 0 6px; opacity: 0.4; }

        /* Search trigger button */
        .search-trigger {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          backdrop-filter: blur(12px);
        }
        .search-trigger:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,107,0,0.3);
        }
        .search-trigger-text {
          flex: 1;
          text-align: left;
        }
        .search-trigger-label {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }
        .search-trigger-value {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }
        .search-go-btn {
          background: #ff6b00;
          border: none;
          border-radius: 12px;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.15s;
        }
        .search-go-btn:hover { background: #e55f00; transform: scale(1.05); }

        /* Search Modal */
        .search-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: flex-end;
        }
        .search-modal {
          width: 100%;
          background: #141414;
          border-radius: 24px 24px 0 0;
          padding: 24px 20px 40px;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom: none;
          max-height: 85vh;
          overflow-y: auto;
        }
        .search-modal-handle {
          width: 36px; height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 100px;
          margin: 0 auto 20px;
        }
        .search-modal-title {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
        }
        .search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .search-field {
          background: #1C1C1C;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.15s;
          border: none;
          text-align: left;
          width: 100%;
        }
        .search-field:hover { background: #222; }
        .search-field-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .search-field-value {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          font-family: 'DM Sans', sans-serif;
        }
        .search-field input {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }
        .search-field input::placeholder { color: rgba(255,255,255,0.3); }
        .search-submit {
          width: 100%;
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }
        .search-submit:hover { background: #e55f00; }

        /* Tabs + filter row */
        .tabs-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tabs-row::-webkit-scrollbar { display: none; }

        .tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid transparent;
          font-size: 13px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .tab-btn.active {
          background: #fff;
          color: #0D0D0D;
          border-color: #fff;
        }
        .tab-btn.inactive {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.08);
        }
        .tab-btn.inactive:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.9);
        }

        /* Filter button */
        .filter-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px;
          border-radius: 100px;
          border: 1px solid rgba(255,107,0,0.5);
          background: rgba(255,107,0,0.1);
          color: #ff6b00;
          font-size: 13px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          flex-shrink: 0;
          position: relative;
        }
        .filter-btn:hover { background: rgba(255,107,0,0.18); }

        /* Filter dropdown */
        .filter-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #1A1A1A;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 8px;
          min-width: 200px;
          z-index: 200;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        }
        .filter-option {
          display: flex; align-items: center; gap: 10px;
          width: 100%;
          padding: 10px 14px;
          border: none; background: transparent;
          color: rgba(255,255,255,0.75);
          font-size: 13px; font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
          text-align: left;
        }
        .filter-option:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .filter-option.map-option { color: #ff6b00; }
        .filter-option.map-option:hover { background: rgba(255,107,0,0.1); }
        .filter-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 4px 0;
        }

        /* Listings section */
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 20px 14px;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 18px; font-weight: 700; color: #fff;
        }
        .see-all-btn {
          font-size: 13px; font-weight: 600; color: #ff6b00;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          padding: 0 20px;
        }

        .skeleton-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          height: 260px;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.45} }

        .empty-state {
          grid-column: 1/-1;
          text-align: center;
          padding: 60px 20px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-title {
          font-family: 'Fraunces', serif;
          font-size: 18px; font-weight: 700;
          color: rgba(255,255,255,0.8); margin-bottom: 8px;
        }
        .empty-sub { font-size: 13px; color: rgba(255,255,255,0.35); }
        .retry-btn {
          margin-top: 16px;
          background: rgba(255,107,0,0.12);
          border: 1px solid rgba(255,107,0,0.35);
          color: #ff6b00;
          padding: 10px 24px; border-radius: 100px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg" />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* University selector pill */}
          <div ref={uniRef} style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <button className="uni-pill" onClick={() => setUniOpen(o => !o)}>
              <span className="uni-pill-icon">
                <GridIcon />
              </span>
              <span className="uni-pill-text">{selectedUni}</span>
              <span className="uni-pill-chevron">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            <AnimatePresence>
              {uniOpen && (
                <motion.div
                  className="uni-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  {UNIVERSITIES.map(u => (
                    <button
                      key={u}
                      className={`uni-option ${u === selectedUni ? 'active' : ''}`}
                      onClick={() => { setSelectedUni(u); setUniOpen(false); }}
                    >
                      {u}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <h1 className="hero-title">
            Find your room<br />
            near <span className="orange">{selectedUni.split('(')[0].trim()}</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub">
            Verified rooms <span>·</span> No broker fees <span>·</span> Split rent with Cluster
          </p>

          {/* Search trigger */}
          <button className="search-trigger" onClick={() => setShowSearch(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="search-trigger-text">
              <span className="search-trigger-label">Search rooms</span>
              <span className="search-trigger-value">University · Campus · Accommodation…</span>
            </span>
            <button className="search-go-btn" onClick={e => { e.stopPropagation(); setShowSearch(true); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </button>
        </motion.div>
      </section>

      {/* ── TABS + FILTER ROW ── */}
      <div className="tabs-row">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.id === 'all' && <GridIcon size={13} color={activeTab === 'all' ? '#0D0D0D' : 'rgba(255,255,255,0.5)'} />}
            {tab.label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Filter button */}
        <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button className="filter-btn" onClick={() => setShowFilter(o => !o)}>
            <FilterIcon />
            Filter
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2.5"
              style={{ transform: showFilter ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                className="filter-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                {FILTER_OPTIONS.filter(f => f.id !== 'map').map(opt => (
                  <button
                    key={opt.id}
                    className="filter-option"
                    onClick={() => handleFilterSelect(opt.id)}
                  >
                    <opt.icon />
                    {opt.label}
                  </button>
                ))}
                <div className="filter-divider" />
                <button className="filter-option map-option" onClick={() => handleFilterSelect('map')}>
                  <MapSmIcon color="#ff6b00" />
                  Map View
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── LISTINGS ── */}
      <div className="section-header">
        <h2 className="section-title">
          {activeTab === 'all'        && 'All Rooms'}
          {activeTab === 'trending'   && 'Trending'}
          {activeTab === 'on_campus'  && 'On Campus'}
          {activeTab === 'off_campus' && 'Off Campus'}
          {activeTab === 'clusters'   && 'Clusters'}
        </h2>
        <button className="see-all-btn" onClick={() => navigate('/search')}>See all →</button>
      </div>

      <div className="listings-grid">
        {isLoading && [...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}

        {isError && (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <p className="empty-title">Couldn't load rooms</p>
            <p className="empty-sub">Server may be waking up. Try again.</p>
            <button className="retry-btn" onClick={() => refetch()}>Retry</button>
          </div>
        )}

        {!isLoading && !isError && listings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <p className="empty-title">No listings yet</p>
            <p className="empty-sub">Be the first to list a property on Unilo.</p>
          </div>
        )}

        {!isLoading && !isError && listings.map((listing, i) => (
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

      {/* ── SEARCH MODAL ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}
          >
            <motion.div
              className="search-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="search-modal-handle" />
              <p className="search-modal-title">Search Rooms</p>

              <div className="search-grid">
                <div className="search-field" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">University</span>
                  <input
                    placeholder="Any university"
                    value={sUniversity}
                    onChange={e => setSUniversity(e.target.value)}
                  />
                </div>
                <div className="search-field" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">Campus</span>
                  <input
                    placeholder="Any campus"
                    value={sCampus}
                    onChange={e => setSCampus(e.target.value)}
                  />
                </div>
                <div className="search-field" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">Accommodation</span>
                  <input
                    placeholder="Any accommodation"
                    value={sAccomm}
                    onChange={e => setSAccomm(e.target.value)}
                  />
                </div>
                <div className="search-field" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">Room Region</span>
                  <input
                    placeholder="Any room region"
                    value={sRegion}
                    onChange={e => setSRegion(e.target.value)}
                  />
                </div>
                <div className="search-field" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">Junction</span>
                  <input
                    placeholder="Any junction"
                    value={sJunction}
                    onChange={e => setSJunction(e.target.value)}
                  />
                </div>
                <div className="search-field" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">Distance</span>
                  <input
                    placeholder="Any distance"
                    value={sDistance}
                    onChange={e => setSDistance(e.target.value)}
                  />
                </div>
                <div className="search-field">
                  <span className="search-field-label">Move-in Date</span>
                  <input
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={sMoveIn}
                    onChange={e => setSMoveIn(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="search-field" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="search-field-label">Price / Year</span>
                  <input
                    placeholder="Any price / year"
                    value={sPrice}
                    onChange={e => setSPrice(e.target.value)}
                  />
                </div>
              </div>

              <button className="search-submit" onClick={handleSearch}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Search Rooms
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GridIcon({ size = 14, color = '#ff6b00' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2.5" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  );
}

function NearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/>
    </svg>
  );
}

function JunctionIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
      <line x1="12" y1="7" x2="12" y2="14"/><line x1="12" y1="14" x2="5" y2="17"/><line x1="12" y1="14" x2="19" y2="17"/>
    </svg>
  );
}

function SizeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  );
}

function UniIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function HeartSmIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function NewIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function MapSmIcon({ color = 'currentColor' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}
