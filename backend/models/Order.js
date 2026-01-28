const mongoose = require('mongoose');

/**
 * Order Schema - For product purchases
 * Handles order lifecycle from placement to completion
 */
const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
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
  
  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile',
    required: true
  },
  
  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  }],
  
  // Order Summary
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryCharges: {
    type: Number,
    default: 0,
    min: [0, 'Delivery charges cannot be negative']
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
  
  // Delivery Information
  deliveryAddress: {
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
  
  // Delivery Options
  deliveryType: {
    type: String,
    enum: ['home-delivery', 'self-pickup'],
    required: true
  },
  
  // Order Status Management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'returned'],
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
    enum: ['cash-on-delivery', 'pay-at-shop'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  
  // Timing
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Special Instructions
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
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
orderSchema.index({ customer: 1 });
orderSchema.index({ vendor: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ paymentStatus: 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order placed'
    });
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.deliveryCharges - this.discount;
  
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note,
    updatedBy: updatedBy
  });
  
  // Set delivery date if delivered
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);