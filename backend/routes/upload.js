const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// POST /api/upload/product - admin: upload product images
router.post('/product', protect, (req, res, next) => {
  req.uploadFolder = 'uploads/products';
  next();
}, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const urls = req.files.map(f => `/uploads/products/${f.filename}`);
  res.json({ success: true, urls });
});

// POST /api/upload/category - admin: upload category image
router.post('/category', protect, (req, res, next) => {
  req.uploadFolder = 'uploads/categories';
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, url: `/uploads/categories/${req.file.filename}` });
});

// POST /api/upload/customization - public: user uploads their custom photo (for tshirt/shoe)
router.post('/customization', (req, res, next) => {
  req.uploadFolder = 'uploads/customizations';
  next();
}, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `/uploads/customizations/${req.file.filename}`,
    filename: req.file.filename
  });
});

// Error handler for multer
router.use((err, req, res, next) => {
  res.status(400).json({ success: false, message: err.message });
});

module.exports = router;