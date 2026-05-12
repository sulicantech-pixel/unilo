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
          model: User,
          as: 'landlord',
          required: false,
          attributes: ['id', 'first_name', 'last_name', 'business_name', 'phone'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Fetch photos separately to avoid ORDER + LIMIT conflict
    const listingIds = rows.map(r => r.id);
    const allPhotos = listingIds.length ? await Photo.findAll({
      where: { listing_id: listingIds },
      order: [['order_index', 'ASC']],
    }) : [];

    const photoMap = {};
    allPhotos.forEach(p => {
      if (!photoMap[p.listing_id]) photoMap[p.listing_id] = [];
      photoMap[p.listing_id].push(p.toJSON());
    });

    const listings = rows.map((listing) => {
      const data = listing.toJSON();
      const photos = photoMap[data.id] || [];
      const cover = photos.find((p) => p.is_cover) || photos[0] || null;
      return { ...data, photos, cover_photo: cover };
    });

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
      }).catch(() => {});
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

// ── GET /api/listings/homepage-sections ─── Curated sections for home page ────
router.get('/homepage-sections', optionalAuth, async (req, res) => {
  try {
    const { uni = '', tab = 'all' } = req.query;

    const baseWhere = { status: 'approved' };

    // Helper: fetch listings then attach photos separately to avoid
    // Sequelize ORDER + LIMIT conflict with associated models
    const fetchSection = async (where, limit = 8) => {
      const rows = await Listing.findAll({
        where: { ...baseWhere, ...where },
        include: [
          {
            model: User,
            as: 'landlord',
            required: false,
            attributes: ['id', 'first_name', 'last_name', 'business_name', 'phone'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
      });

      if (!rows.length) return [];

      // Fetch photos separately using Op.in
      const ids = rows.map(r => r.id);
      const photos = await Photo.findAll({
        where: { listing_id: { [Op.in]: ids } },
        order: [['order_index', 'ASC']],
      });

      const photosByListing = {};
      photos.forEach(p => {
        if (!photosByListing[p.listing_id]) photosByListing[p.listing_id] = [];
        photosByListing[p.listing_id].push(p.toJSON());
      });

      return rows.map(l => {
        const data  = l.toJSON();
        const pList = photosByListing[data.id] || [];
        const cover = pList.find(p => p.is_cover) || pList[0] || null;
        return { ...data, photos: pList, cover_photo: cover };
      });
    };

    // Count helper
    const countWhere = async (where) => {
      return Listing.count({ where: { ...baseWhere, ...where } });
    };

    const sections = [];

    if (tab === 'all' || tab === 'trending') {
      const listings = await fetchSection({}, 8);
      const total    = await countWhere({});
      sections.push({
        id: 'trending',
        title: 'Trending Now',
        description: 'Most popular listings this week',
        icon: '🔥',
        listings,
        total_count: total,
      });
    }

    if (tab === 'all' || tab === 'on-campus') {
      // On-campus listings contain the university name in city or address
      const uniFilter = uni
        ? {
            [Op.or]: [
              { city:    { [Op.iLike]: `%${uni}%` } },
              { address: { [Op.iLike]: `%${uni}%` } },
              { description: { [Op.iLike]: `%${uni}%` } },
            ],
          }
        : {};
      const listings = await fetchSection({ ...uniFilter, type: { [Op.in]: ['hostel'] } }, 8)
        .then((r) => r.length >= 2 ? r : fetchSection(uniFilter, 8));
      const total = await countWhere(uniFilter);
      sections.push({
        id: 'on-campus',
        title: 'Near Campus',
        description: `Rooms close to ${uni || 'your university'}`,
        icon: '🎓',
        listings,
        total_count: total,
      });
    }

    if (tab === 'all' || tab === 'off-campus') {
      const listings = await fetchSection({ is_vacant: true }, 8);
      const total    = await countWhere({ is_vacant: true });
      sections.push({
        id: 'vacant',
        title: 'Available Now',
        description: 'Move-in ready rooms',
        icon: '✅',
        listings,
        total_count: total,
      });
    }

    if (sections.length === 0) {
      // Fallback — just return all approved listings in one section
      const listings = await fetchSection({}, 12);
      const total    = await countWhere({});
      sections.push({
        id: 'all',
        title: 'All Listings',
        description: 'Browse all available rooms',
        icon: '🏠',
        listings,
        total_count: total,
      });
    }

    res.json(sections);
  } catch (err) {
    console.error('[homepage-sections]', err);
    res.status(500).json({ error: 'Failed to fetch homepage sections', detail: err.message });
  }
});

// ── GET /api/listings/wishlist ─── Authenticated user's saved listings ─────────
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const wishlists = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Listing,
          as: 'listing',
          where: { status: 'approved' },
          required: true,
          include: [
            { model: Photo, as: 'photos', required: false },
            { model: User, as: 'landlord', attributes: ['id', 'first_name', 'last_name', 'phone', 'whatsapp'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const listings = wishlists.map((w) => {
      const data   = w.listing.toJSON();
      const photos = data.photos || [];
      const cover  = photos.find((p) => p.is_cover) || photos[0] || null;
      return { ...data, cover_photo: cover, wishlisted: true };
    });

    res.json(listings);
  } catch (err) {
    console.error('[wishlist]', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
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
          attributes: ['id', 'first_name', 'last_name', 'business_name', 'phone'],
        },
      ],
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    await listing.increment('view_count');

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

// ── POST /api/listings/quick ─── Public quick listing (no auth required) ──────
router.post('/quick', async (req, res) => {
  try {
    const {
      title, description, price, price_period,
      address, city, state, latitude, longitude,
      type, bedrooms, bathrooms, amenities,
      youtube_url, whatsapp_number, instagram_url,
      contact_name, contact_email, contact_phone,
    } = req.body;

    // Validate required fields
    if (!title || !price || !address || !city || !type || !contact_name || !contact_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create the "Quick List" system user
    let quickListUser = await User.findOne({
      where: { email: 'quicklist@unilo.local' },
    });

    if (!quickListUser) {
      quickListUser = await User.create({
        email: 'quicklist@unilo.local',
        password_hash: 'system-user-no-login',
        first_name: 'Quick',
        last_name: 'List',
        role: 'user_admin',
        is_host: true,
        user_type: 'non_student',
        business_name: 'Quick List Submissions',
      });
    }

    // Create listing in pending status (goes straight to your approval queue)
    const listing = await Listing.create({
      title,
      description,
      price,
      price_period,
      address,
      city,
      state,
      latitude,
      longitude,
      type,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      amenities: amenities || [],
      youtube_url,
      whatsapp_number,
      instagram_url,
      landlord_id: quickListUser.id,
      status: 'pending', // Straight to your approval queue
    });

    // Store contact info in listing metadata (or in a separate table if you build that)
    // For now, we'll add it to the response so you can see it
    const response = listing.toJSON();
    response.quick_list_contact = {
      name: contact_name,
      email: contact_email,
      phone: contact_phone,
    };

    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// ── POST /api/listings ─── Authenticated landlord or admin creates listing ──────
router.post('/', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const {
      title, description, price, price_period,
      address, city, state, latitude, longitude,
      type, bedrooms, bathrooms, amenities,
      youtube_url, whatsapp_number, instagram_url,
      is_vacant,
    } = req.body;

    // Sanitize — strip empty strings to null so NOT NULL constraints don't fire
    // and URL validators don't choke on empty strings
    const clean = (v) => (v === '' || v === undefined ? null : v);
    const cleanUrl = (v) => {
      if (!v || v.trim() === '') return null;
      // Accept URLs without protocol by prepending https://
      if (!/^https?:\/\//i.test(v.trim())) return null;
      return v.trim();
    };

    // head_admin listings skip straight to pending (ready for their own approval queue)
    // user_admin (landlord) listings start as draft until they explicitly submit
    const initialStatus = req.user.role === 'head_admin' ? 'pending' : 'draft';

    const listing = await Listing.create({
      title:         clean(title),
      description:   clean(description),
      price:         parseFloat(price),
      price_period:  price_period || 'annually',
      address:       clean(address),
      city:          clean(city),
      state:         clean(state) || clean(city) || 'Nigeria', // fallback so NOT NULL passes
      latitude:      latitude  ? parseFloat(latitude)  : null,
      longitude:     longitude ? parseFloat(longitude) : null,
      type:          type || 'self_contain',
      bedrooms:      parseInt(bedrooms)  || 1,
      bathrooms:     parseInt(bathrooms) || 1,
      amenities:     amenities || [],
      youtube_url:   cleanUrl(youtube_url),
      whatsapp_number: clean(whatsapp_number),
      instagram_url: cleanUrl(instagram_url),
      is_vacant:     is_vacant !== undefined ? is_vacant : true,
      landlord_id:   req.user.id,
      status:        initialStatus,
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error('[create listing]', err);
    res.status(500).json({ error: 'Failed to create listing', detail: err.message });
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

// ── POST /api/listings/:id/submit ─── Submit listing for approval ─────────────
// Landlords: draft → pending (enters admin review queue)
// Head admin: pending → pending (no-op, already there — just returns the listing)
router.post('/:id/submit', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const isHeadAdmin = req.user.role === 'head_admin';

    // head_admin can submit any listing; landlord can only submit their own
    const where = isHeadAdmin
      ? { id: req.params.id }
      : { id: req.params.id, landlord_id: req.user.id };

    const listing = await Listing.findOne({ where });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Only move forward if still in draft or pending — never re-submit approved/rejected
    if (!['draft', 'pending'].includes(listing.status)) {
      return res.status(400).json({ error: `Listing is already ${listing.status}` });
    }

    // Always land in pending after submit
    await listing.update({ status: 'pending' });
    res.json(listing);
  } catch (err) {
    console.error('[submit]', err);
    res.status(500).json({ error: 'Failed to submit listing' });
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
