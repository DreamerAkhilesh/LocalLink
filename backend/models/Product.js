const mongoose = require('mongoose');

/**
 * Product Schema - For shop owners to list their products
 * Supports inventory management and pricing
 */
const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile',
    required: true
  },
  
  // Category & Classification
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'groceries', 'vegetables', 'fruits', 'dairy', 'bakery',
      'clothing', 'footwear', 'accessories',
      'electronics', 'mobile', 'computers',
      'pharmacy', 'medicines', 'health',
      'stationery', 'books', 'office',
      'home-appliances', 'furniture',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  
  // Inventory
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'kg', 'gram', 'liter', 'ml', 'packet', 'box', 'dozen']
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  
  // Product Images
  images: [{
    type: String,
    required: true
  }],
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availabilityStatus: {
    type: String,
    enum: ['in-stock', 'out-of-stock', 'limited-stock'],
    default: 'in-stock'
  },
  
  // Product Specifications
  specifications: {
    brand: String,
    model: String,
    color: String,
    size: String,
    weight: String,
    dimensions: String,
    material: String,
    expiryDate: Date,
    manufacturingDate: Date
  },
  
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
  orderCount: {
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
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ isAvailable: 1, status: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for calculating discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Update availability status based on stock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.availabilityStatus = 'out-of-stock';
    this.isAvailable = false;
  } else if (this.stock <= 5) {
    this.availabilityStatus = 'limited-stock';
    this.isAvailable = true;
  } else {
    this.availabilityStatus = 'in-stock';
    this.isAvailable = true;
  }
  next();
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);