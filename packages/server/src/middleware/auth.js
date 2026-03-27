const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

/**
 * Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user)            return res.status(401).json({ error: 'User not found' });
    if (user.is_suspended) return res.status(403).json({ error: 'Account suspended' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Optional auth — attaches user if token present, continues without error
 */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user && !user.is_suspended) req.user = user;
    }
  } catch (e) { /* noop */ }
  next();
};

/**
 * Role guard factory
 * Usage: requireRole('head_admin')
 *        requireRole('head_admin', 'user_admin')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

/**
 * Generate a signed JWT for a user
 */
const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

module.exports = { authenticate, optionalAuth, requireRole, signToken };
