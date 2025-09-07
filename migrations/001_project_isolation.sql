-- Project Isolation Migration Script
-- This script adds project_id columns and constraints to all test management tables
-- Run this in your Supabase SQL editor

-- ===== STEP 1: CREATE PROJECT MEMBERSHIP TABLE =====
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

-- Create indexes for project memberships
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_user_id ON project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_role ON project_memberships(role);

-- Enable RLS for project memberships
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for project memberships
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

-- ===== STEP 2: ADD PROJECT_ID COLUMNS TO EXISTING TABLES =====

-- Add project_id to test_runs table
ALTER TABLE test_runs 
ADD COLUMN IF NOT EXISTS project_id UUID;

-- Add project_id to test_plans table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans') THEN
    ALTER TABLE test_plans ADD COLUMN IF NOT EXISTS project_id UUID;
  END IF;
END $$;

-- Add project_id to test_suites table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites') THEN
    ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS project_id UUID;
  END IF;
END $$;

-- Add project_id to test_cases table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases') THEN
    ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS project_id UUID;
  END IF;
END $$;

-- Add project_id to artifacts table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts') THEN
    ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS project_id UUID;
  END IF;
END $$;

-- ===== STEP 3: CREATE INDEXES FOR PROJECT_ID COLUMNS =====

-- Indexes for test_runs
CREATE INDEX IF NOT EXISTS idx_test_runs_project_id ON test_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_project_user ON test_runs(project_id, user_id);

-- Indexes for other tables (if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans') THEN
    CREATE INDEX IF NOT EXISTS idx_test_plans_project_id ON test_plans(project_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites') THEN
    CREATE INDEX IF NOT EXISTS idx_test_suites_project_id ON test_suites(project_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases') THEN
    CREATE INDEX IF NOT EXISTS idx_test_cases_project_id ON test_cases(project_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts') THEN
    CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON artifacts(project_id);
  END IF;
END $$;

-- ===== STEP 4: CREATE FOREIGN KEY CONSTRAINTS =====

-- Add FK constraint for test_runs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_test_runs_project_id' 
    AND table_name = 'test_runs'
  ) THEN
    ALTER TABLE test_runs 
    ADD CONSTRAINT fk_test_runs_project_id 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK constraints for other tables (if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_test_plans_project_id' 
      AND table_name = 'test_plans'
    ) THEN
      ALTER TABLE test_plans 
      ADD CONSTRAINT fk_test_plans_project_id 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_test_suites_project_id' 
      AND table_name = 'test_suites'
    ) THEN
      ALTER TABLE test_suites 
      ADD CONSTRAINT fk_test_suites_project_id 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_test_cases_project_id' 
      AND table_name = 'test_cases'
    ) THEN
      ALTER TABLE test_cases 
      ADD CONSTRAINT fk_test_cases_project_id 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_artifacts_project_id' 
      AND table_name = 'artifacts'
    ) THEN
      ALTER TABLE artifacts 
      ADD CONSTRAINT fk_artifacts_project_id 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- ===== STEP 5: UPDATE RLS POLICIES FOR PROJECT ISOLATION =====

-- Drop existing policies for test_runs
DROP POLICY IF EXISTS "Users can view their own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can insert their own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can update their own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can delete their own test runs" ON test_runs;

-- Create new project-aware policies for test_runs
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

-- ===== STEP 6: CREATE HELPER FUNCTIONS =====

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

-- ===== STEP 7: CREATE TRIGGERS FOR UPDATED_AT =====

-- Trigger for project_memberships
CREATE TRIGGER update_project_memberships_updated_at 
  BEFORE UPDATE ON project_memberships 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===== STEP 8: INSERT DEFAULT PROJECT MEMBERSHIPS =====

-- Create memberships for existing projects
-- Only create memberships for projects that have valid user_id values
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

-- ===== STEP 9: CREATE VIEWS FOR EASIER QUERYING =====

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

-- ===== STEP 10: COMMENTS AND DOCUMENTATION =====

COMMENT ON TABLE project_memberships IS 'Manages user membership and roles within projects';
COMMENT ON COLUMN project_memberships.role IS 'User role: owner, admin, editor, or viewer';
COMMENT ON FUNCTION get_user_project_role IS 'Returns the role of a user in a specific project';
COMMENT ON FUNCTION has_project_role IS 'Checks if user has minimum required role in project';

-- ===== MIGRATION COMPLETE =====
-- Next steps:
-- 1. Run the backfill script to assign project_id to existing records
-- 2. Update API routes to require project_id
-- 3. Update frontend to use project-scoped routes
-- 4. Test project isolation thoroughly
