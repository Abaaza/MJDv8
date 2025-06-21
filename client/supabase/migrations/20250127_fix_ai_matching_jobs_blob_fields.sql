-- Fix ai_matching_jobs table to add missing blob storage fields
-- The previous migration was applied to the wrong table name

-- Add blob storage fields to ai_matching_jobs table
ALTER TABLE public.ai_matching_jobs
ADD COLUMN IF NOT EXISTS input_file_blob_key TEXT,
ADD COLUMN IF NOT EXISTS input_file_blob_url TEXT,
ADD COLUMN IF NOT EXISTS output_file_blob_key TEXT,
ADD COLUMN IF NOT EXISTS output_file_blob_url TEXT;

-- Create indexes for the new blob fields
CREATE INDEX IF NOT EXISTS idx_ai_matching_jobs_input_blob_key ON public.ai_matching_jobs(input_file_blob_key);
CREATE INDEX IF NOT EXISTS idx_ai_matching_jobs_output_blob_key ON public.ai_matching_jobs(output_file_blob_key);

-- Update comments for documentation
COMMENT ON COLUMN public.ai_matching_jobs.input_file_blob_key IS 'Vercel Blob key for the input Excel file';
COMMENT ON COLUMN public.ai_matching_jobs.input_file_blob_url IS 'Vercel Blob URL for the input Excel file';
COMMENT ON COLUMN public.ai_matching_jobs.output_file_blob_key IS 'Vercel Blob key for the output Excel file with matched prices';
COMMENT ON COLUMN public.ai_matching_jobs.output_file_blob_url IS 'Vercel Blob URL for the output Excel file with matched prices'; 