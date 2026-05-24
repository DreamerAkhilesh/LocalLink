import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  
  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Verify OTP after registration
  verifyOtp: async ({ email, code }) => {
    const response = await api.post('/auth/verify-otp', { email, code });
    return response.data;
  },

  // Resend OTP to email
  resendOtp: async ({ email }) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },
};