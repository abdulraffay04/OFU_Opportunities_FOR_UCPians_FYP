const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Allow all origins during development (Expo Go, web, mobile)
var corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    // and all origins during development
    console.log('Request from origin:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept'
  ]
};
app.use(cors(corsOptions));

// Apply express.json() middleware
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/v1/auth', authLimiter);

// Import routers
const adminRoutes = require('./modules/admin/routes');
const aiRoutes = require('./modules/ai/routes');
const alumniRoutes = require('./modules/alumni/routes');
const applicationsRoutes = require('./modules/applications/routes');
const authRoutes = require('./modules/auth/routes');
const notificationsRoutes = require('./modules/notifications/routes');
const opportunitiesRoutes = require('./modules/opportunities/routes');
const savedRoutes = require('./modules/saved/routes');
const uploadsRoutes = require('./modules/uploads/routes');
const usersRoutes = require('./modules/users/routes');

// Mount all module routers under /api/v1
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/alumni', alumniRoutes);
app.use('/api/v1/applications', applicationsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/opportunities', opportunitiesRoutes);
app.use('/api/v1/saved', savedRoutes);
app.use('/api/v1/uploads', uploadsRoutes);
app.use('/api/v1/users', usersRoutes);

// Use the global error handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;
