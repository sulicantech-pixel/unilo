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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    /**
     * role: 'head_admin' | 'user_admin' (landlord) | 'viewer' (student)
     */
    role: {
      type: DataTypes.ENUM('head_admin', 'user_admin', 'viewer'),
      defaultValue: 'viewer',
      allowNull: false,
    },
    is_suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar_url: {
      type: DataTypes.STRING,
    },
    // Landlord-specific
    business_name: {
      type: DataTypes.STRING,
    },
    bank_account: {
      type: DataTypes.JSONB, // { bank_name, account_number, account_name }
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
