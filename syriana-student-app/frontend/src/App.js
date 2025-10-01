import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Component imports
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Page imports
import AdminLoginPage from './pages/AdminLoginPage';
import StudentLoginPage from './pages/StudentLoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminPage from './pages/AdminPage';
import StudentPage from './pages/StudentPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      {/* Global toast notifications */}
      <Toaster position="top-right" />

      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route
          path="/login"
          element={<Navigate to="/student-login" replace />}
        />
        <Route
          path="/admin-login"
          element={
            <PublicRoute>
              <AdminLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/student-login"
          element={
            <PublicRoute>
              <StudentLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={['admin', 'student']}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect based on user role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/student" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 Not Found page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

