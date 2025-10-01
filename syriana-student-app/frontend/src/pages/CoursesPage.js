import React, { useState, useEffect } from 'react';
import { courseService } from '../services/api';
import { Link } from 'react-router-dom';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Loading courses...</div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Courses</h1>

      {courses.length === 0 ? (
        <p className="text-gray-600">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h2>
                <p className="text-sm text-gray-600 mb-1">Code: {course.courseCode}</p>
                <p className="text-sm text-gray-600 mb-1">Department: {course.department}</p>
                <p className="text-sm text-gray-600 mb-1">Credits: {course.credits}</p>
                <p className="text-sm text-gray-600 mb-1">Capacity: {course.capacity}</p>
                <p className="text-sm text-gray-600">Semester: {course.semester} {course.year}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Schedule:</h3>
                <p className="text-sm text-gray-600">
                  {course.schedule.days.join(', ')} at {course.schedule.startTime} - {course.schedule.endTime}
                </p>
                <p className="text-sm text-gray-600">Room: {course.schedule.room}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description:</h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>

              <div className="text-sm text-gray-500">
                <p>Enrollment: {new Date(course.enrollmentStart).toLocaleDateString()} - {new Date(course.enrollmentEnd).toLocaleDateString()}</p>
                <p>Course: {new Date(course.courseStart).toLocaleDateString()} - {new Date(course.courseEnd).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default CoursesPage;

