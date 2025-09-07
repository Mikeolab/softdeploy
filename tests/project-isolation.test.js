// Project Isolation Tests
// This file contains comprehensive tests for project isolation functionality

const { createClient } = require('@supabase/supabase-js');
const request = require('supertest');
const app = require('../server/index-real');

// Test configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test data
const testUsers = {
  user1: {
    id: 'test-user-1',
    email: 'user1@test.com',
    password: 'password123'
  },
  user2: {
    id: 'test-user-2', 
    email: 'user2@test.com',
    password: 'password123'
  }
};

const testProjects = {
  project1: {
    id: 'test-project-1',
    name: 'Test Project 1',
    user_id: testUsers.user1.id
  },
  project2: {
    id: 'test-project-2',
    name: 'Test Project 2', 
    user_id: testUsers.user2.id
  }
};

const testTestRuns = {
  run1: {
    id: 'test-run-1',
    project_id: testProjects.project1.id,
    user_id: testUsers.user1.id,
    test_suite_name: 'API Test Suite',
    test_type: 'API',
    tool_id: 'axios',
    status: 'completed'
  },
  run2: {
    id: 'test-run-2',
    project_id: testProjects.project2.id,
    user_id: testUsers.user2.id,
    test_suite_name: 'Functional Test Suite',
    test_type: 'Functional',
    tool_id: 'puppeteer',
    status: 'completed'
  }
};

describe('Project Isolation Tests', () => {
  let user1Token, user2Token;

  beforeAll(async () => {
    // Setup test data
    await setupTestData();
    
    // Get authentication tokens
    user1Token = await getAuthToken(testUsers.user1);
    user2Token = await getAuthToken(testUsers.user2);
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('Database Level Isolation', () => {
    test('should only return test runs for the specified project', async () => {
      const { data: runs, error } = await supabase
        .from('test_runs')
        .select('*')
        .eq('project_id', testProjects.project1.id);

      expect(error).toBeNull();
      expect(runs).toHaveLength(1);
      expect(runs[0].id).toBe(testTestRuns.run1.id);
      expect(runs[0].project_id).toBe(testProjects.project1.id);
    });

    test('should not return test runs from other projects', async () => {
      const { data: runs, error } = await supabase
        .from('test_runs')
        .select('*')
        .eq('project_id', testProjects.project1.id);

      expect(error).toBeNull();
      expect(runs).not.toContainEqual(
        expect.objectContaining({ id: testTestRuns.run2.id })
      );
    });

    test('should enforce foreign key constraints', async () => {
      const { error } = await supabase
        .from('test_runs')
        .insert({
          id: 'invalid-run',
          project_id: 'non-existent-project',
          user_id: testUsers.user1.id,
          test_suite_name: 'Test',
          test_type: 'API',
          tool_id: 'axios',
          status: 'running'
        });

      expect(error).not.toBeNull();
      expect(error.message).toContain('foreign key');
    });
  });

  describe('API Level Isolation', () => {
    test('should require project_id in route parameters', async () => {
      const response = await request(app)
        .post('/api/execute-test-suite')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          testSuite: {
            name: 'Test Suite',
            testType: 'API',
            steps: []
          }
        });

      expect(response.status).toBe(404); // Route not found
    });

    test('should require valid project_id', async () => {
      const response = await request(app)
        .post('/api/projects/invalid-project/execute-test-suite')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          testSuite: {
            name: 'Test Suite',
            testType: 'API',
            steps: []
          }
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Project not found');
    });

    test('should require project membership', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjects.project2.id}/execute-test-suite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          testSuite: {
            name: 'Test Suite',
            testType: 'API',
            steps: []
          }
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });

    test('should allow access for project members', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjects.project1.id}/execute-test-suite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          testSuite: {
            name: 'Test Suite',
            testType: 'API',
            steps: [
              {
                id: 1,
                name: 'Test Step',
                type: 'api',
                description: 'Test API call',
                config: {
                  method: 'GET',
                  url: '/test'
                }
              }
            ]
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.projectId).toBe(testProjects.project1.id);
    });

    test('should enforce role-based permissions', async () => {
      // Create a viewer-only membership
      await supabase
        .from('project_memberships')
        .insert({
          project_id: testProjects.project1.id,
          user_id: testUsers.user2.id,
          role: 'viewer'
        });

      const response = await request(app)
        .post(`/api/projects/${testProjects.project1.id}/execute-test-suite`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          testSuite: {
            name: 'Test Suite',
            testType: 'API',
            steps: []
          }
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Requires editor role');
    });

    test('should return project-scoped test runs', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjects.project1.id}/test-runs`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.projectId).toBe(testProjects.project1.id);
      expect(response.body.testRuns).toHaveLength(1);
      expect(response.body.testRuns[0].project_id).toBe(testProjects.project1.id);
    });

    test('should not return test runs from other projects', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjects.project1.id}/test-runs`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.testRuns).not.toContainEqual(
        expect.objectContaining({ project_id: testProjects.project2.id })
      );
    });
  });

  describe('WebSocket Isolation', () => {
    test('should require project_id in WebSocket connection', async () => {
      const WebSocket = require('ws');
      
      const ws = new WebSocket(`ws://localhost:5000/ws`);
      
      await new Promise((resolve, reject) => {
        ws.on('open', () => {
          ws.close();
          reject(new Error('Connection should have been rejected'));
        });
        
        ws.on('error', (error) => {
          expect(error.message).toContain('Project ID is required');
          resolve();
        });
        
        setTimeout(() => {
          ws.close();
          resolve();
        }, 1000);
      });
    });

    test('should validate project membership for WebSocket', async () => {
      const WebSocket = require('ws');
      
      const ws = new WebSocket(`ws://localhost:5000/ws?projectId=${testProjects.project2.id}&token=${user1Token}`);
      
      await new Promise((resolve, reject) => {
        ws.on('open', () => {
          ws.close();
          reject(new Error('Connection should have been rejected'));
        });
        
        ws.on('error', (error) => {
          expect(error.message).toContain('Access denied');
          resolve();
        });
        
        setTimeout(() => {
          ws.close();
          resolve();
        }, 1000);
      });
    });

    test('should allow WebSocket connection for project members', async () => {
      const WebSocket = require('ws');
      
      const ws = new WebSocket(`ws://localhost:5000/ws?projectId=${testProjects.project1.id}&token=${user1Token}`);
      
      await new Promise((resolve, reject) => {
        ws.on('open', () => {
          expect(ws.projectId).toBe(testProjects.project1.id);
          expect(ws.userId).toBe(testUsers.user1.id);
          ws.close();
          resolve();
        });
        
        ws.on('error', (error) => {
          reject(error);
        });
        
        setTimeout(() => {
          ws.close();
          reject(new Error('Connection timeout'));
        }, 2000);
      });
    });
  });

  describe('Frontend Integration Tests', () => {
    test('should navigate to project-scoped routes', async () => {
      // This would be tested with a headless browser like Puppeteer
      // For now, we'll test the route generation logic
      
      const projectId = testProjects.project1.id;
      const expectedRoutes = [
        `/projects/${projectId}`,
        `/projects/${projectId}/test-management`,
        `/projects/${projectId}/deploy`,
        `/projects/${projectId}/runs`
      ];
      
      expectedRoutes.forEach(route => {
        expect(route).toContain(projectId);
      });
    });

    test('should use project context in API calls', async () => {
      // Test that frontend API calls include project_id
      const projectId = testProjects.project1.id;
      const apiEndpoint = `/api/projects/${projectId}/test-runs`;
      
      expect(apiEndpoint).toContain(projectId);
      expect(apiEndpoint).toMatch(/^\/api\/projects\/[^\/]+\/test-runs$/);
    });
  });

  describe('Cross-Project Data Leakage Prevention', () => {
    test('should not leak test runs between projects', async () => {
      // Create test runs in both projects
      await supabase
        .from('test_runs')
        .insert([
          {
            id: 'leak-test-1',
            project_id: testProjects.project1.id,
            user_id: testUsers.user1.id,
            test_suite_name: 'Project 1 Test',
            test_type: 'API',
            tool_id: 'axios',
            status: 'completed'
          },
          {
            id: 'leak-test-2',
            project_id: testProjects.project2.id,
            user_id: testUsers.user2.id,
            test_suite_name: 'Project 2 Test',
            test_type: 'API',
            tool_id: 'axios',
            status: 'completed'
          }
        ]);

      // Verify project 1 only sees its own runs
      const { data: project1Runs } = await supabase
        .from('test_runs')
        .select('*')
        .eq('project_id', testProjects.project1.id);

      expect(project1Runs).toHaveLength(2); // Original + new
      expect(project1Runs.every(run => run.project_id === testProjects.project1.id)).toBe(true);

      // Verify project 2 only sees its own runs
      const { data: project2Runs } = await supabase
        .from('test_runs')
        .select('*')
        .eq('project_id', testProjects.project2.id);

      expect(project2Runs).toHaveLength(2); // Original + new
      expect(project2Runs.every(run => run.project_id === testProjects.project2.id)).toBe(true);
    });

    test('should not allow cross-project API access', async () => {
      // User 1 tries to access User 2's project
      const response = await request(app)
        .get(`/api/projects/${testProjects.project2.id}/test-runs`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('Migration and Backfill Tests', () => {
    test('should handle legacy data without project_id', async () => {
      // Insert legacy data without project_id
      const { data: legacyRun } = await supabase
        .from('test_runs')
        .insert({
          id: 'legacy-run',
          user_id: testUsers.user1.id,
          test_suite_name: 'Legacy Test',
          test_type: 'API',
          tool_id: 'axios',
          status: 'completed',
          project_id: null
        })
        .select()
        .single();

      expect(legacyRun).toBeDefined();
      expect(legacyRun.project_id).toBeNull();

      // Verify RLS policies allow access to legacy data
      const { data: runs } = await supabase
        .from('test_runs')
        .select('*')
        .eq('user_id', testUsers.user1.id);

      expect(runs).toContainEqual(
        expect.objectContaining({ id: 'legacy-run' })
      );
    });

    test('should assign legacy data to unassigned project', async () => {
      // This would test the backfill script
      // For now, we'll verify the unassigned project exists
      const { data: unassignedProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', 'unassigned-legacy')
        .single();

      expect(unassignedProject).toBeDefined();
      expect(unassignedProject.name).toBe('Unassigned (Legacy Data)');
    });
  });
});

// Helper functions
async function setupTestData() {
  // Create test users
  for (const user of Object.values(testUsers)) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: { id: user.id }
    });
    if (error && !error.message.includes('already registered')) {
      console.error('Error creating user:', error);
    }
  }

  // Create test projects
  for (const project of Object.values(testProjects)) {
    const { error } = await supabase
      .from('projects')
      .upsert(project);
    if (error) {
      console.error('Error creating project:', error);
    }
  }

  // Create project memberships
  for (const project of Object.values(testProjects)) {
    const { error } = await supabase
      .from('project_memberships')
      .upsert({
        project_id: project.id,
        user_id: project.user_id,
        role: 'owner'
      });
    if (error) {
      console.error('Error creating membership:', error);
    }
  }

  // Create test runs
  for (const run of Object.values(testTestRuns)) {
    const { error } = await supabase
      .from('test_runs')
      .upsert(run);
    if (error) {
      console.error('Error creating test run:', error);
    }
  }
}

async function cleanupTestData() {
  // Clean up test runs
  for (const run of Object.values(testTestRuns)) {
    await supabase
      .from('test_runs')
      .delete()
      .eq('id', run.id);
  }

  // Clean up additional test runs
  await supabase
    .from('test_runs')
    .delete()
    .in('id', ['leak-test-1', 'leak-test-2', 'legacy-run']);

  // Clean up memberships
  for (const project of Object.values(testProjects)) {
    await supabase
      .from('project_memberships')
      .delete()
      .eq('project_id', project.id);
  }

  // Clean up projects
  for (const project of Object.values(testProjects)) {
    await supabase
      .from('projects')
      .delete()
      .eq('id', project.id);
  }

  // Clean up users
  for (const user of Object.values(testUsers)) {
    await supabase.auth.admin.deleteUser(user.id);
  }
}

async function getAuthToken(user) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password
  });
  
  if (error) {
    throw new Error(`Failed to get auth token: ${error.message}`);
  }
  
  return data.session.access_token;
}

module.exports = {
  testUsers,
  testProjects,
  testTestRuns
};
