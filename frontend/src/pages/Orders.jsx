import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Orders Page Component
 * View and manage orders
 */
const Orders = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {user?.role === 'vendor' ? 'Order Management' : 'My Orders'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'vendor' 
            ? 'Manage incoming orders from customers' 
            : 'Track your product orders and delivery status'
          }
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Orders Coming Soon</h3>
        <p className="text-gray-500 mb-6">
          Order management functionality is currently under development.
        </p>
        <div className="space-x-4">
          <a
            href="/products"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Products
          </a>
          <a
            href="/dashboard"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default Orders;