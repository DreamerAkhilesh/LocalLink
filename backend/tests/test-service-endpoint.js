const axios = require('axios');

const testServiceEndpoint = async () => {
  try {
    console.log('Testing service endpoints...');
    
    // Test GET services
    const getResponse = await axios.get('http://localhost:5000/api/services');
    console.log('✅ GET /api/services works');
    console.log('   Services found:', getResponse.data.data.services.length);
    
    // Test POST with authentication
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'shop@example.com',
      password: 'Test123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Try to POST to services endpoint
    try {
      const postResponse = await axios.post('http://localhost:5000/api/services', {
        title: 'Test Service'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ POST /api/services endpoint reachable');
    } catch (error) {
      console.log('📝 POST /api/services response:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testServiceEndpoint();