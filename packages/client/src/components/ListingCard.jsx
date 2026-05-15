import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../utils/designSystem';

// ── Price formatter ────────────────────────────────────────────────────────────
function formatPrice(price, period) {
  const n = Number(price);
  if (!n) return '₦—';
  const fmt = n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `₦${Math.round(n / 1_000)}k`
      : `₦${n.toLocaleString()}`;
  return period === 'monthly' ? `${fmt}/mo` : `${fmt}/yr`;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? '#fff' : 'none'}
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#ff6b00" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// ── Card ────────────────────────────────────────────────────────────────────
export default function ListingCard({ listing, horizontal = false }) {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [imgIdx,  setImgIdx]  = useState(0);
  const [saved,   setSaved]   = useState(listing.wishlisted ?? false);
  const touchStartX = useRef(null);

  // ── Extract real image URLs from Photo objects ─────────────────────────────
  const images = (() => {
    const photos = listing.photos ?? [];
    const urls = photos
      .map(p => (typeof p === 'string' ? p : p?.url))
      .filter(Boolean);
    if (urls.length) return urls;
    if (listing.cover_photo?.url) return [listing.cover_photo.url];
    if (listing.cover_photo && typeof listing.cover_photo === 'string') return [listing.cover_photo];
    return [];
  })();

  const currentImage = images[imgIdx] ?? null;
  const hasMultiple  = images.length > 1;

  const prev = (e) => { e.stopPropagation(); setImgIdx(i => i === 0 ? images.length - 1 : i - 1); };
  const next = (e) => { e.stopPropagation(); setImgIdx(i => i === images.length - 1 ? 0 : i + 1); };

  // Touch / swipe support on the image area
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? setImgIdx(i => i === images.length - 1 ? 0 : i + 1) : setImgIdx(i => i === 0 ? images.length - 1 : i - 1);
    touchStartX.current = null;
  };

  const wishlist = useMutation({
    mutationFn: () => api.post(`/listings/${listing.id}/wishlist`),
    onSuccess: ({ data }) => { setSaved(data.wishlisted); qc.invalidateQueries(['wishlist']); },
  });

  const handleSave = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSaved(s => !s);
    wishlist.mutate();
  };

  // ── Airbnb card dimensions ─────────────────────────────────────────────────
  // Airbnb: 300px wide, image ~200px tall (66%), text block ~110px, total ~310px
  const cardWidth = horizontal ? 260 : '100%';

  return (
    <motion.div
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{
        width: cardWidth,
        flexShrink: 0,
        cursor: 'pointer',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'transparent', // no card bg — Airbnb style is image + text, no box
        position: 'relative',
      }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* ── IMAGE ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '66%', // 3:2 ratio — Airbnb standard
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.img
              key={imgIdx}
              src={currentImage}
              alt={listing.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom gradient for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)', pointerEvents: 'none' }} />

        {/* Prev / Next arrows — visible on hover */}
        {hasMultiple && (
          <>
            <motion.button onClick={prev} whileTap={{ scale: 0.88 }}
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', zIndex: 10 }}>
              <ChevronLeftIcon />
            </motion.button>
            <motion.button onClick={next} whileTap={{ scale: 0.88 }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', zIndex: 10 }}>
              <ChevronRightIcon />
            </motion.button>
          </>
        )}

        {/* Heart / save button */}
        <motion.button onClick={handleSave} whileTap={{ scale: 0.85 }}
          style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: saved ? COLORS.brand : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'background 0.2s' }}>
          <HeartIcon filled={saved} />
        </motion.button>

        {/* Vacancy badge */}
        {listing.is_vacant === true && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(16,185,129,0.85)', backdropFilter: 'blur(4px)', borderRadius: 99, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'dot-pulse 1.8s ease-in-out infinite' }} />
            Available now
          </div>
        )}

        {/* Image dots */}
        {hasMultiple && (
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 5 }}>
            {images.map((_, i) => (
              <div key={i} style={{ width: i === imgIdx ? 14 : 5, height: 5, borderRadius: 99, background: '#fff', opacity: i === imgIdx ? 1 : 0.5, transition: 'all 0.2s' }} />
            ))}
          </div>
        )}
      </div>

      {/* ── TEXT — Airbnb style: no box, just text below image ──────────── */}
      <div style={{ padding: '10px 2px 4px', fontFamily: 'DM Sans, sans-serif' }}>

        {/* Title + Rating row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
          <h3 style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
            color: COLORS.cream, margin: 0, lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            flex: 1,
          }}>
            {listing.title}
          </h3>
          {listing.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <StarIcon />
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.cream }}>{Number(listing.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ color: COLORS.muted }}><PinIcon /></span>
          <span style={{ fontSize: 12, color: COLORS.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.city}{listing.state ? `, ${listing.state}` : ''} · {(listing.type || '').replace(/_/g, ' ')}
          </span>
        </div>

        {/* Price — Airbnb bolds the price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: COLORS.brand }}>
            {formatPrice(listing.price, listing.price_period)}
          </span>
          {listing.bedrooms && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              · {listing.bedrooms} bed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
