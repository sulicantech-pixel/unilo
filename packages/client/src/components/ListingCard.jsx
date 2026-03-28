import { useState, useRef } from 'react';
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

export default function ListingCard({ listing, currency = 'NGN', currencySymbol = '₦' }) {
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const photos = listing.photos?.length > 0
    ? listing.photos.map(p => p.url)
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'];

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${currencySymbol}${price?.toLocaleString() || 0}`;
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIdx(i => (i + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this room on Unilo: ${listing.title}`,
        url: `${window.location.origin}/listing/${listing.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
    }
  };

  const handleDragStart = (e) => {
    setDragStart(e.clientX || e.touches?.[0]?.clientX);
  };

  const handleDragEnd = (e) => {
    if (dragStart === null) return;
    const end = e.clientX || e.changedTouches?.[0]?.clientX;
    const diff = dragStart - end;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setPhotoIdx(i => (i + 1) % photos.length);
      else setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
    }
    setDragStart(null);
  };

  return (
    <>
      <style>{`
        .listing-card {
          cursor: pointer;
          background: #0d0d0d;
          position: relative;
          overflow: hidden;
        }

        .listing-card:hover .card-photo {
          transform: scale(1.03);
        }

        .photo-wrapper {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #1a1a1a;
        }

        .card-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
          user-select: none;
          pointer-events: none;
        }

        /* photo nav arrows */
        .photo-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.92);
          border: none;
          border-radius: 50%;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          opacity: 0;
          transition: opacity 0.2s;
          color: #000;
          font-weight: 700;
        }

        .photo-wrapper:hover .photo-arrow { opacity: 1; }

        .photo-arrow.prev { left: 8px; }
        .photo-arrow.next { right: 8px; }

        /* dots */
        .photo-dots {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 5;
        }

        .photo-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          transition: all 0.2s;
        }

        .photo-dot.active {
          background: #fff;
          width: 12px;
          border-radius: 3px;
        }

        /* top badges */
        .card-top-left {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 5;
        }

        .card-top-right {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
          z-index: 5;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          white-space: nowrap;
        }

        .badge-type {
          background: rgba(0,0,0,0.7);
          color: #fff;
          backdrop-filter: blur(4px);
        }

        .badge-verified {
          background: rgba(34,197,94,0.9);
          color: #fff;
        }

        .badge-video {
          background: rgba(220,38,38,0.9);
          color: #fff;
          cursor: pointer;
        }

        .badge-vacant {
          background: rgba(255,107,0,0.9);
          color: #fff;
        }

        .badge-taken {
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          backdrop-filter: blur(4px);
        }

        /* action icons */
        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }

        .wishlist-btn {
          background: rgba(0,0,0,0.4);
          color: #fff;
        }

        .wishlist-btn.active {
          background: rgba(255,107,0,0.9);
          color: #fff;
        }

        .share-btn {
          background: rgba(0,0,0,0.4);
          color: #fff;
        }

        .like-row {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 5;
        }

        .like-btn {
          background: rgba(0,0,0,0.5);
          color: #fff;
          backdrop-filter: blur(8px);
        }

        .like-btn.active { color: #ff4d4d; }

        /* card info */
        .card-info {
          padding: 10px 12px 14px;
          background: #0d0d0d;
        }

        .card-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 2px;
        }

        .card-title {
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

        .card-rating {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
        }

        .card-location {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          font-family: 'Outfit', sans-serif;
          margin-bottom: 4px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .card-distance {
          font-size: 11px;
          color: rgba(255,107,0,0.8);
          font-family: 'Outfit', sans-serif;
          margin-bottom: 6px;
        }

        .card-price-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-price {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          font-family: 'Outfit', sans-serif;
        }

        .card-price-period {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
        }
      `}</style>

      <motion.article
        className="listing-card"
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/listing/${listing.id}`)}
      >
        {/* ── PHOTO AREA ── */}
        <div
          className="photo-wrapper"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={photoIdx}
              src={photos[photoIdx]}
              alt={listing.title}
              className="card-photo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              draggable={false}
            />
          </AnimatePresence>

          {/* Prev/Next arrows (desktop hover) */}
          {photos.length > 1 && (
            <>
              <button className="photo-arrow prev" onClick={prevPhoto}>‹</button>
              <button className="photo-arrow next" onClick={nextPhoto}>›</button>
            </>
          )}

          {/* Dots */}
          {photos.length > 1 && (
            <div className="photo-dots">
              {photos.map((_, i) => (
                <div key={i} className={`photo-dot ${i === photoIdx ? 'active' : ''}`} />
              ))}
            </div>
          )}

          {/* Top Left badges */}
          <div className="card-top-left">
            <span className="badge-pill badge-type">
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            {listing.is_verified && (
              <span className="badge-pill badge-verified">✓ Verified</span>
            )}
          </div>

          {/* Top Right: wishlist + share + vacant */}
          <div className="card-top-right">
            <button
              className={`icon-btn wishlist-btn ${wishlisted ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setWishlisted(w => !w); }}
              title="Save to wishlist"
            >
              {wishlisted ? '♥' : '♡'}
            </button>
            <button
              className="icon-btn share-btn"
              onClick={handleShare}
              title="Share listing"
            >
              ↑
            </button>
            <span className={`badge-pill ${listing.is_vacant ? 'badge-vacant' : 'badge-taken'}`}>
              {listing.is_vacant ? 'Vacant' : 'Taken'}
            </span>
          </div>

          {/* Bottom Right: like + video */}
          <div className="like-row" style={{ display: 'flex', gap: 6 }}>
            {listing.youtube_video_id && (
              <button
                className="icon-btn"
                style={{ background: 'rgba(220,38,38,0.85)', color: '#fff' }}
                onClick={(e) => { e.stopPropagation(); navigate(`/listing/${listing.id}?video=1`); }}
                title="Watch video tour"
              >
                ▶
              </button>
            )}
            <button
              className={`icon-btn like-btn ${liked ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
              title="Like"
            >
              {liked ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="card-info">
          <div className="card-title-row">
            <span className="card-title">{listing.title}</span>
            {listing.rating && (
              <span className="card-rating">★ {listing.rating}</span>
            )}
          </div>
          <div className="card-location">
            {listing.address}, {listing.city}
          </div>
          {listing.distance_from_school && (
            <div className="card-distance">
              📏 {listing.distance_from_school}m from school gate
            </div>
          )}
          <div className="card-price-row">
            <span className="card-price">{formatPrice(listing.price)}</span>
            <span className="card-price-period">/ year</span>
          </div>
        </div>
      </motion.article>
    </>
  );
}
