const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateChangePassword
} = require('../utils/validation');
const VendorProfile = require('../models/VendorProfile');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, validateChangePassword, changePassword);

/**
 * @route   PUT /api/auth/vendor/location
 * @desc    Update vendor business location (lat/lng)
 * @access  Private/Vendor
 */
router.put('/vendor/location', authenticate, authorize('vendor'), async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }
    const vendor = await VendorProfile.findOneAndUpdate(
      { user: req.user.id },
      { location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)], address: address || '' } },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    res.json({ success: true, message: 'Location updated', data: { location: vendor.location } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
});

module.exports = router;