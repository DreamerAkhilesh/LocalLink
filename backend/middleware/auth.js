const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorization check:', {
      userExists: !!req.user,
      userRole: req.user?.role,
      requiredRoles: roles
    });
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Verified Vendor Middleware
 * Blocks product/service creation if vendor is not verified by admin
 */
const requireVerifiedVendor = async (req, res, next) => {
  try {
    const VendorProfile = require('../models/VendorProfile');
    const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(400).json({ success: false, message: 'Vendor profile not found' });
    }
    if (!vendorProfile.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is pending admin verification. You cannot add products or services until approved.',
        verificationStatus: vendorProfile.verificationStatus || 'pending'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

/**
 * Verified Rider Middleware
 * Blocks delivery actions if rider is not verified by admin
 */
const requireVerifiedRider = async (req, res, next) => {
  try {
    const RiderProfile = require('../models/RiderProfile');
    const riderProfile = await RiderProfile.findOne({ user: req.user.id });
    if (!riderProfile) {
      return res.status(400).json({ success: false, message: 'Rider profile not found' });
    }
    if (!riderProfile.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your rider account is pending admin verification.',
        verificationStatus: riderProfile.verificationStatus || 'pending'
      });
    }
    req.riderProfile = riderProfile;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireVerifiedVendor,
  requireVerifiedRider
};