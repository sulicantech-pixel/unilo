import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

// ── Constants ─────────────────────────────────────────────────────────────────
const CITIES = ['Port Harcourt', 'Lagos', 'Ibadan', 'Abuja', 'Enugu', 'Benin City', 'Warri', 'Owerri', 'Uyo', 'Calabar'];

const TYPES = [
  { value: '',                 label: 'All Types' },
  { value: 'self_contain',     label: 'Self Contain' },
  { value: 'shared_room',      label: 'Shared Room' },
  { value: 'room_and_parlour', label: 'Room & Parlour' },
  { value: 'flat',             label: 'Flat' },
  { value: 'hostel',           label: 'Hostel' },
  { value: 'boys_hostel',      label: 'Boys Hostel' },
  { value: 'girls_hostel',     label: 'Girls Hostel' },
  { value: 'bungalow',         label: 'Bungalow' },
  { value: 'duplex',           label: 'Duplex' },
];

const PRICE_RANGES = [
  { value: '',              label: 'Any Price' },
  { value: '0-50000',       label: 'Under ₦50k' },
  { value: '50000-100000',  label: '₦50k – ₦100k' },
  { value: '100000-200000', label: '₦100k – ₦200k' },
  { value: '200000-400000', label: '₦200k – ₦400k' },
  { value: '400000-',       label: 'Above ₦400k' },
];

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc','label': 'Price: High → Low' },
  { value: 'nearest',   label: 'Nearest' },
];

// ── Dropdown component ─────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = value !== '' && value !== undefined;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isActive ? 'rgba(255,107,0,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isActive ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.7)',
          borderRadius: 99, padding: '7px 14px',
          fontSize: 13, fontWeight: 600,
          fontFamily: 'DM Sans, sans-serif',
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
      >
        {icon && <span>{icon}</span>}
        <span>{selected?.label || label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              background: '#161616', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '6px',
              minWidth: 180, zIndex: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 12px', borderRadius: 9, border: 'none',
                  background: opt.value === value ? 'rgba(255,107,0,0.12)' : 'transparent',
                  color: opt.value === value ? '#ff6b00' : 'rgba(255,255,255,0.75)',
                  fontSize: 13, fontWeight: opt.value === value ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (opt.value !== value) e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (opt.value !== value) e.target.style.background = 'transparent'; }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Vacancy toggle ─────────────────────────────────────────────────────────────
function VacantToggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: value ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${value ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.1)'}`,
        color: value ? '#34d399' : 'rgba(255,255,255,0.7)',
        borderRadius: 99, padding: '7px 14px',
        fontSize: 13, fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {value && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />}
      Vacant Only
    </button>
  );
}

// ── Search bar ────────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} style={{ position: 'relative' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search area, university, address…"
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '11px 14px 11px 38px',
          color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      {value && (
        <button type="button" onClick={() => onChange('')}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4, fontSize: 16 }}>
          ✕
        </button>
      )}
    </form>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ height: 176, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '70%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 11, background: 'rgba(255,255,255,0.04)', borderRadius: 6, width: '50%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '40%', marginTop: 4, animation: 'pulse 1.4s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query,     setQuery]     = useState(searchParams.get('search') || '');
  const [city,      setCity]      = useState(searchParams.get('city') || '');
  const [type,      setType]      = useState(searchParams.get('type') || '');
  const [price,     setPrice]     = useState(searchParams.get('price') || '');
  const [sort,      setSort]      = useState(searchParams.get('sort') || 'newest');
  const [vacant,    setVacant]    = useState(searchParams.get('vacant') === 'true');

  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const activeFiltersCount = [city, type, price, vacant].filter(Boolean).length;

  const buildParams = useCallback((p = 1) => {
    const params = new URLSearchParams();
    if (query)  params.set('search', query);
    if (city)   params.set('city', city);
    if (type)   params.set('type', type);
    if (price) {
      const [min, max] = price.split('-');
      if (min) params.set('min_price', min);
      if (max) params.set('max_price', max);
    }
    if (sort)   params.set('sort', sort);
    if (vacant) params.set('is_vacant', 'true');
    params.set('page', p);
    params.set('limit', 12);
    return params;
  }, [query, city, type, price, sort, vacant]);

  const fetchListings = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await api.get(`/listings?${buildParams(p)}`);
      const items = data.listings ?? data.data ?? [];
      setListings(prev => append ? [...prev, ...items] : items);
      setTotal(data.total ?? items.length);
      setHasMore((data.page ?? p) < (data.totalPages ?? 1));
      setPage(p);
    } catch {
      if (!append) setListings([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildParams]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchListings(1), 350);
    return () => clearTimeout(t);
  }, [fetchListings]);

  // Sync URL params
  useEffect(() => {
    const p = new URLSearchParams();
    if (query)  p.set('search', query);
    if (city)   p.set('city', city);
    if (type)   p.set('type', type);
    if (price)  p.set('price', price);
    if (sort !== 'newest') p.set('sort', sort);
    if (vacant) p.set('vacant', 'true');
    setSearchParams(p, { replace: true });
  }, [query, city, type, price, sort, vacant, setSearchParams]);

  const clearAllFilters = () => {
    setCity(''); setType(''); setPrice(''); setSort('newest'); setVacant(false);
  };

  const cityOptions = [{ value: '', label: 'All Cities' }, ...CITIES.map(c => ({ value: c, label: c }))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', color: '#fff', paddingBottom: 100 }}>

        {/* ── Sticky Header ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 'env(safe-area-inset-top)',
        }}>
          {/* Top row: title + map toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17 }}>
                {loading ? 'Searching…' : `${total.toLocaleString()} ${total === 1 ? 'Room' : 'Rooms'}`}
              </span>
            </div>
            <button onClick={() => navigate('/map')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#ff6b00', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 99, padding: '6px 14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              📍 Map
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: '0 16px 10px' }}>
            <SearchBar value={query} onChange={setQuery} onSubmit={e => { e.preventDefault(); fetchListings(1); }} />
          </div>

          {/* Filter chips row */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <Dropdown label="City"       value={city}  options={cityOptions}  onChange={setCity}  icon="🏙" />
            <Dropdown label="Type"       value={type}  options={TYPES}        onChange={setType}  icon="🏠" />
            <Dropdown label="Price"      value={price} options={PRICE_RANGES} onChange={setPrice} icon="💰" />
            <Dropdown label="Sort"       value={sort}  options={SORT_OPTIONS} onChange={setSort}  icon="↕" />
            <VacantToggle value={vacant} onChange={setVacant} />
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters}
                style={{ whiteSpace: 'nowrap', background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: 99, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                Clear {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        <div style={{ padding: '16px 16px 0', maxWidth: 1100, margin: '0 auto' }}>

          {/* Active filter summary */}
          {(city || type || price || vacant) && (
            <div style={{ marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Showing{city ? ` rooms in ${city}` : ' all cities'}
              {type ? ` · ${TYPES.find(t => t.value === type)?.label}` : ''}
              {price ? ` · ${PRICE_RANGES.find(p => p.value === price)?.label}` : ''}
              {vacant ? ' · Vacant only' : ''}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '80px 20px' }}
            >
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏚</div>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No rooms found</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginBottom: 24 }}>
                Try adjusting your filters or searching a different area.
              </p>
              <button onClick={clearAllFilters}
                style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                <AnimatePresence mode="popLayout">
                  {listings.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load more */}
              {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                  <button
                    onClick={() => fetchListings(page + 1, true)}
                    disabled={loadingMore}
                    style={{
                      background: loadingMore ? 'rgba(255,255,255,0.05)' : 'rgba(255,107,0,0.1)',
                      border: '1px solid rgba(255,107,0,0.3)',
                      color: '#ff6b00', borderRadius: 12, padding: '13px 32px',
                      fontSize: 14, fontWeight: 700, cursor: loadingMore ? 'not-allowed' : 'pointer',
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                      opacity: loadingMore ? 0.6 : 1,
                    }}
                  >
                    {loadingMore ? 'Loading…' : `Load more rooms`}
                  </button>
                </div>
              )}

              {!hasMore && listings.length > 0 && (
                <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.25)', padding: '32px 0 16px' }}>
                  You've seen all {total} rooms
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
