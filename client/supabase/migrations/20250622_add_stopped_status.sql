-- Add 'stopped' status to the ai_matching_jobs status check constraint
ALTER TABLE public.ai_matching_jobs 
DROP CONSTRAINT ai_matching_jobs_status_check;

ALTER TABLE public.ai_matching_jobs 
ADD CONSTRAINT ai_matching_jobs_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'stopped')); 