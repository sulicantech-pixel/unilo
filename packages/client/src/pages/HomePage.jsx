import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import { ANIMATIONS, COLORS, GRID } from '../utils/designSystem';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const UNIVERSITIES = [
  { full: 'University of Lagos', short: 'UNILAG' },
  { full: 'Covenant University', short: 'CU' },
  { full: 'Obafemi Awolowo University', short: 'OAU' },
  { full: 'University of Port Harcourt', short: 'UNIPORT' },
  { full: 'Nnamdi Azikiwe University', short: 'UNIZIK' },
  { full: 'Ahmadu Bello University', short: 'ABU' },
  { full: 'University of Ibadan', short: 'UI' },
];

const CAMPUSES = {
  UNILAG: ['Main Campus', 'Medical Campus', 'Distance Learning'],
  CU: ['Main Campus', 'Staff Quarters'],
  OAU: ['Main Campus', 'OAUTH'],
  UNIPORT: ['Main Campus', 'Choba Campus', 'Abuja Campus'],
  UNIZIK: ['Awka Campus', 'Nnewi Campus', 'Ifite Campus'],
  ABU: ['Samaru Campus', 'Kongo Campus', 'Teaching Hospital'],
  UI: ['Main Campus', 'Agbowo', 'Ajibode'],
};

const ACCOMMODATIONS = [
  'Self Contain', 'Room & Parlour', 'Flat', 'Bungalow',
  'Duplex', 'Hostel', 'Shared Room', 'Studio Apartment',
];

const ROOM_REGIONS = [
  'Inside School Gate', 'Off Campus (Close)', 'Off Campus (Far)',
  'Estate', 'Town Centre', 'Roadside', 'Quiet Residential',
];

const JUNCTIONS = {
  UNILAG: ['Abule-Oja', 'Yaba', 'Akoka', 'Sabo', 'Unilag Gate', 'Ketu'],
  UNIPORT: ['Choba Junction', 'Rumuola', 'Rumuokoro', 'Unity Junction', 'School Gate'],
  OAU: ['Ife Gate', 'Mayfair', 'Lagere', 'Moore Plantation', 'Enuwa'],
  CU: ['Canaan Land', 'Ota', 'Iyana Iyesi', 'Agbara'],
  UNIZIK: ['Ifite Junction', 'Awka Main', 'Okpuno', 'Nnewi Gate'],
  ABU: ['Samaru Gate', 'Kongo', 'Barewa', 'Television'],
  UI: ['UI Gate', 'Agbowo', 'Ajibode', 'Bodija', 'Challenge'],
};

const DISTANCES = [
  'Under 5 mins walk', '5–10 mins walk', '10–20 mins walk',
  'Under 5 mins bike', '5–15 mins bike', 'Bus ride away',
];

const PRICE_RANGES = [
  'Under ₦50,000/yr', '₦50k–₦100k/yr', '₦100k–₦200k/yr',
  '₦200k–₦350k/yr', '₦350k–₦500k/yr', 'Above ₦500k/yr',
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

// ─── SEARCHABLE PICKER ────────────────────────────────────────────────────────

function FieldPicker({ label, icon, value, options, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full rounded-t-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#151515', maxHeight: '75vh', borderTop: `1px solid ${COLORS.glassBorder}` }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="font-bold text-base" style={{ color: COLORS.cream }}>{label}</span>
          </div>
          <motion.button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke={COLORS.muted} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.glassBorder }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke={COLORS.muted} strokeWidth="2"/>
              <path d="M20 20l-3-3" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: COLORS.cream, caretColor: COLORS.brand }}
              autoFocus
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Clear option */}
          <motion.button
            onClick={() => { onSelect(''); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center gap-3"
            style={{
              backgroundColor: !value ? `${COLORS.brand}15` : 'transparent',
              color: !value ? COLORS.brand : COLORS.muted,
            }}
            whileHover={{ backgroundColor: 'rgba(255,107,0,0.08)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm">Any {label.toLowerCase()}</span>
            {!value && (
              <span className="ml-auto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke={COLORS.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </motion.button>

          {filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: COLORS.muted }}>
              <p className="text-sm">No results for "{search}"</p>
            </div>
          ) : (
            filtered.map((opt) => (
              <motion.button
                key={opt}
                onClick={() => { onSelect(opt); onClose(); }}
                className="w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center justify-between"
                style={{
                  backgroundColor: value === opt ? `${COLORS.brand}15` : 'transparent',
                  color: value === opt ? COLORS.brand : COLORS.cream,
                }}
                whileHover={{ backgroundColor: 'rgba(255,107,0,0.08)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium">{opt}</span>
                {value === opt && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke={COLORS.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </motion.button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SEARCH FIELD BUTTON ──────────────────────────────────────────────────────

function SearchField({ icon, label, value, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-start gap-3 p-3 text-left w-full"
      whileTap={{ scale: 0.98 }}
      style={{ minHeight: '60px' }}
    >
      <span className="text-base mt-0.5" style={{ color: COLORS.brand }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: COLORS.brand }}>
          {label}
        </p>
        <p className="text-sm font-medium truncate" style={{ color: value ? COLORS.cream : COLORS.muted }}>
          {value || `Any ${label.toLowerCase()}`}
        </p>
      </div>
    </motion.button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();

  const [selectedUni, setSelectedUni] = useState(() => {
    try { return JSON.parse(localStorage.getItem('selectedUni')) || UNIVERSITIES[0]; }
    catch { return UNIVERSITIES[0]; }
  });
  const [searchUni, setSearchUni] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [activePicker, setActivePicker] = useState(null); // which field picker is open

  const [searchForm, setSearchForm] = useState({
    university: '',
    campus: '',
    accommodation: '',
    roomRegion: '',
    junction: '',
    distance: '',
    moveInDate: '',
    price: '',
  });

  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

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

  const setField = (key, val) => setSearchForm((f) => ({ ...f, [key]: val }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(searchForm).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/search?${params.toString()}`);
  };

  // Picker definitions
  const PICKERS = {
    university: {
      label: 'University', icon: '🏫',
      options: UNIVERSITIES.map((u) => `${u.full} (${u.short})`),
    },
    campus: {
      label: 'Campus', icon: '📍',
      options: CAMPUSES[selectedUni.short] || ['Main Campus'],
    },
    accommodation: {
      label: 'Accommodation', icon: '🏠',
      options: ACCOMMODATIONS,
    },
    roomRegion: {
      label: 'Room Region', icon: '⊞',
      options: ROOM_REGIONS,
    },
    junction: {
      label: 'Junction', icon: '📍',
      options: JUNCTIONS[selectedUni.short] || [],
    },
    distance: {
      label: 'Distance', icon: '◇',
      options: DISTANCES,
    },
    moveInDate: {
      label: 'Move-in Date', icon: '📅',
      options: [
        'Immediately', 'Within 1 month', 'Within 3 months',
        'Next semester', 'Next academic year',
      ],
    },
    price: {
      label: 'Price / Year', icon: '$',
      options: PRICE_RANGES,
    },
  };

  const activePick = activePicker ? PICKERS[activePicker] : null;

  return (
    <main className="min-h-dvh pb-32" style={{ backgroundColor: COLORS.navy }}>

      {/* ─── TOP NAV BAR ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 pt-5 pb-2 gap-3"
        style={{ backgroundColor: COLORS.navy }}
      >
        {/* University Selector */}
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
          <motion.button
            onClick={() => setShowUniDropdown(!showUniDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border w-full max-w-xs"
            style={{ backgroundColor: `${COLORS.brand}15`, borderColor: `${COLORS.brand}40` }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke={COLORS.brand} strokeWidth="2"/>
            </svg>
            <span className="text-xs font-semibold truncate" style={{ color: COLORS.brand }}>
              {selectedUni.full} ({selectedUni.short})
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
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
                className="absolute top-full mt-2 z-50 w-72 rounded-2xl overflow-hidden border"
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
                      className="w-full text-left px-4 py-3 flex items-center justify-between"
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

        {/* Blog Button */}
        <motion.button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border shrink-0"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: COLORS.glassBorder,
            color: COLORS.cream,
          }}
          whileHover={{ borderColor: COLORS.brand, color: COLORS.brand }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 10h10M4 14h12M4 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold">Blog</span>
        </motion.button>
      </div>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative px-4 pt-4 pb-6 overflow-hidden"
        style={{ background: `linear-gradient(160deg, #1c0e00 0%, ${COLORS.navy} 70%)` }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none" style={{
          background: `radial-gradient(circle, ${COLORS.brand}15 0%, transparent 70%)`,
        }} />

        {/* Hero Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="font-bold leading-tight mb-2" style={{ fontSize: 'clamp(1.8rem, 8vw, 2.8rem)', color: COLORS.cream }}>
            Find your room near{' '}
            <motion.span
              key={selectedUni.short}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ color: COLORS.brand }}
            >
              {selectedUni.full}
            </motion.span>
          </h1>
          <p className="text-sm mb-5" style={{ color: COLORS.muted }}>
            Verified rooms · No broker fees · Split rent with Cluster
          </p>

          {/* Search Rooms Toggle Button */}
          <motion.button
            onClick={() => setShowSearchForm((p) => !p)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{
              backgroundColor: showSearchForm ? COLORS.brandDark : COLORS.brand,
              color: '#fff',
            }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {showSearchForm ? 'Close Search' : 'Search Rooms'}
          </motion.button>
        </motion.div>

        {/* ─── INLINE SEARCH FORM ─────────────────────────────────────────── */}
        <AnimatePresence>
          {showSearchForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 250 }}
              className="overflow-hidden mt-4"
            >
              <div
                className="rounded-3xl overflow-hidden border"
                style={{
                  backgroundColor: 'rgba(20,10,0,0.95)',
                  borderColor: 'rgba(255,107,0,0.2)',
                  boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,107,0,0.1)`,
                }}
              >
                {/* 2×4 grid of fields */}
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <SearchField
                      icon="🏫" label="UNIVERSITY"
                      value={searchForm.university}
                      onClick={() => setActivePicker('university')}
                    />
                    <SearchField
                      icon="📍" label="CAMPUS"
                      value={searchForm.campus}
                      onClick={() => setActivePicker('campus')}
                    />
                  </div>
                  {/* Row 2 */}
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <SearchField
                      icon="🏠" label="ACCOMMODATION"
                      value={searchForm.accommodation}
                      onClick={() => setActivePicker('accommodation')}
                    />
                    <SearchField
                      icon="⊞" label="ROOM REGION"
                      value={searchForm.roomRegion}
                      onClick={() => setActivePicker('roomRegion')}
                    />
                  </div>
                  {/* Row 3 */}
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <SearchField
                      icon="🔀" label="JUNCTION"
                      value={searchForm.junction}
                      onClick={() => setActivePicker('junction')}
                    />
                    <SearchField
                      icon="◇" label="DISTANCE"
                      value={searchForm.distance}
                      onClick={() => setActivePicker('distance')}
                    />
                  </div>
                  {/* Row 4 */}
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <SearchField
                      icon="📅" label="MOVE-IN DATE"
                      value={searchForm.moveInDate}
                      onClick={() => setActivePicker('moveInDate')}
                    />
                    <SearchField
                      icon="$" label="PRICE / YEAR"
                      value={searchForm.price}
                      onClick={() => setActivePicker('price')}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="p-4">
                  <motion.button
                    onClick={handleSearch}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                    style={{ backgroundColor: COLORS.brand, color: '#fff' }}
                    whileHover={{ scale: 1.02, backgroundColor: COLORS.brandDark }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5"/>
                      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    Search Rooms
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── TABS ─────────────────────────────────────────────────────────── */}
      <div
        ref={filterRef}
        className="sticky top-0 z-30"
        style={{
          backgroundColor: `${COLORS.navy}f0`,
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${COLORS.glassBorder}`,
        }}
      >
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {MAIN_TABS.map((tab) => {
            const isActive =
              (tab.id !== 'filters' && activeTab === tab.id) ||
              (tab.id === 'filters' && showFilterDropdown);
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
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
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
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
                    style={{ color: COLORS.brand }}
                    whileHover={{ x: 2 }}
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
            <motion.button
              onClick={handleOpenQuickList}
              className="px-6 py-3 rounded-2xl font-semibold text-sm"
              style={{ backgroundColor: COLORS.brand, color: '#fff' }}
              whileTap={{ scale: 0.97 }}
            >
              List a Room
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ─── FIELD PICKER MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {activePicker && activePick && (
          <FieldPicker
            key={activePicker}
            label={activePick.label}
            icon={activePick.icon}
            value={searchForm[activePicker]}
            options={activePick.options}
            onSelect={(val) => setField(activePicker, val)}
            onClose={() => setActivePicker(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
