require('dotenv').config();
const mongoose = require('mongoose');
const VendorProfile = require('../models/VendorProfile');
const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/locallink').then(async () => {
  const lat = 26.914903180597122;
  const lng = 80.94440785837588;
  const radius = 10;

  console.log('Testing geo query with:', { lat, lng, radius });

  const nearby = await VendorProfile.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius * 1000
      }
    }
  }).select('businessName location');

  console.log('Nearby vendors found:', nearby.length);
  console.log(JSON.stringify(nearby, null, 2));

  if (nearby.length > 0) {
    const vendorIds = nearby.map(v => v._id);
    const products = await Product.find({
      vendor: { $in: vendorIds },
      isAvailable: true,
      status: 'active'
    }).select('name status isAvailable vendor');
    console.log('Products found:', products.length);
    console.log(JSON.stringify(products, null, 2));
  }

  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
