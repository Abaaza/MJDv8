# Quick Deploy Guide - Backend to AWS

You have 2 options to deploy your backend to AWS:

## Option 1: GitHub Actions (Recommended)

### Setup (One-time)

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `SUPABASE_URL` (https://yqsumodzyahvxywwfpnc.supabase.co)
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Deploy

- Push to `main` branch, or
- Go to Actions tab → Run workflow

### After Deploy

1. Get API URL from GitHub Actions logs
2. Update Amplify environment variable: `VITE_API_URL`

## Option 2: Deploy from Local Machine

### Setup

```bash
# Install AWS CLI and configure
aws configure

# Install Serverless
npm install -g serverless
```

### Deploy

```bash
cd server
npm install
serverless deploy --stage prod
```

### Get API URL

```bash
serverless info --stage prod
# Copy the API endpoint URL
```

### Update Frontend

Add to Amplify environment variables:

```
VITE_API_URL = https://your-api-id.execute-api.us-east-1.amazonaws.com
```

## Which Option to Choose?

- **GitHub Actions**: Best for team collaboration, automatic deployments
- **Local Deploy**: Quick for testing, one-time deployments

Both options will:

- ✅ Deploy to AWS Lambda
- ✅ Create S3 bucket for file storage
- ✅ Set up API Gateway with CORS
- ✅ Work with your Amplify frontend

## Testing Your Deployment

```bash
# Replace with your actual API URL
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-01-20T10:00:00.000Z" }
```
