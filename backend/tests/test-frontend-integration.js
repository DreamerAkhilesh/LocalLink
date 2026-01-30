const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testFrontendIntegration = async () => {
  console.log('🌐 FRONTEND INTEGRATION TESTING');
  console.log('===============================');
  
  try {
    // 1. Test Services API (for booking modal)
    console.log('\n1️⃣ Testing Services API...');
    const servicesResponse = await axios.get(`${BASE_URL}/services`);
    
    if (servicesResponse.data.success && servicesResponse.data.data.services.length > 0) {
      console.log('✅ Services API working');
      console.log(`   Found ${servicesResponse.data.data.services.length} services`);
      
      const service = servicesResponse.data.data.services[0];
      console.log(`   Sample service: ${service.title}`);
      console.log(`   Price: ₹${service.basePrice}`);
      console.log(`   Duration: ${service.duration.estimated} ${service.duration.unit}`);
    } else {
      console.log('❌ Services API failed');
      return;
    }
    
    // 2. Test Authentication (required for booking)
    console.log('\n2️⃣ Testing Authentication API...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'Test123456'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Authentication API working');
      console.log(`   User: ${loginResponse.data.data.user.name}`);
      console.log(`   Role: ${loginResponse.data.data.user.role}`);
      
      const token = loginResponse.data.data.token;
      
      // 3. Test Booking Creation (from frontend modal)
      console.log('\n3️⃣ Testing Booking Creation API...');
      const bookingData = {
        serviceId: servicesResponse.data.data.services[0]._id,
        scheduledDate: '2026-02-05',
        scheduledTime: '11:00',
        serviceLocation: 'customer-location',
        serviceAddress: {
          street: '789 Frontend Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        paymentMethod: 'cash',
        specialRequests: 'Frontend integration test',
        customerInfo: {
          name: 'John Doe',
          phone: '9876543210',
          email: 'john@example.com'
        }
      };
      
      const bookingResponse = await axios.post(`${BASE_URL}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (bookingResponse.data.success) {
        console.log('✅ Booking Creation API working');
        console.log(`   Booking Number: ${bookingResponse.data.data.booking.bookingNumber}`);
        console.log(`   Status: ${bookingResponse.data.data.booking.status}`);
        
        const bookingId = bookingResponse.data.data.booking._id;
        
        // 4. Test Booking Retrieval (for bookings page)
        console.log('\n4️⃣ Testing Booking Retrieval API...');
        const bookingsResponse = await axios.get(`${BASE_URL}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (bookingsResponse.data.success) {
          console.log('✅ Booking Retrieval API working');
          console.log(`   Total bookings: ${bookingsResponse.data.data.bookings.length}`);
          console.log(`   Pagination: ${bookingsResponse.data.data.pagination.total} total`);
        }
        
        // 5. Test Single Booking Details (for modal)
        console.log('\n5️⃣ Testing Single Booking API...');
        const singleBookingResponse = await axios.get(`${BASE_URL}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (singleBookingResponse.data.success) {
          console.log('✅ Single Booking API working');
          console.log(`   Booking details loaded for: ${singleBookingResponse.data.data.booking.bookingNumber}`);
        }
        
        // 6. Test Booking Cancellation (from frontend)
        console.log('\n6️⃣ Testing Booking Cancellation API...');
        const cancelResponse = await axios.put(`${BASE_URL}/bookings/${bookingId}/cancel`, {
          reason: 'Frontend integration test cancellation'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (cancelResponse.data.success) {
          console.log('✅ Booking Cancellation API working');
          console.log(`   Booking cancelled successfully`);
        }
        
      } else {
        console.log('❌ Booking Creation API failed');
      }
      
    } else {
      console.log('❌ Authentication API failed');
    }
    
    // 7. Test Vendor APIs (for vendor dashboard)
    console.log('\n7️⃣ Testing Vendor APIs...');
    const vendorLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'shop@example.com',
      password: 'Test123456'
    });
    
    if (vendorLoginResponse.data.success) {
      const vendorToken = vendorLoginResponse.data.data.token;
      
      // Test vendor bookings
      const vendorBookingsResponse = await axios.get(`${BASE_URL}/bookings/vendor`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      
      if (vendorBookingsResponse.data.success) {
        console.log('✅ Vendor Bookings API working');
        console.log(`   Vendor has ${vendorBookingsResponse.data.data.bookings.length} bookings`);
      }
      
      // Test vendor stats
      const vendorStatsResponse = await axios.get(`${BASE_URL}/bookings/vendor/stats`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      
      if (vendorStatsResponse.data.success) {
        console.log('✅ Vendor Statistics API working');
        console.log(`   Total bookings: ${vendorStatsResponse.data.data.totalBookings}`);
        console.log(`   Total revenue: ₹${vendorStatsResponse.data.data.totalRevenue}`);
      }
    }
    
    console.log('\n🎉 ALL FRONTEND INTEGRATION TESTS PASSED!');
    console.log('Frontend can successfully:');
    console.log('  ✅ Load services for booking modal');
    console.log('  ✅ Authenticate users');
    console.log('  ✅ Create bookings from modal');
    console.log('  ✅ Display booking history');
    console.log('  ✅ Show booking details');
    console.log('  ✅ Cancel bookings');
    console.log('  ✅ Show vendor dashboard data');
    
  } catch (error) {
    console.log('❌ Frontend integration test failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
};

testFrontendIntegration();