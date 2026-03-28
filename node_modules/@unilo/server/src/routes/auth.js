const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { signToken, authenticate } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['viewer', 'user_admin']).withMessage('Invalid role'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { email, password, name, phone, role = 'viewer', business_name } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({
      email,
      password_hash: password, // hashed by model hook
      name,
      phone,
      role,
      business_name: role === 'user_admin' ? business_name : null,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.checkPassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.is_suspended) return res.status(403).json({ error: 'Account suspended. Contact support.' });

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

module.exports = router;
