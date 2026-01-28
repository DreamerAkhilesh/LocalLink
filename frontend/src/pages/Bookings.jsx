import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Bookings Page Component
 * View and manage service bookings
 */
const Bookings = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {user?.role === 'vendor' ? 'Booking Management' : 'My Bookings'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'vendor' 
            ? 'Manage service bookings from customers' 
            : 'Track your service bookings and appointments'
          }
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bookings Coming Soon</h3>
        <p className="text-gray-500 mb-6">
          Service booking functionality is currently under development.
        </p>
        <div className="space-x-4">
          <a
            href="/services"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Services
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

export default Bookings;