-- Add output_file_path column to ai_matching_jobs table
ALTER TABLE ai_matching_jobs 
ADD COLUMN IF NOT EXISTS output_file_path TEXT;

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_matching_jobs_output_file_path 
ON ai_matching_jobs(output_file_path) 
WHERE output_file_path IS NOT NULL; 