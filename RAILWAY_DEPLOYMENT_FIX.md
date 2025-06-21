# Railway Deployment Fix - Server Directory

## Option 1: Use the Updated Configuration (Recommended)

I've updated your `railway.toml` and root `package.json` to handle the server directory.

### Steps:

1. Commit and push these changes to GitHub:

   ```bash
   git add railway.toml package.json
   git commit -m "Configure Railway for server deployment"
   git push
   ```

2. Railway will automatically redeploy with the correct configuration

3. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Option 2: Use Render Instead

Render allows you to specify the root directory directly in the UI.

### Steps:

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub
3. **Important**: Set Root Directory to `server`
4. Build Command: `npm install`
5. Start Command: `npm start`

## Option 3: Manual Railway Configuration

If the automatic deployment doesn't work:

1. In Railway dashboard, go to your service
2. Click Settings → Deploy
3. Override the build and start commands:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

## Option 4: Create a Separate Repository

If you want a clean solution:

1. Create a new GitHub repo just for the server
2. Copy only the `server` folder contents
3. Deploy that repo to Railway

## Quick Fix for Existing Railway Deployment

In Railway dashboard:

1. Go to your project
2. Variables → Add all your Supabase variables
3. Settings → Override start command: `cd server && npm start`
4. Trigger a new deployment

## Testing After Deployment

```bash
curl https://your-app.railway.app/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-01-20T10:00:00.000Z" }
```

## If You Still Have Issues

The configuration files I created should work, but if not, **Render.com** is your best alternative as it explicitly allows you to set the root directory to `server` in the UI.
