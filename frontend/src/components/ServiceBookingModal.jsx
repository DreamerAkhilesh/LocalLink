import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Service Booking Modal Component
 * Allows customers to book services with scheduling and location options
 */
const ServiceBookingModal = ({ service, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    serviceLocation: 'customer-location',
    paymentMethod: 'cash',
    specialRequests: '',
    customerInfo: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    },
    serviceAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      landmark: '',
      instructions: ''
    }
  });

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.scheduledDate) {
      errors.push('Please select a date');
    }
    
    if (!formData.scheduledTime) {
      errors.push('Please select a time');
    }
    
    if (!formData.customerInfo.name) {
      errors.push('Name is required');
    }
    
    if (!formData.customerInfo.phone || !/^[0-9]{10}$/.test(formData.customerInfo.phone)) {
      errors.push('Valid 10-digit phone number is required');
    }
    
    if (!formData.customerInfo.email || !/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
      errors.push('Valid email is required');
    }
    
    if (formData.serviceLocation === 'customer-location') {
      if (!formData.serviceAddress.street) {
        errors.push('Street address is required for home service');
      }
      if (!formData.serviceAddress.city) {
        errors.push('City is required for home service');
      }
      if (!formData.serviceAddress.pincode || !/^[0-9]{6}$/.test(formData.serviceAddress.pincode)) {
        errors.push('Valid 6-digit pincode is required for home service');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const bookingData = {
        serviceId: service._id,
        ...formData
      };
      
      const response = await api.post('/bookings', bookingData);
      
      if (response.data.success) {
        onBookingSuccess(response.data.data.booking);
        onClose();
        alert('Booking created successfully! You will receive a confirmation shortly.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Book Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Service Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-lg">{service?.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{service?.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(service?.basePrice)}
            </span>
            <span className="text-sm text-gray-500">
              Duration: {service?.duration?.estimated} {service?.duration?.unit}
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                min={getMinDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time *
              </label>
              <select
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select time</option>
                {generateTimeSlots().map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Location *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceLocation"
                  value="customer-location"
                  checked={formData.serviceLocation === 'customer-location'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>At my location (Home service)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceLocation"
                  value="vendor-location"
                  checked={formData.serviceLocation === 'vendor-location'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>At service provider's location</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceLocation"
                  value="online"
                  checked={formData.serviceLocation === 'online'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Online service</span>
              </label>
            </div>
          </div>

          {/* Service Address (if customer location) */}
          {formData.serviceLocation === 'customer-location' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Service Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="serviceAddress.street"
                    value={formData.serviceAddress.street}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="serviceAddress.city"
                    value={formData.serviceAddress.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="serviceAddress.state"
                    value={formData.serviceAddress.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="serviceAddress.pincode"
                    value={formData.serviceAddress.pincode}
                    onChange={handleInputChange}
                    placeholder="123456"
                    pattern="[0-9]{6}"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="serviceAddress.landmark"
                    value={formData.serviceAddress.landmark}
                    onChange={handleInputChange}
                    placeholder="Near landmark"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    name="serviceAddress.instructions"
                    value={formData.serviceAddress.instructions}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for reaching your location"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerInfo.name"
                  value={formData.customerInfo.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerInfo.phone"
                  value={formData.customerInfo.phone}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerInfo.email"
                  value={formData.customerInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Cash Payment</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay-at-service"
                  checked={formData.paymentMethod === 'pay-at-service'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Pay at Service</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={formData.paymentMethod === 'online'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Online Payment (Coming Soon)</span>
              </label>
            </div>
          </div>

          {/* Special Requests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Any special requirements or requests for the service provider"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
            <div className="flex justify-between items-center">
              <span>Service: {service?.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Duration: {service?.duration?.estimated} {service?.duration?.unit}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-2 mt-2">
              <span>Total Amount:</span>
              <span className="text-green-600">{formatPrice(service?.basePrice)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBookingModal;