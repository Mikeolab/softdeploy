# 🚀 **PROJECT ISOLATION MIGRATION EXECUTION GUIDE**

## **📋 Prerequisites**
- Access to your Supabase project: `szzycvciwdxbmeyggdwh`
- Admin access to the Supabase SQL Editor
- Backup of your current database (recommended)

## **🎯 Migration Overview**
This migration implements comprehensive project isolation by:
1. Creating project membership system
2. Adding `project_id` columns to all test management tables
3. Setting up foreign key constraints and indexes
4. Backfilling existing data with appropriate project assignments
5. Updating Row Level Security policies

---

## **📝 Step 1: Access Supabase Dashboard**

1. **Go to:** https://supabase.com/dashboard
2. **Sign in** with your account
3. **Select your project:** `szzycvciwdxbmeyggdwh`
4. **Click on "SQL Editor"** in the left sidebar

---

## **🗄️ Step 2: Execute Main Migration Script**

1. **Click "New Query"** in the SQL Editor
2. **Copy the entire content** from `migrations/001_project_isolation.sql`
3. **Paste it** into the query editor
4. **Click "Run"** to execute

**Expected Output:**
- ✅ `project_memberships` table created
- ✅ `project_id` columns added to existing tables
- ✅ Indexes and foreign key constraints created
- ✅ RLS policies updated
- ✅ Helper functions created
- ✅ Views created

**⚠️ Important Notes:**
- The script is idempotent (safe to run multiple times)
- It handles missing tables gracefully
- Legacy data remains accessible during transition

---

## **🔄 Step 3: Execute Backfill Script**

1. **Click "New Query"** again
2. **Copy the entire content** from `migrations/002_backfill_project_ids.sql`
3. **Paste it** into the query editor
4. **Click "Run"** to execute

**Expected Output:**
- ✅ "Unassigned (Legacy Data)" project created
- ✅ Existing records assigned to appropriate projects
- ✅ Backfill report displayed in logs
- ✅ Validation checks performed

**📊 Review the Backfill Report:**
The script will output a report showing:
- Total records processed
- Records assigned to specific projects
- Records assigned to "unassigned-legacy" project
- Any remaining NULL values

---

## **✅ Step 4: Verify Migration Success**

### **4.1 Check Tables**
1. **Go to "Table Editor"** in Supabase
2. **Verify these tables exist:**
   - `project_memberships`
   - `test_runs` (with `project_id` column)
   - Any other test management tables

### **4.2 Check Data Integrity**
Run this query to verify the migration:

```sql
-- Check project isolation status
SELECT 
  'test_runs' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN project_id IS NOT NULL THEN 1 END) as with_project_id,
  COUNT(CASE WHEN project_id IS NULL THEN 1 END) as without_project_id
FROM test_runs

UNION ALL

SELECT 
  'project_memberships' as table_name,
  COUNT(*) as total_records,
  COUNT(*) as with_project_id,
  0 as without_project_id
FROM project_memberships;
```

### **4.3 Check Views**
Verify these views were created:
- `project_members_view`
- `test_runs_with_project`

---

## **🚀 Step 5: Deploy Updated Application**

### **5.1 Deploy Server**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

### **5.2 Deploy Frontend**
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build the application
npm run build

# Start the development server
npm run dev
```

---

## **🧪 Step 6: Execute Test Suite**

### **6.1 Run Project Isolation Tests**
```bash
# From project root
npm test tests/project-isolation.test.js
```

### **6.2 Manual Testing Checklist**

**✅ Project Creation:**
- [ ] Create a new project
- [ ] Verify project appears in sidebar
- [ ] Check project membership is created

**✅ Test Run Isolation:**
- [ ] Create test runs in Project A
- [ ] Switch to Project B
- [ ] Verify Project A test runs are not visible
- [ ] Create test runs in Project B
- [ ] Switch back to Project A
- [ ] Verify Project B test runs are not visible

**✅ API Endpoints:**
- [ ] Test `/api/projects/:projectId/test-runs`
- [ ] Test `/api/projects/:projectId/test-plans`
- [ ] Verify 403 errors for unauthorized access

**✅ WebSocket Isolation:**
- [ ] Connect to WebSocket for Project A
- [ ] Run tests in Project A
- [ ] Verify real-time updates only for Project A
- [ ] Connect to WebSocket for Project B
- [ ] Verify no cross-project updates

---

## **📊 Step 7: Monitor System**

### **7.1 Check Logs**
Monitor your server logs for:
- Project operation logging
- Any 403 errors
- WebSocket connection issues

### **7.2 Performance Monitoring**
- Check database query performance
- Monitor WebSocket connection counts
- Verify no memory leaks

### **7.3 Data Integrity**
- Run periodic checks for orphaned records
- Verify project membership consistency
- Check for any NULL project_id values

---

## **🔧 Troubleshooting**

### **Common Issues:**

**❌ Migration Fails:**
- Check if `projects` table exists
- Verify you have admin permissions
- Review error messages in Supabase logs

**❌ Backfill Issues:**
- Check if `projects` table has data
- Verify user_id columns exist
- Review backfill report for anomalies

**❌ API Errors:**
- Check server logs for middleware errors
- Verify project_id parameters
- Check authentication status

**❌ Frontend Issues:**
- Clear browser cache
- Check browser console for errors
- Verify project context is loaded

### **Rollback Plan:**
If issues occur, you can rollback by:
1. Dropping `project_id` columns
2. Dropping `project_memberships` table
3. Restoring original RLS policies
4. Reverting API changes

---

## **🎉 Success Criteria**

**✅ Migration Complete When:**
- [ ] All tables have `project_id` columns
- [ ] `project_memberships` table exists
- [ ] Foreign key constraints are active
- [ ] RLS policies are updated
- [ ] Backfill report shows no NULL values
- [ ] API endpoints require project_id
- [ ] Frontend uses project-scoped routes
- [ ] Tests pass
- [ ] No cross-project data leakage

---

## **📞 Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs
3. Check server logs
4. Verify database schema
5. Test API endpoints individually

**Migration Status:** Ready to Execute 🚀
