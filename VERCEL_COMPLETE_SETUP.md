# Complete Vercel Deployment Guide for MJDv8

This guide provides a complete setup for deploying the MJDv8 application on Vercel with frontend, backend, and storage all handled by Vercel.

## Prerequisites

1. A Vercel account (free tier works)
2. Your Supabase credentials
3. The code pushed to a GitHub repository

## Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **DO NOT** click deploy yet - we need to configure environment variables first

## Step 2: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Backend Variables (Required)

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Frontend Variables (Required)

```
VITE_API_URL=https://your-project-name.vercel.app
```

**Note**: Replace `your-project-name` with your actual Vercel project name. You can find this in your Vercel dashboard.

### Optional Variables

```
DEBUG=false
NODE_ENV=production
```

## Step 3: Enable Vercel Blob Storage

1. In your Vercel dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "Blob" storage
4. Choose a name and region
5. Click "Create"

Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project.

## Step 4: Deploy

1. After setting all environment variables, click "Deploy"
2. Wait for the deployment to complete (usually 2-3 minutes)
3. Your application will be available at `https://your-project-name.vercel.app`

## Project Structure

```
MJDv8/
├── api/                    # Vercel serverless functions
│   └── index.js           # Main API handler
├── client/                # Frontend React app
│   ├── src/
│   └── dist/              # Built frontend (auto-generated)
├── server/                # Backend Express app
│   ├── routes/
│   ├── services/
│   └── app.js
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## How It Works

1. **Frontend**: Built and served as static files from `client/dist`
2. **Backend**: Runs as serverless functions via `/api` routes
3. **Storage**: Uses Vercel Blob for file uploads/downloads
4. **Database**: Uses your existing Supabase setup

## API Endpoints

All API endpoints are available at:

- `/price-matching/*` - Price matching operations
- `/user-management/*` - User management operations
- `/health` - Health check endpoint

## Troubleshooting

### "404 NOT_FOUND" Error

- Check that all environment variables are set correctly
- Ensure the `VITE_API_URL` points to your Vercel domain
- Verify that Vercel Blob storage is enabled

### "FUNCTION_INVOCATION_FAILED" Error

- Check the function logs in Vercel dashboard
- Ensure all required environment variables are set
- Verify Supabase credentials are correct

### CORS Issues

- The backend is configured to accept all origins in production
- If you still have issues, check the `VITE_API_URL` is correct

### File Upload Issues

- Ensure Vercel Blob storage is enabled
- Check that `BLOB_READ_WRITE_TOKEN` is set (automatically by Vercel)
- File size limit is 50MB

## Local Development

For local development:

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run:

   ```bash
   # Install dependencies
   npm install

   # Start frontend (in one terminal)
   cd client && npm run dev

   # Start backend (in another terminal)
   cd server && npm run dev
   ```

## Monitoring

- View logs: Vercel Dashboard → Functions → View Logs
- Check usage: Vercel Dashboard → Usage
- Monitor Blob storage: Vercel Dashboard → Storage → Your Blob Store

## Cost Considerations

- **Vercel Free Tier**: 100GB bandwidth, 100GB-hours for serverless functions
- **Vercel Blob Free Tier**: 1GB storage, 10GB bandwidth
- **Supabase Free Tier**: 500MB database, 2GB bandwidth

For most small to medium applications, the free tiers should be sufficient.

## Security Notes

1. Never commit `.env` files to Git
2. Use Vercel's environment variables for all secrets
3. The `SUPABASE_SERVICE_ROLE_KEY` should only be used on the backend
4. Enable Vercel's DDoS protection in project settings

## Support

If you encounter issues:

1. Check the Vercel function logs
2. Verify all environment variables are set
3. Ensure your Supabase project is active
4. Check that Vercel Blob storage is enabled

## Next Steps

After successful deployment:

1. Test file uploads and price matching
2. Set up a custom domain (optional)
3. Enable Vercel Analytics (optional)
4. Configure deployment notifications
