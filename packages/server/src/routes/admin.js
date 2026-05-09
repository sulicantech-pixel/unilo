const router      = require('express').Router();
const bcrypt      = require('bcryptjs');
const { Listing, User, Transaction, Photo } = require('../models');
const { authenticate, requireRole, signToken } = require('../middleware/auth');
const { QueryTypes } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Reset / seed head-admin account (no auth required — call once)
// POST /api/admin/reset-admin
// Body: { secret: "unilo-reset-2026", new_password: "yourNewPassword" }
// ─────────────────────────────────────────────────────────────────────────────
const RESET_SECRET = 'unilo-reset-2026';

router.post('/reset-admin', async (req, res) => {
  try {
    const { secret, new_password, email } = req.body;

    if (secret !== RESET_SECRET) {
      return res.status(403).json({ error: 'Invalid reset secret' });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(422).json({ error: 'Password must be at least 6 characters' });
    }

    const adminEmail = email || 'admin@unilo.ng';

    // Find or create the head_admin user
    let admin = await User.findOne({ where: { role: 'head_admin' } });

    if (admin) {
      // Reset password
      await admin.update({ password_hash: new_password, is_suspended: false });
      const token = signToken(admin);
      return res.json({
        message: '✅ Admin password reset successfully',
        email: admin.email,
        token,
        user: admin.toSafeJSON(),
      });
    }

    // Create head_admin if none exists
    admin = await User.create({
      email:         adminEmail,
      password_hash: new_password,
      first_name:    'Patrick',
      last_name:     'Unilo',
      user_type:     'non_student',
      is_host:       false,
      role:          'head_admin',
    });

    const token = signToken(admin);
    res.status(201).json({
      message: '✅ Head admin account created',
      email:   admin.email,
      token,
      user:    admin.toSafeJSON(),
    });
  } catch (err) {
    console.error('[reset-admin]', err);
    res.status(500).json({ error: err.message || 'Reset failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// All routes below require head_admin authentication
// ─────────────────────────────────────────────────────────────────────────────
router.use(authenticate, requireRole('head_admin'));

// ── GET /api/admin/pending ────────────────────────────────────────────────────
router.get('/pending', async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { status: 'pending' },
      include: [
        { model: Photo, as: 'photos', required: false },
        {
          model: User, as: 'landlord',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'business_name'],
        },
      ],
      order: [['created_at', 'ASC']],
    });
    res.json(listings);
  } catch (err) {
    console.error('[pending]', err);
    res.status(500).json({ error: 'Failed to fetch pending listings' });
  }
});

// ── POST /api/admin/listings/:id/approve ──────────────────────────────────────
router.post('/listings/:id/approve', async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    await listing.update({ status: 'approved', rejection_reason: null });
    res.json({ message: 'Listing approved', listing });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

// ── POST /api/admin/listings/:id/reject ───────────────────────────────────────
router.post('/listings/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    await listing.update({
      status: 'rejected',
      rejection_reason: reason || 'No reason provided',
    });
    res.json({ message: 'Listing rejected', listing });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// ── PATCH /api/admin/listings/:id ─── Edit any listing as head_admin ──────────
router.patch('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    const allowed = [
      'title', 'description', 'price', 'price_period', 'address', 'city', 'state',
      'latitude', 'longitude', 'type', 'bedrooms', 'bathrooms', 'amenities',
      'whatsapp_number', 'youtube_url', 'instagram_url', 'is_vacant', 'status',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await listing.update(updates);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// ── DELETE /api/admin/listings/:id ────────────────────────────────────────────
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    await listing.destroy();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { role, suspended, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role)      where.role         = role;
    if (suspended) where.is_suspended = suspended === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ users: rows, total: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── POST /api/admin/users/:id/suspend ─────────────────────────────────────────
router.post('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    if (user.role === 'head_admin') {
      return res.status(400).json({ error: 'Cannot suspend another head admin' });
    }
    await user.update({ is_suspended: !user.is_suspended });
    res.json({ message: user.is_suspended ? 'User suspended' : 'User unsuspended', user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ── GET /api/admin/finance ────────────────────────────────────────────────────
router.get('/finance', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const summary = await sequelize.query(`
      SELECT
        COALESCE(SUM(gross_amount), 0)      AS total_gross,
        COALESCE(SUM(commission_amount), 0) AS total_commission,
        COALESCE(SUM(landlord_payout), 0)   AS total_payouts,
        COUNT(*)                             AS transaction_count
      FROM transactions WHERE status = 'completed'
    `, { type: QueryTypes.SELECT });

    const monthly = await sequelize.query(`
      SELECT DATE_TRUNC('month', created_at) AS month, SUM(gross_amount) AS revenue
      FROM transactions WHERE status = 'completed'
      GROUP BY month ORDER BY month ASC LIMIT 12
    `, { type: QueryTypes.SELECT });

    res.json({ summary: summary[0] || {}, monthly });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

// ── GET /api/admin/intelligence ───────────────────────────────────────────────
router.get('/intelligence', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const funnel = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'search')       AS total_searches,
        COUNT(*) FILTER (WHERE event_type = 'listing_view') AS total_views,
        (SELECT COUNT(*) FROM listings WHERE status = 'approved') AS active_listings,
        (SELECT COUNT(*) FROM users) AS total_users
      FROM analytics_events
    `, { type: QueryTypes.SELECT }).catch(() => [{}]);

    res.json({ funnel: funnel[0] || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch intelligence data' });
  }
});

module.exports = router;
