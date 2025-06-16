
-- Fix infinite recursion in profiles RLS policy
-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop existing price_items policies
DROP POLICY IF EXISTS "Users can insert their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can update their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can delete their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can view all price items" ON public.price_items;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create correct RLS policies using the security definer function
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Enable RLS on price_items table and create policies
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all price items" ON public.price_items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own price items" ON public.price_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price items" ON public.price_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price items" ON public.price_items
  FOR DELETE USING (auth.uid() = user_id);
