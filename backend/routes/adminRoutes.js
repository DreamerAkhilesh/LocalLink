const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats, getVendors, approveVendor, rejectVendor,
  getProducts, approveProduct, rejectProduct,
  getServices, approveService, rejectService,
  getUsers
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

module.exports = router;
