// Vercel serverless function handler
// This is the main entry point for all API routes

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import the Express app
import app from '../server/app.js';

// Export as default for Vercel
export default app; 