import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'self_contain', label: 'Self Contain' },
  { value: 'room_and_parlour', label: 'Room & Parlour' },
  { value: 'flat', label: 'Flat' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'hostel', label: 'Hostel' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search:    searchParams.get('search') || '',
    city:      searchParams.get('city') || '',
    type:      searchParams.get('type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    is_vacant: searchParams.get('is_vacant') || '',
    page:      1,
  });

  const queryParams = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== null))
  ).toString();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', 'search', queryParams],
    queryFn: () => api.get(`/listings?${queryParams}`).then((r) => r.data),
    keepPreviousData: true,
  });

  const update = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <main className="page-enter pb-24">
      {/* Search header */}
      <div className="sticky top-0 z-30 bg-navy/95 backdrop-blur border-b border-white/10 px-5 py-4 space-y-3">
        <input
          className="input"
          placeholder="Search listings…"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => update('type', t.value)}
              className={`badge whitespace-nowrap border transition-colors ${
                filters.type === t.value
                  ? 'bg-brand text-navy border-brand'
                  : 'bg-white/5 text-cream border-white/10 hover:border-brand/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Price + vacancy row */}
        <div className="flex gap-2 text-sm">
          <input
            className="input flex-1 text-sm"
            placeholder="Min ₦"
            type="number"
            value={filters.min_price}
            onChange={(e) => update('min_price', e.target.value)}
          />
          <input
            className="input flex-1 text-sm"
            placeholder="Max ₦"
            type="number"
            value={filters.max_price}
            onChange={(e) => update('max_price', e.target.value)}
          />
          <button
            onClick={() => update('is_vacant', filters.is_vacant === 'true' ? '' : 'true')}
            className={`badge border whitespace-nowrap ${
              filters.is_vacant === 'true'
                ? 'bg-brand text-navy border-brand'
                : 'bg-white/5 text-cream border-white/10'
            }`}
          >
            Vacant only
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-5 pt-4">
        <p className="text-muted text-sm mb-4">
          {isLoading ? 'Searching…' : `${data?.total ?? 0} listings found`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-white/5" />)}
          </div>
        ) : data?.listings?.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <div className="text-5xl mb-3">🔍</div>
            <p>No listings match your search.</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.listings?.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              className="btn-ghost disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="flex items-center text-muted text-sm">
              {filters.page} / {data.pages}
            </span>
            <button
              disabled={filters.page >= data.pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="btn-ghost disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
