import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const { adminLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await adminLogin(formData);
      
      // Check if response indicates 2FA is required
      if (response && response.requires2FA) {
        setShow2FA(true);
        toast.success('Please enter your two-factor authentication code');
        setIsLoading(false);
        return;
      }

      // Successful login
      if (response && response.success) {
        toast.success('Admin login successful!');
        // Explicitly navigate to admin dashboard
        navigate('/admin');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
      
      if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please try again later.');
      } else if (error.response?.status === 423) {
        toast.error(errorMessage);
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setFormData({
      email: 'admin@syriana.edu',
      password: 'admin123',
      twoFactorCode: ''
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Secure access for administrators only
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="admin@syriana.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            {show2FA && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
                  Two-Factor Authentication Code
                </label>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  required
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in as Admin'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleQuickLogin}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Quick Admin Login
              </button>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Student Login
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Security Notice
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>This is a secure admin portal.</p>
              <p>All access attempts are logged and monitored.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-300 hover:text-white"
          >
             Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
