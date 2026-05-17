/**
 * WishlistPage — Airbnb-style collections
 *
 * - Listings are grouped into named collections (folders)
 * - Default collection: "Saved rooms"
 * - Create new collections from the + button
 * - Move listings between collections
 * - Stats panel: price range, room types breakdown
 */
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../utils/designSystem';

const BRAND = '#ff6b00';
const NAVY  = '#0a0a0a';
const CREAM = '#f5f0e8';
const MUTED = 'rgba(255,255,255,0.42)';
const GLASS = 'rgba(255,255,255,0.04)';
const BDR   = 'rgba(255,255,255,0.08)';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const HeartFilledIcon = ({ size = 18, color = BRAND }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const FolderIcon = ({ color = MUTED }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
);
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const MoveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/>
    <path d="M19 9l3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,107,0,0.35)" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrice(price, period) {
  const n = Number(price);
  if (!n) return '₦—';
  const fmt = n >= 1_000_000 ? `₦${(n/1_000_000).toFixed(1)}M` : `₦${Math.round(n/1_000)}k`;
  return period === 'monthly' ? `${fmt}/mo` : `${fmt}/yr`;
}

function getCoverUrl(listing) {
  if (listing.cover_photo?.url) return listing.cover_photo.url;
  const photos = listing.photos ?? [];
  return photos.map(p => typeof p === 'string' ? p : p?.url).filter(Boolean)[0] ?? null;
}

// ── Collection cover mosaic ────────────────────────────────────────────────────
function CollectionCover({ listings }) {
  const covers = listings.slice(0, 4).map(getCoverUrl).filter(Boolean);
  if (covers.length === 0) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,107,0,0.06)' }}>
      <FolderIcon color={`${BRAND}50`} />
    </div>
  );
  if (covers.length === 1) return (
    <img src={covers[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  );
  // 2×2 mosaic
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', width: '100%', height: '100%', gap: 1 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
          {covers[i] && <img src={covers[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
      ))}
    </div>
  );
}

// ── Stats panel for a collection ───────────────────────────────────────────────
function CollectionStats({ listings }) {
  const prices = listings.map(l => Number(l.price)).filter(Boolean);
  const min    = prices.length ? Math.min(...prices) : 0;
  const max    = prices.length ? Math.max(...prices) : 0;
  const avg    = prices.length ? Math.round(prices.reduce((a,b) => a+b, 0) / prices.length) : 0;
  const types  = {};
  listings.forEach(l => { const t = (l.type||'').replace(/_/g,' '); types[t] = (types[t]||0)+1; });
  const topType = Object.entries(types).sort((a,b)=>b[1]-a[1])[0]?.[0];

  if (!prices.length) return null;
  return (
    <div style={{ background: `${BRAND}08`, border: `1px solid ${BRAND}20`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
      {[
        { label: 'Lowest', value: `₦${Math.round(min/1000)}k` },
        { label: 'Average', value: `₦${Math.round(avg/1000)}k` },
        { label: 'Highest', value: `₦${Math.round(max/1000)}k` },
      ].map(s => (
        <div key={s.label} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: BRAND, margin: '0 0 2px', fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
          <p style={{ fontSize: 10, color: MUTED, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
        </div>
      ))}
      {topType && (
        <div style={{ gridColumn: '1/-1', borderTop: `1px solid ${BDR}`, paddingTop: 8, marginTop: 2, textAlign: 'center', fontSize: 12, color: MUTED }}>
          Mostly <strong style={{ color: CREAM }}>{topType}</strong> rooms
        </div>
      )}
    </div>
  );
}

// ── Single listing card inside a collection ────────────────────────────────────
function SavedCard({ listing, onRemove, onMove, collections, removing }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cover = getCoverUrl(listing);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
      style={{ background: GLASS, border: `1px solid ${BDR}`, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>

      {/* Image */}
      <div style={{ position: 'relative', paddingBottom: '60%', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
        onClick={() => navigate(`/listing/${listing.id}`)}>
        {cover
          ? <img src={cover} alt={listing.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HomeIcon /></div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)', pointerEvents: 'none' }} />

        {/* Options button */}
        <button onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
          style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, zIndex: 5 }}>
          ···
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
              style={{ position: 'absolute', top: 42, right: 8, background: '#1a1a1a', border: `1px solid ${BDR}`, borderRadius: 12, overflow: 'hidden', zIndex: 20, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}>
              {/* Move to collection */}
              {collections.filter(c => c !== listing.collection_name).map(col => (
                <button key={col} onClick={() => { onMove(listing.id, col); setMenuOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'none', border: 'none', color: CREAM, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ color: MUTED }}><MoveIcon /></span> Move to "{col}"
                </button>
              ))}
              <div style={{ height: 1, background: BDR }} />
              <button onClick={() => { onRemove(listing.id); setMenuOpen(false); }} disabled={removing}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <TrashIcon /> Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div style={{ padding: '10px 12px 12px', cursor: 'pointer' }} onClick={() => navigate(`/listing/${listing.id}`)}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: CREAM, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {listing.title}
        </p>
        <p style={{ fontSize: 11, color: MUTED, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
          <PinIcon /> {listing.city}
        </p>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, color: BRAND, margin: 0 }}>
          {formatPrice(listing.price, listing.price_period)}
        </p>
      </div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [activeCollection, setActiveCollection] = useState(null); // null = show all folders
  const [showNewFolder, setShowNewFolder]       = useState(false);
  const [newFolderName, setNewFolderName]       = useState('');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  () => api.get('/listings/wishlist').then(r => r.data),
    enabled:  isAuthenticated,
  });

  const remove = useMutation({
    mutationFn: id => api.post(`/listings/${id}/wishlist`),
    onMutate: async id => {
      // Optimistic remove
      await qc.cancelQueries(['wishlist']);
      const prev = qc.getQueryData(['wishlist']);
      qc.setQueryData(['wishlist'], old => (old || []).filter(l => l.id !== id));
      return { prev };
    },
    onError: (_, __, ctx) => qc.setQueryData(['wishlist'], ctx.prev),
    onSettled: () => qc.invalidateQueries(['wishlist']),
  });

  const moveToCollection = useMutation({
    mutationFn: ({ id, collection }) => api.patch(`/listings/${id}/wishlist`, { collection_name: collection }),
    onSuccess: () => qc.invalidateQueries(['wishlist']),
  });

  // Group by collection
  const collections = useMemo(() => {
    const groups = {};
    listings.forEach(l => {
      const col = l.collection_name || 'Saved rooms';
      if (!groups[col]) groups[col] = [];
      groups[col].push(l);
    });
    return groups;
  }, [listings]);

  const collectionNames   = Object.keys(collections);
  const currentListings   = activeCollection ? (collections[activeCollection] || []) : [];

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${BRAND}10`, border: `1px solid ${BRAND}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <HeartFilledIcon size={32} color={`${BRAND}60`} />
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: CREAM, margin: '0 0 10px' }}>Save your favourites</h2>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 28, lineHeight: 1.6, maxWidth: 280 }}>
          Log in to save listings and organise them into collections.
        </p>
        <Link to="/login" style={{ background: BRAND, color: '#fff', borderRadius: 14, padding: '13px 36px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
        <Link to="/register" style={{ marginTop: 14, fontSize: 13, color: MUTED, textDecoration: 'none' }}>Create a free account →</Link>
      </div>
    );
  }

  // ── COLLECTION DETAIL VIEW ─────────────────────────────────────────────────
  if (activeCollection) {
    return (
      <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: `${NAVY}f2`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BDR}`, paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 14px' }}>
            <button onClick={() => setActiveCollection(null)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: GLASS, border: `1px solid ${BDR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CREAM, flexShrink: 0 }}>
              <BackIcon />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: CREAM, margin: 0 }}>{activeCollection}</h1>
              <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>{currentListings.length} room{currentListings.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          {/* Stats */}
          <CollectionStats listings={currentListings} />

          {/* Grid */}
          <AnimatePresence>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {currentListings.map(listing => (
                <SavedCard key={listing.id} listing={listing}
                  collections={collectionNames}
                  onRemove={id => remove.mutate(id)}
                  onMove={(id, col) => moveToCollection.mutate({ id, collection: col })}
                  removing={remove.isPending && remove.variables === listing.id} />
              ))}
            </div>
          </AnimatePresence>

          {currentListings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: MUTED, fontSize: 14 }}>
              This collection is empty.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── COLLECTIONS LIST VIEW ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}>

      {/* Header */}
      <div style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', padding: '0 16px', paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 16, borderBottom: `1px solid ${BDR}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 28,
            fontWeight: 900,
            color: CREAM,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Wishlists
          </h1>
          <motion.button onClick={() => setShowNewFolder(true)} whileTap={{ scale: 0.92 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${BRAND}15`, border: `1px solid ${BRAND}30`, borderRadius: 10, padding: '8px 12px', color: BRAND, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            <PlusIcon /> New list
          </motion.button>
        </div>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
          {listings.length > 0 ? `${listings.length} room${listings.length !== 1 ? 's' : ''} across ${collectionNames.length} list${collectionNames.length !== 1 ? 's' : ''}` : 'No rooms saved yet'}
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: GLASS, animation: 'pulse 1.4s ease-in-out infinite' }}>
              <div style={{ paddingBottom: '70%' }} />
              <div style={{ padding: 12 }}>
                <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 6 }} />
                <div style={{ height: 10, width: '50%', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      ) : listings.length === 0 ? (
        // Empty state
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 24px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: `${BRAND}08`, border: `1px solid ${BRAND}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <HeartFilledIcon size={34} color={`${BRAND}40`} />
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: CREAM, margin: '0 0 10px' }}>No saved rooms yet</h2>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 28, maxWidth: 260, lineHeight: 1.65 }}>
            Tap the heart on any listing to save it. Organise your favourites into lists to compare easily.
          </p>
          <motion.button onClick={() => navigate('/search')} whileTap={{ scale: 0.97 }}
            style={{ background: BRAND, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Browse listings
          </motion.button>
        </motion.div>
      ) : (
        // Collection folders grid
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {collectionNames.map(name => {
              const items = collections[name];
              return (
                <motion.div key={name} onClick={() => setActiveCollection(name)}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  style={{ cursor: 'pointer', borderRadius: 16, overflow: 'hidden', background: GLASS, border: `1px solid ${BDR}` }}>
                  {/* Cover mosaic */}
                  <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <CollectionCover listings={items} />
                    </div>
                    {/* Count badge */}
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', borderRadius: 99, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                      {items.length} room{items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: CREAM, margin: '0 0 2px' }}>{name}</p>
                      <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                        {(() => {
                          const prices = items.map(l => Number(l.price)).filter(Boolean);
                          if (!prices.length) return 'No price info';
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          return min === max ? `₦${Math.round(min/1000)}k` : `₦${Math.round(min/1000)}k – ₦${Math.round(max/1000)}k`;
                        })()}
                      </p>
                    </div>
                    <span style={{ color: MUTED }}><ChevronRight /></span>
                  </div>
                </motion.div>
              );
            })}

            {/* New collection placeholder */}
            <motion.div onClick={() => setShowNewFolder(true)} whileTap={{ scale: 0.97 }}
              style={{ cursor: 'pointer', borderRadius: 16, border: `1.5px dashed rgba(255,255,255,0.15)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px 16px', minHeight: 160 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: GLASS, border: `1px solid ${BDR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
                <PlusIcon />
              </div>
              <p style={{ fontSize: 13, color: MUTED, margin: 0, textAlign: 'center', lineHeight: 1.4 }}>Create a new list</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* New folder modal */}
      <AnimatePresence>
        {showNewFolder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowNewFolder(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 480, background: '#111', border: `1px solid ${BDR}`, borderRadius: '24px 24px 0 0', padding: '20px 20px', paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: CREAM, margin: '0 0 16px' }}>Name your list</h3>
              <input
                autoFocus
                placeholder="e.g. Near OAU, Affordable, Yaba options…"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    // The name is stored client-side — new listings saved will go to this collection
                    // For existing listings, we'd need to move them
                    setShowNewFolder(false);
                    setNewFolderName('');
                    setActiveCollection(newFolderName.trim());
                  }
                }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: '13px 14px', color: CREAM, fontSize: 15, fontFamily: 'DM Sans, sans-serif', outline: 'none', marginBottom: 14 }}
              />
              <motion.button
                onClick={() => {
                  if (newFolderName.trim()) {
                    setShowNewFolder(false);
                    setNewFolderName('');
                  }
                }}
                disabled={!newFolderName.trim()}
                whileTap={{ scale: 0.97 }}
                style={{ width: '100%', background: newFolderName.trim() ? BRAND : 'rgba(255,107,0,0.3)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: newFolderName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}>
                Create list
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
