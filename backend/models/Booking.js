const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking identification
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Relationships
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  
  // Service details (snapshot at booking time)
  serviceDetails: {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    duration: Number, // in minutes
    category: String
  },
  
  // Booking scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true // Format: "HH:MM" (24-hour format)
  },
  estimatedEndTime: {
    type: String // Calculated based on duration
  },
  
  // Booking details
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Customer information
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  
  // Booking location
  serviceLocation: {
    type: String,
    enum: ['customer-location', 'vendor-location', 'online'],
    required: true
  },
  
  // Service address (if at customer location)
  serviceAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    instructions: String
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'pay-at-service'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partially-paid', 'refunded'],
    default: 'unpaid'
  },
  
  // Booking status
  status: {
    type: String,
    enum: [
      'pending',        // Just booked, awaiting vendor confirmation
      'confirmed',      // Vendor confirmed the booking
      'rescheduled',    // Booking time changed
      'in-progress',    // Service is currently being provided
      'completed',      // Service completed successfully
      'cancelled',      // Cancelled by customer or vendor
      'no-show',        // Customer didn't show up
      'refunded'        // Payment refunded
    ],
    default: 'pending'
  },
  
  // Status tracking
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
      type: String,
      enum: ['customer', 'vendor', 'system']
    }
  }],
  
  // Additional information
  specialRequests: String,
  notes: String,
  
  // Vendor notes (private)
  vendorNotes: String,
  
  // Service completion details
  serviceStartTime: Date,
  serviceEndTime: Date,
  actualDuration: Number, // in minutes
  
  // Rating and feedback (after completion)
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  vendorResponse: String,
  
  // Timestamps
  bookingDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ customer: 1, bookingDate: -1 });
bookingSchema.index({ vendor: 1, scheduledDate: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ scheduledDate: 1, scheduledTime: 1 });

// Pre-save middleware to update timestamps
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate estimated end time based on duration
  if (this.scheduledTime && this.serviceDetails.duration) {
    const [hours, minutes] = this.scheduledTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.serviceDetails.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    this.estimatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }
  
  next();
});

// Static method to generate booking number
bookingSchema.statics.generateBookingNumber = async function() {
  const count = await this.countDocuments();
  return `BKG${Date.now()}${String(count + 1).padStart(4, '0')}`;
};

// Instance method to add status history
bookingSchema.methods.addStatusHistory = function(status, note = '', updatedBy = 'system') {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy
  });
  
  // Update completion/cancellation timestamps
  if (status === 'completed') {
    this.completedAt = new Date();
  } else if (status === 'cancelled') {
    this.cancelledAt = new Date();
  }
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const nonCancellableStatuses = ['completed', 'cancelled', 'refunded', 'in-progress'];
  return !nonCancellableStatuses.includes(this.status);
};

// Instance method to check if booking can be rescheduled
bookingSchema.methods.canBeRescheduled = function() {
  const nonReschedulableStatuses = ['completed', 'cancelled', 'refunded', 'in-progress'];
  return !nonReschedulableStatuses.includes(this.status);
};

// Virtual for booking display name
bookingSchema.virtual('displayName').get(function() {
  return `${this.serviceDetails.name} - ${this.bookingNumber}`;
});

// Virtual for formatted scheduled datetime
bookingSchema.virtual('scheduledDateTime').get(function() {
  const date = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Virtual for time until service
bookingSchema.virtual('timeUntilService').get(function() {
  const now = new Date();
  const scheduled = this.scheduledDateTime;
  const diffMs = scheduled - now;
  
  if (diffMs < 0) return 'Past due';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day(s)`;
  if (diffHours > 0) return `${diffHours} hour(s)`;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes} minute(s)`;
});

module.exports = mongoose.model('Booking', bookingSchema);