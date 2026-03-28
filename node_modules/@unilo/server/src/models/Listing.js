'use strict';

module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Annual rent in NGN',
    },
    price_period: {
      type: DataTypes.ENUM('monthly', 'annually'),
      defaultValue: 'annually',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
    },
    // Property details
    type: {
      type: DataTypes.ENUM('self_contain', 'room_and_parlour', 'flat', 'bungalow', 'duplex', 'hostel'),
      allowNull: false,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'e.g. ["wifi", "generator", "water", "security", "parking"]',
    },
    // YouTube video tour
    youtube_url: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    youtube_video_id: {
      type: DataTypes.STRING,
      comment: 'Extracted from youtube_url automatically',
    },
    // Social links
    whatsapp_number: {
      type: DataTypes.STRING,
    },
    instagram_url: {
      type: DataTypes.STRING,
    },
    // Availability
    is_vacant: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Status workflow: draft → pending → approved | rejected
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'),
      defaultValue: 'draft',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
    },
    // Analytics
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    landlord_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'listings',
    hooks: {
      beforeSave: (listing) => {
        if (listing.changed('youtube_url') && listing.youtube_url) {
          listing.youtube_video_id = extractYouTubeId(listing.youtube_url);
        }
      },
    },
  });

  return Listing;
};

/**
 * Extract YouTube video ID from various URL formats:
 *   https://youtu.be/dQw4w9WgXcQ
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   https://youtube.com/embed/dQw4w9WgXcQ
 */
function extractYouTubeId(url) {
  try {
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
      /youtube\.com\/v\/([^?&]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  } catch (e) { /* noop */ }
  return null;
}
