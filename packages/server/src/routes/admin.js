const router = require('express').Router();
const { Listing, User, Transaction, Photo } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

// All admin routes require head_admin
router.use(authenticate, requireRole('head_admin'));

// ── GET /api/admin/pending ─── Listings awaiting approval ─────────────────────
router.get('/pending', async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { status: 'pending' },
      include: [
        { model: Photo, as: 'photos', where: { is_cover: true }, required: false },
        { model: User, as: 'landlord', attributes: ['id', 'name', 'email', 'phone', 'business_name'] },
      ],
      order: [['created_at', 'ASC']],
    });
    res.json(listings);
  } catch (err) {
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
    await listing.update({ status: 'rejected', rejection_reason: reason || 'No reason provided' });
    res.json({ message: 'Listing rejected', listing });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
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
      limit: parseInt(limit),
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
    const { QueryTypes } = require('sequelize');

    const summary = await sequelize.query(`
      SELECT
        COALESCE(SUM(gross_amount), 0)        AS total_gross,
        COALESCE(SUM(commission_amount), 0)   AS total_commission,
        COALESCE(SUM(landlord_payout), 0)     AS total_payouts,
        COUNT(*)                               AS transaction_count
      FROM transactions
      WHERE status = 'completed'
    `, { type: QueryTypes.SELECT });

    const byCity = await sequelize.query(`
      SELECT city, SUM(gross_amount) AS revenue, COUNT(*) AS bookings
      FROM transactions
      WHERE status = 'completed'
      GROUP BY city
      ORDER BY revenue DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    const monthly = await sequelize.query(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(gross_amount)               AS revenue
      FROM transactions
      WHERE status = 'completed'
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `, { type: QueryTypes.SELECT });

    res.json({ summary: summary[0], by_city: byCity, monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

module.exports = router;
