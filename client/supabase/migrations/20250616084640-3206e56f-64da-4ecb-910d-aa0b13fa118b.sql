
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_generate_full_context ON public.price_items;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_full_context();

-- Update price_items table to match the provided schema
ALTER TABLE public.price_items 
DROP COLUMN IF EXISTS keywords,
DROP COLUMN IF EXISTS phrases;

-- Add individual keyword columns
ALTER TABLE public.price_items 
ADD COLUMN IF NOT EXISTS keyword_0 TEXT,
ADD COLUMN IF NOT EXISTS keyword_1 TEXT,
ADD COLUMN IF NOT EXISTS keyword_2 TEXT,
ADD COLUMN IF NOT EXISTS keyword_3 TEXT,
ADD COLUMN IF NOT EXISTS keyword_4 TEXT,
ADD COLUMN IF NOT EXISTS keyword_5 TEXT,
ADD COLUMN IF NOT EXISTS keyword_6 TEXT,
ADD COLUMN IF NOT EXISTS keyword_7 TEXT,
ADD COLUMN IF NOT EXISTS keyword_8 TEXT,
ADD COLUMN IF NOT EXISTS keyword_9 TEXT,
ADD COLUMN IF NOT EXISTS keyword_10 TEXT,
ADD COLUMN IF NOT EXISTS keyword_11 TEXT,
ADD COLUMN IF NOT EXISTS keyword_12 TEXT,
ADD COLUMN IF NOT EXISTS keyword_13 TEXT,
ADD COLUMN IF NOT EXISTS keyword_14 TEXT,
ADD COLUMN IF NOT EXISTS keyword_15 TEXT,
ADD COLUMN IF NOT EXISTS keyword_16 TEXT,
ADD COLUMN IF NOT EXISTS keyword_17 TEXT,
ADD COLUMN IF NOT EXISTS keyword_18 TEXT,
ADD COLUMN IF NOT EXISTS keyword_19 TEXT,
ADD COLUMN IF NOT EXISTS keyword_20 TEXT,
ADD COLUMN IF NOT EXISTS keyword_21 TEXT,
ADD COLUMN IF NOT EXISTS keyword_22 TEXT;

-- Add individual phrase columns
ALTER TABLE public.price_items 
ADD COLUMN IF NOT EXISTS phrase_0 TEXT,
ADD COLUMN IF NOT EXISTS phrase_1 TEXT,
ADD COLUMN IF NOT EXISTS phrase_2 TEXT,
ADD COLUMN IF NOT EXISTS phrase_3 TEXT,
ADD COLUMN IF NOT EXISTS phrase_4 TEXT,
ADD COLUMN IF NOT EXISTS phrase_5 TEXT,
ADD COLUMN IF NOT EXISTS phrase_6 TEXT,
ADD COLUMN IF NOT EXISTS phrase_7 TEXT,
ADD COLUMN IF NOT EXISTS phrase_8 TEXT,
ADD COLUMN IF NOT EXISTS phrase_9 TEXT,
ADD COLUMN IF NOT EXISTS phrase_10 TEXT;

-- Add full_context column for automatic context generation
ALTER TABLE public.price_items 
ADD COLUMN IF NOT EXISTS full_context TEXT;

-- Add version column
ALTER TABLE public.price_items 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;

-- Rename column if it exists
DO $$ 
BEGIN 
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='price_items' AND column_name='sub_category') THEN
        ALTER TABLE public.price_items RENAME COLUMN sub_category TO subcategory;
    END IF;
END $$;

-- Create function to automatically generate full_context
CREATE OR REPLACE FUNCTION public.generate_full_context()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_context := 'Description: ' || COALESCE(NEW.description, '') || 
                       ' | Keywords: ' || 
                       COALESCE(NEW.keyword_0, '') || ', ' ||
                       COALESCE(NEW.keyword_1, '') || ', ' ||
                       COALESCE(NEW.keyword_2, '') || ', ' ||
                       COALESCE(NEW.keyword_3, '') || ', ' ||
                       COALESCE(NEW.keyword_4, '') || ', ' ||
                       COALESCE(NEW.keyword_5, '') || ', ' ||
                       COALESCE(NEW.keyword_6, '') || ', ' ||
                       COALESCE(NEW.keyword_7, '') || ', ' ||
                       COALESCE(NEW.keyword_8, '') || ', ' ||
                       COALESCE(NEW.keyword_9, '') || ', ' ||
                       COALESCE(NEW.keyword_10, '') || ', ' ||
                       COALESCE(NEW.keyword_11, '') || ', ' ||
                       COALESCE(NEW.keyword_12, '') || ', ' ||
                       COALESCE(NEW.keyword_13, '') || ', ' ||
                       COALESCE(NEW.keyword_14, '') || ', ' ||
                       COALESCE(NEW.keyword_15, '') || ', ' ||
                       COALESCE(NEW.keyword_16, '') || ', ' ||
                       COALESCE(NEW.keyword_17, '') || ', ' ||
                       COALESCE(NEW.keyword_18, '') || ', ' ||
                       COALESCE(NEW.keyword_19, '') || ', ' ||
                       COALESCE(NEW.keyword_20, '') || ', ' ||
                       COALESCE(NEW.keyword_21, '') || ', ' ||
                       COALESCE(NEW.keyword_22, '') || 
                       ' | Phrases: ' ||
                       COALESCE(NEW.phrase_0, '') || ', ' ||
                       COALESCE(NEW.phrase_1, '') || ', ' ||
                       COALESCE(NEW.phrase_2, '') || ', ' ||
                       COALESCE(NEW.phrase_3, '') || ', ' ||
                       COALESCE(NEW.phrase_4, '') || ', ' ||
                       COALESCE(NEW.phrase_5, '') || ', ' ||
                       COALESCE(NEW.phrase_6, '') || ', ' ||
                       COALESCE(NEW.phrase_7, '') || ', ' ||
                       COALESCE(NEW.phrase_8, '') || ', ' ||
                       COALESCE(NEW.phrase_9, '') || ', ' ||
                       COALESCE(NEW.phrase_10, '') ||
                       ' | Category: ' || COALESCE(NEW.category, '') ||
                       ' | SubCategory: ' || COALESCE(NEW.subcategory, '') ||
                       ' | Unit: ' || COALESCE(NEW.unit, '') ||
                       ' | Rate: ' || COALESCE(NEW.rate::text, '') ||
                       ' | Ref: ' || COALESCE(NEW.ref, '') ||
                       ' | CreatedAt: ' || NEW.created_at ||
                       ' | UpdatedAt: ' || NEW.updated_at ||
                       ' | _id: ' || NEW.id ||
                       ' | __v: ' || NEW.version;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate full_context on insert/update
CREATE TRIGGER trigger_generate_full_context
    BEFORE INSERT OR UPDATE ON public.price_items
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_full_context();

-- Add RLS policies for price_items if not exists
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

-- Create policies for price_items
DROP POLICY IF EXISTS "Users can view their own price items" ON public.price_items;
CREATE POLICY "Users can view their own price items" 
  ON public.price_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own price items" ON public.price_items;
CREATE POLICY "Users can create their own price items" 
  ON public.price_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own price items" ON public.price_items;
CREATE POLICY "Users can update their own price items" 
  ON public.price_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own price items" ON public.price_items;
CREATE POLICY "Users can delete their own price items" 
  ON public.price_items 
  FOR DELETE 
  USING (auth.uid() = user_id);
