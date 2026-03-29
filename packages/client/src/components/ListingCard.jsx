import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  self_contain:      'Self Contain',
  room_and_parlour:  'Room & Parlour',
  flat:              'Flat',
  mini_flat:         'Mini Flat',
  apartment:         'Apartment',
  bq:                'BQ',
  hostel:            'Hostel',
  roommate:          'Roommate',
};

export default function ListingCard({ listing }) {
  const navigate    = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const photos      = listing.photos ?? [];
  const cover       = photos[imgIdx]?.url ?? photos[imgIdx];
  const hasMultiple = photos.length > 1;

  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(listing.price);

  const S = {
    card: {
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
      cursor: 'pointer',
      fontFamily: "'Outfit', sans-serif",
    },
    imgWrap: {
      position: 'relative',
      height: 180,
      background: 'rgba(255,255,255,0.04)',
      overflow: 'hidden',
    },
    img: {
      width: '100%', height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
    },
    placeholder: {
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, color: 'rgba(255,255,255,0.15)',
    },
    badgeRow: {
      position: 'absolute', top: 10, left: 10,
      display: 'flex', gap: 6,
    },
    badge: (color) => ({
      background: color,
      backdropFilter: 'blur(8px)',
      color: '#fff', fontSize: 10, fontWeight: 600,
      padding: '4px 10px', borderRadius: 100,
      fontFamily: "'Outfit', sans-serif",
    }),
    vacancyBadge: (vacant) => ({
      position: 'absolute', top: 10, right: 10,
      background: vacant ? 'rgba(255,107,0,0.9)' : 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      color: '#fff', fontSize: 10, fontWeight: 600,
      padding: '4px 10px', borderRadius: 100,
    }),
    dots: {
      position: 'absolute', bottom: 8, left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', gap: 4,
    },
    dot: (active) => ({
      width: active ? 14 : 5, height: 5,
      borderRadius: 3,
      background: active ? '#ff6b00' : 'rgba(255,255,255,0.4)',
      transition: 'all 0.2s',
    }),
    wishBtn: {
      position: 'absolute', top: 10, right: 10,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      border: 'none', borderRadius: '50%',
      width: 32, height: 32,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: '#fff',
    },
    info: { padding: '12px 14px 14px' },
    title: {
      fontSize: 13, fontWeight: 600, color: '#fff',
      margin: '0 0 4px',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    location: {
      fontSize: 11, color: 'rgba(255,255,255,0.4)',
      display: 'flex', alignItems: 'center', gap: 3,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    priceRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 10,
    },
    price: { fontSize: 15, fontWeight: 700, color: '#ff6b00' },
    pricePeriod: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 3 },
    meta: { display: 'flex', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    metaItem: { display: 'flex', alignItems: 'center', gap: 3 },
    divider: { width: '100%', height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' },
  };

  return (
    <motion.article
      style={S.card}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      {/* Photo */}
      <div style={S.imgWrap}>
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            style={S.img}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={S.placeholder}>🏠</div>
        )}

        {/* Type badge */}
        <div style={S.badgeRow}>
          <span style={S.badge('rgba(10,10,10,0.75)')}>
            {TYPE_LABELS[listing.type] || listing.type}
          </span>
          {listing.youtube_video_id && (
            <span style={S.badge('rgba(220,38,38,0.85)')}>▶ Tour</span>
          )}
        </div>

        {/* Vacancy — replaces wishlist when listing is taken */}
        <span style={S.vacancyBadge(listing.is_vacant)}>
          {listing.is_vacant ? 'Vacant' : 'Taken'}
        </span>

        {/* Dots indicator for multiple photos */}
        {hasMultiple && (
          <div style={S.dots}>
            {photos.map((_, i) => (
              <div key={i} style={S.dot(i === imgIdx)} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={S.info}>
        <h3 style={S.title}>{listing.title}</h3>
        <p style={S.location}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {listing.address}{listing.city ? `, ${listing.city}` : ''}
        </p>

        <div style={S.divider} />

        <div style={S.priceRow}>
          <div>
            <span style={S.price}>{price}</span>
            <span style={S.pricePeriod}>
              / {listing.price_period === 'monthly' ? 'mo' : 'year'}
            </span>
          </div>
          <div style={S.meta}>
            {listing.bedrooms != null && (
              <span style={S.metaItem}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                {listing.bedrooms}bd
              </span>
            )}
            {listing.bathrooms != null && (
              <span style={S.metaItem}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/>
                </svg>
                {listing.bathrooms}ba
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
