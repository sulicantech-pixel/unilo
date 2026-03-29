import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#ff6b00' : 'none'}
    stroke={filled ? '#ff6b00' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ClusterIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function ListingCard({ listing, wishlistIds = [], onWishlistToggle }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [imgIndex, setImgIndex] = useState(0);
  const hoverTimer = useRef(null);
  const touchStartX = useRef(null);

  const {
    id, title, price, junction, campus, university,
    photos = [], isCluster, clusterSpotsLeft, isNew,
    accommodationType,
  } = listing;

  const images = photos.length > 0
    ? photos
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'];

  const isWishlisted = wishlistIds.includes(id);

  const formatPrice = (p) => {
    if (!p) return '—';
    return '₦' + Number(p).toLocaleString('en-NG');
  };

  const subtitle = [junction, campus].filter(Boolean).join(' · ');

  // Analytics helpers
  const track = (eventType, extra = {}) => {
    fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, listingId: id, ...extra }),
    }).catch(() => {});
  };

  const handleMouseEnter = () => { hoverTimer.current = Date.now(); };
  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      track('listing_hover', { durationMs: Date.now() - hoverTimer.current });
      hoverTimer.current = null;
    }
  };

  const handleClick = () => {
    track('listing_click');
    navigate(`/listing/${id}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    onWishlistToggle?.(id);
    track('listing_wishlist', { action: isWishlisted ? 'unsave' : 'save' });
  };

  // Swipe support for photo cycling
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setImgIndex(i => diff > 0
        ? (i + 1) % images.length
        : (i - 1 + images.length) % images.length
      );
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="group cursor-pointer flex-shrink-0 w-[200px] sm:w-[220px]"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Photo */}
      <div
        className="relative overflow-hidden rounded-xl bg-[#1a1a1a]"
        style={{ paddingBottom: '75%' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[imgIndex]}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[7000ms] ease-in-out group-hover:scale-110 group-hover:translate-x-[3%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors z-10"
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="text-[9px] font-bold bg-[#ff6b00] text-white px-1.5 py-0.5 rounded-full">NEW</span>
          )}
          {isCluster && (
            <span className="text-[9px] font-semibold bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <ClusterIcon /> Cluster
            </span>
          )}
        </div>

        {/* Photo dots */}
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Info — 3 lines */}
      <div className="mt-2 px-0.5">
        {/* Line 1: Title */}
        <p className="text-white text-sm font-semibold leading-tight line-clamp-1">{title}</p>

        {/* Line 2: Junction · Campus */}
        <p className="text-[#777] text-xs mt-0.5 line-clamp-1">
          {subtitle || accommodationType || university || '—'}
        </p>

        {/* Line 3: Price */}
        <p className="mt-1 text-sm">
          <span className="text-white font-bold">{formatPrice(price)}</span>
          <span className="text-[#555] text-xs font-normal"> / year</span>
        </p>
      </div>
    </div>
  );
}
