const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ArtisanalRequest = require('../models/ArtisanalRequest');
const { protect } = require('../middleware/auth');

// GET /api/admin/dashboard - stats overview
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      inProductionOrders,
      shippedOrders,
      totalProducts,
      totalCategories,
      recentOrders,
      totalArtisanalRequests,
      pendingArtisanalRequests
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'in-production' }),
      Order.countDocuments({ status: 'shipped' }),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Order.find().sort('-createdAt').limit(5).populate('items.product', 'name images'),
      ArtisanalRequest.countDocuments(),
      ArtisanalRequest.countDocuments({ status: 'pending' })
    ]);

    // Revenue calculation
    const revenueData = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          inProductionOrders,
          shippedOrders,
          totalProducts,
          totalCategories,
          totalRevenue,
          totalArtisanalRequests,
          pendingArtisanalRequests
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;