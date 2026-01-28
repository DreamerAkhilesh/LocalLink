/**
 * Test Products and Services API endpoints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testProductsAndServices() {
  try {
    console.log('🧪 Testing Products and Services API...\n');
    
    // Test 1: Get Products
    console.log('1. Testing Get Products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log('✅ Products endpoint working:', productsResponse.data.success);
    console.log('   Products found:', productsResponse.data.data.products.length);
    
    // Test 2: Get Services
    console.log('\n2. Testing Get Services...');
    const servicesResponse = await axios.get(`${API_BASE}/services`);
    console.log('✅ Services endpoint working:', servicesResponse.data.success);
    console.log('   Services found:', servicesResponse.data.data.services.length);
    
    // Test 3: Test with filters
    console.log('\n3. Testing Products with filters...');
    const filteredProductsResponse = await axios.get(`${API_BASE}/products?category=grocery&limit=5`);
    console.log('✅ Filtered products working:', filteredProductsResponse.data.success);
    console.log('   Filtered products found:', filteredProductsResponse.data.data.products.length);
    
    // Test 4: Test with search
    console.log('\n4. Testing Services with search...');
    const searchServicesResponse = await axios.get(`${API_BASE}/services?search=cleaning&limit=5`);
    console.log('✅ Service search working:', searchServicesResponse.data.success);
    console.log('   Search results found:', searchServicesResponse.data.data.services.length);
    
    console.log('\n🎉 All Products and Services API tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testProductsAndServices();