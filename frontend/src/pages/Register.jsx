import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';

/**
 * Register Page Component
 * User registration form with role selection
 */
const Register = () => {
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: searchParams.get('role') || 'customer',
    address: {
      street: '',
      city: '',
      pincode: '',
      state: ''
    },
    businessInfo: {
      businessName: '',
      businessType: 'shop',
      category: '',
      description: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  const handleChange = (e) => {
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
    
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        address: formData.address
      };
      
      // Add business info for vendors
      if (formData.role === 'vendor') {
        registrationData.businessInfo = formData.businessInfo;
      }
      
      const result = await register(registrationData);
      if (result?.success === false) return;

      // Save vendor location after registration if provided
      if (formData.role === 'vendor' && locationData) {
        try {
          const api = (await import('../services/api')).default;
          await api.put('/auth/vendor/location', {
            lat: locationData.lat,
            lng: locationData.lng,
            address: locationData.address
          });
        } catch { /* non-critical, vendor can set it from profile */ }
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                  className={`${
                    formData.role === 'customer'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  } border rounded-md py-2 px-3 text-sm font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                  className={`${
                    formData.role === 'vendor'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  } border rounded-md py-2 px-3 text-sm font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  Vendor
                </button>
              </div>
            </div>
            
            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Min 6 characters with uppercase, lowercase, and a number</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            
            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.pincode"
                      name="address.pincode"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <div className="mt-1">
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Business Information (Vendor Only) */}
            {formData.role === 'vendor' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                
                <div>
                  <label htmlFor="businessInfo.businessName" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="businessInfo.businessName"
                      name="businessInfo.businessName"
                      type="text"
                      required
                      value={formData.businessInfo.businessName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="businessInfo.businessType" className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="businessInfo.businessType"
                      name="businessInfo.businessType"
                      value={formData.businessInfo.businessType}
                      onChange={(e) => {
                        handleChange(e);
                        // Reset category when business type changes
                        setFormData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, businessType: e.target.value, category: '' }
                        }));
                      }}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="shop">Shop</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="businessInfo.category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="mt-1">
                    <select
                      id="businessInfo.category"
                      name="businessInfo.category"
                      required
                      value={formData.businessInfo.category}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a category</option>
                      {formData.businessInfo.businessType === 'shop' ? (
                        <>
                          <option value="grocery">Grocery</option>
                          <option value="clothing">Clothing</option>
                          <option value="electronics">Electronics</option>
                          <option value="pharmacy">Pharmacy</option>
                          <option value="stationery">Stationery</option>
                          <option value="bakery">Bakery</option>
                          <option value="other-shop">Other Shop</option>
                        </>
                      ) : (
                        <>
                          <option value="plumber">Plumber</option>
                          <option value="electrician">Electrician</option>
                          <option value="carpenter">Carpenter</option>
                          <option value="painter">Painter</option>
                          <option value="cleaner">Cleaner</option>
                          <option value="mechanic">Mechanic</option>
                          <option value="tutor">Tutor</option>
                          <option value="other-service">Other Service</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="businessInfo.description" className="block text-sm font-medium text-gray-700">
                    Business Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="businessInfo.description"
                      name="businessInfo.description"
                      rows={3}
                      value={formData.businessInfo.description}
                      onChange={handleChange}
                      placeholder="Brief description of your business"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Business Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Location <span className="text-gray-400 font-normal">(recommended)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Helps customers nearby discover your business. You can also set this later from your profile.
                  </p>
                  {locationData ? (
                    <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                      <span className="text-green-600">📌</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">{locationData.address}</p>
                        <p className="text-xs text-green-600">{locationData.lat.toFixed(5)}, {locationData.lng.toFixed(5)}</p>
                      </div>
                      <button type="button" onClick={() => setLocationData(null)} className="text-gray-400 hover:text-red-500 text-lg leading-none">&times;</button>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                      <p className="text-xs text-yellow-700">No location set. Customers won't find you in location-based searches.</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    🗺️ {locationData ? 'Change Location' : 'Set Business Location'}
                  </button>
                </div>
              </div>
            )}

            {/* Location Picker Modal */}
            {showLocationPicker && (
              <LocationPicker
                onConfirm={({ lat, lng, address }) => { setLocationData({ lat, lng, address }); setShowLocationPicker(false); }}
                onClose={() => setShowLocationPicker(false)}
                initialLat={locationData?.lat}
                initialLng={locationData?.lng}
              />
            )}
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;