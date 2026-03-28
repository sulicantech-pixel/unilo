'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('Wishlist', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id:    { type: DataTypes.UUID, allowNull: false },
  listing_id: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'wishlists',
  indexes: [{ unique: true, fields: ['user_id', 'listing_id'] }],
});
