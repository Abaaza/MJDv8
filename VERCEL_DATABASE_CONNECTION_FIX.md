# Fix Vercel Database Connection Issue

## Problem Identified ✅

Your jobs are getting stuck at pending because the Vercel serverless functions can't connect to Supabase. The health check shows:

```json
{
  "database": {
    "status": "unhealthy",
    "connected": false,
    "error": "Database not connected"
  }
}
```

## Root Cause

The Supabase environment variables are either:

1. **Missing** from Vercel environment variables
2. **Incorrect** (wrong URL or keys)
3. **Not deployed** (need to redeploy after adding them)

## **IMMEDIATE FIX**

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables** (get them from your Supabase dashboard):

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGci...
   SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGci...
   ```

3. **Set Environment**: Production

### Step 2: Redeploy Your Application

After adding the environment variables:

1. **Go to Deployments tab** in Vercel
2. **Click "Redeploy"** on the latest deployment
3. **Wait for redeployment** to complete (2-3 minutes)

### Step 3: Verify the Fix

Test the health endpoint:

```bash
curl https://mjdpricing.braunwell.co.uk/health
```

**Expected result after fix**:

```json
{
  "status": "ok",
  "database": {
    "status": "healthy",
    "connected": true
  }
}
```

## Get Your Supabase Credentials

If you don't have your Supabase credentials:

1. **Go to Supabase Dashboard** → Your Project
2. **Settings** → **API**
3. **Copy these values**:
   - **URL**: `https://your-project-id.supabase.co`
   - **Anon key**: `eyJ0eXAiOiJKV1QiLCJhbGci...` (public key)
   - **Service role key**: `eyJ0eXAiOiJKV1QiLCJhbGci...` (secret key)

## Why This Fixes the Pending Jobs

Once the database connection is restored:

1. ✅ Processing function can fetch job details
2. ✅ Job status updates from "pending" to "processing"
3. ✅ Price items can be loaded from database
4. ✅ Match results can be saved
5. ✅ Job completes successfully

## Verification Commands

After the fix, test these endpoints:

```bash
# Health check (should show database: healthy)
curl https://mjdpricing.braunwell.co.uk/health

# Test processing endpoint
curl -X POST https://mjdpricing.braunwell.co.uk/api/process \
  -H "Content-Type: application/json" \
  -d '{"jobId":"test-123"}'
```

## Additional Fixes Made

I've also enhanced the processing function with:

- **Better error logging** to diagnose issues faster
- **Improved timeout handling** for the function trigger
- **Database connection checks** before processing
- **Enhanced status updates** throughout the pipeline

## Expected Timeline

- **Adding environment variables**: 2 minutes
- **Redeployment**: 3-5 minutes
- **Testing**: 1 minute
- **Total**: ~10 minutes

After this fix, your price matching jobs should start working normally again!
