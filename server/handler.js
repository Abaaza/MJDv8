// src/handler.js
import serverless from 'serverless-http';
import app from './app.js';

// Export handler
export const handler = serverless(app);
