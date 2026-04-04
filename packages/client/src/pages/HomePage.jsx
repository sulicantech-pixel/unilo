import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

// ── Data (expand per-university when you have real info) ──────────────────────

const UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Port Harcourt (UNIPORT)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria Nsukka (UNN)',
  'Ahmadu Bello University (ABU)',
  'University of Ibadan (UI)',
  'University of Benin (UNIBEN)',
  'Federal University of Technology Owerri (FUTO)',
  'Lagos State University (LASU)',
  'Covenant University (CU)',
  'Babcock University',
  'Pan-Atlantic University (PAU)',
  'University of Calabar (UNICAL)',
  'Cross River University of Technology (CRUTECH)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Federal University of Agriculture Abeokuta (FUNAAB)',
  'Michael Okpara University of Agriculture (MOUAU)',
  'Rivers State University (RSU)',
  'Niger Delta University (NDU)',
  'Delta State University (DELSU)',
  'Ambrose Alli University (AAU)',
  'Imo State University (IMSU)',
  'Abia State University (ABSU)',
  'Enugu State University of Science and Technology (ESUT)',
  'Kano State University of Science and Technology (KUST)',
  'Bayero University Kano (BUK)',
  'Usmanu Danfodiyo University (UDUS)',
  'Federal University Dutse (FUD)',
  'Kaduna State University (KASU)',
  'University of Ilorin (UNILORIN)',
  'Kwara State University (KWASU)',
  'Osun State University (UNIOSUN)',
  'Ekiti State University (EKSU)',
  'Adekunle Ajasin University (AAUA)',
  'Federal University of Technology Akure (FUTA)',
];

const UNI_DATA = {
  default: {
    campuses: ['Main Campus', 'Medical Campus', 'Agricultural Campus', 'Distance Learning Centre'],
    accommodations: ['Self Contain', 'Room & Parlour', 'Shared Room', 'Flat', 'Hostel', 'Boys Hostel', 'Girls Hostel', 'Mini Flat', 'BQ', 'Duplex'],
    regions: ['Gate Area', 'School Road', 'Staff Quarters Area', 'Town Centre', 'New Layout', 'GRA', 'Market Area', 'Behind School'],
    junctions: ['Main Gate Junction', 'Second Gate Junction', 'Market Junction', 'Hospital Junction', 'Stadium Junction', 'Express Junction'],
    distances: ['On Campus', 'Within 5 mins walk', '5–10 mins walk', '10–20 mins walk', '20–30 mins walk', 'Above 30 mins walk'],
    prices: ['Under ₦100k/yr', '₦100k–₦200k/yr', '₦200k–₦400k/yr', '₦400k–₦600k/yr', '₦600k–₦1m/yr', 'Above ₦1m/yr'],
  },
};

const getUniData = (uni) => UNI_DATA[uni] || UNI_DATA.default;

const TABS = [
  { id: 'all',        label: 'All' },
  { id: 'trending',   label: 'Trending' },
  { id: 'on_campus',  label: 'On Campus' },
  { id: 'off_campus', label: 'Off Campus' },
  { id: 'clusters',   label: 'Clusters' },
];

const FILTER_OPTIONS = [
  { id: 'near_school', label: 'Near School',   Icon: NearIcon },
  { id: 'junction',    label: 'By Junction',   Icon: JunctionIcon },
  { id: 'size',        label: 'By Size',       Icon: SizeIcon },
  { id: 'university',  label: 'By University', Icon: UniIcon },
  { id: 'favourites',  label: 'Favourites',    Icon: HeartSmIcon },
  { id: 'new',         label: 'New',           Icon: NewIcon },
];

// ── Reusable searchable scrollable picker ─────────────────────────────────────
function SearchPicker({ label, value, options, onChange, placeholder }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef(null);
  const inputRef          = useRef(null);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleOpen = () => {
    setOpen(true); setQuery('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleSelect = (opt) => { onChange(opt); setOpen(false); setQuery(''); };
  const handleClear  = (e)   => { e.stopPropagation(); onChange(''); };

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 10 }}>
      <button
        className="search-field"
        onClick={handleOpen}
        style={{ width: '100%', display: 'block', position: 'relative' }}
      >
        <span className="search-field-label">{label}</span>
        <span className="search-field-value" style={{ color: value ? '#fff' : 'rgba(255,255,255,0.28)' }}>
          {value || placeholder}
        </span>
        {value && (
          <span
            onClick={handleClear}
            style={{ position: 'absolute', top: 14, right: 14, color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1, cursor: 'pointer' }}
          >✕</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.13 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, zIndex: 500,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '10px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 190, overflowY: 'auto', padding: '6px 8px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {filtered.length === 0
                ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, padding: '16px 0' }}>No results</p>
                : filtered.map(opt => (
                  <button key={opt} onClick={() => handleSelect(opt)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 12px', border: 'none', borderRadius: 8,
                      background: opt === value ? 'rgba(255,107,0,0.12)' : 'transparent',
                      color: opt === value ? '#ff6b00' : 'rgba(255,255,255,0.8)',
                      fontSize: 13, fontWeight: opt === value ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = 'transparent'; }}
                  >{opt}</button>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('all');
  const [showFilter, setShowFilter]   = useState(false);
  const [showSearch, setShowSearch]   = useState(false);
  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0]);
  const [uniOpen, setUniOpen]         = useState(false);
  const [uniQuery, setUniQuery]       = useState('');
  const filterRef   = useRef(null);
  const uniRef      = useRef(null);
  const uniInputRef = useRef(null);

  const [sUniversity, setSUniversity] = useState('');
  const [sCampus, setSCampus]         = useState('');
  const [sAccomm, setSAccomm]         = useState('');
  const [sRegion, setSRegion]         = useState('');
  const [sJunction, setSJunction]     = useState('');
  const [sDistance, setSDistance]     = useState('');
  const [sMoveIn, setSMoveIn]         = useState('');
  const [sPrice, setSPrice]           = useState('');

  const uniData = getUniData(sUniversity);

  const filteredUnis = useMemo(
    () => UNIVERSITIES.filter(u => u.toLowerCase().includes(uniQuery.toLowerCase())),
    [uniQuery]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', 'featured', activeTab],
    queryFn: () => api.get('/listings?limit=6').then(r => r.data),
    retry: 2,
    retryDelay: a => Math.min(1000 * 2 ** a, 8000),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const h = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (uniRef.current && !uniRef.current.contains(e.target)) { setUniOpen(false); setUniQuery(''); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openUniPicker = () => { setUniOpen(true); setUniQuery(''); setTimeout(() => uniInputRef.current?.focus(), 80); };

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (sUniversity) p.set('search', sUniversity);
    if (sCampus)     p.set('campus', sCampus);
    if (sAccomm)     p.set('type', sAccomm);
    if (sJunction)   p.set('junction', sJunction);
    if (sDistance)   p.set('distance', sDistance);
    if (sPrice)      p.set('price', sPrice);
    setShowSearch(false);
    navigate(`/search?${p}`);
  };

  const handleFilterSelect = (id) => {
    setShowFilter(false);
    if (id === 'map') { navigate('/map'); return; }
    navigate(`/search?filter=${id}`);
  };

  const listings    = data?.listings ?? [];
  const shortUniName = selectedUni.includes('(') ? selectedUni.split('(')[0].trim() : selectedUni;

  return (
    <main style={{ minHeight: '100dvh', background: '#0D0D0D', fontFamily: "'DM Sans', sans-serif", paddingBottom: 90, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600;1,9..144,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        .hero-section{position:relative;min-height:100svh;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;}
        .hero-bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,13,13,0.2) 0%,rgba(13,13,13,0.5) 40%,rgba(13,13,13,0.97) 100%),url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=85') center/cover no-repeat;z-index:0;}

        .hero-top{position:relative;z-index:2;padding:52px 20px 0;}

        .uni-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(13,13,13,0.65);border:1px solid rgba(255,255,255,0.16);backdrop-filter:blur(16px);border-radius:100px;padding:8px 14px 8px 8px;cursor:pointer;transition:background .2s,border-color .2s;max-width:calc(100vw - 40px);}
        .uni-pill:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.28);}
        .uni-pill-icon{width:28px;height:28px;background:rgba(255,107,0,0.22);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .uni-pill-text{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(240px,55vw);}
        .uni-chevron{flex-shrink:0;opacity:.55;margin-left:2px;}

        .uni-dropdown{position:absolute;top:calc(100% + 8px);left:0;background:#1A1A1A;border:1px solid rgba(255,255,255,0.1);border-radius:18px;overflow:hidden;z-index:300;width:min(340px,calc(100vw - 40px));box-shadow:0 20px 60px rgba(0,0,0,0.75);}
        .uni-search-wrap{padding:12px 12px 0;border-bottom:1px solid rgba(255,255,255,0.07);}
        .uni-search-inner{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.07);border-radius:10px;padding:9px 12px;margin-bottom:10px;}
        .uni-search-inner input{flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:13px;font-family:'DM Sans',sans-serif;}
        .uni-search-inner input::placeholder{color:rgba(255,255,255,0.3);}
        .uni-list{max-height:260px;overflow-y:auto;padding:6px 8px 10px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent;}
        .uni-option{display:block;width:100%;text-align:left;padding:10px 14px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .12s;}
        .uni-option:hover{background:rgba(255,255,255,0.06);color:#fff;}
        .uni-option.active{background:rgba(255,107,0,0.12);color:#ff6b00;font-weight:600;}

        .hero-bottom{position:relative;z-index:2;padding:0 20px 36px;}
        .hero-title{font-family:'Fraunces',serif;font-size:clamp(2.4rem,8.5vw,4.2rem);font-weight:700;line-height:1.08;color:#fff;margin-bottom:10px;letter-spacing:-0.02em;}
        .hero-title .orange{color:#ff6b00;font-style:italic;}
        .hero-sub{font-size:13px;color:rgba(255,255,255,0.42);margin-bottom:26px;letter-spacing:.01em;}
        .hero-sub span{margin:0 5px;opacity:.4;}

        .search-trigger{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.13);border-radius:18px;padding:14px 14px 14px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;backdrop-filter:blur(12px);transition:background .2s,border-color .2s;}
        .search-trigger:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,107,0,0.35);}
        .search-trigger-label{display:block;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;}
        .search-trigger-value{display:block;font-size:14px;font-weight:600;color:rgba(255,255,255,0.8);}
        .search-go-btn{background:#ff6b00;border:none;border-radius:12px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s,transform .15s;}
        .search-go-btn:hover{background:#e55f00;transform:scale(1.05);}

        .tabs-row{display:flex;align-items:center;gap:8px;padding:16px 20px 0;overflow-x:auto;scrollbar-width:none;}
        .tabs-row::-webkit-scrollbar{display:none;}
        .tab-btn{display:flex;align-items:center;gap:5px;padding:8px 16px;border-radius:100px;border:1px solid transparent;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;transition:all .15s;flex-shrink:0;}
        .tab-btn.active{background:#fff;color:#0D0D0D;}
        .tab-btn.inactive{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.55);border-color:rgba(255,255,255,0.08);}
        .tab-btn.inactive:hover{background:rgba(255,255,255,0.09);color:rgba(255,255,255,0.9);}

        .filter-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:100px;border:1px solid rgba(255,107,0,0.45);background:rgba(255,107,0,0.1);color:#ff6b00;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;transition:all .15s;flex-shrink:0;position:relative;}
        .filter-btn:hover{background:rgba(255,107,0,0.18);}

        .filter-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:#1A1A1A;border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:8px;min-width:210px;z-index:200;box-shadow:0 16px 48px rgba(0,0,0,0.65);}
        .filter-option{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border:none;background:transparent;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .12s;text-align:left;}
        .filter-option:hover{background:rgba(255,255,255,0.06);color:#fff;}
        .filter-option.map-opt{color:#ff6b00;}
        .filter-option.map-opt:hover{background:rgba(255,107,0,0.1);}
        .filter-divider{height:1px;background:rgba(255,255,255,0.07);margin:4px 0;}

        .section-header{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 14px;}
        .section-title{font-family:'Fraunces',serif;font-size:18px;font-weight:700;color:#fff;}
        .see-all-btn{font-size:13px;font-weight:600;color:#ff6b00;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .listings-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:0 20px;}
        .skeleton-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;height:260px;animation:shimmer 1.5s ease-in-out infinite;}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.45}}
        .empty-state{grid-column:1/-1;text-align:center;padding:60px 20px;}
        .empty-icon{font-size:48px;margin-bottom:12px;}
        .empty-title{font-family:'Fraunces',serif;font-size:18px;font-weight:700;color:rgba(255,255,255,0.8);margin-bottom:8px;}
        .empty-sub{font-size:13px;color:rgba(255,255,255,0.35);}
        .retry-btn{margin-top:16px;background:rgba(255,107,0,0.12);border:1px solid rgba(255,107,0,0.35);color:#ff6b00;padding:10px 24px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}

        .search-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);display:flex;align-items:flex-end;}
        .search-modal{width:100%;background:#141414;border-radius:28px 28px 0 0;border:1px solid rgba(255,255,255,0.08);border-bottom:none;max-height:92vh;overflow-y:auto;scrollbar-width:none;}
        .search-modal::-webkit-scrollbar{display:none;}
        .search-modal-inner{padding:0 20px 48px;}
        .modal-handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:100px;margin:14px auto 20px;}
        .modal-title{font-family:'Fraunces',serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:4px;}
        .modal-subtitle{font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:22px;}
        .modal-section-label{font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:.12em;margin:18px 0 10px;}

        .search-field{position:relative;background:#1C1C1C;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px 16px;cursor:pointer;transition:border-color .15s;text-align:left;}
        .search-field:hover{border-color:rgba(255,107,0,0.3);}
        .search-field-label{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;}
        .search-field-value{display:block;font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;}

        .search-plain-field{background:#1C1C1C;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px 16px;margin-bottom:10px;transition:border-color .15s;}
        .search-plain-field:hover{border-color:rgba(255,107,0,0.3);}
        .search-plain-field input{display:block;width:100%;background:transparent;border:none;outline:none;font-size:14px;font-weight:500;color:#fff;font-family:'DM Sans',sans-serif;}
        .search-plain-field input::placeholder{color:rgba(255,255,255,0.25);}

        .search-two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .search-two-col>div{margin-bottom:0!important;}

        .search-submit{width:100%;background:#ff6b00;color:#fff;border:none;border-radius:16px;padding:17px;font-size:15px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px;transition:background .15s;}
        .search-submit:hover{background:#e55f00;}
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg" />

        {/* TOP — university selector raised to top */}
        <div className="hero-top">
          <div ref={uniRef} style={{ position: 'relative', display: 'inline-block' }}>
            <motion.button
              className="uni-pill"
              onClick={openUniPicker}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="uni-pill-icon"><GridIcon /></span>
              <span className="uni-pill-text">{selectedUni}</span>
              <span className="uni-chevron">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points={uniOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                </svg>
              </span>
            </motion.button>

            <AnimatePresence>
              {uniOpen && (
                <motion.div
                  className="uni-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                >
                  <div className="uni-search-wrap">
                    <div className="uni-search-inner">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        ref={uniInputRef}
                        value={uniQuery}
                        onChange={e => setUniQuery(e.target.value)}
                        placeholder="Search university…"
                      />
                    </div>
                  </div>
                  <div className="uni-list">
                    {filteredUnis.length === 0
                      ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, padding: '16px 0' }}>No results</p>
                      : filteredUnis.map(u => (
                        <button
                          key={u}
                          className={`uni-option ${u === selectedUni ? 'active' : ''}`}
                          onClick={() => { setSelectedUni(u); setUniOpen(false); setUniQuery(''); }}
                        >{u}</button>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM — title + search */}
        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="hero-title">
            Find your room<br />
            near <span className="orange">{shortUniName}</span>
          </h1>
          <p className="hero-sub">
            Verified rooms <span>·</span> No broker fees <span>·</span> Split rent with Cluster
          </p>

          <button className="search-trigger" onClick={() => setShowSearch(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span className="search-trigger-label">Search rooms</span>
              <span className="search-trigger-value">University · Campus · Accommodation…</span>
            </span>
            <button className="search-go-btn" onClick={e => { e.stopPropagation(); setShowSearch(true); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </button>
        </motion.div>
      </section>

      {/* ── TABS + FILTER ── */}
      <div className="tabs-row">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.id === 'all' && <GridIcon size={12} color={activeTab === 'all' ? '#0D0D0D' : 'rgba(255,255,255,0.45)'} />}
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />

        <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button className="filter-btn" onClick={() => setShowFilter(o => !o)}>
            <FilterIcon />
            Filter
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2.5"
              style={{ transform: showFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
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
                transition={{ duration: 0.14 }}
              >
                {FILTER_OPTIONS.map(({ id, label, Icon }) => (
                  <button key={id} className="filter-option" onClick={() => handleFilterSelect(id)}>
                    <Icon />{label}
                  </button>
                ))}
                <div className="filter-divider" />
                <button className="filter-option map-opt" onClick={() => handleFilterSelect('map')}>
                  <MapSmIcon color="#ff6b00" />Map View
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── LISTINGS ── */}
      <div className="section-header">
        <h2 className="section-title">
          {activeTab === 'all' && 'All Rooms'}
          {activeTab === 'trending' && 'Trending'}
          {activeTab === 'on_campus' && 'On Campus'}
          {activeTab === 'off_campus' && 'Off Campus'}
          {activeTab === 'clusters' && 'Clusters'}
        </h2>
        <button className="see-all-btn" onClick={() => navigate('/search')}>See all →</button>
      </div>

      <div className="listings-grid">
        {isLoading && [...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
        {isError && (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <p className="empty-title">Couldn't load rooms</p>
            <p className="empty-sub">Server may be waking up.</p>
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
          <motion.div key={listing.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <ListingCard listing={listing} />
          </motion.div>
        ))}
      </div>

      {/* ── SEARCH MODAL ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}
          >
            <motion.div
              className="search-modal"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="modal-handle" />
              <div className="search-modal-inner">
                <p className="modal-title">Search Rooms</p>
                <p className="modal-subtitle">Select your university first — options update automatically</p>

                {/* LOCATION */}
                <p className="modal-section-label">📍 Location</p>

                <SearchPicker
                  label="University"
                  value={sUniversity}
                  options={UNIVERSITIES}
                  onChange={v => { setSUniversity(v); setSCampus(''); setSRegion(''); setSJunction(''); }}
                  placeholder="Any university"
                />

                <div className="search-two-col">
                  <SearchPicker label="Campus"      value={sCampus}   options={uniData.campuses}  onChange={setSCampus}   placeholder="Any campus" />
                  <SearchPicker label="Room Region"  value={sRegion}   options={uniData.regions}   onChange={setSRegion}   placeholder="Any region" />
                </div>

                <SearchPicker label="Junction" value={sJunction} options={uniData.junctions} onChange={setSJunction} placeholder="Any junction" />

                {/* ROOM DETAILS */}
                <p className="modal-section-label">🏠 Room Details</p>

                <SearchPicker label="Accommodation Type" value={sAccomm} options={uniData.accommodations} onChange={setSAccomm} placeholder="Any accommodation" />

                <div className="search-two-col">
                  <SearchPicker label="Distance"   value={sDistance} options={uniData.distances} onChange={setSDistance} placeholder="Any distance" />
                  <SearchPicker label="Price / Year" value={sPrice}   options={uniData.prices}    onChange={setSPrice}    placeholder="Any price" />
                </div>

                {/* WHEN */}
                <p className="modal-section-label">📅 When</p>
                <div className="search-plain-field">
                  <span className="search-field-label">Move-in Date</span>
                  <input type="date" value={sMoveIn} onChange={e => setSMoveIn(e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>

                <button className="search-submit" onClick={handleSearch}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Search Rooms
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
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
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  );
}
function NearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
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
