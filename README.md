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
│       ├── pages/
│       ├── context/
│       ├── services/
│       ├── utils/
│       └── App.jsx
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
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
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📦 Core Features (Phase-1)
- ✅ JWT-based Authentication
- ✅ Role-based Access Control
- ✅ Product & Service Listings
- ✅ Order & Booking Management
- ✅ Simple Payment Simulation (Cash/Pay at Shop)
- ✅ Location-based Discovery (Pincode/City)

## 👥 User Roles
1. **Customer**: Browse, search, place orders/bookings
2. **Vendor/Service Provider**: Manage listings, handle requests
3. **Admin**: User management, listing approval

## 💳 Payment System
- Cash on Delivery
- Pay at Shop
- Payment Status: UNPAID/PAID
- No external payment gateway integration in Phase-1

## 🔮 Future Scope (Phase-2)
- Online payments (Razorpay integration)
- Ratings & Reviews system
- Live chat using Socket.io
- Delivery partner integration
- AI-based recommendation system
- Google Maps integration

## 📊 Database Schema
- User (role-based)
- VendorProfile
- Product
- Service
- Order
- Booking

## 🎓 Academic Context
This project is designed for B.Tech final year evaluation with:
- Industry-standard architecture
- Clean, commented code
- Scalable design patterns
- Demo-ready features
- Comprehensive documentation

---
**Built with ❤️ for local community empowerment**