# Fix Ngrok Connection Issues

## Problem

Your frontend is not connecting to your backend through ngrok. The errors show:

- 404 on `/settings` endpoint
- 500 error when processing files with "The specified bucket does not exist"

## Root Cause

The frontend is not configured with the correct ngrok URL, so it's trying to connect to a non-existent or outdated ngrok tunnel.

## Solution Steps

### Step 1: Start Your Backend Server

```powershell
cd server
npm start
```

The server should start on port 3001.

### Step 2: Start Ngrok Tunnel

In a new terminal:

```powershell
cd server
.\start-tunnel-debug.ps1
```

This will:

- Check if the server is running
- Test the health endpoint
- Start ngrok and show you the URL

**Important**: Copy the HTTPS URL that ngrok shows (e.g., `https://1234-your-ip.ngrok-free.app`)

### Step 3: Update Frontend Configuration

Run the update script with your ngrok URL:

```powershell
.\update-ngrok-url.ps1 -NgrokUrl "https://1234-your-ip.ngrok-free.app"
```

This will create/update `client/.env.local` with the correct API URL.

### Step 4: Restart Frontend

```powershell
cd client
npm run dev
```

The frontend needs to restart to pick up the new environment variable.

### Step 5: Test the Connection

1. Open your browser console (F12)
2. Navigate to the Settings page
3. You should see requests going to your ngrok URL
4. Check the server terminal - you should see incoming requests logged

## Debugging Tips

### Check Server Logs

With the new logging, your server will show:

```
🔵 Incoming Request:
   Time: 2024-01-20T10:00:00.000Z
   Method: GET
   URL: /api/user-management/users
   Origin: http://localhost:5173
   Host: 1234-your-ip.ngrok-free.app
```

### Test Ngrok Connection

Run the test script:

```powershell
cd server
node test-ngrok-connection.js
```

This will test both local and ngrok endpoints.

### Common Issues

1. **Ngrok URL Changes**: Every time you restart ngrok, you get a new URL. You must update the frontend configuration.

2. **CORS Issues**: The server is configured to accept requests from localhost:5173. If you're running the frontend on a different port, update `server/app.js`.

3. **Server Not Running**: Make sure the backend server is running before starting ngrok.

4. **Old Environment Variables**: Clear your browser cache or open in incognito mode to ensure new environment variables are loaded.

## Quick Checklist

- [ ] Backend server running on port 3001
- [ ] Ngrok tunnel active and showing the URL
- [ ] Frontend `.env.local` has the correct `VITE_API_URL`
- [ ] Frontend dev server restarted after updating `.env.local`
- [ ] Browser console shows requests to ngrok URL (not localhost)
- [ ] Server terminal shows incoming requests

## Alternative: Local Development

If you want to skip ngrok for local development:

1. Don't set `VITE_API_URL` in `.env.local`
2. The frontend will default to `http://localhost:3001`
3. Make sure both frontend and backend are running locally
