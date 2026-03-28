import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

// ── Feather-style SVG icons ──────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => {
  const paths = {
    search:      <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    mapPin:      <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    home:        <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    grid:        <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    trendingUp:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    users:       <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    layers:      <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    sliders:     <><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>,
    chevronDown: <polyline points="6 9 12 15 18 9"/>,
    chevronRight:<polyline points="9 18 15 12 9 6"/>,
    arrowRight:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    building:    <><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="7" x2="9" y2="7"/><line x1="4" y1="12" x2="9" y2="12"/><line x1="4" y1="17" x2="9" y2="17"/><line x1="15" y1="7" x2="20" y2="7"/><line x1="15" y1="12" x2="20" y2="12"/><line x1="15" y1="17" x2="20" y2="17"/></>,
    calendar:    <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    dollar:      <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    ruler:       <><path d="M21.3 8.7l-9 9a1 1 0 0 1-1.4 0l-6.6-6.6a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 1.4 0l6.6 6.6a1 1 0 0 1 0 1.4z"/><line x1="7.5" y1="10.5" x2="9" y2="12"/><line x1="10.5" y1="7.5" x2="12" y2="9"/><line x1="13.5" y1="4.5" x2="15" y2="6"/></>,
    user:        <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    heart:       <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
    plus:        <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    messageCircle:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    moreHoriz:   <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    bookmark:    <><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></>,
    share:       <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    video:       <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    zap:         <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ── Data ─────────────────────────────────────────────────────────────────────
const UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Port Harcourt (UNIPORT)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria (UNN)',
  'Ahmadu Bello University (ABU)',
  'University of Ibadan (UI)',
  'Federal University of Technology Akure (FUTA)',
  'Covenant University',
  'Babcock University',
  'Rivers State University (RSU)',
];

const ACCOMMODATION_TYPES = ['Room', 'Roommate', 'Self-contain', 'Mini flat', 'Apartment', 'BQ'];
const ROOM_REGIONS = ['On campus', 'Off campus', 'Near gate', 'Town'];
const JUNCTIONS = ['Main gate', 'Back gate', 'School road', 'Market area', 'Town center'];
const DISTANCES = ['< 5 min walk', '5–10 min', '10–20 min', '20–30 min', '> 30 min'];
const PRICE_RANGES = ['Under ₦100k', '₦100k–₦200k', '₦200k–₦400k', '₦400k–₦700k', '₦700k+'];

const TABS = [
  { key: 'all',       label: 'All',       icon: 'grid' },
  { key: 'trending',  label: 'Trending',  icon: 'trendingUp' },
  { key: 'oncampus',  label: 'On Campus', icon: 'building' },
  { key: 'offcampus', label: 'Off Campus',icon: 'mapPin' },
  { key: 'clusters',  label: 'Clusters',  icon: 'users' },
  { key: 'filter',    label: 'Filter',    icon: 'sliders' },
];

const FILTER_ITEMS = [
  { key: 'nearSchool', label: 'Near School', icon: 'ruler' },
  { key: 'byJunction', label: 'By Junction', icon: 'mapPin' },
  { key: 'bySize',     label: 'By Size',     icon: 'layers' },
  { key: 'byUni',      label: 'By University',icon: 'building' },
  { key: 'favourites', label: 'Favourites',  icon: 'heart' },
  { key: 'new',        label: 'New',         icon: 'zap' },
];

// ── Search field component ───────────────────────────────────────────────────
function SearchField({ icon, label, value, onChange, options, type = 'select', placeholder }) {
  return (
    <div className="sf-wrap">
      <div className="sf-icon"><Icon name={icon} size={14} color="#ff6b00" /></div>
      <div className="sf-body">
        <span className="sf-label">{label}</span>
        {type === 'date' ? (
          <input type="date" className="sf-input" value={value} onChange={e => onChange(e.target.value)} />
        ) : options ? (
          <select className="sf-input" value={value} onChange={e => onChange(e.target.value)}>
            <option value="">{placeholder || `Any ${label.toLowerCase()}`}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input className="sf-input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [uniOpen, setUniOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0]);

  // Search state
  const [srch, setSrch] = useState({
    university: '', campus: '', accommodationType: '', roomRegion: '',
    junction: '', distance: '', moveInDate: '', priceRange: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'featured', activeTab, activeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: 12 });
      if (activeTab !== 'all' && activeTab !== 'filter') params.set('category', activeTab);
      if (activeFilter) params.set('filter', activeFilter);
      return api.get(`/listings?${params}`).then(r => r.data);
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(srch).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/search?${params}`);
  };

  return (
    <main style={{ fontFamily: "'Outfit', sans-serif", background: '#0a0a0a', minHeight: '100vh', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,700&display=swap');

        * { box-sizing: border-box; }

        /* ── HERO ── */
        .hero {
          position: relative;
          background: #111;
          padding: 24px 20px 0;
          overflow: hidden;
        }
        @media(min-width:768px){ .hero { padding: 32px 40px 0; } }

        .hero-glow {
          position: absolute;
          top: -120px; right: -120px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        /* university selector */
        .uni-selector {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,107,0,0.1);
          border: 1px solid rgba(255,107,0,0.25);
          border-radius: 100px;
          padding: 6px 14px 6px 10px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 16px;
          position: relative;
          z-index: 10;
        }
        .uni-selector:hover { background: rgba(255,107,0,0.18); }
        .uni-selector span {
          color: #ff6b00;
          font-size: 12px;
          font-weight: 600;
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .uni-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          z-index: 100;
          min-width: 300px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .uni-dropdown-item {
          padding: 12px 16px;
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .uni-dropdown-item:hover { background: rgba(255,107,0,0.12); color: #ff6b00; }
        .uni-dropdown-item.active { color: #ff6b00; font-weight: 600; }

        /* headline */
        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .hero-title em { color: #ff6b00; font-style: normal; }
        .hero-sub {
          color: rgba(255,255,255,0.45);
          font-size: 14px;
          font-weight: 400;
          margin-bottom: 20px;
        }

        /* ── SEARCH BAR ── */
        .search-bar {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 0;
        }

        .search-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        @media(min-width:768px){
          .search-fields { grid-template-columns: repeat(4, 1fr); }
        }
        @media(min-width:1100px){
          .search-fields { grid-template-columns: repeat(8, 1fr); }
        }

        .sf-wrap {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 14px;
          border-right: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: background 0.15s;
          cursor: pointer;
        }
        .sf-wrap:hover { background: rgba(255,107,0,0.06); }

        .sf-icon { margin-top: 1px; flex-shrink: 0; }

        .sf-body { display: flex; flex-direction: column; min-width: 0; flex: 1; }

        .sf-label {
          font-size: 9px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 3px;
        }

        .sf-input {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255,255,255,0.85);
          font-size: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          width: 100%;
          padding: 0;
          cursor: pointer;
          -webkit-appearance: none;
        }
        .sf-input option { background: #1a1a1a; }
        .sf-input::placeholder { color: rgba(255,255,255,0.25); }
        input[type="date"].sf-input::-webkit-calendar-picker-indicator { filter: invert(0.4); }

        .search-action {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .search-btn {
          background: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 11px 24px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .search-btn:hover { background: #e55f00; transform: scale(1.02); }

        /* ── TABS ── */
        .tabs-wrap {
          padding: 0 20px;
          margin-top: 20px;
          position: relative;
        }
        @media(min-width:768px){ .tabs-wrap { padding: 0 40px; } }

        .tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .tabs::-webkit-scrollbar { display: none; }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .tab-btn:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }
        .tab-btn.active {
          background: #ff6b00;
          color: #fff;
          border-color: #ff6b00;
        }
        .tab-btn.filter-tab {
          border: 1px solid rgba(255,255,255,0.12);
          margin-left: 4px;
        }
        .tab-btn.filter-tab.active {
          background: rgba(255,107,0,0.15);
          border-color: rgba(255,107,0,0.4);
          color: #ff6b00;
        }

        /* filter dropdown */
        .filter-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 20px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          z-index: 50;
          min-width: 200px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        @media(min-width:768px){ .filter-dropdown { right: 40px; } }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: all 0.15s;
        }
        .filter-item:last-child { border-bottom: none; }
        .filter-item:hover { background: rgba(255,107,0,0.1); color: #ff6b00; }
        .filter-item.active { color: #ff6b00; font-weight: 600; }

        /* ── LISTINGS SECTION ── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 20px 16px;
        }
        @media(min-width:768px){ .section-header { padding: 32px 40px 20px; } }

        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .section-count {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
          font-weight: 400;
        }

        .see-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ff6b00;
          font-size: 12px;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 20px;
        }
        @media(min-width:640px){ .listings-grid { grid-template-columns: repeat(2, 1fr); } }
        @media(min-width:900px){ .listings-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
        @media(min-width:1200px){ .listings-grid { grid-template-columns: repeat(4, 1fr); padding: 0 40px; } }

        .skeleton {
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          height: 240px;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── CLUSTER BANNER ── */
        .cluster-banner {
          margin: 24px 20px;
          background: linear-gradient(135deg, #ff6b00 0%, #cc5200 100%);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .cluster-banner:hover { transform: scale(1.01); }
        @media(min-width:768px){ .cluster-banner { margin: 28px 40px; padding: 24px 28px; } }

        .cluster-icon-wrap {
          width: 48px; height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .cluster-text { flex: 1; }
        .cluster-title { font-weight: 800; font-size: 16px; color: #fff; margin-bottom: 3px; }
        .cluster-sub { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.4; }

        .cluster-arrow {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.4);
        }
        .empty-icon { margin-bottom: 16px; opacity: 0.3; }
        .empty-title { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .empty-sub { font-size: 13px; margin-bottom: 24px; }
        .empty-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #ff6b00; color: #fff; border: none;
          border-radius: 100px; padding: 12px 24px;
          font-size: 14px; font-weight: 700;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .empty-cta:hover { background: #e55f00; }

        /* ── LANDLORD CTA ── */
        .landlord-cta {
          margin: 12px 20px 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        @media(min-width:768px){ .landlord-cta { margin: 12px 40px 0; } }
        .landlord-icon {
          width: 40px; height: 40px;
          background: rgba(255,107,0,0.1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .landlord-text { flex: 1; }
        .landlord-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .landlord-sub { font-size: 11px; color: rgba(255,255,255,0.4); }
        .landlord-btn {
          background: transparent;
          border: 1px solid rgba(255,107,0,0.4);
          color: #ff6b00;
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .landlord-btn:hover { background: rgba(255,107,0,0.1); }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />

        {/* University Selector */}
        <div style={{ position: 'relative', display: 'inline-block', zIndex: 10 }}>
          <motion.div
            className="uni-selector"
            onClick={() => setUniOpen(o => !o)}
            whileTap={{ scale: 0.97 }}
          >
            <Icon name="building" size={14} color="#ff6b00" />
            <span>{selectedUni}</span>
            <Icon name="chevronDown" size={12} color="#ff6b00" />
          </motion.div>

          <AnimatePresence>
            {uniOpen && (
              <motion.div
                className="uni-dropdown"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {UNIVERSITIES.map(u => (
                  <div
                    key={u}
                    className={`uni-dropdown-item ${selectedUni === u ? 'active' : ''}`}
                    onClick={() => { setSelectedUni(u); setUniOpen(false); }}
                  >
                    {u}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="hero-title">
            Find your room<br />near <em>{selectedUni.split('(')[0].trim()}</em>
          </h1>
          <p className="hero-sub">Verified rooms · No broker fees · Split rent with Cluster</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="search-fields">
            <SearchField icon="building"  label="University"        options={UNIVERSITIES}       value={srch.university}        onChange={v => setSrch(s=>({...s,university:v}))} />
            <SearchField icon="mapPin"    label="Campus"            options={ROOM_REGIONS}       value={srch.campus}            onChange={v => setSrch(s=>({...s,campus:v}))} />
            <SearchField icon="home"      label="Accommodation"     options={ACCOMMODATION_TYPES} value={srch.accommodationType} onChange={v => setSrch(s=>({...s,accommodationType:v}))} />
            <SearchField icon="grid"      label="Room Region"       options={ROOM_REGIONS}       value={srch.roomRegion}        onChange={v => setSrch(s=>({...s,roomRegion:v}))} />
            <SearchField icon="mapPin"    label="Junction"          options={JUNCTIONS}          value={srch.junction}          onChange={v => setSrch(s=>({...s,junction:v}))} />
            <SearchField icon="ruler"     label="Distance"          options={DISTANCES}          value={srch.distance}          onChange={v => setSrch(s=>({...s,distance:v}))} />
            <SearchField icon="calendar"  label="Move-in Date"      type="date"                  value={srch.moveInDate}        onChange={v => setSrch(s=>({...s,moveInDate:v}))} />
            <SearchField icon="dollar"    label="Price / Year"      options={PRICE_RANGES}       value={srch.priceRange}        onChange={v => setSrch(s=>({...s,priceRange:v}))} />
          </div>
          <div className="search-action">
            <button className="search-btn" onClick={handleSearch}>
              <Icon name="search" size={15} color="#fff" />
              Search Rooms
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── TABS ── */}
      <div className="tabs-wrap" style={{ position: 'relative' }}>
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${tab.key === 'filter' ? 'filter-tab' : ''} ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                if (tab.key === 'filter') {
                  setFilterOpen(o => !o);
                  setActiveTab('filter');
                } else {
                  setActiveTab(tab.key);
                  setFilterOpen(false);
                  setActiveFilter(null);
                }
              }}
            >
              <Icon name={tab.icon} size={13} color={activeTab === tab.key ? (tab.key === 'filter' ? '#ff6b00' : '#fff') : 'currentColor'} />
              {tab.label}
              {tab.key === 'filter' && <Icon name="chevronDown" size={11} color={activeTab === 'filter' ? '#ff6b00' : 'currentColor'} />}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {filterOpen && (
            <motion.div
              className="filter-dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {FILTER_ITEMS.map(item => (
                <div
                  key={item.key}
                  className={`filter-item ${activeFilter === item.key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveFilter(item.key);
                    setFilterOpen(false);
                  }}
                >
                  <Icon name={item.icon} size={14} color={activeFilter === item.key ? '#ff6b00' : 'rgba(255,255,255,0.5)'} />
                  {item.label}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CLUSTER BANNER (show on Clusters tab or main) ── */}
      {(activeTab === 'clusters' || activeTab === 'all') && (
        <motion.div
          className="cluster-banner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate('/clusters')}
        >
          <div className="cluster-icon-wrap">
            <Icon name="users" size={22} color="#fff" />
          </div>
          <div className="cluster-text">
            <div className="cluster-title">Split rent with Cluster 🔥</div>
            <div className="cluster-sub">
              Can't afford a room alone? Find a compatible roommate and split the cost. Lock in for just ₦5,000.
            </div>
          </div>
          <div className="cluster-arrow">
            <Icon name="arrowRight" size={16} color="#fff" />
          </div>
        </motion.div>
      )}

      {/* ── LISTINGS ── */}
      <div className="section-header">
        <div>
          <div className="section-title">
            {activeTab === 'all' && 'All Listings'}
            {activeTab === 'trending' && 'Trending Now'}
            {activeTab === 'oncampus' && 'On Campus'}
            {activeTab === 'offcampus' && 'Off Campus'}
            {activeTab === 'clusters' && 'Open Clusters'}
            {activeTab === 'filter' && (FILTER_ITEMS.find(f => f.key === activeFilter)?.label || 'Filtered')}
          </div>
          <div className="section-count">near {selectedUni.split('(')[0].trim()}</div>
        </div>
        <button className="see-all-btn" onClick={() => navigate('/search')}>
          See all <Icon name="chevronRight" size={13} color="#ff6b00" />
        </button>
      </div>

      <div className="listings-grid">
        {isLoading
          ? [...Array(8)].map((_, i) => <div key={i} className="skeleton" />)
          : data?.listings?.length > 0
            ? data.listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))
            : (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-icon">
                  <Icon name="home" size={48} color="rgba(255,255,255,0.3)" />
                </div>
                <div className="empty-title">No listings yet</div>
                <div className="empty-sub">Be the first to list a room for students</div>
                <button className="empty-cta" onClick={() => navigate('/login')}>
                  <Icon name="plus" size={16} color="#fff" />
                  List Your Room
                </button>
              </div>
            )
        }
      </div>

      {/* ── LANDLORD CTA ── */}
      <div className="landlord-cta">
        <div className="landlord-icon">
          <Icon name="home" size={18} color="#ff6b00" />
        </div>
        <div className="landlord-text">
          <div className="landlord-title">Are you a landlord?</div>
          <div className="landlord-sub">Reach thousands of verified students near your property</div>
        </div>
        <button className="landlord-btn" onClick={() => navigate('/login')}>
          List Now
        </button>
      </div>
    </main>
  );
}
