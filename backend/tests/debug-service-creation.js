const axios = require('axios');

const debugServiceCreation = async () => {
  try {
    console.log('🔍 Debugging service creation...');
    
    // First login as vendor
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'shop@example.com',
      password: 'Test123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Vendor login successful');
    
    // Test with minimal valid data first
    const minimalServiceData = {
      title: 'Test Service',
      description: 'This is a test service with minimum required fields for validation',
      category: 'cleaning',
      pricingType: 'fixed',
      basePrice: 100,
      priceUnit: 'per-visit',
      duration: {
        estimated: 60
      }
    };
    
    console.log('📝 Sending service data:', JSON.stringify(minimalServiceData, null, 2));
    
    const serviceResponse = await axios.post('http://localhost:5000/api/services', minimalServiceData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Service created successfully');
    console.log('Response:', JSON.stringify(serviceResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Headers:', error.response?.headers);
  }
};

debugServiceCreation();