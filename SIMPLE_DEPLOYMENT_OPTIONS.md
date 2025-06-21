# Simplest Backend Deployment Options (No GitHub Actions)

## Option 1: Railway (Easiest - 5 minutes)

Railway is the simplest option - just connect your GitHub and it deploys automatically.

### Steps:

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect Node.js and deploy

### Add Environment Variables:

In Railway dashboard → Variables:

```
SUPABASE_URL=https://yqsumodzyahvxywwfpnc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnl5d3dmcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NDQzNDAsImV4cCI6MjA1MjUyMDM0MH0.qjSUPPm3dN-96F6x7LB-FnE2O7aAVUJNgPRmkVUxUTU
SUPABASE_SERVICE_ROLE_KEY=(your service role key)
PORT=3001
```

### Update Frontend:

Railway gives you a URL like: `https://your-app.railway.app`
Update Amplify environment: `VITE_API_URL=https://your-app.railway.app`

## Option 2: Render (Also Easy)

### Steps:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Select your repo
5. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

### Add Environment Variables:

Same as Railway above

### Update Frontend:

Use the Render URL in Amplify: `VITE_API_URL=https://your-app.onrender.com`

## Option 3: Heroku (Classic Option)

### Install Heroku CLI:

```bash
# Windows
winget install Heroku.HerokuCLI
```

### Deploy:

```bash
cd server
heroku create your-app-name
heroku config:set SUPABASE_URL=https://yqsumodzyahvxywwfpnc.supabase.co
heroku config:set SUPABASE_ANON_KEY=your-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-key
git push heroku main
```

### Update Frontend:

`VITE_API_URL=https://your-app-name.herokuapp.com`

## Option 4: AWS Elastic Beanstalk (If you must use AWS)

This is simpler than Lambda and avoids most CORS issues.

### Prepare:

```bash
cd server
npm install -g eb-cli
eb init -p node.js-20 your-app-name
```

### Deploy:

```bash
eb create your-environment-name
eb setenv SUPABASE_URL=https://yqsumodzyahvxywwfpnc.supabase.co
eb setenv SUPABASE_ANON_KEY=your-key
eb setenv SUPABASE_SERVICE_ROLE_KEY=your-service-key
eb deploy
```

### Update Frontend:

Use the EB URL in Amplify

## Why These Work Better:

1. **No CORS Issues**: These platforms handle CORS automatically
2. **No IAM Complexity**: No AWS permissions to configure
3. **Simple Environment Variables**: Just add them in the dashboard
4. **Automatic HTTPS**: All provide SSL certificates
5. **Easy Logs**: View logs directly in the dashboard

## Recommendation:

**Use Railway or Render** - they're the simplest and work great with your setup. Both offer:

- Free tier available
- Automatic deployments from GitHub
- Simple environment variable management
- No CORS configuration needed
- Works exactly like localhost

## Quick Test After Deployment:

```bash
# Replace with your actual URL
curl https://your-app.railway.app/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-01-20T10:00:00.000Z" }
```
