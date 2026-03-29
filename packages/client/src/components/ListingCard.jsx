import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  self_contain:     'Self Contain',
  shared_room:      'Shared Room',
  room_and_parlour: 'Room & Parlour',
  flat:             'Flat',
  bungalow:         'Bungalow',
  duplex:           'Duplex',
  hostel:           'Hostel',
  boys_hostel:      'Boys Hostel',
  girls_hostel:     'Girls Hostel',
};

function formatPrice(price) {
  const n = Number(price);
  if (!n) return '—';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const cover = listing.photos?.[0]?.url ?? listing.photos?.[0];

  return (
    <motion.article
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'DM Sans, sans-serif',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)';
        e.currentTarget.style.boxShadow   = '0 4px 24px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', height: 176, background: '#1a1a1a', overflow: 'hidden' }}>
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            🏠
          </div>
        )}

        {/* Top-left: type + video badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
            background: 'rgba(10,10,10,0.75)', color: '#f5f0e8',
            backdropFilter: 'blur(8px)',
          }}>
            {TYPE_LABELS[listing.type] || listing.type}
          </span>
          {listing.youtube_video_id && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
              background: 'rgba(220,38,38,0.85)', color: '#fff',
            }}>
              ▶ Tour
            </span>
          )}
        </div>

        {/* Top-right: vacancy */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          {listing.is_vacant ? (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
              background: 'rgba(16,185,129,0.2)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.3)',
            }}>
              Vacant
            </span>
          ) : (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.38)',
            }}>
              Taken
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          color: '#f5f0e8', lineHeight: 1.35,
          fontFamily: 'Fraunces, serif',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {listing.title}
        </h3>

        <p style={{
          margin: '4px 0 0', fontSize: 12,
          color: 'rgba(255,255,255,0.38)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          📍 {listing.address}, {listing.city}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#ff6b00' }}>
              {formatPrice(listing.price)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
              / {listing.price_period === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
            <span>🛏 {listing.bedrooms ?? 1}</span>
            <span>🚿 {listing.bathrooms ?? 1}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
