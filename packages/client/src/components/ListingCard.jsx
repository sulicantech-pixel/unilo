import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_LABELS = {
  self_contain:     'Self contain',
  shared_room:      'Shared room',
  boys_hostel:      'Boys hostel',
  girls_hostel:     'Girls hostel',
  room_and_parlour: 'Room & parlour',
  flat:             'Flat',
  bungalow:         'Bungalow',
  duplex:           'Duplex',
  hostel:           'Hostel',
};

// ── SVG Icons (Feather-style, no emoji, no icon lib) ─────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? '#ff6b00' : 'none'}
    stroke={filled ? '#ff6b00' : '#fff'}
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price) {
  const n = Number(price);
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function formatDistance(metres) {
  if (!metres) return null;
  const m = Number(metres);
  if (m < 200)  return 'On campus';
  if (m < 800)  return `${m}m from gate`;
  const mins = Math.round(m / 80);
  return `${mins} min walk`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx]     = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [dragStart, setDragStart]   = useState(null);

  // Handle both API shapes:
  // Old: listing.photos = [{url:...}, ...]
  // New: listing.cover_photo = {url:...}, listing.photos = [...]
  const photos = (() => {
    if (listing.photos?.length > 0) return listing.photos.map(p => p.url ?? p);
    if (listing.cover_photo?.url)   return [listing.cover_photo.url];
    return ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'];
  })();

  const nextPhoto = (e) => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length); };
  const prevPhoto = (e) => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length); };

  const handleDragStart = (e) => setDragStart(e.clientX ?? e.touches?.[0]?.clientX);
  const handleDragEnd   = (e) => {
    if (dragStart === null) return;
    const end  = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const diff = dragStart - end;
    if (Math.abs(diff) > 40) diff > 0 ? nextPhoto(e) : prevPhoto(e);
    setDragStart(null);
  };

  const distLabel = formatDistance(listing.distance_from_school);
  const typeLabel = TYPE_LABELS[listing.type] || listing.type;
  const location  = [listing.address, listing.city].filter(Boolean).join(', ');

  return (
    <>
      <style>{`
        .ulc { cursor:pointer; background:transparent; border-radius:16px; overflow:hidden; }

        /* ── 2:3 Airbnb photo ratio ── */
        .ulc-photo-wrap {
          position:relative; width:100%; padding-bottom:66.67%;
          overflow:hidden; background:#1a1a1a; border-radius:14px;
        }
        .ulc-photo-inner { position:absolute; inset:0; }

        /* ── Ken Burns on hover ── */
        .ulc-photo {
          width:100%; height:100%; object-fit:cover;
          transform:scale(1) translateX(0);
          transition:transform 7s ease;
          user-select:none; pointer-events:none;
        }
        .ulc:hover .ulc-photo { transform:scale(1.1) translateX(3%); }

        /* ── Photo nav arrows ── */
        .ulc-arrow {
          position:absolute; top:50%; transform:translateY(-50%);
          width:26px; height:26px; background:rgba(255,255,255,0.94);
          border:none; border-radius:50%; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          z-index:5; opacity:0; transition:opacity 0.18s;
        }
        .ulc-photo-wrap:hover .ulc-arrow { opacity:1; }
        .ulc-arrow.prev { left:8px; }
        .ulc-arrow.next { right:8px; }

        /* ── Dots ── */
        .ulc-dots {
          position:absolute; bottom:9px; left:50%; transform:translateX(-50%);
          display:flex; gap:4px; z-index:5;
        }
        .ulc-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.45); transition:all 0.2s; }
        .ulc-dot.on { background:#fff; width:14px; border-radius:3px; }

        /* ── Wishlist ── */
        .ulc-wish {
          position:absolute; top:11px; right:11px; z-index:6;
          width:32px; height:32px; border-radius:50%; border:none;
          background:rgba(0,0,0,0.35); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:transform 0.15s;
        }
        .ulc-wish:active { transform:scale(0.88); }

        /* ── Cluster badge ── */
        .ulc-cluster-badge {
          position:absolute; top:11px; left:11px; z-index:6;
          background:rgba(255,107,0,0.92); color:#fff;
          font-family:'Outfit',sans-serif; font-size:10px; font-weight:700;
          padding:3px 9px; border-radius:100px; letter-spacing:0.3px;
        }

        /* ── Bottom gradient ── */
        .ulc-grad {
          position:absolute; bottom:0; left:0; right:0; height:40%;
          background:linear-gradient(to top,rgba(0,0,0,0.4),transparent);
          pointer-events:none; z-index:2;
        }

        /* ── Info — Airbnb layout ── */
        .ulc-info { padding:10px 1px 0; }

        .ulc-row1 {
          display:flex; align-items:center;
          justify-content:space-between; gap:6px; margin-bottom:1px;
        }

        /* Line 1: type · city — bold, like Airbnb's "Apartment in Sea Point" */
        .ulc-headline {
          font-family:'Outfit',sans-serif;
          font-size:13.5px; font-weight:600; color:#fff;
          overflow:hidden; white-space:nowrap; text-overflow:ellipsis; flex:1;
        }

        .ulc-rating {
          display:flex; align-items:center; gap:3px;
          font-family:'Outfit',sans-serif; font-size:12px;
          font-weight:600; color:#fff; white-space:nowrap; flex-shrink:0;
        }

        /* Line 2: full address — muted */
        .ulc-address {
          font-family:'Outfit',sans-serif;
          font-size:12px; color:rgba(255,255,255,0.4);
          overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
          margin-bottom:1px;
        }

        /* Line 3: distance — orange */
        .ulc-dist {
          font-family:'Outfit',sans-serif;
          font-size:11.5px; color:rgba(255,107,0,0.82);
          margin-bottom:3px;
        }

        /* Line 4: price — bold amount underlined like Airbnb */
        .ulc-price-row {
          display:flex; align-items:baseline; gap:3px; margin-top:2px;
        }
        .ulc-price {
          font-family:'Outfit',sans-serif;
          font-size:14px; font-weight:700; color:#fff;
          text-decoration:underline; text-underline-offset:2px;
          text-decoration-color:rgba(255,255,255,0.25);
        }
        .ulc-period {
          font-family:'Outfit',sans-serif;
          font-size:12px; color:rgba(255,255,255,0.38); font-weight:400;
        }
      `}</style>

      <motion.article
        className="ulc"
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/listing/${listing.id}`)}
      >
        {/* ── PHOTO ── */}
        <div
          className="ulc-photo-wrap"
          onMouseDown={handleDragStart} onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart} onTouchEnd={handleDragEnd}
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
                transition={{ duration: 0.2 }}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          <div className="ulc-grad" />

          {listing.is_cluster && (
            <div className="ulc-cluster-badge">Cluster</div>
          )}

          <button
            className="ulc-wish"
            onClick={e => { e.stopPropagation(); setWishlisted(w => !w); }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <HeartIcon filled={wishlisted} />
          </button>

          {photos.length > 1 && (
            <>
              <button className="ulc-arrow prev" onClick={prevPhoto} aria-label="Previous photo"><ChevronLeft /></button>
              <button className="ulc-arrow next" onClick={nextPhoto} aria-label="Next photo"><ChevronRight /></button>
              <div className="ulc-dots">
                {photos.map((_, i) => (
                  <div key={i} className={`ulc-dot${i === photoIdx ? ' on' : ''}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── INFO — Airbnb style ── */}
        <div className="ulc-info">

          {/* Line 1: "Self contain · Port Harcourt"  ★ 4.8 */}
          <div className="ulc-row1">
            <span className="ulc-headline">
              {typeLabel} · {listing.city || 'Port Harcourt'}
            </span>
            {listing.rating && (
              <span className="ulc-rating">
                <StarIcon />
                {Number(listing.rating).toFixed(1)}
              </span>
            )}
          </div>

          {/* Line 2: street address, muted */}
          <div className="ulc-address">{location}</div>

          {/* Line 3: distance, orange — only if set */}
          {distLabel && <div className="ulc-dist">{distLabel}</div>}

          {/* Line 4: ₦180k / year */}
          <div className="ulc-price-row">
            <span className="ulc-price">{formatPrice(listing.price)}</span>
            <span className="ulc-period">/ year</span>
          </div>

        </div>
      </motion.article>
    </>
  );
}
