# GitHub Secrets - Exact Values

Add these secrets in your GitHub repository settings:

## 1. AWS_ACCESS_KEY_ID

- Get this from your AWS IAM user
- Format: `AKIAIOSFODNN7EXAMPLE`

## 2. AWS_SECRET_ACCESS_KEY

- Get this from your AWS IAM user (only shown once when creating the user)
- Format: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

## 3. SUPABASE_URL

```
https://yqsumodzyahvxywwfpnc.supabase.co
```

## 4. SUPABASE_ANON_KEY

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnl5d3dmcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NDQzNDAsImV4cCI6MjA1MjUyMDM0MH0.qjSUPPm3dN-96F6x7LB-FnE2O7aAVUJNgPRmkVUxUTU
```

## 5. SUPABASE_SERVICE_ROLE_KEY

- Get this from your Supabase project settings → API → Service role key
- It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ Keep this secret! It has full access to your database

## Where to find these values:

### AWS Credentials

1. Go to AWS Console → IAM → Users
2. Create a new user or use existing one
3. Create access key → Application running outside AWS
4. Copy both Access Key ID and Secret Access Key

### Supabase Keys

1. Go to your Supabase project dashboard
2. Click Settings (gear icon) → API
3. Copy:
   - Project URL
   - anon public key
   - service_role key (under "Service role key - Secret")

## After Adding Secrets

1. Click "Add secret" for each one
2. Once all 5 are added, go to Actions tab
3. Run the "Deploy Backend to AWS Lambda" workflow
4. Check the logs for your API URL
5. Update your Amplify app with the API URL
