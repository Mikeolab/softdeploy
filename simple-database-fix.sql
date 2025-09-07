-- URGENT: Simple Database Fix for 400 Errors
-- Run this in Supabase SQL Editor RIGHT NOW

-- Drop all existing policies
DROP POLICY IF EXISTS "projects_basic_policy" ON projects;
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- Add missing columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create ONE simple policy
CREATE POLICY "projects_simple_policy" ON projects
  FOR ALL USING (user_id = auth.uid());

-- Insert test project
INSERT INTO projects (name, description, user_id, environment)
VALUES ('Test Project', 'Test project for debugging', auth.uid(), 'production')
ON CONFLICT DO NOTHING;

-- Test the query
SELECT id, name, environment, created_at FROM projects WHERE user_id = auth.uid();
