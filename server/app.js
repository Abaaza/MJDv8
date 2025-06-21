import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { priceMatchingRouter } from './routes/priceMatching.js';
import userManagementRouter from './routes/userManagement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS Configuration - allow all origins in production since Vercel handles CORS
const corsOptions = {
  origin: process.env.VERCEL ? true : [
    'https://main.d197lvv1o18hb3.amplifyapp.com',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));

// Only use morgan in non-serverless environments
if (!process.env.VERCEL) {
  app.use(morgan('combined'));
}

// Request logging for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/price-matching', priceMatchingRouter);
app.use('/user-management', userManagementRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'local',
    node_version: process.version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MJD Price Matching API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      priceMatching: '/price-matching/*',
      userManagement: '/user-management/*'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(error.status || 500).json({ 
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;
