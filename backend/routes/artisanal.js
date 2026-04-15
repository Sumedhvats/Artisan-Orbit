const express = require('express');
const router = express.Router();
const ArtisanalRequest = require('../models/ArtisanalRequest');
const { protect } = require('../middleware/auth');

// POST /api/artisanal-requests -> Public route to submit request
router.post('/', async (req, res, next) => {
  try {
    const { productType, productImage, name, email, whatsapp, description } = req.body;
    
    if (!productType || !productImage || !name || !email || !whatsapp || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const request = await ArtisanalRequest.create({
      productType,
      productImage,
      name,
      email,
      whatsapp,
      description
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// GET /api/artisanal-requests -> Admin route to view requests
router.get('/', protect, async (req, res, next) => {
  try {
    const requests = await ArtisanalRequest.find().sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// PUT /api/artisanal-requests/:id/status -> Admin route to update request status
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await ArtisanalRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/artisanal-requests/:id -> Admin route to delete a request
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const request = await ArtisanalRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
