# Syriana Student Management System

A full-stack web application for managing student information, courses, and grades at Syriana University.

## Overview

This application provides a comprehensive platform for students, teachers, and administrators to manage academic activities. Built with modern web technologies, it offers role-based access control and a clean, intuitive interface.

## Architecture

```
syriana-student-app/
├── frontend/          # React SPA with Tailwind CSS
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages
│   │   ├── services/    # API communication layer
│   │   └── context/     # React context for state management
├── backend/           # Node.js/Express API server
│   ├── controllers/   # Request handlers
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Authentication & validation
│   ├── config/        # Database and app configuration
│   └── scripts/       # Database setup and utilities
└── docker-compose.yml # Development environment
```

## Key Features

- **Multi-role Authentication**: Separate login flows for students, teachers, and admins
- **Course Management**: Teachers can create and manage their courses
- **Grade Tracking**: Comprehensive grade management with GPA calculations
- **Dashboard Analytics**: Role-specific dashboards with relevant metrics
- **User Management**: Admin panel for managing all users
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend

- React 18 with Hooks
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

### Backend

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Comprehensive middleware stack (CORS, security, rate limiting)

### Development Tools

- Jest for testing (49 comprehensive API tests)
- Docker for containerization
- ESLint for code quality
- Concurrently for development workflow

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Docker (optional)

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd syriana-student-app
   ```

2. Install dependencies for both client and server

   ```bash
   # Install server dependencies
   cd backend
   npm install

   # Install client dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers

   ```bash
   # Start the backend server
   cd backend
   npm run dev

   # In a new terminal, start the frontend
   cd frontend
   npm start
   ```

### Using Docker

```bash
docker-compose up --build
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/syriana-student-app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

## API Documentation

The API provides the following endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/dashboard` - Role-specific dashboard data
- `GET /api/courses` - Course management
- `GET /api/grades` - Grade management
- `GET /api/users` - User management (admin only)

## Testing

Run the comprehensive test suite:

```bash
cd backend
npm test
```

All 49 API tests should pass, covering authentication, authorization, CRUD operations, and edge cases.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request

## License

This project is licensed under the MIT License.
