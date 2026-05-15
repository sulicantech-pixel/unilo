import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const PRICE_RANGES = [
  { label: 'Under ₦100k', min: 0, max: 100000 },
  { label: '₦100k - ₦200k', min: 100000, max: 200000 },
  { label: '₦200k - ₦350k', min: 200000, max: 350000 },
  { label: '₦350k - ₦500k', min: 350000, max: 500000 },
  { label: 'Above ₦500k', min: 500000, max: 999999999 },
];

const CITIES = ['Port Harcourt', 'Lagos', 'Ibadan', 'Abuja', 'Enugu'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false); // Mobile drawer
  const [expandedFilters, setExpandedFilters] = useState({
    location: true,
    type: true,
    price: false,
    university: false,
    details: false,
    distance: false,
  });

  const [filters, setFilters] = useState({
    location: '',
    listingType: 'all', // 'all', 'room', 'roommate'
    minPrice: '',
    maxPrice: '',
    university: '',
    bedrooms: '',
    amenities: [],
    radiusKm: '',
  });

  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');

  // Fetch listings with current filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.location) params.set('city', filters.location);
      if (filters.minPrice) params.set('min_price', filters.minPrice);
      if (filters.maxPrice) params.set('max_price', filters.maxPrice);
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
      return api.get(`/listings?${params}`).then((r) => r.data);
    },
  });

  const toggleFilter = (filter) => {
    setExpandedFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const updateFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      listingType: 'all',
      minPrice: '',
      maxPrice: '',
      university: '',
      bedrooms: '',
      amenities: [],
      radiusKm: '',
    });
  };

  const saveSearch = () => {
    if (!searchName.trim()) return;
    const newSearch = { name: searchName, filters, id: Date.now() };
    setSavedSearches((prev) => [...prev, newSearch]);
    setSearchName('');
  };

  const applySavedSearch = (search) => {
    setFilters(search.filters);
  };

  const filteredListings = data?.listings || [];

  return (
    <div className="min-h-dvh bg-navy pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden text-brand text-xl"
        >
          ☰
        </button>
        <h1 className="font-display font-bold text-cream text-lg">Search Listings</h1>
        <span className="ml-auto text-muted text-sm">{filteredListings.length} results</span>
      </div>

      <div className="flex gap-4 px-4 py-4 lg:flex-row flex-col">
        {/* FILTERS - Desktop sidebar / Mobile drawer */}
        <div className={`${
          showFilters ? 'block' : 'hidden'
        } lg:block w-full lg:w-64 shrink-0 space-y-3`}>
          {/* Mobile close */}
          {showFilters && (
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden w-full text-muted text-sm mb-3"
            >
              ✕ Close Filters
            </button>
          )}

          {/* Location Filter */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFilter('location')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10"
            >
              <span className="text-sm font-medium text-cream">📍 Location</span>
              <span className="text-xs text-muted">{expandedFilters.location ? '▼' : '▶'}</span>
            </button>
            {expandedFilters.location && (
              <div className="border-t border-white/10 p-3 space-y-2">
                {CITIES.map((city) => (
                  <label key={city} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      value={city}
                      checked={filters.location === city}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-muted">{city}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFilter('type')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10"
            >
              <span className="text-sm font-medium text-cream">🏠 Type</span>
              <span className="text-xs text-muted">{expandedFilters.type ? '▼' : '▶'}</span>
            </button>
            {expandedFilters.type && (
              <div className="border-t border-white/10 p-3 space-y-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'room', label: 'Room Space' },
                  { value: 'roommate', label: 'Roommate' },
                ].map((type) => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={filters.listingType === type.value}
                      onChange={(e) => updateFilter('listingType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-muted">{type.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFilter('price')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10"
            >
              <span className="text-sm font-medium text-cream">💰 Price</span>
              <span className="text-xs text-muted">{expandedFilters.price ? '▼' : '▶'}</span>
            </button>
            {expandedFilters.price && (
              <div className="border-t border-white/10 p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-cream"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-cream"
                  />
                </div>
                {PRICE_RANGES.map((range) => (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      onChange={() => updateFilter('minPrice', range.min.toString())}
                    />
                    <span className="text-sm text-muted">{range.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Details Filter */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFilter('details')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10"
            >
              <span className="text-sm font-medium text-cream">🛏️ Details</span>
              <span className="text-xs text-muted">{expandedFilters.details ? '▼' : '▶'}</span>
            </button>
            {expandedFilters.details && (
              <div className="border-t border-white/10 p-3 space-y-2">
                <label className="block">
                  <span className="text-xs text-muted mb-1 block">Bedrooms</span>
                  <input
                    type="number"
                    min="1"
                    value={filters.bedrooms}
                    onChange={(e) => updateFilter('bedrooms', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-cream"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Distance Filter */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFilter('distance')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10"
            >
              <span className="text-sm font-medium text-cream">📏 Distance</span>
              <span className="text-xs text-muted">{expandedFilters.distance ? '▼' : '▶'}</span>
            </button>
            {expandedFilters.distance && (
              <div className="border-t border-white/10 p-3 space-y-2">
                {[1, 5, 10, 20].map((km) => (
                  <label key={km} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="distance"
                      value={km}
                      checked={filters.radiusKm === km.toString()}
                      onChange={(e) => updateFilter('radiusKm', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-muted">Within {km}km</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <button
              onClick={clearFilters}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-cream text-sm py-2 rounded"
            >
              Clear Filters
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Save as..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-2 text-xs text-cream"
              />
              <button
                onClick={saveSearch}
                className="bg-brand/20 border border-brand/40 hover:bg-brand/30 text-brand text-sm px-3 py-2 rounded"
              >
                Save
              </button>
            </div>

            {savedSearches.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-muted mb-2">Saved Searches:</p>
                {savedSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => applySavedSearch(search)}
                    className="w-full text-left text-xs bg-white/5 hover:bg-white/10 p-2 rounded mb-1 text-cream"
                  >
                    {search.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {showFilters && (
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden w-full bg-brand text-navy font-semibold py-2 rounded"
            >
              Apply Filters
            </button>
          )}
        </div>

        {/* RESULTS */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="text-4xl mb-3">🏠</div>
              <p className="text-cream font-semibold">No listings found</p>
              <p className="text-muted text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
