const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats, getVendors, approveVendor, rejectVendor,
  getProducts, approveProduct, rejectProduct,
  getServices, approveService, rejectService,
  getUsers,
  getRiders, approveRider, rejectRider,
  assignRider, getAvailableRiders
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);

router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);

router.get('/products', getProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

router.get('/services', getServices);
router.put('/services/:id/approve', approveService);
router.put('/services/:id/reject', rejectService);

router.get('/users', getUsers);

// Rider management
router.get('/riders', getRiders);
router.get('/riders/available', getAvailableRiders);
router.put('/riders/:id/approve', approveRider);
router.put('/riders/:id/reject', rejectRider);

// Assign rider to order
router.put('/orders/:id/assign-rider', assignRider);

// List orders (for assignment page)
router.get('/orders', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, data: { orders, total } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

module.exports = router;
