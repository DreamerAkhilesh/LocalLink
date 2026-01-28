const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/bookings
 * @desc    Get user bookings
 * @access  Private
 */
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Booking routes - Coming soon!'
  });
});

/**
 * @route   POST /api/bookings
 * @desc    Create new booking (Customer only)
 * @access  Private/Customer
 */
router.post('/', authenticate, authorize('customer'), (req, res) => {
  res.json({
    success: true,
    message: 'Create booking - Coming soon!'
  });
});

module.exports = router;