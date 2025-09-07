-- Complete Database Fix - Resolve All Issues
-- This script fixes the 400 errors and infinite recursion
-- Run this in your Supabase SQL Editor

-- ===== STEP 1: DROP ALL PROBLEMATIC POLICIES =====

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects in same environment" ON projects;

DROP POLICY IF EXISTS "Users can view memberships for their projects" ON project_memberships;
DROP POLICY IF EXISTS "Project owners can manage memberships" ON project_memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON project_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON project_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON project_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON project_memberships;

DROP POLICY IF EXISTS "Users can view test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can insert test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can update test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can delete test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can view their own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can insert their own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can update their own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can delete their own test runs" ON test_runs;

-- ===== STEP 2: ENSURE TABLES EXIST WITH CORRECT SCHEMA =====

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  environment TEXT DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'environment') THEN
    ALTER TABLE projects ADD COLUMN environment TEXT DEFAULT 'production';
  END IF;
END $$;

-- Create project_memberships table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create test_runs table if it doesn't exist
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
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add project_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'test_runs' AND column_name = 'project_id') THEN
    ALTER TABLE test_runs ADD COLUMN project_id UUID;
  END IF;
END $$;

-- ===== STEP 3: CREATE SIMPLE, SAFE RLS POLICIES =====

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

-- Simple projects policies
CREATE POLICY "projects_select_policy" ON projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "projects_insert_policy" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "projects_update_policy" ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "projects_delete_policy" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- Simple project_memberships policies
CREATE POLICY "project_memberships_select_policy" ON project_memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "project_memberships_insert_policy" ON project_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "project_memberships_update_policy" ON project_memberships
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "project_memberships_delete_policy" ON project_memberships
  FOR DELETE USING (user_id = auth.uid());

-- Simple test_runs policies
CREATE POLICY "test_runs_select_policy" ON test_runs
  FOR SELECT USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "test_runs_insert_policy" ON test_runs
  FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "test_runs_update_policy" ON test_runs
  FOR UPDATE USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "test_runs_delete_policy" ON test_runs
  FOR DELETE USING (user_id = auth.uid()::text OR user_id = 'anonymous');

-- ===== STEP 4: CREATE INDEXES =====

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_environment ON projects(environment);

-- Project memberships indexes
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_user_id ON project_memberships(user_id);

-- Test runs indexes
CREATE INDEX IF NOT EXISTS idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_project_id ON test_runs(project_id);

-- ===== STEP 5: INSERT DEFAULT PROJECT MEMBERSHIPS =====

-- Create memberships for existing projects
INSERT INTO project_memberships (project_id, user_id, role)
SELECT 
  p.id as project_id,
  p.user_id,
  'owner' as role
FROM projects p
WHERE p.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM project_memberships pm 
  WHERE pm.project_id = p.id AND pm.user_id = p.user_id
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ===== STEP 6: INSERT SAMPLE DATA =====

-- Insert sample test runs
INSERT INTO test_runs (id, user_id, test_suite_name, test_type, tool_id, status, total_steps, passed_steps, failed_steps, total_time, results) VALUES
('sample_1', 'anonymous', 'Sample API Test', 'API', 'axios', 'completed', 3, 3, 0, 1250, '{"success": true, "totalSteps": 3, "passedSteps": 3, "failedSteps": 0, "totalTime": 1250}'),
('sample_2', 'anonymous', 'Sample Functional Test', 'Functional', 'puppeteer', 'failed', 2, 1, 1, 8500, '{"success": false, "totalSteps": 2, "passedSteps": 1, "failedSteps": 1, "totalTime": 8500}'),
('sample_3', 'anonymous', 'Sample Performance Test', 'Performance', 'k6', 'completed', 1, 1, 0, 30000, '{"success": true, "totalSteps": 1, "passedSteps": 1, "failedSteps": 0, "totalTime": 30000}')
ON CONFLICT (id) DO NOTHING;

-- ===== STEP 7: CREATE HELPER FUNCTIONS =====

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_memberships_updated_at ON project_memberships;
CREATE TRIGGER update_project_memberships_updated_at 
  BEFORE UPDATE ON project_memberships 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_runs_updated_at ON test_runs;
CREATE TRIGGER update_test_runs_updated_at 
  BEFORE UPDATE ON test_runs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===== MIGRATION COMPLETE =====
-- All issues should now be resolved:
-- 1. 400 Bad Request errors fixed
-- 2. Infinite recursion eliminated
-- 3. Simple, safe RLS policies
-- 4. Proper table structure
