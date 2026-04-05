import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LocationBar from './components/LocationBar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Services from './pages/Services';
import Orders from './pages/Orders';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import AddProduct from './pages/AddProduct';
import AddService from './pages/AddService';
import ProductDetail from './pages/ProductDetail';
import ServiceDetail from './pages/ServiceDetail';

/**
 * Main App Component
 * Handles routing and global state management
 */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <NotificationProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <LocationBar />
            
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/bookings" element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Vendor Product/Service Management */}
                <Route path="/products/new" element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/products/:id/edit" element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/services/new" element={
                  <ProtectedRoute>
                    <AddService />
                  </ProtectedRoute>
                } />
                <Route path="/services/:id/edit" element={
                  <ProtectedRoute>
                    <AddService />
                  </ProtectedRoute>
                } />
                
                {/* 404 Page */}
                <Route path="*" element={
                  <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                } />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
      </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;