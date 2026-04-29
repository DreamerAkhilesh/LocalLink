const RiderProfile = require('../models/RiderProfile');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Helper: send notification
const notify = async (userId, title, message, type = 'order_status') => {
  try {
    await Notification.create({ recipient: userId, type, title, message });
  } catch (e) { /* silent */ }
};

/**
 * GET /api/rider/me
 * Get current rider's profile
 */
const getMe = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id })
      .populate('user', 'name email phone')
      .populate('currentOrder');

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    res.json({ success: true, data: { rider } });
  } catch (error) {
    console.error('Get rider profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rider profile' });
  }
};

/**
 * PUT /api/rider/location
 * Update rider's current GPS location
 */
const updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    rider.currentLocation = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address: address || '',
      lastUpdated: new Date()
    };
    await rider.save();

    res.json({
      success: true,
      message: 'Location updated',
      data: { location: rider.currentLocation }
    });
  } catch (error) {
    console.error('Update rider location error:', error);
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
};

/**
 * PUT /api/rider/toggle-availability
 * Toggle rider online/offline status
 */
const toggleAvailability = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    if (!rider.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin verification'
      });
    }

    // Cannot go offline while on an active delivery
    if (rider.isAvailable && ['assigned', 'delivering'].includes(rider.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot go offline while on an active delivery'
      });
    }

    rider.isAvailable = !rider.isAvailable;
    rider.status = rider.isAvailable ? 'idle' : 'offline';
    await rider.save();

    res.json({
      success: true,
      message: `You are now ${rider.isAvailable ? 'online' : 'offline'}`,
      data: { isAvailable: rider.isAvailable, status: rider.status }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle availability' });
  }
};

/**
 * GET /api/rider/orders
 * Get all orders assigned to this rider
 */
const getMyOrders = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { rider: rider._id };

    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      // Default: show active orders
      filter.status = { $in: ['assigned-to-rider', 'picked-up', 'out-for-delivery'] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('vendor', 'businessName location')
      .populate({ path: 'items.product', select: 'name images' })
      .sort({ assignedAt: -1 })
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
    console.error('Get rider orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * GET /api/rider/orders/active
 * Get the current active order for this rider
 */
const getActiveOrder = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const order = await Order.findOne({
      rider: rider._id,
      status: { $in: ['assigned-to-rider', 'picked-up', 'out-for-delivery'] }
    })
      .populate('customer', 'name phone address')
      .populate('vendor', 'businessName location')
      .populate({ path: 'items.product', select: 'name images price' });

    res.json({ success: true, data: { order } });
  } catch (error) {
    console.error('Get active order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active order' });
  }
};

/**
 * PUT /api/orders/:id/accept
 * Rider accepts an assigned order
 */
const acceptOrder = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('vendor', 'businessName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify this order is assigned to this rider
    if (!order.rider || order.rider.toString() !== rider._id.toString()) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to you' });
    }

    if (order.status !== 'assigned-to-rider') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept order in status: ${order.status}`
      });
    }

    // Update order status
    order.statusHistory.push({
      status: 'assigned-to-rider',
      timestamp: new Date(),
      note: 'Rider accepted the order',
      updatedBy: req.user.id
    });
    await order.save();

    // Update rider status
    rider.status = 'assigned';
    rider.currentOrder = order._id;
    await rider.save();

    // Notify customer
    await notify(
      order.customer._id,
      '🛵 Rider Assigned',
      `A rider has been assigned to your order #${order.orderNumber} and is heading to pick it up.`
    );

    res.json({ success: true, message: 'Order accepted', data: { order } });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept order' });
  }
};

/**
 * PUT /api/orders/:id/picked-up
 * Rider marks order as picked up from vendor
 */
const markPickedUp = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name _id');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.rider || order.rider.toString() !== rider._id.toString()) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to you' });
    }

    if (order.status !== 'assigned-to-rider') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark picked-up from status: ${order.status}`
      });
    }

    order.status = 'picked-up';
    order.pickedAt = new Date();
    order.statusHistory.push({
      status: 'picked-up',
      timestamp: new Date(),
      note: req.body.note || 'Order picked up from vendor',
      updatedBy: req.user.id
    });
    await order.save();

    rider.status = 'delivering';
    await rider.save();

    await notify(
      order.customer._id,
      '📦 Order Picked Up',
      `Your order #${order.orderNumber} has been picked up and is on the way!`
    );

    res.json({ success: true, message: 'Order marked as picked up', data: { order } });
  } catch (error) {
    console.error('Mark picked up error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

/**
 * PUT /api/orders/:id/start-delivery
 * Rider starts delivery (out-for-delivery)
 */
const startDelivery = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name _id');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.rider || order.rider.toString() !== rider._id.toString()) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to you' });
    }

    if (order.status !== 'picked-up') {
      return res.status(400).json({
        success: false,
        message: `Cannot start delivery from status: ${order.status}`
      });
    }

    order.status = 'out-for-delivery';
    order.statusHistory.push({
      status: 'out-for-delivery',
      timestamp: new Date(),
      note: req.body.note || 'Rider is on the way',
      updatedBy: req.user.id
    });
    await order.save();

    await notify(
      order.customer._id,
      '🚴 Out for Delivery',
      `Your order #${order.orderNumber} is out for delivery. Rider is on the way!`
    );

    res.json({ success: true, message: 'Delivery started', data: { order } });
  } catch (error) {
    console.error('Start delivery error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

/**
 * PUT /api/orders/:id/delivered
 * Rider marks order as delivered
 */
const markDelivered = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name _id');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.rider || order.rider.toString() !== rider._id.toString()) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to you' });
    }

    if (order.status !== 'out-for-delivery') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark delivered from status: ${order.status}`
      });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.actualDeliveryDate = new Date();
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      note: req.body.note || 'Order delivered successfully',
      updatedBy: req.user.id
    });
    await order.save();

    // Update rider stats
    rider.status = 'idle';
    rider.currentOrder = null;
    rider.totalDeliveries += 1;
    rider.completedDeliveries += 1;
    // Basic earnings: flat ₹30 per delivery (placeholder)
    rider.totalEarnings += 30;
    await rider.save();

    await notify(
      order.customer._id,
      '✅ Order Delivered',
      `Your order #${order.orderNumber} has been delivered. Enjoy!`
    );

    res.json({ success: true, message: 'Order delivered successfully', data: { order } });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

/**
 * GET /api/rider/stats
 * Get rider's delivery statistics
 */
const getStats = async (req, res) => {
  try {
    const rider = await RiderProfile.findOne({ user: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    // Today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDeliveries = await Order.countDocuments({
      rider: rider._id,
      status: 'delivered',
      deliveredAt: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        totalDeliveries: rider.totalDeliveries,
        completedDeliveries: rider.completedDeliveries,
        cancelledDeliveries: rider.cancelledDeliveries,
        todayDeliveries,
        totalEarnings: rider.totalEarnings,
        rating: rider.rating,
        status: rider.status,
        isAvailable: rider.isAvailable
      }
    });
  } catch (error) {
    console.error('Get rider stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

module.exports = {
  getMe,
  updateLocation,
  toggleAvailability,
  getMyOrders,
  getActiveOrder,
  acceptOrder,
  markPickedUp,
  startDelivery,
  markDelivered,
  getStats
};
