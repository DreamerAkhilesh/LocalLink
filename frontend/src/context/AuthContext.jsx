import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const initialState = {
  user: null,
  vendorProfile: null,
  riderProfile: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  UPDATE_VENDOR_PROFILE: 'UPDATE_VENDOR_PROFILE',
  UPDATE_RIDER_PROFILE: 'UPDATE_RIDER_PROFILE'
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        vendorProfile: action.payload.vendorProfile || null,
        riderProfile: action.payload.riderProfile || null,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null, vendorProfile: null, riderProfile: null,
        token: null, isAuthenticated: false, loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        vendorProfile: action.payload.vendorProfile || null,
        riderProfile: action.payload.riderProfile || null,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null, vendorProfile: null, riderProfile: null,
        token: null, isAuthenticated: false, loading: false, error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null, vendorProfile: null, riderProfile: null,
        token: null, isAuthenticated: false, loading: false, error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload } };

    case AUTH_ACTIONS.UPDATE_VENDOR_PROFILE:
      return { ...state, vendorProfile: { ...state.vendorProfile, ...action.payload } };

    case AUTH_ACTIONS.UPDATE_RIDER_PROFILE:
      return { ...state, riderProfile: { ...state.riderProfile, ...action.payload } };

    default:
      return state;
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getProfile();
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: response.data });
        } catch {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authService.login(credentials);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
      return { success: true, role: response.data.user?.role };
    } catch (error) {
      const rawResponse = error.response?.data;
      const errorMessage = rawResponse?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage, rawResponse };
    }
  }, []);

  // Register function — now returns { requiresOtp, email } instead of auto-logging in
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await authService.register(userData);
      // Registration succeeded but needs OTP — don't log in yet
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      // Reset loading state without success (no token yet)
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      return { success: true, requiresOtp: response.requiresOtp, email: response.data?.email };
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const errorMessage = validationErrors?.length
        ? validationErrors[0].msg
        : error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify OTP and complete login
  const verifyOtp = useCallback(async ({ email, code }) => {
    try {
      const response = await authService.verifyOtp({ email, code });
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Resend OTP
  const resendOtp = useCallback(async ({ email }) => {
    try {
      await authService.resendOtp({ email });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend code';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: response.data.user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  }, []);

  const updateVendorProfile = useCallback((profileData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_VENDOR_PROFILE, payload: profileData });
  }, []);

  const updateRiderProfile = useCallback((profileData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_RIDER_PROFILE, payload: profileData });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    updateVendorProfile,
    updateRiderProfile,
    verifyOtp,
    resendOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
