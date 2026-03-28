import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_LABELS = {
  self_contain: 'Self Contain',
  shared_room: 'Shared Room',
  boys_hostel: 'Boys Hostel',
  girls_hostel: 'Girls Hostel',
  room_and_parlour: 'Room & Parlour',
  flat: 'Flat',
  bungalow: 'Bungalow',
  duplex: 'Duplex',
  hostel: 'Hostel',
};

// ── Inline SVG icons (Feather-style — no emoji, no icon library) ──────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#ff6b00' : 'none'}
    stroke={filled ? '#ff6b00' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const WalkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6l-2 6h4l-2 6" />
    <path d="M8 12l-2 4" />
    <path d="M16 12l2 4" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"
    stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Format distance nicely ────────────────────────────────────────────────────
function formatDistance(metres) {
  if (!metres) return null;
  const m = Number(metres);
  if (m < 200) return 'On campus';
  if (m < 500) return `${m}m walk`;
  const mins = Math.round(m / 80); // avg walking speed ~80m/min
  return `${mins} min walk`;
}

// ── Format price ──────────────────────────────────────────────────────────────
function formatPrice(price) {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `₦${Number(price)?.toLocaleString() || 0}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const photos = listing.photos?.length > 0
    ? listing.photos.map(p => p.url ?? p)
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'];

  const nextPhoto = (e) => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length); };
  const prevPhoto = (e) => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length); };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/listing/${listing.id}`;
    if (navigator.share) {
      navigator.share({ title: listing.title, text: `Check out this room on Unilo`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleDragStart = (e) => setDragStart(e.clientX ?? e.touches?.[0]?.clientX);
  const handleDragEnd = (e) => {
    if (dragStart === null) return;
    const end = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const diff = dragStart - end;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setPhotoIdx(i => (i + 1) % photos.length);
      else setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
    }
    setDragStart(null);
  };

  const distanceLabel = formatDistance(listing.distance_from_school);

  return (
    <>
      <style>{`
        .ulc-card {
          cursor: pointer;
          background: #111;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          /* Airbnb 2:3 card — enforced by photo wrapper below */
        }

        /* ── Photo wrapper: 2:3 aspect ratio (Airbnb standard) ── */
        .ulc-photo-wrap {
          position: relative;
          width: 100%;
          padding-bottom: 66.67%;   /* 2:3 ratio */
          overflow: hidden;
          background: #1a1a1a;
        }

        .ulc-photo-inner {
          position: absolute;
          inset: 0;
        }

        /* ── Ken Burns / Amber-style photo animation on hover ── */
        .ulc-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1) translateX(0);
          transition: transform 7s ease;
          will-change: transform;
          user-select: none;
          pointer-events: none;
        }

        .ulc-card:hover .ulc-photo {
          transform: scale(1.1) translateX(3%);
        }

        /* ── Photo nav arrows ── */
        .ulc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.92);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ulc-photo-wrap:hover .ulc-arrow { opacity: 1; }
        .ulc-arrow.prev { left: 8px; }
        .ulc-arrow.next { right: 8px; }

        /* ── Dots ── */
        .ulc-dots {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 5;
        }
        .ulc-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          transition: all 0.2s;
        }
        .ulc-dot.active {
          background: #fff;
          width: 12px;
          border-radius: 3px;
        }

        /* ── Gradient overlay (bottom fade) ── */
        .ulc-gradient {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 55%;
          background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
          pointer-events: none;
          z-index: 2;
        }

        /* ── Top-left badges ── */
        .ulc-top-left {
          position: absolute;
          top: 10px; left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 6;
        }

        /* ── Top-right actions ── */
        .ulc-top-right {
          position: absolute;
          top: 10px; right: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
          z-index: 6;
        }

        /* ── Pill badges ── */
        .ulc-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          white-space: nowrap;
          line-height: 1.4;
        }
        .ulc-pill-type {
          background: rgba(0,0,0,0.65);
          color: #fff;
          backdrop-filter: blur(4px);
        }
        .ulc-pill-verified {
          background: rgba(34,197,94,0.9);
          color: #fff;
        }
        .ulc-pill-cluster {
          background: rgba(255,107,0,0.92);
          color: #fff;
        }
        .ulc-pill-vacant {
          background: rgba(255,107,0,0.85);
          color: #fff;
        }
        .ulc-pill-taken {
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65);
          backdrop-filter: blur(4px);
        }

        /* ── Icon buttons ── */
        .ulc-icon-btn {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s;
          backdrop-filter: blur(8px);
        }
        .ulc-icon-btn:active { transform: scale(0.9); }

        .ulc-wishlist {
          background: rgba(0,0,0,0.45);
        }
        .ulc-wishlist.saved {
          background: rgba(255,107,0,0.15);
        }
        .ulc-share {
          background: rgba(0,0,0,0.45);
        }

        /* ── Bottom-right (video) ── */
        .ulc-bottom-right {
          position: absolute;
          bottom: 10px; right: 10px;
          z-index: 6;
        }
        .ulc-play-btn {
          background: rgba(220,38,38,0.88);
          color: #fff;
        }

        /* ── Card info section ── */
        .ulc-info {
          padding: 10px 12px 14px;
          background: #111;
        }

        .ulc-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 2px;
        }

        .ulc-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          flex: 1;
        }

        .ulc-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          white-space: nowrap;
        }

        .ulc-location {
          font-size: 11px;
          color: rgba(255,255,255,0.38);
          font-family: 'Outfit', sans-serif;
          margin-bottom: 4px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .ulc-distance {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: rgba(255,107,0,0.85);
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .ulc-price-row {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .ulc-price {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          font-family: 'Outfit', sans-serif;
        }

        .ulc-period {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      <motion.article
        className="ulc-card"
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/listing/${listing.id}`)}
      >
        {/* ── PHOTO AREA ─────────────────────────────────────────────── */}
        <div
          className="ulc-photo-wrap"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div className="ulc-photo-inner">
            <AnimatePresence mode="wait">
              <motion.img
                key={photoIdx}
                src={photos[photoIdx]}
                alt={listing.title}
                className="ulc-photo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Gradient overlay */}
          <div className="ulc-gradient" />

          {/* Prev/Next arrows */}
          {photos.length > 1 && (
            <>
              <button className="ulc-arrow prev" onClick={prevPhoto} aria-label="Previous photo">
                <ChevronLeft />
              </button>
              <button className="ulc-arrow next" onClick={nextPhoto} aria-label="Next photo">
                <ChevronRight />
              </button>
            </>
          )}

          {/* Dots */}
          {photos.length > 1 && (
            <div className="ulc-dots">
              {photos.map((_, i) => (
                <div key={i} className={`ulc-dot${i === photoIdx ? ' active' : ''}`} />
              ))}
            </div>
          )}

          {/* ── Top Left: type + verified + cluster ── */}
          <div className="ulc-top-left">
            <span className="ulc-pill ulc-pill-type">
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            {listing.is_verified && (
              <span className="ulc-pill ulc-pill-verified">✓ Verified</span>
            )}
            {listing.is_cluster && (
              <span className="ulc-pill ulc-pill-cluster">⚡ Cluster</span>
            )}
          </div>

          {/* ── Top Right: wishlist + share + vacant ── */}
          <div className="ulc-top-right">
            <button
              className={`ulc-icon-btn ulc-wishlist${wishlisted ? ' saved' : ''}`}
              onClick={(e) => { e.stopPropagation(); setWishlisted(w => !w); }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <HeartIcon filled={wishlisted} />
            </button>
            <button
              className="ulc-icon-btn ulc-share"
              onClick={handleShare}
              aria-label="Share listing"
            >
              <ShareIcon />
            </button>
            <span className={`ulc-pill ${listing.is_vacant ? 'ulc-pill-vacant' : 'ulc-pill-taken'}`}>
              {listing.is_vacant ? 'Vacant' : 'Taken'}
            </span>
          </div>

          {/* ── Bottom Right: video tour button ── */}
          {listing.youtube_video_id && (
            <div className="ulc-bottom-right">
              <button
                className="ulc-icon-btn ulc-play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/listing/${listing.id}?video=1`);
                }}
                aria-label="Watch video tour"
              >
                <PlayIcon />
              </button>
            </div>
          )}
        </div>

        {/* ── INFO SECTION ───────────────────────────────────────────── */}
        <div className="ulc-info">
          <div className="ulc-title-row">
            <span className="ulc-title">{listing.title}</span>
            {listing.rating && (
              <span className="ulc-rating">
                <StarIcon />
                {Number(listing.rating).toFixed(1)}
              </span>
            )}
          </div>

          <div className="ulc-location">
            {listing.address}{listing.city ? `, ${listing.city}` : ''}
          </div>

          {distanceLabel && (
            <div className="ulc-distance">
              <WalkIcon />
              {distanceLabel}
            </div>
          )}

          <div className="ulc-price-row">
            <span className="ulc-price">{formatPrice(listing.price)}</span>
            <span className="ulc-period">/ year</span>
          </div>
        </div>
      </motion.article>
    </>
  );
}
