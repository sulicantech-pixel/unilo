import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

// ── Universities ──────────────────────────────────────────────────────────────
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
  'Nnamdi Azikiwe University (UNIZIK)',
  'Federal University of Agriculture Abeokuta (FUNAAB)',
  'Rivers State University (RSU)',
  'Niger Delta University (NDU)',
  'Delta State University (DELSU)',
  'Ambrose Alli University (AAU)',
  'Imo State University (IMSU)',
  'Abia State University (ABSU)',
  'Enugu State University of Science and Technology (ESUT)',
  'Bayero University Kano (BUK)',
  'University of Ilorin (UNILORIN)',
  'Kwara State University (KWASU)',
  'Osun State University (UNIOSUN)',
  'Ekiti State University (EKSU)',
  'Federal University of Technology Akure (FUTA)',
  'Adekunle Ajasin University (AAUA)',
  'Kaduna State University (KASU)',
  'Usmanu Danfodiyo University (UDUS)',
  'Cross River University of Technology (CRUTECH)',
  'Michael Okpara University of Agriculture (MOUAU)',
  'Federal University Dutse (FUD)',
  'Kano State University of Science and Technology (KUST)',
];

const DEFAULT_UNI_DATA = {
  campuses: ['Main Campus', 'Medical Campus', 'Agricultural Campus', 'Distance Learning Centre', 'Postgraduate Campus'],
  accommodations: ['Self Contain', 'Room & Parlour', 'Shared Room', 'Flat', 'Hostel', 'Boys Hostel', 'Girls Hostel', 'Mini Flat', 'BQ', 'Duplex', 'Apartment'],
  regions: ['Gate Area', 'School Road', 'Staff Quarters Area', 'Town Centre', 'New Layout', 'GRA', 'Market Area', 'Behind School', 'Estate Area'],
  junctions: ['Main Gate Junction', 'Second Gate Junction', 'Market Junction', 'Hospital Junction', 'Stadium Junction', 'Express Junction', 'Student Union Junction'],
  distances: ['On Campus', 'Within 5 mins walk', '5–10 mins walk', '10–20 mins walk', '20–30 mins walk', 'Above 30 mins walk'],
  prices: ['Under ₦100k/yr', '₦100k–₦200k/yr', '₦200k–₦400k/yr', '₦400k–₦600k/yr', '₦600k–₦1m/yr', 'Above ₦1m/yr'],
};
const UNI_DATA = { default: DEFAULT_UNI_DATA };
const getUniData = (uni) => UNI_DATA[uni] || UNI_DATA.default;

const TABS = [
  { id: 'all',        label: 'All',        apiParam: '' },
  { id: 'trending',   label: 'Trending',   apiParam: 'trending' },
  { id: 'on_campus',  label: 'On Campus',  apiParam: 'on_campus' },
  { id: 'off_campus', label: 'Off Campus', apiParam: 'off_campus' },
  { id: 'clusters',   label: 'Clusters',   apiParam: 'clusters' },
];

const FILTER_OPTIONS = [
  { id: 'near_school', label: 'Near School',   Icon: IconNear },
  { id: 'junction',    label: 'By Junction',   Icon: IconJunction },
  { id: 'size',        label: 'By Size',       Icon: IconSize },
  { id: 'university',  label: 'By University', Icon: IconUni },
  { id: 'favourites',  label: 'Favourites',    Icon: IconHeart },
  { id: 'new',         label: 'New Deals',     Icon: IconNew },
];

// ── Searchable picker ─────────────────────────────────────────────────────────
function SearchPicker({ label, value, options, onChange, placeholder, zIndex = 10 }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openPicker = () => { setOpen(true); setQuery(''); setTimeout(() => inputRef.current?.focus(), 60); };
  const select     = (opt) => { onChange(opt); setOpen(false); setQuery(''); };
  const clear      = (e)   => { e.stopPropagation(); onChange(''); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', zIndex: open ? 50 + zIndex : zIndex, marginBottom: 10 }}>
      <button onClick={openPicker} style={{
        width: '100%', background: '#1C1C1C',
        border: `1px solid ${open ? 'rgba(255,107,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12, padding: '13px 14px',
        textAlign: 'left', cursor: 'pointer', position: 'relative',
        transition: 'border-color 0.15s', display: 'block',
      }}>
        <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, fontFamily: 'DM Sans, sans-serif' }}>
          {label}
        </span>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: value ? '#fff' : 'rgba(255,255,255,0.26)', fontFamily: 'DM Sans, sans-serif' }}>
          {value || placeholder}
        </span>
        {value && (
          <span onClick={clear} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}>✕</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
            }}
          >
            <div style={{ padding: '8px 8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '7px 10px', marginBottom: 6 }}>
                <SrchIcon />
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 176, overflowY: 'auto', padding: '2px 6px 8px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
              {filtered.length === 0
                ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, padding: '14px 0' }}>No results</p>
                : filtered.map(opt => (
                  <button key={opt} onClick={() => select(opt)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 10px', border: 'none', borderRadius: 7,
                    background: opt === value ? 'rgba(255,107,0,0.12)' : 'transparent',
                    color: opt === value ? '#ff6b00' : 'rgba(255,255,255,0.78)',
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

  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0]);
  const [uniOpen, setUniOpen]         = useState(false);
  const [uniQuery, setUniQuery]       = useState('');
  const uniRef      = useRef(null);
  const uniInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('all');
  const tabRefs   = useRef({});
  const tabBarRef = useRef(null);

  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const [showSearch, setShowSearch]   = useState(false);
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

  const activeTabObj = TABS.find(t => t.id === activeTab);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', 'home', activeTab],
    queryFn: () => {
      const params = new URLSearchParams({ limit: 10 });
      if (activeTabObj?.apiParam) params.set('tab', activeTabObj.apiParam);
      return api.get(`/listings?${params}`).then(r => r.data);
    },
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

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    const bar = tabBarRef.current;
    if (!el || !bar) return;
    bar.scrollTo({ left: el.offsetLeft - bar.offsetWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
  }, [activeTab]);

  const openUniPicker = () => {
    setUniOpen(true); setUniQuery('');
    setTimeout(() => uniInputRef.current?.focus(), 80);
  };

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

  const listings     = data?.listings ?? [];
  const shortUniName = selectedUni.includes('(') ? selectedUni.split('(')[0].trim() : selectedUni;

  return (
    <main style={{ minHeight: '100dvh', background: '#0D0D0D', fontFamily: "'DM Sans', sans-serif", paddingBottom: 96, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600;1,9..144,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─────────────────────────────────────────
           HERO — image fills full viewport height.
           All content anchors to bottom via flex-end.
           The pill sits IMMEDIATELY above the headline
           inside the same flex column — no gap.
        ───────────────────────────────────────── */
        .hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }

        /* Background image + gradient.
           Gradient is heavier at bottom so text
           is readable without increasing padding. */
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(
              to bottom,
              rgba(13,13,13,0.05) 0%,
              rgba(13,13,13,0.15) 35%,
              rgba(13,13,13,0.72) 62%,
              rgba(13,13,13,0.97) 80%,
              rgba(13,13,13,1)    100%
            ),
            url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=85')
              center / cover no-repeat;
        }

        /* Single content block — pill + headline + sub + search.
           All in normal flow, stacked with micro-gaps only. */
        .hero-block {
          position: relative; z-index: 2;
          padding: 0 20px 28px;
          display: flex;
          flex-direction: column;
          /* gap controls spacing between every child:
             pill → headline → sub → search bar.
             6px between pill and headline is intentional — tight but not overlapping. */
          gap: 0;
        }

        /* ── University pill ── */
        .uni-pill-wrap {
          position: relative;
          display: inline-block; /* shrinks to content width */
          align-self: flex-start;
          margin-bottom: 10px; /* 10px gap below pill, above headline */
        }
        .uni-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(13,13,13,0.65);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          border-radius: 100px;
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          transition: background .2s, border-color .2s;
          max-width: calc(100vw - 40px);
        }
        .uni-pill:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }
        .uni-pill-icon {
          width: 24px; height: 24px;
          background: rgba(255,107,0,0.22); border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .uni-pill-text {
          font-size: 12px; font-weight: 700; color: #fff; letter-spacing: .01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: min(210px, 52vw);
        }
        .uni-pill-chevron { flex-shrink: 0; opacity: .5; }

        /* Uni dropdown — appears below pill */
        .uni-dropdown {
          position: absolute;
          top: calc(100% + 6px); left: 0;
          background: #191919;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; overflow: hidden;
          z-index: 300;
          width: min(310px, calc(100vw - 40px));
          box-shadow: 0 24px 60px rgba(0,0,0,0.85);
        }
        .uni-search-wrap { padding: 10px 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .uni-search-inner {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.07); border-radius: 8px;
          padding: 8px 10px; margin-bottom: 8px;
        }
        .uni-search-inner input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
        }
        .uni-search-inner input::placeholder { color: rgba(255,255,255,0.3); }
        .uni-list {
          max-height: 230px; overflow-y: auto; padding: 6px 6px 8px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .uni-option {
          display: block; width: 100%; text-align: left;
          padding: 9px 12px; border: none; border-radius: 9px;
          background: transparent; color: rgba(255,255,255,0.72);
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background .1s;
        }
        .uni-option:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .uni-option.active { background: rgba(255,107,0,0.12); color: #ff6b00; font-weight: 700; }
        .uni-count { font-size: 10px; color: rgba(255,255,255,0.22); padding: 0 12px 6px; display: block; }

        /* ── Headline — zero margin-top, sits flush under pill ── */
        .hero-title {
          font-family: 'Fraunces', serif;
          /* Tighter clamp so it never wraps past 2 lines on small phones */
          font-size: clamp(1.85rem, 7vw, 3.2rem);
          font-weight: 700;
          line-height: 1.1;
          color: #fff;
          letter-spacing: -0.025em;
          /* 6px below headline before subtext */
          margin-bottom: 6px;
        }
        .hero-title .orange { color: #ff6b00; font-style: italic; }

        /* ── Subtext — immediately under headline ── */
        .hero-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.42);
          display: flex; align-items: center; flex-wrap: wrap; gap: 0;
          /* 18px gap before search bar */
          margin-bottom: 18px;
        }
        .dot { margin: 0 6px; opacity: .35; }

        /* ── Search trigger bar ── */
        .search-trigger {
          width: 100%;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 12px 11px 12px 15px;
          display: flex; align-items: center; gap: 10px;
          cursor: pointer; backdrop-filter: blur(10px);
          transition: background .15s, border-color .15s;
        }
        .search-trigger:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,107,0,0.4); }
        .search-meta { flex: 1; text-align: left; min-width: 0; }
        .search-label {
          display: block; font-size: 9px; font-weight: 700;
          color: rgba(255,255,255,0.3); text-transform: uppercase;
          letter-spacing: .1em; margin-bottom: 2px;
        }
        .search-value {
          display: block; font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.72);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .search-go {
          background: #ff6b00; border: none; border-radius: 10px;
          width: 40px; height: 40px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .15s, transform .15s;
        }
        .search-go:hover { background: #e55f00; transform: scale(1.06); }

        /* ── Action bar (tabs + map + filter) ── */
        .action-bar {
          display: flex; align-items: center; gap: 6px;
          padding: 14px 20px 0;
          overflow-x: auto; scrollbar-width: none;
        }
        .action-bar::-webkit-scrollbar { display: none; }

        .tab-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 100px;
          border: 1px solid transparent;
          font-size: 13px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0; outline: none;
          transition: color .15s, background .15s;
        }
        .tab-btn.active {
          background: #fff; color: #0D0D0D;
          box-shadow: 0 2px 12px rgba(255,255,255,0.1);
        }
        .tab-btn.inactive {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.48);
          border-color: rgba(255,255,255,0.07);
        }
        .tab-btn.inactive:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.85); }

        .bar-gap { flex: 1; min-width: 6px; }

        .map-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 100px;
          border: 1px solid rgba(255,107,0,0.4);
          background: rgba(255,107,0,0.1); color: #ff6b00;
          font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
          flex-shrink: 0; transition: background .15s;
        }
        .map-btn:hover { background: rgba(255,107,0,0.18); }

        .filter-wrap { position: relative; flex-shrink: 0; }
        .filter-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
          flex-shrink: 0; transition: all .15s;
        }
        .filter-btn:hover, .filter-btn.open {
          background: rgba(255,255,255,0.09); color: #fff;
          border-color: rgba(255,255,255,0.18);
        }
        .filter-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #191919; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 6px;
          min-width: 196px; z-index: 100;
          box-shadow: 0 20px 60px rgba(0,0,0,0.75);
        }
        .f-item {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 10px 11px; border: none;
          background: transparent; color: rgba(255,255,255,0.72);
          font-size: 13px; font-weight: 500; border-radius: 9px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background .1s; text-align: left;
        }
        .f-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .f-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }
        .f-item-map { color: #ff6b00; }
        .f-item-map:hover { background: rgba(255,107,0,0.1) !important; }

        /* ── Listings ── */
        .sec-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 12px; }
        .sec-title { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 700; color: #fff; }
        .see-all { font-size: 13px; font-weight: 600; color: #ff6b00; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; padding: 0 20px; }
        .skel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; height: 255px; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .empty { grid-column: 1/-1; text-align: center; padding: 56px 20px; }
        .empty-emoji { font-size: 42px; margin-bottom: 10px; }
        .empty-title { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 700; color: rgba(255,255,255,0.75); margin-bottom: 5px; }
        .empty-body { font-size: 13px; color: rgba(255,255,255,0.3); }
        .retry { margin-top: 14px; background: rgba(255,107,0,0.1); border: 1px solid rgba(255,107,0,0.35); color: #ff6b00; padding: 9px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* ── Search modal ── */
        .overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.82); backdrop-filter: blur(10px); display: flex; align-items: flex-end; }
        .modal { width: 100%; background: #131313; border-radius: 24px 24px 0 0; border: 1px solid rgba(255,255,255,0.08); border-bottom: none; max-height: 93vh; overflow-y: auto; scrollbar-width: none; }
        .modal::-webkit-scrollbar { display: none; }
        .modal-body { padding: 0 18px 48px; }
        .handle { width: 32px; height: 3px; background: rgba(255,255,255,0.14); border-radius: 100px; margin: 12px auto 16px; }
        .modal-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .modal-hint { font-size: 11px; color: rgba(255,255,255,0.26); margin-bottom: 18px; }
        .modal-sec { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: .12em; margin: 14px 0 8px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .two-col > div { margin-bottom: 0 !important; }
        .plain-field { background: #1C1C1C; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 13px; margin-bottom: 10px; }
        .plain-label { display: block; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.28); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 3px; }
        .plain-field input { display: block; width: 100%; background: transparent; border: none; outline: none; font-size: 13px; font-weight: 500; color: #fff; font-family: 'DM Sans', sans-serif; }
        .plain-field input::placeholder { color: rgba(255,255,255,0.22); }
        .submit { width: 100%; background: #ff6b00; color: #fff; border: none; border-radius: 13px; padding: 15px; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; transition: background .15s; }
        .submit:hover { background: #e55f00; }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO
          Everything is in ONE flex column anchored
          to the bottom. No separate stacking contexts.
          Pill → Headline → Sub → Search are siblings.
      ══════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg" />

        <motion.div
          className="hero-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 1. University pill — inline-block, flex-start */}
          <div className="uni-pill-wrap" ref={uniRef}>
            <button className="uni-pill" onClick={openUniPicker}>
              <span className="uni-pill-icon"><GridIcon size={12} /></span>
              <span className="uni-pill-text">{selectedUni}</span>
              <span className="uni-pill-chevron">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points={uniOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                </svg>
              </span>
            </button>

            <AnimatePresence>
              {uniOpen && (
                <motion.div className="uni-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.13 }}
                >
                  <div className="uni-search-wrap">
                    <div className="uni-search-inner">
                      <SrchIcon />
                      <input ref={uniInputRef} value={uniQuery}
                        onChange={e => setUniQuery(e.target.value)}
                        placeholder="Search university…" />
                    </div>
                  </div>
                  <span className="uni-count">{filteredUnis.length} universities</span>
                  <div className="uni-list">
                    {filteredUnis.length === 0
                      ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, padding: '12px 0' }}>No results</p>
                      : filteredUnis.map(u => (
                        <button key={u} className={`uni-option ${u === selectedUni ? 'active' : ''}`}
                          onClick={() => { setSelectedUni(u); setUniOpen(false); setUniQuery(''); }}>
                          {u}
                        </button>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Headline — 10px below pill, nothing more */}
          <h1 className="hero-title">
            Find your room<br />
            near <span className="orange">{shortUniName}</span>
          </h1>

          {/* 3. Subtext — 6px below headline */}
          <p className="hero-sub">
            Verified rooms
            <span className="dot">·</span>
            No broker fees
            <span className="dot">·</span>
            Split rent with Cluster
          </p>

          {/* 4. Search bar — 18px below subtext */}
          <button className="search-trigger" onClick={() => setShowSearch(true)}>
            <SrchIcon size={17} color="rgba(255,255,255,0.38)" />
            <span className="search-meta">
              <span className="search-label">Search rooms</span>
              <span className="search-value">University · Campus · Accommodation…</span>
            </span>
            <button className="search-go" onClick={e => { e.stopPropagation(); setShowSearch(true); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </button>
        </motion.div>
      </section>

      {/* ── TABS + MAP + FILTER ── */}
      <div className="action-bar" ref={tabBarRef}>
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            ref={el => tabRefs.current[tab.id] = el}
            className={`tab-btn ${activeTab === tab.id ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.91 }}
          >
            {tab.id === 'all' && <GridIcon size={11} color={activeTab === 'all' ? '#0D0D0D' : 'rgba(255,255,255,0.38)'} />}
            {tab.label}
          </motion.button>
        ))}

        <div className="bar-gap" />

        <motion.button className="map-btn" onClick={() => navigate('/map')} whileTap={{ scale: 0.91 }}>
          <IconMap />&nbsp;Map
        </motion.button>

        <div className="filter-wrap" ref={filterRef}>
          <button className={`filter-btn ${showFilter ? 'open' : ''}`} onClick={() => setShowFilter(o => !o)}>
            <IconFilter />
            Filter
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: showFilter ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {showFilter && (
              <motion.div className="filter-dropdown"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.13 }}
              >
                {FILTER_OPTIONS.map(({ id, label, Icon }) => (
                  <button key={id} className="f-item"
                    onClick={() => { setShowFilter(false); navigate(`/search?filter=${id}`); }}>
                    <Icon />{label}
                  </button>
                ))}
                <div className="f-divider" />
                <button className="f-item f-item-map"
                  onClick={() => { setShowFilter(false); navigate('/map'); }}>
                  <IconMap color="#ff6b00" />Map View
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── LISTINGS ── */}
      <div className="sec-header">
        <h2 className="sec-title">
          {activeTab === 'all'        && 'All Rooms'}
          {activeTab === 'trending'   && '🔥 Trending'}
          {activeTab === 'on_campus'  && 'On Campus'}
          {activeTab === 'off_campus' && 'Off Campus'}
          {activeTab === 'clusters'   && '🤝 Clusters'}
        </h2>
        <button className="see-all" onClick={() => navigate('/search')}>See all →</button>
      </div>

      <div className="grid">
        {isLoading && [...Array(6)].map((_, i) => <div key={i} className="skel" />)}
        {isError && (
          <div className="empty">
            <div className="empty-emoji">📡</div>
            <p className="empty-title">Couldn't load rooms</p>
            <p className="empty-body">Server may be starting up — takes ~15s.</p>
            <button className="retry" onClick={() => refetch()}>Try again</button>
          </div>
        )}
        {!isLoading && !isError && listings.length === 0 && (
          <div className="empty">
            <div className="empty-emoji">🏠</div>
            <p className="empty-title">No listings yet</p>
            <p className="empty-body">Be the first to list a property on Unilo.</p>
          </div>
        )}
        {!isLoading && !isError && listings.map((listing, i) => (
          <motion.div key={listing.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.06, 0.32) }}
          >
            <ListingCard listing={listing} />
          </motion.div>
        ))}
      </div>

      {/* ── SEARCH MODAL ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div className="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}
          >
            <motion.div className="modal"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="handle" />
              <div className="modal-body">
                <p className="modal-title">Search Rooms</p>
                <p className="modal-hint">Choose your university first — options update automatically</p>

                <p className="modal-sec">📍 Location</p>
                <div>
                  <SearchPicker label="University" value={sUniversity} options={UNIVERSITIES} zIndex={40}
                    onChange={v => { setSUniversity(v); setSCampus(''); setSRegion(''); setSJunction(''); }}
                    placeholder="Any university" />
                </div>
                <div className="two-col">
                  <div><SearchPicker label="Campus"      value={sCampus}  options={uniData.campuses}  zIndex={30} onChange={setSCampus}  placeholder="Any campus" /></div>
                  <div><SearchPicker label="Room Region"  value={sRegion}  options={uniData.regions}   zIndex={30} onChange={setSRegion}  placeholder="Any region" /></div>
                </div>
                <div>
                  <SearchPicker label="Junction" value={sJunction} options={uniData.junctions} zIndex={20} onChange={setSJunction} placeholder="Any junction" />
                </div>

                <p className="modal-sec">🏠 Room Details</p>
                <div>
                  <SearchPicker label="Accommodation Type" value={sAccomm} options={uniData.accommodations} zIndex={15} onChange={setSAccomm} placeholder="Any accommodation" />
                </div>
                <div className="two-col">
                  <div><SearchPicker label="Distance"    value={sDistance} options={uniData.distances} zIndex={10} onChange={setSDistance} placeholder="Any" /></div>
                  <div><SearchPicker label="Price / Year" value={sPrice}   options={uniData.prices}    zIndex={10} onChange={setSPrice}    placeholder="Any" /></div>
                </div>

                <p className="modal-sec" style={{ marginTop: 14 }}>📅 Move-in</p>
                <div className="plain-field">
                  <span className="plain-label">Move-in Date</span>
                  <input type="date" value={sMoveIn} onChange={e => setSMoveIn(e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>

                <button className="submit" onClick={handleSearch}>
                  <SrchIcon size={16} color="white" />Search Rooms
                </button>
              </div>
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
function SrchIcon({ size = 13, color = 'rgba(255,255,255,0.35)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconMap({ color = '#ff6b00' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}
function IconFilter() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  );
}
function IconNear() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}
function IconJunction() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
      <line x1="12" y1="7" x2="12" y2="13"/><line x1="12" y1="13" x2="5.7" y2="17.3"/><line x1="12" y1="13" x2="18.3" y2="17.3"/>
    </svg>
  );
}
function IconSize() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  );
}
function IconUni() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}
function IconNew() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
