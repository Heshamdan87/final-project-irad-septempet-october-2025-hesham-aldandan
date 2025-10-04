# 🎓 Syriana Student Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**A modern, full-stack student management system built with React, Node.js, and MongoDB**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-api-documentation) • [Testing](#-testing)

</div>

---

## 📋 Overview

The **Syriana Student Management System** is a comprehensive web application designed to streamline academic operations at Syriana University. This platform provides a unified solution for students, instructors, and administrators to manage courses, grades, student records, and academic analytics.

### 🎯 Project Goals

- **Centralized Management**: Single platform for all academic operations
- **Role-Based Access**: Secure, granular permissions for different user types
- **Real-Time Data**: Live updates and instant access to academic information
- **Scalable Architecture**: Built to handle growing user base and data
- **Modern UX**: Clean, intuitive interface with responsive design

### 👥 User Roles

1. **Students**
   - View enrolled courses and schedules
   - Track grades and GPA
   - Update personal profile information
   - Access course materials and announcements

2. **Teachers**
   - Manage course content and assignments
   - Grade submissions and update records
   - Track student performance
   - Generate reports and analytics

3. **Administrators**
   - Full system access and user management
   - Create and assign courses
   - Manage student enrollments
   - System configuration and monitoring
   - Generate comprehensive reports


---

## 🏗️ System Architecture

The application follows a modern **MERN stack** architecture with clear separation of concerns:

```text
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React SPA)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Services   │     │
│  │ (Views)      │  │  (Reusable)  │  │  (API Calls) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                          │                                  │
│                     React Router                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    SERVER (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                        │  │
│  │  • CORS  • Auth  • Validation  • Error Handling     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routes     │  │ Controllers  │  │    Models    │    │
│  │ (Endpoints)  │  │ (Business    │  │  (Schemas)   │    │
│  │              │  │   Logic)     │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
└──────────────────────────┼──────────────────────────────────┘
                           │
                      Mongoose ODM
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    DATABASE (MongoDB)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Users     │  │   Courses    │  │    Grades    │     │
│  │  Collection  │  │  Collection  │  │  Collection  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```text
syriana-student-app/
├── frontend/                 # React Client Application
│   ├── public/
│   │   ├── index.html       # HTML template
│   │   ├── favicon.ico      # App icon
│   │   └── manifest.json    # PWA manifest
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── PublicRoute.js
│   │   │   └── __tests__/   # Component tests
│   │   ├── pages/           # Main application pages
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── CoursesPage.js
│   │   │   ├── GradesPage.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── AdminPage.js
│   │   │   ├── StudentsPage.js
│   │   │   └── __tests__/   # Page tests
│   │   ├── services/        # API communication layer
│   │   │   ├── api.js       # Axios instance & API calls
│   │   │   └── __tests__/   # Service tests
│   │   ├── context/         # React Context API
│   │   │   └── AuthContext.js  # Authentication state
│   │   ├── App.js           # Main app component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── Dockerfile           # Frontend container
│   └── nginx.conf           # Production web server
│
├── backend/                  # Node.js/Express Server
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/         # Request handlers
│   │   ├── auth.js          # Authentication logic
│   │   ├── users.js         # User management
│   │   ├── courses.js       # Course operations
│   │   ├── grades.js        # Grade management
│   │   └── dashboard.js     # Dashboard data
│   ├── models/              # Mongoose schemas
│   │   ├── User.js          # User model
│   │   ├── Course.js        # Course model
│   │   └── Grade.js         # Grade model
│   ├── routes/              # API endpoints
│   │   ├── auth.js          # Auth routes
│   │   ├── users.js         # User routes
│   │   ├── courses.js       # Course routes
│   │   ├── grades.js        # Grade routes
│   │   └── dashboard.js     # Dashboard routes
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── validation.js    # Input validation
│   │   ├── errorHandler.js  # Error handling
│   │   └── notFound.js      # 404 handler
│   ├── scripts/             # Utility scripts
│   │   ├── create-admin.js  # Create admin user
│   │   ├── migrate-data.js  # Database migration
│   │   ├── verify-migration.js
│   │   └── add-test-data.js
│   ├── __tests__/           # API tests (49 tests)
│   │   ├── auth.test.js
│   │   ├── users.test.js
│   │   ├── courses.test.js
│   │   ├── grades.test.js
│   │   └── dashboard.test.js
│   ├── server.js            # Express server entry
│   ├── package.json
│   ├── jest.config.js       # Jest configuration
│   ├── Dockerfile           # Backend container
│   └── Procfile             # Deployment config
│
└── docker-compose.yml       # Multi-container setup
```

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- **JWT-based authentication** with secure token storage
- **Role-based access control** (RBAC) for Students, Teachers, and Admins
- **Password encryption** using bcryptjs with salt rounds
- **Protected routes** with automatic redirection
- **Session management** with token expiration
- **Secure password reset** functionality

### 📊 Dashboard & Analytics

- **Role-specific dashboards** with relevant metrics
- **Real-time data** updates for grades and courses
- **GPA calculation** with automatic updates
- **Performance tracking** and trends
- **Quick actions** for common tasks
- **Visual data representation** with charts and graphs

### 📚 Course Management

- **Create and edit courses** with detailed information
- **Assign instructors** to courses
- **Manage course enrollments** and capacity
- **Track course schedules** and timings
- **Course search and filtering** capabilities
- **Semester-based organization**

### 🎯 Grade Management

- **Record and update grades** for assignments and exams
- **Automatic GPA calculation** based on credit hours
- **Grade history tracking** with timestamps
- **Bulk grade operations** for efficiency
- **Grade distribution analysis**
- **Export grade reports** in various formats

### 👤 User Management (Admin)

- **Create and manage users** across all roles
- **Bulk user import** from CSV/Excel
- **User profile management** with validation
- **Account activation/deactivation**
- **Password reset** for users
- **Audit logs** for user actions

### 🎨 User Interface

- **Responsive design** that works on all devices
- **Modern UI** with Tailwind CSS
- **Intuitive navigation** with clear structure
- **Loading states** and error handling
- **Form validation** with helpful error messages
- **Accessibility features** (ARIA labels, keyboard navigation)

### 🔍 Search & Filtering

- **Advanced search** across users, courses, and grades
- **Multi-criteria filtering** for precise results
- **Sort options** for organized data display
- **Pagination** for large datasets
- **Quick filters** for common queries

### 🛡️ Security Features

- **Input validation** on both client and server
- **SQL injection prevention** via Mongoose
- **XSS protection** with sanitization
- **CORS configuration** for controlled access
- **Rate limiting** to prevent abuse
- **Security headers** with Helmet.js
- **Environment-based configuration**

---

## 🛠️ Tech Stack


### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library for building interactive interfaces |
| **React Router** | 6.x | Client-side routing and navigation |
| **Tailwind CSS** | 3.x | Utility-first CSS framework for styling |
| **Axios** | 1.x | HTTP client for API requests |
| **Lucide React** | Latest | Modern icon library |
| **React Context API** | Built-in | State management for authentication |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥16.0.0 | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web application framework |
| **MongoDB** | 6.0+ | NoSQL database for data storage |
| **Mongoose** | 7.x | MongoDB ODM for data modeling |
| **JWT** | 9.x | JSON Web Tokens for authentication |
| **bcryptjs** | 2.x | Password hashing and encryption |
| **Validator** | 13.x | String validation and sanitization |

### Development & Testing

| Tool | Purpose |
|------|---------|
| **Jest** | Testing framework (49 comprehensive tests) |
| **Supertest** | HTTP assertion library for API testing |
| **Docker** | Containerization for consistent environments |
| **Docker Compose** | Multi-container orchestration |
| **Concurrently** | Run multiple commands simultaneously |
| **Nodemon** | Auto-restart server on file changes |

### Security & Middleware

- **Helmet.js** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- **Express Rate Limit** - API rate limiting
- **Express Mongo Sanitize** - NoSQL injection prevention
- **Express Validator** - Request validation

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Git** for version control
- **Docker** (optional, for containerized setup)

### Quick Start

#### Option 1: Local Development (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan.git
   cd final-project-irad-septempet-october-2025-hesham-aldandan/syriana-student-app
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Create `.env` file in the `backend` directory:

   ```bash
   cd ../backend
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/syriana-student-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3001
   ```

5. **Start MongoDB**

   ```bash
   # Windows (if MongoDB is installed as a service)
   net start MongoDB

   # Linux/macOS
   sudo systemctl start mongod
   # or
   mongod --dbpath /path/to/data/db
   ```

6. **Create an admin user** (Optional but recommended)

   ```bash
   cd backend
   node scripts/create-admin.js
   ```

   This creates an admin account:
   - **Email**: admin@syriana.edu
   - **Password**: Admin123!

7. **Start the development servers**

   ```bash
   # From the syriana-student-app directory
   cd ..
   npm run dev
   ```

   This will start:
   - **Backend server**: http://localhost:5000
   - **Frontend server**: http://localhost:3001

8. **Access the application**

   Open your browser and navigate to:
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:5000/api/health

#### Option 2: Docker Setup

1. **Clone the repository** (if not done already)

   ```bash
   git clone https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan.git
   cd final-project-irad-septempet-october-2025-hesham-aldandan/syriana-student-app
   ```

2. **Build and start containers**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - **Frontend**: http://localhost:3001
   - **Backend**: http://localhost:5000

4. **Stop containers**

   ```bash
   docker-compose down
   ```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5000` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/syriana-student-app` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRE` | Token expiration time | `30d` | Yes |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3001` | Yes |

#### Frontend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` | Yes |

### Database Setup

#### Create Admin User

```bash
cd backend
node scripts/create-admin.js
```

#### Add Test Data (Optional)

```bash
node scripts/add-test-data.js
```

#### Migrate Data

```bash
node scripts/migrate-data.js
```

---

## 📡 API Documentation

### Base URL

```text
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new student | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/updatedetails` | Update user details | Yes |
| PUT | `/auth/updatepassword` | Update password | Yes |
| POST | `/auth/forgotpassword` | Request password reset | No |
| PUT | `/auth/resetpassword/:token` | Reset password | No |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | Get all users | Yes | Admin |
| GET | `/users/:id` | Get user by ID | Yes | Admin |
| POST | `/users` | Create new user | Yes | Admin |
| PUT | `/users/:id` | Update user | Yes | Admin |
| DELETE | `/users/:id` | Delete user | Yes | Admin |

### Course Management Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/courses` | Get all courses | Yes | All |
| GET | `/courses/:id` | Get course by ID | Yes | All |
| POST | `/courses` | Create course | Yes | Teacher/Admin |
| PUT | `/courses/:id` | Update course | Yes | Teacher/Admin |
| DELETE | `/courses/:id` | Delete course | Yes | Admin |
| POST | `/courses/:id/enroll` | Enroll student | Yes | Student |
| DELETE | `/courses/:id/unenroll` | Unenroll student | Yes | Student |

### Grade Management Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/grades` | Get all grades | Yes | Teacher/Admin |
| GET | `/grades/student/:id` | Get student grades | Yes | All |
| GET | `/grades/course/:id` | Get course grades | Yes | Teacher/Admin |
| POST | `/grades` | Create grade | Yes | Teacher/Admin |
| PUT | `/grades/:id` | Update grade | Yes | Teacher/Admin |
| DELETE | `/grades/:id` | Delete grade | Yes | Admin |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/stats` | Get dashboard statistics | Yes |
| GET | `/dashboard/recent-activity` | Get recent activity | Yes |

### Request/Response Examples

#### Register Student

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@student.syriana.edu",
  "password": "SecurePassword123!",
  "role": "student",
  "studentId": "STU001",
  "major": "Computer Science",
  "academicYear": "Sophomore"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@student.syriana.edu",
    "role": "student",
    "studentId": "STU001",
    "major": "Computer Science",
    "academicYear": "Sophomore"
  }
}
```

#### Login

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@student.syriana.edu",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@student.syriana.edu",
    "role": "student"
  }
}
```

#### Get Courses

**Request:**
```bash
GET /api/courses
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "courseCode": "CS101",
      "courseName": "Introduction to Computer Science",
      "instructor": "Dr. Jane Smith",
      "credits": 3,
      "semester": "Fall 2025",
      "enrolledStudents": 45,
      "maxCapacity": 50
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "courseCode": "MATH201",
      "courseName": "Calculus II",
      "instructor": "Prof. Robert Johnson",
      "credits": 4,
      "semester": "Fall 2025",
      "enrolledStudents": 38,
      "maxCapacity": 40
    }
  ]
}
```

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing


### Test Suite Overview

The project includes **49 comprehensive automated tests** covering all API endpoints and business logic.

#### Run All Tests

```bash
cd backend
npm test
```

#### Run Tests with Coverage

```bash
npm test -- --coverage
```

#### Run Specific Test File

```bash
npm test auth.test.js
npm test courses.test.js
npm test grades.test.js
```

### Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| **Authentication** | 12 tests | Login, Register, Logout, Token validation |
| **User Management** | 10 tests | CRUD operations, Role validation |
| **Course Management** | 11 tests | Create, Read, Update, Delete, Enrollment |
| **Grade Management** | 9 tests | Grade entry, GPA calculation, Updates |
| **Dashboard** | 7 tests | Role-specific data, Statistics |
| **Total** | **49 tests** | **100% pass rate** |

### Test Categories

#### Authentication Tests (`auth.test.js`)
- ✅ Student registration with valid data
- ✅ Login with correct credentials
- ✅ JWT token generation and validation
- ✅ Protected route access control
- ✅ Invalid credentials rejection
- ✅ Token expiration handling

#### User Management Tests (`users.test.js`)
- ✅ Admin can create users
- ✅ Admin can view all users
- ✅ Admin can update user details
- ✅ Admin can delete users
- ✅ Students cannot access admin routes
- ✅ Role-based permission enforcement

#### Course Tests (`courses.test.js`)
- ✅ Create course with valid data
- ✅ Get all courses
- ✅ Get single course by ID
- ✅ Update course information
- ✅ Delete course
- ✅ Student enrollment
- ✅ Capacity validation

#### Grade Tests (`grades.test.js`)
- ✅ Create grade entry
- ✅ Calculate GPA automatically
- ✅ Get student grades
- ✅ Update grade values
- ✅ Delete grade entry
- ✅ Grade validation (0-100)

#### Dashboard Tests (`dashboard.test.js`)
- ✅ Student dashboard data
- ✅ Teacher dashboard data
- ✅ Admin dashboard statistics
- ✅ Recent activity feed

### Manual Testing

For manual API testing, you can use:

1. **Postman** - Import the API collection (if available)
2. **Thunder Client** (VS Code extension)
3. **cURL** commands
4. **Browser DevTools** for frontend testing

---

## 🚢 Deployment

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build/` folder.

#### Prepare Backend

```bash
cd backend
npm install --production
```

### Deployment Options

#### 1. Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create new app
heroku create syriana-student-app

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

#### 2. Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

#### 3. VPS Deployment (Ubuntu/Debian)

```bash
# Install Node.js and MongoDB
sudo apt update
sudo apt install nodejs npm mongodb

# Clone repository
git clone <repository-url>
cd syriana-student-app

# Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name syriana-backend

# Setup Nginx as reverse proxy
sudo apt install nginx
# Configure nginx (see nginx.conf example)

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secure-production-secret-key-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=https://yourdomain.com
```

---

## 🤝 Contributing

We welcome contributions to the Syriana Student Management System! Here's how you can help:

### Development Workflow

1. **Fork the repository**

   Click the "Fork" button on GitHub

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/final-project-irad-septempet-october-2025-hesham-aldandan.git
   cd final-project-irad-septempet-october-2025-hesham-aldandan/syriana-student-app
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes**

   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test your changes**

   ```bash
   # Run all tests
   cd backend
   npm test

   # Test manually
   npm run dev
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "Add: Amazing new feature"
   ```

   **Commit message format:**
   - `Add:` New feature
   - `Fix:` Bug fix
   - `Update:` Update existing feature
   - `Refactor:` Code refactoring
   - `Docs:` Documentation changes
   - `Test:` Add or update tests

7. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

8. **Create a Pull Request**

   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes
   - Submit the pull request

### Code Style Guidelines

- **JavaScript**: Follow ES6+ standards
- **Naming**: Use camelCase for variables and functions
- **Components**: Use PascalCase for React components
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JavaScript
- **Semicolons**: Use semicolons
- **Comments**: Write meaningful comments

### Testing Guidelines

- Write tests for new features
- Ensure all existing tests pass
- Aim for high test coverage
- Test edge cases and error scenarios

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] All tests pass
- [ ] No breaking changes (or clearly documented)
- [ ] Pull request description is clear

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

### MIT License Summary

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Authors & Contributors

### Main Developer

**Hesham Aldandan**
- GitHub: [@Heshamdan87](https://github.com/Heshamdan87)
- Email: hesham@syriana.edu

### Project Information

- **University**: Syriana University
- **Course**: IRAD (Internet & Rapid Application Development)
- **Semester**: September - October 2025
- **Project Type**: Final Project

### Acknowledgments

- **Instructors** - For guidance and feedback
- **Classmates** - For testing and suggestions
- **Open Source Community** - For amazing tools and libraries

---

## 🐛 Known Issues & Roadmap

### Known Issues

- [ ] Grade export to PDF needs formatting improvements
- [ ] Mobile navigation menu animation delay
- [ ] Email notifications not yet implemented

### Upcoming Features

- [ ] **Email Notifications** - Automated emails for grade updates
- [ ] **File Uploads** - Profile pictures and assignment submissions
- [ ] **Calendar Integration** - Class schedules and deadlines
- [ ] **Chat System** - Student-teacher messaging
- [ ] **Mobile App** - React Native mobile application
- [ ] **Analytics Dashboard** - Advanced reporting and visualization
- [ ] **Attendance Tracking** - QR code-based attendance system
- [ ] **Payment Integration** - Tuition fee payment gateway

---

## 📞 Support & Contact

### Getting Help

1. **Documentation**: Read this README thoroughly
2. **Issues**: Check [existing issues](https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan/issues)
3. **New Issue**: [Create a new issue](https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan/issues/new)
4. **Email**: hesham@syriana.edu

### Report a Bug

When reporting a bug, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

### Feature Requests

We welcome feature suggestions! Please:
- Check if the feature already exists
- Provide detailed description
- Explain use cases and benefits
- Consider implementation complexity

---

## 📚 Additional Resources

### Useful Links

- **React Documentation**: https://react.dev/
- **Node.js Documentation**: https://nodejs.org/docs/
- **MongoDB Documentation**: https://www.mongodb.com/docs/
- **Express.js Guide**: https://expressjs.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Learning Resources

- **MERN Stack Tutorial**: [FreeCodeCamp](https://www.freecodecamp.org/)
- **React Course**: [React Official Tutorial](https://react.dev/learn)
- **MongoDB University**: [Free Courses](https://university.mongodb.com/)
- **Node.js Best Practices**: [GitHub Repo](https://github.com/goldbergyoni/nodebestpractices)

---

## 🌟 Star History

If you find this project helpful, please consider giving it a star ⭐

---

<div align="center">

**Made with ❤️ by Hesham Aldandan**

**Syriana University - IRAD Final Project - 2025**

[⬆ Back to Top](#-syriana-student-management-system)

</div>
