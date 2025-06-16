
-- =================================================================
-- SCHEMA SCRIPT FOR A BRAND NEW SUPABASE PROJECT (RLS Corrected)
-- =================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  role TEXT DEFAULT 'user' NOT NULL, -- Possible roles: 'user', 'admin'
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to update 'updated_at' on profile changes
DROP TRIGGER IF EXISTS on_profiles_update ON public.profiles;
CREATE TRIGGER on_profiles_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, theme, email_notifications, push_notifications)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    'user',
    'light',
    true,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to call handle_new_user on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- App Settings Table (for global configuration)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY CHECK (id = 1), -- Enforces a single row
  currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
  cohere_api_key TEXT,
  openai_api_key TEXT,
  company_name VARCHAR(255) DEFAULT 'ConstructCRM',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default settings row
INSERT INTO public.app_settings (id, currency, company_name) VALUES (1, 'USD', 'ConstructCRM')
ON CONFLICT (id) DO UPDATE SET
currency = EXCLUDED.currency,
company_name = EXCLUDED.company_name;

-- Trigger to update 'updated_at' on settings changes
DROP TRIGGER IF EXISTS on_app_settings_update ON public.app_settings;
CREATE TRIGGER on_app_settings_update
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Price Items Table
CREATE TABLE IF NOT EXISTS public.price_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50),
  ref VARCHAR(50),
  description TEXT NOT NULL,
  category VARCHAR(255),
  sub_category VARCHAR(255),
  unit VARCHAR(50),
  rate NUMERIC(12, 2),
  keywords TEXT[],
  phrases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_price_items_description_gin ON public.price_items USING GIN (to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_price_items_category ON public.price_items (category);
CREATE INDEX IF NOT EXISTS idx_price_items_user_id ON public.price_items (user_id);

DROP TRIGGER IF EXISTS on_price_items_update ON public.price_items;
CREATE TRIGGER on_price_items_update
BEFORE UPDATE ON public.price_items
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients (user_id);

DROP TRIGGER IF EXISTS on_clients_update ON public.clients;
CREATE TRIGGER on_clients_update
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects (client_id);

DROP TRIGGER IF EXISTS on_projects_update ON public.projects;
CREATE TRIGGER on_projects_update
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Matching Jobs Table
CREATE TABLE IF NOT EXISTS public.matching_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
  progress INT DEFAULT 0,
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_matching_jobs_project_id ON public.matching_jobs (project_id);
CREATE INDEX IF NOT EXISTS idx_matching_jobs_user_id ON public.matching_jobs (user_id);

DROP TRIGGER IF EXISTS on_matching_jobs_update ON public.matching_jobs;
CREATE TRIGGER on_matching_jobs_update
BEFORE UPDATE ON public.matching_jobs
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile and admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only admins can access app settings" ON public.app_settings;

DROP POLICY IF EXISTS "Authenticated users can view price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can insert their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can update their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can delete their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can view their own price items" ON public.price_items;
DROP POLICY IF EXISTS "Users can create their own price items" ON public.price_items;

DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

DROP POLICY IF EXISTS "Users can manage their own matching jobs" ON public.matching_jobs;
DROP POLICY IF EXISTS "Users can view their own matching jobs" ON public.matching_jobs;
DROP POLICY IF EXISTS "Users can create their own matching jobs" ON public.matching_jobs;
DROP POLICY IF EXISTS "Users can update their own matching jobs" ON public.matching_jobs;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- App Settings policies
CREATE POLICY "Authenticated users can read settings"
  ON public.app_settings FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Admins can update settings"
  ON public.app_settings FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Price Items policies
CREATE POLICY "Authenticated users can view price items"
  ON public.price_items FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Users can insert their own price items"
  ON public.price_items FOR INSERT 
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own price items"
  ON public.price_items FOR UPDATE 
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own price items"
  ON public.price_items FOR DELETE 
  TO authenticated USING (user_id = auth.uid());

-- Clients policies
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own clients"
  ON public.clients FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE 
  USING (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE 
  USING (user_id = auth.uid());

-- Matching Jobs policies
CREATE POLICY "Users can view their own matching jobs"
  ON public.matching_jobs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own matching jobs"
  ON public.matching_jobs FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own matching jobs"
  ON public.matching_jobs FOR UPDATE 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
