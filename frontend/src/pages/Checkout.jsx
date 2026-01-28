import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

/**
 * Checkout Page Component
 * Handle order placement and payment
 */
const Checkout = () => {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState({
    deliveryType: 'home-delivery',
    paymentMethod: 'cash-on-delivery',
    deliveryAddress: {
      name: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      pincode: user?.address?.pincode || '',
      state: user?.address?.state || ''
    },
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (orderData.deliveryType === 'home-delivery') {
      if (!orderData.deliveryAddress.name.trim()) {
        errors['deliveryAddress.name'] = 'Name is required';
      }
      if (!orderData.deliveryAddress.phone.trim()) {
        errors['deliveryAddress.phone'] = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(orderData.deliveryAddress.phone)) {
        errors['deliveryAddress.phone'] = 'Please enter a valid 10-digit phone number';
      }
      if (!orderData.deliveryAddress.street.trim()) {
        errors['deliveryAddress.street'] = 'Street address is required';
      }
      if (!orderData.deliveryAddress.city.trim()) {
        errors['deliveryAddress.city'] = 'City is required';
      }
      if (!orderData.deliveryAddress.pincode.trim()) {
        errors['deliveryAddress.pincode'] = 'Pincode is required';
      } else if (!/^[0-9]{6}$/.test(orderData.deliveryAddress.pincode)) {
        errors['deliveryAddress.pincode'] = 'Please enter a valid 6-digit pincode';
      }
      if (!orderData.deliveryAddress.state.trim()) {
        errors['deliveryAddress.state'] = 'State is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare order data
      const orderPayload = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount,
        deliveryType: orderData.deliveryType,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes
      };
      
      // Add delivery address if home delivery
      if (orderData.deliveryType === 'home-delivery') {
        orderPayload.deliveryAddress = orderData.deliveryAddress;
      }
      
      // Create order
      const response = await api.post('/orders', orderPayload);
      
      if (response.data.success) {
        // Clear cart
        clearCart();
        
        // Redirect to order confirmation
        navigate(`/orders/${response.data.data.order._id}`, {
          state: { orderPlaced: true }
        });
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Type */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Options</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="home-delivery"
                      checked={orderData.deliveryType === 'home-delivery'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Home Delivery</span>
                      <p className="text-sm text-gray-600">Get your order delivered to your doorstep</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="self-pickup"
                      checked={orderData.deliveryType === 'self-pickup'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Self Pickup</span>
                      <p className="text-sm text-gray-600">Collect your order from the vendor's location</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Address (only for home delivery) */}
              {orderData.deliveryType === 'home-delivery' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.name"
                        value={orderData.deliveryAddress.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors['deliveryAddress.name'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors['deliveryAddress.name'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['deliveryAddress.name']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="deliveryAddress.phone"
                        value={orderData.deliveryAddress.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors['deliveryAddress.phone'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors['deliveryAddress.phone'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['deliveryAddress.phone']}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.street"
                        value={orderData.deliveryAddress.street}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors['deliveryAddress.street'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors['deliveryAddress.street'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['deliveryAddress.street']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.city"
                        value={orderData.deliveryAddress.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors['deliveryAddress.city'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors['deliveryAddress.city'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['deliveryAddress.city']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.pincode"
                        value={orderData.deliveryAddress.pincode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors['deliveryAddress.pincode'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors['deliveryAddress.pincode'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['deliveryAddress.pincode']}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.state"
                        value={orderData.deliveryAddress.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors['deliveryAddress.state'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors['deliveryAddress.state'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['deliveryAddress.state']}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash-on-delivery"
                      checked={orderData.paymentMethod === 'cash-on-delivery'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay-at-shop"
                      checked={orderData.paymentMethod === 'pay-at-shop'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Pay at Shop</span>
                      <p className="text-sm text-gray-600">Pay directly at the vendor's location</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={orderData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special instructions for your order..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;