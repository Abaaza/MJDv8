-- Add S3 storage fields to matching_jobs table
ALTER TABLE matching_jobs
ADD COLUMN IF NOT EXISTS input_file_s3_key VARCHAR(500),
ADD COLUMN IF NOT EXISTS input_file_s3_url TEXT,
ADD COLUMN IF NOT EXISTS output_file_s3_key VARCHAR(500),
ADD COLUMN IF NOT EXISTS output_file_s3_url TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matching_jobs_input_s3_key ON matching_jobs(input_file_s3_key);
CREATE INDEX IF NOT EXISTS idx_matching_jobs_output_s3_key ON matching_jobs(output_file_s3_key);

-- Add comments for documentation
COMMENT ON COLUMN matching_jobs.input_file_s3_key IS 'S3 object key for the input Excel file';
COMMENT ON COLUMN matching_jobs.input_file_s3_url IS 'S3 URL for the input Excel file';
COMMENT ON COLUMN matching_jobs.output_file_s3_key IS 'S3 object key for the output Excel file with matched prices';
COMMENT ON COLUMN matching_jobs.output_file_s3_url IS 'S3 URL for the output Excel file with matched prices'; 