-- Add match_mode column to match_results table to track matching method
ALTER TABLE public.match_results 
ADD COLUMN IF NOT EXISTS match_mode TEXT DEFAULT 'ai' CHECK (match_mode IN ('ai', 'local', 'manual'));

-- Add index on match_mode for performance when filtering by type
CREATE INDEX IF NOT EXISTS idx_match_results_match_mode 
ON public.match_results(match_mode);

-- Update existing records to have 'ai' as default match_mode
UPDATE public.match_results 
SET match_mode = 'ai' 
WHERE match_mode IS NULL; 