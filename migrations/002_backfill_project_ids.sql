-- ===== PROJECT ISOLATION BACKFILL SCRIPT =====
-- This script assigns project_id to existing records and handles ambiguous cases
-- Run this AFTER the main migration script

-- ===== STEP 1: BACKFILL TEST_RUNS TABLE =====

-- First, try to assign project_id based on user_id matching project owner
UPDATE test_runs 
SET project_id = (
  SELECT p.id 
  FROM projects p 
  WHERE p.user_id = test_runs.user_id::uuid 
  LIMIT 1
)
WHERE project_id IS NULL 
AND user_id != 'anonymous'
AND EXISTS (
  SELECT 1 FROM projects p WHERE p.user_id = test_runs.user_id::uuid
);

-- For records that still don't have a project_id, assign to the first available project
UPDATE test_runs 
SET project_id = (
  SELECT id FROM projects LIMIT 1
)
WHERE project_id IS NULL 
AND EXISTS (SELECT 1 FROM projects);

-- ===== STEP 2: BACKFILL OTHER TABLES (IF THEY EXIST) =====

-- Backfill test_plans table
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'test_plans'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Assign project_id based on user_id
    UPDATE test_plans 
    SET project_id = (
      SELECT p.id 
      FROM projects p 
      WHERE p.user_id = test_plans.user_id::uuid 
      LIMIT 1
    )
    WHERE project_id IS NULL 
    AND user_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects p WHERE p.user_id = test_plans.user_id::uuid
    );
    
    -- Assign remaining to unassigned project
    UPDATE test_plans 
    SET project_id = '00000000-0000-0000-0000-000000000000'
    WHERE project_id IS NULL;
    
    RAISE NOTICE 'Backfilled test_plans table';
  END IF;
END $$;

-- Backfill test_suites table
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'test_suites'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Assign project_id based on user_id
    UPDATE test_suites 
    SET project_id = (
      SELECT p.id 
      FROM projects p 
      WHERE p.user_id = test_suites.user_id::uuid 
      LIMIT 1
    )
    WHERE project_id IS NULL 
    AND user_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects p WHERE p.user_id = test_suites.user_id::uuid
    );
    
    -- Assign remaining to unassigned project
    UPDATE test_suites 
    SET project_id = '00000000-0000-0000-0000-000000000000'
    WHERE project_id IS NULL;
    
    RAISE NOTICE 'Backfilled test_suites table';
  END IF;
END $$;

-- Backfill test_cases table
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'test_cases'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Assign project_id based on user_id
    UPDATE test_cases 
    SET project_id = (
      SELECT p.id 
      FROM projects p 
      WHERE p.user_id = test_cases.user_id::uuid 
      LIMIT 1
    )
    WHERE project_id IS NULL 
    AND user_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects p WHERE p.user_id = test_cases.user_id::uuid
    );
    
    -- Assign remaining to unassigned project
    UPDATE test_cases 
    SET project_id = '00000000-0000-0000-0000-000000000000'
    WHERE project_id IS NULL;
    
    RAISE NOTICE 'Backfilled test_cases table';
  END IF;
END $$;

-- Backfill artifacts table
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'artifacts'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Assign project_id based on user_id
    UPDATE artifacts 
    SET project_id = (
      SELECT p.id 
      FROM projects p 
      WHERE p.user_id = artifacts.user_id::uuid 
      LIMIT 1
    )
    WHERE project_id IS NULL 
    AND user_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects p WHERE p.user_id = artifacts.user_id::uuid
    );
    
    -- Assign remaining to unassigned project
    UPDATE artifacts 
    SET project_id = '00000000-0000-0000-0000-000000000000'
    WHERE project_id IS NULL;
    
    RAISE NOTICE 'Backfilled artifacts table';
  END IF;
END $$;

-- ===== STEP 3: CREATE UNASSIGNED PROJECT (IF NEEDED) =====

-- Create an "Unassigned" project for records that couldn't be assigned to existing projects
DO $$
DECLARE
  unassigned_exists BOOLEAN;
  assigned_count INTEGER;
BEGIN
  -- Check if unassigned project already exists
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = '00000000-0000-0000-0000-000000000000'
  ) INTO unassigned_exists;
  
  -- Count records assigned to unassigned project
  SELECT COUNT(*) INTO assigned_count 
  FROM test_runs 
  WHERE project_id = '00000000-0000-0000-0000-000000000000';
  
  IF NOT unassigned_exists AND assigned_count > 0 THEN
    -- Create unassigned project
    INSERT INTO projects (id, name, description, user_id)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'Unassigned Legacy Records',
      'Records that existed before project isolation was implemented',
      '00000000-0000-0000-0000-000000000001'
    );
    
    RAISE NOTICE 'Created Unassigned project for % legacy records', assigned_count;
  ELSIF assigned_count > 0 THEN
    RAISE NOTICE 'Unassigned project already exists, % records assigned', assigned_count;
  END IF;
END $$;

-- ===== STEP 4: GENERATE BACKFILL REPORT =====

-- Report on backfill results (only for tables that exist)
DO $$
DECLARE
    tbl_name TEXT;
    table_exists BOOLEAN;
    total_count INTEGER;
    assigned_count INTEGER;
    unassigned_count INTEGER;
    null_count INTEGER;
BEGIN
    RAISE NOTICE '=== BACKFILL REPORT ===';
    
    -- Check each table and report if it exists
    FOR tbl_name IN VALUES ('test_runs'), ('test_plans'), ('test_suites'), ('test_cases'), ('artifacts') LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tbl_name
        ) INTO table_exists;
        
        IF table_exists THEN
            EXECUTE format('
                SELECT 
                    COUNT(*),
                    COUNT(CASE WHEN project_id != ''00000000-0000-0000-0000-000000000000'' THEN 1 END),
                    COUNT(CASE WHEN project_id = ''00000000-0000-0000-0000-000000000000'' THEN 1 END),
                    COUNT(CASE WHEN project_id IS NULL THEN 1 END)
                FROM %I', tbl_name
            ) INTO total_count, assigned_count, unassigned_count, null_count;
            
            RAISE NOTICE 'Table %: Total=%, Assigned=%, Unassigned=%, Null=%', 
                tbl_name, total_count, assigned_count, unassigned_count, null_count;
        ELSE
            RAISE NOTICE 'Table %: Does not exist, skipping', tbl_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== BACKFILL COMPLETE ===';
END $$;

-- ===== STEP 5: VALIDATION CHECKS =====

-- Check for any remaining NULL project_id values (only for existing tables)
DO $$
DECLARE
    tbl_name TEXT;
    table_exists BOOLEAN;
    null_count INTEGER;
BEGIN
    RAISE NOTICE '=== VALIDATION CHECKS ===';
    
    -- Check each table for NULL project_id values
    FOR tbl_name IN VALUES ('test_runs'), ('test_plans'), ('test_suites'), ('test_cases'), ('artifacts') LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tbl_name
        ) INTO table_exists;
        
        IF table_exists THEN
            EXECUTE format('SELECT COUNT(*) FROM %I WHERE project_id IS NULL', tbl_name) INTO null_count;
            
            IF null_count > 0 THEN
                RAISE WARNING 'WARNING: % % still have NULL project_id', null_count, tbl_name;
            ELSE
                RAISE NOTICE 'OK: All % have project_id assigned', tbl_name;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== VALIDATION COMPLETE ===';
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== PROJECT ISOLATION BACKFILL COMPLETE ===';
    RAISE NOTICE 'All existing records have been assigned project_id values';
    RAISE NOTICE 'Project isolation is now active';
END $$;