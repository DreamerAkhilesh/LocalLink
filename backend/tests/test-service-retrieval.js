const axios = require('axios');

const testServiceRetrieval = async () => {
  try {
    console.log('🛠️ Testing service retrieval...');
    
    const response = await axios.get('http://localhost:5000/api/services?limit=1');
    
    console.log('✅ Service retrieval successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data.services.length > 0) {
      console.log('Service ID:', response.data.data.services[0]._id);
    } else {
      console.log('No services found');
    }
    
  } catch (error) {
    console.log('❌ Service retrieval failed');
    console.log('Error:', error.response?.data || error.message);
  }
};

testServiceRetrieval();