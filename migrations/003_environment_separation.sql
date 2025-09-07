-- Add environment column to projects table for dev/prod separation
-- This migration adds environment filtering to prevent cross-environment data sharing

-- Add environment column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';

-- Create index for environment filtering
CREATE INDEX IF NOT EXISTS idx_projects_environment ON projects(environment);

-- Create index for combined user_id and environment filtering
CREATE INDEX IF NOT EXISTS idx_projects_user_environment ON projects(user_id, environment);

-- Update existing projects to have environment based on their creation context
-- Note: This is a best-effort assignment since we can't determine the original environment
UPDATE projects 
SET environment = 'production' 
WHERE environment IS NULL;

-- Add constraint to ensure environment is not null
ALTER TABLE projects ALTER COLUMN environment SET NOT NULL;

-- Add check constraint to ensure valid environment values
ALTER TABLE projects ADD CONSTRAINT IF NOT EXISTS check_environment 
CHECK (environment IN ('development', 'production', 'staging'));

-- Update RLS policies to include environment filtering
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create new policies with environment filtering
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

-- Add comment explaining the environment column
COMMENT ON COLUMN projects.environment IS 'Environment identifier (development, production, staging) to separate data between environments';

-- Log the migration completion
DO $$
BEGIN
  RAISE NOTICE 'Environment separation migration completed successfully';
  RAISE NOTICE 'Projects are now filtered by environment to prevent cross-environment data sharing';
END $$;
