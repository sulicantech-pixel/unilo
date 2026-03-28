const router = require('express').Router();
const { Op } = require('sequelize');
const { Listing, Photo, User, Wishlist, AnalyticsEvent } = require('../models');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

// ── GET /api/listings ─── Public search & filter ──────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      city, type, min_price, max_price,
      bedrooms, is_vacant, search,
      utm_source, utm_medium, utm_campaign,
      page = 1, limit = 12,
    } = req.query;

    const where = { status: 'approved' };

    if (city)     where.city     = { [Op.iLike]: `%${city}%` };
    if (type)     where.type     = type;
    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (is_vacant !== undefined) where.is_vacant = is_vacant === 'true';

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    if (search) {
      where[Op.or] = [
        { title:   { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { city:    { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Listing.findAndCountAll({
      where,
      include: [
        {
          model: Photo,
          as: 'photos',
          required: false,
          // Fetch all photos — we pick cover or first in the response
          separate: false,
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'name', 'business_name', 'phone'],
        },
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: Photo, as: 'photos' }, 'order_index', 'ASC'],
      ],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Normalise: attach a single `cover_photo` field so the frontend
    // always has a photo to show — cover first, otherwise first photo.
    const listings = rows.map((listing) => {
      const data = listing.toJSON();
      const photos = data.photos || [];
      const cover = photos.find((p) => p.is_cover) || photos[0] || null;
      return { ...data, cover_photo: cover };
    });

    // Log search analytics
    if (search || city) {
      await AnalyticsEvent.create({
        event_type: 'search',
        user_id: req.user?.id || null,
        search_query: search || city,
        city: city || null,
        utm_source,
        utm_medium,
        utm_campaign,
        device_type: detectDevice(req.headers['user-agent']),
      }).catch(() => {}); // fire-and-forget
    }

    res.json({
      listings,
      total: count,
      pages: Math.ceil(count / parseInt(limit)),
      current_page: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// ── GET /api/listings/:id ─── Public single listing ───────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const listing = await Listing.findOne({
      where: { id: req.params.id, status: 'approved' },
      include: [
        { model: Photo, as: 'photos', order: [['order_index', 'ASC']] },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'name', 'business_name', 'phone', 'whatsapp_number'],
        },
      ],
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Increment view count
    await listing.increment('view_count');

    // Log analytics
    await AnalyticsEvent.create({
      event_type: 'listing_view',
      listing_id: listing.id,
      user_id: req.user?.id || null,
      city: listing.city,
      utm_source:   req.query.utm_source,
      utm_medium:   req.query.utm_medium,
      utm_campaign: req.query.utm_campaign,
      device_type: detectDevice(req.headers['user-agent']),
    }).catch(() => {});

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// ── POST /api/listings ─── Landlord creates listing ───────────────────────────
router.post('/', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const {
      title, description, price, price_period,
      address, city, state, latitude, longitude,
      type, bedrooms, bathrooms, amenities,
      youtube_url, whatsapp_number, instagram_url,
    } = req.body;

    const listing = await Listing.create({
      title, description, price, price_period,
      address, city, state, latitude, longitude,
      type, bedrooms, bathrooms,
      amenities: amenities || [],
      youtube_url, whatsapp_number, instagram_url,
      landlord_id: req.user.id,
      status: 'draft',
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// ── PATCH /api/listings/:id ─── Landlord updates own listing ──────────────────
router.patch('/:id', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });

    const isOwner     = listing.landlord_id === req.user.id;
    const isHeadAdmin = req.user.role === 'head_admin';

    if (!isOwner && !isHeadAdmin) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    const allowed = [
      'title', 'description', 'price', 'price_period',
      'address', 'city', 'state', 'latitude', 'longitude',
      'type', 'bedrooms', 'bathrooms', 'amenities',
      'youtube_url', 'whatsapp_number', 'instagram_url', 'is_vacant',
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    await listing.update(updates);
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// ── POST /api/listings/:id/submit ─── Submit for approval ─────────────────────
router.post('/:id/submit', authenticate, requireRole('user_admin'), async (req, res) => {
  try {
    const listing = await Listing.findOne({
      where: { id: req.params.id, landlord_id: req.user.id },
    });
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (listing.status !== 'draft') {
      return res.status(400).json({ error: 'Listing already submitted' });
    }
    await listing.update({ status: 'pending' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit' });
  }
});

// ── GET /api/listings/my/all ─── Landlord sees own listings ───────────────────
router.get('/my/all', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { landlord_id: req.user.id },
      include: [{ model: Photo, as: 'photos', required: false }],
      order: [['created_at', 'DESC']],
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// ── POST /api/listings/:id/wishlist ─── Toggle wishlist ───────────────────────
router.post('/:id/wishlist', authenticate, requireRole('viewer'), async (req, res) => {
  try {
    const [item, created] = await Wishlist.findOrCreate({
      where: { user_id: req.user.id, listing_id: req.params.id },
    });

    if (!created) {
      await item.destroy();
      return res.json({ saved: false });
    }

    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: 'Wishlist toggle failed' });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectDevice(ua = '') {
  if (/mobile/i.test(ua))  return 'mobile';
  if (/tablet/i.test(ua))  return 'tablet';
  return 'desktop';
}

module.exports = router;
