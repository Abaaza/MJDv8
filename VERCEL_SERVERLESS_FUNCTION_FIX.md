# Fix Vercel Serverless Function Crash

## The Problem

Your Vercel build succeeded, but the serverless function crashes when invoked. This typically happens because:

1. **Missing dependencies** in serverless environment
2. **Import/export issues** with ES modules
3. **Environment variables** not properly set
4. **File system access** issues in serverless

## Error Details

- Code: `FUNCTION_INVOCATION_FAILED`
- Status: `500 INTERNAL_SERVER_ERROR`
- The function builds but crashes when executed

## Quick Fixes

### Fix 1: Update Server Handler for Vercel

The issue is likely in `server/handler.js`. Let's fix it:

```javascript
// server/handler.js
import app from "./app.js";

// Vercel expects this export format
export default app;
```

### Fix 2: Add Vercel Dependencies

Add `@vercel/blob` to server dependencies:

```bash
cd server
npm install @vercel/blob
```

### Fix 3: Check Environment Variables

In Vercel Dashboard → Settings → Environment Variables, ensure you have:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`

### Fix 4: Update Package.json for Serverless

Ensure your `server/package.json` has:

```json
{
  "type": "module",
  "engines": {
    "node": "18.x"
  }
}
```

### Fix 5: Simplify App.js for Serverless

Update `server/app.js` to be more serverless-friendly:

```javascript
import express from "express";
import cors from "cors";
import { priceMatchingRouter } from "./routes/priceMatching.js";
import userManagementRouter from "./routes/userManagement.js";

const app = express();

// Simplified CORS for Vercel
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/price-matching", priceMatchingRouter);
app.use("/user-management", userManagementRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({
    error: "Internal Server Error",
    message: error.message,
  });
});

export default app;
```

## Debug Steps

### 1. Check Function Logs

- Go to Vercel Dashboard → Functions
- Click on your function
- Check the "Invocations" tab for error details

### 2. Test Locally

```bash
npm install -g vercel
vercel dev
```

This simulates the Vercel environment locally.

### 3. Simplify Handler

Create a minimal test handler:

```javascript
// server/handler.js
export default function handler(req, res) {
  res.status(200).json({ message: "Hello from Vercel!" });
}
```

If this works, gradually add back your app.

## Alternative: Deploy Backend Separately

If Vercel serverless continues to be problematic:

### Option A: Railway

1. Deploy backend on Railway
2. Keep frontend on Vercel
3. Set `VITE_API_URL` to Railway URL

### Option B: Render

1. Deploy backend on Render
2. Keep frontend on Vercel
3. Set `VITE_API_URL` to Render URL

## Common Serverless Issues

1. **File System**: Serverless functions can't write to disk
2. **Cold Starts**: First request might timeout
3. **Memory Limits**: Large operations might fail
4. **Import Issues**: ES modules vs CommonJS conflicts

## Immediate Action

1. **Check Vercel function logs** for specific error
2. **Add missing dependencies** to server/package.json
3. **Simplify the handler** to test basic functionality
4. **Consider alternative deployment** if issues persist

The key is to identify the specific error from the Vercel logs to understand what's causing the crash.
