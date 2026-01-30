const Booking = require('../models/Booking');
const Service = require('../models/Service');
const VendorProfile = require('../models/VendorProfile');
const { validationResult } = require('express-validator');

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private/Customer
 */
const createBooking = async (req, res) => {
  try {
    console.log('📅 Creating booking with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      serviceLocation,
      serviceAddress,
      paymentMethod,
      specialRequests,
      customerInfo
    } = req.body;

    // Validate service exists and is available
    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isAvailable || service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Service is not available for booking'
      });
    }

    // Validate scheduled date is in the future
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date and time must be in the future'
      });
    }

    // Check for conflicting bookings (same vendor, same time slot)
    const conflictingBooking = await Booking.findOne({
      vendor: service.provider._id,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime,
      status: { $nin: ['cancelled', 'completed', 'no-show'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }

    // Generate booking number
    const bookingNumber = await Booking.generateBookingNumber();

    // Create booking data
    const bookingData = {
      bookingNumber,
      customer: req.user.id,
      vendor: service.provider._id,
      service: serviceId,
      serviceDetails: {
        name: service.title,
        description: service.description,
        price: service.basePrice,
        duration: service.duration.estimated,
        category: service.category
      },
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      totalAmount: service.basePrice,
      customerInfo: customerInfo || {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        address: req.user.address
      },
      serviceLocation,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'unpaid',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Booking created',
        updatedBy: 'customer'
      }],
      specialRequests: specialRequests || ''
    };

    // Add service address if service is at customer location
    if (serviceLocation === 'customer-location' && serviceAddress) {
      bookingData.serviceAddress = serviceAddress;
    }

    console.log('Booking data before creation:', JSON.stringify(bookingData, null, 2));

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate booking for response
    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'vendor', select: 'businessName phone email address' },
      { path: 'service', select: 'title images category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

/**
 * @desc    Get customer bookings
 * @route   GET /api/bookings
 * @access  Private/Customer
 */
const getCustomerBookings = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'bookingDate',
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

    const bookings = await Booking.find(filter)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'vendor', select: 'businessName phone email address' },
        { path: 'service', select: 'title images category' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + bookings.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

/**
 * @desc    Get vendor bookings
 * @route   GET /api/bookings/vendor
 * @access  Private/Vendor
 */
const getVendorBookings = async (req, res) => {
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
      date,
      page = 1,
      limit = 10,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = { vendor: vendorProfile._id };
    if (status) {
      filter.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduledDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate([
        { path: 'customer', select: 'name email phone address' },
        { path: 'vendor', select: 'businessName phone email address' },
        { path: 'service', select: 'title images category' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + bookings.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: 'customer', select: 'name email phone address' },
        { path: 'vendor', select: 'businessName phone email address' },
        { path: 'service', select: 'title images description category' }
      ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const isCustomer = booking.customer._id.toString() === req.user.id;
    let isVendor = false;
    
    if (req.user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
      isVendor = vendorProfile && 
        booking.vendor._id.toString() === vendorProfile._id.toString();
    }

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private/Vendor
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = [
      'pending', 'confirmed', 'rescheduled', 'in-progress', 
      'completed', 'cancelled', 'no-show', 'refunded'
    ];

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

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if vendor has access to this booking
    const hasAccess = booking.vendor.toString() === vendorProfile._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status and add to history
    booking.status = status;
    booking.addStatusHistory(status, notes || '', 'vendor');

    // Update service timing for in-progress and completed status
    if (status === 'in-progress') {
      booking.serviceStartTime = new Date();
    } else if (status === 'completed') {
      booking.serviceEndTime = new Date();
      if (booking.serviceStartTime) {
        const durationMs = booking.serviceEndTime - booking.serviceStartTime;
        booking.actualDuration = Math.round(durationMs / (1000 * 60)); // in minutes
      }
    }

    booking.updatedAt = Date.now();
    await booking.save();

    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'vendor', select: 'businessName phone email' },
      { path: 'service', select: 'title images' }
    ]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to cancel this booking
    const isCustomer = booking.customer.toString() === req.user.id;
    let isVendor = false;
    
    if (req.user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
      isVendor = vendorProfile && 
        booking.vendor.toString() === vendorProfile._id.toString();
    }

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.addStatusHistory('cancelled', reason || 'Booking cancelled', req.user.role);
    booking.updatedAt = Date.now();
    
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

/**
 * @desc    Reschedule booking
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private
 */
const rescheduleBooking = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to reschedule this booking
    const isCustomer = booking.customer.toString() === req.user.id;
    let isVendor = false;
    
    if (req.user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
      isVendor = vendorProfile && 
        booking.vendor.toString() === vendorProfile._id.toString();
    }

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be rescheduled
    if (!booking.canBeRescheduled()) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule booking with status: ${booking.status}`
      });
    }

    // Validate new scheduled date is in the future
    const newScheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (newScheduledDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New scheduled date and time must be in the future'
      });
    }

    // Check for conflicting bookings at new time
    const conflictingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      vendor: booking.vendor,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime,
      status: { $nin: ['cancelled', 'completed', 'no-show'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'The new time slot is already booked. Please choose a different time.'
      });
    }

    // Update booking schedule
    booking.scheduledDate = new Date(scheduledDate);
    booking.scheduledTime = scheduledTime;
    booking.status = 'rescheduled';
    booking.addStatusHistory('rescheduled', reason || 'Booking rescheduled', req.user.role);
    booking.updatedAt = Date.now();
    
    await booking.save();

    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'vendor', select: 'businessName phone email' },
      { path: 'service', select: 'title images' }
    ]);

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking'
    });
  }
};

/**
 * @desc    Get vendor booking statistics
 * @route   GET /api/bookings/vendor/stats
 * @access  Private/Vendor
 */
const getVendorBookingStats = async (req, res) => {
  try {
    // Get vendor profile
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const filter = { vendor: vendorProfile._id };

    // Get overall stats
    const totalBookings = await Booking.countDocuments(filter);
    const pendingBookings = await Booking.countDocuments({ ...filter, status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ ...filter, status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ ...filter, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ ...filter, status: 'cancelled' });

    // Get today's bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.countDocuments({
      ...filter,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $nin: ['cancelled', 'no-show'] }
    });

    // Get upcoming bookings (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingBookings = await Booking.countDocuments({
      ...filter,
      scheduledDate: {
        $gte: today,
        $lt: nextWeek
      },
      status: { $nin: ['cancelled', 'completed', 'no-show'] }
    });

    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { ...filter, status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        todayBookings,
        upcomingBookings,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('Get vendor booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics'
    });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  getVendorBookingStats
};