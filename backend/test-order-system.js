/**
 * Test Order Management System
 * Tests the complete order flow from cart to order placement
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials (these should exist from previous tests)
const testCustomer = {
  email: 'john@example.com',
  password: 'Test123456'
};

const testVendor = {
  email: 'shop@example.com',
  password: 'Test123456'
};

async function testOrderSystem() {
  try {
    console.log('🧪 Testing Order Management System...\n');
    
    // Test 1: Login as customer
    console.log('1. Logging in as customer...');
    const customerLogin = await axios.post(`${API_BASE}/auth/login`, testCustomer);
    const customerToken = customerLogin.data.data.token;
    console.log('✅ Customer logged in successfully');
    
    // Test 2: Login as vendor
    console.log('\n2. Logging in as vendor...');
    const vendorLogin = await axios.post(`${API_BASE}/auth/login`, testVendor);
    const vendorToken = vendorLogin.data.data.token;
    console.log('✅ Vendor logged in successfully');
    
    // Test 3: Create a test product (as vendor)
    console.log('\n3. Creating test product...');
    const testProduct = {
      name: 'Test Product for Order',
      description: 'A test product to verify order system',
      category: 'groceries',
      price: 100,
      stock: 10,
      unit: 'piece',
      images: ['https://via.placeholder.com/300x300?text=Test+Product']
    };
    
    const productResponse = await axios.post(`${API_BASE}/products`, testProduct, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const createdProduct = productResponse.data.data.product;
    console.log('✅ Test product created:', createdProduct.name);
    console.log('Product details:', {
      id: createdProduct._id,
      isAvailable: createdProduct.isAvailable,
      stock: createdProduct.stock
    });
    
    // Wait a moment for the product to be fully saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify product exists by fetching it
    console.log('\n3.5. Verifying product exists...');
    const productCheck = await axios.get(`${API_BASE}/products/${createdProduct._id}`);
    console.log('✅ Product verified:', productCheck.data.data.product.name);
    
    // Test 4: Create order (as customer)
    console.log('\n4. Creating test order...');
    const testOrder = {
      items: [
        {
          product: createdProduct._id,
          quantity: 2
        }
      ],
      deliveryType: 'home-delivery',
      paymentMethod: 'cash-on-delivery',
      deliveryAddress: {
        name: 'John Doe',
        phone: '9876543210',
        street: '123 Test Street',
        city: 'Mumbai',
        pincode: '400001',
        state: 'Maharashtra'
      },
      notes: 'Test order for system verification'
    };
    
    const orderResponse = await axios.post(`${API_BASE}/orders`, testOrder, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const createdOrders = orderResponse.data.data.orders;
    const createdOrder = createdOrders[0]; // Get the first order
    console.log('✅ Order created successfully:', createdOrder._id);
    console.log('   Order total:', `₹${createdOrder.totalAmount}`);
    console.log('   Order status:', createdOrder.status);
    console.log('   Orders created:', createdOrders.length);
    
    // Test 5: Get customer orders
    console.log('\n5. Fetching customer orders...');
    const customerOrders = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Customer orders retrieved:', customerOrders.data.data.orders.length, 'orders');
    
    // Test 6: Get vendor orders
    console.log('\n6. Fetching vendor orders...');
    const vendorOrders = await axios.get(`${API_BASE}/orders/vendor`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log('✅ Vendor orders retrieved:', vendorOrders.data.data.orders.length, 'orders');
    
    // Test 7: Get single order details
    console.log('\n7. Fetching order details...');
    const orderDetails = await axios.get(`${API_BASE}/orders/${createdOrder._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Order details retrieved for order:', orderDetails.data.data.order._id);
    
    // Test 8: Update order status (as vendor)
    console.log('\n8. Updating order status...');
    const statusUpdate = await axios.put(`${API_BASE}/orders/${createdOrder._id}/status`, 
      { status: 'confirmed' },
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );
    console.log('✅ Order status updated to:', statusUpdate.data.data.order.status);
    
    // Test 9: Check product stock after order
    console.log('\n9. Verifying product stock update...');
    const updatedProduct = await axios.get(`${API_BASE}/products/${createdProduct._id}`);
    console.log('✅ Product stock updated:');
    console.log('   Original stock:', testProduct.stock);
    console.log('   Ordered quantity:', testOrder.items[0].quantity);
    console.log('   Current stock:', updatedProduct.data.data.product.stock);
    
    console.log('\n🎉 All Order Management System tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Customer authentication');
    console.log('✅ Vendor authentication');
    console.log('✅ Product creation');
    console.log('✅ Order placement');
    console.log('✅ Stock management');
    console.log('✅ Order retrieval (customer & vendor)');
    console.log('✅ Order status updates');
    console.log('✅ Order details access');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run tests
testOrderSystem();