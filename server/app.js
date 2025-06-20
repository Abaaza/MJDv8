import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { priceMatchingRouter } from './routes/priceMatching.js';
import userManagementRouter from './routes/userManagement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
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
