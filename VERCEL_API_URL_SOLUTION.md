# Vercel API URL Solution

## How It Works

When deploying both frontend and backend together on Vercel, you don't need to worry about setting `VITE_API_URL` anymore! The application now automatically detects the correct API URL.

### Automatic API URL Detection

The app uses smart detection in `client/src/config/api.ts`:

1. **Production (Vercel)**: Uses relative URLs (`/api/...`) - automatically uses the same domain
2. **Development**: Uses `http://localhost:3001`
3. **Custom**: If you set `VITE_API_URL`, it will use that instead

### No Environment Variable Needed!

You can deploy to Vercel without setting `VITE_API_URL` at all. The app will:

- In production: Use relative URLs (e.g., `/price-matching/process`)
- These automatically resolve to your Vercel domain

### Example Flow

1. Your app is deployed to `https://mjdv8-abc123.vercel.app`
2. Frontend makes a request to `/price-matching/process`
3. Browser automatically resolves this to `https://mjdv8-abc123.vercel.app/price-matching/process`
4. Vercel routes this to your serverless function

### Benefits

- **Zero Configuration**: No need to know your Vercel URL beforehand
- **Works with Preview Deployments**: Each preview gets its own URL automatically
- **No CORS Issues**: Same domain = no cross-origin requests
- **Simpler Deployment**: One less environment variable to manage

### If You Still Want to Set It

If you prefer to explicitly set the API URL, you can still add:

```
VITE_API_URL=https://your-app.vercel.app
```

But it's not necessary anymore!

### Testing Locally

For local development, the app automatically uses `http://localhost:3001` when you run:

```bash
cd client && npm run dev  # Frontend on :5173
cd server && npm run dev  # Backend on :3001
```

### Summary

The new setup means:

1. Deploy to Vercel
2. Add only Supabase environment variables
3. Everything just works!

No need to:

- Know your Vercel URL in advance
- Set VITE_API_URL
- Worry about CORS
- Update URLs for preview deployments
