// src/handler.js
import serverless from 'serverless-http';
import app from './app.js';

// Export handler with proper CORS handling
export const handler = serverless(app, {
  response: {
    cors: {
      origin: '*',
      headers: [
        'Content-Type',
        'Authorization',
        'X-Amz-Date',
        'X-Api-Key',
        'X-Amz-Security-Token',
        'X-Amz-User-Agent'
      ],
      allowCredentials: false
    }
  }
});
