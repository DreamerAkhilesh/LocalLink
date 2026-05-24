const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Cloudinary configuration ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer → Cloudinary storage ─────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'locallink',          // images go into a "locallink" folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|webp|gif)$/i;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * POST /api/upload
 * Upload a single image to Cloudinary.
 * Returns { success, data: { url } } — a full HTTPS Cloudinary URL stored in product/service images array.
 */
router.post('/', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file received.' });
  }

  // req.file.path is the full Cloudinary HTTPS URL when using CloudinaryStorage
  const url = req.file.path;
  res.json({ success: true, data: { url, filename: req.file.filename } });
});

// Multer / Cloudinary error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB.' : err.message;
    return res.status(400).json({ success: false, message: msg });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
});

module.exports = router;
