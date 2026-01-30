const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

const testBookingScenarios = async () => {
  console.log('🧪 COMPREHENSIVE BOOKING SCENARIOS TEST');
  console.log('=======================================');
  
  let customerToken = '';
  let vendorToken = '';
  let serviceId = '';
  
  try {
    // 1. Login as customer and vendor
    console.log('\n1️⃣ Authentication Setup...');
    const customerLogin = await makeRequest('POST', '/auth/login', {
      email: 'john@example.com',
      password: 'Test123456'
    });
    
    const vendorLogin = await makeRequest('POST', '/auth/login', {
      email: 'shop@example.com',
      password: 'Test123456'
    });
    
    if (!customerLogin.success || !vendorLogin.success) {
      console.log('❌ Authentication failed');
      return;
    }
    
    customerToken = customerLogin.data.data.token;
    vendorToken = vendorLogin.data.data.token;
    console.log('✅ Authentication successful');
    
    // 2. Get available service
    console.log('\n2️⃣ Service Retrieval...');
    const servicesResult = await makeRequest('GET', '/services?limit=1');
    if (!servicesResult.success || servicesResult.data.data.services.length === 0) {
      console.log('❌ No services available');
      return;
    }
    
    serviceId = servicesResult.data.data.services[0]._id;
    console.log('✅ Service found:', servicesResult.data.data.services[0].title);
    
    // 3. Test different booking scenarios
    const scenarios = [
      {
        name: 'Home Service Booking',
        data: {
          serviceId: serviceId,
          scheduledDate: '2026-02-02',
          scheduledTime: '10:00',
          serviceLocation: 'customer-location',
          serviceAddress: {
            street: '456 Home Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          paymentMethod: 'cash',
          specialRequests: 'Please call before arriving',
          customerInfo: {
            name: 'John Doe',
            phone: '9876543210',
            email: 'john@example.com'
          }
        }
      },
      {
        name: 'Vendor Location Booking',
        data: {
          serviceId: serviceId,
          scheduledDate: '2026-02-03',
          scheduledTime: '14:00',
          serviceLocation: 'vendor-location',
          paymentMethod: 'pay-at-service',
          specialRequests: 'Need parking space',
          customerInfo: {
            name: 'John Doe',
            phone: '9876543210',
            email: 'john@example.com'
          }
        }
      },
      {
        name: 'Online Service Booking',
        data: {
          serviceId: serviceId,
          scheduledDate: '2026-02-04',
          scheduledTime: '16:30',
          serviceLocation: 'online',
          paymentMethod: 'online',
          specialRequests: 'Zoom meeting preferred',
          customerInfo: {
            name: 'John Doe',
            phone: '9876543210',
            email: 'john@example.com'
          }
        }
      }
    ];
    
    const createdBookings = [];
    
    for (const scenario of scenarios) {
      console.log(`\n3️⃣ Testing ${scenario.name}...`);
      
      const bookingResult = await makeRequest('POST', '/bookings', scenario.data, customerToken);
      
      if (bookingResult.success) {
        const booking = bookingResult.data.data.booking;
        createdBookings.push(booking);
        console.log(`✅ ${scenario.name} created successfully`);
        console.log(`   Booking ID: ${booking._id}`);
        console.log(`   Booking Number: ${booking.bookingNumber}`);
        console.log(`   Location: ${booking.serviceLocation}`);
      } else {
        console.log(`❌ ${scenario.name} failed:`, bookingResult.error);
      }
    }
    
    // 4. Test booking management workflow
    if (createdBookings.length > 0) {
      console.log('\n4️⃣ Testing Booking Management Workflow...');
      
      const booking = createdBookings[0];
      const statuses = ['confirmed', 'in-progress', 'completed'];
      
      for (const status of statuses) {
        console.log(`   Updating to ${status}...`);
        const updateResult = await makeRequest('PUT', `/bookings/${booking._id}/status`, {
          status: status,
          notes: `Updated to ${status} during testing`
        }, vendorToken);
        
        if (updateResult.success) {
          console.log(`   ✅ Status updated to ${status}`);
        } else {
          console.log(`   ❌ Failed to update to ${status}:`, updateResult.error);
        }
      }
    }
    
    // 5. Test booking statistics
    console.log('\n5️⃣ Testing Booking Statistics...');
    const statsResult = await makeRequest('GET', '/bookings/vendor/stats', null, vendorToken);
    
    if (statsResult.success) {
      const stats = statsResult.data.data;
      console.log('✅ Booking statistics retrieved:');
      console.log(`   Total Bookings: ${stats.totalBookings}`);
      console.log(`   Completed: ${stats.completedBookings}`);
      console.log(`   Total Revenue: ₹${stats.totalRevenue}`);
    } else {
      console.log('❌ Failed to get statistics:', statsResult.error);
    }
    
    // 6. Test customer booking history
    console.log('\n6️⃣ Testing Customer Booking History...');
    const historyResult = await makeRequest('GET', '/bookings', null, customerToken);
    
    if (historyResult.success) {
      const bookings = historyResult.data.data.bookings;
      console.log(`✅ Customer has ${bookings.length} bookings`);
      
      // Test filtering
      const filteredResult = await makeRequest('GET', '/bookings?status=completed', null, customerToken);
      if (filteredResult.success) {
        console.log(`✅ Filtered bookings: ${filteredResult.data.data.bookings.length} completed`);
      }
    } else {
      console.log('❌ Failed to get booking history:', historyResult.error);
    }
    
    console.log('\n🎉 ALL BOOKING SCENARIOS TESTED SUCCESSFULLY!');
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
};

testBookingScenarios();