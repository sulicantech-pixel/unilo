const router = require('express').Router();
const { Listing, User, Transaction, Photo } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { QueryTypes } = require('sequelize');

// All admin routes require head_admin
router.use(authenticate, requireRole('head_admin'));

// ... [rest of the code above]
{
  "universities": [
    { "name": "University of Lagos", "student_count": 45, "listing_count": 12 },
    { "name": "Covenant University", "student_count": 32, "listing_count": 8 },
    ...
  ],
  "clusters": {
    "total_clusters": 8,
    "active_clusters": 6,
    "total_students_in_clusters": 24
  },
  "funnel": {
    "total_searches": 342,
    "total_views": 118,
    "unique_viewers": 67,
    "active_listings": 34
  }
}
