# 🚀 Amplify Environment Variables Setup

## 📋 Environment Variables to Add in Amplify Console

### **Step 1: Go to Amplify Console**

1. Open AWS Amplify Console
2. Select your app: **MJDv8**
3. Go to **"Environment variables"** section

### **Step 2: Add These Variables**

```bash
# API URL - Your ngrok tunnel
VITE_API_URL=https://1532-41-68-52-168.ngrok-free.app

# Supabase Configuration
VITE_SUPABASE_URL=https://yqsumodzyahvxywwfpnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU1NTAsImV4cCI6MjA2NTYwMTU1MH0.vfTx3_A7DMpcazSA_pbuYaiMuZvVssKn9JUQUb9qaS4
```

### **Step 3: Redeploy**

After adding environment variables:

1. Click **"Redeploy this version"**
2. Wait for deployment to complete
3. Your frontend will now connect to your ngrok API!

### **Step 4: Test Your Live Integration**

- **Frontend**: https://main.d197lvv1o18hb3.amplifyapp.com
- **API**: https://1532-41-68-52-168.ngrok-free.app
- **Test**: Login, user management, price matching

## 🎯 **What This Does:**

✅ Your Amplify frontend will call your ngrok API  
✅ All features will work: login, admin, price matching  
✅ S3 storage continues working  
✅ Global access for testing

## 🔄 **When ngrok URL Changes:**

If you restart ngrok and get a new URL:

1. Update `VITE_API_URL` in Amplify
2. Redeploy frontend
3. New integration ready!
