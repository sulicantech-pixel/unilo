'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('Wishlist', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id:    { type: DataTypes.UUID, allowNull: false },
  listing_id: { type: DataTypes.UUID, allowNull: false },
  // Airbnb-style collections/folders
  collection_name: { type: DataTypes.STRING, defaultValue: 'Saved rooms', allowNull: false },
  note:            { type: DataTypes.TEXT,   allowNull: true  },
}, {
  tableName: 'wishlists',
  indexes: [{ unique: true, fields: ['user_id', 'listing_id'] }],
});
