import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  self_contain: 'Self Contain',
  room_and_parlour: 'Room & Parlour',
  flat: 'Flat',
  bungalow: 'Bungalow',
  duplex: 'Duplex',
  hostel: 'Hostel',
};

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  const photos = listing.photos?.length > 0
    ? listing.photos
    : [null];

  const total = photos.length;

  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const goNext = (e) => {
    e.stopPropagation();
    setPhotoIndex((i) => (i + 1) % total);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setPhotoIndex((i) => (i - 1 + total) % total);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setPhotoIndex((i) => (i + 1) % total);
      else setPhotoIndex((i) => (i - 1 + total) % total);
    }
    setTouchStart(null);
  };

  return (
    <motion.article
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Photo slider */}
      <div
        style={{ position: 'relative', height: '200px', background: '#1a1a1a', overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {photos[photoIndex]?.url ? (
          <motion.img
            key={photoIndex}
            src={photos[photoIndex].url}
            alt={listing.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '48px' }}>🏠</span>
          </div>
        )}

        {/* Prev/Next buttons */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              style={{
                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer', fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >‹</button>
            <button
              onClick={goNext}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer', fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >›</button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div style={{
            position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '4px',
          }}>
            {photos.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === photoIndex ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '100px',
                  background: i === photoIndex ? '#ff6b00' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        )}

        {/* Top badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span style={{
            background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(8px)',
            color: '#fff', padding: '4px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
          }}>
            {TYPE_LABELS[listing.type] || listing.type}
          </span>
          {listing.youtube_video_id && (
            <span style={{
              background: 'rgba(220,38,38,0.9)',
              color: '#fff', padding: '4px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
            }}>▶ Tour</span>
          )}
        </div>

        {/* Vacancy badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span style={{
            background: listing.is_vacant ? 'rgba(255,107,0,0.9)' : 'rgba(255,255,255,0.15)',
            color: listing.is_vacant ? '#fff' : 'rgba(255,255,255,0.6)',
            padding: '4px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
          }}>
            {listing.is_vacant ? 'Vacant' : 'Taken'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '14px',
          color: '#fff', margin: '0 0 4px', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {listing.title}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '0 0 12px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📍 {listing.address}, {listing.city}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '16px', color: '#ff6b00' }}>
              {price}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginLeft: '4px' }}>
              / {listing.price_period === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
            <span>🛏 {listing.bedrooms}</span>
            <span>🚿 {listing.bathrooms}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
