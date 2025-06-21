-- Rename S3 storage fields to blob storage fields
ALTER TABLE matching_jobs
RENAME COLUMN input_file_s3_key TO input_file_blob_key;

ALTER TABLE matching_jobs
RENAME COLUMN input_file_s3_url TO input_file_blob_url;

ALTER TABLE matching_jobs
RENAME COLUMN output_file_s3_key TO output_file_blob_key;

ALTER TABLE matching_jobs
RENAME COLUMN output_file_s3_url TO output_file_blob_url;

-- Drop old indexes
DROP INDEX IF EXISTS idx_matching_jobs_input_s3_key;
DROP INDEX IF EXISTS idx_matching_jobs_output_s3_key;

-- Create new indexes with updated names
CREATE INDEX IF NOT EXISTS idx_matching_jobs_input_blob_key ON matching_jobs(input_file_blob_key);
CREATE INDEX IF NOT EXISTS idx_matching_jobs_output_blob_key ON matching_jobs(output_file_blob_key);

-- Update comments for documentation
COMMENT ON COLUMN matching_jobs.input_file_blob_key IS 'Vercel Blob key for the input Excel file';
COMMENT ON COLUMN matching_jobs.input_file_blob_url IS 'Vercel Blob URL for the input Excel file';
COMMENT ON COLUMN matching_jobs.output_file_blob_key IS 'Vercel Blob key for the output Excel file with matched prices';
COMMENT ON COLUMN matching_jobs.output_file_blob_url IS 'Vercel Blob URL for the output Excel file with matched prices'; 