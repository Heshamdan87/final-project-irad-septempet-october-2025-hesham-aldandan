const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const gradeRoutes = require('./routes/grades');
const dashboardRoutes = require('./routes/dashboard');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const connectDB = require('./config/database');

require('dotenv').config();

connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      process.env.CLIENT_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Syriana Student App API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',      // Server health check
      auth: '/api/auth',          // Authentication (login, register)
      users: '/api/users',        // User management
      courses: '/api/courses',    // Course management
      grades: '/api/grades',      // Grade management
      dashboard: '/api/dashboard' // Analytics & statistics
    }
  });
});

// 1️⃣2️⃣ SERVE STATIC FILES
// Serve frontend files and uploaded files
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1️⃣3️⃣ API ROUTES
// Connect URL paths to their route handlers
app.use('/api/auth', authRoutes);           // Authentication routes
app.use('/api/users', userRoutes);          // User routes
app.use('/api/courses', courseRoutes);      // Course routes
app.use('/api/grades', gradeRoutes);        // Grade routes
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes

// 1️⃣4️⃣ HEALTH CHECK ROUTE
// Used to check if the server is running properly
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.log(`❌ Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = app;


