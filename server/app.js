import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, checkDBHealth } from './config/database.js';
import { priceMatchingRouter } from './routes/priceMatching.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB().catch(console.error);

// CORS Configuration
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
app.use('/auth', authRouter);
app.use('/price-matching', priceMatchingRouter);

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDBHealth();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? 'vercel' : 'local',
      node_version: process.version,
      database: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: { status: 'unhealthy', error: error.message }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MJD Authentication & Price Matching API',
    version: '2.0.0',
    authentication: 'MongoDB + JWT',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      priceMatching: '/price-matching/*'
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
