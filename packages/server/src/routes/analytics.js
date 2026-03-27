const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');

// Head admin only
router.use(authenticate, requireRole('head_admin'));

// ── GET /api/analytics/traffic ────────────────────────────────────────────────
router.get('/traffic', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const { QueryTypes } = require('sequelize');
    const { days = 30 } = req.query;

    const sources = await sequelize.query(`
      SELECT
        COALESCE(utm_source, 'direct') AS source,
        COUNT(*) AS visits
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY source
      ORDER BY visits DESC
    `, { type: QueryTypes.SELECT });

    const daily = await sequelize.query(`
      SELECT
        DATE_TRUNC('day', created_at) AS day,
        COUNT(*) AS visits,
        COUNT(DISTINCT ip_hash) AS unique_visitors
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY day
      ORDER BY day ASC
    `, { type: QueryTypes.SELECT });

    res.json({ sources, daily });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});

// ── GET /api/analytics/behaviour ─────────────────────────────────────────────
router.get('/behaviour', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const { QueryTypes } = require('sequelize');

    const topSearches = await sequelize.query(`
      SELECT search_query, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = 'search' AND search_query IS NOT NULL
      GROUP BY search_query
      ORDER BY count DESC
      LIMIT 20
    `, { type: QueryTypes.SELECT });

    const topCities = await sequelize.query(`
      SELECT city, COUNT(*) AS count
      FROM analytics_events
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    const devices = await sequelize.query(`
      SELECT device_type, COUNT(*) AS count
      FROM analytics_events
      WHERE device_type IS NOT NULL
      GROUP BY device_type
    `, { type: QueryTypes.SELECT });

    const peakHours = await sequelize.query(`
      SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS count
      FROM analytics_events
      GROUP BY hour
      ORDER BY hour ASC
    `, { type: QueryTypes.SELECT });

    res.json({ top_searches: topSearches, top_cities: topCities, devices, peak_hours: peakHours });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch behaviour data' });
  }
});

// ── POST /api/analytics/event ─── Client-side event tracking ─────────────────
router.post('/event', async (req, res) => {
  // Allow unauthenticated — remove the middleware for this one
  // This route is intentionally open
  res.status(405).json({ error: 'Use the public event track endpoint' });
});

module.exports = router;
