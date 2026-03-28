const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { sequelize } = require('../models');
const { QueryTypes, DataTypes } = require('sequelize');

// ── Lazy-init AnalyticsEvent model ───────────────────────────────────────────
let AnalyticsEvent;

async function getModel() {
  if (!AnalyticsEvent) {
    AnalyticsEvent = sequelize.define('AnalyticsEvent', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      eventType:   { type: DataTypes.STRING(80),  allowNull: false },
      sessionId:   { type: DataTypes.STRING(120), allowNull: true },
      userId:      { type: DataTypes.STRING(120), allowNull: true },
      listingId:   { type: DataTypes.STRING(120), allowNull: true },
      university:  { type: DataTypes.STRING(120), allowNull: true },
      tab:         { type: DataTypes.STRING(60),  allowNull: true },
      filters:     { type: DataTypes.JSONB,       allowNull: true },
      location:    { type: DataTypes.JSONB,       allowNull: true },
      metadata:    { type: DataTypes.JSONB,       allowNull: true },
      durationMs:  { type: DataTypes.INTEGER,     allowNull: true },
      scrollDepth: { type: DataTypes.INTEGER,     allowNull: true },
      searchQuery: { type: DataTypes.TEXT,        allowNull: true },
      utmSource:   { type: DataTypes.STRING(120), allowNull: true },
      city:        { type: DataTypes.STRING(120), allowNull: true },
      deviceType:  { type: DataTypes.STRING(60),  allowNull: true },
      ipHash:      { type: DataTypes.STRING(120), allowNull: true },
      page:        { type: DataTypes.STRING(255), allowNull: true },
      userAgent:   { type: DataTypes.TEXT,        allowNull: true },
      ip:          { type: DataTypes.STRING(60),  allowNull: true },
    }, {
      tableName: 'analytics_events',
      timestamps: true,
      indexes: [
        { fields: ['eventType'] },
        { fields: ['listingId'] },
        { fields: ['userId'] },
        { fields: ['sessionId'] },
        { fields: ['createdAt'] },
      ],
    });

    await AnalyticsEvent.sync({ force: false }).catch((err) => {
      console.error('[Analytics] Table sync failed:', err.message);
    });
  }
  return AnalyticsEvent;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDeviceType(ua = '') {
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function hashIp(ip = '') {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

// ── PUBLIC: POST /api/analytics/event ────────────────────────────────────────
// No auth required — called by the frontend on every user interaction
router.post('/event', async (req, res) => {
  try {
    const Model = await getModel();
    const ua = req.headers['user-agent'] || '';
    const rawIp = req.ip || '';

    const {
      eventType, sessionId, userId, listingId,
      university, tab, filters, location, metadata,
      durationMs, depth, page, searchQuery, utmSource,
    } = req.body;

    await Model.create({
      eventType:   eventType || 'unknown',
      sessionId:   sessionId || null,
      userId:      userId ? String(userId) : null,
      listingId:   listingId ? String(listingId) : null,
      university:  university || filters?.university || null,
      tab:         tab || null,
      filters:     filters || null,
      location:    location || null,
      metadata:    metadata || null,
      durationMs:  durationMs || null,
      scrollDepth: depth || null,
      searchQuery: searchQuery || filters?.search || null,
      utmSource:   utmSource || null,
      city:        location?.city || null,
      deviceType:  getDeviceType(ua),
      ipHash:      hashIp(rawIp),
      page:        page || null,
      userAgent:   ua,
      ip:          rawIp,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[Analytics] Event save failed:', err.message);
    res.status(200).json({ ok: true }); // Always 200 — never break the frontend
  }
});

// ── All routes below this line require head_admin ─────────────────────────────
router.use(authenticate, requireRole('head_admin'));

// ── GET /api/analytics/traffic ────────────────────────────────────────────────
router.get('/traffic', async (req, res) => {
  try {
    const safeDays = parseInt(req.query.days) || 30;

    const sources = await sequelize.query(`
      SELECT
        COALESCE(utm_source, 'direct') AS source,
        COUNT(*) AS visits
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
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
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY day
      ORDER BY day ASC
    `, { type: QueryTypes.SELECT });

    res.json({ sources, daily });
  } catch (err) {
    console.error('[Analytics] Traffic error:', err.message);
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});

// ── GET /api/analytics/behaviour ─────────────────────────────────────────────
router.get('/behaviour', async (req, res) => {
  try {
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

    res.json({
      top_searches: topSearches,
      top_cities:   topCities,
      devices,
      peak_hours:   peakHours,
    });
  } catch (err) {
    console.error('[Analytics] Behaviour error:', err.message);
    res.status(500).json({ error: 'Failed to fetch behaviour data' });
  }
});

// ── GET /api/analytics/listings ───────────────────────────────────────────────
router.get('/listings', async (req, res) => {
  try {
    const safeDays = parseInt(req.query.days) || 30;

    const topClicks = await sequelize.query(`
      SELECT listing_id, COUNT(*) AS clicks
      FROM analytics_events
      WHERE event_type = 'listing_click'
        AND listing_id IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY listing_id
      ORDER BY clicks DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    const topHovered = await sequelize.query(`
      SELECT
        listing_id,
        AVG(duration_ms) AS avg_hover_ms,
        COUNT(*) AS hover_count
      FROM analytics_events
      WHERE event_type = 'listing_hover'
        AND listing_id IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY listing_id
      ORDER BY avg_hover_ms DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    const topWishlisted = await sequelize.query(`
      SELECT listing_id, COUNT(*) AS saves
      FROM analytics_events
      WHERE event_type = 'listing_wishlist'
        AND listing_id IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY listing_id
      ORDER BY saves DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    const topUniversities = await sequelize.query(`
      SELECT university, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = 'university_selected'
        AND university IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY university
      ORDER BY count DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    res.json({ topClicks, topHovered, topWishlisted, topUniversities });
  } catch (err) {
    console.error('[Analytics] Listings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch listing analytics' });
  }
});

// ── GET /api/analytics/summary ────────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const safeDays = parseInt(req.query.days) || 30;

    const counts = await sequelize.query(`
      SELECT event_type, COUNT(*) AS count
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY event_type
      ORDER BY count DESC
    `, { type: QueryTypes.SELECT });

    const scrollDepths = await sequelize.query(`
      SELECT scroll_depth, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = 'scroll_depth'
        AND scroll_depth IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${safeDays} days'
      GROUP BY scroll_depth
      ORDER BY scroll_depth ASC
    `, { type: QueryTypes.SELECT });

    res.json({ counts, scrollDepths });
  } catch (err) {
    console.error('[Analytics] Summary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
