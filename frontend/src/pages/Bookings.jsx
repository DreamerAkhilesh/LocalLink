import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Bookings Page Component
 * Display customer booking history or vendor booking management based on user role
 */
const Bookings = () => {
  const { user } = useAuth();
  
  // Redirect to appropriate component based on user role
  if (user?.role === 'vendor') {
    return <VendorBookings />;
  }
  
  return <CustomerBookings />;
};

/**
 * Customer Bookings Component
 * Display customer booking history and status
 */
const CustomerBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      params.append('sort', filters.sortBy === 'newest' ? '-bookingDate' : 'bookingDate');
      
      const response = await api.get(`/bookings?${params.toString()}`);
      setBookings(response.data.data.bookings || []);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const formatDateTime = (date, time) => {
    const bookingDate = new Date(date);
    const [hours, minutes] = time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes));
    
    return bookingDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      rescheduled: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      rescheduled: '📅',
      'in-progress': '🔄',
      completed: '✅',
      cancelled: '❌',
      'no-show': '👻',
      refunded: '💰'
    };
    return icons[status] || '📋';
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      fetchBookings(); // Refresh bookings
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleRescheduleBooking = (booking) => {
    // TODO: Implement reschedule modal
    alert('Reschedule functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              
              {/* Filters */}
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Bookings</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.status === 'all' 
                    ? "You haven't made any bookings yet." 
                    : `No bookings found with status: ${filters.status}`
                  }
                </p>
                <button
                  onClick={() => window.location.href = '/services'}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            #{booking.bookingNumber}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)} {booking.status.replace('-', ' ').toUpperCase()}
                          </span>
                          {booking.serviceLocation === 'customer-location' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              🏠 At Your Location
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <p className="font-medium text-gray-900">{booking.serviceDetails?.name}</p>
                          <p>Scheduled: {formatDateTime(booking.scheduledDate, booking.scheduledTime)}</p>
                          <p>Provider: {booking.vendor?.businessName} • Amount: {formatPrice(booking.totalAmount)}</p>
                          <p>Payment: {booking.paymentMethod.replace('-', ' ')} ({booking.paymentStatus})</p>
                        </div>

                        {/* Service Location */}
                        {booking.serviceLocation === 'customer-location' && booking.serviceAddress && (
                          <div className="text-xs text-gray-500 mb-2">
                            📍 {booking.serviceAddress.street}, {booking.serviceAddress.city}
                          </div>
                        )}

                        {/* Special Requests */}
                        {booking.specialRequests && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
                            💬 {booking.specialRequests}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                        
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => handleRescheduleBooking(booking)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDateTime={formatDateTime}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
};

/**
 * Vendor Bookings Component
 * Manage incoming bookings for vendors
 */
const VendorBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    sortBy: 'newest'
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.date) {
        params.append('date', filters.date);
      }
      
      params.append('sort', filters.sortBy === 'newest' ? '-scheduledDate' : 'scheduledDate');
      
      const response = await api.get(`/bookings/vendor?${params.toString()}`);
      setBookings(response.data.data.bookings || []);
      setError('');
    } catch (err) {
      console.error('Error fetching vendor bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/bookings/vendor/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching booking stats:', err);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus, notes = '') => {
    try {
      await api.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        notes: notes
      });
      
      fetchBookings(); // Refresh bookings
      fetchStats(); // Refresh stats
      setSelectedBooking(null);
      alert('Booking status updated successfully');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const formatDateTime = (date, time) => {
    const bookingDate = new Date(date);
    const [hours, minutes] = time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes));
    
    return bookingDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      rescheduled: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      rescheduled: '📅',
      'in-progress': '🔄',
      completed: '✅',
      cancelled: '❌',
      'no-show': '👻',
      refunded: '💰'
    };
    return icons[status] || '📋';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'in-progress',
      'in-progress': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getStatusAction = (status) => {
    const actions = {
      pending: 'Confirm Booking',
      confirmed: 'Start Service',
      'in-progress': 'Complete Service'
    };
    return actions[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
              
              {/* Filters */}
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Bookings</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-800">{stats.pendingBookings}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.confirmedBookings}</div>
                <div className="text-sm text-blue-600">Confirmed</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{stats.completedBookings}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-800">{stats.todayBookings}</div>
                <div className="text-sm text-indigo-600">Today</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-800">{stats.upcomingBookings}</div>
                <div className="text-sm text-purple-600">Upcoming</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-800">{formatPrice(stats.totalRevenue)}</div>
                <div className="text-sm text-emerald-600">Revenue</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.status === 'all' 
                    ? "No bookings have been made yet." 
                    : `No bookings found with the selected filters.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            #{booking.bookingNumber}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)} {booking.status.replace('-', ' ').toUpperCase()}
                          </span>
                          {booking.serviceLocation === 'customer-location' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              🏠 Customer Location
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <p className="font-medium text-gray-900">{booking.serviceDetails?.name}</p>
                          <p>Customer: {booking.customer?.name} • {booking.customer?.phone}</p>
                          <p>Scheduled: {formatDateTime(booking.scheduledDate, booking.scheduledTime)}</p>
                          <p>Amount: {formatPrice(booking.totalAmount)} • Payment: {booking.paymentMethod.replace('-', ' ')}</p>
                        </div>

                        {/* Customer Address for home service */}
                        {booking.serviceLocation === 'customer-location' && booking.serviceAddress && (
                          <div className="text-xs text-gray-500 mb-2">
                            📍 {booking.serviceAddress.street}, {booking.serviceAddress.city}, {booking.serviceAddress.state} - {booking.serviceAddress.pincode}
                          </div>
                        )}

                        {/* Special Requests */}
                        {booking.specialRequests && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
                            💬 {booking.specialRequests}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                        
                        {getNextStatus(booking.status) && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, getNextStatus(booking.status))}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            {getStatusAction(booking.status)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <VendorBookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={updateBookingStatus}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDateTime={formatDateTime}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getNextStatus={getNextStatus}
          getStatusAction={getStatusAction}
        />
      )}
    </div>
  );
};

// Booking Details Modal Component (Customer)
const BookingDetailsModal = ({ 
  booking, 
  onClose, 
  formatPrice, 
  formatDate, 
  formatTime, 
  formatDateTime,
  getStatusColor, 
  getStatusIcon 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">#{booking.bookingNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)} {booking.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Service:</p>
                <p className="font-medium">{booking.serviceDetails?.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Provider:</p>
                <p className="font-medium">{booking.vendor?.businessName}</p>
              </div>
              <div>
                <p className="text-gray-600">Scheduled Date & Time:</p>
                <p className="font-medium">{formatDateTime(booking.scheduledDate, booking.scheduledTime)}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="font-medium">{booking.serviceDetails?.duration} minutes</p>
              </div>
              <div>
                <p className="text-gray-600">Service Location:</p>
                <p className="font-medium">{booking.serviceLocation.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method:</p>
                <p className="font-medium">{booking.paymentMethod.replace('-', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Service Address */}
          {booking.serviceLocation === 'customer-location' && booking.serviceAddress && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Service Address</h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>{booking.serviceAddress.street}</p>
                <p>{booking.serviceAddress.city}, {booking.serviceAddress.state} - {booking.serviceAddress.pincode}</p>
                {booking.serviceAddress.landmark && <p>Landmark: {booking.serviceAddress.landmark}</p>}
                {booking.serviceAddress.instructions && <p>Instructions: {booking.serviceAddress.instructions}</p>}
              </div>
            </div>
          )}

          {/* Provider Contact */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Provider Contact</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="font-medium">{booking.vendor?.businessName}</p>
              <p>{booking.vendor?.phone}</p>
              <p>{booking.vendor?.email}</p>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Special Requests</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{booking.specialRequests}</p>
            </div>
          )}

          {/* Pricing */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span>{formatPrice(booking.totalAmount)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Payment Status: {booking.paymentStatus}
            </div>
          </div>

          {/* Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Booking Timeline</h4>
              <div className="space-y-2">
                {booking.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(history.status).replace('text-', 'bg-').split(' ')[0]}`}></span>
                    <span className="font-medium">{history.status.replace('-', ' ').toUpperCase()}</span>
                    <span className="text-gray-500">{formatDateTime(history.timestamp, '00:00')}</span>
                    {history.note && <span className="text-gray-600">- {history.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Vendor Booking Details Modal Component
const VendorBookingDetailsModal = ({ 
  booking, 
  onClose, 
  onUpdateStatus, 
  formatPrice, 
  formatDate, 
  formatTime, 
  formatDateTime,
  getStatusColor, 
  getStatusIcon,
  getNextStatus,
  getStatusAction
}) => {
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(booking._id, newStatus, notes);
      setNotes('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">#{booking.bookingNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)} {booking.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-600">Customer:</p>
                <p className="font-medium">{booking.customer?.name}</p>
                <p className="text-gray-600">{booking.customer?.phone}</p>
                <p className="text-gray-600">{booking.customer?.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Service:</p>
                <p className="font-medium">{booking.serviceDetails?.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Scheduled:</p>
                <p className="font-medium">{formatDateTime(booking.scheduledDate, booking.scheduledTime)}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="font-medium">{booking.serviceDetails?.duration} minutes</p>
              </div>
            </div>
          </div>

          {/* Service Location */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Service Location</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="font-medium">Type: {booking.serviceLocation.replace('-', ' ')}</p>
              {booking.serviceLocation === 'customer-location' && booking.serviceAddress && (
                <div className="mt-2">
                  <p>{booking.serviceAddress.street}</p>
                  <p>{booking.serviceAddress.city}, {booking.serviceAddress.state} - {booking.serviceAddress.pincode}</p>
                  {booking.serviceAddress.landmark && <p>Landmark: {booking.serviceAddress.landmark}</p>}
                  {booking.serviceAddress.instructions && <p>Instructions: {booking.serviceAddress.instructions}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Customer Requests</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{booking.specialRequests}</p>
            </div>
          )}

          {/* Payment Information */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Payment Information</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex justify-between items-center">
                <span>Total Amount:</span>
                <span className="font-bold text-lg">{formatPrice(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Payment Method:</span>
                <span>{booking.paymentMethod.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Payment Status:</span>
                <span>{booking.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          {getNextStatus(booking.status) && booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Update Booking Status</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this status update..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <button
                  onClick={() => handleStatusUpdate(getNextStatus(booking.status))}
                  disabled={isUpdating}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : getStatusAction(booking.status)}
                </button>
              </div>
            </div>
          )}

          {/* Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Booking Timeline</h4>
              <div className="space-y-2">
                {booking.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(history.status).replace('text-', 'bg-').split(' ')[0]}`}></span>
                    <span className="font-medium">{history.status.replace('-', ' ').toUpperCase()}</span>
                    <span className="text-gray-500">{formatDateTime(history.timestamp, '00:00')}</span>
                    {history.note && <span className="text-gray-600">- {history.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bookings;