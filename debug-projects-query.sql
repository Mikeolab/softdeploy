-- Debug Projects Query - Check what's causing the 400 error
-- Run this in Supabase SQL Editor to diagnose the issue

-- Check if projects table exists and its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'projects';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects';

-- Test the exact query that's failing
-- This simulates what the frontend is trying to do
SELECT id, name, environment, created_at
FROM projects 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Check if auth.uid() is working
SELECT auth.uid() as current_user_id;

-- Check if there are any projects at all
SELECT COUNT(*) as total_projects FROM projects;

-- Check projects for current user specifically
SELECT COUNT(*) as user_projects 
FROM projects 
WHERE user_id = auth.uid();
