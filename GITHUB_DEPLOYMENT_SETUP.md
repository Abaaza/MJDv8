# GitHub Deployment Setup Guide

This guide will help you set up automatic deployment of your backend to AWS Lambda using GitHub Actions.

## Prerequisites

1. AWS Account with appropriate permissions
2. GitHub repository with your code
3. Supabase project credentials

## Step 1: Get Your Credentials

### AWS Credentials

You need an AWS IAM user with programmatic access. If you don't have one:

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the `AdministratorAccess` policy (or create a custom policy with Lambda, S3, CloudFormation, and API Gateway permissions)
4. Save the Access Key ID and Secret Access Key

### Supabase Credentials

From your Supabase project settings:

- `SUPABASE_URL`: Your project URL (e.g., https://yqsumodzyahvxywwfpnc.supabase.co)
- `SUPABASE_ANON_KEY`: Your anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep this secret!)

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

| Secret Name                 | Value                                    |
| --------------------------- | ---------------------------------------- |
| `AWS_ACCESS_KEY_ID`         | Your AWS Access Key ID                   |
| `AWS_SECRET_ACCESS_KEY`     | Your AWS Secret Access Key               |
| `SUPABASE_URL`              | https://yqsumodzyahvxywwfpnc.supabase.co |
| `SUPABASE_ANON_KEY`         | Your Supabase anon key                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key           |

## Step 3: Deploy

### Automatic Deployment

The workflow will automatically deploy when you:

- Push changes to the `main` branch that affect the `server/` directory
- Manually trigger the workflow from GitHub Actions tab

### Manual Deployment

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. Select **Deploy Backend to AWS Lambda**
4. Click **Run workflow** → **Run workflow**

## Step 4: Get Your API URL

After deployment completes:

1. Check the GitHub Actions log for the deployment output
2. Look for the API URL, it will be something like:
   ```
   endpoints:
     ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
   ```

## Step 5: Update Your Amplify Frontend

1. Go to AWS Amplify Console
2. Select your app
3. Go to **Environment variables**
4. Add/Update:
   ```
   VITE_API_URL = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
   ```
5. Redeploy your frontend

## Monitoring Your Deployment

### GitHub Actions

- Go to the **Actions** tab in your repository
- Click on any workflow run to see detailed logs

### AWS CloudWatch

- Your Lambda logs are available in AWS CloudWatch
- Go to CloudWatch → Log groups → `/aws/lambda/mjd-backend-4-prod-api`

### Testing Your API

```bash
# Test health endpoint
curl https://your-api-url.execute-api.us-east-1.amazonaws.com/health

# Should return:
# {"status":"ok","timestamp":"2024-01-20T10:00:00.000Z"}
```

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs for error messages
2. Verify all secrets are set correctly
3. Ensure AWS credentials have sufficient permissions

### CORS Issues

The serverless.yml already includes your Amplify domain. If you have issues:

1. Clear browser cache
2. Check that the API URL in Amplify matches exactly
3. Verify the frontend is using HTTPS

### S3 Bucket Issues

The deployment automatically creates an S3 bucket named `mjd-backend-4-prod-uploads`. If there are issues:

1. Check AWS S3 console
2. Verify the bucket was created
3. Check IAM permissions

## Cost Optimization

AWS Lambda charges based on:

- Number of requests
- Duration of execution
- Memory allocated

Your current settings:

- Memory: 2048 MB
- Timeout: 30 seconds

This should be sufficient for most operations while keeping costs low.

## Next Steps

1. ✅ Backend deployed to AWS Lambda
2. ✅ Frontend on AWS Amplify
3. ✅ Automatic deployment via GitHub Actions
4. 🎉 Your app is now fully deployed!

## Useful Commands

```bash
# View logs from your local machine (requires AWS CLI)
aws logs tail /aws/lambda/mjd-backend-4-prod-api --follow

# Get deployment info
cd server
serverless info --stage prod
```
