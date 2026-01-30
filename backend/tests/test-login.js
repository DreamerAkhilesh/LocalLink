const axios = require('axios');

const testLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'Test123456'
    });
    
    console.log('Login response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
  }
};

testLogin();