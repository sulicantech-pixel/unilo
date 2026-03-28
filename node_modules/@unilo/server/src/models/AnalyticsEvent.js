'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('AnalyticsEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  event_type: {
    type: DataTypes.ENUM(
      'page_view', 'listing_view', 'video_play',
      'search', 'wishlist_add', 'contact_click',
      'whatsapp_click', 'share'
    ),
    allowNull: false,
  },
  listing_id: { type: DataTypes.UUID },
  user_id:    { type: DataTypes.UUID },  // null for anonymous
  // UTM / traffic source
  utm_source:   { type: DataTypes.STRING },  // google, whatsapp, instagram, direct
  utm_medium:   { type: DataTypes.STRING },  // organic, share, paid, referral
  utm_campaign: { type: DataTypes.STRING },
  utm_content:  { type: DataTypes.STRING },
  // Context
  search_query: { type: DataTypes.STRING },
  city:         { type: DataTypes.STRING },
  device_type:  { type: DataTypes.ENUM('mobile', 'tablet', 'desktop') },
  ip_hash:      { type: DataTypes.STRING, comment: 'Hashed for privacy' },
  metadata:     { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: 'analytics_events',
  indexes: [
    { fields: ['event_type'] },
    { fields: ['created_at'] },
    { fields: ['utm_source'] },
    { fields: ['listing_id'] },
  ],
});
