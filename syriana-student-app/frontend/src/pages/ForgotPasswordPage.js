import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                try again
              </button>
            </p>
            <div className="mt-8">
              <Link
                to="/student-login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
            Forgot Password?
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/student-login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Back to Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

