import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import { ANIMATIONS, COLORS, GRID } from '../utils/designSystem';

// ─── SVG ICON LIBRARY ─────────────────────────────────────────────────────────
const Icon = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Grid: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Fire: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-2.5-1.5-5-5-11zM9 17c0-2.2 1.5-4 3-5 1.5 1 3 2.8 3 5a3 3 0 01-6 0z"/>
    </svg>
  ),
  GraduationCap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Home: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Users: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  SlidersH: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  ),
  ArrowRight: ({ color = 'currentColor' }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  ),
  Close: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  University: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Campus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  ),
  Accommodation: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Region: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M3 15h18M9 3v18"/>
    </svg>
  ),
  Junction: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v7M12 15v7M2 12h7M15 12h7"/>
    </svg>
  ),
  Distance: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/>
      <path d="M6 17V7a2 2 0 012-2h8"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Naira: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 4l7 16M12 4l7 16M4 10h16M4 14h16"/>
    </svg>
  ),
  Plus: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Key: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="17" r="4"/>
      <path d="M10.5 13.5L21 3M21 3h-4M21 3v4"/>
    </svg>
  ),
  Handshake: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
    </svg>
  ),
};

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
  UNILAG:  ['Main Campus', 'Medical Campus', 'Distance Learning'],
  CU:      ['Main Campus', 'Staff Quarters'],
  OAU:     ['Main Campus', 'OAUTH'],
  UNIPORT: ['Main Campus', 'Choba Campus', 'Abuja Campus'],
  UNIZIK:  ['Awka Campus', 'Nnewi Campus', 'Ifite Campus'],
  ABU:     ['Samaru Campus', 'Kongo Campus', 'Teaching Hospital'],
  UI:      ['Main Campus', 'Agbowo', 'Ajibode'],
};
const ACCOMMODATIONS = ['Self Contain', 'Room & Parlour', 'Flat', 'Bungalow', 'Duplex', 'Hostel', 'Shared Room', 'Studio Apartment'];
const ROOM_REGIONS   = ['Inside School Gate', 'Off Campus (Close)', 'Off Campus (Far)', 'Estate', 'Town Centre', 'Roadside', 'Quiet Residential'];
const JUNCTIONS = {
  UNILAG:  ['Abule-Oja', 'Yaba', 'Akoka', 'Sabo', 'Unilag Gate', 'Ketu'],
  UNIPORT: ['Choba Junction', 'Rumuola', 'Rumuokoro', 'Unity Junction', 'School Gate'],
  OAU:     ['Ife Gate', 'Mayfair', 'Lagere', 'Moore Plantation', 'Enuwa'],
  CU:      ['Canaan Land', 'Ota', 'Iyana Iyesi', 'Agbara'],
  UNIZIK:  ['Ifite Junction', 'Awka Main', 'Okpuno', 'Nnewi Gate'],
  ABU:     ['Samaru Gate', 'Kongo', 'Barewa', 'Television'],
  UI:      ['UI Gate', 'Agbowo', 'Ajibode', 'Bodija', 'Challenge'],
};
const DISTANCES    = ['Under 5 mins walk', '5–10 mins walk', '10–20 mins walk', 'Under 5 mins bike', '5–15 mins bike', 'Bus ride away'];
const PRICE_RANGES = ['Under ₦50,000/yr', '₦50k–₦100k/yr', '₦100k–₦200k/yr', '₦200k–₦350k/yr', '₦350k–₦500k/yr', 'Above ₦500k/yr'];

// Tabs — all emoji replaced with SVG icons
const MAIN_TABS = [
  { id: 'all',            label: 'All',            IconC: Icon.Grid },
  { id: 'best-deals',     label: 'Best Deals',     IconC: Icon.Fire },
  { id: 'inside-school',  label: 'Inside School',  IconC: Icon.GraduationCap },
  { id: 'outside-school', label: 'Outside School', IconC: Icon.Home },
  { id: 'off-school',     label: 'Off School',     IconC: Icon.MapPin },
  { id: 'clusters',       label: 'Clusters',       IconC: Icon.Users },
  { id: 'filters',        label: 'Filters',        IconC: Icon.SlidersH },
];

const FILTER_OPTIONS = [
  { id: 'junction',        label: 'By Junction',       IconC: Icon.Junction },
  { id: 'department',      label: 'Near Department',   IconC: Icon.GraduationCap },
  { id: 'room-regions',    label: 'Room Regions',      IconC: Icon.Region },
  { id: 'room-spaces',     label: 'Room Spaces',       IconC: Icon.Accommodation },
  { id: 'roommate-spaces', label: 'Roommate Spaces',   IconC: Icon.Users },
  { id: 'heat-map',        label: 'Heat Map',          IconC: Icon.Fire },
];

// Search field icons
const PICKERS_META = {
  university:    { label: 'UNIVERSITY',    IconC: Icon.University },
  campus:        { label: 'CAMPUS',        IconC: Icon.Campus },
  accommodation: { label: 'ACCOMMODATION', IconC: Icon.Accommodation },
  roomRegion:    { label: 'ROOM REGION',   IconC: Icon.Region },
  junction:      { label: 'JUNCTION',      IconC: Icon.Junction },
  distance:      { label: 'DISTANCE',      IconC: Icon.Distance },
  moveInDate:    { label: 'MOVE-IN DATE',  IconC: Icon.Calendar },
  price:         { label: 'PRICE / YEAR',  IconC: Icon.Naira },
};

// ─── FIELD PICKER ─────────────────────────────────────────────────────────────
function FieldPicker({ label, IconC, value, options, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

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
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: COLORS.brand }}><IconC /></span>
            <span className="font-bold text-base" style={{ color: COLORS.cream }}>{label}</span>
          </div>
          <motion.button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.9 }}>
            <span style={{ color: COLORS.muted }}><Icon.Close /></span>
          </motion.button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.glassBorder }}>
            <span style={{ color: COLORS.muted }}><Icon.Search /></span>
            <input type="text" placeholder={`Search ${label.toLowerCase()}...`}
              value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: COLORS.cream, caretColor: COLORS.brand }} autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <motion.button onClick={() => { onSelect(''); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center gap-3"
            style={{ backgroundColor: !value ? `${COLORS.brand}15` : 'transparent', color: !value ? COLORS.brand : COLORS.muted }}
            whileHover={{ backgroundColor: 'rgba(255,107,0,0.08)' }} whileTap={{ scale: 0.98 }}>
            <span className="text-sm">Any {label.toLowerCase()}</span>
            {!value && <span className="ml-auto" style={{ color: COLORS.brand }}><Icon.Check /></span>}
          </motion.button>
          {filtered.map(opt => (
            <motion.button key={opt} onClick={() => { onSelect(opt); onClose(); }}
              className="w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center justify-between"
              style={{ backgroundColor: value === opt ? `${COLORS.brand}15` : 'transparent', color: value === opt ? COLORS.brand : COLORS.cream }}
              whileHover={{ backgroundColor: 'rgba(255,107,0,0.08)' }} whileTap={{ scale: 0.98 }}>
              <span className="text-sm font-medium">{opt}</span>
              {value === opt && <span style={{ color: COLORS.brand }}><Icon.Check /></span>}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SEARCH FIELD ─────────────────────────────────────────────────────────────
function SearchField({ IconC, label, value, onClick }) {
  return (
    <motion.button onClick={onClick} className="flex items-start gap-3 p-3 text-left w-full" whileTap={{ scale: 0.98 }} style={{ minHeight: '60px' }}>
      <span className="mt-0.5" style={{ color: COLORS.brand }}><IconC /></span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: COLORS.brand }}>{label}</p>
        <p className="text-sm font-medium truncate" style={{ color: value ? COLORS.cream : COLORS.muted }}>
          {value || `Any ${label.toLowerCase()}`}
        </p>
      </div>
    </motion.button>
  );
}

// ─── FAB CHOOSER SHEET ────────────────────────────────────────────────────────
function FABChooser({ onClose, onChoose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, background: '#111',
          borderRadius: '24px 24px 0 0', padding: '20px 20px 36px',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: COLORS.cream, marginBottom: 6 }}>
          What are you listing?
        </p>
        <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
          Choose a flow — takes under 2 minutes either way.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* List a Room */}
          <motion.button
            onClick={() => onChoose('room')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand}25 0%, ${COLORS.brand}10 100%)`,
              border: `1.5px solid ${COLORS.brand}40`,
              borderRadius: 20, padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${COLORS.brand}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: COLORS.brand }}><Icon.Key /></span>
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: COLORS.cream, margin: 0, marginBottom: 4 }}>List a Room</p>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>You have a room to let. We'll get it in front of students.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: COLORS.brand, fontWeight: 600 }}>
              Start listing <Icon.ArrowRight color={COLORS.brand} />
            </div>
          </motion.button>

          {/* Find a Roommate */}
          <motion.button
            onClick={() => onChoose('roommate')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1.5px solid rgba(139,92,246,0.35)',
              borderRadius: 20, padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#8b5cf6' }}><Icon.Handshake /></span>
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: COLORS.cream, margin: 0, marginBottom: 4 }}>Find a Roommate</p>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>Split the rent with a compatible student via Cluster.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>
              Join Cluster <Icon.ArrowRight color="#8b5cf6" />
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const [selectedUni, setSelectedUni] = useState(() => {
    try { return JSON.parse(localStorage.getItem('selectedUni')) || UNIVERSITIES[0]; }
    catch { return UNIVERSITIES[0]; }
  });
  const [searchUni,        setSearchUni]        = useState('');
  const [showUniDropdown,  setShowUniDropdown]  = useState(false);
  const [activeTab,        setActiveTab]        = useState('all');
  const [showSearchForm,   setShowSearchForm]   = useState(false);
  const [showFilterDD,     setShowFilterDD]     = useState(false);
  const [activeFilter,     setActiveFilter]     = useState(null);
  const [activePicker,     setActivePicker]     = useState(null);
  const [showFABChooser,   setShowFABChooser]   = useState(false);

  const [searchForm, setSearchForm] = useState({
    university: '', campus: '', accommodation: '',
    roomRegion: '', junction: '', distance: '', moveInDate: '', price: '',
  });

  const dropdownRef = useRef(null);
  const filterRef   = useRef(null);

  useEffect(() => { localStorage.setItem('selectedUni', JSON.stringify(selectedUni)); }, [selectedUni]);

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowUniDropdown(false);
      if (filterRef.current   && !filterRef.current.contains(e.target))   setShowFilterDD(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Listen for global openQuickList event from other pages
  useEffect(() => {
    const h = () => setShowFABChooser(true);
    window.addEventListener('openQuickList', h);
    return () => window.removeEventListener('openQuickList', h);
  }, []);

  const filteredUnis = UNIVERSITIES.filter(
    u => u.full.toLowerCase().includes(searchUni.toLowerCase()) ||
         u.short.toLowerCase().includes(searchUni.toLowerCase())
  );

  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections', selectedUni.short, activeTab],
    queryFn: () =>
      api.get(`/listings/homepage-sections?uni=${selectedUni.short}&tab=${activeTab}`).then(r => r.data),
  });

  const handleTabClick = (tabId) => {
    if (tabId === 'filters') { setShowFilterDD(p => !p); return; }
    setActiveTab(tabId);
    setShowFilterDD(false);
    setActiveFilter(null);
  };

  const handleFilterSelect = (filterId) => {
    if (filterId === 'heat-map') { navigate('/map?mode=heatmap'); return; }
    setActiveFilter(filterId);
    setActiveTab('filters');
    setShowFilterDD(false);
  };

  const handleFABChoose = (type) => {
    setShowFABChooser(false);
    if (type === 'roommate') {
      // Dispatch roommate flow event — QuickListModal listens and pre-selects
      window.dispatchEvent(new CustomEvent('openQuickList', { detail: { mode: 'roommate' } }));
    } else {
      window.dispatchEvent(new CustomEvent('openQuickList', { detail: { mode: 'room' } }));
    }
  };

  const setField = (k, v) => setSearchForm(f => ({ ...f, [k]: v }));
  const handleSearch = () => {
    const p = new URLSearchParams();
    Object.entries(searchForm).forEach(([k, v]) => { if (v) p.set(k, v); });
    navigate(`/search?${p.toString()}`);
  };

  const PICKERS = {
    university:    { options: UNIVERSITIES.map(u => `${u.full} (${u.short})`) },
    campus:        { options: CAMPUSES[selectedUni.short] || ['Main Campus'] },
    accommodation: { options: ACCOMMODATIONS },
    roomRegion:    { options: ROOM_REGIONS },
    junction:      { options: JUNCTIONS[selectedUni.short] || [] },
    distance:      { options: DISTANCES },
    moveInDate:    { options: ['Immediately', 'Within 1 month', 'Within 3 months', 'Next semester', 'Next academic year'] },
    price:         { options: PRICE_RANGES },
  };

  const activePick = activePicker ? { ...PICKERS_META[activePicker], ...PICKERS[activePicker] } : null;

  return (
    <main className="min-h-dvh pb-32" style={{ backgroundColor: COLORS.navy }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 gap-3" style={{ backgroundColor: COLORS.navy }}>
        {/* University selector */}
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
          <motion.button
            onClick={() => setShowUniDropdown(!showUniDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border w-full max-w-xs"
            style={{ backgroundColor: `${COLORS.brand}15`, borderColor: `${COLORS.brand}40` }}
            whileTap={{ scale: 0.97 }}
          >
            <span style={{ color: COLORS.brand, flexShrink: 0 }}><Icon.Grid /></span>
            <span className="text-xs font-semibold truncate" style={{ color: COLORS.brand }}>
              {selectedUni.full} ({selectedUni.short})
            </span>
            <span style={{ color: COLORS.brand, flexShrink: 0 }}><Icon.ChevronDown /></span>
          </motion.button>

          <AnimatePresence>
            {showUniDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.18 }}
                className="absolute top-full mt-2 z-50 w-72 rounded-2xl overflow-hidden border"
                style={{ backgroundColor: '#1c1c1c', borderColor: COLORS.glassBorder, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
              >
                <div className="p-3 border-b" style={{ borderColor: COLORS.glassBorder }}>
                  <input type="text" placeholder="Search university..."
                    value={searchUni} onChange={e => setSearchUni(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: COLORS.cream, caretColor: COLORS.brand }}
                    autoFocus />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredUnis.map(uni => (
                    <motion.button key={uni.short}
                      onClick={() => { setSelectedUni(uni); setShowUniDropdown(false); setSearchUni(''); }}
                      className="w-full text-left px-4 py-3 flex items-center justify-between"
                      style={{ color: selectedUni.short === uni.short ? COLORS.brand : COLORS.cream }}
                      whileHover={{ backgroundColor: 'rgba(255,107,0,0.08)' }}>
                      <span className="text-sm font-medium">{uni.full}</span>
                      <span className="text-xs opacity-50">({uni.short})</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications / support button — replacing dead Blog link */}
        <motion.button
          onClick={() => navigate('/search')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.glassBorder, color: COLORS.cream }}
          whileHover={{ borderColor: COLORS.brand, color: COLORS.brand }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon.Search />
          <span className="text-xs font-semibold">Browse</span>
        </motion.button>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative px-4 pt-4 pb-6 overflow-hidden"
        style={{ background: `linear-gradient(160deg, #1c0e00 0%, ${COLORS.navy} 70%)` }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${COLORS.brand}15 0%, transparent 70%)` }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="font-bold leading-tight mb-2"
            style={{ fontSize: 'clamp(1.8rem, 8vw, 2.8rem)', color: COLORS.cream, fontFamily: 'Syne, sans-serif' }}>
            Find your room near{' '}
            <motion.span
              key={selectedUni.short}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ color: COLORS.brand }}>
              {selectedUni.full}
            </motion.span>
          </h1>
          <p className="text-sm mb-5" style={{ color: COLORS.muted }}>
            Verified rooms · No broker fees · Split rent with Cluster
          </p>

          <motion.button
            onClick={() => setShowSearchForm(p => !p)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ backgroundColor: showSearchForm ? COLORS.brandDark : COLORS.brand, color: '#fff' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <Icon.Search />
            {showSearchForm ? 'Close Search' : 'Search Rooms'}
          </motion.button>
        </motion.div>

        {/* Inline search form */}
        <AnimatePresence>
          {showSearchForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 250 }}
              className="overflow-hidden mt-4"
            >
              <div className="rounded-3xl overflow-hidden border"
                style={{ backgroundColor: 'rgba(20,10,0,0.95)', borderColor: 'rgba(255,107,0,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {[
                    [{ key:'university', label:'UNIVERSITY', IC: Icon.University },  { key:'campus',      label:'CAMPUS',      IC: Icon.Campus }],
                    [{ key:'accommodation',label:'ACCOMMODATION',IC: Icon.Accommodation},{key:'roomRegion',label:'ROOM REGION', IC: Icon.Region }],
                    [{ key:'junction',   label:'JUNCTION',    IC: Icon.Junction },    { key:'distance',    label:'DISTANCE',    IC: Icon.Distance }],
                    [{ key:'moveInDate', label:'MOVE-IN DATE', IC: Icon.Calendar },   { key:'price',       label:'PRICE / YEAR',IC: Icon.Naira }],
                  ].map((row, ri) => (
                    <div key={ri} className="grid grid-cols-2 divide-x" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                      {row.map(({ key, label, IC }) => (
                        <SearchField key={key} IconC={IC} label={label}
                          value={searchForm[key]} onClick={() => setActivePicker(key)} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <motion.button onClick={handleSearch}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                    style={{ backgroundColor: COLORS.brand, color: '#fff' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Icon.Search />
                    Search Rooms
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── TABS ─────────────────────────────────────────────────────────────── */}
      <div ref={filterRef} className="sticky top-0 z-30"
        style={{ backgroundColor: `${COLORS.navy}f0`, backdropFilter: 'blur(14px)', borderBottom: `1px solid ${COLORS.glassBorder}` }}>
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {MAIN_TABS.map(tab => {
            const isActive = (tab.id !== 'filters' && activeTab === tab.id) ||
                             (tab.id === 'filters' && showFilterDD);
            return (
              <motion.button key={tab.id} onClick={() => handleTabClick(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border shrink-0"
                style={{
                  backgroundColor: isActive ? COLORS.brand : 'transparent',
                  color:           isActive ? '#fff' : COLORS.muted,
                  borderColor:     isActive ? COLORS.brand : COLORS.glassBorder,
                }}
                whileTap={{ scale: 0.95 }}>
                <tab.IconC />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Filter sub-dropdown */}
        <AnimatePresence>
          {showFilterDD && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
              className="overflow-hidden border-t"
              style={{ borderColor: COLORS.glassBorder, backgroundColor: '#111' }}>
              <div className="grid grid-cols-2 gap-2 p-3">
                {FILTER_OPTIONS.map(f => (
                  <motion.button key={f.id} onClick={() => handleFilterSelect(f.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left"
                    style={{
                      backgroundColor: activeFilter === f.id ? `${COLORS.brand}20` : 'rgba(255,255,255,0.04)',
                      borderColor:     activeFilter === f.id ? `${COLORS.brand}50` : COLORS.glassBorder,
                      color:           activeFilter === f.id ? COLORS.brand : COLORS.cream,
                    }}
                    whileTap={{ scale: 0.96 }}>
                    <span style={{ color: activeFilter === f.id ? COLORS.brand : COLORS.muted }}>
                      <f.IconC />
                    </span>
                    <span className="text-xs font-medium">{f.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="px-4 py-6 space-y-8">

        {/* Cluster banner — clicking opens roommate flow */}
        <motion.div
          className="rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden cursor-pointer"
          style={{ backgroundColor: COLORS.brand }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => setShowFABChooser(true)}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <span style={{ color: 'white' }}><Icon.Users /></span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight mb-1">Split rent with Cluster 🔥</h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Can't afford a room alone? Find a compatible roommate and split the cost. Lock in for just ₦5,000.
            </p>
          </div>
          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Icon.ArrowRight color="white" />
          </motion.div>
        </motion.div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-40 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <div className="flex gap-3 overflow-hidden">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-52 h-64 rounded-2xl shrink-0 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sections?.length ? (
          <div className="space-y-10">
            {sections.map(section => (
              <div key={section.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg" style={{ color: COLORS.cream, fontFamily: 'Syne, sans-serif' }}>
                      {section.icon} {section.title}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.muted }}>{section.description}</p>
                  </div>
                  <motion.button
                    onClick={() => navigate(`/search?section=${section.id}&uni=${selectedUni.short}`)}
                    className="text-sm font-semibold flex items-center gap-1"
                    style={{ color: COLORS.brand }} whileHover={{ x: 2 }}>
                    See all <Icon.ArrowRight color={COLORS.brand} />
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
              <span style={{ color: COLORS.muted }}><Icon.Home /></span>
            </div>
            <p className="font-semibold mb-1" style={{ color: COLORS.cream }}>No listings yet</p>
            <p className="text-sm mb-5" style={{ color: COLORS.muted }}>
              Be the first to list a room near {selectedUni.full}
            </p>
            <motion.button onClick={() => setShowFABChooser(true)}
              className="px-6 py-3 rounded-2xl font-semibold text-sm"
              style={{ backgroundColor: COLORS.brand, color: '#fff' }}
              whileTap={{ scale: 0.97 }}>
              List a Room
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ── FLOATING + FAB ───────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setShowFABChooser(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20, zIndex: 40,
          width: 52, height: 52, borderRadius: '50%',
          background: COLORS.brand,
          border: '2px solid rgba(255,255,255,0.15)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255,107,0,0.5)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        title="List a space or find a roommate"
      >
        <Icon.Plus />
      </motion.button>

      {/* ── FAB CHOOSER ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFABChooser && (
          <FABChooser onClose={() => setShowFABChooser(false)} onChoose={handleFABChoose} />
        )}
      </AnimatePresence>

      {/* ── FIELD PICKER MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {activePicker && activePick && (
          <FieldPicker key={activePicker}
            label={activePick.label} IconC={activePick.IconC}
            value={searchForm[activePicker]}
            options={activePick.options}
            onSelect={val => setField(activePicker, val)}
            onClose={() => setActivePicker(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
