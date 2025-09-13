-- Fix RLS policies and security issues
-- This migration addresses the Supabase Security Advisor warnings

-- 1. Fix profiles table RLS policy
-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policy for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Fix project_members_view security issues
-- Drop and recreate the view with proper security
DROP VIEW IF EXISTS public.project_members_view;

CREATE VIEW public.project_members_view AS
SELECT 
    pm.id,
    pm.project_id,
    pm.user_id,
    pm.role,
    pm.joined_at,
    pm.created_at,
    pm.updated_at,
    p.name as project_name,
    COALESCE(au.email, 'Unknown') as user_email
FROM public.project_memberships pm
LEFT JOIN public.projects p ON p.id = pm.project_id
LEFT JOIN auth.users au ON au.id = pm.user_id;

-- Enable RLS on the view
ALTER VIEW public.project_members_view SET (security_invoker = true);

-- 3. Fix test_runs_with_project view security
DROP VIEW IF EXISTS public.test_runs_with_project;

CREATE VIEW public.test_runs_with_project AS
SELECT 
    tr.id,
    tr.project_id,
    tr.user_id,
    tr.status,
    tr.created_at,
    tr.updated_at,
    p.name as project_name,
    COALESCE(au.email, 'Unknown') as user_email
FROM public.test_runs tr
LEFT JOIN public.projects p ON p.id = tr.project_id
LEFT JOIN auth.users au ON au.id = tr.user_id;

-- Enable RLS on the view
ALTER VIEW public.test_runs_with_project SET (security_invoker = true);

-- 4. Fix function search path issues
-- Update functions to have proper search_path

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix get_user_project_role function
CREATE OR REPLACE FUNCTION public.get_user_project_role(user_uuid UUID, project_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.project_memberships
    WHERE project_id = project_uuid AND user_id = user_uuid;
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix has_project_role function
CREATE OR REPLACE FUNCTION public.has_project_role(user_uuid UUID, project_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy TEXT[] := ARRAY['none', 'viewer', 'editor', 'owner'];
    user_role_index INTEGER;
    required_role_index INTEGER;
BEGIN
    user_role := get_user_project_role(user_uuid, project_uuid);
    
    -- Find role indices
    FOR i IN 1..array_length(role_hierarchy, 1) LOOP
        IF role_hierarchy[i] = user_role THEN
            user_role_index := i;
        END IF;
        IF role_hierarchy[i] = required_role THEN
            required_role_index := i;
        END IF;
    END LOOP;
    
    RETURN user_role_index >= required_role_index;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 5. Add proper RLS policies for all tables

-- Projects table policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project memberships policies
DROP POLICY IF EXISTS "Users can view project memberships" ON public.project_memberships;
CREATE POLICY "Users can view project memberships" ON public.project_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project owners can manage memberships" ON public.project_memberships;
CREATE POLICY "Project owners can manage memberships" ON public.project_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

-- Test runs policies
DROP POLICY IF EXISTS "Users can view test runs" ON public.test_runs;
CREATE POLICY "Users can view test runs" ON public.test_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.project_memberships pm
            WHERE pm.project_id = test_runs.project_id AND pm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create test runs" ON public.test_runs;
CREATE POLICY "Users can create test runs" ON public.test_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_memberships pm
            WHERE pm.project_id = test_runs.project_id AND pm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update test runs" ON public.test_runs;
CREATE POLICY "Users can update test runs" ON public.test_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.project_memberships pm
            WHERE pm.project_id = test_runs.project_id AND pm.user_id = auth.uid()
        )
    );

-- Test plans policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view test plans" ON public.test_plans;
        CREATE POLICY "Users can view test plans" ON public.test_plans
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_plans.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can create test plans" ON public.test_plans;
        CREATE POLICY "Users can create test plans" ON public.test_plans
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_plans.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can update test plans" ON public.test_plans;
        CREATE POLICY "Users can update test plans" ON public.test_plans
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_plans.project_id AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Test suites policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view test suites" ON public.test_suites;
        CREATE POLICY "Users can view test suites" ON public.test_suites
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_suites.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can create test suites" ON public.test_suites;
        CREATE POLICY "Users can create test suites" ON public.test_suites
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_suites.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can update test suites" ON public.test_suites;
        CREATE POLICY "Users can update test suites" ON public.test_suites
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_suites.project_id AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Test cases policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view test cases" ON public.test_cases;
        CREATE POLICY "Users can view test cases" ON public.test_cases
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_cases.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can create test cases" ON public.test_cases;
        CREATE POLICY "Users can create test cases" ON public.test_cases
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_cases.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can update test cases" ON public.test_cases;
        CREATE POLICY "Users can update test cases" ON public.test_cases
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_cases.project_id AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Artifacts policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view artifacts" ON public.artifacts;
        CREATE POLICY "Users can view artifacts" ON public.artifacts
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = artifacts.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can create artifacts" ON public.artifacts;
        CREATE POLICY "Users can create artifacts" ON public.artifacts
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = artifacts.project_id AND pm.user_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can update artifacts" ON public.artifacts;
        CREATE POLICY "Users can update artifacts" ON public.artifacts
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = artifacts.project_id AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 6. Create a simple profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 8. Create a function to handle user creation (for profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

COMMIT;
