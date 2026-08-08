import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import groupRoutes from './routes/groupRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database (Non-blocking)
connectDB();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic Database Health Interceptor Middleware
app.use((req, res, next) => {
  // Allow healthcheck route to bypass database check
  if (req.path === '/api/health') {
    return next();
  }
  
  // Mongoose connection state: 1 = connected
  if (mongoose.connection.readyState !== 1) {
    res.status(503);
    return res.json({
      message: 'Database is currently offline. Please ensure the local MongoDB service is running (e.g. net start MongoDB) and refresh.'
    });
  }
  
  next();
});

// Registered Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/groups', groupRoutes);

// Base routes check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HabitCircle API is live',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
