-- Fix data isolation issues - test runs showing for all users
-- This migration ensures proper user isolation for all data

-- 1. First, let's check and fix test_runs RLS policies
-- Drop existing policies and recreate them with proper user isolation
DROP POLICY IF EXISTS "Users can view test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can create test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can update test runs" ON public.test_runs;

-- Create proper RLS policies for test_runs with user isolation
CREATE POLICY "Users can view own test runs" ON public.test_runs
    FOR SELECT USING (
        user_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.project_memberships pm
            WHERE pm.project_id = test_runs.project_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create test runs" ON public.test_runs
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text AND
        EXISTS (
            SELECT 1 FROM public.project_memberships pm
            WHERE pm.project_id = test_runs.project_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own test runs" ON public.test_runs
    FOR UPDATE USING (
        user_id = auth.uid()::text AND
        EXISTS (
            SELECT 1 FROM public.project_memberships pm
            WHERE pm.project_id = test_runs.project_id 
            AND pm.user_id = auth.uid()
        )
    );

-- 2. Fix test_plans RLS policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view test plans" ON public.test_plans;
        DROP POLICY IF EXISTS "Users can create test plans" ON public.test_plans;
        DROP POLICY IF EXISTS "Users can update test plans" ON public.test_plans;

        CREATE POLICY "Users can view own test plans" ON public.test_plans
            FOR SELECT USING (
                user_id = auth.uid()::text OR
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_plans.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can create test plans" ON public.test_plans
            FOR INSERT WITH CHECK (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_plans.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update own test plans" ON public.test_plans
            FOR UPDATE USING (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_plans.project_id 
                    AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 3. Fix test_suites RLS policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view test suites" ON public.test_suites;
        DROP POLICY IF EXISTS "Users can create test suites" ON public.test_suites;
        DROP POLICY IF EXISTS "Users can update test suites" ON public.test_suites;

        CREATE POLICY "Users can view own test suites" ON public.test_suites
            FOR SELECT USING (
                user_id = auth.uid()::text OR
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_suites.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can create test suites" ON public.test_suites
            FOR INSERT WITH CHECK (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_suites.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update own test suites" ON public.test_suites
            FOR UPDATE USING (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_suites.project_id 
                    AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 4. Fix test_cases RLS policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view test cases" ON public.test_cases;
        DROP POLICY IF EXISTS "Users can create test cases" ON public.test_cases;
        DROP POLICY IF EXISTS "Users can update test cases" ON public.test_cases;

        CREATE POLICY "Users can view own test cases" ON public.test_cases
            FOR SELECT USING (
                user_id = auth.uid()::text OR
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_cases.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can create test cases" ON public.test_cases
            FOR INSERT WITH CHECK (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_cases.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update own test cases" ON public.test_cases
            FOR UPDATE USING (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = test_cases.project_id 
                    AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 5. Fix artifacts RLS policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view artifacts" ON public.artifacts;
        DROP POLICY IF EXISTS "Users can create artifacts" ON public.artifacts;
        DROP POLICY IF EXISTS "Users can update artifacts" ON public.artifacts;

        CREATE POLICY "Users can view own artifacts" ON public.artifacts
            FOR SELECT USING (
                user_id = auth.uid()::text OR
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = artifacts.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can create artifacts" ON public.artifacts
            FOR INSERT WITH CHECK (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = artifacts.project_id 
                    AND pm.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update own artifacts" ON public.artifacts
            FOR UPDATE USING (
                user_id = auth.uid()::text AND
                EXISTS (
                    SELECT 1 FROM public.project_memberships pm
                    WHERE pm.project_id = artifacts.project_id 
                    AND pm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 6. Ensure project_memberships has proper user isolation
DROP POLICY IF EXISTS "Users can view project memberships" ON public.project_memberships;
DROP POLICY IF EXISTS "Project owners can manage memberships" ON public.project_memberships;

CREATE POLICY "Users can view project memberships" ON public.project_memberships
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can manage memberships" ON public.project_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

-- 7. Create a function to clean up orphaned data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void AS $$
BEGIN
    -- Remove test runs that don't belong to any user
    DELETE FROM public.test_runs 
    WHERE user_id IS NULL OR user_id = '';
    
    -- Remove test runs that don't have valid project associations
    DELETE FROM public.test_runs 
    WHERE project_id IS NULL 
    OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_runs.project_id);
    
    -- Remove test plans that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans' AND table_schema = 'public') THEN
        DELETE FROM public.test_plans 
        WHERE user_id IS NULL OR user_id = '';
        
        DELETE FROM public.test_plans 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_plans.project_id);
    END IF;
    
    -- Remove test suites that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites' AND table_schema = 'public') THEN
        DELETE FROM public.test_suites 
        WHERE user_id IS NULL OR user_id = '';
        
        DELETE FROM public.test_suites 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_suites.project_id);
    END IF;
    
    -- Remove test cases that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases' AND table_schema = 'public') THEN
        DELETE FROM public.test_cases 
        WHERE user_id IS NULL OR user_id = '';
        
        DELETE FROM public.test_cases 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_cases.project_id);
    END IF;
    
    -- Remove artifacts that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts' AND table_schema = 'public') THEN
        DELETE FROM public.artifacts 
        WHERE user_id IS NULL OR user_id = '';
        
        DELETE FROM public.artifacts 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = artifacts.project_id);
    END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 8. Run the cleanup function
SELECT public.cleanup_orphaned_data();

-- 9. Drop the cleanup function (it's a one-time operation)
DROP FUNCTION public.cleanup_orphaned_data();

COMMIT;
