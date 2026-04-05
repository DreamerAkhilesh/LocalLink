# Local Link - Community-Based Service Exchange Platform

## 🎯 Project Overview
Local Link is a hyperlocal marketplace platform that connects local shop owners, skilled service providers, and customers in a community-based ecosystem. The platform focuses on transparency, trust, and geolocation-based discovery to support local commerce.

## 👥 Target Users
- **Local Shop Owners**: Kirana stores, clothing shops, small retailers
- **Service Providers**: Plumbers, electricians, carpenters, painters, artisans
- **Customers**: People searching for nearby products or services

## 🏗️ Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router v6
- Axios
- Context API
- Leaflet.js + react-leaflet (interactive maps)

### Backend
- Node.js
- Express.js
- RESTful APIs
- MVC Architecture

### Database
- MongoDB (Local)
- Mongoose ODM
- MongoDB Compass
- Geospatial indexing (2dsphere)

### Authentication
- JWT (Access Token)
- bcrypt for password hashing

## 📁 Project Structure
```
Local-Link/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── LocationBar.jsx        # Address search + GPS location bar
│       │   ├── LocationPicker.jsx     # Leaflet map modal for vendor location
│       │   ├── NotificationBell.jsx   # In-app notification bell
│       │   ├── ServiceBookingModal.jsx
│       │   ├── Navbar.jsx
│       │   └── Cart.jsx
│       ├── pages/
│       │   ├── Products.jsx           # Role-based product listing
│       │   ├── Services.jsx           # Role-based service listing
│       │   ├── ProductDetail.jsx      # Product detail + add to cart
│       │   ├── ServiceDetail.jsx      # Service detail + book now
│       │   ├── AddProduct.jsx         # Vendor create/edit product
│       │   ├── AddService.jsx         # Vendor create/edit service
│       │   ├── Orders.jsx             # Order management (customer + vendor)
│       │   ├── Bookings.jsx           # Booking management (customer + vendor)
│       │   ├── Dashboard.jsx
│       │   └── Profile.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   ├── LocationContext.jsx    # GPS + address search state
│       │   └── NotificationContext.jsx # In-app notifications (30s polling)
│       ├── services/
│       └── App.jsx
├── backend/
│   ├── controllers/
│   │   ├── orderController.js         # Order + payment status + notifications
│   │   ├── bookingController.js       # Booking + payment status + notifications
│   │   ├── productController.js
│   │   └── serviceController.js
│   ├── models/
│   │   ├── Order.js                   # Payment status: unpaid/received/verified
│   │   ├── Booking.js                 # Payment status: unpaid/received/verified
│   │   ├── Notification.js            # In-app notification model
│   │   ├── VendorProfile.js           # GeoJSON location field
│   │   ├── Product.js
│   │   ├── Service.js
│   │   └── User.js
│   ├── routes/
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── ...
│   ├── tests/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
└── README.md
```

## 🚀 How to Run Locally

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
node tests/test-booking-system.js
node tests/test-booking-scenarios.js
node tests/test-frontend-integration.js
```

## ✅ Core Features

### 🔐 Authentication & User Management
- JWT-based Authentication with role-based access control
- Dual role registration: Customer & Vendor
- Profile management with address and business info
- Password validation (uppercase + lowercase + number)

### 🗺️ Geolocation-Based Discovery
- Vendors set their business location via interactive Leaflet map
- Customers search any address (Nominatim autocomplete — no API key needed)
- GPS detection with one click
- Radius-based filtering: 2km / 5km / 10km / 20km / 50km
- Products and services automatically filtered by vendor proximity
- Location bar visible on every page

### 🛍️ Product Management
- Vendor: Add, edit, delete products with image URLs
- Vendor: Category, price, stock, unit, discount management
- Customer: Browse all products with search, category, price, sort filters
- Customer: Product detail page with image gallery and quantity selector
- Soft delete — inactive products hidden from all views

### 🛠️ Service Management
- Vendor: Add, edit, delete services with flexible pricing models
- Pricing types: Fixed / Hourly / Per-visit / Negotiable
- Customer: Browse all services with search, category, price, sort filters
- Customer: Service detail page with booking integration
- Soft delete — inactive services hidden from all views

### 📦 Order Management System
- Shopping cart with localStorage persistence
- Multi-vendor order support (separate orders per vendor)
- Complete checkout with home delivery or self-pickup
- **Delivery status workflow** (vendor-controlled):
  `Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered`
- **Payment status tracking** (independent of delivery):
  `Unpaid → Payment Received → Payment Verified`
- Optional note on every status update
- Full timeline with timestamps in order details
- Stock auto-deducted on order, restored on cancellation
- Customer can cancel pending/confirmed orders

### 📅 Booking Management System
- Service booking with date/time scheduling
- Service location options: Home / Vendor location / Online
- Conflict prevention — no double bookings for same vendor + time slot
- **Booking status workflow** (vendor-controlled):
  `Pending → Confirmed → In-Progress → Completed`
- **Payment status tracking** (same as orders):
  `Unpaid → Payment Received → Payment Verified`
- Optional note on every status update
- Customer can reschedule or cancel bookings
- Vendor booking statistics dashboard with revenue tracking
- Revenue only counts payment-verified completed bookings

### 🔔 In-App Notification System
- Notification bell in navbar with unread count badge
- Notifications triggered on:
  - New order placed (vendor notified)
  - Order/booking status change (customer notified)
  - Payment status update (both notified)
  - Order/booking cancellation (both notified)
- 30-second polling — no Socket.io required
- Mark all read / mark individual read
- Click notification to navigate to orders/bookings page
- Last 30 notifications stored per user

### 💳 Payment System
- Cash on Delivery / Pay at Shop / Pay at Service
- Three-stage payment tracking: Unpaid → Received → Verified
- Vendor manually marks payment received and verified
- Revenue dashboard only counts verified payments

### 📊 Dashboard & Analytics
- Customer: total orders, bookings, amount spent
- Vendor: total products, services, orders, bookings
- Vendor booking stats: today's bookings, upcoming, revenue
- Quick action shortcuts for all key features

## 👥 User Roles

### Customer
- Browse products and services (filtered by location if set)
- Add to cart, checkout, track orders
- Book services, reschedule, cancel
- View notification history

### Vendor
- Add/edit/delete products and services
- Set business location on interactive map
- Manage orders: advance delivery status, mark payment
- Manage bookings: confirm, start, complete, mark payment
- View booking statistics and verified revenue

## 🗺️ Location System Details

### For Customers
1. Click the location bar at the top of any page
2. Type any city, area, or address — live suggestions appear
3. Or click "⊕ Use GPS" for automatic detection
4. Select radius (2–50 km)
5. Products and services pages now show only nearby vendors

### For Vendors
1. Go to Profile page
2. Scroll to "Business Location" section
3. Click "🗺️ Set Business Location"
4. Search any address OR click on the map OR use GPS
5. Confirm — location saved to your vendor profile

## 📊 Database Schema
- **User** — role-based authentication
- **VendorProfile** — business info + GeoJSON location (2dsphere indexed)
- **Product** — inventory with soft delete
- **Service** — service offerings with soft delete
- **Order** — delivery status + payment status + timeline
- **Booking** — booking status + payment status + timeline
- **Notification** — in-app notifications with read tracking

## 🧪 Testing
- 12 comprehensive booking system tests (100% pass rate)
- Frontend integration tests
- Multiple booking scenario tests

## 🔮 Future Scope
- Online payments (Razorpay/Stripe)
- Ratings & Reviews system
- Real-time notifications via Socket.io
- Delivery partner integration
- AI-based recommendation engine
- Push notifications (PWA)
- Advanced analytics dashboard

## 🎓 Academic Context
Demonstrates:
- Full-stack MERN development
- Geospatial queries with MongoDB 2dsphere indexes
- Role-based access control
- Real-world e-commerce patterns (multi-vendor, inventory, payment lifecycle)
- Clean MVC architecture with separation of concerns

## 📈 Project Statistics
- **Total Commits**: 75+ professional commits
- **API Endpoints**: 35+ RESTful endpoints
- **React Components**: 20+ reusable components
- **Database Models**: 7 Mongoose schemas
- **Test Coverage**: 100% for booking system

---
**Built with ❤️ for local community empowerment**
