import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import QuickListModal from '../components/QuickListModal';
import { ANIMATIONS, COLORS, STYLES, GRID, TYPOGRAPHY } from '../utils/designSystem';
import { useAuthStore } from '../store/authStore';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=80&auto=format&fit=crop';

const ROOM_TYPES = [
  { value: '',                  label: 'Any type' },
  { value: 'self_contain',      label: 'Self Contain' },
  { value: 'room_and_parlour',  label: 'Room & Parlour' },
  { value: 'flat',              label: 'Flat' },
  { value: 'hostel',            label: 'Hostel' },
  { value: 'bungalow',          label: 'Bungalow' },
  { value: 'duplex',            label: 'Duplex' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedUni, setSelectedUni] = useState(
    () => localStorage.getItem('selectedUni') || 'University of Lagos'
  );
  const [universities, setUniversities] = useState([
    'University of Lagos','Covenant University','OAU Ile-Ife','UNIPORT',
    'UNIZIK','ABU Zaria','University of Ibadan','FUTA','LASU','LUTH',
  ]);
  const [searchUni, setSearchUni]           = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [activeTab, setActiveTab]           = useState('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickList, setShowQuickList]   = useState(false);
  const dropdownRef = useRef(null);

  const [searchForm, setSearchForm] = useState({
    search: '', city: '', type: '', min_price: '', max_price: '', bedrooms: '', is_vacant: '',
  });

  useEffect(() => { localStorage.setItem('selectedUni', selectedUni); }, [selectedUni]);

  // Try to load dynamic university list from backend
  useEffect(() => {
    api.get('/universities').then((r) => {
      if (Array.isArray(r.data) && r.data.length > 0) {
        setUniversities(r.data.map((u) => (typeof u === 'string' ? u : u.name)));
      }
    }).catch(() => {});
  }, []);

  // Listen for global openQuickList event
  useEffect(() => {
    const handler = () => setShowQuickList(true);
    window.addEventListener('openQuickList', handler);
    return () => window.removeEventListener('openQuickList', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUniDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredUnis = universities.filter((u) =>
    u.toLowerCase().includes(searchUni.toLowerCase())
  );

  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections', selectedUni, activeTab],
    queryFn: () =>
      api.get(`/listings/homepage-sections?uni=${encodeURIComponent(selectedUni)}&tab=${activeTab}`)
         .then((r) => r.data),
    retry: false,
  });

  const tabs = [
    { id: 'all',       label: 'All' },
    { id: 'trending',  label: 'Trending' },
    { id: 'on-campus', label: 'On Campus' },
    { id: 'off-campus',label: 'Off Campus' },
    { id: 'filters',   label: 'Filters' },
  ];

  // Pick distinctive word for hero (skip generic openers)
  const heroUniName = (() => {
    const skip = new Set(['university','federal','state','college','of','the','institute']);
    const w = selectedUni.split(' ').find((x) => !skip.has(x.toLowerCase()));
    return w || selectedUni.split(' ')[0];
  })();

  const handleSearch = () => {
    const p = new URLSearchParams();
    Object.entries(searchForm).forEach(([k, v]) => { if (v) p.set(k, v); });
    p.set('uni', selectedUni);
    navigate(`/search?${p.toString()}`);
    setShowSearchModal(false);
  };

  return (
    <main className="min-h-dvh pb-nav" style={{ backgroundColor: COLORS.navy }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[62vh] flex flex-col justify-end overflow-hidden">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        {/* Legibility gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.65) 45%, rgba(10,10,10,0.2) 100%)',
          }}
        />

        {/* University selector — top */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-5 z-20" ref={dropdownRef}>
          <button
            onClick={() => setShowUniDropdown(!showUniDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium"
            style={{
              backgroundColor: 'rgba(10,10,10,0.65)',
              backdropFilter: 'blur(12px)',
              borderColor: COLORS.glassBorder,
              color: COLORS.cream,
            }}
          >
            <span style={{ color: COLORS.brand }}>🎓</span>
            <span className="max-w-[220px] truncate">{selectedUni}</span>
            <span className="ml-1 text-xs opacity-60">▼</span>
          </button>

          <AnimatePresence>
            {showUniDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="absolute top-full mt-1 left-4 z-50 rounded-2xl overflow-hidden flex flex-col"
                style={{
                  width: 'min(92vw, 380px)',
                  backgroundColor: '#111',
                  border: `1px solid ${COLORS.glassBorder}`,
                  boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                  maxHeight: '55vh',
                }}
              >
                <div className="p-2 border-b" style={{ borderColor: COLORS.glassBorder }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search university..."
                    value={searchUni}
                    onChange={(e) => setSearchUni(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  {filteredUnis.length === 0 ? (
                    <p className="p-4 text-sm text-center" style={{ color: COLORS.muted }}>No match</p>
                  ) : (
                    filteredUnis.map((uni) => (
                      <button
                        key={uni}
                        onClick={() => { setSelectedUni(uni); setShowUniDropdown(false); setSearchUni(''); }}
                        className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors"
                        style={{ color: selectedUni === uni ? COLORS.brand : COLORS.cream, fontWeight: selectedUni === uni ? '600' : '400' }}
                      >
                        {selectedUni === uni && <span style={{ color: COLORS.brand, flexShrink: 0 }}>✓</span>}
                        {uni}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 px-4 sm:px-6 pb-10">
          <motion.h1
            className="font-display font-bold leading-tight mb-3"
            style={{ color: COLORS.cream, fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Find your room near{' '}
            <motion.span
              key={heroUniName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ color: COLORS.brand }}
            >
              {heroUniName}
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base mb-6"
            style={{ color: 'rgba(245,240,232,0.72)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Verified rooms · No broker fees · Split rent with Cluster
          </motion.p>

          <motion.button
            onClick={() => setShowSearchModal(true)}
            className="btn-primary flex items-center gap-2 text-sm px-5 py-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search Rooms
          </motion.button>
        </div>
      </section>

      {/* ── TABS ─────────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b"
        style={{
          backgroundColor: `${COLORS.navy}ee`,
          backdropFilter: 'blur(12px)',
          borderColor: COLORS.glassBorder,
        }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border"
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: activeTab === tab.id ? COLORS.brand : COLORS.glass,
              color:           activeTab === tab.id ? '#0a0a0a'   : COLORS.cream,
              borderColor:     activeTab === tab.id ? COLORS.brand : COLORS.glassBorder,
            }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── SECTIONS ─────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-8 space-y-10">
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 skeleton rounded-xl w-40" />
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-52 h-64 skeleton rounded-2xl shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sections && sections.length > 0 ? (
          <motion.div
            className="space-y-10"
            variants={ANIMATIONS.staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sections.map((section) => (
              <motion.div key={section.id} variants={ANIMATIONS.staggerItem}>
                <div className="mb-4">
                  <h2 className="font-display font-bold text-lg mb-0.5" style={{ color: COLORS.cream }}>
                    {section.icon} {section.title}
                  </h2>
                  <p className="text-xs" style={{ color: COLORS.muted }}>{section.description}</p>
                </div>

                <div className="relative">
                  <div className={GRID.horizontal}>
                    {section.listings?.slice(0, 8).map((listing, i) => (
                      <motion.div
                        key={listing.id}
                        className="w-52 shrink-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ListingCard listing={listing} />
                      </motion.div>
                    ))}

                    <motion.button
                      onClick={() => navigate(`/search?section=${section.id}&uni=${encodeURIComponent(selectedUni)}`)}
                      className={`w-52 shrink-0 ${STYLES.cardBase} ${STYLES.cardHover} p-6 flex flex-col items-center justify-center gap-3`}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    >
                      <span className="text-3xl" style={{ color: COLORS.brand }}>→</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.brand }}>See All</span>
                      {section.total_count > 0 && (
                        <span className="text-xs" style={{ color: COLORS.muted }}>{section.total_count}+ listings</span>
                      )}
                    </motion.button>
                  </div>

                  <div
                    className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
                    style={{ background: `linear-gradient(to left, ${COLORS.navy}, transparent)` }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-5xl mb-4">🏘️</div>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: COLORS.cream }}>
              No listings near {heroUniName} yet
            </h3>
            <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
              Be the first landlord to list here and reach hundreds of students.
            </p>
            <button onClick={() => setShowQuickList(true)} className="btn-primary px-6 py-3 text-sm">
              List a Space
            </button>
          </motion.div>
        )}
      </div>

      {/* ── LIST YOUR SPACE CTA ───────────────────────────────────────────────── */}
      <motion.div
        className="mx-4 sm:mx-6 mb-8 rounded-3xl p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${COLORS.brand}18 0%, ${COLORS.brand}08 100%)`,
          border: `1px solid ${COLORS.brand}25`,
        }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-4xl">🏠</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base sm:text-lg mb-1" style={{ color: COLORS.cream }}>
              List your space here
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: COLORS.muted }}>
              No account needed · Reach thousands of students nearby
            </p>
          </div>
          <motion.button
            onClick={() => setShowQuickList(true)}
            className="btn-primary shrink-0 px-5 py-2.5 text-sm whitespace-nowrap"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            List Now
          </motion.button>
        </div>
      </motion.div>

      {/* ── SEARCH MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
              style={{ backgroundColor: '#111', border: `1px solid ${COLORS.glassBorder}`, maxHeight: '92vh' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 px-5 py-4 flex items-center justify-between border-b"
                style={{ backgroundColor: '#111', borderColor: COLORS.glassBorder }}
              >
                <h2 className="font-display font-bold text-base" style={{ color: COLORS.cream }}>
                  Search Listings
                </h2>
                <button onClick={() => setShowSearchModal(false)} style={{ color: COLORS.muted }} className="text-xl">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: COLORS.muted }}>Keyword</label>
                  <input className="input" placeholder="Paradise Gardens, Yaba..." value={searchForm.search}
                    onChange={(e) => setSearchForm((f) => ({ ...f, search: e.target.value }))} />
                </div>

                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: COLORS.muted }}>City / Area</label>
                  <input className="input" placeholder="Akoka, Ife, Port Harcourt..." value={searchForm.city}
                    onChange={(e) => setSearchForm((f) => ({ ...f, city: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: COLORS.muted }}>Room Type</label>
                    <select className="input" value={searchForm.type}
                      onChange={(e) => setSearchForm((f) => ({ ...f, type: e.target.value }))}>
                      {ROOM_TYPES.map((t) => (
                        <option key={t.value} value={t.value} style={{ backgroundColor: '#111' }}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: COLORS.muted }}>Bedrooms</label>
                    <select className="input" value={searchForm.bedrooms}
                      onChange={(e) => setSearchForm((f) => ({ ...f, bedrooms: e.target.value }))}>
                      <option value="" style={{ backgroundColor: '#111' }}>Any</option>
                      {[1,2,3,4].map((n) => (
                        <option key={n} value={n} style={{ backgroundColor: '#111' }}>{n} bed{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: COLORS.muted }}>Price Range (₦/year)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input" type="number" placeholder="Min e.g. 100,000" value={searchForm.min_price}
                      onChange={(e) => setSearchForm((f) => ({ ...f, min_price: e.target.value }))} />
                    <input className="input" type="number" placeholder="Max e.g. 500,000" value={searchForm.max_price}
                      onChange={(e) => setSearchForm((f) => ({ ...f, max_price: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: COLORS.muted }}>Availability</label>
                  <div className="flex gap-2">
                    {[
                      { value: '',      label: 'All' },
                      { value: 'true',  label: '✅ Vacant' },
                      { value: 'false', label: 'Taken' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSearchForm((f) => ({ ...f, is_vacant: opt.value }))}
                        className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                        style={{
                          backgroundColor: searchForm.is_vacant === opt.value ? COLORS.brand : COLORS.glass,
                          color:           searchForm.is_vacant === opt.value ? '#0a0a0a'   : COLORS.cream,
                          borderColor:     searchForm.is_vacant === opt.value ? COLORS.brand : COLORS.glassBorder,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="sticky bottom-0 px-5 py-4 flex gap-3 border-t"
                style={{ backgroundColor: '#111', borderColor: COLORS.glassBorder }}
              >
                <button
                  onClick={() => setSearchForm({ search:'',city:'',type:'',min_price:'',max_price:'',bedrooms:'',is_vacant:'' })}
                  className="btn-ghost py-3 px-4 text-sm"
                >
                  Clear
                </button>
                <button onClick={handleSearch} className="btn-primary flex-1 py-3 text-sm">
                  Search Rooms
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── QUICK LIST MODAL ─────────────────────────────────────────────────── */}
      <QuickListModal isOpen={showQuickList} onClose={() => setShowQuickList(false)} />
    </main>
  );
}
