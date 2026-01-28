/**
 * Simple API Test Script
 * Tests the authentication endpoints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Test123456',
  phone: '9876543210',
  role: 'customer',
  address: {
    street: '123 Main St',
    city: 'Mumbai',
    pincode: '400001',
    state: 'Maharashtra'
  }
};

const testVendor = {
  name: 'Shop Owner',
  email: 'shop@example.com',
  password: 'Test123456',
  phone: '9876543211',
  role: 'vendor',
  address: {
    street: '456 Business St',
    city: 'Mumbai',
    pincode: '400002',
    state: 'Maharashtra'
  },
  businessInfo: {
    businessName: 'Local Grocery Store',
    businessType: 'shop',
    category: 'grocery',
    description: 'Fresh groceries and daily essentials'
  }
};

async function testAPI() {
  try {
    console.log('🧪 Testing Local Link API...\n');
    
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    
    // Test 2: Register Customer
    console.log('\n2. Testing Customer Registration...');
    const customerRegResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Customer registered:', customerRegResponse.data.data.user.name);
    const customerToken = customerRegResponse.data.data.token;
    
    // Test 3: Register Vendor
    console.log('\n3. Testing Vendor Registration...');
    const vendorRegResponse = await axios.post(`${API_BASE}/auth/register`, testVendor);
    console.log('✅ Vendor registered:', vendorRegResponse.data.data.user.name);
    const vendorToken = vendorRegResponse.data.data.token;
    
    // Test 4: Login Customer
    console.log('\n4. Testing Customer Login...');
    const customerLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Customer login successful:', customerLoginResponse.data.data.user.name);
    
    // Test 5: Login Vendor
    console.log('\n5. Testing Vendor Login...');
    const vendorLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testVendor.email,
      password: testVendor.password
    });
    console.log('✅ Vendor login successful:', vendorLoginResponse.data.data.user.name);
    console.log('✅ Vendor profile exists:', !!vendorLoginResponse.data.data.vendorProfile);
    
    // Test 6: Get Customer Profile
    console.log('\n6. Testing Get Customer Profile...');
    const customerProfileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Customer profile retrieved:', customerProfileResponse.data.data.user.name);
    
    // Test 7: Get Vendor Profile
    console.log('\n7. Testing Get Vendor Profile...');
    const vendorProfileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log('✅ Vendor profile retrieved:', vendorProfileResponse.data.data.user.name);
    console.log('✅ Business name:', vendorProfileResponse.data.data.vendorProfile.businessName);
    
    // Test 8: Test Protected Routes
    console.log('\n8. Testing Protected Routes...');
    
    // Test products endpoint
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log('✅ Products endpoint accessible:', productsResponse.data.message);
    
    // Test services endpoint
    const servicesResponse = await axios.get(`${API_BASE}/services`);
    console.log('✅ Services endpoint accessible:', servicesResponse.data.message);
    
    console.log('\n🎉 All tests passed! Backend API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testAPI();