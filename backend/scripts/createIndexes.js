require('dotenv').config();
const mongoose = require('mongoose');
const VendorProfile = require('../models/VendorProfile');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/locallink').then(async () => {
  console.log('Creating 2dsphere index on VendorProfile.location...');
  await VendorProfile.collection.createIndex({ location: '2dsphere' });
  console.log('✅ Index created successfully');

  const indexes = await VendorProfile.collection.indexes();
  console.log('Current indexes:', indexes.map(i => i.name));

  process.exit(0);
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
