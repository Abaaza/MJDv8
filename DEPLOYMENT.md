# AWS Deployment Guide

This guide will help you deploy your MJD Construction CRM application to AWS using:

- **AWS Lambda** for the backend API (using Serverless Framework)
- **AWS Amplify** for the frontend React application

## Prerequisites

Before you begin, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** (v18 or later) and npm installed
4. **Git** for version control
5. **Serverless Framework** (will be installed automatically)

## Setup Instructions

### 1. Configure AWS CLI

```bash
aws configure
```

Enter your:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (`json`)

### 2. Environment Variables

Create a `.env` file in the `server` directory with your environment variables:

```bash
# server/.env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
COHERE_API_KEY=your_cohere_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Quick Deployment

#### Option A: Using the Deployment Script (Recommended)

**For Windows (PowerShell):**

```powershell
.\deploy.ps1
```

**For macOS/Linux (Bash):**

```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option B: Manual Deployment

**Deploy Backend to Lambda:**

```bash
cd server
npm install
npm run deploy
cd ..
```

**Prepare Frontend for Amplify:**

```bash
cd client
npm install
npm run build
cd ..
```

## AWS Amplify Setup

### Method 1: Using AWS Amplify Console (Recommended)

1. **Go to AWS Amplify Console**

   - Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"

2. **Connect Repository**

   - Choose "Deploy without Git provider" for manual upload
   - Or connect your GitHub/GitLab repository

3. **Configure Build Settings**

   - Use the provided `amplify.yml` file
   - Or manually set:
     - Build command: `npm run build`
     - Base directory: `client`
     - Artifact directory: `client/dist`

4. **Environment Variables**
   Set these in Amplify Console → App Settings → Environment variables:

   ```
   VITE_API_URL=https://your-api-gateway-url.amazonaws.com
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy**
   - Click "Save and deploy"
   - Wait for the build to complete

### Method 2: Using Amplify CLI

1. **Install Amplify CLI**

   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify**

   ```bash
   amplify init
   ```

3. **Add Hosting**

   ```bash
   amplify add hosting
   ```

   - Choose "Amazon CloudFront and S3"

4. **Deploy**
   ```bash
   amplify publish
   ```

## Configuration Files Explained

### `serverless.yml`

- Configures AWS Lambda deployment
- Sets up API Gateway for HTTP endpoints
- Manages environment variables and permissions

### `amplify.yml`

- Defines build process for AWS Amplify
- Sets up security headers
- Configures artifact locations

### Deployment Scripts

- `deploy.sh` (Bash) and `deploy.ps1` (PowerShell)
- Automate the entire deployment process
- Handle environment variable setup
- Provide deployment status and next steps

## Troubleshooting

### Common Issues

1. **Lambda Timeout Errors**

   - Increase timeout in `serverless.yml` (currently set to 900 seconds)
   - Increase memory allocation if needed

2. **CORS Issues**

   - Check CORS configuration in `serverless.yml`
   - Ensure frontend URL is allowed in backend CORS settings

3. **Environment Variables Not Working**

   - Verify `.env` file exists in `server` directory
   - Check AWS Lambda environment variables in console
   - Ensure Amplify environment variables are set correctly

4. **Build Failures**
   - Check Node.js version compatibility
   - Clear node_modules and reinstall dependencies
   - Verify all required environment variables are set

### Useful Commands

**Check Serverless deployment info:**

```bash
cd server
npx serverless info
```

**View Lambda logs:**

```bash
npx serverless logs -f api
```

**Remove deployment:**

```bash
npx serverless remove
```

## Security Considerations

1. **Environment Variables**

   - Never commit `.env` files to version control
   - Use AWS Systems Manager Parameter Store for sensitive data

2. **API Security**

   - Implement proper authentication and authorization
   - Use HTTPS only
   - Set up rate limiting

3. **Frontend Security**
   - Security headers are configured in `amplify.yml`
   - Use environment variables for API endpoints
   - Implement proper error handling

## Monitoring and Maintenance

1. **AWS CloudWatch**

   - Monitor Lambda function performance
   - Set up alerts for errors and timeouts

2. **AWS Amplify Console**

   - Monitor build and deployment status
   - View access logs and performance metrics

3. **Cost Optimization**
   - Monitor AWS costs in AWS Cost Explorer
   - Optimize Lambda memory and timeout settings
   - Use appropriate Amplify pricing tier

## Support

If you encounter issues:

1. Check AWS CloudWatch logs for Lambda functions
2. Review Amplify build logs in the console
3. Verify all environment variables are correctly set
4. Ensure AWS credentials have proper permissions

## Next Steps

After successful deployment:

1. Test all application features
2. Set up custom domain (optional)
3. Configure SSL certificates
4. Set up monitoring and alerts
5. Implement backup strategies
6. Plan for scaling and optimization

---

**Happy Deploying! 🚀**
