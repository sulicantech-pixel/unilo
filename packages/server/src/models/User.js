'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ── User type ─────────────────────────────────────────────────────────────
    user_type: {
      type: DataTypes.ENUM('student', 'non_student'),
      allowNull: false,
      defaultValue: 'student',
    },

    // ── Is host/landlord ──────────────────────────────────────────────────────
    is_host: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    // ── Admin role ────────────────────────────────────────────────────────────
    role: {
      type: DataTypes.ENUM('head_admin', 'user_admin', 'viewer'),
      defaultValue: 'viewer',
      allowNull: false,
    },

    // ── Contact ───────────────────────────────────────────────────────────────
    phone: { type: DataTypes.STRING },
    whatsapp: { type: DataTypes.STRING },
    contact_preference: {
      type: DataTypes.ENUM('phone', 'whatsapp', 'both'),
      defaultValue: 'both',
    },

    // ── Student-specific ──────────────────────────────────────────────────────
    university:  { type: DataTypes.STRING },
    course:      { type: DataTypes.STRING },
    department:  { type: DataTypes.STRING },
    level:       { type: DataTypes.STRING },

    // ── Host-specific ─────────────────────────────────────────────────────────
    property_address:  { type: DataTypes.TEXT },
    property_lat:      { type: DataTypes.FLOAT },
    property_lng:      { type: DataTypes.FLOAT },
    property_place_id: { type: DataTypes.STRING },
    room_count:        { type: DataTypes.INTEGER },
    business_name:     { type: DataTypes.STRING },

    // ── Hosting request (switch-to-host flow) ─────────────────────────────────
    // Values: null | 'pending' | 'approved' | 'rejected'
    hosting_request: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    // Stores the JSON blob submitted with the request (address, ID, phone, etc.)
    hosting_request_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ── Referral ──────────────────────────────────────────────────────────────
    referred_by:     { type: DataTypes.UUID, allowNull: true },
    referral_credits: { type: DataTypes.INTEGER, defaultValue: 0 },

    // ── Misc ──────────────────────────────────────────────────────────────────
    avatar_url:   { type: DataTypes.STRING },
    is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
    bank_account: { type: DataTypes.JSONB },

    // Renter flag — non-student booking on behalf of a family member
    renter_mode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  });

  User.prototype.checkPassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toSafeJSON = function () {
    const { password_hash, bank_account, ...safe } = this.toJSON();
    return safe;
  };

  return User;
};
