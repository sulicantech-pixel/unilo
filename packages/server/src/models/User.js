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

    // ── User type: student | non_student ─────────────────────────────────────
    user_type: {
      type: DataTypes.ENUM('student', 'non_student'),
      allowNull: false,
      defaultValue: 'student',
    },

    // ── Is this user also a host/landlord? (can be true for any user_type) ───
    is_host: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    // ── Admin role (kept for backward compat) ─────────────────────────────────
    role: {
      type: DataTypes.ENUM('head_admin', 'user_admin', 'viewer'),
      defaultValue: 'viewer',
      allowNull: false,
    },

    // ── Contact ───────────────────────────────────────────────────────────────
    phone: {
      type: DataTypes.STRING,
    },
    whatsapp: {
      type: DataTypes.STRING, // separate WhatsApp number if different
    },
    contact_preference: {
      type: DataTypes.ENUM('phone', 'whatsapp', 'both'),
      defaultValue: 'both',
    },

    // ── Student-specific fields ───────────────────────────────────────────────
    university: {
      type: DataTypes.STRING,
    },
    course: {
      type: DataTypes.STRING, // e.g. "Computer Science"
    },
    department: {
      type: DataTypes.STRING, // e.g. "Faculty of Engineering"
    },
    level: {
      type: DataTypes.STRING, // e.g. "300L"
    },

    // ── Host-specific fields ──────────────────────────────────────────────────
    property_address: {
      type: DataTypes.TEXT,
    },
    property_lat: {
      type: DataTypes.FLOAT,
    },
    property_lng: {
      type: DataTypes.FLOAT,
    },
    property_place_id: {
      type: DataTypes.STRING, // Google Places ID for precision
    },
    room_count: {
      type: DataTypes.INTEGER,
    },
    business_name: {
      type: DataTypes.STRING,
    },

    // ── Misc ──────────────────────────────────────────────────────────────────
    avatar_url: {
      type: DataTypes.STRING,
    },
    is_suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bank_account: {
      type: DataTypes.JSONB,
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
