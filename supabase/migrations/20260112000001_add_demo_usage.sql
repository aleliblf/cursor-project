-- Add demo_usage column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_usage INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN users.demo_usage IS 'Number of demo API requests used (max 5)';
