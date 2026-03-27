'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.url, config);

// ── Import models ─────────────────────────────────────────────────────────────
const User      = require('./User')(sequelize, DataTypes);
const Listing   = require('./Listing')(sequelize, DataTypes);
const Photo     = require('./Photo')(sequelize, DataTypes);
const Wishlist  = require('./Wishlist')(sequelize, DataTypes);
const Transaction = require('./Transaction')(sequelize, DataTypes);
const AnalyticsEvent = require('./AnalyticsEvent')(sequelize, DataTypes);

// ── Associations ─────────────────────────────────────────────────────────────

// User → Listings (landlord owns many listings)
User.hasMany(Listing,  { foreignKey: 'landlord_id', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

// Listing → Photos
Listing.hasMany(Photo,  { foreignKey: 'listing_id', as: 'photos', onDelete: 'CASCADE' });
Photo.belongsTo(Listing, { foreignKey: 'listing_id' });

// User → Wishlists (students save listings)
User.hasMany(Wishlist,  { foreignKey: 'user_id', as: 'wishlists' });
Listing.hasMany(Wishlist, { foreignKey: 'listing_id', as: 'wishlists' });
Wishlist.belongsTo(User,    { foreignKey: 'user_id' });
Wishlist.belongsTo(Listing, { foreignKey: 'listing_id' });

// Listing → Transactions
Listing.hasMany(Transaction,  { foreignKey: 'listing_id', as: 'transactions' });
Transaction.belongsTo(Listing, { foreignKey: 'listing_id' });
User.hasMany(Transaction,     { foreignKey: 'landlord_id', as: 'earnings' });
Transaction.belongsTo(User,   { foreignKey: 'landlord_id', as: 'landlord' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Listing,
  Photo,
  Wishlist,
  Transaction,
  AnalyticsEvent,
};
