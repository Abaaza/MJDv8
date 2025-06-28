-- =================================================================
-- MANUAL SQL FIX for Supabase RLS Policies
-- Copy and paste these commands into your Supabase SQL Editor
-- =================================================================

-- 1. Fix price_items table policies
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view all price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can insert their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can update their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can delete their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can view their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can create their own price items" ON public.price_items;

-- Create clean, working policies for price_items
CREATE POLICY "price_items_select_policy" ON public.price_items
  FOR SELECT USING (true);

CREATE POLICY "price_items_insert_policy" ON public.price_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "price_items_update_policy" ON public.price_items
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_items_delete_policy" ON public.price_items
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Fix app_settings table policies
-- Drop existing app_settings policies
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only admins can access app settings" ON public.app_settings;

-- Create working app_settings policies
CREATE POLICY "app_settings_select_policy" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "app_settings_update_policy" ON public.app_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Ensure RLS is enabled
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Verify the policies are working
-- Test query for app_settings (should work now)
-- SELECT currency FROM public.app_settings WHERE id = 1;

-- Test query for price_items (should work now)  
-- SELECT COUNT(*) FROM public.price_items;

-- =================================================================
-- After running these commands:
-- 1. Try adding a price item in your app
-- 2. The app_settings 406 error should be resolved
-- 3. The "Add Item" button should work without RLS violations
-- =================================================================