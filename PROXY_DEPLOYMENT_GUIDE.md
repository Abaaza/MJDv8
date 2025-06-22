# Proxy Project Deployment Guide

This guide explains how to deploy your MJD Pricing app under `braunwell.co.uk/mjdpricing` using Vercel's proxy project approach.

## Overview

You'll need to create **two Vercel projects**:

1. **Proxy Project** - Routes traffic from braunwell.co.uk to different apps
2. **MJD Pricing App** - Your actual application

## Step 1: Deploy the MJD Pricing App

1. Deploy your current MJD project to Vercel as normal
2. Note the deployment URL (e.g., `mjd-pricing-app.vercel.app`)
3. The app is already configured with `base: "/mjdpricing/"` in vite.config.ts

## Step 2: Create the Proxy Project

1. Create a new directory for the proxy project
2. Copy the `proxy-vercel.json` file to this directory and rename it to `vercel.json`
3. Update the destination URLs in the vercel.json:

```json
{
  "rewrites": [
    {
      "source": "/mjdpricing/",
      "destination": "https://your-actual-mjd-app.vercel.app/"
    },
    {
      "source": "/mjdpricing/:match*",
      "destination": "https://your-actual-mjd-app.vercel.app/:match*"
    },
    {
      "source": "/",
      "destination": "https://your-main-braunwell-site.vercel.app/"
    },
    {
      "source": "/:match*",
      "destination": "https://your-main-braunwell-site.vercel.app/:match*"
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

## Important Notes

1. **Only assign the custom domain to the proxy project**, not the individual apps
2. The MJD app will be accessible at both:
   - Direct URL: `mjd-pricing-app.vercel.app`
   - Proxy URL: `braunwell.co.uk/mjdpricing/`
3. All API routes are relative and will work correctly
4. The `base: "/mjdpricing/"` in vite.config.ts ensures assets load correctly

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

- If assets don't load, verify the `base: "/mjdpricing/"` is set in vite.config.ts
- If API calls fail, check that they're using relative URLs (which they should be)
- Ensure the proxy vercel.json has the correct destination URLs
