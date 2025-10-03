import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/api';


const initialState = {
  user: null,                    // Current authenticated user object
  token: localStorage.getItem('token'), // JWT token from localStorage
  isAuthenticated: false,        // Boolean indicating if user is logged in
  isLoading: true,              // Loading state for async operations
  error: null,                   // Error message for failed operations
};


const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',           // Start login process
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',       // Login completed successfully
  LOGIN_FAILURE: 'LOGIN_FAILURE',       // Login failed
  LOGOUT: 'LOGOUT',                     // User logged out
  LOAD_USER_START: 'LOAD_USER_START',   // Start loading user data
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS', // User data loaded successfully
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE', // Failed to load user data
  UPDATE_PROFILE: 'UPDATE_PROFILE',     // Profile updated
  CLEAR_ERROR: 'CLEAR_ERROR',           // Clear error state
};


const authReducer = (state, action) => {
  switch (action.type) {

    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,    // Set loading to true
        error: null,        // Clear any previous errors
      };


    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token); // Persist token
      return {
        ...state,
        user: action.payload.user,        // Store user data
        token: action.payload.token,      // Store token in state
        isAuthenticated: true,            // Mark as authenticated
        isLoading: false,                 // Stop loading
        error: null,                      // Clear errors
      };


    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,             // Store loaded user data
        isAuthenticated: true,            // Mark as authenticated
        isLoading: false,                 // Stop loading
        error: null,                      // Clear errors
      };


    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');   // Remove invalid token
      return {
        ...state,
        user: null,                       // Clear user data
        token: null,                      // Clear token
        isAuthenticated: false,           // Mark as not authenticated
        isLoading: false,                 // Stop loading
        error: action.payload,            // Store error message
      };


    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');   // Remove token from storage
      return {
        ...state,
        user: null,                       // Clear user data
        token: null,                      // Clear token
        isAuthenticated: false,           // Mark as not authenticated
        isLoading: false,                 // Stop loading
        error: null,                      // Clear errors
      };


    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload }, // Merge updated profile data
      };


    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,                      // Clear error message
      };


    default:
      return state;
  }
};


const AuthContext = createContext();


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {

  const [state, dispatch] = useReducer(authReducer, initialState);

  
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          const response = await authService.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: response.data.user,
          });
        } catch (error) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: error.response?.data?.message || 'Failed to load user',
          });
        }
      } else {

        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: null,
        });
      }
    };

    loadUser();
  }, []);

  
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authService.login(credentials);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data.data,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  // Enhanced Admin Login with Security Features
  const adminLogin = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authService.adminLogin(credentials);
      
      // Check if two-factor authentication is required
      if (response.data.requiresTwoFactor) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: 'Two-factor authentication required',
        });
        return {
          requires2FA: true,
          tempToken: response.data.tempToken,
          message: response.data.message
        };
      }

      // Successful login - extract token and user from response
      const { token, user, sessionInfo } = response.data.data;
      
      // Dispatch LOGIN_SUCCESS with correct payload structure
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token,
          user
        },
      });
      
      return {
        success: true,
        user,
        token,
        sessionInfo
      };
    } catch (error) {
      // Handle specific error status codes
      const errorMessage = error.response?.data?.message || 'Admin login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      // Re-throw with status for component to handle
      const errorToThrow = new Error(errorMessage);
      errorToThrow.response = error.response;
      throw errorToThrow;
    }
  }, []);

  
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authService.register(userData);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data.data,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  
  const updateProfile = useCallback(async (profileData) => {
    const response = await authService.updateProfile(profileData);
    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: response.data.user,
    });
    return response.data;
  }, []);

  
  const changePassword = useCallback(async (passwordData) => {
    const response = await authService.changePassword(passwordData);
    return response.data;
  }, []);

  
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(state.user?.role);
  }, [state.user?.role]);

  
  const isAdmin = useCallback(() => {
    return state.user?.role === 'admin';
  }, [state.user?.role]);

  
  const isStudent = useCallback(() => {
    return state.user?.role === 'student';
  }, [state.user?.role]);


  const value = useMemo(() => ({
    ...state,           // Spread current state
    login,              // Authentication methods
    adminLogin,         // Enhanced admin login
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,         // State management
    hasRole,            // Role checking utilities
    hasAnyRole,
    isAdmin,
    isStudent,
  }), [state, login, adminLogin, register, logout, updateProfile, changePassword, clearError, hasRole, hasAnyRole, isAdmin, isStudent]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

