/**
 * Run once to create the admin user:
 * node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/locallink');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = new User({
    name: 'Admin',
    email: 'admin@locallink.com',
    password: 'Admin@1234',
    phone: '9999999999',
    role: 'admin',
    address: { street: 'Admin HQ', city: 'Delhi', pincode: '110001', state: 'Delhi' },
    isActive: true,
    isVerified: true
  });

  await admin.save();
  console.log('✅ Admin created successfully');
  console.log('   Email   : admin@locallink.com');
  console.log('   Password: Admin@1234');
  process.exit(0);
};

createAdmin().catch(err => { console.error(err); process.exit(1); });
