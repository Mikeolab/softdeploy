-- Supabase SQL for test_runs table
-- Run this in your Supabase SQL editor

-- Create test_runs table
CREATE TABLE IF NOT EXISTS test_runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  test_suite_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  total_steps INTEGER DEFAULT 0,
  passed_steps INTEGER DEFAULT 0,
  failed_steps INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_test_type ON test_runs(test_type);

-- Enable Row Level Security (RLS)
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow users to see their own test runs
CREATE POLICY "Users can view their own test runs" ON test_runs
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'anonymous');

-- Allow users to insert their own test runs
CREATE POLICY "Users can insert their own test runs" ON test_runs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'anonymous');

-- Allow users to update their own test runs
CREATE POLICY "Users can update their own test runs" ON test_runs
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'anonymous');

-- Allow users to delete their own test runs
CREATE POLICY "Users can delete their own test runs" ON test_runs
  FOR DELETE USING (auth.uid()::text = user_id OR user_id = 'anonymous');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_test_runs_updated_at 
  BEFORE UPDATE ON test_runs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO test_runs (id, user_id, test_suite_name, test_type, tool_id, status, total_steps, passed_steps, failed_steps, total_time, results) VALUES
('sample_1', 'anonymous', 'Sample API Test', 'API', 'axios', 'completed', 3, 3, 0, 1250, '{"success": true, "totalSteps": 3, "passedSteps": 3, "failedSteps": 0, "totalTime": 1250}'),
('sample_2', 'anonymous', 'Sample Functional Test', 'Functional', 'puppeteer', 'failed', 2, 1, 1, 8500, '{"success": false, "totalSteps": 2, "passedSteps": 1, "failedSteps": 1, "totalTime": 8500}'),
('sample_3', 'anonymous', 'Sample Performance Test', 'Performance', 'k6', 'completed', 1, 1, 0, 30000, '{"success": true, "totalSteps": 1, "passedSteps": 1, "failedSteps": 0, "totalTime": 30000}')
ON CONFLICT (id) DO NOTHING;
