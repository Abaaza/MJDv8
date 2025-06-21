# Fix Vercel API URL Issue

## The Problem
Your frontend is deployed on Vercel but it's still trying to connect to `localhost:3001` instead of your Vercel backend. This happens because:

1. The backend might not be deployed properly
2. The `VITE_API_URL` environment variable is not set
3. The frontend is falling back to localhost

## Quick Fix

### Option 1: Set API URL to Same Domain (Recommended)

Since both frontend and backend are on Vercel, update your frontend to use the same domain:

1. **In Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add this variable:**
   ```
   VITE_API_URL = https://your-app-name.vercel.app
   ```
   (Replace `your-app-name` with your actual Vercel app URL)

3. **Redeploy your frontend**

### Option 2: Use Relative URLs (Even Better)

Update your frontend code to use relative URLs since everything is on the same domain:

In `client/src/components/PriceMatching.tsx`, change:
```typescript
// From this:
const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/price-matching/process-base64`, {

// To this:
const response = await fetch(`/price-matching/process-base64`, {
```

This way, it automatically uses the same domain.

### Option 3: Check if Backend is Actually Deployed

Test your backend by visiting:
```
https://your-app-name.vercel.app/health
```

If it returns a 404, your backend isn't deployed properly.

## Quick Test Commands

```bash
# Test if your backend is working
curl https://your-app-name.vercel.app/health

# Should return:
# {"status":"ok","timestamp":"2024-01-20T10:00:00.000Z"}
```

## If Backend is Not Deployed

The issue might be that Vercel only deployed your frontend. To fix:

1. **Check Vercel build logs** for any backend deployment errors
2. **Ensure `server/handler.js` exists** and exports your app
3. **Verify `vercel.json` routing** is correct

## Alternative: Deploy Backend Separately

If Vercel full-stack deployment is problematic:

1. **Keep frontend on Vercel**
2. **Deploy backend on Railway/Render**
3. **Set `VITE_API_URL`** to your backend URL

## The Root Cause

Your frontend code has this fallback:
```typescript
import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

Since `VITE_API_URL` is not set in Vercel, it defaults to localhost, which doesn't exist in the browser when visiting your Vercel app.

## Immediate Fix

**Add this environment variable in Vercel:**
```
VITE_API_URL = https://mj-dv823-ftpronvam-aabaza90-3038s-projects.vercel.app
```

Then redeploy your app. This should fix the CORS/localhost issue immediately! 