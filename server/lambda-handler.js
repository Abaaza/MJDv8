import serverless from 'serverless-http';
import app from './app.js';

// Configure serverless-http for Lambda
const handler = serverless(app, {
  // Request/response transformations
  request: (request, event, context) => {
    // Add any request transformations here if needed
    return request;
  },
  response: (response, event, context) => {
    // Add any response transformations here if needed
    return response;
  }
});

export { handler }; 