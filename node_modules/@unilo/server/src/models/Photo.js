'use strict';

// ── Photo ─────────────────────────────────────────────────────────────────────
const Photo = (sequelize, DataTypes) => sequelize.define('Photo', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  listing_id: { type: DataTypes.UUID, allowNull: false },
  url:          { type: DataTypes.STRING, allowNull: false },
  cloudinary_id: { type: DataTypes.STRING },
  is_cover:     { type: DataTypes.BOOLEAN, defaultValue: false },
  order_index:  { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'photos' });

module.exports = Photo;
