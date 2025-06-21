# Deploy to Render - Step by Step Guide

## Why Render is Perfect for Your App

- ✅ Easy to specify `server` directory
- ✅ No CORS issues
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Simple environment variables
- ✅ Works exactly like localhost

## Step 1: Go to Render

1. Visit [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

## Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub account if not already connected
3. Find and select your repository (MJDv8)
4. Click "Connect"

## Step 3: Configure Your Service

Fill in these settings:

| Setting            | Value                                  |
| ------------------ | -------------------------------------- |
| **Name**           | `mjd-backend` (or any name you prefer) |
| **Root Directory** | `server` ⚠️ **This is crucial!**       |
| **Environment**    | `Node`                                 |
| **Region**         | `Oregon (US West)` or closest to you   |
| **Branch**         | `main`                                 |
| **Build Command**  | `npm install`                          |
| **Start Command**  | `npm start`                            |

## Step 4: Add Environment Variables

Click "Advanced" → Add these environment variables:

| Key                         | Value                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SUPABASE_URL`              | `https://yqsumodzyahvxywwfpnc.supabase.co`                                                                                                                                                                         |
| `SUPABASE_ANON_KEY`         | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnl5d3dmcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NDQzNDAsImV4cCI6MjA1MjUyMDM0MH0.qjSUPPm3dN-96F6x7LB-FnE2O7aAVUJNgPRmkVUxUTU` |
| `SUPABASE_SERVICE_ROLE_KEY` | (Get from your Supabase dashboard)                                                                                                                                                                                 |
| `NODE_ENV`                  | `production`                                                                                                                                                                                                       |
| `PORT`                      | `3001`                                                                                                                                                                                                             |

## Step 5: Deploy

1. Click "Create Web Service"
2. Render will start building and deploying
3. Wait for the build to complete (usually 2-3 minutes)
4. You'll get a URL like: `https://mjd-backend.onrender.com`

## Step 6: Test Your Deployment

```bash
# Replace with your actual Render URL
curl https://mjd-backend.onrender.com/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-01-20T10:00:00.000Z" }
```

## Step 7: Update Your Amplify Frontend

1. Go to AWS Amplify Console
2. Select your app
3. Go to "Environment variables"
4. Add or update:
   ```
   VITE_API_URL = https://mjd-backend.onrender.com
   ```
5. Click "Save"
6. Redeploy your frontend

## Step 8: Test Everything

1. Visit your Amplify frontend
2. Try the Settings page (should load users now)
3. Try uploading a file for price matching
4. Everything should work without CORS errors!

## Monitoring Your App

### View Logs

- In Render dashboard → Your service → Logs
- Real-time logs show all requests and errors

### Auto-Deploy

- Render automatically deploys when you push to GitHub
- No manual deployment needed

### Custom Domain (Optional)

- You can add your own domain in Render dashboard
- Free SSL certificate included

## Troubleshooting

### Build Fails

- Check the build logs in Render dashboard
- Ensure `server` directory is set correctly
- Verify `package.json` exists in server folder

### App Won't Start

- Check start command is `npm start`
- Verify environment variables are set
- Check logs for specific error messages

### Still Getting CORS Errors

- Clear browser cache
- Make sure `VITE_API_URL` in Amplify matches your Render URL exactly
- Check that your Render URL uses HTTPS

## Free Tier Limits

Render free tier includes:

- 750 hours/month (enough for most apps)
- Automatic sleep after 15 minutes of inactivity
- Wakes up automatically on first request
- Free SSL certificate

## Next Steps After Deployment

1. ✅ Backend deployed on Render
2. ✅ Frontend on Amplify
3. ✅ No more CORS issues
4. ✅ No more ngrok tunnels
5. ✅ Everything works like localhost
6. 🎉 Your app is live on the internet!

## Pro Tips

- Render sleeps after 15 minutes of inactivity (free tier)
- First request after sleep takes ~30 seconds to wake up
- Upgrade to paid plan ($7/month) for always-on service
- Render handles all the server management for you
