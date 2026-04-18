import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import { ANIMATIONS, COLORS, GRID } from '../utils/designSystem';

const UNIVERSITIES = [
  { full: 'University of Lagos', short: 'UNILAG' },
  { full: 'Covenant University', short: 'CU' },
  { full: 'Obafemi Awolowo University', short: 'OAU' },
  { full: 'University of Port Harcourt', short: 'UNIPORT' },
  { full: 'Nnamdi Azikiwe University', short: 'UNIZIK' },
  { full: 'Ahmadu Bello University', short: 'ABU' },
  { full: 'University of Ibadan', short: 'UI' },
];

const MAIN_TABS = [
  { id: 'all', label: 'All', icon: '⊞' },
  { id: 'best-deals', label: 'Best Deals', icon: '🏷️' },
  { id: 'inside-school', label: 'Inside School', icon: '🏫' },
  { id: 'outside-school', label: 'Outside School', icon: '🏘️' },
  { id: 'off-school', label: 'Off School', icon: '📍' },
  { id: 'clusters', label: 'Clusters', icon: '👥' },
  { id: 'filters', label: 'Filters ▾', icon: '⚙️' },
];

const FILTER_OPTIONS = [
  { id: 'junction', label: 'By Junction', icon: '🔀' },
  { id: 'department', label: 'Near Department', icon: '🎓' },
  { id: 'room-regions', label: 'Room Regions', icon: '🗺️' },
  { id: 'room-spaces', label: 'Room Spaces', icon: '🛏️' },
  { id: 'roommate-spaces', label: 'Roommate Spaces', icon: '🤝' },
  { id: 'heat-map', label: 'Heat Map', icon: '🔥' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedUni, setSelectedUni] = useState(() => {
    try { return JSON.parse(localStorage.getItem('selectedUni')) || UNIVERSITIES[0]; }
    catch { return UNIVERSITIES[0]; }
  });
  const [searchUni, setSearchUni] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

  const [searchForm, setSearchForm] = useState({
    keyword: '', university: '', campus: '', type: '',
    bedrooms: '', minPrice: '', maxPrice: '', junction: '',
  });

  useEffect(() => {
    localStorage.setItem('selectedUni', JSON.stringify(selectedUni));
  }, [selectedUni]);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowUniDropdown(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterDropdown(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredUnis = UNIVERSITIES.filter(
    (u) =>
      u.full.toLowerCase().includes(searchUni.toLowerCase()) ||
      u.short.toLowerCase().includes(searchUni.toLowerCase())
  );

  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections', selectedUni.short, activeTab],
    queryFn: () =>
      api.get(`/listings/homepage-sections?uni=${selectedUni.short}&tab=${activeTab}`).then((r) => r.data),
  });

  const handleOpenQuickList = () => window.dispatchEvent(new CustomEvent('openQuickList'));

  const handleTabClick = (tabId) => {
    if (tabId === 'filters') { setShowFilterDropdown((p) => !p); return; }
    setActiveTab(tabId);
    setShowFilterDropdown(false);
    setActiveFilter(null);
  };

  const handleFilterSelect = (filterId) => {
    if (filterId === 'heat-map') { navigate('/map?mode=heatmap'); return; }
    setActiveFilter(filterId);
    setActiveTab('filters');
    setShowFilterDropdown(false);
  };

  return (
    <main className="min-h-dvh pb-32" style={{ backgroundColor: COLORS.navy }}>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative px-4 pt-6 pb-10 overflow-hidden"
        style={{ background: `linear-gradient(160deg, #1c0e00 0%, ${COLORS.navy} 65%)` }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none" style={{
          background: `radial-gradient(circle, ${COLORS.brand}18 0%, transparent 70%)`,
        }} />

        {/* University Selector */}
        <div ref={dropdownRef} className="relative mb-6 w-fit">
          <motion.button
            onClick={() => setShowUniDropdown(!showUniDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border"
            style={{ backgroundColor: `${COLORS.brand}15`, borderColor: `${COLORS.brand}40` }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: COLORS.brand }}>
              {selectedUni.full} ({selectedUni.short})
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke={COLORS.brand} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </motion.button>

          <AnimatePresence>
            {showUniDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full mt-2 z-50 w-80 rounded-2xl overflow-hidden border"
                style={{ backgroundColor: '#1c1c1c', borderColor: COLORS.glassBorder, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
              >
                <div className="p-3 border-b" style={{ borderColor: COLORS.glassBorder }}>
                  <input
                    type="text" placeholder="Search university..."
                    value={searchUni} onChange={(e) => setSearchUni(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: COLORS.cream, caretColor: COLORS.brand }}
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredUnis.map((uni) => (
                    <motion.button
                      key={uni.short}
                      onClick={() => { setSelectedUni(uni); setShowUniDropdown(false); setSearchUni(''); }}
                      className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors"
                      style={{ color: selectedUni.short === uni.short ? COLORS.brand : COLORS.cream }}
                      whileHover={{ backgroundColor: 'rgba(255,107,0,0.08)' }}
                    >
                      <span className="text-sm font-medium">{uni.full}</span>
                      <span className="text-xs opacity-50">({uni.short})</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hero Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="font-bold leading-tight mb-3" style={{ fontSize: 'clamp(1.9rem, 8vw, 2.8rem)', color: COLORS.cream }}>
            Find your room near{' '}
            <motion.span
              key={selectedUni.short}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ color: COLORS.brand }}
            >
              {selectedUni.full}
            </motion.span>
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
            Verified rooms · No broker fees · Split rent with Cluster
          </p>
          <motion.button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ backgroundColor: COLORS.brand, color: '#fff' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Search Rooms
          </motion.button>
        </motion.div>
      </section>

      {/* ─── TABS ─────────────────────────────────────────────────────────── */}
      <div ref={filterRef} className="sticky top-0 z-30"
        style={{ backgroundColor: `${COLORS.navy}f0`, backdropFilter: 'blur(14px)', borderBottom: `1px solid ${COLORS.glassBorder}` }}
      >
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {MAIN_TABS.map((tab) => {
            const isActive = (tab.id !== 'filters' && activeTab === tab.id) || (tab.id === 'filters' && showFilterDropdown);
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border shrink-0"
                style={{
                  backgroundColor: isActive ? COLORS.brand : 'transparent',
                  color: isActive ? '#fff' : COLORS.muted,
                  borderColor: isActive ? COLORS.brand : COLORS.glassBorder,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Filter sub-dropdown */}
        <AnimatePresence>
          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
              className="overflow-hidden border-t"
              style={{ borderColor: COLORS.glassBorder, backgroundColor: '#111' }}
            >
              <div className="grid grid-cols-2 gap-2 p-3">
                {FILTER_OPTIONS.map((f) => (
                  <motion.button
                    key={f.id}
                    onClick={() => handleFilterSelect(f.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left"
                    style={{
                      backgroundColor: activeFilter === f.id ? `${COLORS.brand}20` : 'rgba(255,255,255,0.04)',
                      borderColor: activeFilter === f.id ? `${COLORS.brand}50` : COLORS.glassBorder,
                      color: activeFilter === f.id ? COLORS.brand : COLORS.cream,
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-base">{f.icon}</span>
                    <span className="text-xs font-medium">{f.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-6 space-y-8">

        {/* Cluster Banner */}
        <motion.div
          className="rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden"
          style={{ backgroundColor: COLORS.brand }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="15" cy="7" r="3" stroke="white" strokeWidth="2"/>
              <path d="M3 20c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight mb-1">Split rent with Cluster 🔥</h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Can't afford a room alone? Find a compatible roommate and split the cost. Lock in for just ₦5,000.
            </p>
          </div>
          <motion.button
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/clusters')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </motion.div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-40 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <div className="flex gap-3 overflow-hidden">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-52 h-64 rounded-2xl shrink-0 animate-pulse"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sections?.length ? (
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg" style={{ color: COLORS.cream }}>
                      {section.icon} {section.title}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.muted }}>{section.description}</p>
                  </div>
                  <motion.button
                    onClick={() => navigate(`/search?section=${section.id}&uni=${selectedUni.short}`)}
                    className="text-sm font-semibold flex items-center gap-1"
                    style={{ color: COLORS.brand }} whileHover={{ x: 2 }}
                  >
                    See all
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke={COLORS.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                </div>
                <div className={GRID.horizontal}>
                  {section.listings?.slice(0, 8).map((listing, i) => (
                    <motion.div key={listing.id} className="w-52 shrink-0"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div className="flex flex-col items-center py-16 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={COLORS.muted} strokeWidth="1.5"/>
                <path d="M9 22V12h6v10" stroke={COLORS.muted} strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: COLORS.cream }}>No listings yet</p>
            <p className="text-sm mb-5" style={{ color: COLORS.muted }}>
              Be the first to list a room for students near {selectedUni.full}
            </p>
            <motion.button onClick={handleOpenQuickList}
              className="px-6 py-3 rounded-2xl font-semibold text-sm"
              style={{ backgroundColor: COLORS.brand, color: '#fff' }} whileTap={{ scale: 0.97 }}>
              List a Room
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ─── SEARCH MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              className="w-full rounded-t-3xl overflow-hidden flex flex-col"
              style={{ backgroundColor: '#111', maxHeight: '90vh', borderTop: `1px solid ${COLORS.glassBorder}` }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: COLORS.glassBorder }} />
              </div>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: COLORS.glassBorder }}>
                <h2 className="font-bold text-lg" style={{ color: COLORS.cream }}>Search Rooms</h2>
                <motion.button onClick={() => setShowSearchModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} whileTap={{ scale: 0.9 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: COLORS.muted }}>KEYWORD</label>
                  <input type="text" placeholder="e.g. self contain, furnished..."
                    value={searchForm.keyword} onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.glassBorder, color: COLORS.cream }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'UNIVERSITY', key: 'university', placeholder: 'Any university' },
                    { label: 'CAMPUS', key: 'campus', placeholder: 'Any campus' },
                    { label: 'ROOM TYPE', key: 'type', placeholder: 'Any type' },
                    { label: 'BEDROOMS', key: 'bedrooms', placeholder: 'Any' },
                    { label: 'MIN PRICE (₦)', key: 'minPrice', placeholder: '0' },
                    { label: 'MAX PRICE (₦)', key: 'maxPrice', placeholder: 'Any' },
                    { label: 'JUNCTION', key: 'junction', placeholder: 'Any junction' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: COLORS.muted }}>{label}</label>
                      <input type="text" placeholder={placeholder}
                        value={searchForm[key]} onChange={(e) => setSearchForm({ ...searchForm, [key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.glassBorder, color: COLORS.cream }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: COLORS.glassBorder }}>
                <motion.button onClick={() => setShowSearchModal(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                  style={{ borderColor: COLORS.glassBorder, color: COLORS.muted }} whileTap={{ scale: 0.97 }}>
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => { navigate(`/search?${new URLSearchParams(searchForm).toString()}`); setShowSearchModal(false); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ backgroundColor: COLORS.brand, color: '#fff' }} whileTap={{ scale: 0.97 }}>
                  Search Rooms
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
