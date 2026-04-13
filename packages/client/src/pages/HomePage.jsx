import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import { useAuthStore } from '../store/authStore';

const UNIVERSITIES = ['University of Lagos', 'Covenant University', 'OAU Ile-Ife', 'UNIPORT', 'UNIZIK'];

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const [selectedUni, setSelectedUni] = useState(() => {
    return localStorage.getItem('selectedUni') || UNIVERSITIES[0];
  });
  const [activeTab, setActiveTab] = useState('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    university: selectedUni,
    campus: '',
    accommodation: '',
    roomRegion: '',
    direction: '',
    distance: '',
    moveInDate: '',
    priceYear: '',
  });

  // Save selected uni
  useEffect(() => {
    localStorage.setItem('selectedUni', selectedUni);
  }, [selectedUni]);

  // Fetch curated sections for selected university
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

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    navigate(`/search?${params}`);
  };

  return (
    <main className="min-h-dvh bg-navy pb-24">
      {/* ─── UNIVERSITY SELECTOR ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand font-semibold">🏫</span>
          <select
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm font-medium cursor-pointer"
          >
            {UNIVERSITIES.map((uni) => (
              <option key={uni} value={uni} className="bg-navy-900">
                {uni}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex flex-col justify-center px-4 py-12 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0.05) 100%),
                        url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80') center/cover`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-cream mb-3">
            Find your room near <span className="text-brand">{selectedUni.split(' ')[0]}</span>
          </h1>
          <p className="text-muted text-sm mb-6">
            Verified rooms · No broker fees · Split rent with Cluster
          </p>

          {/* Search Modal Button (Visible on scroll) */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full sm:w-fit bg-brand hover:bg-brand/90 text-navy font-semibold px-6 py-3 rounded-lg transition"
          >
            🔍 Search Rooms
          </button>
        </motion.div>
      </section>

      {/* ─── TABS ───────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {['all', 'trending', 'on-campus', 'off-campus', 'filters'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-brand text-navy'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            {tab === 'on-campus' ? 'On Campus' : tab === 'off-campus' ? 'Off Campus' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── SECTIONS (Horizontal Scroll - AirBnB Style) ─────────────────── */}
      <div className="px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-white/5 rounded-lg w-48 animate-pulse" />
                <div className="flex gap-3 overflow-hidden">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-48 h-56 bg-white/5 rounded-lg shrink-0 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          sections?.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-display font-bold text-lg text-cream">
                    {section.icon} {section.title}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">{section.description}</p>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Listings */}
                  {section.listings?.slice(0, 8).map((listing) => (
                    <motion.div
                      key={listing.id}
                      className="w-48 shrink-0"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}

                  {/* See All Button */}
                  <button
                    onClick={() =>
                      navigate(
                        `/search?section=${section.id}&uni=${selectedUni}`
                      )
                    }
                    className="w-48 shrink-0 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span className="text-2xl">→</span>
                    <span className="text-sm font-medium text-brand text-center">
                      See All
                    </span>
                    <span className="text-xs text-muted">
                      {section.total_count}+ listings
                    </span>
                  </button>
                </div>

                {/* Scroll Indicator */}
                {(section.listings?.length || 0) > 8 && (
                  <div className="absolute right-0 top-0 bottom-0 pointer-events-none bg-gradient-to-l from-navy to-transparent w-12" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ─── LIST YOUR SPACE CTA ────────────────────────────────────────── */}
      <div className="mx-4 mb-8 bg-gradient-to-r from-brand/20 to-brand/10 border border-brand/30 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🏠</span>
          <div className="flex-1">
            <h3 className="font-display font-bold text-cream mb-1">
              List your space here
            </h3>
            <p className="text-muted text-sm">
              Share your property and reach thousands of students
            </p>
          </div>
          <button
            onClick={handleOpenQuickList}
            className="bg-brand hover:bg-brand/90 text-navy font-semibold px-4 py-2 rounded-lg shrink-0 transition"
          >
            List Now
          </button>
        </div>
      </div>

      {/* ─── SEARCH MODAL ────────────────────────────────────────────────── */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-navy-800 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-navy-800 border-b border-white/10 px-5 py-4 flex items-center justify-between">
              <h2 className="font-display font-semibold text-cream">Search Listings</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-muted hover:text-cream text-xl"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSearch} className="p-5 space-y-4">
              {/* University */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  University
                </label>
                <select
                  value={searchFilters.university}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      university: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni} className="bg-navy-900">
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campus */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Campus
                </label>
                <input
                  type="text"
                  placeholder="Any campus"
                  value={searchFilters.campus}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, campus: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                />
              </div>

              {/* Accommodation Type */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Accommodation
                </label>
                <select
                  value={searchFilters.accommodation}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      accommodation: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                >
                  <option value="">Any accommodation</option>
                  <option value="self_contain">Self Contain</option>
                  <option value="flat">Flat</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>

              {/* Room Region */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Room Region
                </label>
                <input
                  type="text"
                  placeholder="Any room region"
                  value={searchFilters.roomRegion}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      roomRegion: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                />
              </div>

              {/* Direction */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Direction
                </label>
                <input
                  type="text"
                  placeholder="Any junction"
                  value={searchFilters.direction}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      direction: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Distance
                </label>
                <input
                  type="number"
                  placeholder="Any distance (km)"
                  value={searchFilters.distance}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      distance: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                />
              </div>

              {/* Move-in Date */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={searchFilters.moveInDate}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      moveInDate: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                />
              </div>

              {/* Price/Year */}
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Price/Year
                </label>
                <input
                  type="number"
                  placeholder="Any price"
                  value={searchFilters.priceYear}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      priceYear: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-cream px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand hover:bg-brand/90 text-navy font-semibold px-4 py-2 rounded-lg"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
