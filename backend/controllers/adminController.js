const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// Helper: notify vendor
const notifyVendor = async (userId, title, message) => {
  try {
    await Notification.create({ recipient: userId, type: 'order_status', title, message });
  } catch (e) { /* silent */ }
};

/**
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const [
      totalUsers, totalVendors, pendingVendors, verifiedVendors, rejectedVendors,
      totalProducts, pendingProducts, activeProducts,
      totalServices, pendingServices, activeServices,
      totalOrders, totalBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      VendorProfile.countDocuments({ verificationStatus: 'pending' }),
      VendorProfile.countDocuments({ verificationStatus: 'verified' }),
      VendorProfile.countDocuments({ verificationStatus: 'rejected' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'pending-approval' }),
      Product.countDocuments({ status: 'active' }),
      Service.countDocuments(),
      Service.countDocuments({ status: 'pending-approval' }),
      Service.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Booking.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, vendors: totalVendors },
        vendors: { pending: pendingVendors, verified: verifiedVendors, rejected: rejectedVendors },
        products: { total: totalProducts, pending: pendingProducts, active: activeProducts },
        services: { total: totalServices, pending: pendingServices, active: activeServices },
        orders: totalOrders,
        bookings: totalBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

/**
 * GET /api/admin/vendors?status=pending|verified|rejected
 */
const getVendors = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = status !== 'all' ? { verificationStatus: status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const vendors = await VendorProfile.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VendorProfile.countDocuments(filter);

    res.json({ success: true, data: { vendors, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
  }
};

/**
 * PUT /api/admin/vendors/:id/approve
 */
const approveVendor = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id).populate('user', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.isVerified = true;
    vendor.verificationStatus = 'verified';
    vendor.verificationNote = '';
    await vendor.save();

    await notifyVendor(vendor.user._id,
      '✅ Vendor Account Approved',
      `Congratulations ${vendor.user.name}! Your vendor account has been verified. You can now add products and services.`
    );

    res.json({ success: true, message: 'Vendor approved successfully', data: { vendor } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve vendor' });
  }
};

/**
 * PUT /api/admin/vendors/:id/reject
 */
const rejectVendor = async (req, res) => {
  try {
    const { reason = 'Does not meet requirements' } = req.body;
    const vendor = await VendorProfile.findById(req.params.id).populate('user', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.isVerified = false;
    vendor.verificationStatus = 'rejected';
    vendor.verificationNote = reason;
    await vendor.save();

    await notifyVendor(vendor.user._id,
      '❌ Vendor Account Rejected',
      `Your vendor account application was rejected. Reason: ${reason}`
    );

    res.json({ success: true, message: 'Vendor rejected', data: { vendor } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject vendor' });
  }
};

/**
 * GET /api/admin/products?status=pending-approval|active|rejected
 */
const getProducts = async (req, res) => {
  try {
    const { status = 'pending-approval', page = 1, limit = 20 } = req.query;
    const filter = status !== 'all' ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);
    res.json({ success: true, data: { products, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

/**
 * PUT /api/admin/products/:id/approve
 */
const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.status = 'active';
    await product.save();

    // Notify vendor
    const vendorUser = await VendorProfile.findById(product.vendor._id).populate('user', '_id');
    if (vendorUser?.user) {
      await notifyVendor(vendorUser.user._id, '✅ Product Approved', `Your product "${product.name}" has been approved and is now visible to customers.`);
    }

    res.json({ success: true, message: 'Product approved', data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve product' });
  }
};

/**
 * PUT /api/admin/products/:id/reject
 */
const rejectProduct = async (req, res) => {
  try {
    const { reason = 'Does not meet requirements' } = req.body;
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.status = 'rejected';
    await product.save();

    const vendorUser = await VendorProfile.findById(product.vendor._id).populate('user', '_id');
    if (vendorUser?.user) {
      await notifyVendor(vendorUser.user._id, '❌ Product Rejected', `Your product "${product.name}" was rejected. Reason: ${reason}`);
    }

    res.json({ success: true, message: 'Product rejected', data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject product' });
  }
};

/**
 * GET /api/admin/services?status=pending-approval|active|rejected
 */
const getServices = async (req, res) => {
  try {
    const { status = 'pending-approval', page = 1, limit = 20 } = req.query;
    const filter = status !== 'all' ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const services = await Service.find(filter)
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(filter);
    res.json({ success: true, data: { services, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

/**
 * PUT /api/admin/services/:id/approve
 */
const approveService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    service.status = 'active';
    await service.save();

    const vendorUser = await VendorProfile.findById(service.provider._id).populate('user', '_id');
    if (vendorUser?.user) {
      await notifyVendor(vendorUser.user._id, '✅ Service Approved', `Your service "${service.title}" has been approved and is now visible to customers.`);
    }

    res.json({ success: true, message: 'Service approved', data: { service } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve service' });
  }
};

/**
 * PUT /api/admin/services/:id/reject
 */
const rejectService = async (req, res) => {
  try {
    const { reason = 'Does not meet requirements' } = req.body;
    const service = await Service.findById(req.params.id).populate('provider');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    service.status = 'rejected';
    await service.save();

    const vendorUser = await VendorProfile.findById(service.provider._id).populate('user', '_id');
    if (vendorUser?.user) {
      await notifyVendor(vendorUser.user._id, '❌ Service Rejected', `Your service "${service.title}" was rejected. Reason: ${reason}`);
    }

    res.json({ success: true, message: 'Service rejected', data: { service } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject service' });
  }
};

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    res.json({ success: true, data: { users, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

module.exports = {
  getStats, getVendors, approveVendor, rejectVendor,
  getProducts, approveProduct, rejectProduct,
  getServices, approveService, rejectService,
  getUsers
};
