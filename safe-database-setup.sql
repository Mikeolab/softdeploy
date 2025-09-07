-- Safe Database Setup Script
-- This script safely creates tables and adds missing columns
-- Run this in your Supabase SQL editor

-- ===== STEP 1: CREATE OR UPDATE PROJECTS TABLE =====

-- First, check if projects table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add environment column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'environment') THEN
    ALTER TABLE projects ADD COLUMN environment TEXT DEFAULT 'production';
    ALTER TABLE projects ADD CONSTRAINT check_environment 
      CHECK (environment IN ('development', 'production', 'staging'));
  END IF;
END $$;

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_environment ON projects(environment);
CREATE INDEX IF NOT EXISTS idx_projects_user_environment ON projects(user_id, environment);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects in same environment" ON projects;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects in same environment" ON projects
  FOR SELECT USING (
    auth.uid() = user_id AND 
    environment = COALESCE(current_setting('app.environment', true), 'production')
  );

CREATE POLICY "Users can insert their own projects in same environment" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    environment = COALESCE(current_setting('app.environment', true), 'production')
  );

CREATE POLICY "Users can update their own projects in same environment" ON projects
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    environment = COALESCE(current_setting('app.environment', true), 'production')
  );

CREATE POLICY "Users can delete their own projects in same environment" ON projects
  FOR DELETE USING (
    auth.uid() = user_id AND 
    environment = COALESCE(current_setting('app.environment', true), 'production')
  );

-- ===== STEP 2: CREATE PROJECT MEMBERSHIPS TABLE =====
CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'project_memberships_project_id_fkey' 
                 AND table_name = 'project_memberships') THEN
    ALTER TABLE project_memberships 
    ADD CONSTRAINT project_memberships_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for project memberships
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_user_id ON project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_role ON project_memberships(role);

-- Enable RLS for project memberships
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view memberships for their projects" ON project_memberships;
DROP POLICY IF EXISTS "Project owners can manage memberships" ON project_memberships;

-- Create RLS policies for project memberships
CREATE POLICY "Users can view memberships for their projects" ON project_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = project_memberships.project_id 
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage memberships" ON project_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = project_memberships.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );

-- ===== STEP 3: CREATE TEST_RUNS TABLE =====
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

-- Add project_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'test_runs' AND column_name = 'project_id') THEN
    ALTER TABLE test_runs ADD COLUMN project_id UUID;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'test_runs_project_id_fkey' 
                 AND table_name = 'test_runs') THEN
    ALTER TABLE test_runs 
    ADD CONSTRAINT test_runs_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for test_runs
CREATE INDEX IF NOT EXISTS idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_test_type ON test_runs(test_type);
CREATE INDEX IF NOT EXISTS idx_test_runs_project_id ON test_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_project_user ON test_runs(project_id, user_id);

-- Enable RLS for test_runs
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can insert test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can update test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can delete test runs for their projects" ON test_runs;

-- Create RLS policies for test_runs
CREATE POLICY "Users can view test runs for their projects" ON test_runs
  FOR SELECT USING (
    project_id IS NULL OR -- Allow legacy data without project_id
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = test_runs.project_id 
      AND pm.user_id = auth.uid()
    ) OR
    user_id = auth.uid()::text -- Fallback for legacy data
  );

CREATE POLICY "Users can insert test runs for their projects" ON test_runs
  FOR INSERT WITH CHECK (
    project_id IS NULL OR -- Allow legacy data without project_id
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = test_runs.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
    ) OR
    user_id = auth.uid()::text -- Fallback for legacy data
  );

CREATE POLICY "Users can update test runs for their projects" ON test_runs
  FOR UPDATE USING (
    project_id IS NULL OR -- Allow legacy data without project_id
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = test_runs.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
    ) OR
    user_id = auth.uid()::text -- Fallback for legacy data
  );

CREATE POLICY "Users can delete test runs for their projects" ON test_runs
  FOR DELETE USING (
    project_id IS NULL OR -- Allow legacy data without project_id
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = test_runs.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
    ) OR
    user_id = auth.uid()::text -- Fallback for legacy data
  );

-- ===== STEP 4: CREATE HELPER FUNCTIONS =====

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get user's role in a project
CREATE OR REPLACE FUNCTION get_user_project_role(project_id_param UUID, user_id_param UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM project_memberships 
    WHERE project_id = project_id_param 
    AND user_id = user_id_param
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has minimum role in project
CREATE OR REPLACE FUNCTION has_project_role(project_id_param UUID, user_id_param UUID, min_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_hierarchy TEXT[] := ARRAY['viewer', 'editor', 'admin', 'owner'];
  min_role_index INTEGER;
  user_role_index INTEGER;
BEGIN
  user_role := get_user_project_role(project_id_param, user_id_param);
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Find indices in hierarchy
  min_role_index := array_position(role_hierarchy, min_role);
  user_role_index := array_position(role_hierarchy, user_role);
  
  RETURN user_role_index >= min_role_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== STEP 5: CREATE TRIGGERS =====

-- Trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for project_memberships
DROP TRIGGER IF EXISTS update_project_memberships_updated_at ON project_memberships;
CREATE TRIGGER update_project_memberships_updated_at 
  BEFORE UPDATE ON project_memberships 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for test_runs
DROP TRIGGER IF EXISTS update_test_runs_updated_at ON test_runs;
CREATE TRIGGER update_test_runs_updated_at 
  BEFORE UPDATE ON test_runs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===== STEP 6: INSERT SAMPLE DATA =====

-- Insert sample test runs (optional)
INSERT INTO test_runs (id, user_id, test_suite_name, test_type, tool_id, status, total_steps, passed_steps, failed_steps, total_time, results) VALUES
('sample_1', 'anonymous', 'Sample API Test', 'API', 'axios', 'completed', 3, 3, 0, 1250, '{"success": true, "totalSteps": 3, "passedSteps": 3, "failedSteps": 0, "totalTime": 1250}'),
('sample_2', 'anonymous', 'Sample Functional Test', 'Functional', 'puppeteer', 'failed', 2, 1, 1, 8500, '{"success": false, "totalSteps": 2, "passedSteps": 1, "failedSteps": 1, "totalTime": 8500}'),
('sample_3', 'anonymous', 'Sample Performance Test', 'Performance', 'k6', 'completed', 1, 1, 0, 30000, '{"success": true, "totalSteps": 1, "passedSteps": 1, "failedSteps": 0, "totalTime": 30000}')
ON CONFLICT (id) DO NOTHING;

-- ===== STEP 7: CREATE VIEWS =====

-- View for project members with user details
CREATE OR REPLACE VIEW project_members_view AS
SELECT 
  pm.id,
  pm.project_id,
  pm.user_id,
  pm.role,
  pm.joined_at,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as display_name
FROM project_memberships pm
LEFT JOIN auth.users au ON au.id = pm.user_id;

-- View for test runs with project info
CREATE OR REPLACE VIEW test_runs_with_project AS
SELECT 
  tr.*,
  p.name as project_name,
  pm.role as user_project_role
FROM test_runs tr
LEFT JOIN projects p ON p.id = tr.project_id
LEFT JOIN project_memberships pm ON pm.project_id = tr.project_id AND pm.user_id = tr.user_id::uuid;

-- ===== STEP 8: COMMENTS AND DOCUMENTATION =====

COMMENT ON TABLE projects IS 'Projects table for organizing test management data';
COMMENT ON TABLE project_memberships IS 'Manages user membership and roles within projects';
COMMENT ON TABLE test_runs IS 'Stores test execution results scoped to projects';
COMMENT ON COLUMN projects.environment IS 'Environment identifier (development, production, staging) to separate data between environments';
COMMENT ON COLUMN project_memberships.role IS 'User role: owner, admin, editor, or viewer';
COMMENT ON FUNCTION get_user_project_role IS 'Returns the role of a user in a specific project';
COMMENT ON FUNCTION has_project_role IS 'Checks if user has minimum required role in project';

-- ===== MIGRATION COMPLETE =====
-- Database setup is now complete with proper project isolation!
-- Next steps:
-- 1. Test project creation and management
-- 2. Verify RLS policies are working
-- 3. Test project-scoped API endpoints
-- 4. Ensure frontend properly handles project context
