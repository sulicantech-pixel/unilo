const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Photo, Listing } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'unilo/listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'));
    }
    cb(null, true);
  },
});

// ── POST /api/upload/photos/:listingId ────────────────────────────────────────
router.post(
  '/photos/:listingId',
  authenticate,
  requireRole('user_admin', 'head_admin'),
  upload.array('photos', 10),
  async (req, res) => {
    try {
      const listing = await Listing.findByPk(req.params.listingId);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });

      const isOwner     = listing.landlord_id === req.user.id;
      const isHeadAdmin = req.user.role === 'head_admin';
      if (!isOwner && !isHeadAdmin) {
        return res.status(403).json({ error: 'Not your listing' });
      }

      const existingCount = await Photo.count({ where: { listing_id: listing.id } });

      const photos = await Promise.all(
        req.files.map((file, i) =>
          Photo.create({
            listing_id:    listing.id,
            url:           file.path,
            cloudinary_id: file.filename,
            is_cover:      existingCount === 0 && i === 0,
            order_index:   existingCount + i,
          })
        )
      );

      res.status(201).json(photos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

// ── DELETE /api/upload/photos/:photoId ────────────────────────────────────────
router.delete('/photos/:photoId', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Delete from Cloudinary
    if (photo.cloudinary_id) {
      await cloudinary.uploader.destroy(photo.cloudinary_id);
    }

    await photo.destroy();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ── PATCH /api/upload/photos/:photoId/cover ───────────────────────────────────
router.patch('/photos/:photoId/cover', authenticate, requireRole('user_admin', 'head_admin'), async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Unset all other covers for this listing
    await Photo.update({ is_cover: false }, { where: { listing_id: photo.listing_id } });
    await photo.update({ is_cover: true });

    res.json({ message: 'Cover photo updated', photo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cover' });
  }
});

module.exports = router;
