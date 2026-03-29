import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

// ── Icons ─────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill={filled ? '#ff6b00' : 'none'}
    stroke={filled ? '#ff6b00' : 'currentColor'}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ff6b00" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const WalkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2"/>
    <path d="M12 6l-2 6h4l-2 6"/><path d="M8 12l-2 4"/><path d="M16 12l2 4"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="#ff6b00" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L.057 23.5l5.797-1.522A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.019-1.376l-.36-.214-3.44.904.919-3.36-.234-.374A9.818 9.818 0 1112 21.818z"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const TYPE_LABELS = {
  self_contain: 'Self Contain', shared_room: 'Shared Room',
  boys_hostel: 'Boys Hostel', girls_hostel: 'Girls Hostel',
  room_and_parlour: 'Room & Parlour', flat: 'Flat',
  bungalow: 'Bungalow', duplex: 'Duplex', hostel: 'Hostel',
};

const AMENITY_LABELS = {
  wifi: 'WiFi', generator: 'Generator', water: 'Water Supply',
  security: 'Security', parking: 'Parking', kitchen: 'Kitchen',
  furnished: 'Furnished', air_conditioning: 'Air Conditioning', cctv: 'CCTV',
  // also handle string amenities passed directly
  WiFi: 'WiFi', Water: 'Water Supply', Electricity: 'Electricity',
  Security: 'Security', Generator: 'Generator',
};

function formatPrice(price) {
  const n = Number(price);
  if (!n) return '—';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function formatDistance(metres) {
  if (!metres) return null;
  const m = Number(metres);
  if (m < 200)  return 'On campus';
  if (m < 800)  return `${m}m from gate`;
  return `${Math.round(m / 80)} min walk`;
}

// ── Floating top button ────────────────────────────────────────────────────────
function TopBtn({ onClick, children, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 38, height: 38, borderRadius: '50%', border: 'none',
        background: 'rgba(10,10,10,0.72)', backdropFilter: 'blur(12px)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'transform 0.15s, background 0.15s',
        WebkitAppearance: 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,10,0.9)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,10,0.72)'}
    >
      {children}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [listing,    setListing]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [photoIdx,   setPhotoIdx]   = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [dragStart,  setDragStart]  = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/listings/${id}`)
      .then(r => { setListing(r.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });

    // Fire analytics event (non-blocking)
    api.post('/analytics/event', { eventType: 'listing_click', listingId: id }).catch(() => {});
  }, [id]);

  const handleShare = useCallback(() => {
    if (navigator.share) navigator.share({ title: listing?.title, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  }, [listing]);

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setWishlisted(w => !w);
  };

  const handleContact = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContactRevealed(true);
  };

  // Swipe support
  const onDragStart = e => setDragStart(e.clientX ?? e.touches?.[0]?.clientX);
  const onDragEnd   = e => {
    if (dragStart === null) return;
    const diff = dragStart - (e.clientX ?? e.changedTouches?.[0]?.clientX);
    if (Math.abs(diff) > 40) {
      diff > 0
        ? setPhotoIdx(i => (i + 1) % photos.length)
        : setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
    }
    setDragStart(null);
  };

  // ── States ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { width:32px;height:32px;border:2.5px solid #ff6b00;border-top-color:transparent;border-radius:50%;animation:spin .75s linear infinite; }`}</style>
    </div>
  );

  if (error || !listing) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>🏚</div>
      <p style={{ color: '#f5f0e8', fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, margin: 0 }}>Listing not found</p>
      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, textAlign: 'center', margin: 0 }}>This room may have been removed or is no longer available.</p>
      <button onClick={() => navigate('/')} style={{
        background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12,
        padding: '12px 28px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
        fontSize: 14, cursor: 'pointer', marginTop: 8,
      }}>
        Back to Home
      </button>
    </div>
  );

  // ── Normalise data (handles both API shapes) ─────────────────────────────
  const photos = listing.photos?.length > 0
    ? listing.photos.map(p => p.url ?? p)
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'];

  const amenities = listing.amenities ?? [];
  const rules     = listing.rules ?? [];
  const reviews   = listing.reviews ?? [];

  const landlordName    = listing.landlord?.name    ?? listing.landlordName;
  const landlordBiz     = listing.landlord?.business_name;
  const landlordPhone   = listing.landlordPhone;
  const landlordWhatsapp = listing.whatsapp_number ?? listing.landlordWhatsapp;

  const distLabel = formatDistance(listing.distance_from_school ?? listing.distanceFromSchool);

  const whatsappUrl = landlordWhatsapp
    ? `https://wa.me/${String(landlordWhatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I saw your listing on Unilo: ${listing.title}`)}`
    : null;

  const isCluster = listing.isCluster ?? listing.is_cluster;
  const clusterSpotsLeft = listing.clusterSpotsLeft ?? listing.cluster_spots_left;
  const clusterPrice     = listing.clusterPricePerPerson ?? listing.cluster_price_per_person;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes dotpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', color: '#fff', paddingBottom: 110 }}>

        {/* ── Floating top bar ── */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'all' }}>
            <TopBtn onClick={() => navigate(-1)} label="Go back"><BackIcon /></TopBtn>
          </div>
          <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
            <TopBtn onClick={handleShare} label="Share"><ShareIcon /></TopBtn>
            <TopBtn onClick={handleWishlist} label="Save">
              <HeartIcon filled={wishlisted} />
            </TopBtn>
          </div>
        </div>

        {/* ── Photo Gallery ── */}
        <div
          style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#1a1a1a', overflow: 'hidden', cursor: 'grab' }}
          onMouseDown={onDragStart} onMouseUp={onDragEnd}
          onTouchStart={onDragStart} onTouchEnd={onDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={photoIdx}
              src={photos[photoIdx]}
              alt={listing.title}
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          </AnimatePresence>

          {/* gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.5) 0%, transparent 40%)', pointerEvents: 'none' }} />

          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                <ChevronLeft />
              </button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                <ChevronRight />
              </button>
              <div style={{ position: 'absolute', bottom: 12, right: 14, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 99, padding: '4px 10px', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                {photoIdx + 1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {photos.map((img, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)}
                style={{ flexShrink: 0, width: 56, height: 40, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === photoIdx ? '#ff6b00' : 'transparent'}`, opacity: i === photoIdx ? 1 : 0.5, transition: 'all 0.15s', cursor: 'pointer', padding: 0 }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        <div style={{ padding: '20px 16px 0', maxWidth: 640, margin: '0 auto' }}>

          {/* Vacancy badge */}
          {listing.is_vacant ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'dotpulse 1.8s ease-in-out infinite', display: 'inline-block' }} />
              Available now
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.38)', borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
              Currently Taken
            </div>
          )}

          {/* Title */}
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: '#fff', marginBottom: 8 }}>
            {listing.title}
          </h1>

          {/* Type + rating row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            {listing.isVerified && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckIcon /> Verified
              </span>
            )}
            {listing.rating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                <StarIcon /> {Number(listing.rating).toFixed(1)}
                {listing.reviewCount && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>({listing.reviewCount})</span>}
              </span>
            )}
          </div>

          {/* Address */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginBottom: 4 }}>
            📍 {[listing.address, listing.city, listing.state].filter(Boolean).join(', ')}
          </p>

          {/* Distance */}
          {distLabel && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,107,0,0.85)', fontWeight: 500, marginBottom: 20 }}>
              <WalkIcon /> {distLabel}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />

          {/* Price block */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Annual rent</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#fff' }}>
              {formatPrice(listing.price)}
            </span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>/ year</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>Paid directly to landlord · no platform fees</p>

          {/* Cluster banner */}
          {isCluster && (
            <>
              <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🤝</span>
                  <p style={{ color: '#ff6b00', fontWeight: 700, fontSize: 14 }}>Cluster Available</p>
                  {clusterSpotsLeft && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,107,0,0.6)' }}>
                      {clusterSpotsLeft} spot{clusterSpotsLeft !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>
                  Split this room with a compatible student. Pay{' '}
                  <strong style={{ color: '#ff6b00' }}>{formatPrice(clusterPrice)}</strong> each instead of full rent.
                </p>
                <button style={{ marginTop: 12, width: '100%', background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Join Cluster
                </button>
              </div>
            </>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />

          {/* Specs */}
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Details</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { val: listing.bedrooms ?? 1,  label: 'Bedroom(s)' },
              { val: listing.bathrooms ?? 1, label: 'Bathroom(s)' },
              listing.yearBuilt && { val: listing.yearBuilt, label: 'Year Built' },
            ].filter(Boolean).map(({ val, label }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 16px', minWidth: 90 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>What's included</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {amenities.map(a => (
                  <span key={a} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px' }}>
                    {AMENITY_LABELS[a] || a}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Description */}
          {listing.description && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>About this place</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.52)', marginBottom: 20 }}>
                {listing.description}
              </p>
            </>
          )}

          {/* House Rules */}
          {rules.length > 0 && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>House rules</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {rules.map(rule => (
                  <li key={rule} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.52)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>—</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 700 }}>Reviews</p>
                {listing.rating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    <StarIcon /> {Number(listing.rating).toFixed(1)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {reviews.slice(0, 3).map((review, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,107,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#ff6b00', flexShrink: 0 }}>
                        {(review.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{review.name || 'Anonymous'}</p>
                        {review.date && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{review.date}</p>}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.65 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Landlord */}
          {landlordName && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Listed by</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                  {landlordName[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{landlordName}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                    {landlordBiz || 'Landlord · Unilo verified'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        display: 'flex', gap: 10, alignItems: 'center',
        maxWidth: 640, margin: '0 auto',
      }}>
        {/* Price summary */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700 }}>
            {formatPrice(listing.price)}
            <span style={{ fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}> / yr</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
            {TYPE_LABELS[listing.type] || listing.type}
          </div>
        </div>

        {/* Contact CTAs */}
        {contactRevealed ? (
          <div style={{ display: 'flex', gap: 8 }}>
            {landlordPhone && (
              <a href={`tel:${landlordPhone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                📞 Call
              </a>
            )}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <WhatsAppIcon /> WhatsApp
              </a>
            )}
          </div>
        ) : (
          <>
            {whatsappUrl && !isAuthenticated ? (
              <button onClick={handleContact}
                style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Login to Contact
              </button>
            ) : whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                <WhatsAppIcon /> WhatsApp
              </a>
            ) : (
              <button onClick={handleContact}
                style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {isAuthenticated ? 'Show Contact' : 'Login to Contact'}
              </button>
            )}
            {isCluster && (
              <button style={{ background: 'transparent', color: '#ff6b00', border: '1.5px solid #ff6b00', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Join Cluster
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
