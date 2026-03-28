import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const CATEGORIES = [
  { id: 'all',        icon: '✦',  label: 'All' },
  { id: 'trending',   icon: '🔥', label: 'Trending' },
  { id: 'new',        icon: '✨', label: 'New' },
  { id: 'favorites',  icon: '❤️', label: 'Favourites' },
  { id: 'campus',     icon: '🎓', label: 'On Campus' },
  { id: 'university', icon: '🏫', label: 'By University' },
  { id: 'distance',   icon: '📏', label: 'Near School' },
  { id: 'junction',   icon: '🚦', label: 'By Junction' },
  { id: 'size',       icon: '📐', label: 'By Size' },
];

const ROOM_TYPES = ['All Types', 'Self Contain', 'Shared Room', 'Boys Hostel', 'Girls Hostel', 'Flat', 'Duplex'];
const UNIVERSITIES = ['All Universities', 'UNILAG', 'UI Ibadan', 'UNN', 'ABU Zaria', 'UNIBEN', 'FUTO', 'RSUST', 'ABSU'];
const CITIES = ['All Cities', 'Lagos', 'Ibadan', 'Enugu', 'Port Harcourt', 'Abuja', 'Benin City', 'Owerri', 'Warri'];
const JUNCTIONS = ['Any Junction', 'Beside School Gate', 'Main Market Area', 'Student Zone', 'Express Road'];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [currency, setCurrency] = useState('NGN');
  const searchRef = useRef(null);

  const [filters, setFilters] = useState({
    location: '',
    university: '',
    roomType: '',
    priceMin: '',
    priceMax: '',
    moveIn: '',
    junction: '',
    distance: '',
  });

  // Auto-detect currency by location
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        const map = { NG: 'NGN', US: 'USD', GB: 'GBP', EU: 'EUR' };
        setCurrency(map[d.country_code] || 'NGN');
      })
      .catch(() => setCurrency('NGN'));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchExpanded(false);
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'featured', activeCategory],
    queryFn: () => api.get(`/listings?limit=12&category=${activeCategory}`).then(r => r.data),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/search?${params}`);
  };

  const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }[currency] || '₦';

  return (
    <main style={{ fontFamily: "'Outfit', sans-serif", background: '#0d0d0d', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;1,700&display=swap');

        * { box-sizing: border-box; }

        /* ── STICKY HEADER ── */
        .unilo-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #0d0d0d;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px 10px;
        }

        .logo {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: #ff6b00;
          letter-spacing: -0.5px;
          cursor: pointer;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .host-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          padding: 7px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
          display: none;
        }

        @media (min-width: 640px) { .host-btn { display: block; } }

        .host-btn:hover {
          background: rgba(255,107,0,0.1);
          border-color: #ff6b00;
          color: #ff6b00;
        }

        .avatar-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,107,0,0.15);
          border: 1.5px solid rgba(255,107,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .avatar-btn:hover { background: rgba(255,107,0,0.25); }

        /* ── SEARCH PILL (mobile) ── */
        .search-pill-wrapper {
          padding: 0 16px 14px;
        }

        .search-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-pill:hover {
          border-color: rgba(255,107,0,0.4);
          background: rgba(255,107,0,0.06);
        }

        .search-pill-icon {
          color: #ff6b00;
          font-size: 15px;
          flex-shrink: 0;
        }

        .search-pill-text {
          flex: 1;
        }

        .search-pill-main {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          display: block;
        }

        .search-pill-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          display: block;
          margin-top: 1px;
        }

        .search-pill-filter {
          background: rgba(255,107,0,0.15);
          border: 1px solid rgba(255,107,0,0.3);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 11px;
          color: #ff6b00;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        /* ── EXPANDED SEARCH (desktop full bar + mobile modal) ── */
        .search-expanded-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 200;
          backdrop-filter: blur(4px);
        }

        .search-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 201;
          background: #161616;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 0 0 24px 24px;
        }

        @media (min-width: 768px) {
          .search-modal {
            top: 50%;
            left: 50%;
            right: auto;
            transform: translate(-50%, -50%);
            width: 700px;
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.1);
          }
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        .close-btn {
          width: 30px;
          height: 30px;
          background: rgba(255,255,255,0.08);
          border: none;
          border-radius: 50%;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (min-width: 640px) {
          .search-fields { grid-template-columns: repeat(3, 1fr); }
        }

        .field-box {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .field-box:hover, .field-box.active {
          border-color: #ff6b00;
          background: rgba(255,107,0,0.08);
        }

        .field-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 5px;
          display: block;
        }

        .field-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Outfit', sans-serif;
          width: 100%;
        }

        .field-input::placeholder { color: rgba(255,255,255,0.3); }

        .field-select {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Outfit', sans-serif;
          width: 100%;
          cursor: pointer;
        }

        .field-select option { background: #1a1a1a; color: #fff; }

        .price-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .search-go-btn {
          width: 100%;
          margin-top: 14px;
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 15px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .search-go-btn:hover { background: #e05a00; }

        /* ── DESKTOP FULL BAR ── */
        .desktop-search-bar {
          display: none;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 6px 6px 6px 20px;
          margin: 0 40px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .desktop-search-bar:hover {
          border-color: rgba(255,107,0,0.4);
        }

        @media (min-width: 768px) { .desktop-search-bar { display: flex; } }
        @media (min-width: 768px) { .search-pill-wrapper { display: none; } }

        .dsb-field {
          flex: 1;
          padding: 6px 16px;
          border-right: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
        }

        .dsb-field:last-of-type { border-right: none; }

        .dsb-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 2px;
        }

        .dsb-value {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
        }

        .dsb-search-btn {
          background: #ff6b00;
          border: none;
          border-radius: 100px;
          padding: 10px 20px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .dsb-search-btn:hover { background: #e05a00; }

        /* ── CATEGORY TABS ── */
        .category-bar {
          display: flex;
          gap: 0;
          overflow-x: auto;
          padding: 0 16px;
          scrollbar-width: none;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        @media (min-width: 768px) { .category-bar { padding: 0 40px; } }

        .category-bar::-webkit-scrollbar { display: none; }

        .cat-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 16px;
          white-space: nowrap;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          color: rgba(255,255,255,0.45);
          font-family: 'Outfit', sans-serif;
        }

        .cat-tab:hover { color: rgba(255,255,255,0.8); }

        .cat-tab.active {
          color: #ff6b00;
          border-bottom-color: #ff6b00;
        }

        .cat-icon { font-size: 18px; line-height: 1; }
        .cat-label { font-size: 11px; font-weight: 600; }

        /* ── LISTINGS GRID ── */
        .listings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          padding: 0;
        }

        @media (min-width: 768px) {
          .listings-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1100px) {
          .listings-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .skeleton-card {
          aspect-ratio: 4/5;
          background: rgba(255,255,255,0.04);
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          gap: 12px;
        }

        .empty-icon { font-size: 48px; }
        .empty-title { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.6); }
        .empty-sub { font-size: 14px; }

        .add-listing-btn {
          margin-top: 16px;
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
        }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <header className="unilo-header">
        <div className="header-top">
          <div className="logo" onClick={() => navigate('/')}>unilo</div>
          <div className="header-actions">
            <button className="host-btn" onClick={() => navigate('/login')}>
              List your room
            </button>
            <div className="avatar-btn" onClick={() => navigate('/login')}>
              👤
            </div>
          </div>
        </div>

        {/* Desktop full search bar */}
        <div className="desktop-search-bar" onClick={() => setSearchExpanded(true)}>
          <div className="dsb-field">
            <span className="dsb-label">Location</span>
            <span className="dsb-value">{filters.location || 'City or area'}</span>
          </div>
          <div className="dsb-field">
            <span className="dsb-label">University</span>
            <span className="dsb-value">{filters.university || 'Any university'}</span>
          </div>
          <div className="dsb-field">
            <span className="dsb-label">Junction</span>
            <span className="dsb-value">{filters.junction || 'Any junction'}</span>
          </div>
          <div className="dsb-field">
            <span className="dsb-label">Room Type</span>
            <span className="dsb-value">{filters.roomType || 'All types'}</span>
          </div>
          <div className="dsb-field">
            <span className="dsb-label">Price</span>
            <span className="dsb-value">
              {filters.priceMin || filters.priceMax
                ? `${currencySymbol}${filters.priceMin || '0'} – ${currencySymbol}${filters.priceMax || '∞'}`
                : 'Any price'}
            </span>
          </div>
          <button className="dsb-search-btn" onClick={(e) => { e.stopPropagation(); handleSearch(); }}>
            🔍 Search
          </button>
        </div>

        {/* Mobile compact pill */}
        <div className="search-pill-wrapper">
          <div className="search-pill" onClick={() => setSearchExpanded(true)}>
            <span className="search-pill-icon">🔍</span>
            <div className="search-pill-text">
              <span className="search-pill-main">Where are you studying?</span>
              <span className="search-pill-sub">Any city · Any type · Any price</span>
            </div>
            <span className="search-pill-filter">Filters</span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="category-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── EXPANDED SEARCH MODAL ── */}
      <AnimatePresence>
        {searchExpanded && (
          <>
            <motion.div
              className="search-expanded-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchExpanded(false)}
            />
            <motion.div
              className="search-modal"
              ref={searchRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-close">
                <span className="modal-title">Find your room</span>
                <button className="close-btn" onClick={() => setSearchExpanded(false)}>✕</button>
              </div>

              <div className="search-fields">
                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                  <span className="field-label">📍 Location</span>
                  <select
                    className="field-select"
                    value={filters.location}
                    onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                  >
                    {CITIES.map(c => <option key={c} value={c === 'All Cities' ? '' : c}>{c}</option>)}
                  </select>
                </div>

                <div className="field-box">
                  <span className="field-label">🎓 University</span>
                  <select
                    className="field-select"
                    value={filters.university}
                    onChange={e => setFilters(f => ({ ...f, university: e.target.value }))}
                  >
                    {UNIVERSITIES.map(u => <option key={u} value={u === 'All Universities' ? '' : u}>{u}</option>)}
                  </select>
                </div>

                <div className="field-box">
                  <span className="field-label">🚦 Junction</span>
                  <select
                    className="field-select"
                    value={filters.junction}
                    onChange={e => setFilters(f => ({ ...f, junction: e.target.value }))}
                  >
                    {JUNCTIONS.map(j => <option key={j} value={j === 'Any Junction' ? '' : j}>{j}</option>)}
                  </select>
                </div>

                <div className="field-box">
                  <span className="field-label">🏠 Room Type</span>
                  <select
                    className="field-select"
                    value={filters.roomType}
                    onChange={e => setFilters(f => ({ ...f, roomType: e.target.value }))}
                  >
                    {ROOM_TYPES.map(t => <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>)}
                  </select>
                </div>

                <div className="field-box">
                  <span className="field-label">📏 Distance from School</span>
                  <select
                    className="field-select"
                    value={filters.distance}
                    onChange={e => setFilters(f => ({ ...f, distance: e.target.value }))}
                  >
                    <option value="">Any distance</option>
                    <option value="0.5">Under 500m</option>
                    <option value="1">Under 1km</option>
                    <option value="3">Under 3km</option>
                    <option value="5">Under 5km</option>
                  </select>
                </div>

                <div className="field-box">
                  <span className="field-label">📅 Move-in Date</span>
                  <input
                    type="date"
                    className="field-input"
                    value={filters.moveIn}
                    onChange={e => setFilters(f => ({ ...f, moveIn: e.target.value }))}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="field-box" style={{ gridColumn: 'span 2' }}>
                  <span className="field-label">{currencySymbol} Price Range (per year)</span>
                  <div className="price-row">
                    <input
                      className="field-input"
                      placeholder={`Min (${currencySymbol})`}
                      value={filters.priceMin}
                      onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
                    />
                    <input
                      className="field-input"
                      placeholder={`Max (${currencySymbol})`}
                      value={filters.priceMax}
                      onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <button className="search-go-btn" onClick={() => { setSearchExpanded(false); handleSearch(); }}>
                🔍 Search Rooms
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── LISTINGS GRID ── */}
      <div className="listings-grid">
        {isLoading
          ? [...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)
          : data?.listings?.length > 0
            ? data.listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ListingCard listing={listing} currency={currency} currencySymbol={currencySymbol} />
                </motion.div>
              ))
            : (
              <div className="empty-state">
                <span className="empty-icon">🏠</span>
                <div className="empty-title">No listings yet</div>
                <div className="empty-sub">Be the first to list a room for students</div>
                <button className="add-listing-btn" onClick={() => navigate('/login')}>
                  List Your Room →
                </button>
              </div>
            )
        }
      </div>
    </main>
  );
}
