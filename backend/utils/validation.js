const { body } = require('express-validator');

const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('role').optional().isIn(['customer', 'vendor', 'rider']).withMessage('Role must be customer, vendor, or rider'),
  body('address.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('address.pincode').matches(/^[0-9]{6}$/).withMessage('Please enter a valid 6-digit pincode'),
  body('businessInfo.businessName')
    .if(body('role').equals('vendor')).trim().isLength({ min: 2, max: 100 })
    .withMessage('Business name is required for vendors (2-100 characters)'),
  body('businessInfo.businessType')
    .if(body('role').equals('vendor')).isIn(['shop', 'service'])
    .withMessage('Business type must be either shop or service'),
  body('businessInfo.category')
    .if(body('role').equals('vendor')).notEmpty()
    .withMessage('Category is required for vendors'),
  // Rider-specific validations
  body('riderInfo.vehicleType')
    .if(body('role').equals('rider')).isIn(['bike', 'cycle', 'scooter', 'car'])
    .withMessage('Vehicle type is required for riders')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain uppercase, lowercase, and a number')
];

const validateProduct = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('unit').isIn(['piece', 'kg', 'gram', 'liter', 'ml', 'packet', 'box', 'dozen']).withMessage('Invalid unit'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs')
];

const validateProductUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('unit').optional().isIn(['piece', 'kg', 'gram', 'liter', 'ml', 'packet', 'box', 'dozen']).withMessage('Invalid unit'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs')
];

const validateService = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Service title must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('pricingType').isIn(['fixed', 'hourly', 'per-visit', 'negotiable']).withMessage('Invalid pricing type'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('priceUnit').isIn(['per-hour', 'per-visit', 'per-project', 'per-day']).withMessage('Invalid price unit'),
  body('duration.estimated').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute')
];

const validateServiceUpdate = [
  body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Service title must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('pricingType').optional().isIn(['fixed', 'hourly', 'per-visit', 'negotiable']).withMessage('Invalid pricing type'),
  body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('priceUnit').optional().isIn(['per-hour', 'per-visit', 'per-project', 'per-day']).withMessage('Invalid price unit'),
  body('duration.estimated').optional().isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute')
];

const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryType').isIn(['home-delivery', 'self-pickup']).withMessage('Invalid delivery type'),
  body('paymentMethod').isIn(['cash-on-delivery', 'pay-at-shop']).withMessage('Invalid payment method'),
  body('deliveryAddress.name')
    .if(body('deliveryType').equals('home-delivery')).trim().notEmpty()
    .withMessage('Delivery name is required for home delivery'),
  body('deliveryAddress.phone')
    .if(body('deliveryType').equals('home-delivery')).matches(/^[0-9]{10}$/)
    .withMessage('Valid phone number is required for home delivery'),
  body('deliveryAddress.street')
    .if(body('deliveryType').equals('home-delivery')).trim().notEmpty()
    .withMessage('Street address is required for home delivery'),
  body('deliveryAddress.city')
    .if(body('deliveryType').equals('home-delivery')).trim().notEmpty()
    .withMessage('City is required for home delivery'),
  body('deliveryAddress.pincode')
    .if(body('deliveryType').equals('home-delivery')).matches(/^[0-9]{6}$/)
    .withMessage('Valid pincode is required for home delivery')
];

const validateBooking = [
  body('service').isMongoId().withMessage('Invalid service ID'),
  body('scheduledDate').isISO8601().withMessage('Invalid scheduled date'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (use HH:MM)'),
  body('paymentMethod').isIn(['cash-on-service', 'pay-at-shop']).withMessage('Invalid payment method'),
  body('serviceAddress.name').trim().notEmpty().withMessage('Contact name is required'),
  body('serviceAddress.phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number is required'),
  body('serviceAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('serviceAddress.city').trim().notEmpty().withMessage('City is required'),
  body('serviceAddress.pincode').matches(/^[0-9]{6}$/).withMessage('Valid pincode is required')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateProduct,
  validateProductUpdate,
  validateService,
  validateServiceUpdate,
  validateOrder,
  validateBooking
};
