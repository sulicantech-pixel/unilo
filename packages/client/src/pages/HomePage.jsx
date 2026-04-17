import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import { ANIMATIONS, COLORS, STYLES, GRID, ICONS, TYPOGRAPHY } from '../utils/designSystem';
import { useAuthStore } from '../store/authStore';

const UNIVERSITIES = [
  'University of Lagos',
  'Covenant University',
  'OAU Ile-Ife',
  'UNIPORT',
  'UNIZIK',
  'ABU Zaria',
  'University of Ibadan',
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedUni, setSelectedUni] = useState(() =>
    localStorage.getItem('selectedUni') || UNIVERSITIES[0]
  );
  const [searchUni, setSearchUni] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const dropdownRef = useRef(null);

  // Save selected uni
  useEffect(() => {
    localStorage.setItem('selectedUni', selectedUni);
  }, [selectedUni]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUniDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter universities based on search
  const filteredUnis = UNIVERSITIES.filter((uni) =>
    uni.toLowerCase().includes(searchUni.toLowerCase())
  );

  // Fetch curated sections
  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections', selectedUni, activeTab],
    queryFn: () =>
      api
        .get(`/listings/homepage-sections?uni=${selectedUni}&tab=${activeTab}`)
        .then((r) => r.data),
  });

  const handleOpenQuickList = () => {
    window.dispatchEvent(new CustomEvent('openQuickList'));
  };

  // Tabs
  const tabs = [
    { id: 'all', label: 'All', icon: ICONS.search },
    { id: 'trending', label: 'Trending', icon: ICONS.trending },
    { id: 'on-campus', label: 'On Campus', icon: ICONS.building },
    { id: 'off-campus', label: 'Off Campus', icon: ICONS.location },
    { id: 'filters', label: 'Filters', icon: ICONS.filter },
  ];

  return (
    <main className="min-h-dvh bg-navy pb-32" style={{ backgroundColor: COLORS.navy }}>
      {/* ─── HERO SECTION ──────────────────────────────────────────────────── */}
      <motion.section
        className="relative min-h-[65vh] flex flex-col justify-end px-4 sm:px-6 py-12 sm:py-16 overflow-hidden"
        initial="initial"
        animate="animate"
        variants={ANIMATIONS.staggerContainer}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0.05) 100%)`,
            }}
          />
        </div>

        {/* University Selector */}
        <motion.div
          className="mb-8 relative"
          variants={ANIMATIONS.slideDownFade}
        >
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowUniDropdown(!showUniDropdown)}
              className={`${STYLES.cardBase} ${STYLES.cardHover} px-4 py-2.5 w-full sm:w-fit flex items-center gap-2`}
              style={{ borderColor: COLORS.glassBorder }}
            >
              <span style={{ color: COLORS.brand }}>🎓</span>
              <span className="text-sm sm:text-base font-medium" style={{ color: COLORS.cream }}>
                {selectedUni.split(' ')[0]}
              </span>
              <span style={{ color: COLORS.muted }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUniDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`${STYLES.glassEffect} absolute top-full mt-2 w-full sm:w-96 z-50 max-h-64 overflow-hidden flex flex-col`}
                  style={{
                    backgroundColor: COLORS.glass,
                    borderColor: COLORS.glassBorder,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Search input */}
                  <input
                    type="text"
                    placeholder="Search university..."
                    value={searchUni}
                    onChange={(e) => setSearchUni(e.target.value)}
                    className={`${STYLES.inputBase} m-2 border-0`}
                    autoFocus
                  />

                  {/* Scrollable list */}
                  <div className="overflow-y-auto flex-1">
                    {filteredUnis.length === 0 ? (
                      <div className="p-4 text-center" style={{ color: COLORS.muted }}>
                        No universities found
                      </div>
                    ) : (
                      filteredUnis.map((uni) => (
                        <motion.button
                          key={uni}
                          onClick={() => {
                            setSelectedUni(uni);
                            setShowUniDropdown(false);
                            setSearchUni('');
                          }}
                          className="w-full text-left px-4 py-3 transition-all hover:bg-white/10"
                          whileHover={{ x: 4 }}
                          style={{
                            color: selectedUni === uni ? COLORS.brand : COLORS.cream,
                            fontWeight: selectedUni === uni ? '600' : '400',
                          }}
                        >
                          {selectedUni === uni && '✓ '}
                          {uni}
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Hero Title */}
        <motion.div variants={ANIMATIONS.slideDownFade}>
          <h1 className={`${TYPOGRAPHY.heroLarge} mb-3 leading-tight`} style={{ color: COLORS.cream }}>
            Find your room near <br />
            <motion.span
              key={selectedUni}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ color: COLORS.brand }}
            >
              {selectedUni.split(' ')[0]}
            </motion.span>
          </h1>

          <p className={`${TYPOGRAPHY.body} mb-8`} style={{ color: COLORS.muted }}>
            Verified rooms • No broker fees • Split rent with Cluster
          </p>

          <button
            onClick={() => setShowSearchModal(true)}
            className={`${STYLES.buttonBase} ${STYLES.buttonPrimary} px-6 py-3 text-base`}
          >
            🔍 Search Rooms
          </button>
        </motion.div>
      </motion.section>

      {/* ─── TABS ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 overflow-x-auto scrollbar-hide"
        style={{
          backgroundColor: `${COLORS.navy}99`,
          backdropFilter: 'blur(10px)',
          borderBottomColor: COLORS.glassBorder,
          borderBottomWidth: '1px',
        }}
        variants={ANIMATIONS.slideDownFade}
      >
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: activeTab === tab.id ? COLORS.brand : COLORS.glass,
                color: activeTab === tab.id ? COLORS.navy : COLORS.cream,
                borderColor: activeTab === tab.id ? COLORS.brand : COLORS.glassBorder,
                borderWidth: '1px',
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── SECTIONS (Horizontal Scroll - AirBnB Style) ──────────────────── */}
      <div className="px-4 sm:px-6 py-8 space-y-10">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="space-y-3"
                variants={ANIMATIONS.slideUpFade}
              >
                <div className="h-8 bg-white/5 rounded-xl w-48 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="w-56 h-72 bg-white/5 rounded-2xl shrink-0 animate-pulse"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="space-y-10"
            variants={ANIMATIONS.staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sections?.map((section, idx) => (
              <motion.div key={section.id} variants={ANIMATIONS.staggerItem}>
                {/* Section Header */}
                <div className="mb-4 sm:mb-6">
                  <h2 className={`${TYPOGRAPHY.h3} mb-1`} style={{ color: COLORS.cream }}>
                    {section.icon} {section.title}
                  </h2>
                  <p className={`${TYPOGRAPHY.bodySmall}`} style={{ color: COLORS.muted }}>
                    {section.description}
                  </p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative">
                  <div className={GRID.horizontal}>
                    {/* Listings */}
                    {section.listings?.slice(0, 8).map((listing, i) => (
                      <motion.div
                        key={listing.id}
                        className="w-56 shrink-0"
                        variants={ANIMATIONS.cardHover}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ListingCard listing={listing} />
                      </motion.div>
                    ))}

                    {/* See All Button */}
                    <motion.button
                      onClick={() =>
                        navigate(`/search?section=${section.id}&uni=${selectedUni}`)
                      }
                      className={`w-56 shrink-0 ${STYLES.cardBase} ${STYLES.cardHover} p-6 flex flex-col items-center justify-center gap-3`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-3xl">→</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.brand }}>
                        See All
                      </span>
                      <span className={`text-xs`} style={{ color: COLORS.muted }}>
                        {section.total_count}+ listings
                      </span>
                    </motion.button>
                  </div>

                  {/* Scroll gradient */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-navy to-transparent" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── LIST YOUR SPACE CTA ──────────────────────────────────────────── */}
      <motion.div
        className="mx-4 sm:mx-6 mb-8 relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${COLORS.brand}20 0%, ${COLORS.brand}10 100%)`,
          borderColor: `${COLORS.brand}30`,
          borderWidth: '1px',
        }}
        variants={ANIMATIONS.slideUpFade}
      >
        {/* Animated background element */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `radial-gradient(circle at 30% 50%, ${COLORS.brand}, transparent 50%)`,
          }}
        />

        <div className="relative flex items-center gap-4 sm:gap-6">
          <div className="text-4xl sm:text-5xl">🏠</div>
          <div className="flex-1 min-w-0">
            <h3 className={`${TYPOGRAPHY.h4} mb-1`} style={{ color: COLORS.cream }}>
              List your space here
            </h3>
            <p className={`${TYPOGRAPHY.bodySmall}`} style={{ color: COLORS.muted }}>
              Share your property and reach thousands of students
            </p>
          </div>
          <motion.button
            onClick={handleOpenQuickList}
            className={`${STYLES.buttonBase} ${STYLES.buttonPrimary} px-4 sm:px-6 py-2 sm:py-3 shrink-0 text-sm sm:text-base`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            List Now
          </motion.button>
        </div>
      </motion.div>

      {/* ─── SEARCH MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col`}
              style={{ backgroundColor: COLORS.navy, borderColor: COLORS.glassBorder, borderWidth: '1px' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="sticky top-0 px-5 py-4 flex items-center justify-between border-b"
                style={{ borderColor: COLORS.glassBorder }}
              >
                <h2 className={`${TYPOGRAPHY.h4}`} style={{ color: COLORS.cream }}>
                  Search Listings
                </h2>
                <motion.button
                  onClick={() => setShowSearchModal(false)}
                  className="text-2xl"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: COLORS.muted }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <p className={`${TYPOGRAPHY.bodySmall}`} style={{ color: COLORS.muted }}>
                  8 filter options available for precise search
                </p>
                {/* Search form would go here */}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: COLORS.glassBorder }}>
                <motion.button
                  onClick={() => setShowSearchModal(false)}
                  className={`flex-1 ${STYLES.buttonSecondary} py-3`}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={`flex-1 ${STYLES.buttonPrimary} py-3`}
                  whileTap={{ scale: 0.95 }}
                >
                  Search
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
