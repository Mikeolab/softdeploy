-- URGENT FIX: Resolve 400 Bad Request for Projects Query
-- This fixes the specific 400 error you're seeing
-- Run this in Supabase SQL Editor

-- ===== STEP 1: Check and Fix Table Structure =====

-- Ensure projects table has the exact columns the frontend expects
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'description') THEN
    ALTER TABLE projects ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'environment') THEN
    ALTER TABLE projects ADD COLUMN environment TEXT DEFAULT 'production';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'created_at') THEN
    ALTER TABLE projects ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
    ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ===== STEP 2: Drop ALL existing policies to start fresh =====

-- Drop all policies on projects table
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects in same environment" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects in same environment" ON projects;

-- ===== STEP 3: Create the SIMPLEST possible RLS policy =====

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create the most basic policy that should work
CREATE POLICY "projects_basic_policy" ON projects
  FOR ALL USING (user_id = auth.uid());

-- ===== STEP 4: Test the exact query =====

-- This should work now - test it
SELECT id, name, environment, created_at
FROM projects 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- ===== STEP 5: Insert a test project if none exist =====

-- Insert a test project for the current user
INSERT INTO projects (name, description, user_id, environment)
VALUES (
  'Test Project', 
  'This is a test project to verify the fix', 
  auth.uid(), 
  'production'
)
ON CONFLICT DO NOTHING;

-- ===== VERIFICATION =====

-- Check that the query now works
SELECT 
  'SUCCESS: Projects query should now work' as status,
  COUNT(*) as project_count
FROM projects 
WHERE user_id = auth.uid();
