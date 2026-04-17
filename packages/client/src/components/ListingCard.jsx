import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { COLORS, STYLES, ANIMATIONS, TYPOGRAPHY } from '../utils/designSystem';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const images = listing.photos || [listing.image] || [];
  const currentImage = images[currentImageIndex];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = () => {
    navigate(`/listing/${listing.id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className={`${STYLES.cardBase} overflow-hidden cursor-pointer group h-full flex flex-col`}
      variants={ANIMATIONS.cardHover}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    >
      {/* Image Carousel Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-white/5">
        {/* Main Image */}
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <img
            src={currentImage || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              style={{
                backgroundColor: `${COLORS.brand}dd`,
                color: COLORS.navy,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ‹
            </motion.button>
            <motion.button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              style={{
                backgroundColor: `${COLORS.brand}dd`,
                color: COLORS.navy,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ›
            </motion.button>
          </>
        )}

        {/* Save Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all"
          style={{
            backgroundColor: isSaved ? COLORS.brand : `${COLORS.glass}`,
            color: isSaved ? COLORS.navy : COLORS.cream,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ♥
        </motion.button>

        {/* Verified Badge */}
        {listing.is_verified && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success }}
          >
            ✓ Verified
          </div>
        )}

        {/* Image Indicator Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <motion.div
                key={idx}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: idx === currentImageIndex ? COLORS.brand : COLORS.cream,
                  opacity: idx === currentImageIndex ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Title & Price */}
        <div className="mb-3">
          <h3 className={`${TYPOGRAPHY.h4} line-clamp-2 mb-1`} style={{ color: COLORS.cream }}>
            {listing.title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.brand }}>
              ₦{(listing.price / 1000000).toFixed(1)}M
            </span>
            <span className={`${TYPOGRAPHY.bodySmall}`} style={{ color: COLORS.muted }}>
              /{listing.price_period}
            </span>
          </div>
        </div>

        {/* Key Info */}
        <div className="mb-3 space-y-2">
          {/* Room Details */}
          <div className="flex items-center gap-2" style={{ color: COLORS.muted }}>
            <span className={`${TYPOGRAPHY.bodySmall}`}>
              {listing.bedrooms} bed {listing.bathrooms} bath
            </span>
          </div>

          {/* Distance to School */}
          {listing.distance_to_campus && (
            <div className="flex items-center gap-2" style={{ color: COLORS.muted }}>
              <span className={`${TYPOGRAPHY.bodySmall}`}>
                📍 {listing.distance_to_campus.toFixed(1)}km to campus
              </span>
            </div>
          )}

          {/* Rating */}
          {listing.rating && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">★</span>
              <span className={`${TYPOGRAPHY.bodySmall}`} style={{ color: COLORS.cream }}>
                {listing.rating.toFixed(1)}
              </span>
              <span className={`${TYPOGRAPHY.caption}`} style={{ color: COLORS.muted }}>
                ({listing.review_count || 0})
              </span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Department Match Badge */}
        {listing.department_match && (
          <motion.div
            className={`${STYLES.badge} text-xs w-fit`}
            style={{
              backgroundColor: `${COLORS.brand}20`,
              color: COLORS.brand,
              borderColor: `${COLORS.brand}40`,
              borderWidth: '1px',
            }}
          >
            📚 {listing.department_match}% for {listing.primary_department}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
