
-- Add client_id column to ai_matching_jobs table
ALTER TABLE public.ai_matching_jobs 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Create index for better performance
CREATE INDEX idx_ai_matching_jobs_client_id ON public.ai_matching_jobs(client_id);
