
-- Create table for storing AI matching jobs
CREATE TABLE public.ai_matching_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_items INTEGER DEFAULT 0,
  matched_items INTEGER DEFAULT 0,
  confidence_score NUMERIC,
  error_message TEXT,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing individual match results
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.ai_matching_jobs(id) ON DELETE CASCADE NOT NULL,
  sheet_name TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  original_description TEXT NOT NULL,
  preprocessed_description TEXT NOT NULL,
  matched_price_item_id UUID REFERENCES public.price_items(id),
  matched_description TEXT,
  matched_rate NUMERIC,
  similarity_score NUMERIC,
  jaccard_score NUMERIC,
  combined_score NUMERIC,
  quantity NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for ai_matching_jobs
ALTER TABLE public.ai_matching_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matching jobs" 
  ON public.ai_matching_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matching jobs" 
  ON public.ai_matching_jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matching jobs" 
  ON public.ai_matching_jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matching jobs" 
  ON public.ai_matching_jobs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for match_results
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own match results" 
  ON public.match_results 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.ai_matching_jobs 
    WHERE id = job_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own match results" 
  ON public.match_results 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_matching_jobs 
    WHERE id = job_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own match results" 
  ON public.match_results 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.ai_matching_jobs 
    WHERE id = job_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own match results" 
  ON public.match_results 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.ai_matching_jobs 
    WHERE id = job_id AND user_id = auth.uid()
  ));

-- Add trigger for updating timestamps
CREATE TRIGGER trigger_ai_matching_jobs_updated_at
  BEFORE UPDATE ON public.ai_matching_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
