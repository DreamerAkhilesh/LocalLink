const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let authTokens = {
  customer: '',
  vendor: ''
};

let testData = {
  customerId: '',
  vendorId: '',
  serviceId: '',
  bookingId: ''
};

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

// Test functions
const testHealthCheck = async () => {
  console.log('\n🏥 Testing API Health Check...');
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    console.log('✅ API Health Check passed');
    console.log(`   Message: ${result.data.message}`);
  } else {
    console.log('❌ API Health Check failed:', result.error);
  }
  
  return result.success;
};

const testUserAuthentication = async () => {
  console.log('\n🔐 Testing User Authentication...');
  
  // Test customer login
  console.log('   Testing customer login...');
  const customerLogin = await makeRequest('POST', '/auth/login', {
    email: 'john@example.com',
    password: 'Test123456'
  });
  
  if (customerLogin.success) {
    authTokens.customer = customerLogin.data.data.token;
    testData.customerId = customerLogin.data.data.user.id;
    console.log('   ✅ Customer login successful');
  } else {
    console.log('   ❌ Customer login failed:', customerLogin.error);
    return false;
  }
  
  // Test vendor login
  console.log('   Testing vendor login...');
  const vendorLogin = await makeRequest('POST', '/auth/login', {
    email: 'shop@example.com',
    password: 'Test123456'
  });
  
  if (vendorLogin.success) {
    authTokens.vendor = vendorLogin.data.data.token;
    testData.vendorId = vendorLogin.data.data.user.id;
    console.log('   ✅ Vendor login successful');
  } else {
    console.log('   ❌ Vendor login failed:', vendorLogin.error);
    return false;
  }
  
  return true;
};

const testServiceRetrieval = async () => {
  console.log('\n🛠️ Testing Service Retrieval...');
  
  const result = await makeRequest('GET', '/services?limit=1');
  
  if (result.success && result.data.data.services.length > 0) {
    testData.serviceId = result.data.data.services[0]._id;
    console.log('✅ Service retrieval successful');
    console.log(`   Service ID: ${testData.serviceId}`);
    console.log(`   Service: ${result.data.data.services[0].title}`);
    return true;
  } else {
    console.log('❌ Service retrieval failed:', result.error);
    return false;
  }
};

const testBookingCreation = async () => {
  console.log('\n📅 Testing Booking Creation...');
  
  // Calculate future date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const scheduledDate = tomorrow.toISOString().split('T')[0];
  
  const bookingData = {
    serviceId: testData.serviceId,
    scheduledDate: scheduledDate,
    scheduledTime: '14:30',
    serviceLocation: 'customer-location',
    serviceAddress: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      landmark: 'Near Test Mall',
      instructions: 'Ring the doorbell twice'
    },
    paymentMethod: 'cash',
    specialRequests: 'Please bring all necessary tools',
    customerInfo: {
      name: 'John Doe',
      phone: '9876543210',
      email: 'john@example.com'
    }
  };
  
  const result = await makeRequest('POST', '/bookings', bookingData, authTokens.customer);
  
  if (result.success) {
    testData.bookingId = result.data.data.booking._id;
    console.log('✅ Booking creation successful');
    console.log(`   Booking ID: ${testData.bookingId}`);
    console.log(`   Booking Number: ${result.data.data.booking.bookingNumber}`);
    console.log(`   Status: ${result.data.data.booking.status}`);
    console.log(`   Scheduled: ${scheduledDate} at ${bookingData.scheduledTime}`);
    return true;
  } else {
    console.log('❌ Booking creation failed:', result.error);
    return false;
  }
};

const testCustomerBookingRetrieval = async () => {
  console.log('\n👤 Testing Customer Booking Retrieval...');
  
  const result = await makeRequest('GET', '/bookings', null, authTokens.customer);
  
  if (result.success) {
    const bookings = result.data.data.bookings;
    console.log('✅ Customer booking retrieval successful');
    console.log(`   Total bookings: ${bookings.length}`);
    
    if (bookings.length > 0) {
      console.log(`   Latest booking: ${bookings[0].bookingNumber}`);
      console.log(`   Status: ${bookings[0].status}`);
      console.log(`   Service: ${bookings[0].serviceDetails.name}`);
    }
    return true;
  } else {
    console.log('❌ Customer booking retrieval failed:', result.error);
    return false;
  }
};

const testVendorBookingRetrieval = async () => {
  console.log('\n🏪 Testing Vendor Booking Retrieval...');
  
  const result = await makeRequest('GET', '/bookings/vendor', null, authTokens.vendor);
  
  if (result.success) {
    const bookings = result.data.data.bookings;
    console.log('✅ Vendor booking retrieval successful');
    console.log(`   Total bookings: ${bookings.length}`);
    
    if (bookings.length > 0) {
      console.log(`   Latest booking: ${bookings[0].bookingNumber}`);
      console.log(`   Customer: ${bookings[0].customer.name}`);
      console.log(`   Status: ${bookings[0].status}`);
    }
    return true;
  } else {
    console.log('❌ Vendor booking retrieval failed:', result.error);
    return false;
  }
};

const testBookingStatusUpdate = async () => {
  console.log('\n🔄 Testing Booking Status Update...');
  
  const updateData = {
    status: 'confirmed',
    notes: 'Booking confirmed by vendor. Looking forward to providing the service.'
  };
  
  const result = await makeRequest('PUT', `/bookings/${testData.bookingId}/status`, updateData, authTokens.vendor);
  
  if (result.success) {
    console.log('✅ Booking status update successful');
    console.log(`   New status: ${result.data.data.booking.status}`);
    console.log(`   Status history entries: ${result.data.data.booking.statusHistory.length}`);
    return true;
  } else {
    console.log('❌ Booking status update failed:', result.error);
    return false;
  }
};

const testBookingRescheduling = async () => {
  console.log('\n📅 Testing Booking Rescheduling...');
  
  // Calculate new future date (day after tomorrow)
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const newScheduledDate = dayAfterTomorrow.toISOString().split('T')[0];
  
  const rescheduleData = {
    scheduledDate: newScheduledDate,
    scheduledTime: '16:00',
    reason: 'Customer requested different time slot'
  };
  
  const result = await makeRequest('PUT', `/bookings/${testData.bookingId}/reschedule`, rescheduleData, authTokens.customer);
  
  if (result.success) {
    console.log('✅ Booking rescheduling successful');
    console.log(`   New date: ${newScheduledDate}`);
    console.log(`   New time: ${rescheduleData.scheduledTime}`);
    console.log(`   Status: ${result.data.data.booking.status}`);
    return true;
  } else {
    console.log('❌ Booking rescheduling failed:', result.error);
    return false;
  }
};

const testSingleBookingRetrieval = async () => {
  console.log('\n📋 Testing Single Booking Retrieval...');
  
  const result = await makeRequest('GET', `/bookings/${testData.bookingId}`, null, authTokens.customer);
  
  if (result.success) {
    const booking = result.data.data.booking;
    console.log('✅ Single booking retrieval successful');
    console.log(`   Booking Number: ${booking.bookingNumber}`);
    console.log(`   Service: ${booking.serviceDetails.name}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Customer: ${booking.customer.name}`);
    console.log(`   Vendor: ${booking.vendor.businessName}`);
    console.log(`   Scheduled: ${booking.scheduledDate.split('T')[0]} at ${booking.scheduledTime}`);
    console.log(`   Total Amount: ₹${booking.totalAmount}`);
    console.log(`   Status History: ${booking.statusHistory.length} entries`);
    return true;
  } else {
    console.log('❌ Single booking retrieval failed:', result.error);
    return false;
  }
};

const testVendorBookingStats = async () => {
  console.log('\n📊 Testing Vendor Booking Statistics...');
  
  const result = await makeRequest('GET', '/bookings/vendor/stats', null, authTokens.vendor);
  
  if (result.success) {
    const stats = result.data.data;
    console.log('✅ Vendor booking statistics retrieval successful');
    console.log(`   Total Bookings: ${stats.totalBookings}`);
    console.log(`   Pending: ${stats.pendingBookings}`);
    console.log(`   Confirmed: ${stats.confirmedBookings}`);
    console.log(`   Completed: ${stats.completedBookings}`);
    console.log(`   Cancelled: ${stats.cancelledBookings}`);
    console.log(`   Today's Bookings: ${stats.todayBookings}`);
    console.log(`   Upcoming Bookings: ${stats.upcomingBookings}`);
    console.log(`   Total Revenue: ₹${stats.totalRevenue}`);
    return true;
  } else {
    console.log('❌ Vendor booking statistics failed:', result.error);
    return false;
  }
};

const testBookingFiltering = async () => {
  console.log('\n🔍 Testing Booking Filtering...');
  
  // Test status filtering
  console.log('   Testing status filtering...');
  const statusResult = await makeRequest('GET', '/bookings?status=rescheduled', null, authTokens.customer);
  
  if (statusResult.success) {
    console.log('   ✅ Status filtering successful');
    console.log(`   Rescheduled bookings: ${statusResult.data.data.bookings.length}`);
  } else {
    console.log('   ❌ Status filtering failed:', statusResult.error);
  }
  
  // Test date filtering for vendor
  console.log('   Testing date filtering for vendor...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateFilter = tomorrow.toISOString().split('T')[0];
  
  const dateResult = await makeRequest('GET', `/bookings/vendor?date=${dateFilter}`, null, authTokens.vendor);
  
  if (dateResult.success) {
    console.log('   ✅ Date filtering successful');
    console.log(`   Bookings for ${dateFilter}: ${dateResult.data.data.bookings.length}`);
  } else {
    console.log('   ❌ Date filtering failed:', dateResult.error);
  }
  
  return statusResult.success && dateResult.success;
};

const testBookingCancellation = async () => {
  console.log('\n❌ Testing Booking Cancellation...');
  
  const cancelData = {
    reason: 'Customer had to cancel due to emergency'
  };
  
  const result = await makeRequest('PUT', `/bookings/${testData.bookingId}/cancel`, cancelData, authTokens.customer);
  
  if (result.success) {
    console.log('✅ Booking cancellation successful');
    console.log(`   Status: ${result.data.data.booking.status}`);
    console.log(`   Cancellation reason recorded`);
    return true;
  } else {
    console.log('❌ Booking cancellation failed:', result.error);
    return false;
  }
};

// Main test runner
const runBookingSystemTests = async () => {
  console.log('🧪 BOOKING SYSTEM API TESTING SUITE');
  console.log('=====================================');
  
  const tests = [
    { name: 'API Health Check', fn: testHealthCheck },
    { name: 'User Authentication', fn: testUserAuthentication },
    { name: 'Service Retrieval', fn: testServiceRetrieval },
    { name: 'Booking Creation', fn: testBookingCreation },
    { name: 'Customer Booking Retrieval', fn: testCustomerBookingRetrieval },
    { name: 'Vendor Booking Retrieval', fn: testVendorBookingRetrieval },
    { name: 'Booking Status Update', fn: testBookingStatusUpdate },
    { name: 'Booking Rescheduling', fn: testBookingRescheduling },
    { name: 'Single Booking Retrieval', fn: testSingleBookingRetrieval },
    { name: 'Vendor Booking Statistics', fn: testVendorBookingStats },
    { name: 'Booking Filtering', fn: testBookingFiltering },
    { name: 'Booking Cancellation', fn: testBookingCancellation }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw an error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL BOOKING SYSTEM TESTS PASSED!');
    console.log('The booking system is fully functional and ready for use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API and database.');
  }
  
  console.log('\n🔧 Test Data Used:');
  console.log(`   Customer ID: ${testData.customerId}`);
  console.log(`   Vendor ID: ${testData.vendorId}`);
  console.log(`   Service ID: ${testData.serviceId}`);
  console.log(`   Booking ID: ${testData.bookingId}`);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runBookingSystemTests().catch(console.error);
}

module.exports = { runBookingSystemTests };