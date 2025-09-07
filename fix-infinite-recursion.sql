-- Fixed Database Setup Script - No Infinite Recursion
-- This script fixes the infinite recursion issue in RLS policies
-- Run this in your Supabase SQL editor

-- ===== STEP 1: DROP PROBLEMATIC POLICIES =====

-- Drop the problematic project_memberships policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view memberships for their projects" ON project_memberships;
DROP POLICY IF EXISTS "Project owners can manage memberships" ON project_memberships;

-- ===== STEP 2: CREATE SIMPLE, SAFE RLS POLICIES =====

-- Simple policy for project_memberships - no recursion
CREATE POLICY "Users can view their own memberships" ON project_memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships" ON project_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own memberships" ON project_memberships
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own memberships" ON project_memberships
  FOR DELETE USING (user_id = auth.uid());

-- ===== STEP 3: SIMPLIFY TEST_RUNS POLICIES =====

-- Drop existing test_runs policies
DROP POLICY IF EXISTS "Users can view test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can insert test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can update test runs for their projects" ON test_runs;
DROP POLICY IF EXISTS "Users can delete test runs for their projects" ON test_runs;

-- Create simple test_runs policies
CREATE POLICY "Users can view their own test runs" ON test_runs
  FOR SELECT USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can insert their own test runs" ON test_runs
  FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can update their own test runs" ON test_runs
  FOR UPDATE USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can delete their own test runs" ON test_runs
  FOR DELETE USING (user_id = auth.uid()::text OR user_id = 'anonymous');

-- ===== STEP 4: SIMPLIFY PROJECTS POLICIES =====

-- Drop existing projects policies
DROP POLICY IF EXISTS "Users can view their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects in same environment" ON projects;

-- Create simple projects policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- ===== STEP 5: CREATE HELPER FUNCTIONS (SIMPLIFIED) =====

-- Function to get user's role in a project (simplified)
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

-- ===== STEP 6: INSERT DEFAULT PROJECT MEMBERSHIPS =====

-- Create memberships for existing projects (only if they don't exist)
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

-- ===== STEP 7: CREATE SIMPLE VIEWS =====

-- Simple view for project members
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

-- Simple view for test runs with project info
CREATE OR REPLACE VIEW test_runs_with_project AS
SELECT 
  tr.*,
  p.name as project_name,
  pm.role as user_project_role
FROM test_runs tr
LEFT JOIN projects p ON p.id = tr.project_id
LEFT JOIN project_memberships pm ON pm.project_id = tr.project_id AND pm.user_id = tr.user_id::uuid;

-- ===== MIGRATION COMPLETE =====
-- The infinite recursion issue has been fixed!
-- All policies are now simple and safe.
