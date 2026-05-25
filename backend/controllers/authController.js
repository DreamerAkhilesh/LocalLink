const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const OtpCode = require('../models/OtpCode');
const { sendOtpEmail } = require('../services/emailService');

const OTP_EXPIRES_MINUTES = 10;

/** Generate a cryptographically-random 6-digit OTP string */
function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

/** Generate JWT Token */
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

/** Build the safe public user object returned in every auth response */
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  address: user.address,
  isVerified: user.isVerified,
});

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTER  — creates an *unverified* account and emails an OTP
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, phone, role, address, businessInfo } = req.body;

    // If an unverified account already exists for this email, delete it so they can re-register
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      // Unverified — remove stale record and let them start fresh
      await User.deleteOne({ _id: existing._id });
      await VendorProfile.deleteOne({ user: existing._id });
    }

    // Create user (unverified)
    const user = new User({ name, email, password, phone, role: role || 'customer', address, isVerified: false });
    await user.save();

    // Create vendor profile immediately (will be active once email is verified)
    if (user.role === 'vendor' && businessInfo) {
      const vendorProfile = new VendorProfile({
        user: user._id,
        businessName: businessInfo.businessName,
        businessType: businessInfo.businessType,
        category: businessInfo.category,
        description: businessInfo.description,
        isActive: false, // activated after OTP verification
      });
      await vendorProfile.save();
    }

    // If user is a rider, create rider profile
    if (user.role === 'rider') {
      const RiderProfile = require('../models/RiderProfile');
      const riderInfo = req.body.riderInfo || {};
      const riderProfile = new RiderProfile({
        user: user._id,
        phone: phone,
        vehicleType: riderInfo.vehicleType || 'bike',
        vehicleNumber: riderInfo.vehicleNumber || ''
      });
      await riderProfile.save();
    }

    // Invalidate any previous OTPs for this email
    await OtpCode.deleteMany({ email: email.toLowerCase() });

    // Generate + persist OTP
    const otp = generateOtp();
    await OtpCode.create({
      email: email.toLowerCase(),
      code: otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000),
    });

    // Send email (non-blocking error handling — don't fail registration if email fails)
    try {
      await sendOtpEmail({ to: email, name, otp });
    } catch (mailErr) {
      console.error('OTP email send error:', mailErr.message);
      // Still proceed; the frontend will show a "check your inbox" message
    }

    return res.status(201).json({
      success: true,
      requiresOtp: true,
      message: `A 6-digit verification code has been sent to ${email}`,
      data: { email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  VERIFY OTP  — confirms email, activates account, issues JWT
// ─────────────────────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const otpRecord = await OtpCode.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP has expired or is invalid. Please request a new one.' });
    }

    if (otpRecord.code !== String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Activate the user account
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please register again.' });
    }

    // Activate vendor profile if applicable
    if (user.role === 'vendor') {
      await VendorProfile.findOneAndUpdate({ user: user._id }, { isActive: true });
    }

    // Fetch vendor profile for response
    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id });
    }

    // Get rider profile if user is a rider
    let riderProfile = null;
    if (user.role === 'rider') {
      const RiderProfile = require('../models/RiderProfile');
      riderProfile = await RiderProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Email verified successfully! Welcome to LocalLink.',
      data: { user: publicUser(user), vendorProfile, riderProfile, token },
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  RESEND OTP  — generates a fresh code and re-sends the email
// ─────────────────────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified.' });
    }

    // Invalidate previous OTPs
    await OtpCode.deleteMany({ email: email.toLowerCase() });

    const otp = generateOtp();
    await OtpCode.create({
      email: email.toLowerCase(),
      code: otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000),
    });

    try {
      await sendOtpEmail({ to: email, name: user.name, otp });
    } catch (mailErr) {
      console.error('Resend OTP email error:', mailErr.message);
    }

    return res.json({ success: true, message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact support.' });

    // If account exists but is unverified, redirect to OTP verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresOtp: true,
        message: 'Please verify your email first.',
        data: { email: user.email },
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    let vendorProfile = null;
    if (user.role === 'vendor') vendorProfile = await VendorProfile.findOne({ user: user._id });

    // Get rider profile if user is a rider
    let riderProfile = null;
    if (user.role === 'rider') {
      const RiderProfile = require('../models/RiderProfile');
      riderProfile = await RiderProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: publicUser(user), vendorProfile, riderProfile, token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET PROFILE
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    let vendorProfile = null;
    if (user.role === 'vendor') vendorProfile = await VendorProfile.findOne({ user: user._id });

    // Get rider profile if user is a rider
    let riderProfile = null;
    if (user.role === 'rider') {
      const RiderProfile = require('../models/RiderProfile');
      riderProfile = await RiderProfile.findOne({ user: user._id });
    }

    res.json({ success: true, data: { user, vendorProfile, riderProfile } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE PROFILE
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name || req.user.name, phone: phone || req.user.phone, address: address || req.user.address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated successfully', data: { user } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, verifyOtp, resendOtp };
