# 🚀 Serverless Deployment Guide

This guide will help you deploy your MJD backend to AWS Lambda with proper environment variables and CORS configuration.

## 📋 Prerequisites

1. **AWS CLI configured** with proper credentials
2. **Node.js 20+** installed
3. **Serverless Framework** (installed via npm)

## 🔧 Setup Steps

### 1. Configure AWS Credentials

```bash
# Option 1: AWS CLI (recommended)
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 2. Prepare Environment Variables

The deployment script will automatically create a `.env` file from the template if it doesn't exist.

**Manual setup** (if needed):

```bash
# Copy the production template
cp env.production .env

# Edit .env and verify the values
nano .env
```

### 3. Validate Configuration

```bash
# Check environment and dependencies
npm run check-env
```

## 🚀 Deployment Commands

### Quick Deployment (Production)

```bash
npm run deploy
```

### Stage-Specific Deployment

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod

# Deploy to custom stage
node deploy.js staging us-west-2
```

## 📊 Monitoring & Logs

### View Logs

```bash
# Production logs
npm run logs

# Development logs
npm run logs:dev

# Custom stage logs
npx serverless logs -f api -s your-stage --tail
```

### Check Deployment Info

```bash
npx serverless info --stage prod
```

## 🔗 CORS Configuration

The deployment includes comprehensive CORS configuration at multiple levels:

### 1. API Gateway Level (serverless.yml)

- Handles preflight OPTIONS requests
- Configured for your frontend domains
- Includes all necessary headers

### 2. Express App Level (app.js)

- Runtime CORS handling
- Credential support
- Multiple origin support

### 3. S3 Bucket Level

- File upload/download CORS
- Matches frontend domains

## 🌐 Frontend Integration

After deployment, update your frontend with the new API endpoint:

```javascript
// In your frontend .env or config
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

## 🛠️ Environment Variables Reference

### Required Variables (in .env)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Automatically Set by Serverless

```bash
NODE_ENV=production
S3_BUCKET_NAME=mjd-backend-4-prod-uploads
AWS_REGION=us-east-1
```

## 🔍 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**

   ```bash
   # Check if .env exists and has correct values
   npm run check-env
   ```

2. **AWS Credentials Issues**

   ```bash
   # Verify AWS configuration
   aws sts get-caller-identity
   ```

3. **CORS Errors**

   - Ensure your frontend domain is in `serverless.yml` allowedOrigins
   - Check both API Gateway and Express CORS configs match
   - Verify the frontend is using the correct API endpoint

4. **S3 Permission Errors**
   - The deployment creates the S3 bucket with proper permissions
   - IAM role includes all necessary S3 actions

### Debugging Steps

1. **Check deployment status:**

   ```bash
   npx serverless info --stage prod
   ```

2. **View real-time logs:**

   ```bash
   npm run logs
   ```

3. **Test endpoints:**
   ```bash
   curl https://your-api.execute-api.us-east-1.amazonaws.com/health
   ```

## 🔄 Redeployment

To redeploy after changes:

```bash
# Quick redeploy
npm run deploy

# Or with specific stage
npm run deploy:prod
```

## 📦 What Gets Deployed

### Included Files

- `handler.js` - Serverless entry point
- `app.js` - Express application
- `routes/**` - API routes
- `services/**` - Business logic
- `check-environment.js` - Environment validation

### Excluded Files

- `node_modules/` - Rebuilt on AWS
- `.env*` - Environment variables handled by serverless
- `temp/**` - Local development files
- `output/**` - Local development files
- `*.log` - Log files

## 🎯 Production Checklist

- [ ] AWS credentials configured
- [ ] Environment variables validated (`npm run check-env`)
- [ ] Frontend domains added to CORS configuration
- [ ] Deployment successful (`npm run deploy`)
- [ ] Health check endpoint responding
- [ ] Frontend updated with new API URL
- [ ] All features tested in production

## 🆘 Getting Help

If you encounter issues:

1. Check the deployment logs
2. Verify environment configuration
3. Test individual endpoints
4. Check AWS CloudWatch logs
5. Validate CORS configuration

## 📈 Performance Notes

- **Memory**: 2048MB allocated
- **Timeout**: 15 minutes (900 seconds)
- **Runtime**: Node.js 20.x
- **S3**: Versioning enabled for file safety

This configuration provides robust performance for price matching operations and file handling.
