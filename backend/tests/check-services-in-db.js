const mongoose = require('mongoose');
const Service = require('./models/Service');

const checkServices = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/locallink');
    console.log('✅ Connected to database');
    
    // Find all services
    const services = await Service.find({});
    console.log(`📊 Total services in database: ${services.length}`);
    
    if (services.length > 0) {
      console.log('\n📋 Service details:');
      services.forEach((service, index) => {
        console.log(`${index + 1}. ${service.title}`);
        console.log(`   ID: ${service._id}`);
        console.log(`   isAvailable: ${service.isAvailable}`);
        console.log(`   status: ${service.status}`);
        console.log(`   category: ${service.category}`);
        console.log(`   provider: ${service.provider}`);
        console.log('');
      });
    }
    
    // Test the filter used in getServices
    console.log('🔍 Testing getServices filter...');
    const filteredServices = await Service.find({ isActive: true });
    console.log(`Services with isActive: true: ${filteredServices.length}`);
    
    const availableServices = await Service.find({ isAvailable: true, status: 'active' });
    console.log(`Services with isAvailable: true and status: 'active': ${availableServices.length}`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkServices();