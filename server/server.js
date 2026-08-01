const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env variables
dotenv.config();

// Connect to Database and seed initial data
connectDB()
  .then(() => {
    console.log('✅ MongoDB connection established. Running seed data...');
    const seedData = require('./utils/seedData');
    seedData();
  })
  .catch(err => {
    console.error('⚠️ MONGODB CONNECTION ERROR during startup:', err.message);
  });

const app = express();

// CORS configurations – allow only Vite dev URLs
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport Initialize
app.use(passport.initialize());
require('./config/passport')(passport);

// API Route Registration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Status check endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    institution: 'Bannari Amman Institute of Technology (BIT Sathy)',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use(errorHandler);

const startServer = (port) => {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const newPort = port + 1;
      console.warn(`⚠️ Port ${port} already in use, switching to ${newPort}`);
      startServer(newPort);
    } else {
      console.error('Server error:', err);
    }
  });
};

const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
startServer(BASE_PORT);

