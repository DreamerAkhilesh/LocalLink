const mongoose = require('mongoose');

/**
 * Service Schema - For service providers to list their services
 * Supports pricing, availability, and service area management
 */
const serviceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Service title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Service Provider Information
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile',
    required: true
  },
  
  // Category & Classification
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
      'appliance-repair', 'ac-repair', 'computer-repair', 'mobile-repair',
      'home-maintenance', 'gardening', 'pest-control',
      'tutoring', 'music-lessons', 'fitness-training',
      'beauty-services', 'massage', 'healthcare',
      'photography', 'event-planning', 'catering',
      'transportation', 'delivery', 'moving',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Pricing Structure
  pricingType: {
    type: String,
    enum: ['fixed', 'hourly', 'per-visit', 'negotiable'],
    required: [true, 'Pricing type is required']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceUnit: {
    type: String,
    enum: ['per-hour', 'per-visit', 'per-project', 'per-day'],
    required: [true, 'Price unit is required']
  },
  
  // Service Details
  duration: {
    estimated: {
      type: Number, // in minutes
      required: [true, 'Estimated duration is required']
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'hours'
    }
  },
  
  // Service Images
  images: [{
    type: String
  }],
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    timeSlots: [{
      startTime: String, // Format: "09:00"
      endTime: String,   // Format: "17:00"
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  
  // Service Area
  serviceArea: {
    radius: {
      type: Number, // in kilometers
      default: 5,
      min: [1, 'Service radius must be at least 1 km'],
      max: [50, 'Service radius cannot exceed 50 km']
    },
    specificAreas: [{
      type: String // Specific localities/areas
    }]
  },
  
  // Requirements & Specifications
  requirements: {
    materialsIncluded: {
      type: Boolean,
      default: false
    },
    toolsRequired: [{
      type: String
    }],
    specialRequirements: {
      type: String,
      maxlength: [500, 'Special requirements cannot exceed 500 characters']
    }
  },
  
  // Service Features
  features: [{
    type: String,
    trim: true
  }],
  
  // SEO & Search
  tags: [{
    type: String,
    trim: true
  }],
  
  // Metrics
  viewCount: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending-approval', 'rejected'],
    default: 'active'
  },
  
  // Emergency Service
  isEmergencyService: {
    type: Boolean,
    default: false
  },
  emergencyCharges: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
serviceSchema.index({ provider: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ isAvailable: 1, status: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ 'serviceArea.radius': 1 });

// Virtual for getting provider details
serviceSchema.virtual('providerDetails', {
  ref: 'VendorProfile',
  localField: 'provider',
  foreignField: '_id',
  justOne: true
});

// Method to check if service is available on a specific day and time
serviceSchema.methods.isAvailableAt = function(day, time) {
  if (!this.isAvailable) return false;
  
  const daySlot = this.availableSlots.find(slot => slot.day === day.toLowerCase());
  if (!daySlot) return false;
  
  return daySlot.timeSlots.some(slot => {
    const startTime = parseInt(slot.startTime.replace(':', ''));
    const endTime = parseInt(slot.endTime.replace(':', ''));
    const checkTime = parseInt(time.replace(':', ''));
    
    return slot.isAvailable && checkTime >= startTime && checkTime <= endTime;
  });
};

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);