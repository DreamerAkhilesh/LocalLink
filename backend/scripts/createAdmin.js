/**
 * Create Admin User Script
 * Run once to seed the admin account:
 *   node backend/scripts/createAdmin.js
 *
 * Credentials: admin@locallink.com / Admin@1234
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const email = 'admin@locallink.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('ℹ️  Admin user already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const admin = new User({
    name: 'LocalLink Admin',
    email,
    password: 'Admin@1234',
    phone: '9000000000',
    role: 'admin',
    isVerified: true,
    isActive: true,
    address: { city: 'Admin City', pincode: '000000', state: 'Admin State' },
  });

  await admin.save();
  console.log('✅ Admin user created successfully');
  console.log('   Email   :', email);
  console.log('   Password: Admin@1234');
  console.log('   ⚠️  Change the password in production!');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
