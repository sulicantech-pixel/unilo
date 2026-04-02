import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const CITIES = ['Port Harcourt', 'Lagos', 'Ibadan', 'Abuja', 'Enugu', 'Benin City', 'Warri', 'Owerri'];

const HERO_STATS = [
  { value: '12,000+', label: 'Verified Rooms' },
  { value: '48', label: 'Universities' },
  { value: '0', label: 'Broker Fees' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  // ── FIXED: added isError + proper retry/stale config ──────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => api.get('/listings?limit=6').then((r) => r.data),
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    staleTime: 1000 * 60, // 1 minute
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/search?${params}`);
  };

  // ── Listings content — handles loading, error, empty, and success ──────────
  const renderListings = () => {
    if (isLoading) {
      return [...Array(6)].map((_, i) => <div key={i} className="skeleton" />);
    }

    if (isError) {
      return (
        <div className="error-state">
          <span className="error-icon">📡</span>
          <p className="error-title">Couldn't load listings</p>
          <p className="error-sub">The server might be waking up. Try again in a moment.</p>
          <button className="retry-btn" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      );
    }

    const listings = data?.listings;

    if (!listings || listings.length === 0) {
      return (
        <div className="error-state">
          <span className="error-icon">🏠</span>
          <p className="error-title">No listings yet</p>
          <p className="error-sub">Be the first to list a property on Unilo.</p>
        </div>
      );
    }

    return listings.map((listing, i) => (
      <motion.div
        key={listing.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08 }}
      >
        <ListingCard listing={listing} />
      </motion.div>
    ));
  };

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#0a0a0a', minHeight: '100vh', paddingBottom: '100px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');

        .unilo-hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          padding: 0 20px 40px;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.98) 100%),
            url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80') center/cover no-repeat;
          z-index: 0;
        }

        @media (min-width: 768px) {
          .hero-bg {
            background: 
              linear-gradient(90deg, rgba(10,10,10,0.95) 45%, rgba(10,10,10,0.3) 100%),
              url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&q=80') center/cover no-repeat;
          }
          .unilo-hero {
            min-height: 90vh;
            justify-content: center;
            padding: 80px 60px;
          }
          .hero-content {
            max-width: 600px;
          }
        }

        .orange-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,107,0,0.15);
          border: 1px solid rgba(255,107,0,0.3);
          color: #ff6b00;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 8vw, 5rem);
          font-weight: 800;
          line-height: 1.05;
          color: #ffffff;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .hero-title span {
          color: #ff6b00;
          position: relative;
        }

        .hero-sub {
          color: rgba(255,255,255,0.6);
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .search-box {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 16px;
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .search-box {
            flex-direction: row;
            align-items: center;
            padding: 8px 8px 8px 20px;
            border-radius: 100px;
          }
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          padding: 8px 0;
        }

        .search-input::placeholder {
          color: rgba(255,255,255,0.35);
        }

        .search-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.15);
          display: none;
        }

        @media (min-width: 640px) {
          .search-divider { display: block; }
        }

        .city-select {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 0;
          width: 100%;
        }

        @media (min-width: 640px) {
          .city-select { width: 130px; padding: 0 16px; }
        }

        .city-select option { background: #1a1a1a; color: #fff; }

        .search-btn {
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          width: 100%;
        }

        @media (min-width: 640px) {
          .search-btn { width: auto; }
        }

        .search-btn:hover {
          background: #e55f00;
          transform: scale(1.02);
        }

        .stats-row {
          display: flex;
          gap: 24px;
          margin-top: 28px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #ff6b00;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }

        .stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
          align-self: stretch;
        }

        .city-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 20px 20px 4px;
          scrollbar-width: none;
        }

        .city-pills::-webkit-scrollbar { display: none; }

        .city-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .city-pill:hover {
          background: rgba(255,107,0,0.15);
          border-color: rgba(255,107,0,0.4);
          color: #ff6b00;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 20px 16px;
        }

        @media (min-width: 768px) {
          .section-header { padding: 40px 40px 20px; }
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .see-all {
          color: #ff6b00;
          font-size: 13px;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 0 20px;
        }

        @media (min-width: 640px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .listings-grid { 
            grid-template-columns: repeat(3, 1fr); 
            padding: 0 40px;
          }
        }

        .skeleton {
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          height: 220px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── NEW: error/empty state ── */
        .error-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          text-align: center;
          gap: 8px;
        }

        .error-icon {
          font-size: 40px;
          margin-bottom: 8px;
        }

        .error-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          margin: 0;
        }

        .error-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin: 0;
          max-width: 260px;
        }

        .retry-btn {
          margin-top: 12px;
          background: rgba(255,107,0,0.15);
          border: 1px solid rgba(255,107,0,0.4);
          color: #ff6b00;
          padding: 10px 24px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          background: rgba(255,107,0,0.25);
        }

        .value-props {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 32px 20px;
        }

        @media (min-width: 768px) {
          .value-props { padding: 40px 40px; gap: 20px; }
        }

        .value-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 12px;
          text-align: center;
          transition: all 0.2s;
        }

        .value-card:hover {
          background: rgba(255,107,0,0.08);
          border-color: rgba(255,107,0,0.2);
        }

        .value-icon {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
        }

        .value-label {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          display: block;
          margin-bottom: 4px;
        }

        .value-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          display: block;
        }

        .trust-bar {
          margin: 0 20px 32px;
          background: linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.05));
          border: 1px solid rgba(255,107,0,0.2);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .trust-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .trust-text {
          flex: 1;
        }

        .trust-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .trust-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        .trust-btn {
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {/* HERO */}
      <section className="unilo-hero">
        <div className="hero-bg" />
        <div className="orange-glow" />

        <motion.div
          className="hero-content"
          style={{ position: 'relative', zIndex: 2 }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="badge-pill">
            🏠 Nigeria's #1 Student Housing
          </div>

          <h1 className="hero-title">
            Find your<br />
            <span>perfect room.</span>
          </h1>

          <p className="hero-sub">
            Verified listings, video tours, no broker fees.<br />
            Built for African students.
          </p>

          <form onSubmit={handleSearch} className="search-box">
            <input
              className="search-input"
              placeholder="Search area, university or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="search-divider" />
            <select
              className="city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="search-btn">
              Search →
            </button>
          </form>

          <div className="stats-row">
            {HERO_STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {i > 0 && <div className="stat-divider" />}
                <div className="stat-item">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CITY PILLS */}
      <div className="city-pills">
        {CITIES.map((c) => (
          <button
            key={c}
            className="city-pill"
            onClick={() => navigate(`/search?city=${encodeURIComponent(c)}`)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* LISTINGS */}
      <div className="section-header">
        <h2 className="section-title">Recent Listings</h2>
        <button className="see-all" onClick={() => navigate('/search')}>
          See all →
        </button>
      </div>

      <div className="listings-grid">
        {renderListings()}
      </div>

      {/* VALUE PROPS */}
      <div className="value-props">
        {[
          { icon: '🎥', label: 'Video Tours', desc: 'Watch before you visit' },
          { icon: '✅', label: 'Verified', desc: 'All listings checked' },
          { icon: '📍', label: 'Map View', desc: 'See location live' },
        ].map((item) => (
          <div key={item.label} className="value-card">
            <span className="value-icon">{item.icon}</span>
            <span className="value-label">{item.label}</span>
            <span className="value-desc">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <span className="trust-icon">🤝</span>
        <div className="trust-text">
          <div className="trust-title">Are you a landlord?</div>
          <div className="trust-sub">List your property and reach thousands of students</div>
        </div>
        <button className="trust-btn" onClick={() => navigate('/login')}>
          List Now
        </button>
      </div>
    </main>
  );
}
