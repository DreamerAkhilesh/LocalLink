const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get user orders
 * @access  Private
 */
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Order routes - Coming soon!'
  });
});

/**
 * @route   POST /api/orders
 * @desc    Create new order (Customer only)
 * @access  Private/Customer
 */
router.post('/', authenticate, authorize('customer'), (req, res) => {
  res.json({
    success: true,
    message: 'Create order - Coming soon!'
  });
});

module.exports = router;