const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/.env' });

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const announcementRoutes = require('./routes/announcements');
const eventRoutes = require('./routes/events');
const notificationRoutes = require('./routes/notifications');
// const offlineRoutes = require('./routes/offline'); // Temporarily disabled

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sorsulyap',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Import middleware
const { protect, authorize } = require('./middleware/auth');

// ============================================
// ROUTES
// ============================================

// Health check (keep separate as it's not in route files)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SorSUlyap API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/offline', offlineRoutes); // Temporarily disabled

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║         🚀 SorSUlyap Backend API         ║
║                                           ║
║  Server running on port ${PORT}            ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                           ║
╚═══════════════════════════════════════════╝

PUBLIC ENDPOINTS:
- GET  http://localhost:${PORT}/api/health
- POST http://localhost:${PORT}/api/auth/login
- POST http://localhost:${PORT}/api/auth/register

PROTECTED ENDPOINTS (Require Authentication):
- GET  http://localhost:${PORT}/api/auth/me
- GET  http://localhost:${PORT}/api/schedules
- GET  http://localhost:${PORT}/api/announcements

ADMIN & FACULTY ONLY:
- POST http://localhost:${PORT}/api/schedules
- PUT  http://localhost:${PORT}/api/schedules/:id
- POST http://localhost:${PORT}/api/announcements

ADMIN ONLY:
- DELETE http://localhost:${PORT}/api/schedules/:id
- DELETE http://localhost:${PORT}/api/announcements/:id
- GET    http://localhost:${PORT}/api/users
  `);
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('   Try: killall node (Mac/Linux) or taskkill /F /IM node.exe (Windows)');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
