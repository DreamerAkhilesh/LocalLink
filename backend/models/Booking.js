const mongoose = require('mongoose');

/**
 * Booking Schema - For service appointments
 * Handles service booking lifecycle from request to completion
 */
const bookingSchema = new mongoose.Schema({
  // Booking Identification
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Service Provider Information
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile',
    required: true
  },
  
  // Service Information
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  
  // Booking Details
  serviceTitle: {
    type: String,
    required: true
  },
  serviceDescription: String,
  
  // Pricing
  basePrice: {
    type: Number,
    required: true,
    min: [0, 'Base price cannot be negative']
  },
  additionalCharges: {
    type: Number,
    default: 0,
    min: [0, 'Additional charges cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time in HH:MM format']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  
  // Service Address
  serviceAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    landmark: String
  },
  
  // Booking Status Management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  
  // Status Timeline
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash-on-service', 'pay-at-shop'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  
  // Service Requirements
  requirements: {
    materialsNeeded: [{
      item: String,
      quantity: String,
      providedBy: {
        type: String,
        enum: ['customer', 'provider'],
        default: 'provider'
      }
    }],
    specialInstructions: {
      type: String,
      maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
    },
    accessInstructions: {
      type: String,
      maxlength: [500, 'Access instructions cannot exceed 500 characters']
    }
  },
  
  // Timing
  bookingDate: {
    type: Date,
    default: Date.now
  },
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Rescheduling
  rescheduleHistory: [{
    originalDate: Date,
    originalTime: String,
    newDate: Date,
    newTime: String,
    reason: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
  // Service Completion
  workDescription: {
    type: String,
    maxlength: [1000, 'Work description cannot exceed 1000 characters']
  },
  beforeImages: [{
    type: String
  }],
  afterImages: [{
    type: String
  }],
  
  // Review & Rating
  isReviewed: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ customer: 1 });
bookingSchema.index({ serviceProvider: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ bookingDate: -1 });
bookingSchema.index({ paymentStatus: 1 });

// Generate booking number before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `BKG${Date.now()}${String(count + 1).padStart(4, '0')}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Booking requested'
    });
  }
  next();
});

// Calculate total amount before saving
bookingSchema.pre('save', function(next) {
  this.totalAmount = this.basePrice + this.additionalCharges - this.discount;
  next();
});

// Method to update booking status
bookingSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note,
    updatedBy: updatedBy
  });
  
  // Set timing based on status
  if (newStatus === 'in-progress') {
    this.actualStartTime = new Date();
  } else if (newStatus === 'completed') {
    this.actualEndTime = new Date();
  }
  
  return this.save();
};

// Method to reschedule booking
bookingSchema.methods.reschedule = function(newDate, newTime, reason, requestedBy) {
  // Add to reschedule history
  this.rescheduleHistory.push({
    originalDate: this.scheduledDate,
    originalTime: this.scheduledTime,
    newDate: newDate,
    newTime: newTime,
    reason: reason,
    requestedBy: requestedBy
  });
  
  // Update scheduled date and time
  this.scheduledDate = newDate;
  this.scheduledTime = newTime;
  this.status = 'rescheduled';
  
  // Add to status history
  this.statusHistory.push({
    status: 'rescheduled',
    timestamp: new Date(),
    note: `Rescheduled: ${reason}`,
    updatedBy: requestedBy
  });
  
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);