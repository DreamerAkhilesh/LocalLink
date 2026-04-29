const mongoose = require('mongoose');

/**
 * RiderProfile Schema - For delivery partners
 * Handles rider information, availability, and location tracking
 */
const riderProfileSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Availability Status
  isAvailable: {
    type: Boolean,
    default: false
  },
  
  // Current Location (GeoJSON Point for geo queries)
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      default: ''
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Vehicle Information
  vehicleType: {
    type: String,
    enum: ['bike', 'cycle', 'scooter', 'car'],
    required: [true, 'Vehicle type is required']
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationNote: {
    type: String,
    default: ''
  },
  verificationDocuments: [{
    type: String, // URLs to uploaded documents
    url: String
  }],
  
  // Rider Status
  status: {
    type: String,
    enum: ['offline', 'idle', 'assigned', 'delivering'],
    default: 'offline'
  },
  
  // Current Assignment
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  
  // Performance Metrics
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  cancelledDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Earnings (basic placeholder)
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
riderProfileSchema.index({ user: 1 });
riderProfileSchema.index({ isAvailable: 1, status: 1 });
riderProfileSchema.index({ currentLocation: '2dsphere' }); // Geospatial index for location queries
riderProfileSchema.index({ isVerified: 1 });

// Method to update location
riderProfileSchema.methods.updateLocation = function(lat, lng, address = '') {
  this.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],
    address: address,
    lastUpdated: new Date()
  };
  return this.save();
};

// Method to toggle availability
riderProfileSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  if (!this.isAvailable) {
    this.status = 'offline';
  } else if (this.status === 'offline') {
    this.status = 'idle';
  }
  return this.save();
};

// Method to update status
riderProfileSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Virtual for getting user details
riderProfileSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
riderProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('RiderProfile', riderProfileSchema);
