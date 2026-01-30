# Booking System Test Suite

This directory contains comprehensive tests for the Local Link booking system.

## Test Files

### Core Booking System Tests
- **`test-booking-system.js`** - Main booking system API test suite (12 comprehensive tests)
- **`test-booking-scenarios.js`** - Multiple booking scenarios testing (home, vendor, online services)
- **`test-frontend-integration.js`** - Frontend-backend integration tests

### Service System Tests
- **`test-service-retrieval.js`** - Service API retrieval testing
- **`test-service-endpoint.js`** - Service endpoint functionality tests
- **`create-test-service.js`** - Service creation testing utility

### Authentication & Database Tests
- **`test-login.js`** - User authentication testing
- **`check-vendor-profile.js`** - Vendor profile validation
- **`check-services-in-db.js`** - Database service verification

### Debug & Development Tools
- **`debug-service-creation.js`** - Service creation debugging utility

## Running Tests

### Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB database connected
- Test users created (john@example.com, shop@example.com)

### Run Individual Tests
```bash
# Main booking system test
node tests/test-booking-system.js

# Booking scenarios test
node tests/test-booking-scenarios.js

# Frontend integration test
node tests/test-frontend-integration.js
```

### Test Coverage
- ✅ **Booking Creation** - All service location types
- ✅ **Booking Management** - Status updates, rescheduling, cancellation
- ✅ **User Authentication** - Customer and vendor login
- ✅ **Service Integration** - Service retrieval and booking
- ✅ **Database Operations** - CRUD operations and relationships
- ✅ **API Endpoints** - All booking-related endpoints
- ✅ **Frontend Integration** - All frontend-backend communication
- ✅ **Error Handling** - Validation and error scenarios
- ✅ **Statistics** - Booking statistics and reporting

## Test Results
All tests are currently **PASSING** with **100% success rate**.

## Test Data
Tests use the following test accounts:
- **Customer**: john@example.com / Test123456
- **Vendor**: shop@example.com / Test123456

Test services and bookings are created and managed automatically during testing.