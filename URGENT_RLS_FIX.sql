-- =================================================================
-- URGENT RLS FIX - Run this in Supabase SQL Editor immediately
-- =================================================================

-- 1. Completely disable RLS temporarily to test
ALTER TABLE public.price_items DISABLE ROW LEVEL SECURITY;

-- 2. Test if this fixes the issue, then re-enable with proper policies
-- After testing, run the following:

-- Re-enable RLS
-- ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies (there might be hidden ones)
DO $$ 
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'price_items' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.price_items', policy_name);
    END LOOP;
END $$;

-- 4. Create the simplest possible working policy
CREATE POLICY "allow_all_for_authenticated" ON public.price_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =================================================================
-- STEP BY STEP INSTRUCTIONS:
-- 
-- 1. First run just this line to disable RLS:
--    ALTER TABLE public.price_items DISABLE ROW LEVEL SECURITY;
--
-- 2. Test adding an item in your app - it should work
--
-- 3. If it works, then run the rest to re-enable with proper policy
-- =================================================================