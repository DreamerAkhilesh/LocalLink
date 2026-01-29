const Order = require('../models/Order');
const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const { validationResult } = require('express-validator');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private/Customer
 */
const createOrder = async (req, res) => {
  try {
    console.log('🛒 Creating order with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, deliveryType, paymentMethod, deliveryAddress, notes } = req.body;

    // Group items by vendor
    const itemsByVendor = {};
    for (const item of items) {
      const product = await Product.findById(item.product).populate('vendor');
      
      console.log('Processing item:', {
        productId: item.product,
        found: !!product,
        isAvailable: product?.isAvailable,
        status: product?.status,
        stock: product?.stock,
        requestedQuantity: item.quantity
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (!product.isAvailable || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is no longer available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const vendorId = product.vendor._id.toString();
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = {
          vendor: product.vendor,
          items: [],
          total: 0
        };
      }

      const itemTotal = product.price * item.quantity;
      itemsByVendor[vendorId].items.push({
        product: product._id,
        vendor: product.vendor._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        total: itemTotal
      });
      itemsByVendor[vendorId].total += itemTotal;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    console.log('Items by vendor:', Object.keys(itemsByVendor));
    
    // Create separate orders for each vendor
    const createdOrders = [];
    for (const [vendorId, vendorData] of Object.entries(itemsByVendor)) {
      console.log('Processing vendor order creation...');
      
      console.log('Creating order for vendor:', {
        vendorId,
        vendorData: {
          vendor: vendorData.vendor._id,
          itemsCount: vendorData.items.length,
          total: vendorData.total
        }
      });
      
      try {
        // Generate order number manually
        console.log('Generating order number...');
        const orderCount = await Order.countDocuments();
        console.log('Order count:', orderCount);
        const orderNumber = `ORD${Date.now()}${String(orderCount + 1).padStart(4, '0')}`;
        console.log('Generated order number:', orderNumber);
      
        const orderData = {
          orderNumber,
          customer: req.user.id,
          vendor: vendorId,
          items: vendorData.items,
          subtotal: vendorData.total,
          totalAmount: vendorData.total,
          deliveryType,
          paymentMethod,
          status: 'pending',
          paymentStatus: 'unpaid',
          statusHistory: [{
            status: 'pending',
            timestamp: new Date(),
            note: 'Order placed'
          }],
          notes: notes || ''
        };

        // Add delivery address if home delivery
        if (deliveryType === 'home-delivery' && deliveryAddress) {
          orderData.deliveryAddress = deliveryAddress;
        }

        console.log('Order data before creation:', JSON.stringify(orderData, null, 2));
        
        const order = new Order(orderData);
        await order.save();

        // Populate order for response
        await order.populate([
          { path: 'customer', select: 'name email phone' },
          { path: 'vendor', select: 'businessName phone email address' },
          { path: 'items.product', select: 'name images' }
        ]);

        createdOrders.push(order);
        
      } catch (error) {
        console.error('Error creating individual order:', error);
        throw error;
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} order(s) placed successfully`,
      data: { orders: createdOrders }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

/**
 * @desc    Get customer orders
 * @route   GET /api/orders
 * @access  Private/Customer
 */
const getCustomerOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { customer: req.user.id };
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'vendor', select: 'businessName phone email address' },
        { path: 'items.product', select: 'name images' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + orders.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

/**
 * @desc    Get vendor orders
 * @route   GET /api/orders/vendor
 * @access  Private/Vendor
 */
const getVendorOrders = async (req, res) => {
  try {
    // Get vendor profile
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter - find orders for this vendor
    const filter = { vendor: vendorProfile._id };
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate([
        { path: 'customer', select: 'name email phone address' },
        { path: 'vendor', select: 'businessName phone email address' },
        { path: 'items.product', select: 'name images' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + orders.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'customer', select: 'name email phone address' },
        { path: 'vendor', select: 'businessName phone email address' },
        { path: 'items.product', select: 'name images description' }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    const isCustomer = order.customer._id.toString() === req.user.id;
    let isVendor = false;
    
    if (req.user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
      isVendor = vendorProfile && 
        order.vendor._id.toString() === vendorProfile._id.toString();
    }

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Vendor
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get vendor profile
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if vendor has access to this order
    const hasAccess = order.vendor.toString() === vendorProfile._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    order.status = status;
    order.updatedAt = Date.now();

    // Update delivery date if delivered
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'vendor', select: 'businessName phone email' },
      { path: 'items.product', select: 'name images' }
    ]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to cancel this order
    const isCustomer = order.customer.toString() === req.user.id;
    let isVendor = false;
    
    if (req.user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
      isVendor = vendorProfile && 
        order.vendor.toString() === vendorProfile._id.toString();
    }

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
};