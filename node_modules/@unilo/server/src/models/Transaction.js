'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  listing_id:  { type: DataTypes.UUID, allowNull: false },
  landlord_id: { type: DataTypes.UUID, allowNull: false },
  gross_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Full amount paid by student in NGN',
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.10,
    comment: 'Unilo commission — default 10%',
  },
  commission_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  landlord_payout: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'refunded'),
    defaultValue: 'pending',
  },
  payment_reference: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'transactions' });
