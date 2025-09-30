import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, BookOpen, Calendar, Users, TrendingUp, Clock, LogOut, Star, Award, Target } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const stats = [
    {
      title: 'Enrolled Courses',
      value: '6',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Current GPA',
      value: '3.8',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Assignments Due',
      value: '3',
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      title: 'Study Hours',
      value: '24h',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  const recentCourses = [
    {
      name: 'Mathematics 101',
      instructor: 'Dr. Smith',
      nextClass: 'Tomorrow at 10:00 AM',
      progress: 85,
      grade: 'A-'
    },
    {
      name: 'Computer Science Fundamentals',
      instructor: 'Prof. Johnson',
      nextClass: 'Today at 2:00 PM',
      progress: 92,
      grade: 'A'
    },
    {
      name: 'English Literature',
      instructor: 'Dr. Williams',
      nextClass: 'Wednesday at 11:00 AM',
      progress: 78,
      grade: 'B+'
    }
  ];

  const upcomingAssignments = [
    {
      title: 'Math Problem Set 5',
      course: 'Mathematics 101',
      due: '2 days',
      priority: 'high',
      type: 'Assignment'
    },
    {
      title: 'Literature Essay',
      course: 'English Literature',
      due: '5 days',
      priority: 'medium',
      type: 'Essay'
    },
    {
      title: 'Programming Project',
      course: 'Computer Science',
      due: '1 week',
      priority: 'low',
      type: 'Project'
    },
    {
      title: 'Midterm Exam',
      course: 'Mathematics 101',
      due: '3 days',
      priority: 'high',
      type: 'Exam'
    }
  ];

  const achievements = [
    {
      title: 'Dean\'s List',
      description: 'Achieved GPA above 3.5',
      icon: Award,
      earned: true
    },
    {
      title: 'Perfect Attendance',
      description: 'No absences this semester',
      icon: Target,
      earned: false
    },
    {
      title: 'Top Performer',
      description: 'Top 10% in Mathematics',
      icon: Star,
      earned: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.firstName || 'Student'}! Let's continue your learning journey.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className={`${stat.bg} rounded-lg p-3`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Courses */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Courses
                </button>
              </div>
              <div className="space-y-4">
                {recentCourses.map((course, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">{course.name}</h3>
                        <span className="text-sm font-semibold text-green-600">{course.grade}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                      <p className="text-xs text-gray-400">Next class: {course.nextClass}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">{course.progress}%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Profile & Performance */}
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 rounded-lg p-3 mr-3">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Profile Overview</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
                    <p className="text-sm font-medium text-gray-900">{user?.studentId || 'STU-2024-001'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Academic Status</p>
                    <p className="text-sm font-medium text-gray-900">Full-time Student</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Semester</p>
                    <p className="text-sm font-medium text-gray-900">Fall 2024</p>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 rounded-lg p-3 mr-3">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Performance</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Performance</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Assignment Completion</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Attendance</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Assignments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">{assignment.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          assignment.priority === 'high' ? 'bg-red-100 text-red-800' :
                          assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assignment.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{assignment.course}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Due in {assignment.due}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Award className="h-5 w-5 text-yellow-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
              </div>
              <div className="space-y-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={index} className={`flex items-center p-3 rounded-lg border ${
                      achievement.earned 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`rounded-full p-2 mr-3 ${
                        achievement.earned 
                          ? 'bg-yellow-100' 
                          : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-4 w-4 ${
                          achievement.earned 
                            ? 'text-yellow-600' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium text-sm ${
                          achievement.earned 
                            ? 'text-gray-900' 
                            : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-xs ${
                          achievement.earned 
                            ? 'text-gray-600' 
                            : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <div className="text-yellow-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;