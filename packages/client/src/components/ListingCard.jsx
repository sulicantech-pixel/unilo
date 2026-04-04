import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  self_contain: 'Self Contain',
  room_and_parlour: 'Room & Parlour',
  flat: 'Flat',
  bungalow: 'Bungalow',
  duplex: 'Duplex',
  hostel: 'Hostel',
  room: 'Room',
  roommate: 'Roommate',
  mini_flat: 'Mini Flat',
  apartment: 'Apartment',
  bq: 'BQ',
};

// Demo photos per card (3 placeholder images)
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
];

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);

  // Guard — if listing is undefined/null, render nothing
  if (!listing) return null;
  const [isSaved, setIsSaved] = useState(false);
  const touchStartX = useRef(null);

  // Build photos array — use real photos, pad with demos if fewer than 3
  const rawPhotos = listing.photos?.map(p => p.url).filter(Boolean) || [];
  const photos = rawPhotos.length >= 1
    ? [...rawPhotos, ...DEMO_PHOTOS].slice(0, 3)
    : DEMO_PHOTOS;

  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex(i => (i + 1) % photos.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) setPhotoIndex(i => (i + 1) % photos.length);
      else setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
    }
    touchStartX.current = null;
  };

  return (
    <motion.article
      whileTap={{ scale: 0.985 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      {/* Photo carousel */}
      <div
        style={{ position: 'relative', height: 180, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        {photos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${listing.title} photo ${i + 1}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === photoIndex ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        ))}

        {/* Arrow buttons — always visible */}
        <button
          onClick={prevPhoto}
          style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={nextPhoto}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 4, zIndex: 2,
        }}>
          {photos.map((_, i) => (
            <div
              key={i}
              onClick={e => { e.stopPropagation(); setPhotoIndex(i); }}
              style={{
                width: i === photoIndex ? 16 : 5,
                height: 5,
                borderRadius: 100,
                background: i === photoIndex ? '#ff6b00' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 2,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: 10,
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.04em',
        }}>
          {TYPE_LABELS[listing.type] || listing.type}
        </div>

        {/* Vacancy badge */}
        <div style={{
          position: 'absolute', top: 10, right: 42, zIndex: 2,
          background: listing.is_vacant ? 'rgba(255,107,0,0.9)' : 'rgba(255,255,255,0.15)',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: 10,
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.04em',
        }}>
          {listing.is_vacant ? 'Vacant' : 'Taken'}
        </div>

        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); setIsSaved(v => !v); }}
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 2,
            width: 30, height: 30,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? '#ff6b00' : 'none'} stroke={isSaved ? '#ff6b00' : 'white'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <h3 style={{
          fontFamily: "'Clash Display', 'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          margin: '0 0 4px',
          lineHeight: 1.35,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>
          {listing.title}
        </h3>

        <p style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          margin: '0 0 10px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>
          {listing.address}, {listing.city}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 16, fontWeight: 700, color: '#ff6b00' }}>
              {price}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 3 }}>
              / {listing.price_period === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 010 4H2"/><path d="M2 16h18a2 2 0 000-4"/></svg>
              {listing.bedrooms}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/><path d="M4 18V6a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 18H2m20 0h-2"/></svg>
              {listing.bathrooms}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
