const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getVendorServices
} = require('../controllers/serviceController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateService,
  validateServiceUpdate
} = require('../utils/validation');

const router = express.Router();

/**
 * @route   GET /api/services
 * @desc    Get all services with filters
 * @access  Public
 */
router.get('/', optionalAuth, getServices);

/**
 * @route   GET /api/services/vendor/my-services
 * @desc    Get vendor's services
 * @access  Private/Vendor
 */
router.get('/vendor/my-services', authenticate, authorize('vendor'), getVendorServices);

/**
 * @route   GET /api/services/:id
 * @desc    Get single service by ID
 * @access  Public
 */
router.get('/:id', getService);

/**
 * @route   POST /api/services
 * @desc    Create new service (Vendor only)
 * @access  Private/Vendor
 */
router.post('/', authenticate, authorize('vendor'), validateService, createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Update service (Vendor only)
 * @access  Private/Vendor
 */
router.put('/:id', authenticate, authorize('vendor'), validateServiceUpdate, updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service (Vendor only)
 * @access  Private/Vendor
 */
router.delete('/:id', authenticate, authorize('vendor'), deleteService);

module.exports = router;