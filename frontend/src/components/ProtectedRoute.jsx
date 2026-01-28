import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;