const mongoose = require('mongoose');

/**
 * Vendor Profile Schema - Extended information for vendors/service providers
 * Links to User model for authentication and basic info
 */
const vendorProfileSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Business Information
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String,
    enum: ['shop', 'service'],
    required: [true, 'Business type is required']
  },
  
  // Categories
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Shop categories
      'grocery', 'clothing', 'electronics', 'pharmacy', 'stationery', 'bakery', 'other-shop',
      // Service categories
      'plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'mechanic', 'tutor', 'other-service'
    ]
  },
  
  // Business Description
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  
  // Business Images
  businessImages: [{
    type: String
  }],
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String
  }],
  
  // Business Metrics
  totalOrders: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Service Area (for service providers)
  serviceRadius: {
    type: Number, // in kilometers
    default: 5,
    min: 1,
    max: 50
  }
}, {
  timestamps: true
});

// Indexes for better performance
vendorProfileSchema.index({ user: 1 });
vendorProfileSchema.index({ category: 1 });
vendorProfileSchema.index({ businessType: 1 });
vendorProfileSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for getting user details
vendorProfileSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
vendorProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);