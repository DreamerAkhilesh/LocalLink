const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats,
  getVendors, approveVendor, rejectVendor, revokeVendor,
  getProducts, approveProduct, rejectProduct,
  getServices, approveService, rejectService,
  getUsers,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// Stats
router.get('/stats', getStats);

// Vendors
router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/revoke', revokeVendor);

// Products
router.get('/products', getProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

// Services
router.get('/services', getServices);
router.put('/services/:id/approve', approveService);
router.put('/services/:id/reject', rejectService);

// Users
router.get('/users', getUsers);

module.exports = router;
