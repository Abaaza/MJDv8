
-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;

-- Update existing profiles to have default values
UPDATE public.profiles 
SET 
  theme = COALESCE(theme, 'light'),
  email_notifications = COALESCE(email_notifications, true),
  push_notifications = COALESCE(push_notifications, true)
WHERE theme IS NULL OR email_notifications IS NULL OR push_notifications IS NULL;
