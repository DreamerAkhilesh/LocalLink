const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  getVendorBookingStats
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createBookingValidation = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID'),
  
  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  
  body('serviceLocation')
    .notEmpty()
    .withMessage('Service location is required')
    .isIn(['customer-location', 'vendor-location', 'online'])
    .withMessage('Invalid service location'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'online', 'pay-at-service'])
    .withMessage('Invalid payment method'),
  
  body('customerInfo.name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters'),
  
  body('customerInfo.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('customerInfo.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('serviceAddress.street')
    .if(body('serviceLocation').equals('customer-location'))
    .notEmpty()
    .withMessage('Street address is required for customer location service'),
  
  body('serviceAddress.city')
    .if(body('serviceLocation').equals('customer-location'))
    .notEmpty()
    .withMessage('City is required for customer location service'),
  
  body('serviceAddress.pincode')
    .if(body('serviceLocation').equals('customer-location'))
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'rescheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'refunded'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const rescheduleValidation = [
  body('scheduledDate')
    .notEmpty()
    .withMessage('New scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('scheduledTime')
    .notEmpty()
    .withMessage('New scheduled time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const cancelValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Customer routes
router.post('/', authenticate, authorize('customer'), ...createBookingValidation, createBooking);
router.get('/', authenticate, getCustomerBookings);

// Vendor routes
router.get('/vendor', authenticate, authorize('vendor'), getVendorBookings);
router.get('/vendor/stats', authenticate, authorize('vendor'), getVendorBookingStats);

// Shared routes (customer and vendor)
router.get('/:id', authenticate, getBooking);
router.put('/:id/status', authenticate, authorize('vendor'), ...updateStatusValidation, updateBookingStatus);
router.put('/:id/cancel', authenticate, ...cancelValidation, cancelBooking);
router.put('/:id/reschedule', authenticate, ...rescheduleValidation, rescheduleBooking);

module.exports = router;