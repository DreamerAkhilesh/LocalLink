import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';

/**
 * Profile Page Component
 * View and edit user profile
 */
const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      pincode: user?.address?.pincode || '',
      state: user?.address?.state || ''
    }
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement profile update API call
      console.log('Profile update:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        pincode: user?.address?.pincode || '',
        state: user?.address?.state || ''
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    user?.role === 'vendor' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true} // Email should not be editable
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Street Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Vendor Profile Section */}
        {user?.role === 'vendor' && user?.vendorProfile && (
          <div className="bg-white rounded-lg shadow-sm border mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Business Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={user.vendorProfile.businessName}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={user.vendorProfile.businessType}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={user.vendorProfile.category}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={user.vendorProfile.description}
                    disabled={true}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Security</h3>
          </div>
          <div className="p-6">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              Change Password
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Update your password to keep your account secure
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Location Section */}
      {user?.role === 'vendor' && <VendorLocationSection />}
    </div>
  );
};

/**
 * Vendor Location Section
 * Allows vendors to set their business location via map or GPS
 */
const VendorLocationSection = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [savedLocation, setSavedLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const handleConfirm = async ({ lat, lng, address }) => {
    setSaving(true);
    setShowPicker(false);
    try {
      await api.put('/auth/vendor/location', { lat, lng, address });
      setSavedLocation({ lat, lng, address });
      setStatus(`✅ Location saved: ${address}`);
    } catch {
      setStatus('❌ Failed to save location. Try again.');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Business Location</h2>
      <p className="text-sm text-gray-500 mb-4">
        Set your business location so nearby customers can discover your products and services.
      </p>

      {savedLocation && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <span className="text-green-600 text-lg">📌</span>
          <div>
            <p className="text-sm font-medium text-green-800">{savedLocation.address}</p>
            <p className="text-xs text-green-600 mt-0.5">{savedLocation.lat.toFixed(5)}, {savedLocation.lng.toFixed(5)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowPicker(true)}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          🗺️ {savedLocation ? 'Change Location' : 'Set Business Location'}
        </button>
      </div>

      {status && !saving && (
        <p className={`mt-3 text-sm ${status.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
      {saving && <p className="mt-3 text-sm text-gray-500">Saving location...</p>}

      {showPicker && (
        <LocationPicker
          onConfirm={handleConfirm}
          onClose={() => setShowPicker(false)}
          initialLat={savedLocation?.lat}
          initialLng={savedLocation?.lng}
        />
      )}
    </div>
  );
};

export default Profile;