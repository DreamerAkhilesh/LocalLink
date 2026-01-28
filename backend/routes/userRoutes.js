const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'User management routes - Coming soon!'
  });
});

module.exports = router;