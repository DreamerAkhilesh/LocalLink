const Service = require('../models/Service');
const VendorProfile = require('../models/VendorProfile');
const { validationResult } = require('express-validator');
/**
 * @desc    Get all services with filters
 * @route   GET /api/services
 * @access  Public
 */
const getServices = async (req, res) => {
  try {
    const {
      category, search, minPrice, maxPrice,
      lat, lng, radius = 10,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 12
    } = req.query;

    // If location provided, find vendors within radius first
    let providerIds = null;
    if (lat && lng) {
      try {
        const nearbyVendors = await VendorProfile.find({
          location: {
            $nearSphere: {
              $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
              $maxDistance: parseFloat(radius) * 1000
            }
          }
        }).select('_id');
        // Only filter by provider if vendors were found — empty array → { $in: [] } → 0 results
        if (nearbyVendors.length > 0) {
          providerIds = nearbyVendors.map(v => v._id);
        }
      } catch (geoErr) {
        // If 2dsphere index isn't ready or coords are invalid, fall through without geo filter
        console.warn('Geo query failed, showing all services:', geoErr.message);
      }
    }

    const filter = { isAvailable: true, status: 'active' };
    // Only apply geo filter if we actually found nearby vendors
    if (providerIds && providerIds.length > 0) filter.provider = { $in: providerIds };
    // If geo query returned 0 vendors, return empty results
    if (providerIds && providerIds.length === 0) {
      return res.json({
        success: true,
        data: {
          services: [],
          pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false }
        },
        message: 'No service providers found in your area'
      });
    }
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const services = await Service.find(filter)
      .populate('provider', 'businessName businessType address location')
      .sort(sort).skip(skip).limit(parseInt(limit));

    const total = await Service.countDocuments(filter);

    const locationRequested = !!(lat && lng);
    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + services.length < total,
          hasPrev: parseInt(page) > 1
        },
        locationFiltered: locationRequested && providerIds !== null,
        locationFallback: locationRequested && providerIds === null,
        radiusKm: locationRequested ? parseFloat(radius) : null,
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'businessName businessType address');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
};

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private/Vendor
 */
const createService = async (req, res) => {
  try {
    console.log('🛠️ Creating service with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get vendor profile
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    console.log('👤 User ID:', req.user.id);
    console.log('🏪 Vendor profile found:', vendorProfile ? vendorProfile.businessName : 'None');
    
    if (!vendorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const serviceData = {
      ...req.body,
      provider: vendorProfile._id,
      status: 'pending-approval'
    };
    
    console.log('📝 Service data to save:', JSON.stringify(serviceData, null, 2));

    const service = new Service(serviceData);
    await service.save();

    // Populate vendor info for response
    await service.populate('provider', 'businessName businessType address');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private/Vendor
 */
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
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

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if vendor owns this service
    if (service.provider.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Update service
    Object.assign(service, req.body);
    service.updatedAt = Date.now();
    await service.save();

    await service.populate('provider', 'businessName businessType address');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private/Vendor
 */
const deleteService = async (req, res) => {
  try {
    // Get vendor profile
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if vendor owns this service (delete)
    if (service.provider.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    // Soft delete - mark as inactive
    service.status = 'inactive';
    await service.save();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

/**
 * @desc    Get vendor's services
 * @route   GET /api/services/vendor/my-services
 * @access  Private/Vendor
 */
const getVendorServices = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(400).json({ success: false, message: 'Vendor profile not found' });
    }

    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc', search, category } = req.query;

    const filter = { provider: vendorProfile._id, status: { $ne: 'inactive' } };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const services = await Service.find(filter).sort(sort).skip(skip).limit(parseInt(limit));
    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + services.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get vendor services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor services' });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getVendorServices
};