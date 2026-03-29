import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ListingCard from '../components/ListingCard';
import BottomNav from '../components/BottomNav';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const FIELDS = [
  {
    key: 'university', label: 'University', placeholder: 'Any university',
    options: ['University of Port Harcourt', 'Rivers State University', 'University of Lagos', 'University of Ibadan',
      'Obafemi Awolowo University', 'University of Benin', 'Ahmadu Bello University', 'University of Nigeria Nsukka',
      'Covenant University', 'Babcock University', 'Pan-Atlantic University', 'Federal University Oye-Ekiti',
      'Nnamdi Azikiwe University', 'University of Calabar', 'Delta State University'],
  },
  {
    key: 'campus', label: 'Campus', placeholder: 'Any campus',
    options: ['On Campus', 'Off Campus', 'Near Gate', 'Town'],
  },
  {
    key: 'type', label: 'Accommodation Type', placeholder: 'Any type',
    options: ['Room', 'Roommate (Cluster)', 'Self-contain', 'Mini flat', 'Apartment', 'BQ'],
  },
  {
    key: 'region', label: 'Room Region', placeholder: 'Any region',
    options: ['On Campus', 'Off Campus', 'Near Gate', 'Town'],
  },
  {
    key: 'junction', label: 'Junction', placeholder: 'Any junction',
    options: ['Choba Junction', 'Rumuola Junction', 'Rumuokoro Junction', 'Ada George Junction',
      'NTA Junction', 'Eliozu Junction', 'Ozuoba Junction', 'Alakahia Junction',
      'Rumuigbo Junction', 'Mile 3', 'Mile 4', 'Diobu', 'GRA Phase 2', 'GRA Phase 3', 'Trans Amadi'],
  },
  {
    key: 'distance', label: 'Distance from School', placeholder: 'Any distance',
    options: ['< 5 min walk', '5–10 min walk', '10–20 min walk', '20–30 min walk', '> 30 min walk'],
  },
  {
    key: 'movein', label: 'Move-in Date', placeholder: 'Any date', type: 'date',
  },
  {
    key: 'price', label: 'Price / Year', placeholder: 'Any price',
    options: ['Under ₦100,000', '₦100k – ₦200k', '₦200k – ₦350k', '₦350k – ₦500k', '₦500k – ₦750k',
      '₦750k – ₦1,000,000', 'Over ₦1,000,000'],
  },
];

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Top Rated'];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [activeField, setActiveField] = useState(null); // which field is drilling down
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('Recommended');
  const [showSort, setShowSort] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Pre-fill filters from URL params
  useEffect(() => {
    const initial = {};
    FIELDS.forEach(f => {
      const v = searchParams.get(f.key);
      if (v) initial[f.key] = v;
    });
    setFilters(initial);
  }, []);

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [filters, sort]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('sort', sort);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/listings?${params}`);
      const data = await res.json();
      setListings(data.listings || data || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveField(null);
  };

  const clearAll = () => setFilters({});
  const hasFilters = Object.values(filters).some(Boolean);
  const activeCount = Object.values(filters).filter(Boolean).length;

  const field = FIELDS.find(f => f.key === activeField);

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white">
          <BackIcon />
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">
            {filters.university || 'All universities'}
          </p>
          <p className="text-[#666] text-xs">
            {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : 'Search rooms'}
          </p>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-[#ff6b00] text-xs font-medium px-3 py-1.5 rounded-full border border-[#ff6b00]/30 hover:bg-[#ff6b00]/10 transition-colors">
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeField ? (
          /* ── DRILL-DOWN: options list ── */
          <motion.div key="drill"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="flex-1 flex flex-col"
          >
            <div className="px-4 py-4 border-b border-white/5 flex items-center gap-3">
              <button onClick={() => setActiveField(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white">
                <BackIcon />
              </button>
              <p className="font-semibold text-white">{field?.label}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Clear option */}
              <button
                onClick={() => setFilter(activeField, '')}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <span className="text-[#888] text-sm">Any {field?.label.toLowerCase()}</span>
                {!filters[activeField] && <div className="w-4 h-4 rounded-full bg-[#ff6b00]" />}
              </button>

              {field?.type === 'date' ? (
                <div className="px-5 py-6">
                  <p className="text-[#888] text-xs mb-3">Select move-in date</p>
                  <input
                    type="date"
                    value={filters.movein || ''}
                    onChange={e => setFilter('movein', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff6b00]/50"
                  />
                </div>
              ) : (
                field?.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilter(activeField, opt)}
                    className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white text-sm">{opt}</span>
                    {filters[activeField] === opt && (
                      <div className="w-4 h-4 rounded-full bg-[#ff6b00]" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          /* ── MAIN: field list + results ── */
          <motion.div key="main"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="flex-1 flex flex-col"
          >
            {/* Filter fields */}
            <div className="border-b border-white/5 bg-[#0d0d0d]">
              {FIELDS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveField(f.key)}
                  className="w-full flex items-center justify-between px-5 py-3.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-[#888] text-xs mb-0.5">{f.label}</p>
                    <p className={`text-sm font-medium ${filters[f.key] ? 'text-[#ff6b00]' : 'text-[#444]'}`}>
                      {filters[f.key] || f.placeholder}
                    </p>
                  </div>
                  <ChevronRight />
                </button>
              ))}
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[#888] text-sm">
                {loading ? 'Searching...' : `${listings.length} room${listings.length !== 1 ? 's' : ''} found`}
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowSort(s => !s)}
                  className="flex items-center gap-1.5 text-sm text-white border border-white/10 px-3 py-1.5 rounded-full hover:border-white/20 transition-colors"
                >
                  <FilterIcon />
                  {sort}
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-20 w-48 shadow-xl">
                    {SORT_OPTIONS.map(s => (
                      <button key={s} onClick={() => { setSort(s); setShowSort(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${sort === s ? 'text-[#ff6b00]' : 'text-white'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-28">
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="rounded-2xl bg-[#1a1a1a]" style={{ paddingBottom: '66.67%' }} />
                      <div className="mt-2 h-3 bg-[#1a1a1a] rounded w-3/4" />
                      <div className="mt-1.5 h-3 bg-[#1a1a1a] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-1">No rooms found</p>
                  <p className="text-[#555] text-sm mb-5">Try adjusting your filters</p>
                  {hasFilters && (
                    <button onClick={clearAll} className="text-sm font-medium text-[#ff6b00] border border-[#ff6b00]/30 px-5 py-2.5 rounded-full hover:bg-[#ff6b00]/10 transition-colors">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {listings.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      wishlistIds={wishlistIds}
                      onWishlistToggle={(id) => setWishlistIds(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
