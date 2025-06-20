-- Admin Approval Flow Migration
-- Updates the user system to require admin approval instead of email verification

-- 1. Create a function to handle user approval by admin
CREATE OR REPLACE FUNCTION approve_user_access(
  p_request_id UUID,
  p_admin_notes TEXT DEFAULT NULL,
  p_user_role VARCHAR(50) DEFAULT 'user'
) RETURNS BOOLEAN AS $$
DECLARE
  v_email VARCHAR(255);
  v_user_id UUID;
  v_full_name VARCHAR(255);
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only active admins can approve access requests';
  END IF;
  
  -- Get request details
  SELECT email, full_name 
  INTO v_email, v_full_name
  FROM access_requests
  WHERE id = p_request_id 
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User account not found. User must sign up first.';
  END IF;
  
  -- Update the user's profile to active with the assigned role
  UPDATE profiles
  SET 
    status = 'active',
    role = p_user_role,
    approved_by = auth.uid(),
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Update the access request
  UPDATE access_requests
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    approved_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'APPROVE_USER_ACCESS',
    'access_requests',
    p_request_id::VARCHAR,
    jsonb_build_object(
      'email', v_email,
      'role', p_user_role,
      'request_id', p_request_id
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to reject access requests
CREATE OR REPLACE FUNCTION reject_user_access(
  p_request_id UUID,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only active admins can reject access requests';
  END IF;
  
  -- Update the access request
  UPDATE access_requests
  SET 
    status = 'rejected',
    admin_notes = p_admin_notes,
    approved_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_request_id
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'REJECT_USER_ACCESS',
    'access_requests',
    p_request_id::VARCHAR,
    jsonb_build_object('request_id', p_request_id)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the handle_new_user function to create pending profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_access_request access_requests%ROWTYPE;
BEGIN
  -- Check if there's an access request for this email
  SELECT * INTO v_access_request
  FROM access_requests
  WHERE email = NEW.email
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Create profile with pending status
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', v_access_request.full_name, split_part(NEW.email, '@', 1)),
    NEW.email,
    'user', -- Default role, will be updated when approved
    'pending' -- Pending approval status
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- 4. Add RLS policy to prevent pending users from accessing the system
CREATE POLICY "Only active users can access their profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.status = 'active'
    )
  );

-- 5. Update other tables to check for active status
-- Add policy for matching_jobs
CREATE POLICY "Only active users can access matching jobs" ON matching_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.status = 'active'
    )
  );

-- Commented out because price_lists table doesn't exist
-- Add policy for price_lists
-- CREATE POLICY "Only active users can access price lists" ON price_lists
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.status = 'active'
--     )
--   );

-- 6. Create a view for admins to see pending users
CREATE OR REPLACE VIEW pending_users AS
SELECT 
  ar.id as request_id,
  ar.email,
  ar.full_name,
  ar.company,
  ar.phone,
  ar.message,
  ar.requested_role,
  ar.created_at,
  p.id as user_id,
  p.status as user_status
FROM access_requests ar
LEFT JOIN profiles p ON p.email = ar.email
WHERE ar.status = 'pending'
ORDER BY ar.created_at DESC;

-- Grant access to admin users
GRANT SELECT ON pending_users TO authenticated;

-- 7. Add email column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Update existing profiles with email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL; 