# Manual AWS Lambda Deployment (No Serverless)

## Step 1: Prepare Your Code for Lambda

First, let's create a Lambda-compatible handler:

### Create `lambda-handler.js` in your server directory:

```javascript
import serverless from "serverless-http";
import app from "./app.js";

export const handler = serverless(app);
```

### Update your `package.json` to include the handler:

Add this to your server/package.json scripts:

```json
{
  "scripts": {
    "build": "npm install --production",
    "zip": "zip -r function.zip . -x 'node_modules/.cache/*' '*.log' 'temp/*' 'output/*'"
  }
}
```

## Step 2: Create Deployment Package

```bash
cd server
npm install --production
zip -r ../lambda-function.zip . -x "node_modules/.cache/*" "*.log" "temp/*" "output/*"
```

## Step 3: Create Lambda Function via AWS Console

1. **Go to AWS Lambda Console**
2. **Click "Create function"**
3. **Choose "Author from scratch"**
4. **Configure:**
   - Function name: `mjd-backend`
   - Runtime: `Node.js 20.x`
   - Architecture: `x86_64`

## Step 4: Upload Your Code

1. **In the Lambda function page:**

   - Go to "Code" tab
   - Click "Upload from" → ".zip file"
   - Upload your `lambda-function.zip`
   - Click "Save"

2. **Set the handler:**
   - In "Runtime settings" → Edit
   - Handler: `lambda-handler.handler`
   - Save

## Step 5: Configure Environment Variables

In Lambda function → Configuration → Environment variables:

| Key                         | Value                                      |
| --------------------------- | ------------------------------------------ |
| `SUPABASE_URL`              | `https://yqsumodzyahvxywwfpnc.supabase.co` |
| `SUPABASE_ANON_KEY`         | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  |
| `SUPABASE_SERVICE_ROLE_KEY` | (Your service role key)                    |
| `NODE_ENV`                  | `production`                               |

## Step 6: Adjust Lambda Settings

**Configuration → General configuration:**

- Memory: `2048 MB`
- Timeout: `15 minutes`

**Configuration → Permissions:**

- Your Lambda will have a default execution role
- Add S3 permissions if needed later

## Step 7: Create API Gateway

1. **Go to API Gateway Console**
2. **Create API → HTTP API**
3. **Configure:**

   - API name: `mjd-backend-api`
   - Add integration: Lambda
   - Lambda function: `mjd-backend`
   - Method: `ANY`
   - Resource path: `/{proxy+}`

4. **Configure CORS:**

   - Access-Control-Allow-Origin: `https://main.d197lvv1o18hb3.amplifyapp.com, http://localhost:5173`
   - Access-Control-Allow-Headers: `*`
   - Access-Control-Allow-Methods: `*`

5. **Deploy API:**
   - Click "Deploy"
   - You'll get a URL like: `https://abc123.execute-api.us-east-1.amazonaws.com`

## Step 8: Test Your API

```bash
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-01-20T10:00:00.000Z" }
```

## Step 9: Update Your Frontend

In AWS Amplify → Environment variables:

```
VITE_API_URL = https://your-api-id.execute-api.us-east-1.amazonaws.com
```

## Alternative: Use AWS CLI (Faster)

If you have AWS CLI configured:

```bash
# Create the function
aws lambda create-function \
  --function-name mjd-backend \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/lambda-execution-role \
  --handler lambda-handler.handler \
  --zip-file fileb://lambda-function.zip \
  --timeout 900 \
  --memory-size 2048

# Set environment variables
aws lambda update-function-configuration \
  --function-name mjd-backend \
  --environment Variables='{
    "SUPABASE_URL":"https://yqsumodzyahvxywwfpnc.supabase.co",
    "SUPABASE_ANON_KEY":"your-key",
    "SUPABASE_SERVICE_ROLE_KEY":"your-service-key",
    "NODE_ENV":"production"
  }'
```

## Updating Your Function

To update your code:

1. **Make changes to your server code**
2. **Create new zip:**
   ```bash
   cd server
   zip -r ../lambda-function-v2.zip . -x "node_modules/.cache/*" "*.log" "temp/*" "output/*"
   ```
3. **Upload via AWS Console or CLI:**
   ```bash
   aws lambda update-function-code \
     --function-name mjd-backend \
     --zip-file fileb://lambda-function-v2.zip
   ```

## Advantages of Manual Deployment

- ✅ Full control over Lambda configuration
- ✅ No Serverless framework complexity
- ✅ Direct AWS console management
- ✅ Easy to understand and debug
- ✅ No additional dependencies

## Create S3 Bucket (Optional)

If you want file storage:

```bash
aws s3 mb s3://mjd-backend-manual-uploads
aws s3api put-bucket-cors --bucket mjd-backend-manual-uploads --cors-configuration file://cors.json
```

Create `cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://main.d197lvv1o18hb3.amplifyapp.com"],
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Then add to Lambda environment:

- `S3_BUCKET_NAME` = `mjd-backend-manual-uploads`
- `AWS_REGION` = `us-east-1`
