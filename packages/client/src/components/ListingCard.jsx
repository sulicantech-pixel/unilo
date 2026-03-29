import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ff6b00' : 'none'}
    stroke={filled ? '#ff6b00' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff6b00" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ClusterIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function ListingCard({ listing, wishlistIds = [], onWishlistToggle }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [imgIndex, setImgIndex] = useState(0);
  const hoverTimer = useRef(null);

  const {
    id,
    title,
    price,
    location,
    university,
    photos = [],
    rating,
    reviewCount,
    isCluster,
    clusterSpotsLeft,
    distanceFromSchool,
    accommodationType,
    isNew,
  } = listing;

  const images = photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'];
  const isWishlisted = wishlistIds.includes(id);

  const formatPrice = (p) => {
    if (!p) return '—';
    return '₦' + Number(p).toLocaleString('en-NG');
  };

  const handleMouseEnter = () => {
    hoverTimer.current = Date.now();
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      const duration = Date.now() - hoverTimer.current;
      hoverTimer.current = null;
      // Fire analytics
      fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'listing_hover', listingId: id, durationMs: duration }),
      }).catch(() => {});
    }
  };

  const handleClick = () => {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'listing_click', listingId: id }),
    }).catch(() => {});
    navigate(`/listing/${id}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    onWishlistToggle?.(id);
    fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'listing_wishlist', listingId: id, action: isWishlisted ? 'unsave' : 'save' }),
    }).catch(() => {});
  };

  const cyclePhoto = (e, dir) => {
    e.stopPropagation();
    setImgIndex(i => (i + dir + images.length) % images.length);
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Photo container */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a]" style={{ paddingBottom: '66.67%' }}>
        <img
          src={images[imgIndex]}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[7000ms] ease-in-out group-hover:scale-110 group-hover:translate-x-[3%]"
          loading="lazy"
        />

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors z-10"
          aria-label="Save to wishlist"
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="text-[10px] font-semibold bg-[#ff6b00] text-white px-2 py-0.5 rounded-full">New</span>
          )}
          {isCluster && (
            <span className="text-[10px] font-semibold bg-white/15 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <ClusterIcon /> Cluster · {clusterSpotsLeft} spot{clusterSpotsLeft !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        {/* Photo nav dots */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => cyclePhoto(e, -1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10">
              ‹
            </button>
            <button onClick={(e) => cyclePhoto(e, 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10">
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}

        {/* Distance pill — bottom left */}
        {distanceFromSchool && (
          <span className="absolute bottom-2 left-3 text-[10px] text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {distanceFromSchool} walk
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{title}</p>
            <p className="text-[#888] text-xs mt-0.5 truncate">{location || university}</p>
            {accommodationType && (
              <p className="text-[#555] text-xs mt-0.5">{accommodationType}</p>
            )}
          </div>
          {rating && (
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <StarIcon />
              <span className="text-white text-xs font-medium">{rating}</span>
              {reviewCount && <span className="text-[#555] text-xs">({reviewCount})</span>}
            </div>
          )}
        </div>
        <p className="mt-1.5 text-white text-sm">
          <span className="font-semibold text-[#ff6b00]">{formatPrice(price)}</span>
          <span className="text-[#666] font-normal"> / year</span>
        </p>
      </div>
    </div>
  );
}
