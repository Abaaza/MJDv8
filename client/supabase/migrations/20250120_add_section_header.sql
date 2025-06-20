-- Add section_header column to match_results table
ALTER TABLE public.match_results 
ADD COLUMN IF NOT EXISTS section_header TEXT;

-- Add index on section_header for performance
CREATE INDEX IF NOT EXISTS idx_match_results_section_header 
ON public.match_results(section_header) 
WHERE section_header IS NOT NULL;

-- Add index on job_id and row_number for sorting
CREATE INDEX IF NOT EXISTS idx_match_results_job_row 
ON public.match_results(job_id, row_number); 