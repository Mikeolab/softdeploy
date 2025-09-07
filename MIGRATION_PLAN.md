# Project Isolation Migration Plan

## Overview
This document outlines the complete migration plan for implementing project isolation in the test management system. The goal is to ensure that all test data (test_runs, test_plans, test_suites, test_cases, artifacts) is properly scoped to projects with no cross-project data leakage.

## Migration Steps

### Phase 1: Database Schema Changes

#### 1.1 Run Main Migration Script
```bash
# Execute in Supabase SQL Editor
psql -f migrations/001_project_isolation.sql
```

**What it does:**
- Creates `project_memberships` table for role-based access control
- Adds `project_id` columns to all test management tables
- Creates indexes for performance
- Adds foreign key constraints with CASCADE delete
- Updates RLS policies for project isolation
- Creates helper functions for role checking

#### 1.2 Run Backfill Script
```bash
# Execute in Supabase SQL Editor
psql -f migrations/002_backfill_project_ids.sql
```

**What it does:**
- Creates "Unassigned" project for legacy data
- Assigns existing records to appropriate projects based on user_id
- Quarantines ambiguous records to "Unassigned" project
- Generates detailed backfill report
- Validates data integrity

### Phase 2: Backend API Updates

#### 2.1 Deploy Updated Server
```bash
# Deploy the updated server with project isolation middleware
npm run build
npm start
```

**Changes:**
- All API routes now require `projectId` parameter
- Project membership validation on all requests
- Role-based access control enforcement
- Project-scoped logging and monitoring
- WebSocket connections require project validation

#### 2.2 API Route Changes
- `POST /api/execute-test-suite` → `POST /api/projects/:projectId/execute-test-suite`
- `GET /api/test-runs` → `GET /api/projects/:projectId/test-runs`
- `POST /api/test-plans` → `POST /api/projects/:projectId/test-plans`
- WebSocket: `ws://localhost:5000/ws?projectId=xxx&token=yyy`

### Phase 3: Frontend Updates

#### 3.1 Deploy Updated Frontend
```bash
cd client
npm run build
```

**Changes:**
- Project-scoped routing: `/projects/:projectId/test-management`
- Project context provider for all project pages
- Updated navigation to use project-scoped links
- API calls automatically include project context

#### 3.2 Route Migration
- `/test-management` → `/projects/:projectId/test-management`
- `/deploy` → `/projects/:projectId/deploy`
- `/runs` → `/projects/:projectId/runs`

### Phase 4: Testing and Validation

#### 4.1 Run Test Suite
```bash
npm test -- tests/project-isolation.test.js
```

**Test Coverage:**
- Database level isolation
- API level isolation
- WebSocket isolation
- Cross-project data leakage prevention
- Role-based access control
- Migration and backfill validation

#### 4.2 Manual Testing Checklist
- [ ] Create test runs in Project A, verify not visible in Project B
- [ ] Switch between projects, verify data isolation
- [ ] Test role-based permissions (viewer vs editor vs admin)
- [ ] Verify WebSocket connections are project-scoped
- [ ] Test legacy data handling
- [ ] Verify "Recent Runs" shows only project-specific data

### Phase 5: Monitoring and Rollback Plan

#### 5.1 Monitoring Setup
- Log all project-scoped operations
- Monitor for any cross-project data access
- Track API response times with new middleware
- Alert on any 403/404 errors related to project access

#### 5.2 Rollback Plan
If issues are detected:

1. **Immediate Rollback:**
   ```bash
   # Revert to previous server version
   git checkout HEAD~1
   npm run build
   npm start
   ```

2. **Database Rollback:**
   ```sql
   -- Remove project_id constraints (keep columns for data preservation)
   ALTER TABLE test_runs DROP CONSTRAINT IF EXISTS fk_test_runs_project_id;
   -- Revert RLS policies to user-based only
   -- (Detailed rollback script would be provided)
   ```

3. **Frontend Rollback:**
   ```bash
   # Revert to legacy routing
   git checkout HEAD~1
   npm run build
   ```

## Migration Timeline

### Pre-Migration (Day -7 to Day -1)
- [ ] Run migration scripts in staging environment
- [ ] Execute comprehensive test suite
- [ ] Performance testing with project isolation
- [ ] User acceptance testing
- [ ] Documentation review

### Migration Day (Day 0)
- [ ] **00:00-02:00**: Database migration (maintenance window)
- [ ] **02:00-04:00**: Backend deployment
- [ ] **04:00-06:00**: Frontend deployment
- [ ] **06:00-08:00**: Testing and validation
- [ ] **08:00-12:00**: Monitoring and issue resolution

### Post-Migration (Day +1 to Day +7)
- [ ] Monitor system performance
- [ ] User feedback collection
- [ ] Bug fixes and optimizations
- [ ] Documentation updates

## Risk Assessment and Mitigation

### High Risk Items
1. **Data Loss During Migration**
   - **Mitigation**: Full database backup before migration
   - **Rollback**: Restore from backup if needed

2. **Performance Degradation**
   - **Mitigation**: Comprehensive indexing strategy
   - **Monitoring**: Query performance tracking

3. **User Access Issues**
   - **Mitigation**: Thorough testing of authentication flows
   - **Support**: 24/7 support during migration window

### Medium Risk Items
1. **WebSocket Connection Issues**
   - **Mitigation**: Gradual rollout with feature flags
   - **Fallback**: Legacy WebSocket support during transition

2. **API Rate Limiting**
   - **Mitigation**: Load testing with new middleware
   - **Scaling**: Auto-scaling configuration

## Success Criteria

### Functional Requirements
- [ ] All test data properly scoped to projects
- [ ] No cross-project data leakage
- [ ] Role-based access control working
- [ ] WebSocket connections project-scoped
- [ ] Legacy data properly handled

### Performance Requirements
- [ ] API response times < 200ms (95th percentile)
- [ ] Database query performance maintained
- [ ] WebSocket connection time < 1s
- [ ] No memory leaks in middleware

### User Experience Requirements
- [ ] Seamless project switching
- [ ] Intuitive project-scoped navigation
- [ ] Clear error messages for access denied
- [ ] No disruption to existing workflows

## Communication Plan

### Pre-Migration
- **1 week before**: Email all users about upcoming changes
- **3 days before**: Detailed migration guide sent
- **1 day before**: Final reminder and support contact info

### During Migration
- **Status page**: Real-time updates on migration progress
- **Support chat**: Dedicated support channel
- **Email updates**: Hourly progress reports

### Post-Migration
- **Day 1**: Migration completion announcement
- **Day 3**: User feedback survey
- **Week 1**: Performance report and next steps

## Support and Training

### User Training
- **Video tutorials**: Project-scoped navigation
- **Documentation**: Updated user guides
- **Webinar**: Live Q&A session

### Support Team Training
- **Technical training**: New API endpoints and middleware
- **Troubleshooting guide**: Common issues and solutions
- **Escalation procedures**: When to involve development team

## Post-Migration Optimization

### Performance Optimization
- [ ] Query optimization based on usage patterns
- [ ] Caching strategy for project data
- [ ] Database connection pooling tuning

### Feature Enhancements
- [ ] Project templates for faster setup
- [ ] Bulk operations within projects
- [ ] Advanced project analytics

### Monitoring Improvements
- [ ] Custom dashboards for project metrics
- [ ] Automated alerts for cross-project access attempts
- [ ] Performance trend analysis

## Conclusion

This migration plan ensures a smooth transition to project isolation while maintaining data integrity and user experience. The phased approach allows for careful validation at each step, with comprehensive rollback procedures if issues arise.

The key success factors are:
1. Thorough testing in staging environment
2. Clear communication with users
3. Comprehensive monitoring during migration
4. Quick response to any issues
5. Post-migration optimization and support

By following this plan, we can successfully implement project isolation while minimizing risk and disruption to users.
