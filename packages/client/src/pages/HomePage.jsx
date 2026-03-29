import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import { useAuthStore } from '../store/authStore';

/* ─── Constants ─────────────────────────────────────────────────── */
const NIGERIAN_UNIVERSITIES = [
  'All Universities',
  'Nnamdi Azikiwe University (Unizik)',
  'University of Port Harcourt (UniPort)',
  'Rivers State University (RSU)',
  'Obafemi Awolowo University (OAU)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU)',
  'University of Benin (UNIBEN)',
  'Lagos State University (LASU)',
  'Covenant University',
  'Babcock University',
];

const CATEGORY_TABS = ['All', 'Trending', 'On Campus', 'Off Campus', 'Filters'];

const FILTER_OPTIONS = [
  { label: 'Filter by Type',  key: 'type' },
  { label: 'By Junction',     key: 'junction' },
  { label: 'By Distance',     key: 'distance' },
  { label: 'By Price',        key: 'price' },
  { label: 'By Map',          key: 'map' },
];

const SECTION_ROWS = [
  { id: 'trending',   label: 'Trending',   query: '?limit=8&category=trending' },
  { id: 'on_campus',  label: 'On Campus',  query: '?limit=8&category=on_campus' },
  { id: 'off_campus', label: 'Off Campus', query: '?limit=8&category=off_campus' },
];

/* ─── Feather SVG Icons ──────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ─── Horizontal Listing Row ─────────────────────────────────────── */
function ListingRow({ sectionId, label, apiQuery, navigate }) {
  const rowRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['listings', sectionId],
    queryFn: () => api.get(`/listings${apiQuery}`).then(r => r.data),
  });

  const listings = data?.listings ?? data?.data ?? [];

  const scroll = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir * 210, behavior: 'smooth' });
  };

  const arrowBtn = (dir) => ({
    position: 'absolute',
    [dir === -1 ? 'left' : 'right']: 4,
    top: '50%', transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(10,10,10,0.88)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50%', width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff',
  });

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Row header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 18px 10px',
      }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: '#fff' }}>
          {label}
        </span>
        <button
          onClick={() => navigate(`/search?category=${sectionId}`)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ff6b00', fontSize: 12, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          See all <ArrowRight />
        </button>
      </div>

      {/* Scrollable strip */}
      <div style={{ position: 'relative' }}>
        <button style={arrowBtn(-1)} onClick={() => scroll(-1)}><ChevronLeft /></button>

        <div
          ref={rowRef}
          style={{
            display: 'flex', gap: 10,
            overflowX: 'auto', scrollbarWidth: 'none',
            padding: '0 18px 14px',
            scrollSnapType: 'x mandatory',
          }}
        >
          {isLoading
            ? [0,1,2,3].map(i => (
                <div key={i} style={{
                  minWidth: 196, height: 196,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 14, flexShrink: 0,
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }} />
              ))
            : listings.length > 0
              ? listings.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ minWidth: 196, flexShrink: 0, scrollSnapAlign: 'start' }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))
              : (
                <div style={{
                  padding: '40px 0', width: '100%', textAlign: 'center',
                  color: 'rgba(255,255,255,0.2)', fontSize: 13,
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  No listings yet
                </div>
              )
          }
        </div>

        <button style={arrowBtn(1)} onClick={() => scroll(1)}><ChevronRight /></button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 18px' }} />
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);

  const [activeUni, setActiveUni]         = useState('Nnamdi Azikiwe University (Unizik)');
  const [showUniDrop, setShowUniDrop]     = useState(false);
  const [uniSearchQ, setUniSearchQ]       = useState('');
  const [activeTab, setActiveTab]         = useState('All');
  const [showFilter, setShowFilter]       = useState(false);
  const [showSearch, setShowSearch]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');

  const shortUni    = activeUni.replace(/\s*\(.*\)/, '');
  const uniCode     = activeUni.match(/\(([^)]+)\)/)?.[1] ?? shortUni;
  const filteredUnis = NIGERIAN_UNIVERSITIES.filter(u =>
    u.toLowerCase().includes(uniSearchQ.toLowerCase())
  );

  const visibleSections = SECTION_ROWS.filter(s => {
    if (activeTab === 'All')        return true;
    if (activeTab === 'Trending')   return s.id === 'trending';
    if (activeTab === 'On Campus')  return s.id === 'on_campus';
    if (activeTab === 'Off Campus') return s.id === 'off_campus';
    return true;
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  return (
    <main style={{
      fontFamily: "'Outfit', sans-serif",
      background: '#0a0a0a',
      minHeight: '100vh',
      paddingBottom: 80,
      color: '#fff',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:wght@700;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { display: none; }
        .hoverable:hover { opacity: 0.8; }
        .uni-item:hover { background: rgba(255,107,0,0.08) !important; }
        .filter-row:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>

      {/* ──────────── TOP BAR ──────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 18px 12px',
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Greeting + uni pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', fontWeight: 400 }}>
            {user ? `Welcome, ${user.first_name ?? user.name ?? 'back'} 👋` : 'Welcome 👋'}
          </span>
          <button
            onClick={() => setShowUniDrop(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,107,0,0.12)',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: 100, padding: '5px 11px 5px 9px',
              color: '#ff6b00', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}
          >
            <PinIcon /> {uniCode} <ChevronDown />
          </button>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowSearch(true)}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
            }}
          >
            <SearchIcon />
          </button>
          <button
            onClick={() => navigate(user ? '/profile' : '/login')}
            style={{
              background: user ? '#ff6b00' : 'rgba(255,255,255,0.07)',
              border: 'none', borderRadius: '50%',
              width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <ProfileIcon />
          </button>
        </div>
      </div>

      {/* ──────────── UNIVERSITY DROPDOWN ──────────── */}
      <AnimatePresence>
        {showUniDrop && (
          <>
            <div
              onClick={() => setShowUniDrop(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              style={{
                position: 'fixed', top: 78, left: 18, right: 18, zIndex: 50,
                background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18, overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                maxHeight: '65vh', display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <input
                  autoFocus
                  placeholder="Search university…"
                  value={uniSearchQ}
                  onChange={e => setUniSearchQ(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    padding: '9px 13px', color: '#fff', fontSize: 13,
                    fontFamily: "'Outfit', sans-serif", outline: 'none',
                  }}
                />
              </div>
              <div style={{ overflowY: 'auto' }}>
                {filteredUnis.map(u => (
                  <div
                    key={u}
                    className="uni-item"
                    onClick={() => { setActiveUni(u); setShowUniDrop(false); setUniSearchQ(''); }}
                    style={{
                      padding: '13px 16px', fontSize: 13, cursor: 'pointer',
                      color: u === activeUni ? '#ff6b00' : '#fff',
                      background: u === activeUni ? 'rgba(255,107,0,0.08)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'background 0.15s',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <PinIcon /> {u}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────── SEARCH BAR (tappable placeholder) ──────────── */}
      <div style={{ padding: '10px 18px 0' }}>
        <div
          onClick={() => setShowSearch(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#141414', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 14, padding: '12px 16px', cursor: 'text',
          }}
        >
          <span style={{ color: '#ff6b00' }}><SearchIcon /></span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', flex: 1 }}>
            Find a room near {shortUni}…
          </span>
        </div>
      </div>

      {/* ──────────── SEARCH FULL OVERLAY ──────────── */}
      <AnimatePresence>
        {showSearch && (
          <>
            <div onClick={() => setShowSearch(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 55 }} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
                background: '#0a0a0a', padding: '16px 18px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                  background: '#141414',
                  border: '1px solid rgba(255,107,0,0.5)',
                  borderRadius: 14, padding: '12px 16px',
                }}>
                  <span style={{ color: '#ff6b00' }}><SearchIcon /></span>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder={`Find a room near ${shortUni}…`}
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: '#fff', fontSize: 14, fontFamily: "'Outfit', sans-serif",
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                      <CloseIcon />
                    </button>
                  )}
                </div>
                <button onClick={() => setShowSearch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 4 }}>
                  Cancel
                </button>
              </div>

              {searchQuery.trim() && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSearch}
                  style={{
                    marginTop: 10, width: '100%',
                    background: '#ff6b00', color: '#fff', border: 'none',
                    borderRadius: 12, padding: '13px 0',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Search rooms →
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────── CATEGORY TABS ──────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        overflowX: 'auto', scrollbarWidth: 'none',
        padding: '14px 18px 0', gap: 8,
      }}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => tab === 'Filters' ? setShowFilter(true) : setActiveTab(tab)}
            style={{
              padding: '8px 16px', borderRadius: 100,
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
              cursor: 'pointer', border: 'none',
              fontFamily: "'Outfit', sans-serif",
              background:
                tab === 'Filters'
                  ? 'rgba(255,255,255,0.07)'
                  : activeTab === tab
                    ? '#ff6b00'
                    : 'rgba(255,255,255,0.06)',
              color:
                tab === 'Filters'
                  ? 'rgba(255,255,255,0.55)'
                  : activeTab === tab
                    ? '#fff'
                    : 'rgba(255,255,255,0.55)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {tab === 'Filters' && <FilterIcon />}
            {tab}
          </button>
        ))}
      </div>

      {/* ──────────── FILTER SIDE DRAWER ──────────── */}
      <AnimatePresence>
        {showFilter && (
          <>
            <div onClick={() => setShowFilter(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50 }} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '78%', maxWidth: 310, zIndex: 55,
                background: '#141414',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{
                padding: '22px 18px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
                  Filter
                </span>
                <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)' }}>
                  <CloseIcon />
                </button>
              </div>

              {/* Scrollable filter list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                {FILTER_OPTIONS.map(opt => (
                  <div
                    key={opt.key}
                    className="filter-row"
                    onClick={() => { navigate(`/search?filterBy=${opt.key}`); setShowFilter(false); }}
                    style={{
                      padding: '17px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', color: '#fff',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{opt.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}><ArrowRight /></span>
                  </div>
                ))}
              </div>

              <div style={{ padding: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setShowFilter(false)}
                  style={{
                    width: '100%', background: '#ff6b00', color: '#fff',
                    border: 'none', borderRadius: 14, padding: '14px 0',
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────── LISTING ROWS (Netflix horizontal scroll) ──────────── */}
      <div style={{ marginTop: 10 }}>
        {visibleSections.map(section => (
          <ListingRow
            key={section.id}
            sectionId={section.id}
            label={section.label}
            apiQuery={section.query}
            navigate={navigate}
          />
        ))}
      </div>

      {/* ──────────── LANDLORD CTA ──────────── */}
      <div style={{
        margin: '16px 18px 0',
        background: 'linear-gradient(135deg, rgba(255,107,0,0.13), rgba(255,107,0,0.04))',
        border: '1px solid rgba(255,107,0,0.2)',
        borderRadius: 18, padding: '18px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>🏡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
            Are you a landlord?
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            List your property, reach thousands of students free
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#ff6b00', color: '#fff', border: 'none',
            borderRadius: 100, padding: '9px 16px', fontSize: 13, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          List Now
        </button>
      </div>
    </main>
  );
}
