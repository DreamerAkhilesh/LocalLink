const express = require('express');
const {
  getMe,
  updateLocation,
  toggleAvailability,
  getMyOrders,
  getActiveOrder,
  acceptOrder,
  markPickedUp,
  startDelivery,
  markDelivered,
  getStats
} = require('../controllers/riderController');
const { authenticate, authorize, requireVerifiedRider } = require('../middleware/auth');

const router = express.Router();

// All rider routes require authentication + rider role
router.use(authenticate, authorize('rider'));

// Profile & status
router.get('/me', getMe);
router.get('/stats', getStats);
router.put('/location', updateLocation);
router.put('/toggle-availability', toggleAvailability);

// Orders
router.get('/orders', getMyOrders);
router.get('/orders/active', getActiveOrder);

// Delivery flow (requires verified rider)
router.put('/orders/:id/accept',         requireVerifiedRider, acceptOrder);
router.put('/orders/:id/picked-up',      requireVerifiedRider, markPickedUp);
router.put('/orders/:id/start-delivery', requireVerifiedRider, startDelivery);
router.put('/orders/:id/delivered',      requireVerifiedRider, markDelivered);

module.exports = router;
