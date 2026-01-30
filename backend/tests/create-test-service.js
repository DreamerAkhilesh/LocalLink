const axios = require('axios');

const createTestService = async () => {
  try {
    // First login as vendor
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'shop@example.com',
      password: 'Test123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Vendor login successful');
    
    // Create a test service
    const serviceData = {
      title: 'Professional Home Cleaning Service',
      description: 'Professional home cleaning service with experienced staff. We provide comprehensive cleaning including dusting, mopping, bathroom cleaning, and kitchen cleaning. Our team uses eco-friendly products and ensures your home is spotless.',
      category: 'cleaning',
      pricingType: 'fixed',
      basePrice: 500,
      priceUnit: 'per-visit',
      duration: {
        estimated: 120 // 2 hours in minutes
      }
    };
    
    const serviceResponse = await axios.post('http://localhost:5000/api/services', serviceData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Service created successfully');
    console.log('Service ID:', serviceResponse.data.data.service._id);
    console.log('Service Title:', serviceResponse.data.data.service.title);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
};

createTestService();