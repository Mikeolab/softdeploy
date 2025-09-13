// server/runs-user-access.api.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock fs and path before importing the routes
const mockFs = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  unlink: vi.fn(),
  rm: vi.fn()
}

const mockPath = {
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn(() => '/mock/dir'),
  resolve: vi.fn((...args) => args.join('/'))
}

const mockExec = vi.fn()

vi.mock('fs', () => ({ promises: mockFs }))
vi.mock('path', () => ({ default: mockPath }))
vi.mock('child_process', () => ({ exec: mockExec }))
vi.mock('util', () => ({ promisify: vi.fn(() => mockExec) }))

// Import after mocking
import runsRoutes from './routes/runs.js';

const app = express();
app.use(express.json());
app.use('/api/runs', runsRoutes);

describe('Runs API - User Access Control', () => {
  const mockUser1 = 'user-1';
  const mockUser2 = 'user-2';
  const mockProject1 = 'proj-1';
  const mockProject2 = 'proj-2';

  const mockTestSuite = {
    name: 'Test Suite',
    steps: [
      { name: 'Step 1', method: 'GET', url: '/api/test' }
    ]
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock file operations - return empty runs array initially
    mockFs.readFile.mockResolvedValue('[]')
    mockFs.writeFile.mockResolvedValue(undefined)
    mockFs.mkdir.mockResolvedValue(undefined)
    mockFs.readdir.mockResolvedValue([])
    mockFs.unlink.mockResolvedValue(undefined)
    mockFs.rm.mockResolvedValue(undefined)
    
    // Mock exec for Cypress
    mockExec.mockResolvedValue({
      stdout: 'Cypress test output',
      stderr: '',
      code: 0
    })
  });

  describe('POST /api/runs - Create Run', () => {
    it('should create a run with user ID from headers', async () => {
      const response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(mockUser1);
      expect(response.body.data.projectId).toBe(mockProject1);
    });

    it('should reject request without user ID', async () => {
      const response = await request(app)
        .post('/api/runs')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User ID is required');
    });

    it('should reject request with missing required fields', async () => {
      const response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite
          // Missing projectId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/runs - List Runs', () => {
    beforeEach(async () => {
      // Create test runs for both users
      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });
    });

    it('should only return runs for authenticated user', async () => {
      const response = await request(app)
        .get('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(mockUser1);
    });

    it('should not return runs from other users', async () => {
      const response = await request(app)
        .get('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(mockUser2);
      
      // Ensure no runs from user1 are returned
      const user1Runs = response.body.data.filter(run => run.userId === mockUser1);
      expect(user1Runs).toHaveLength(0);
    });

    it('should filter runs by project for authenticated user', async () => {
      // Create another run for user1 with different project
      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });

      const response = await request(app)
        .get(`/api/runs?projectId=${mockProject1}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].projectId).toBe(mockProject1);
      expect(response.body.data[0].userId).toBe(mockUser1);
    });
  });

  describe('GET /api/runs/:id - Get Specific Run', () => {
    let user1RunId;
    let user2RunId;

    beforeEach(async () => {
      // Create runs for both users
      const user1Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      const user2Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });

      user1RunId = user1Response.body.data.id;
      user2RunId = user2Response.body.data.id;
    });

    it('should allow user to access their own run', async () => {
      const response = await request(app)
        .get(`/api/runs/${user1RunId}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user1RunId);
      expect(response.body.data.userId).toBe(mockUser1);
    });

    it('should deny access to other user\'s run', async () => {
      const response = await request(app)
        .get(`/api/runs/${user2RunId}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    it('should return 404 for non-existent run', async () => {
      const response = await request(app)
        .get('/api/runs/non-existent-id')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Run not found');
    });
  });

  describe('GET /api/runs/project/:projectId - Get Runs by Project', () => {
    beforeEach(async () => {
      // Create runs for user1 in different projects
      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });

      // Create run for user2 in project1
      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });
    });

    it('should only return user\'s runs for specific project', async () => {
      const response = await request(app)
        .get(`/api/runs/project/${mockProject1}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(mockUser1);
      expect(response.body.data[0].projectId).toBe(mockProject1);
    });

    it('should not return other users\' runs for same project', async () => {
      const response = await request(app)
        .get(`/api/runs/project/${mockProject1}`)
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(mockUser2);
      
      // Ensure no runs from user1 are returned
      const user1Runs = response.body.data.filter(run => run.userId === mockUser1);
      expect(user1Runs).toHaveLength(0);
    });
  });

  describe('GET /api/runs/user/:userId - Get Runs by User', () => {
    beforeEach(async () => {
      // Create runs for both users
      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });
    });

    it('should allow user to access their own runs', async () => {
      const response = await request(app)
        .get(`/api/runs/user/${mockUser1}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(mockUser1);
    });

    it('should deny access to other user\'s runs', async () => {
      const response = await request(app)
        .get(`/api/runs/user/${mockUser2}`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('POST /api/runs/:id/stop - Stop Run', () => {
    let user1RunId;
    let user2RunId;

    beforeEach(async () => {
      // Create runs for both users
      const user1Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      const user2Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });

      user1RunId = user1Response.body.data.id;
      user2RunId = user2Response.body.data.id;
    });

    it('should allow user to stop their own run', async () => {
      const response = await request(app)
        .post(`/api/runs/${user1RunId}/stop`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user1RunId);
    });

    it('should deny user from stopping other user\'s run', async () => {
      const response = await request(app)
        .post(`/api/runs/${user2RunId}/stop`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('GET /api/runs/:id/artifacts - Get Run Artifacts', () => {
    let user1RunId;
    let user2RunId;

    beforeEach(async () => {
      // Create runs for both users
      const user1Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      const user2Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });

      user1RunId = user1Response.body.data.id;
      user2RunId = user2Response.body.data.id;
    });

    it('should allow user to access their own run artifacts', async () => {
      const response = await request(app)
        .get(`/api/runs/${user1RunId}/artifacts`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('artifacts');
      expect(response.body.data).toHaveProperty('logs');
    });

    it('should deny access to other user\'s run artifacts', async () => {
      const response = await request(app)
        .get(`/api/runs/${user2RunId}/artifacts`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('GET /api/runs/:id/logs - Get Run Logs', () => {
    let user1RunId;
    let user2RunId;

    beforeEach(async () => {
      // Create runs for both users
      const user1Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject1
        });

      const user2Response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', mockUser2)
        .set('X-User-Email', 'user2@example.com')
        .send({
          testSuite: mockTestSuite,
          projectId: mockProject2
        });

      user1RunId = user1Response.body.data.id;
      user2RunId = user2Response.body.data.id;
    });

    it('should allow user to access their own run logs', async () => {
      const response = await request(app)
        .get(`/api/runs/${user1RunId}/logs`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should deny access to other user\'s run logs', async () => {
      const response = await request(app)
        .get(`/api/runs/${user2RunId}/logs`)
        .set('X-User-Id', mockUser1)
        .set('X-User-Email', 'user1@example.com');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });
});
