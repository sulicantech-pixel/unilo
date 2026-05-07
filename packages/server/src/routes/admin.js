const router = require('express').Router();
const { Listing, User, Transaction, Photo } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { QueryTypes } = require('sequelize');

// All admin routes require head_admin
router.use(authenticate, requireRole('head_admin'));

// ── GET /api/admin/pending ─── Listings awaiting approval ─────────────────────
router.get('/pending', async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { status: 'pending' },
      include: [
        { model: Photo, as: 'photos', where: { is_cover: true }, required: false },
        { model: User, as: 'landlord', attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'business_name'] },
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

// ── GET /api/admin/intelligence ───────────────────────────────────────────────
router.get('/intelligence', async (req, res) => {
  try {
    const { sequelize } = require('../models');

    // Top universities by number of students registered
    const universities = await sequelize.query(`
      SELECT
        u.name,
        COUNT(DISTINCT us.id) AS student_count,
        COUNT(DISTINCT l.id) AS listing_count
      FROM universities u
      LEFT JOIN users us ON us.university_id = u.id AND us.role = 'viewer'
      LEFT JOIN listings l ON l.landlord_id = us.id AND l.status = 'approved'
      GROUP BY u.id, u.name
      ORDER BY student_count DESC
      LIMIT 15
    `, { type: QueryTypes.SELECT });

    // Cluster stats (if Cluster model exists; else return empty)
    let clusters = [];
    try {
      clusters = await sequelize.query(`
        SELECT
          COUNT(DISTINCT c.id) AS total_clusters,
          COUNT(DISTINCT CASE WHEN c.is_enabled = true THEN c.id END) AS active_clusters,
          COUNT(DISTINCT cm.user_id) AS total_students_in_clusters
        FROM clusters c
        LEFT JOIN cluster_memberships cm ON c.id = cm.cluster_id
      `, { type: QueryTypes.SELECT });
    } catch (e) {
      clusters = [{ total_clusters: 0, active_clusters: 0, total_students_in_clusters: 0 }];
    }

    // Funnel: searches → views → listings
    const funnel = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'search') AS total_searches,
        COUNT(*) FILTER (WHERE event_type = 'listing_view') AS total_views,
        COUNT(DISTINCT CASE WHEN event_type = 'listing_view' THEN user_id END) AS unique_viewers,
        (SELECT COUNT(*) FROM listings WHERE status = 'approved') AS active_listings
      FROM analytics_events
    `, { type: QueryTypes.SELECT });

    res.json({
      universities: universities || [],
      clusters: clusters[0] || {},
      funnel: funnel[0] || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch intelligence data' });
  }
});

module.exports = router;
