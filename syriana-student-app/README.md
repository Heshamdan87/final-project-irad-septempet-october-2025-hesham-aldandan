# Syriana Student App

A comprehensive student management system built with React frontend and Node.js backend.

## Project Structure

```
syriana-student-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Dashboard, Login, Register, etc.
│   │   ├── services/        # API calls
│   │   └── context/         # Auth & Role context
├── server/                  # Node.js backend
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── middleware/          # Auth, role checks
│   ├── utils/               # Helpers (e.g., validators)
│   └── config/              # DB connection, env setup
├── docker-compose.yml
├── .env
└── README.md
```

## Features

- User authentication and authorization
- Role-based access control (Student, Teacher, Admin)
- Student dashboard
- Course management
- Grade tracking
- User profile management

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
cd server
npm install

# Install client dependencies
cd ../client
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
cd server
npm run dev

# In a new terminal, start the frontend
cd client
npm start
```

### Using Docker

```bash
docker-compose up
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/students` - Get all students (Admin only)
- `GET /api/courses` - Get courses
- `POST /api/grades` - Add grades (Teacher only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.