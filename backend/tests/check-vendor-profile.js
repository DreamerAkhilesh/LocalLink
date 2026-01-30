const mongoose = require('mongoose');
const VendorProfile = require('./models/VendorProfile');
const User = require('./models/User');

const checkVendorProfile = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/locallink');
    console.log('✅ Connected to database');
    
    // Find the vendor user
    const vendorUser = await User.findOne({ email: 'shop@example.com' });
    if (!vendorUser) {
      console.log('❌ Vendor user not found');
      return;
    }
    
    console.log('✅ Vendor user found:', vendorUser.name);
    console.log('   User ID:', vendorUser._id);
    console.log('   Role:', vendorUser.role);
    
    // Check for vendor profile
    const vendorProfile = await VendorProfile.findOne({ user: vendorUser._id });
    if (!vendorProfile) {
      console.log('❌ Vendor profile not found');
      console.log('   This is why service creation is failing!');
    } else {
      console.log('✅ Vendor profile found:', vendorProfile.businessName);
      console.log('   Profile ID:', vendorProfile._id);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkVendorProfile();