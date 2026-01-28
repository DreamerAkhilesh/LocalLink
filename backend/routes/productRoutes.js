const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts
} = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateProduct,
  validateProductUpdate
} = require('../utils/validation');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', optionalAuth, getProducts);

/**
 * @route   GET /api/products/vendor/my-products
 * @desc    Get vendor's products
 * @access  Private/Vendor
 */
router.get('/vendor/my-products', authenticate, authorize('vendor'), getVendorProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', getProduct);

/**
 * @route   POST /api/products
 * @desc    Create new product (Vendor only)
 * @access  Private/Vendor
 */
router.post('/', authenticate, authorize('vendor'), validateProduct, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (Vendor only)
 * @access  Private/Vendor
 */
router.put('/:id', authenticate, authorize('vendor'), validateProductUpdate, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (Vendor only)
 * @access  Private/Vendor
 */
router.delete('/:id', authenticate, authorize('vendor'), deleteProduct);

module.exports = router;