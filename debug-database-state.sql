-- Database State Check Script
-- Run this first to see what's in your database

-- Check if test_runs table exists and what columns it has
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'test_runs'
ORDER BY ordinal_position;

-- Check if projects table exists
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Check if project_memberships table exists
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'project_memberships'
ORDER BY ordinal_position;
