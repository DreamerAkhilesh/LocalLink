const express = require('express');
const {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateOrder } = require('../utils/validation');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order (Customer only)
 * @access  Private/Customer
 */
router.post('/', authenticate, authorize('customer'), validateOrder, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get customer orders
 * @access  Private/Customer
 */
router.get('/', authenticate, authorize('customer'), getCustomerOrders);

/**
 * @route   GET /api/orders/vendor
 * @desc    Get vendor orders
 * @access  Private/Vendor
 */
router.get('/vendor', authenticate, authorize('vendor'), getVendorOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', authenticate, getOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Vendor only)
 * @access  Private/Vendor
 */
router.put('/:id/status', authenticate, authorize('vendor'), updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', authenticate, cancelOrder);

module.exports = router;