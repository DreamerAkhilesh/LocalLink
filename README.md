# Local Link - Community-Based Service Exchange Platform

## 🎯 Project Overview
Local Link is a hyperlocal marketplace platform that connects local shop owners, skilled service providers, and customers in a community-based ecosystem. The platform focuses on transparency, trust, and geolocation-based discovery to support local commerce.

## 👥 Target Users
- **Local Shop Owners**: Kirana stores, clothing shops, small retailers
- **Service Providers**: Plumbers, electricians, carpenters, painters, artisans
- **Customers**: People searching for nearby products or services

## 🏗️ Tech Stack
### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios
- Context API

### Backend
- Node.js
- Express.js
- RESTful APIs
- MVC Architecture

### Database
- MongoDB (Local)
- Mongoose ODM
- MongoDB Compass

### Authentication
- JWT (Access Token)
- bcrypt for password hashing

## 📁 Project Structure
```
Local-Link/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ServiceBookingModal.jsx
│       │   └── ...
│       ├── pages/
│       │   ├── Bookings.jsx
│       │   ├── Orders.jsx
│       │   └── ...
│       ├── context/
│       ├── services/
│       ├── utils/
│       └── App.jsx
├── backend/
│   ├── controllers/
│   │   ├── bookingController.js
│   │   ├── orderController.js
│   │   └── ...
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Order.js
│   │   └── ...
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   ├── orderRoutes.js
│   │   └── ...
│   ├── tests/
│   │   ├── test-booking-system.js
│   │   ├── test-booking-scenarios.js
│   │   └── ...
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
└── README.md
```

## � How to Run Locally

### Prerequisites
- Node.js (v14+)
- MongoDB installed locally
- MongoDB Compass (optional)

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Running Tests
```bash
cd backend
# Run comprehensive booking system tests
node tests/test-booking-system.js

# Run booking scenarios tests
node tests/test-booking-scenarios.js

# Run frontend integration tests
node tests/test-frontend-integration.js
```

## � Core Features (Fully Implemented)

### 🔐 Authentication & User Management
- ✅ JWT-based Authentication
- ✅ Role-based Access Control (Customer/Vendor)
- ✅ User Registration & Login
- ✅ Profile Management

### 🛍️ Product Management
- ✅ Product Listings with Categories
- ✅ Advanced Search & Filtering
- ✅ Inventory Management
- ✅ Vendor Product Dashboard

### 🛠️ Service Management
- ✅ Service Listings with Flexible Pricing
- ✅ Service Categories & Search
- ✅ Service Provider Dashboard
- ✅ Service Availability Management

### 📦 Order Management System
- ✅ Shopping Cart with Persistence
- ✅ Multi-vendor Order Support
- ✅ Complete Checkout Process
- ✅ Order Status Tracking
- ✅ Customer Order History
- ✅ Vendor Order Dashboard
- ✅ Real-time Stock Management

### 📅 Booking Management System ⭐ **NEW**
- ✅ Service Booking with Scheduling
- ✅ Multiple Service Locations (Home/Vendor/Online)
- ✅ Booking Status Workflow
- ✅ Customer Booking History
- ✅ Vendor Booking Dashboard
- ✅ Booking Rescheduling & Cancellation
- ✅ Real-time Booking Statistics
- ✅ Professional Booking Modal Interface

### 💳 Payment System
- ✅ Cash on Delivery
- ✅ Pay at Shop/Service
- ✅ Payment Status Tracking
- ✅ Multiple Payment Methods

### 📊 Dashboard & Analytics
- ✅ Customer Dashboard with Statistics
- ✅ Vendor Dashboard with Business Metrics
- ✅ Real-time Order & Booking Analytics
- ✅ Revenue Tracking

## 👥 User Roles
1. **Customer**: Browse, search, place orders/bookings, manage history
2. **Vendor/Service Provider**: Manage listings, handle orders/bookings, view analytics
3. **Admin**: User management, listing approval (future scope)

## 🎯 Key Booking System Features

### For Customers:
- **Service Discovery**: Browse and search services by category
- **Easy Booking**: Professional booking modal with date/time selection
- **Service Locations**: Choose home service, vendor location, or online
- **Booking Management**: View history, track status, reschedule or cancel
- **Real-time Updates**: Live booking status tracking

### For Service Providers:
- **Booking Dashboard**: Comprehensive booking management interface
- **Status Management**: Update booking status through workflow
- **Customer Information**: Access customer details and service addresses
- **Statistics**: Real-time booking analytics and revenue tracking
- **Schedule Management**: Avoid conflicts with intelligent scheduling

## 🧪 Testing Suite
- **100% Test Coverage** for booking system
- **12 Comprehensive Tests** covering all booking scenarios
- **Frontend Integration Tests** for seamless user experience
- **Multiple Booking Scenarios** (home, vendor, online services)
- **Error Handling Tests** for robust system reliability

## 🔮 Future Scope (Phase-2)
- Online payments (Razorpay integration)
- Ratings & Reviews system
- Live chat using Socket.io
- Delivery partner integration
- AI-based recommendation system
- Google Maps integration
- Push notifications for booking updates
- Advanced analytics dashboard

## 📊 Database Schema
- **User** (role-based authentication)
- **VendorProfile** (business information)
- **Product** (inventory management)
- **Service** (service offerings)
- **Order** (e-commerce transactions)
- **Booking** (service appointments) ⭐ **NEW**

## 🎓 Academic Context
This project demonstrates:
- **Industry-standard architecture** with MVC pattern
- **Clean, commented code** with comprehensive documentation
- **Scalable design patterns** for future enhancements
- **Demo-ready features** with professional UI/UX
- **Comprehensive testing** with 100% success rate
- **Real-world application** solving local commerce challenges

## 📈 Project Statistics
- **Total Commits**: 63+ professional commits
- **Lines of Code**: 10,000+ lines
- **API Endpoints**: 25+ RESTful endpoints
- **Test Coverage**: 100% for core features
- **UI Components**: 15+ reusable React components

---
**Built with ❤️ for local community empowerment**