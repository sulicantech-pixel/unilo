import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ListingCard from '../components/ListingCard';
import BottomNav from '../components/BottomNav';

// ── Icons ────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Constants ────────────────────────────────────────────
const ALL_UNIVERSITIES = [
  'University of Port Harcourt', 'Rivers State University', 'University of Lagos',
  'University of Ibadan', 'Obafemi Awolowo University', 'University of Benin',
  'Ahmadu Bello University', 'University of Nigeria Nsukka', 'Covenant University',
  'Babcock University', 'Pan-Atlantic University', 'Nnamdi Azikiwe University',
  'Federal University Oye-Ekiti', 'University of Calabar', 'Delta State University',
  'Lagos State University', 'Benson Idahosa University', 'Redeemer\'s University',
  'American University of Nigeria', 'Bowen University', 'Crawford University',
  'Caleb University', 'Landmark University', 'Madonna University',
  'Michael Okpara University of Agriculture', 'Federal University of Technology Akure',
  'Federal University of Technology Minna', 'Federal University of Technology Owerri',
  'Ladoke Akintola University of Technology', 'Enugu State University of Science and Technology',
];

const CATEGORIES = ['All', 'Trending', 'On Campus', 'Off Campus', 'Clusters', 'New'];

const FILTER_OPTIONS = [
  { value: 'near_school', label: 'Near School' },
  { value: 'by_junction', label: 'By Junction' },
  { value: 'by_size', label: 'By Size' },
  { value: 'by_university', label: 'By University' },
  { value: 'favourites', label: 'Favourites' },
  { value: 'new', label: 'New' },
];

// ── Skeleton card ────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[200px] sm:w-[220px] animate-pulse">
    <div className="rounded-xl bg-[#1a1a1a]" style={{ paddingBottom: '75%' }} />
    <div className="mt-2 h-3.5 bg-[#1a1a1a] rounded w-4/5" />
    <div className="mt-1.5 h-3 bg-[#1a1a1a] rounded w-3/5" />
    <div className="mt-1.5 h-3.5 bg-[#1a1a1a] rounded w-2/5" />
  </div>
);

// ── Horizontal listings row ──────────────────────────────
function ListingsRow({ category, university, filter, wishlistIds, onWishlistToggle }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category.toLowerCase().replace(' ', '_'));
    if (university) params.set('university', university);
    if (filter) params.set('filter', filter);
    params.set('limit', '12');

    fetch(`${import.meta.env.VITE_API_URL}/listings?${params}`)
      .then(r => r.json())
      .then(data => setListings(data.listings || data || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [category, university, filter]);

  if (!loading && listings.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-white font-semibold text-base">{category}</h2>
        <button
          onClick={() => {/* navigate to search with this category */}}
          className="text-[#ff6b00] text-xs font-medium hover:underline"
        >
          See all
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory">
        {loading
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : listings.map(listing => (
              <div key={listing.id} className="snap-start">
                <ListingCard
                  listing={listing}
                  wishlistIds={wishlistIds}
                  onWishlistToggle={onWishlistToggle}
                />
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ── University picker with search ────────────────────────
function UniversityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? ALL_UNIVERSITIES.filter(u => u.toLowerCase().includes(query.toLowerCase()))
    : ALL_UNIVERSITIES;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const select = (u) => { onChange(u); setOpen(false); setQuery(''); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm text-white hover:border-white/20 transition-colors max-w-[220px]"
      >
        <span className="truncate flex-1 text-left">
          {value || <span className="text-[#555]">Select university</span>}
        </span>
        <span className={`text-[#555] transition-transform ${open ? 'rotate-180' : ''}`}><ChevronDown /></span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
          >
            {/* Search input */}
            <div className="p-2 border-b border-white/5">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2">
                <span className="text-[#555]"><SearchIcon /></span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search university..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-[#444] focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-[#555] hover:text-white">
                    <XIcon />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto overscroll-contain">
              {/* Any university option */}
              <button
                onClick={() => select('')}
                className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 hover:bg-white/5 transition-colors ${!value ? 'text-[#ff6b00]' : 'text-[#888]'}`}
              >
                All universities
              </button>
              {filtered.length === 0 ? (
                <p className="text-[#555] text-sm text-center py-6">No results for "{query}"</p>
              ) : (
                filtered.map(u => (
                  <button
                    key={u}
                    onClick={() => select(u)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 hover:bg-white/5 transition-colors ${value === u ? 'text-[#ff6b00] font-medium' : 'text-white'}`}
                  >
                    {u}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [university, setUniversity] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleWishlistToggle = useCallback((id) => {
    setWishlistIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleUniversityChange = (u) => {
    setUniversity(u);
    fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'university_selected', university: u }),
    }).catch(() => {});
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'tab_changed', tab }),
    }).catch(() => {});
  };

  // Which category rows to show
  const rows = activeTab === 'All'
    ? ['Trending', 'On Campus', 'Off Campus', 'Clusters', 'New']
    : [activeTab];

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white pb-28">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        {/* Logo + uni picker */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div>
            <h1 className="text-white font-bold text-xl font-[Fraunces] leading-none">unilo</h1>
            <p className="text-[#555] text-xs mt-0.5">Where you feel at home.</p>
          </div>
          <UniversityPicker value={university} onChange={handleUniversityChange} />
        </div>

        {/* Headline */}
        <div className="px-4 pb-3">
          <p className="text-white text-lg font-semibold leading-snug">
            {university
              ? <>Find a room near <span className="text-[#ff6b00]">{university.split(' ').slice(0, 3).join(' ')}</span></>
              : 'Find your perfect student room'
            }
          </p>
        </div>

        {/* Category tabs + filter */}
        <div className="flex items-center gap-0 border-t border-white/5 overflow-x-auto scrollbar-hide px-4 py-0">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide py-2.5">
            {CATEGORIES.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-[#ff6b00] text-white'
                    : 'text-[#666] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter button */}
          <div ref={filterRef} className="relative shrink-0 ml-2">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilter
                  ? 'border-[#ff6b00] text-[#ff6b00] bg-[#ff6b00]/10'
                  : 'border-white/15 text-[#666] hover:border-white/30 hover:text-white'
              }`}
            >
              <FilterIcon />
              {activeFilter ? FILTER_OPTIONS.find(f => f.value === activeFilter)?.label : 'Filter'}
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                >
                  {activeFilter && (
                    <button
                      onClick={() => { setActiveFilter(''); setFilterOpen(false); }}
                      className="w-full text-left px-4 py-3 text-xs text-[#ff6b00] border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <XIcon /> Clear filter
                    </button>
                  )}
                  {FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setActiveFilter(opt.value); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                        activeFilter === opt.value ? 'text-[#ff6b00] font-medium' : 'text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pt-4 space-y-8">
        {rows.map(row => (
          <ListingsRow
            key={row + university + activeFilter}
            category={row}
            university={university}
            filter={activeFilter}
            wishlistIds={wishlistIds}
            onWishlistToggle={handleWishlistToggle}
          />
        ))}
      </div>

      {/* ── Sticky search button ── */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => {
            fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventType: 'search_opened' }),
            }).catch(() => {});
            navigate('/search');
          }}
          className="flex items-center gap-2 bg-[#ff6b00] text-white text-sm font-semibold px-6 py-3.5 rounded-full shadow-lg shadow-[#ff6b00]/30 hover:bg-[#e55f00] active:scale-95 transition-all"
        >
          <SearchIcon />
          Search Rooms
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
