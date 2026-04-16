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
  const cover = listing.photos?.[0]?.url;

  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <motion.article
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="card cursor-pointer group"
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    >
      {/* Photo */}
      <div className="relative h-44 bg-white/5 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <span className="text-4xl">🏠</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="badge bg-navy/80 backdrop-blur text-cream text-[10px]">
            {TYPE_LABELS[listing.type] || listing.type}
          </span>
          {listing.youtube_video_id && (
            <span className="badge bg-red-600/90 text-white text-[10px]">▶ Tour</span>
          )}
        </div>

        {/* Vacancy */}
        <div className="absolute top-3 right-3">
          <span
            className={`badge text-[10px] ${
              listing.is_vacant ? 'bg-brand/90 text-navy' : 'bg-white/20 text-muted'
            }`}
          >
            {listing.is_vacant ? 'Vacant' : 'Taken'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-cream text-sm leading-snug line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-muted text-xs mt-1 line-clamp-1">
          📍 {listing.address}, {listing.city}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-display font-bold text-brand text-base">{price}</span>
            <span className="text-muted text-xs ml-1">
              / {listing.price_period === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted text-xs">
            {listing.bedrooms != null && <span>🛏 {listing.bedrooms}</span>}
            {listing.bathrooms != null && <span>🚿 {listing.bathrooms}</span>}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
