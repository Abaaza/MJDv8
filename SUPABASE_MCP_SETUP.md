# Supabase MCP Setup & Authentication Fix Guide

## 🚨 Current Issues Identified:

- MCP connection to Supabase is not authenticated
- Authentication context needs better error handling
- Profile creation might fail for new users

## 🔧 Step-by-Step Setup:

### 1. **Authenticate Supabase MCP**

The MCP connection appears to be unauthenticated. To fix this:

1. **Connect GitHub Account to MCP:**

   - Go to your MCP settings
   - Connect your GitHub account
   - Ensure you have access to the Supabase project

2. **Get Supabase Access Token:**
   - Go to https://supabase.com/dashboard
   - Navigate to your project settings
   - Generate a new access token with appropriate permissions
   - Add it to your MCP configuration

### 2. **Verify Database Permissions**

Run these SQL commands in your Supabase SQL editor to ensure proper RLS policies:

```sql
-- Check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Test profile creation (replace with actual UUID)
INSERT INTO public.profiles (id, name, role)
VALUES ('test-user-id', 'Test User', 'user')
ON CONFLICT (id) DO NOTHING;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
```

### 3. **Test Authentication Flow**

1. **Run the test file:**

   ```bash
   cd client
   npm run dev
   ```

2. **Open browser console and import test:**

   ```javascript
   import("./src/test-auth.js").then((module) => module.default());
   ```

3. **Check console for errors**

### 4. **Common Authentication Issues & Fixes:**

#### Issue: "Profile not found" errors

**Fix:** The improved AuthContext now automatically creates profiles for new users.

#### Issue: "Session validation failed"

**Fix:** Clear localStorage and restart:

```javascript
localStorage.clear();
window.location.reload();
```

#### Issue: "Database connection failed"

**Fix:** Check your Supabase URL and API key in `client/src/integrations/supabase/client.ts`

#### Issue: Users can't sign up

**Fix:** Check email confirmation settings in Supabase Dashboard > Authentication > Settings

### 5. **Enable Additional Security Features**

Add these to your Supabase dashboard:

1. **Email confirmation required:**

   - Go to Authentication > Settings
   - Enable "Enable email confirmations"

2. **Rate limiting:**

   - Enable rate limiting for auth endpoints

3. **Custom SMTP (optional):**
   - Configure custom email provider for better deliverability

### 6. **Environment Variables**

Create a `.env.local` file in your client directory:

```env
VITE_SUPABASE_URL=https://yqsumodzyahvxywwfpnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3Vtb2R6eWFodnh5d3dmcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU1NTAsImV4cCI6MjA2NTYwMTU1MH0.vfTx3_A7DMpcazSA_pbuYaiMuZvVssKn9JUQUb9qaS4
```

### 7. **Testing Checklist**

- [ ] MCP can connect to Supabase
- [ ] Users can sign up successfully
- [ ] Users can sign in successfully
- [ ] Profiles are created automatically
- [ ] RLS policies work correctly
- [ ] Error messages are helpful
- [ ] Sign out works properly

### 8. **Troubleshooting Commands**

If MCP still doesn't work, try these commands:

```bash
# Test Supabase connection directly
curl -X GET \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://yqsumodzyahvxywwfpnc.supabase.co/rest/v1/profiles?select=count"

# Check auth endpoint
curl -X GET \
  -H "apikey: YOUR_ANON_KEY" \
  "https://yqsumodzyahvxywwfpnc.supabase.co/auth/v1/settings"
```

## 📞 Next Steps:

1. **Authenticate MCP connection first**
2. **Test the improved authentication context**
3. **Run the test authentication script**
4. **Check browser console for any remaining errors**
5. **Test signup/signin flow end-to-end**

Let me know if you encounter any specific errors and I'll help you debug them!
