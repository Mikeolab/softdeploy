-- Debug and fix data isolation - check actual column types first
-- This migration first checks column types, then applies correct RLS policies

-- 1. First, let's check the actual column types
DO $$
DECLARE
    test_runs_user_id_type TEXT;
    test_plans_user_id_type TEXT;
    project_memberships_user_id_type TEXT;
BEGIN
    -- Check test_runs.user_id type
    SELECT data_type INTO test_runs_user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'test_runs' AND column_name = 'user_id' AND table_schema = 'public';
    
    -- Check test_plans.user_id type (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans' AND table_schema = 'public') THEN
        SELECT data_type INTO test_plans_user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_plans' AND column_name = 'user_id' AND table_schema = 'public';
    END IF;
    
    -- Check project_memberships.user_id type
    SELECT data_type INTO project_memberships_user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'project_memberships' AND column_name = 'user_id' AND table_schema = 'public';
    
    -- Log the types
    RAISE NOTICE 'test_runs.user_id type: %', test_runs_user_id_type;
    RAISE NOTICE 'test_plans.user_id type: %', test_plans_user_id_type;
    RAISE NOTICE 'project_memberships.user_id type: %', project_memberships_user_id_type;
END $$;

-- 2. Fix test_runs RLS policies based on actual column types
DROP POLICY IF EXISTS "Users can view test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can create test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can update test runs" ON public.test_runs;

-- Create RLS policies for test_runs (assuming user_id is TEXT)
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

-- 3. Fix test_plans RLS policies (if table exists) - handle both UUID and TEXT cases
DO $$
DECLARE
    user_id_type TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans' AND table_schema = 'public') THEN
        -- Get the actual column type
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_plans' AND column_name = 'user_id' AND table_schema = 'public';
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view test plans" ON public.test_plans;
        DROP POLICY IF EXISTS "Users can create test plans" ON public.test_plans;
        DROP POLICY IF EXISTS "Users can update test plans" ON public.test_plans;
        
        -- Create policies based on actual column type
        IF user_id_type = 'uuid' THEN
            -- If user_id is UUID, compare directly with auth.uid()
            EXECUTE 'CREATE POLICY "Users can view own test plans" ON public.test_plans
                FOR SELECT USING (
                    user_id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_plans.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create test plans" ON public.test_plans
                FOR INSERT WITH CHECK (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_plans.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own test plans" ON public.test_plans
                FOR UPDATE USING (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_plans.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        ELSE
            -- If user_id is TEXT, cast auth.uid() to text
            EXECUTE 'CREATE POLICY "Users can view own test plans" ON public.test_plans
                FOR SELECT USING (
                    user_id = auth.uid()::text OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_plans.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create test plans" ON public.test_plans
                FOR INSERT WITH CHECK (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_plans.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own test plans" ON public.test_plans
                FOR UPDATE USING (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_plans.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        END IF;
        
        RAISE NOTICE 'Created test_plans policies for user_id type: %', user_id_type;
    END IF;
END $$;

-- 4. Fix test_suites RLS policies (if table exists) - handle both UUID and TEXT cases
DO $$
DECLARE
    user_id_type TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites' AND table_schema = 'public') THEN
        -- Get the actual column type
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_suites' AND column_name = 'user_id' AND table_schema = 'public';
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view test suites" ON public.test_suites;
        DROP POLICY IF EXISTS "Users can create test suites" ON public.test_suites;
        DROP POLICY IF EXISTS "Users can update test suites" ON public.test_suites;
        
        -- Create policies based on actual column type
        IF user_id_type = 'uuid' THEN
            -- If user_id is UUID, compare directly with auth.uid()
            EXECUTE 'CREATE POLICY "Users can view own test suites" ON public.test_suites
                FOR SELECT USING (
                    user_id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_suites.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create test suites" ON public.test_suites
                FOR INSERT WITH CHECK (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_suites.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own test suites" ON public.test_suites
                FOR UPDATE USING (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_suites.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        ELSE
            -- If user_id is TEXT, cast auth.uid() to text
            EXECUTE 'CREATE POLICY "Users can view own test suites" ON public.test_suites
                FOR SELECT USING (
                    user_id = auth.uid()::text OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_suites.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create test suites" ON public.test_suites
                FOR INSERT WITH CHECK (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_suites.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own test suites" ON public.test_suites
                FOR UPDATE USING (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_suites.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        END IF;
        
        RAISE NOTICE 'Created test_suites policies for user_id type: %', user_id_type;
    END IF;
END $$;

-- 5. Fix test_cases RLS policies (if table exists) - handle both UUID and TEXT cases
DO $$
DECLARE
    user_id_type TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases' AND table_schema = 'public') THEN
        -- Get the actual column type
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_cases' AND column_name = 'user_id' AND table_schema = 'public';
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view test cases" ON public.test_cases;
        DROP POLICY IF EXISTS "Users can create test cases" ON public.test_cases;
        DROP POLICY IF EXISTS "Users can update test cases" ON public.test_cases;
        
        -- Create policies based on actual column type
        IF user_id_type = 'uuid' THEN
            -- If user_id is UUID, compare directly with auth.uid()
            EXECUTE 'CREATE POLICY "Users can view own test cases" ON public.test_cases
                FOR SELECT USING (
                    user_id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_cases.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create test cases" ON public.test_cases
                FOR INSERT WITH CHECK (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_cases.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own test cases" ON public.test_cases
                FOR UPDATE USING (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_cases.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        ELSE
            -- If user_id is TEXT, cast auth.uid() to text
            EXECUTE 'CREATE POLICY "Users can view own test cases" ON public.test_cases
                FOR SELECT USING (
                    user_id = auth.uid()::text OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_cases.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create test cases" ON public.test_cases
                FOR INSERT WITH CHECK (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_cases.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own test cases" ON public.test_cases
                FOR UPDATE USING (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = test_cases.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        END IF;
        
        RAISE NOTICE 'Created test_cases policies for user_id type: %', user_id_type;
    END IF;
END $$;

-- 6. Fix artifacts RLS policies (if table exists) - handle both UUID and TEXT cases
DO $$
DECLARE
    user_id_type TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts' AND table_schema = 'public') THEN
        -- Get the actual column type
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'artifacts' AND column_name = 'user_id' AND table_schema = 'public';
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view artifacts" ON public.artifacts;
        DROP POLICY IF EXISTS "Users can create artifacts" ON public.artifacts;
        DROP POLICY IF EXISTS "Users can update artifacts" ON public.artifacts;
        
        -- Create policies based on actual column type
        IF user_id_type = 'uuid' THEN
            -- If user_id is UUID, compare directly with auth.uid()
            EXECUTE 'CREATE POLICY "Users can view own artifacts" ON public.artifacts
                FOR SELECT USING (
                    user_id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = artifacts.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create artifacts" ON public.artifacts
                FOR INSERT WITH CHECK (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = artifacts.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own artifacts" ON public.artifacts
                FOR UPDATE USING (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = artifacts.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        ELSE
            -- If user_id is TEXT, cast auth.uid() to text
            EXECUTE 'CREATE POLICY "Users can view own artifacts" ON public.artifacts
                FOR SELECT USING (
                    user_id = auth.uid()::text OR
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = artifacts.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can create artifacts" ON public.artifacts
                FOR INSERT WITH CHECK (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = artifacts.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
                
            EXECUTE 'CREATE POLICY "Users can update own artifacts" ON public.artifacts
                FOR UPDATE USING (
                    user_id = auth.uid()::text AND
                    EXISTS (
                        SELECT 1 FROM public.project_memberships pm
                        WHERE pm.project_id = artifacts.project_id 
                        AND pm.user_id = auth.uid()
                    )
                )';
        END IF;
        
        RAISE NOTICE 'Created artifacts policies for user_id type: %', user_id_type;
    END IF;
END $$;

-- 7. Ensure project_memberships has proper user isolation
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

-- 8. Create a function to clean up orphaned data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void AS $$
DECLARE
    user_id_type TEXT;
BEGIN
    -- Check test_runs.user_id type and clean accordingly
    SELECT data_type INTO user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'test_runs' AND column_name = 'user_id' AND table_schema = 'public';
    
    -- Remove test runs that don't belong to any user
    IF user_id_type = 'uuid' THEN
        DELETE FROM public.test_runs WHERE user_id IS NULL;
    ELSE
        DELETE FROM public.test_runs WHERE user_id IS NULL OR user_id = '';
    END IF;
    
    -- Remove test runs that don't have valid project associations
    DELETE FROM public.test_runs 
    WHERE project_id IS NULL 
    OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_runs.project_id);
    
    -- Remove test plans that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_plans' AND table_schema = 'public') THEN
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_plans' AND column_name = 'user_id' AND table_schema = 'public';
        
        IF user_id_type = 'uuid' THEN
            DELETE FROM public.test_plans WHERE user_id IS NULL;
        ELSE
            DELETE FROM public.test_plans WHERE user_id IS NULL OR user_id = '';
        END IF;
        
        DELETE FROM public.test_plans 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_plans.project_id);
    END IF;
    
    -- Remove test suites that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_suites' AND table_schema = 'public') THEN
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_suites' AND column_name = 'user_id' AND table_schema = 'public';
        
        IF user_id_type = 'uuid' THEN
            DELETE FROM public.test_suites WHERE user_id IS NULL;
        ELSE
            DELETE FROM public.test_suites WHERE user_id IS NULL OR user_id = '';
        END IF;
        
        DELETE FROM public.test_suites 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_suites.project_id);
    END IF;
    
    -- Remove test cases that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_cases' AND table_schema = 'public') THEN
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'test_cases' AND column_name = 'user_id' AND table_schema = 'public';
        
        IF user_id_type = 'uuid' THEN
            DELETE FROM public.test_cases WHERE user_id IS NULL;
        ELSE
            DELETE FROM public.test_cases WHERE user_id IS NULL OR user_id = '';
        END IF;
        
        DELETE FROM public.test_cases 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = test_cases.project_id);
    END IF;
    
    -- Remove artifacts that don't belong to any user (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artifacts' AND table_schema = 'public') THEN
        SELECT data_type INTO user_id_type
        FROM information_schema.columns 
        WHERE table_name = 'artifacts' AND column_name = 'user_id' AND table_schema = 'public';
        
        IF user_id_type = 'uuid' THEN
            DELETE FROM public.artifacts WHERE user_id IS NULL;
        ELSE
            DELETE FROM public.artifacts WHERE user_id IS NULL OR user_id = '';
        END IF;
        
        DELETE FROM public.artifacts 
        WHERE project_id IS NULL 
        OR NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = artifacts.project_id);
    END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 9. Run the cleanup function
SELECT public.cleanup_orphaned_data();

-- 10. Drop the cleanup function (it's a one-time operation)
DROP FUNCTION public.cleanup_orphaned_data();

COMMIT;
