import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

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
import runsRoutes from './routes/runs.js'

// Create test app
const app = express()
app.use(express.json())
app.use('/api/runs', runsRoutes)

// Mock sample test suite
const mockTestSuite = {
  id: 'suite-1',
  name: 'Sample API Tests',
  description: 'Test suite for API endpoints',
  testType: 'API',
  toolId: 'axios',
  baseUrl: 'https://api.example.com',
  environment: 'development',
  steps: [
    {
      id: 'step-1',
      name: 'Health Check',
      type: 'api',
      description: 'Check API health endpoint',
      config: {
        method: 'GET',
        url: '/health',
        expectedStatus: 200
      }
    },
    {
      id: 'step-2',
      name: 'User Login',
      type: 'api',
      description: 'Test user login endpoint',
      config: {
        method: 'POST',
        url: '/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: { username: 'test', password: 'test' },
        expectedStatus: 200
      }
    }
  ]
}

describe('Runs API', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock file operations
    mockFs.readFile.mockResolvedValue('[]') // Empty runs array
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
  })

  describe('POST /api/runs', () => {
    it('should create a new test run', async () => {
      const runData = {
        testSuite: mockTestSuite,
        projectId: 'proj-1',
        userId: 'user-1'
      }

      const response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .send(runData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Test run created successfully')
      expect(response.body.data.id).toBeDefined()
      expect(response.body.data.testSuiteId).toBe('suite-1')
      expect(response.body.data.projectId).toBe('proj-1')
      expect(response.body.data.userId).toBe('user-1')
      expect(response.body.data.status).toBe('queued')
      expect(response.body.data.testSuite).toEqual(mockTestSuite)
      expect(response.body.data.results.totalSteps).toBe(2)
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        testSuite: mockTestSuite
        // Missing projectId and userId
      }

      const response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .send(incompleteData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Missing required fields: testSuite, projectId')
    })

    it('should return 400 for invalid test suite', async () => {
      const invalidData = {
        testSuite: {
          name: 'Test Suite'
          // Missing steps
        },
        projectId: 'proj-1',
        userId: 'user-1'
      }

      const response = await request(app)
        .post('/api/runs')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid test suite: must have name and at least one step')
    })
  })

  describe('GET /api/runs', () => {
    it('should return all runs', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          testSuiteId: 'suite-1',
          projectId: 'proj-1',
          userId: 'user-1',
          status: 'completed',
          createdAt: '2024-01-20T10:00:00Z',
          results: { totalSteps: 2, passedSteps: 2, failedSteps: 0 }
        },
        {
          id: 'run-2',
          testSuiteId: 'suite-2',
          projectId: 'proj-1',
          userId: 'user-1',
          status: 'running',
          createdAt: '2024-01-20T11:00:00Z',
          results: { totalSteps: 1, passedSteps: 0, failedSteps: 0 }
        }
      ]

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockRuns))

      const response = await request(app)
        .get('/api/runs')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockRuns)
      expect(response.body.pagination.total).toBe(2)
    })

    it('should filter runs by project', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          projectId: 'proj-1',
          status: 'completed'
        },
        {
          id: 'run-2',
          projectId: 'proj-2',
          status: 'completed'
        }
      ]

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockRuns))

      const response = await request(app)
        .get('/api/runs?projectId=proj-1')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].projectId).toBe('proj-1')
    })

    it('should filter runs by status', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          status: 'completed'
        },
        {
          id: 'run-2',
          status: 'running'
        }
      ]

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockRuns))

      const response = await request(app)
        .get('/api/runs?status=completed')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].status).toBe('completed')
    })

    it('should apply pagination', async () => {
      const mockRuns = Array.from({ length: 10 }, (_, i) => ({
        id: `run-${i + 1}`,
        status: 'completed'
      }))

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockRuns))

      const response = await request(app)
        .get('/api/runs?limit=5&offset=0')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(5)
      expect(response.body.pagination.total).toBe(10)
      expect(response.body.pagination.hasMore).toBe(true)
    })
  })

  describe('GET /api/runs/:id', () => {
    it('should return specific run', async () => {
      const mockRun = {
        id: 'run-1',
        testSuiteId: 'suite-1',
        projectId: 'proj-1',
        userId: 'user-1',
        status: 'completed',
        createdAt: '2024-01-20T10:00:00Z',
        results: { totalSteps: 2, passedSteps: 2, failedSteps: 0 }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify([mockRun]))

      const response = await request(app)
        .get('/api/runs/run-1')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockRun)
    })

    it('should return 404 for non-existent run', async () => {
      mockFs.readFile.mockResolvedValue('[]')

      const response = await request(app)
        .get('/api/runs/non-existent')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Run not found')
    })
  })

  describe('GET /api/runs/:id/status', () => {
    it('should return run status', async () => {
      const mockRun = {
        id: 'run-1',
        status: 'running',
        startedAt: '2024-01-20T10:00:00Z',
        testSuite: { steps: [{}, {}] },
        results: { steps: [{}] }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify([mockRun]))

      const response = await request(app)
        .get('/api/runs/run-1/status')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe('run-1')
      expect(response.body.data.status).toBe('running')
      expect(response.body.data.progress).toBeDefined()
    })

    it('should return 404 for non-existent run status', async () => {
      mockFs.readFile.mockResolvedValue('[]')

      const response = await request(app)
        .get('/api/runs/non-existent/status')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Run not found')
    })
  })

  describe('POST /api/runs/:id/stop', () => {
    it('should stop a running test', async () => {
      const mockRun = {
        id: 'run-1',
        status: 'running',
        startedAt: '2024-01-20T10:00:00Z',
        logs: []
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify([mockRun]))

      const response = await request(app)
        .post('/api/runs/run-1/stop')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Test run stopped successfully')
      expect(response.body.data.status).toBe('stopped')
    })

    it('should return 404 for non-existent run', async () => {
      mockFs.readFile.mockResolvedValue('[]')

      const response = await request(app)
        .post('/api/runs/non-existent/stop')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/runs/project/:projectId', () => {
    it('should return runs by project', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          projectId: 'proj-1',
          status: 'completed'
        },
        {
          id: 'run-2',
          projectId: 'proj-2',
          status: 'completed'
        }
      ]

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockRuns))

      const response = await request(app)
        .get('/api/runs/project/proj-1')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].projectId).toBe('proj-1')
    })
  })

  describe('GET /api/runs/user/:userId', () => {
    it('should return runs by user', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          userId: 'user-1',
          status: 'completed'
        },
        {
          id: 'run-2',
          userId: 'user-2',
          status: 'completed'
        }
      ]

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockRuns))

      const response = await request(app)
        .get('/api/runs/user/user-1')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].userId).toBe('user-1')
    })
  })

  describe('GET /api/runs/:id/artifacts', () => {
    it('should return run artifacts', async () => {
      const mockRun = {
        id: 'run-1',
        artifacts: {
          screenshots: ['screenshot1.png'],
          videos: ['video1.mp4']
        },
        logs: [
          { timestamp: '2024-01-20T10:00:00Z', level: 'info', message: 'Test started' }
        ]
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify([mockRun]))

      const response = await request(app)
        .get('/api/runs/run-1/artifacts')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.artifacts).toEqual(mockRun.artifacts)
      expect(response.body.data.logs).toEqual(mockRun.logs)
    })
  })

  describe('GET /api/runs/:id/logs', () => {
    it('should return run logs', async () => {
      const mockRun = {
        id: 'run-1',
        logs: [
          { timestamp: '2024-01-20T10:00:00Z', level: 'info', message: 'Test started' },
          { timestamp: '2024-01-20T10:01:00Z', level: 'error', message: 'Test failed' }
        ]
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify([mockRun]))

      const response = await request(app)
        .get('/api/runs/run-1/logs')
        .set('X-User-Id', 'user-1')
        .set('X-User-Email', 'user1@example.com')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockRun.logs)
    })
  })
})
