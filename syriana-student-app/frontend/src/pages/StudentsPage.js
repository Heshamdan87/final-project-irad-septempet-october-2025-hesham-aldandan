import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Link } from 'react-router-dom';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Loading students...</div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Students</h1>

      {students.length === 0 ? (
        <p className="text-gray-600">No students found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-gray-600 mb-1">Email: {student.email}</p>
                {student.studentId && (
                  <p className="text-sm text-gray-600 mb-1">Student ID: {student.studentId}</p>
                )}
                {student.major && (
                  <p className="text-sm text-gray-600 mb-1">Major: {student.major}</p>
                )}
                {student.academicYear && (
                  <p className="text-sm text-gray-600 mb-1">Academic Year: {student.academicYear}</p>
                )}
                {student.gpa && (
                  <p className="text-sm text-gray-600 mb-1">GPA: {student.gpa}</p>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>Role: {student.role}</p>
                <p>Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentsPage;

