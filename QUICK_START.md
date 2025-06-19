# Quick Start Deployment Guide

Get your MJD Construction CRM deployed to AWS in minutes!

## 🚀 One-Command Deployment

### Prerequisites (5 minutes)

1. Install [AWS CLI](https://aws.amazon.com/cli/) and run `aws configure`
2. Install [Node.js](https://nodejs.org/) (v18+)
3. Have your Supabase credentials ready

### Step 1: Environment Setup (2 minutes)

```bash
# Copy environment templates
cp server/env.example server/.env
cp client/env.example client/.env.production

# Edit server/.env with your actual values:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - COHERE_API_KEY
# - OPENAI_API_KEY
```

### Step 2: Deploy (3 minutes)

**Windows:**

```powershell
.\deploy.ps1
```

**macOS/Linux:**

```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Configure Frontend (2 minutes)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app" → "Deploy without Git"
3. Upload the `client/dist` folder (created by the script)
4. Set environment variables:
   - `VITE_API_URL`: Your Lambda API URL (shown after deployment)
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## ✅ That's it!

Your application is now live on AWS!

- **Backend**: Running on AWS Lambda
- **Frontend**: Hosted on AWS Amplify
- **Database**: Supabase (already configured)

## 🔧 Alternative: Manual Commands

If you prefer manual control:

```bash
# Install all dependencies
npm run install:all

# Deploy backend
npm run deploy:backend

# Build frontend
npm run build:client

# Then upload client/dist to Amplify Console
```

## 📞 Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- View AWS CloudWatch logs for Lambda issues
- Check Amplify Console for build errors

**Happy deploying! 🎉**
