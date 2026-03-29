const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { signToken, authenticate } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('user_type').isIn(['student', 'non_student']).withMessage('Invalid user type'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const {
      email, password, first_name, last_name,
      user_type,           // 'student' | 'non_student'
      is_host,             // boolean — did they also tick "I'm a host"?
      phone, whatsapp, contact_preference,
      // Student fields
      university, course, department, level,
      // Host fields
      property_address, property_lat, property_lng,
      property_place_id, room_count, business_name,
    } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'This email is already registered. Try logging in.' });

    const user = await User.create({
      email,
      password_hash: password,   // hashed by beforeCreate hook
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      user_type,
      is_host: !!is_host,
      role: is_host ? 'user_admin' : 'viewer',

      // Contact
      phone: phone || null,
      whatsapp: whatsapp || null,
      contact_preference: contact_preference || 'both',

      // Student fields (only saved if student)
      university: user_type === 'student' ? university : null,
      course:     user_type === 'student' ? course     : null,
      department: user_type === 'student' ? department : null,
      level:      user_type === 'student' ? level      : null,

      // Host fields (only saved if is_host)
      property_address:  is_host ? property_address  : null,
      property_lat:      is_host ? property_lat       : null,
      property_lng:      is_host ? property_lng        : null,
      property_place_id: is_host ? property_place_id  : null,
      room_count:        is_host ? room_count          : null,
      business_name:     is_host ? business_name       : null,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('[register error]', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'No account found with this email.' });

    const valid = await user.checkPassword(password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password. Try again.' });

    if (user.is_suspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('[login error]', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

module.exports = router;
