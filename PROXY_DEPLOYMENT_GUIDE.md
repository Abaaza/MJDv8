# Proxy Project Deployment Guide

This guide explains how to deploy your MJD Pricing app under `braunwell.co.uk/mjdpricing` using Vercel's proxy project approach.

## Overview

You'll need to create **two Vercel projects**:

1. **Proxy Project** - Routes traffic from braunwell.co.uk to different apps
2. **MJD Pricing App** - Your actual application

## Step 1: Deploy the MJD Pricing App

1. Deploy your current MJD project to Vercel as normal
2. Note the deployment URL (e.g., `mjd-pricing-app.vercel.app`)
3. The app is built WITHOUT a base path (vite.config.ts has no base property)

## Step 2: Create the Proxy Project

1. Create a new directory for the proxy project
2. Copy the `proxy-vercel.json` file to this directory and rename it to `vercel.json`
3. Update the destination URLs in the vercel.json:

```json
{
  "rewrites": [
    {
      "source": "/mjdpricing/(.*)",
      "destination": "https://your-actual-mjd-app.vercel.app/$1"
    },
    {
      "source": "/mjdpricing",
      "destination": "https://your-actual-mjd-app.vercel.app/"
    },
    {
      "source": "/",
      "destination": "https://your-main-braunwell-site.vercel.app/"
    },
    {
      "source": "/(.*)",
      "destination": "https://your-main-braunwell-site.vercel.app/$1"
    }
  ]
}
```

## Step 3: Deploy the Proxy Project

1. Deploy the proxy project to Vercel
2. Assign the custom domain `braunwell.co.uk` to the **proxy project** (not the MJD app)

## Step 4: Test the Setup

- `braunwell.co.uk/` → Routes to your main site
- `braunwell.co.uk/mjdpricing/` → Routes to your MJD pricing app
- `braunwell.co.uk/mjdpricing/price-matching/` → Routes to MJD app's price matching page
- `braunwell.co.uk/mjdpricing/assets/vendor.js` → Routes to MJD app's assets correctly

## Asset Forwarding Fix

The key to fixing the "MIME type" error is the proxy configuration:

- `"/mjdpricing/(.*)"` captures everything after `/mjdpricing/`
- `"$1"` forwards only the captured part, stripping the `/mjdpricing/` prefix
- This ensures `/mjdpricing/assets/vendor.js` becomes `/assets/vendor.js` on the target app

## Important Notes

1. **Only assign the custom domain to the proxy project**, not the individual apps
2. The MJD app is built WITHOUT a base path to avoid asset conflicts
3. The proxy strips the `/mjdpricing/` prefix when forwarding requests
4. All API routes are relative and will work correctly
5. Assets (JS, CSS, images) will load correctly through the proxy

## Directory Structure

```
proxy-project/
└── vercel.json

mjd-pricing-app/
├── client/
├── server/
├── api/
└── vercel.json
```

## Troubleshooting

- **"MIME type" errors**: Ensure the proxy config uses `$1` to strip the prefix
- **404 on assets**: Verify the MJD app has NO base path in vite.config.ts
- **API calls fail**: Check that they're using relative URLs (which they should be)
- **Routing issues**: Ensure the proxy vercel.json has the correct destination URLs
