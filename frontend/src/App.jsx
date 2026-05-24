import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LocationBar from './components/LocationBar';
import ToastContainer from './components/ToastContainer';

// Pages
import Home from './pages/Home';
import VerifyOtp from './pages/VerifyOtp';
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

// Smart home route: authenticated users go straight to their dashboard
const HomeOrDashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <CartProvider>
        <LocationProvider>
          <NotificationProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
                <Navbar />
                <LocationBar />
                <ToastContainer />

                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomeOrDashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:id" element={<ServiceDetail />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute><Checkout /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute><Orders /></ProtectedRoute>
                    } />
                    <Route path="/bookings" element={
                      <ProtectedRoute><Bookings /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute><Profile /></ProtectedRoute>
                    } />
                    <Route path="/products/new" element={
                      <ProtectedRoute><AddProduct /></ProtectedRoute>
                    } />
                    <Route path="/products/:id/edit" element={
                      <ProtectedRoute><AddProduct /></ProtectedRoute>
                    } />
                    <Route path="/services/new" element={
                      <ProtectedRoute><AddService /></ProtectedRoute>
                    } />
                    <Route path="/services/:id/edit" element={
                      <ProtectedRoute><AddService /></ProtectedRoute>
                    } />

                    {/* 404 */}
                    <Route path="*" element={
                      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                        <div className="text-8xl font-black gradient-text mb-4">404</div>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Page Not Found</h1>
                        <p className="mb-8" style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist.</p>
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
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
