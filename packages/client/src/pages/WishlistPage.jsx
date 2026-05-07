import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../utils/designSystem';

function formatPrice(price, period) {
  const n = Number(price);
  const fmt = n >= 1_000_000
    ? '₦' + (n / 1_000_000).toFixed(1) + 'M'
    : '₦' + (n / 1_000).toFixed(0) + 'k';
  return fmt + (period === 'monthly' ? '/mo' : '/yr');
}

function WishlistCard({ listing, onRemove, removing }) {
  const navigate = useNavigate();
  const cover = listing.cover_photo?.url || listing.photos?.[0]?.url || null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '58%', background: 'rgba(255,255,255,0.05)' }}>
        {cover
          ? <img src={cover} alt={listing.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏠</div>
        }

        {/* Remove button */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(listing.id); }}
          disabled={removing}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: removing ? 'rgba(0,0,0,0.4)' : 'rgba(239,68,68,0.85)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="#fff"/>
          </svg>
        </button>

        {listing.is_vacant === false && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#f87171' }}>
            Occupied
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 14px 16px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: COLORS.cream, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {listing.title}
        </h3>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 10px' }}>
          📍 {listing.city}{listing.state ? `, ${listing.state}` : ''} · {listing.type?.replace(/_/g, ' ')}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.brand, fontFamily: 'Syne, sans-serif' }}>
            {formatPrice(listing.price, listing.price_period)}
          </span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            {listing.bedrooms} bed · {listing.bathrooms} bath
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/listings/wishlist').then(r => r.data),
    enabled: isAuthenticated,
  });

  const remove = useMutation({
    mutationFn: (id) => api.post(`/listings/${id}/wishlist`), // toggle = remove since it's saved
    onSuccess: () => qc.invalidateQueries(['wishlist']),
  });

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100dvh', background: COLORS.navy, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', paddingBottom: 100 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>❤️</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: COLORS.cream, margin: '0 0 10px' }}>
          Save your favourites
        </h2>
        <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 28, lineHeight: 1.6, maxWidth: 280 }}>
          Log in to save listings and compare rooms across Nigeria.
        </p>
        <Link to="/login" style={{ background: COLORS.brand, color: '#fff', borderRadius: 12, padding: '13px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Log in
        </Link>
        <Link to="/register" style={{ marginTop: 14, fontSize: 13, color: COLORS.muted, textDecoration: 'none' }}>
          Create a free account →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: COLORS.navy, fontFamily: 'DM Sans, sans-serif', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 16px', paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: COLORS.cream, margin: 0 }}>Saved Rooms</h1>
        {!isLoading && (
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '4px 0 0' }}>
            {listings.length > 0 ? `${listings.length} room${listings.length !== 1 ? 's' : ''} saved` : 'No rooms saved yet'}
          </p>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ paddingBottom: '58%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}
        >
          <div style={{ fontSize: 56, marginBottom: 20 }}>🏚</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: COLORS.cream, margin: '0 0 10px' }}>
            No saved rooms yet
          </h2>
          <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 28, maxWidth: 280, lineHeight: 1.6 }}>
            Tap the ❤️ on any listing to save it here for easy comparison.
          </p>
          <button
            onClick={() => navigate('/search')}
            style={{ background: COLORS.brand, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            Browse listings
          </button>
        </motion.div>
      ) : (
        <div style={{ padding: 16 }}>
          <AnimatePresence>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {listings.map(listing => (
                <WishlistCard
                  key={listing.id}
                  listing={listing}
                  onRemove={(id) => remove.mutate(id)}
                  removing={remove.isPending && remove.variables === listing.id}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
