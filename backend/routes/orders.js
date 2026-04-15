const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// POST /api/orders - public (guest checkout)
router.post('/', async (req, res) => {
  try {
    const { customer, items, notes } = req.body;

    if (!customer || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer info and items are required' });
    }

    // Compute pricing server-side
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      const basePrice = product.discountedPrice || product.basePrice;
      const customizationCost = product.customizationCost || 0;
      const totalPrice = (basePrice + customizationCost) * (item.quantity || 1);
      subtotal += totalPrice;

      resolvedItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        size: item.size,
        colorVariant: item.colorVariant,
        quantity: item.quantity || 1,
        basePrice,
        customizationCost,
        totalPrice,
        customizations: item.customizations || []
      });
    }

    const shippingCost = subtotal > 1500 ? 0 : 99; // Free shipping above ₹1500
    const total = subtotal + shippingCost;

    const order = new Order({
      customer,
      items: resolvedItems,
      subtotal,
      shippingCost,
      total,
      notes
    });

    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        message: 'Your order has been placed! We will contact you shortly.'
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:orderNumber - public (track by order number + email)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { email } = req.query;
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber.toUpperCase(),
      'customer.email': email
    }).populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found. Check your order number and email.' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// GET /api/orders - admin
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id - admin
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:id/status - admin
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, adminNotes, trackingNumber, estimatedDelivery } = req.body;
    const update = { status };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (estimatedDelivery) update.estimatedDelivery = estimatedDelivery;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;