import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock fs and path before importing the routes
const mockFs = {
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => true)
}

const mockPath = {
  join: vi.fn((...args) => args.join('/'))
}

vi.mock('fs', () => ({ default: mockFs }))
vi.mock('path', () => ({ default: mockPath }))

// Import after mocking
import sampleDataRoutes from './routes/sampleData.js'

// Create test app
const app = express()
app.use(express.json())
app.use('/api/sample-data', sampleDataRoutes)

// Mock the sample data file with actual fixture data
const mockSampleData = {
  users: [
    {
      "id": "user-1",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "admin",
      "created_at": "2024-01-15T10:00:00Z",
      "last_login": "2024-01-20T14:30:00Z"
    },
    {
      "id": "user-2", 
      "email": "jane.smith@example.com",
      "name": "Jane Smith",
      "role": "developer",
      "created_at": "2024-01-16T09:15:00Z",
      "last_login": "2024-01-20T16:45:00Z"
    },
    {
      "id": "user-3",
      "email": "mike.wilson@example.com", 
      "name": "Mike Wilson",
      "role": "tester",
      "created_at": "2024-01-17T11:20:00Z",
      "last_login": "2024-01-19T13:15:00Z"
    }
  ],
  projects: [
    {
      "id": "proj-1",
      "name": "E-commerce Platform",
      "description": "Full-stack e-commerce application with payment processing",
      "environment": "development",
      "user_id": "user-1",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T14:30:00Z",
      "status": "active"
    },
    {
      "id": "proj-2",
      "name": "TestLab API",
      "description": "RESTful API for test management and execution",
      "environment": "staging", 
      "user_id": "user-2",
      "created_at": "2024-01-16T09:15:00Z",
      "updated_at": "2024-01-20T16:45:00Z",
      "status": "active"
    },
    {
      "id": "proj-3",
      "name": "New Project",
      "description": "Fresh project for testing new features",
      "environment": "development",
      "user_id": "user-3", 
      "created_at": "2024-01-17T11:20:00Z",
      "updated_at": "2024-01-19T13:15:00Z",
      "status": "active"
    }
  ],
  testSuites: [
    {
      "id": "suite-1",
      "name": "Payment Processing Tests",
      "description": "Test suite for payment gateway integration",
      "project_id": "proj-1",
      "test_type": "API",
      "tool_id": "postman",
      "base_url": "https://api.ecommerce.com",
      "steps": [
        {
          "id": "step-1",
          "name": "Validate Payment Request",
          "method": "POST",
          "url": "/payments/validate",
          "headers": {"Content-Type": "application/json"},
          "body": {"amount": 100, "currency": "USD"},
          "expected_status": 200
        },
        {
          "id": "step-2", 
          "name": "Process Payment",
          "method": "POST",
          "url": "/payments/process",
          "headers": {"Content-Type": "application/json"},
          "body": {"amount": 100, "currency": "USD", "token": "test_token"},
          "expected_status": 201
        }
      ],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    },
    {
      "id": "suite-2",
      "name": "API Endpoints Tests", 
      "description": "Test suite for core API functionality",
      "project_id": "proj-2",
      "test_type": "API",
      "tool_id": "rest",
      "base_url": "https://api.testlab.com",
      "steps": [
        {
          "id": "step-3",
          "name": "Health Check",
          "method": "GET", 
          "url": "/health",
          "expected_status": 200
        },
        {
          "id": "step-4",
          "name": "Authentication Test",
          "method": "POST",
          "url": "/auth/login",
          "headers": {"Content-Type": "application/json"},
          "body": {"username": "test", "password": "test"},
          "expected_status": 200
        }
      ],
      "created_at": "2024-01-16T09:45:00Z",
      "updated_at": "2024-01-20T16:45:00Z"
    },
    {
      "id": "suite-3",
      "name": "Core Features Tests",
      "description": "Test suite for basic application features", 
      "project_id": "proj-3",
      "test_type": "UI",
      "tool_id": "playwright",
      "base_url": "https://app.newproject.com",
      "steps": [
        {
          "id": "step-5",
          "name": "Login Flow",
          "method": "GET",
          "url": "/login",
          "expected_status": 200
        },
        {
          "id": "step-6",
          "name": "Dashboard Access",
          "method": "GET", 
          "url": "/dashboard",
          "expected_status": 200
        }
      ],
      "created_at": "2024-01-17T11:50:00Z",
      "updated_at": "2024-01-19T13:15:00Z"
    }
  ],
  testRuns: [
    {
      "id": "run-1",
      "test_suite_id": "suite-1",
      "project_id": "proj-1",
      "user_id": "user-1",
      "status": "completed",
      "total_steps": 2,
      "passed_steps": 2,
      "failed_steps": 0,
      "total_time": 1250,
      "created_at": "2024-01-20T10:00:00Z",
      "executed_at": "2024-01-20T10:00:00Z",
      "results": {
        "success": true,
        "summary": {
          "total": 2,
          "passed": 2,
          "failed": 0,
          "duration": 1250
        }
      }
    },
    {
      "id": "run-2", 
      "test_suite_id": "suite-2",
      "project_id": "proj-2",
      "user_id": "user-2",
      "status": "completed",
      "total_steps": 2,
      "passed_steps": 1,
      "failed_steps": 1,
      "total_time": 2100,
      "created_at": "2024-01-20T11:30:00Z",
      "executed_at": "2024-01-20T11:30:00Z",
      "results": {
        "success": false,
        "summary": {
          "total": 2,
          "passed": 1,
          "failed": 1,
          "duration": 2100
        }
      }
    },
    {
      "id": "run-3",
      "test_suite_id": "suite-3", 
      "project_id": "proj-3",
      "user_id": "user-3",
      "status": "completed",
      "total_steps": 2,
      "passed_steps": 2,
      "failed_steps": 0,
      "total_time": 1800,
      "created_at": "2024-01-20T13:15:00Z",
      "executed_at": "2024-01-20T13:15:00Z",
      "results": {
        "success": true,
        "summary": {
          "total": 2,
          "passed": 2,
          "failed": 0,
          "duration": 1800
        }
      }
    }
  ],
  localStorage: {
    testRunsV2: [
      {
        "id": "run-1",
        "projectId": "proj-1",
        "testSuite": {
          "name": "Payment Processing Tests",
          "description": "Test suite for payment gateway integration"
        },
        "success": true,
        "totalSteps": 2,
        "passedSteps": 2,
        "failedSteps": 0,
        "totalTime": 1250,
        "executedAt": "2024-01-20T10:00:00Z",
        "timestamp": 1705744800000,
        "user_id": "user-1"
      },
      {
        "id": "run-2",
        "projectId": "proj-2",
        "testSuite": {
          "name": "API Endpoints Tests",
          "description": "Test suite for core API functionality"
        },
        "success": false,
        "totalSteps": 2,
        "passedSteps": 1,
        "failedSteps": 1,
        "totalTime": 2100,
        "executedAt": "2024-01-20T11:30:00Z",
        "timestamp": 1705750200000,
        "user_id": "user-2"
      },
      {
        "id": "run-3",
        "projectId": "proj-3",
        "testSuite": {
          "name": "Core Features Tests",
          "description": "Test suite for basic application features"
        },
        "success": true,
        "totalSteps": 2,
        "passedSteps": 2,
        "failedSteps": 0,
        "totalTime": 1800,
        "executedAt": "2024-01-20T13:15:00Z",
        "timestamp": 1705756500000,
        "user_id": "user-3"
      }
    ],
    testResultsV2: [
      {
        "id": "run-1",
        "testSuite": "Payment Processing Tests",
        "testType": "API",
        "toolId": "postman",
        "success": true,
        "totalSteps": 2,
        "passedSteps": 2,
        "failedSteps": 0,
        "totalTime": 1250,
        "executedAt": "2024-01-20T10:00:00Z",
        "summary": {
          "total": 2,
          "passed": 2,
          "failed": 0,
          "duration": 1250
        }
      },
      {
        "id": "run-2",
        "testSuite": "API Endpoints Tests",
        "testType": "API",
        "toolId": "rest",
        "success": false,
        "totalSteps": 2,
        "passedSteps": 1,
        "failedSteps": 1,
        "totalTime": 2100,
        "executedAt": "2024-01-20T11:30:00Z",
        "summary": {
          "total": 2,
          "passed": 1,
          "failed": 1,
          "duration": 2100
        }
      },
      {
        "id": "run-3",
        "testSuite": "Core Features Tests",
        "testType": "UI",
        "toolId": "playwright",
        "success": true,
        "totalSteps": 2,
        "passedSteps": 2,
        "failedSteps": 0,
        "totalTime": 1800,
        "executedAt": "2024-01-20T13:15:00Z",
        "summary": {
          "total": 2,
          "passed": 2,
          "failed": 0,
          "duration": 1800
        }
      }
    ]
  }
}

describe('Sample Data API', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock file reading
    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSampleData))
    mockFs.writeFileSync.mockReturnValue(undefined)
  })

  describe('GET /api/sample-data/:type', () => {
    it('should return users data', async () => {
      const response = await request(app)
        .get('/api/sample-data/users')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.users)
    })

    it('should return projects data', async () => {
      const response = await request(app)
        .get('/api/sample-data/projects')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.projects)
    })

    it('should return testSuites data', async () => {
      const response = await request(app)
        .get('/api/sample-data/testSuites')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.testSuites)
    })

    it('should return testRuns data', async () => {
      const response = await request(app)
        .get('/api/sample-data/testRuns')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.testRuns)
    })

    it('should return localStorage data', async () => {
      const response = await request(app)
        .get('/api/sample-data/localStorage')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.localStorage)
    })

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .get('/api/sample-data/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid type')
    })

    it('should return 500 when file read fails', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error')
      })

      const response = await request(app)
        .get('/api/sample-data/users')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to load sample data')
    })
  })

  describe('PUT /api/sample-data/:type', () => {
    it('should update users data', async () => {
      const newUsers = [
        { id: 'user-1', email: 'updated@example.com', name: 'Updated User', role: 'admin' }
      ]

      const response = await request(app)
        .put('/api/sample-data/users')
        .send({ data: newUsers })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Successfully updated users')
      expect(response.body.data).toEqual(newUsers)
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should update projects data', async () => {
      const newProjects = [
        { id: 'proj-1', name: 'Updated Project', description: 'Updated Description', environment: 'production' }
      ]

      const response = await request(app)
        .put('/api/sample-data/projects')
        .send({ data: newProjects })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(newProjects)
    })

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .put('/api/sample-data/invalid')
        .send({ data: [] })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid type')
    })

    it('should return 400 for non-array data', async () => {
      const response = await request(app)
        .put('/api/sample-data/users')
        .send({ data: 'not an array' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Data must be an array')
    })

    it('should return 500 when file write fails', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error')
      })

      const response = await request(app)
        .put('/api/sample-data/users')
        .send({ data: [] })
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to save sample data')
    })
  })

  describe('POST /api/sample-data/:type', () => {
    it('should add new user', async () => {
      const newUser = {
        email: 'new@example.com',
        name: 'New User',
        role: 'developer'
      }

      const response = await request(app)
        .post('/api/sample-data/users')
        .send(newUser)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Successfully added new users')
      expect(response.body.data).toMatchObject(newUser)
      expect(response.body.data.id).toBeDefined()
      expect(response.body.data.created_at).toBeDefined()
      expect(response.body.data.updated_at).toBeDefined()
    })

    it('should add new project', async () => {
      const newProject = {
        name: 'New Project',
        description: 'New Project Description',
        environment: 'development'
      }

      const response = await request(app)
        .post('/api/sample-data/projects')
        .send(newProject)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject(newProject)
    })

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/sample-data/invalid')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid type')
    })
  })

  describe('DELETE /api/sample-data/:type/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete('/api/sample-data/users/user-1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Successfully deleted users with id user-1')
      expect(response.body.data).toEqual(mockSampleData.users[0])
    })

    it('should delete project', async () => {
      const response = await request(app)
        .delete('/api/sample-data/projects/proj-1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.projects[0])
    })

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/sample-data/users/non-existent')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('not found')
    })

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .delete('/api/sample-data/invalid/id')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid type')
    })
  })
})