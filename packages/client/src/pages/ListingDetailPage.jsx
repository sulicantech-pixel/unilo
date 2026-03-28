import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
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
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const WalkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2"/>
    <path d="M12 6l-2 6h4l-2 6"/><path d="M8 12l-2 4"/><path d="M16 12l2 4"/>
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ff6b00" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L.057 23.5l5.797-1.522A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.019-1.376l-.36-.214-3.44.904.919-3.36-.234-.374A9.818 9.818 0 1112 21.818z"/>
  </svg>
);

// ── Amenity label map ─────────────────────────────────────────────────────────
const AMENITY_LABELS = {
  wifi: 'WiFi', generator: 'Generator', water: 'Water supply',
  security: 'Security', parking: 'Parking', kitchen: 'Kitchen',
  furnished: 'Furnished', air_conditioning: 'Air conditioning', cctv: 'CCTV',
};

const TYPE_LABELS = {
  self_contain: 'Self Contain', shared_room: 'Shared Room',
  boys_hostel: 'Boys Hostel', girls_hostel: 'Girls Hostel',
  room_and_parlour: 'Room & Parlour', flat: 'Flat',
  bungalow: 'Bungalow', duplex: 'Duplex', hostel: 'Hostel',
};

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
  return `${Math.round(m / 80)} min walk`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [photoIdx, setPhotoIdx]     = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [dragStart, setDragStart]   = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/listings/${id}`)
      .then(r => { setListing(r.data); setLoading(false); })
      .catch(() => { setError('Listing not found'); setLoading(false); });
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: listing?.title, url });
    else navigator.clipboard.writeText(url);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #ff6b00', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !listing) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontSize: 16 }}>Listing not found</p>
      <button onClick={() => navigate('/')} style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
        Go home
      </button>
    </div>
  );

  const photos = listing.photos?.length > 0
    ? listing.photos.map(p => p.url ?? p)
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'];

  const nextPhoto = () => setPhotoIdx(i => (i + 1) % photos.length);
  const prevPhoto = () => setPhotoIdx(i => (i - 1 + photos.length) % photos.length);
  const handleDragStart = (e) => setDragStart(e.clientX ?? e.touches?.[0]?.clientX);
  const handleDragEnd   = (e) => {
    if (dragStart === null) return;
    const diff = dragStart - (e.clientX ?? e.changedTouches?.[0]?.clientX);
    if (Math.abs(diff) > 40) diff > 0 ? nextPhoto() : prevPhoto();
    setDragStart(null);
  };

  const distLabel = formatDistance(listing.distance_from_school);
  const whatsappUrl = listing.whatsapp_number
    ? `https://wa.me/${listing.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I saw your listing on Unilo: ${listing.title}`)}`
    : null;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ldp {
          min-height: 100vh;
          background: #0a0a0a;
          font-family: 'Outfit', sans-serif;
          color: #fff;
          padding-bottom: 120px;
        }

        /* ── Floating top bar ── */
        .ldp-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px;
        }

        .ldp-top-btn {
          width: 38px; height: 38px; border-radius: 50%; border: none;
          background: rgba(10,10,10,0.75); backdrop-filter: blur(10px);
          color: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s;
        }
        .ldp-top-btn:active { transform: scale(0.9); }

        .ldp-top-right { display: flex; gap: 8px; }

        /* ── Photo gallery ── */
        .ldp-gallery {
          position: relative; width: 100%; aspect-ratio: 4/3;
          overflow: hidden; background: #1a1a1a;
        }

        .ldp-photo {
          width: 100%; height: 100%; object-fit: cover;
          user-select: none; pointer-events: none;
        }

        .ldp-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; background: rgba(255,255,255,0.92);
          border: none; border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          z-index: 5;
        }
        .ldp-arrow.prev { left: 12px; }
        .ldp-arrow.next { right: 12px; }

        .ldp-photo-count {
          position: absolute; bottom: 14px; right: 14px;
          background: rgba(0,0,0,0.65); color: #fff; border-radius: 100px;
          padding: 4px 10px; font-size: 12px; font-weight: 600;
          backdrop-filter: blur(4px);
        }

        /* ── Content ── */
        .ldp-content { padding: 20px 16px 0; max-width: 640px; margin: 0 auto; }

        /* Vacant badge */
        .ldp-vacant {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,107,0,0.12); border: 1px solid rgba(255,107,0,0.3);
          color: #ff6b00; border-radius: 100px;
          padding: 4px 12px; font-size: 11px; font-weight: 700;
          margin-bottom: 12px;
        }
        .ldp-vacant-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #ff6b00;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .ldp-taken {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); border-radius: 100px;
          padding: 4px 12px; font-size: 11px; font-weight: 700;
          margin-bottom: 12px;
        }

        /* Title */
        .ldp-title {
          font-family: 'Fraunces', serif;
          font-size: 24px; font-weight: 700; line-height: 1.25;
          color: #fff; margin-bottom: 6px;
        }

        /* Type + rating row */
        .ldp-meta-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px; flex-wrap: wrap;
        }
        .ldp-type-badge {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          border-radius: 100px; padding: 3px 10px;
          font-size: 11px; font-weight: 600;
        }
        .ldp-rating {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600; color: #fff;
        }

        /* Address */
        .ldp-address {
          font-size: 13px; color: rgba(255,255,255,0.45);
          margin-bottom: 6px;
        }

        /* Distance */
        .ldp-dist {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; color: rgba(255,107,0,0.85);
          font-weight: 500; margin-bottom: 20px;
        }

        /* Divider */
        .ldp-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 20px 0;
        }

        /* Section heading */
        .ldp-section-title {
          font-size: 15px; font-weight: 700; color: #fff;
          margin-bottom: 12px;
        }

        /* Price block */
        .ldp-price-block {
          display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px;
        }
        .ldp-price-big {
          font-size: 28px; font-weight: 800; color: #fff;
        }
        .ldp-price-period {
          font-size: 14px; color: rgba(255,255,255,0.4);
        }
        .ldp-price-note {
          font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 20px;
        }

        /* Specs row */
        .ldp-specs {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .ldp-spec {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 14px;
          display: flex; flex-direction: column; gap: 2px; min-width: 80px;
        }
        .ldp-spec-val {
          font-size: 16px; font-weight: 700; color: #fff;
        }
        .ldp-spec-label {
          font-size: 11px; color: rgba(255,255,255,0.35);
        }

        /* Amenities */
        .ldp-amenities {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
        }
        .ldp-amenity {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 7px 12px;
          font-size: 12px; color: rgba(255,255,255,0.7);
        }

        /* Description */
        .ldp-description {
          font-size: 14px; line-height: 1.65;
          color: rgba(255,255,255,0.55);
        }

        /* Landlord card */
        .ldp-landlord {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 14px;
        }
        .ldp-landlord-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: #ff6b00; display: flex; align-items: center;
          justify-content: center; font-size: 18px; font-weight: 700;
          color: #fff; flex-shrink: 0;
        }
        .ldp-landlord-name {
          font-size: 14px; font-weight: 600; color: #fff;
        }
        .ldp-landlord-biz {
          font-size: 12px; color: rgba(255,255,255,0.38);
        }

        /* ── Sticky CTA bar ── */
        .ldp-cta-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: rgba(10,10,10,0.95); backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 12px 16px 28px;
          display: flex; gap: 10px; align-items: center;
          max-width: 640px; margin: 0 auto;
        }

        .ldp-cta-price {
          flex: 1;
        }
        .ldp-cta-price-main {
          font-size: 17px; font-weight: 700; color: #fff;
        }
        .ldp-cta-price-sub {
          font-size: 11px; color: rgba(255,255,255,0.35);
        }

        .ldp-wa-btn {
          display: flex; align-items: center; gap: 8px;
          background: #25D366; color: #fff;
          border: none; border-radius: 14px;
          padding: 14px 20px; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; text-decoration: none;
          transition: transform 0.15s, opacity 0.15s;
          flex-shrink: 0;
        }
        .ldp-wa-btn:active { transform: scale(0.96); opacity: 0.9; }

        .ldp-contact-btn {
          background: #ff6b00; color: #fff;
          border: none; border-radius: 14px;
          padding: 14px 20px; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: transform 0.15s;
          flex-shrink: 0;
        }
        .ldp-contact-btn:active { transform: scale(0.96); }

        @media (min-width: 640px) {
          .ldp-cta-bar { left: 50%; right: auto; width: 640px; transform: translateX(-50%); border-radius: 20px 20px 0 0; }
          .ldp-gallery { max-height: 480px; }
        }
      `}</style>

      <div className="ldp">
        {/* ── Top bar ── */}
        <div className="ldp-topbar">
          <button className="ldp-top-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BackIcon />
          </button>
          <div className="ldp-top-right">
            <button className="ldp-top-btn" onClick={handleShare} aria-label="Share">
              <ShareIcon />
            </button>
            <button className="ldp-top-btn" onClick={() => setWishlisted(w => !w)} aria-label="Save">
              <HeartIcon filled={wishlisted} />
            </button>
          </div>
        </div>

        {/* ── Photo gallery ── */}
        <div
          className="ldp-gallery"
          onMouseDown={handleDragStart} onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart} onTouchEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={photoIdx}
              src={photos[photoIdx]}
              alt={listing.title}
              className="ldp-photo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              draggable={false}
            />
          </AnimatePresence>

          {photos.length > 1 && (
            <>
              <button className="ldp-arrow prev" onClick={prevPhoto}><ChevronLeft /></button>
              <button className="ldp-arrow next" onClick={nextPhoto}><ChevronRight /></button>
              <div className="ldp-photo-count">{photoIdx + 1} / {photos.length}</div>
            </>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="ldp-content">

          {/* Vacant badge */}
          {listing.is_vacant ? (
            <div className="ldp-vacant">
              <div className="ldp-vacant-dot" /> Available now
            </div>
          ) : (
            <div className="ldp-taken">Currently taken</div>
          )}

          {/* Title */}
          <h1 className="ldp-title">{listing.title}</h1>

          {/* Type + rating */}
          <div className="ldp-meta-row">
            <span className="ldp-type-badge">{TYPE_LABELS[listing.type] || listing.type}</span>
            {listing.rating && (
              <span className="ldp-rating">
                <StarIcon /> {Number(listing.rating).toFixed(1)}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="ldp-address">{listing.address}, {listing.city}, {listing.state}</div>

          {/* Distance */}
          {distLabel && (
            <div className="ldp-dist">
              <WalkIcon /> {distLabel}
            </div>
          )}

          <div className="ldp-divider" />

          {/* Price */}
          <div className="ldp-section-title">Rent</div>
          <div className="ldp-price-block">
            <span className="ldp-price-big">{formatPrice(listing.price)}</span>
            <span className="ldp-price-period">/ year</span>
          </div>
          <div className="ldp-price-note">Annual rent · paid to landlord directly</div>

          <div className="ldp-divider" />

          {/* Specs */}
          <div className="ldp-section-title">Details</div>
          <div className="ldp-specs">
            <div className="ldp-spec">
              <span className="ldp-spec-val">{listing.bedrooms ?? 1}</span>
              <span className="ldp-spec-label">{listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
            </div>
            <div className="ldp-spec">
              <span className="ldp-spec-val">{listing.bathrooms ?? 1}</span>
              <span className="ldp-spec-label">{listing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <>
              <div className="ldp-section-title">What's included</div>
              <div className="ldp-amenities">
                {listing.amenities.map(a => (
                  <span key={a} className="ldp-amenity">
                    {AMENITY_LABELS[a] || a}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Description */}
          {listing.description && (
            <>
              <div className="ldp-divider" />
              <div className="ldp-section-title">About this place</div>
              <p className="ldp-description">{listing.description}</p>
            </>
          )}

          {/* Landlord */}
          {listing.landlord && (
            <>
              <div className="ldp-divider" />
              <div className="ldp-section-title">Listed by</div>
              <div className="ldp-landlord">
                <div className="ldp-landlord-avatar">
                  {(listing.landlord.name || 'L')[0].toUpperCase()}
                </div>
                <div>
                  <div className="ldp-landlord-name">{listing.landlord.name}</div>
                  {listing.landlord.business_name && (
                    <div className="ldp-landlord-biz">{listing.landlord.business_name}</div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Sticky CTA bar ── */}
      <div className="ldp-cta-bar">
        <div className="ldp-cta-price">
          <div className="ldp-cta-price-main">{formatPrice(listing.price)}<span style={{ fontWeight: 400, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}> / yr</span></div>
          <div className="ldp-cta-price-sub">{TYPE_LABELS[listing.type] || listing.type}</div>
        </div>
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ldp-wa-btn">
            <WhatsAppIcon /> WhatsApp
          </a>
        ) : (
          <button className="ldp-contact-btn">Contact landlord</button>
        )}
      </div>
    </>
  );
}
