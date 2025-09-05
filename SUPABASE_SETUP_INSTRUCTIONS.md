# 🚀 **SUPABASE SETUP INSTRUCTIONS**

## **Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Sign in with your account
3. Select your project: `szzycvciwdxbmeyggdwh`

## **Step 2: Run SQL Setup Script**
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the following SQL script:

```sql
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
```

4. Click **"Run"** to execute the script

## **Step 3: Verify Setup**
1. Go to **"Table Editor"** in the left sidebar
2. You should see the `test_runs` table
3. Click on it to see the sample data

## **Step 4: Test the Integration**
After running the SQL script, test runs will automatically be saved to Supabase!

---

## **🔧 Performance Test Strategy Clarification**

**Current Setup:**
- **Performance tests use "inbuilt" tool** - This runs simulated load/stress tests on the server
- **K6 integration is available** but requires external K6 installation
- **Both approaches work** - inbuilt is simpler, K6 is more powerful

**Recommendation:** Keep using "inbuilt" for now as it's working and doesn't require external dependencies.

---

## **✅ What's Fixed:**

1. **✅ Performance Tests** - Now handle "load" and "stress" step types
2. **✅ Functional Tests** - Improved selectors with multiple fallbacks  
3. **✅ Sample Tests** - Now appear after tool selection for better UX
4. **✅ Test Saving** - Will work once Supabase table is created
5. **✅ Error Handling** - Better error messages and fallbacks

**Run the Supabase SQL script and everything will work perfectly!** 🚀
