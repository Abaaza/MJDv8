import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { priceMatchingRouter } from './routes/priceMatching-vercel.js';
import userManagementRouter from './routes/userManagement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'https://main.d197lvv1o18hb3.amplifyapp.com',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`\n🔵 Incoming Request:`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.url}`);
  console.log(`   Origin: ${req.get('origin') || 'No origin header'}`);
  console.log(`   Host: ${req.get('host')}`);
  console.log(`   X-Forwarded-For: ${req.get('x-forwarded-for') || 'None'}`);
  console.log(`   User-Agent: ${req.get('user-agent')}`);
  
  // Log ngrok-specific headers
  const ngrokHeaders = Object.keys(req.headers).filter(h => h.includes('ngrok'));
  if (ngrokHeaders.length > 0) {
    console.log(`   Ngrok headers:`, ngrokHeaders.map(h => `${h}: ${req.headers[h]}`).join(', '));
  }
  
  next();
});

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure temp directories exist
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'output');
await fs.ensureDir(tempDir);
await fs.ensureDir(outputDir);

// Routes
app.use('/price-matching', priceMatchingRouter);
app.use('/user-management', userManagementRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: error.message 
  });
});

export default app;
