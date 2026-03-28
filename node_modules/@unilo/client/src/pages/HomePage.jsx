import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const CITIES = ['Port Harcourt', 'Lagos', 'Ibadan', 'Abuja', 'Enugu', 'Benin City', 'Warri', 'Owerri'];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => api.get('/listings?limit=6').then((r) => r.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city)   params.set('city', city);
    navigate(`/search?${params}`);
  };

  return (
    <main className="page-enter pb-24">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex flex-col justify-end px-5 pt-16 pb-8 overflow-hidden">
        {/* Background gradient orb */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand/20 blur-[80px]" />
          <div className="absolute bottom-0 left-[-5%] w-[40vw] h-[40vw] rounded-full bg-gold/10 blur-[60px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge bg-brand/20 text-brand mb-3 inline-block">🏠 Nigeria's #1 Student Housing</span>
          <h1 className="font-display font-bold text-4xl leading-tight text-cream mb-2">
            Find your<br />
            <span className="text-brand">perfect room.</span>
          </h1>
          <p className="text-muted font-body text-base mb-6">
            Verified listings, video tours, no broker fees.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <input
              className="input"
              placeholder="Search by area, university, or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="btn-primary px-6 whitespace-nowrap">
                Search
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* ── Quick city filters ─────────────────────────────────────────── */}
      <section className="px-5 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => navigate(`/search?city=${encodeURIComponent(c)}`)}
              className="badge bg-white/8 text-cream border border-white/10 whitespace-nowrap hover:border-brand/50 hover:text-brand transition-colors cursor-pointer"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured listings ──────────────────────────────────────────── */}
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-xl text-cream">Recent Listings</h2>
          <button
            onClick={() => navigate('/search')}
            className="text-brand text-sm font-body"
          >
            See all →
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-56 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.listings?.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Value props ────────────────────────────────────────────────── */}
      <section className="px-5 mt-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🎥', label: 'Video Tours', desc: 'Watch before you visit' },
            { icon: '✅', label: 'Verified', desc: 'All listings checked' },
            { icon: '📍', label: 'Map View', desc: 'See location live' },
          ].map((item) => (
            <div key={item.label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-display font-semibold text-xs text-cream">{item.label}</div>
              <div className="text-muted text-xs mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
