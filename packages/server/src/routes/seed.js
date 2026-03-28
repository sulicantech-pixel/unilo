'use strict';
/**
 * UNILO SEED ROUTE
 * ────────────────
 * ONE-TIME USE. DELETE THIS FILE AFTER SEEDING.
 *
 * 1. Upload this file to: packages/server/src/routes/seed.js
 * 2. Add this line to packages/server/src/index.js (after the other routes):
 *       app.use('/api/seed', require('./routes/seed'));
 * 3. Deploy. Wait for Render to restart (~2 min).
 * 4. Open your browser and visit:
 *       https://unilo.onrender.com/api/seed?secret=UniloSeed2025!
 * 5. You'll see a JSON response confirming what was created.
 * 6. IMMEDIATELY: delete this file from GitHub + remove the line from index.js.
 */

const express = require('express');
const router  = express.Router();
const { User, Listing, Photo } = require('../models');

const SEED_SECRET = 'UniloSeed2025!';

router.get('/', async (req, res) => {
  // ── Secret key check ──────────────────────────────────────────────────────
  if (req.query.secret !== SEED_SECRET) {
    return res.status(403).json({ error: 'Forbidden. Wrong secret key.' });
  }

  const results = { created: [], skipped: [], errors: [] };

  try {
    // ── 1. Head Admin ────────────────────────────────────────────────────────
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@unilo.ng' },
      defaults: {
        name: 'Patrick Admin',
        password_hash: 'Unilo2025!',  // auto-hashed by beforeCreate hook
        role: 'head_admin',
        phone: '+2348000000001',
      },
    });
    adminCreated
      ? results.created.push('Head admin → admin@unilo.ng / Unilo2025!')
      : results.skipped.push('Head admin already exists');

    // ── 2. Landlord ───────────────────────────────────────────────────────────
    const [landlord, landlordCreated] = await User.findOrCreate({
      where: { email: 'landlord@unilo.ng' },
      defaults: {
        name: 'Demo Landlord',
        password_hash: 'Landlord2025!',
        role: 'user_admin',
        phone: '+2348000000002',
        business_name: 'Demo Properties PH',
      },
    });
    landlordCreated
      ? results.created.push('Landlord → landlord@unilo.ng / Landlord2025!')
      : results.skipped.push('Landlord already exists');

    // ── 3. Test Listings ──────────────────────────────────────────────────────
    const listingsData = [
      {
        title: 'Clean Self Contain Near UniPort Gate',
        description: 'Cozy self-contained room just 3 minutes from the University of Port Harcourt main gate. Running water, 24/7 generator, tiled floor. Ideal for serious students.',
        price: 180000,
        price_period: 'annually',
        address: '12 Abuja Street, Choba',
        city: 'Port Harcourt',
        state: 'Rivers',
        latitude: 4.8975,
        longitude: 6.9060,
        type: 'self_contain',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['wifi', 'generator', 'water', 'security'],
        is_vacant: true,
        status: 'approved',
        landlord_id: landlord.id,
        whatsapp_number: '+2348000000002',
        distance_from_school: 250,
        photoUrls: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
        ],
      },
      {
        title: 'Spacious Room & Parlour Off Campus — Aluu',
        description: 'Large room and parlour in a quiet compound. Prepaid meter, borehole water, strong network. Perfect for 100 and 200 level students.',
        price: 250000,
        price_period: 'annually',
        address: '7 Aluu Road, Aluu',
        city: 'Port Harcourt',
        state: 'Rivers',
        latitude: 4.8910,
        longitude: 6.9120,
        type: 'room_and_parlour',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['generator', 'water', 'parking'],
        is_vacant: true,
        status: 'approved',
        landlord_id: landlord.id,
        whatsapp_number: '+2348000000002',
        distance_from_school: 1200,
        photoUrls: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
        ],
      },
      {
        title: 'Budget Hostel Room — By School Junction',
        description: 'Affordable hostel room right by the main junction. Shared bathroom, constant water supply, good security. Best option for students on a tight budget.',
        price: 80000,
        price_period: 'annually',
        address: '3 Junction Close, Choba',
        city: 'Port Harcourt',
        state: 'Rivers',
        latitude: 4.9010,
        longitude: 6.9080,
        type: 'hostel',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['water', 'security'],
        is_vacant: true,
        status: 'approved',
        landlord_id: landlord.id,
        whatsapp_number: '+2348000000002',
        distance_from_school: 400,
        photoUrls: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
          'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=600&q=80',
        ],
      },
    ];

    for (const data of listingsData) {
      try {
        const { photoUrls, ...listingFields } = data;
        const listing = await Listing.create(listingFields);

        // Create Photo records linked to listing
        for (const url of photoUrls) {
          await Photo.create({ listing_id: listing.id, url });
        }

        results.created.push(`Listing: "${listing.title}" (id: ${listing.id})`);
      } catch (err) {
        results.errors.push(`Listing "${data.title}" failed: ${err.message}`);
      }
    }

    return res.json({
      success: true,
      message: '🎉 Seed complete! DELETE THIS ROUTE NOW — remove seed.js and the app.use line in index.js.',
      ...results,
      credentials: {
        admin:    { email: 'admin@unilo.ng',    password: 'Unilo2025!',    role: 'head_admin' },
        landlord: { email: 'landlord@unilo.ng', password: 'Landlord2025!', role: 'user_admin' },
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      results,
    });
  }
});

module.exports = router;
