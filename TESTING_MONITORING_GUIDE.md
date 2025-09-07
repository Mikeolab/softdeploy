# 🧪 **PROJECT ISOLATION TESTING & MONITORING GUIDE**

## **📋 Current Status**
✅ **Server Deployed** - Project isolation middleware active  
✅ **Frontend Built** - Project context and routing implemented  
✅ **Development Environment** - Running concurrently  
🔄 **Database Migrations** - Ready to execute via Supabase web interface  

---

## **🎯 Manual Testing Checklist**

### **Phase 1: Database Migration Verification**

**Before Testing - Execute These Steps:**

1. **Access Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `szzycvciwdxbmeyggdwh`
   - Navigate to SQL Editor

2. **Run Migration Scripts**
   - Execute `migrations/001_project_isolation.sql`
   - Execute `migrations/002_backfill_project_ids.sql`
   - Review backfill report output

3. **Verify Database Schema**
   - Check `project_memberships` table exists
   - Verify `project_id` columns added to test tables
   - Confirm foreign key constraints active

---

### **Phase 2: Application Testing**

**✅ Project Creation & Navigation**
- [ ] Open application at `http://localhost:3000`
- [ ] Create a new project
- [ ] Verify project appears in sidebar
- [ ] Check URL changes to `/projects/:projectId`
- [ ] Navigate between different projects

**✅ Test Run Isolation**
- [ ] Create test runs in Project A
- [ ] Switch to Project B
- [ ] Verify Project A test runs are NOT visible
- [ ] Create test runs in Project B
- [ ] Switch back to Project A
- [ ] Verify Project B test runs are NOT visible

**✅ API Endpoint Testing**
Test these endpoints with proper project_id:
- [ ] `GET /api/projects/:projectId/test-runs`
- [ ] `GET /api/projects/:projectId/test-plans`
- [ ] `POST /api/projects/:projectId/test-plans`
- [ ] `GET /api/projects/:projectId/members`

**✅ WebSocket Isolation**
- [ ] Connect to WebSocket for Project A
- [ ] Run tests in Project A
- [ ] Verify real-time updates only for Project A
- [ ] Connect to WebSocket for Project B
- [ ] Verify no cross-project updates

**✅ Security Testing**
- [ ] Try accessing Project B data while in Project A
- [ ] Verify 403 errors for unauthorized access
- [ ] Test with different user roles (viewer, editor, admin)

---

### **Phase 3: Error Handling**

**✅ Error Scenarios**
- [ ] Invalid project_id in URL
- [ ] Non-existent project_id
- [ ] Missing authentication
- [ ] Insufficient permissions
- [ ] Network connectivity issues

---

## **📊 System Monitoring**

### **Server Logs Monitoring**

**Key Log Messages to Watch For:**
```
✅ Project Operation Logging:
- "Project Operation: [action] - Project: [id], User: [id]"
- "WebSocket Connected - Project: [id], User: [id]"
- "Test Suite Execution Started - Project: [id]"

❌ Error Patterns:
- "403 Forbidden - Project access denied"
- "Project not found: [id]"
- "User [id] not member of project [id]"
```

### **Database Monitoring**

**Run These Queries Periodically:**

```sql
-- Check project isolation status
SELECT 
  'test_runs' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN project_id IS NOT NULL THEN 1 END) as with_project_id,
  COUNT(CASE WHEN project_id IS NULL THEN 1 END) as without_project_id
FROM test_runs;

-- Check project memberships
SELECT 
  project_id,
  COUNT(*) as member_count,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN role = 'editor' THEN 1 END) as editors
FROM project_memberships
GROUP BY project_id;

-- Check for orphaned records
SELECT COUNT(*) as orphaned_test_runs
FROM test_runs tr
WHERE tr.project_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = tr.project_id);
```

### **Performance Monitoring**

**Metrics to Track:**
- [ ] Database query response times
- [ ] WebSocket connection counts per project
- [ ] API endpoint response times
- [ ] Memory usage patterns
- [ ] Error rates by endpoint

---

## **🔧 Troubleshooting Guide**

### **Common Issues & Solutions**

**❌ Issue: "Project not found" errors**
- **Cause:** Invalid project_id in URL or database
- **Solution:** Check project exists in database, verify URL format

**❌ Issue: "403 Forbidden" on API calls**
- **Cause:** User not member of project or insufficient role
- **Solution:** Check project_memberships table, verify user role

**❌ Issue: Cross-project data leakage**
- **Cause:** Missing project_id in queries or middleware
- **Solution:** Review API middleware, check database queries

**❌ Issue: WebSocket not receiving updates**
- **Cause:** Project validation failing or wrong project_id
- **Solution:** Check WebSocket connection logs, verify project_id

**❌ Issue: Frontend routing errors**
- **Cause:** Missing project context or invalid routes
- **Solution:** Check ProjectContext, verify route definitions

---

## **📈 Success Criteria**

**✅ Migration Complete When:**
- [ ] All database migrations executed successfully
- [ ] No NULL project_id values in critical tables
- [ ] Foreign key constraints active
- [ ] RLS policies updated and working

**✅ Application Working When:**
- [ ] Projects can be created and navigated
- [ ] Test runs isolated by project
- [ ] API endpoints require project_id
- [ ] WebSocket updates scoped to projects
- [ ] No cross-project data leakage
- [ ] Error handling works correctly

**✅ System Stable When:**
- [ ] No memory leaks detected
- [ ] Performance metrics within acceptable ranges
- [ ] Error rates below threshold
- [ ] All monitoring queries return expected results

---

## **🚨 Emergency Rollback Plan**

**If Critical Issues Occur:**

1. **Stop Development Servers**
   ```bash
   # Kill background processes
   taskkill /f /im node.exe
   ```

2. **Database Rollback**
   - Drop `project_id` columns from tables
   - Drop `project_memberships` table
   - Restore original RLS policies

3. **Code Rollback**
   - Revert to previous git commit
   - Remove project isolation middleware
   - Restore original API routes

4. **Verification**
   - Test basic functionality
   - Verify no data corruption
   - Check system stability

---

## **📞 Next Steps**

**Immediate Actions:**
1. Execute database migrations in Supabase
2. Test project creation and navigation
3. Verify test run isolation
4. Monitor system logs

**Follow-up Actions:**
1. Performance optimization
2. Additional test coverage
3. Documentation updates
4. Production deployment planning

**Status:** Ready for Manual Testing 🚀
