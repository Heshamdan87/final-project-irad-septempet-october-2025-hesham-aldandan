import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Syrian Cities List
const SYRIAN_CITIES = [
  'Damascus',
  'Aleppo',
  'Homs',
  'Hama',
  'Latakia',
  'Tartus',
  'Idlib',
  'Daraa',
  'Deir ez-Zor',
  'Al-Hasakah',
  'Raqqa',
  'Quneitra',
  'As-Suwayda'
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    major: '',
    department: '',
    academicYear: '',
    studentId: '',
    phone: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    gpa: '',
    grades: [],

    adminLevel: '',
    permissions: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleGradeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.map((grade, i) =>
        i === index ? { ...grade, [field]: value } : grade
      )
    }));
  };

  const addGrade = () => {
    setFormData(prev => ({
      ...prev,
      grades: [...prev.grades, {
        subject: '',
        grade: '',
        semester: '',
        year: '',
        credits: '',
        id: Date.now()
      }]
    }));
  };

  const removeGrade = (index) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.filter((_, i) => i !== index)
    }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,

      major: role === 'student' ? prev.major : '',
      department: role === 'student' ? prev.department : '',
      academicYear: role === 'student' ? prev.academicYear : '',
      studentId: role === 'student' ? prev.studentId : '',
      adminLevel: role === 'admin' ? prev.adminLevel : '',
      permissions: role === 'admin' ? prev.permissions : []
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'studentId':
        if (formData.role === 'student' && !formData.studentId.trim()) {
          newErrors.studentId = 'Student ID is required';
        } else {
          delete newErrors.studentId;
        }
        break;

      case 'major':
        if (formData.role === 'student' && !formData.major.trim()) {
          newErrors.major = 'Major is required';
        } else {
          delete newErrors.major;
        }
        break;

      case 'department':
        if (formData.role === 'student' && !formData.department.trim()) {
          newErrors.department = 'Department is required';
        } else {
          delete newErrors.department;
        }
        break;

      case 'academicYear':
        if (formData.role === 'student' && !formData.academicYear) {
          newErrors.academicYear = 'Academic year is required';
        } else {
          delete newErrors.academicYear;
        }
        break;

      case 'adminLevel':
        if (formData.role === 'admin' && !formData.adminLevel) {
          newErrors.adminLevel = 'Administrative level is required';
        } else {
          delete newErrors.adminLevel;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (formData.role === 'student') {
        if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
        if (!formData.major.trim()) newErrors.major = 'Major is required';
        if (!formData.department.trim()) newErrors.department = 'Department is required';
        if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
      }
    }

    if (step === 3 && formData.role === 'admin') {
      if (!formData.adminLevel) newErrors.adminLevel = 'Administrative level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {

      const { confirmPassword, city, ...userData } = formData;
      
      // Add city to address object
      if (city) {
        userData.address = {
          city: city
        };
      }
      
      // Parse GPA as float if provided
      if (userData.gpa) {
        userData.gpa = parseFloat(userData.gpa);
      }
      
      const result = await register(userData);
      if (result.success) {
        toast.success('Registration successful! Welcome to Syriana.');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student': return 'Student';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return (
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'admin':
        return (
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'emerald';
      case 'admin': return 'red';
      default: return 'gray';
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = formData.role === 'admin' ? 4 : 3;
    return (
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep >= step
                  ? `bg-${getRoleColor(formData.role)}-500 text-white shadow-lg`
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-16 h-1 mx-3 rounded transition-all duration-300 ${
                  currentStep > step ? `bg-${getRoleColor(formData.role)}-500` : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => {
    const color = getRoleColor(formData.role);
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-20 w-20 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-200`}>
            {getRoleIcon(formData.role)}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Syriana as {getRoleDisplayName(formData.role)}</h2>
          <p className="text-lg text-gray-600">Create your account and start your journey</p>
        </div>

        {/* Role Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              I am registering as:
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['student', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === role
                      ? `border-${color}-500 bg-${color}-50 text-${color}-700 shadow-md`
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-lg ${formData.role === role ? `bg-${color}-100` : 'bg-gray-100'}`}>
                      {getRoleIcon(role)}
                    </div>
                    <span className="text-sm font-medium">{getRoleDisplayName(role)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                    errors.firstName && touched.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                />
                {errors.firstName && touched.firstName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                    errors.lastName && touched.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                />
                {errors.lastName && touched.lastName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                  errors.email && touched.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder={`Enter your ${getRoleDisplayName(formData.role).toLowerCase()} email`}
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
              />
              {errors.email && touched.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                      errors.password && touched.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword && touched.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const color = getRoleColor(formData.role);
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-20 w-20 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {formData.role === 'student' ? 'Academic Information' : 'Administrative Setup'}
          </h2>
          <p className="text-lg text-gray-600">
            {formData.role === 'student' ? 'Tell us about your academic background' : 'Configure your administrative access'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          {formData.role === 'student' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                      errors.studentId && touched.studentId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., STU2024001"
                    value={formData.studentId}
                    onChange={handleChange}
                    onBlur={() => handleBlur('studentId')}
                  />
                  {errors.studentId && touched.studentId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.studentId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="academicYear" className="block text-sm font-semibold text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    id="academicYear"
                    name="academicYear"
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                      errors.academicYear && touched.academicYear ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    value={formData.academicYear}
                    onChange={handleChange}
                    onBlur={() => handleBlur('academicYear')}
                  >
                    <option value="">Select Academic Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                  {errors.academicYear && touched.academicYear && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.academicYear}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="major" className="block text-sm font-semibold text-gray-700 mb-2">
                    Major
                  </label>
                  <input
                    id="major"
                    name="major"
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                      errors.major && touched.major ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Science"
                    value={formData.major}
                    onChange={handleChange}
                    onBlur={() => handleBlur('major')}
                  />
                  {errors.major && touched.major && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.major}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 border-gray-300`}
                    placeholder="e.g., Faculty of Engineering"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="adminLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrative Level
                </label>
                <select
                  id="adminLevel"
                  name="adminLevel"
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all duration-200 ${
                    errors.adminLevel && touched.adminLevel ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  value={formData.adminLevel}
                  onChange={handleChange}
                  onBlur={() => handleBlur('adminLevel')}
                >
                  <option value="">Select Level</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="System Admin">System Admin</option>
                  <option value="Department Admin">Department Admin</option>
                  <option value="Support Admin">Support Admin</option>
                </select>
                {errors.adminLevel && touched.adminLevel && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.adminLevel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Administrative Permissions
                </label>
                <div className="space-y-3">
                  {[
                    'User Management',
                    'Course Management',
                    'Grade Management',
                    'System Configuration',
                    'Reports & Analytics',
                    'Security Settings'
                  ].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        className={`h-4 w-4 text-${color}-600 focus:ring-${color}-500 border-gray-300 rounded`}
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission)
                            }));
                          }
                        }}
                      />
                      <span className="ml-3 text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 font-medium">Administrative Access Notice</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      As an administrator, you will have access to sensitive student data and system configurations.
                      Please ensure you understand the responsibilities that come with this role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Selected Permissions:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.permissions.length > 0 ? (
                    formData.permissions.map((permission) => (
                      <span key={permission} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No permissions selected</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const color = getRoleColor(formData.role);
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-20 w-20 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m0 0l-2-2m2 2l2-2m6-6v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Additional Information</h2>
          <p className="text-lg text-gray-600">Help us personalize your experience</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <select
                  id="city"
                  name="city"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select City</option>
                  {SYRIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="gpa" className="block text-sm font-semibold text-gray-700 mb-2">
                  GPA (CGPA)
                </label>
                <input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter GPA (0.00 - 4.00)"
                  value={formData.gpa}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Academic Grades</h3>
                  <button
                    type="button"
                    onClick={addGrade}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Grade
                  </button>
                </div>

                {formData.grades.map((grade, index) => (
                  <div key={grade.id} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Grade {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeGrade(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                        <input
                          type="text"
                          placeholder="Subject"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          value={grade.subject}
                          onChange={(e) => handleGradeChange(index, 'subject', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          value={grade.grade}
                          onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                        >
                          <option value="">Grade</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="B-">B-</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="C-">C-</option>
                          <option value="D+">D+</option>
                          <option value="D">D</option>
                          <option value="D-">D-</option>
                          <option value="F">F</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          value={grade.semester}
                          onChange={(e) => handleGradeChange(index, 'semester', e.target.value)}
                        >
                          <option value="">Semester</option>
                          <option value="Fall">Fall</option>
                          <option value="Spring">Spring</option>
                          <option value="Summer">Summer</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          placeholder="Year"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          value={grade.year}
                          onChange={(e) => handleGradeChange(index, 'year', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Credits</label>
                        <input
                          type="number"
                          placeholder="Credits"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          value={grade.credits}
                          onChange={(e) => handleGradeChange(index, 'credits', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.grades.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No grades added yet. Click "Add Grade" to add your academic grades.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    if (formData.role !== 'admin') return null;

    const color = getRoleColor(formData.role);
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-20 w-20 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
          <p className="text-lg text-gray-600">Please review your information before creating your account</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{formData.firstName} {formData.lastName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{formData.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-900">{getRoleDisplayName(formData.role)}</span>
                </div>
                {formData.role === 'student' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Student ID:</span>
                      <span className="ml-2 text-gray-900">{formData.studentId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Major:</span>
                      <span className="ml-2 text-gray-900">{formData.major}</span>
                    </div>
                  </>
                )}
                {formData.role === 'admin' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Admin Level:</span>
                      <span className="ml-2 text-gray-900">{formData.adminLevel}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Permissions:</span>
                      <span className="ml-2 text-gray-900">{formData.permissions.length} selected</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 font-medium">Ready to Create Account</p>
                  <p className="text-sm text-blue-700 mt-1">
                    By clicking "Create Account", you agree to our terms of service and privacy policy.
                    Your information will be securely stored and used only for Syriana platform purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNavigation = () => {
    const totalSteps = formData.role === 'admin' ? 4 : 3;
    const color = getRoleColor(formData.role);

    return (
      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className={`px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-${color}-500 to-${color}-600 hover:from-${color}-600 hover:to-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg`}
          >
            Next Step
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-${color}-500 to-${color}-600 hover:from-${color}-600 hover:to-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Creating Account...</span>
              </div>
            ) : (
              `Create ${getRoleDisplayName(formData.role)} Account`
            )}
          </button>
        )}
      </div>
    );
  };

  const color = getRoleColor(formData.role);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${color}-50 via-${color}-50 to-${color}-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-${color}-200/30 to-${color}-300/30 rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-${color}-300/30 to-${color}-400/30 rounded-full blur-3xl`}></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {renderNavigation()}
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className={`font-semibold text-${color}-600 hover:text-${color}-500 transition-colors duration-200`}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

