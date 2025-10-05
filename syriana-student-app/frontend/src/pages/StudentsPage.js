import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { userService } from '../services/api';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userService.getStudents();
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      studentId: student.studentId || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      major: student.major || '',
      department: student.department || '',
      academicYear: student.academicYear || '',
      gpa: student.gpa || '',
      street: student.address?.street || '',
      city: student.address?.city || '',
      state: student.address?.state || '',
      zipCode: student.address?.zipCode || '',
      country: student.address?.country || '',
      isActive: student.isActive !== undefined ? student.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        studentId: editFormData.studentId,
        phone: editFormData.phone,
        dateOfBirth: editFormData.dateOfBirth,
        major: editFormData.major,
        department: editFormData.department,
        academicYear: editFormData.academicYear,
        gpa: editFormData.gpa ? parseFloat(editFormData.gpa) : undefined,
        address: {
          street: editFormData.street,
          city: editFormData.city,
          state: editFormData.state,
          zipCode: editFormData.zipCode,
          country: editFormData.country
        },
        isActive: editFormData.isActive
      };

      await api.put(`/users/${selectedStudent._id}`, updateData);
      
      toast.success('Student information updated successfully!');
      handleCloseModal();
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${studentId}`);
      toast.success('Student deleted successfully');
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/courses"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Courses
            </Link>
            <Link
              to="/students"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              Students
            </Link>
            <Link
              to="/admin"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              Admin Panel
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <div className="text-sm text-gray-600">
            Total Students: <span className="font-semibold">{students.length}</span>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-gray-600">No students found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Email:</span> {student.email}
                  </p>
                  {student.studentId && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Student ID:</span> {student.studentId}
                    </p>
                  )}
                  {student.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Phone:</span> {student.phone}
                    </p>
                  )}
                  {student.major && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Major:</span> {student.major}
                    </p>
                  )}
                  {student.department && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Department:</span> {student.department}
                    </p>
                  )}
                  {student.academicYear && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Year:</span> {student.academicYear}
                    </p>
                  )}
                  {student.gpa && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">GPA:</span> {student.gpa}
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={student.isActive ? 'text-green-600' : 'text-red-600'}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Joined:</span>{' '}
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(student)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id, `${student.firstName} ${student.lastName}`)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Student: {selectedStudent.firstName} {selectedStudent.lastName}
              </h2>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="edit-firstName"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="edit-lastName"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={editFormData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-studentId" className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="edit-studentId"
                      name="studentId"
                      value={editFormData.studentId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="edit-phone"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="edit-dateOfBirth"
                      name="dateOfBirth"
                      value={editFormData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-major" className="block text-sm font-medium text-gray-700 mb-1">
                      Major
                    </label>
                    <input
                      type="text"
                      id="edit-major"
                      name="major"
                      value={editFormData.major}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      id="edit-department"
                      name="department"
                      value={editFormData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <select
                      id="edit-academicYear"
                      name="academicYear"
                      value={editFormData.academicYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-gpa" className="block text-sm font-medium text-gray-700 mb-1">
                      GPA
                    </label>
                    <input
                      type="number"
                      id="edit-gpa"
                      name="gpa"
                      value={editFormData.gpa}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="edit-street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="edit-street"
                      name="street"
                      value={editFormData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="edit-city"
                        name="city"
                        value={editFormData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="edit-state"
                        name="state"
                        value={editFormData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        id="edit-zipCode"
                        name="zipCode"
                        value={editFormData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="edit-country"
                        name="country"
                        value={editFormData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Account Status
                </h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-700">
                    Account is active
                  </label>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;

