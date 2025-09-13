-- Test script to verify RLS policies and data access
-- Run this after applying the RLS fix migration

-- 1. Check if tables exist and have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'project_memberships', 'test_runs', 'test_plans', 'test_suites', 'test_cases', 'artifacts')
ORDER BY tablename;

-- 2. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check functions and their search_path
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as security_definer,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_updated_at_column', 'get_user_project_role', 'has_project_role', 'handle_new_user')
ORDER BY p.proname;

-- 4. Test data access (run as authenticated user)
-- This should work if RLS policies are correct
SELECT COUNT(*) as project_count FROM public.projects;
SELECT COUNT(*) as test_runs_count FROM public.test_runs;
SELECT COUNT(*) as profiles_count FROM public.profiles;

-- 5. Check views
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('project_members_view', 'test_runs_with_project')
ORDER BY viewname;

-- 6. Verify auth.users access (should be restricted)
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- 7. Test project membership functions
SELECT public.get_user_project_role(auth.uid(), (SELECT id FROM public.projects LIMIT 1));
SELECT public.has_project_role(auth.uid(), (SELECT id FROM public.projects LIMIT 1), 'viewer');
