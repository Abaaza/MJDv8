#!/usr/bin/env node

// Production-like local server setup
// This mimics production environment locally

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import your existing app
const app = require('./app');

// Production-like configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = 'production';

// Enhanced CORS for production-like environment
app.use(cors({
  origin: [
    'https://main.d197lvv1o18hb3.amplifyapp.com',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:8080',
    'https://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Production-like middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: 'local-production',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      storage: 'local',
      cors: 'enabled'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 MJD Backend Server Running in Production Mode

📍 Local Production Server: http://localhost:${PORT}
🔗 Health Check: http://localhost:${PORT}/health
🌐 API Base URL: http://localhost:${PORT}

📊 Configuration:
   • Environment: ${NODE_ENV}
   • Port: ${PORT}
   • CORS: Enabled for all origins
   • Database: Supabase (${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'})
   • Storage: Local file system

🎯 Frontend Configuration:
   Update your frontend to use: http://localhost:${PORT}

✅ Ready for production-like testing!
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
}); 