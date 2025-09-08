import { describe, it, expect, beforeEach } from 'vitest'
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
import testSuitesRoutes from './routes/testSuites.js'

// Create test app
const app = express()
app.use(express.json())
app.use('/api/suites', testSuitesRoutes)

// Mock sample data
const mockSampleData = {
  testSuites: [
    {
      id: 'suite-1',
      name: 'Payment Processing Tests',
      description: 'Test suite for payment gateway integration',
      project_id: 'proj-1',
      test_type: 'API',
      tool_id: 'postman',
      base_url: 'https://api.ecommerce.com',
      environment: 'development',
      steps: [
        {
          id: 'step-1',
          name: 'Validate Payment Request',
          method: 'POST',
          url: '/payments/validate',
          headers: { 'Content-Type': 'application/json' },
          body: { amount: 100, currency: 'USD' },
          expected_status: 200
        }
      ],
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: 'suite-2',
      name: 'API Endpoints Tests',
      description: 'Test suite for core API functionality',
      project_id: 'proj-2',
      test_type: 'API',
      tool_id: 'rest',
      base_url: 'https://api.testlab.com',
      environment: 'staging',
      steps: [
        {
          id: 'step-2',
          name: 'Health Check',
          method: 'GET',
          url: '/health',
          expected_status: 200
        }
      ],
      created_at: '2024-01-16T09:45:00Z',
      updated_at: '2024-01-20T16:45:00Z'
    }
  ]
}

describe('Test Suites API', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock file reading
    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSampleData))
    mockFs.writeFileSync.mockReturnValue(undefined)
  })

  describe('GET /api/suites', () => {
    it('should return all test suites', async () => {
      const response = await request(app)
        .get('/api/suites')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.testSuites)
    })

    it('should return 500 when file read fails', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error')
      })

      const response = await request(app)
        .get('/api/suites')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to load sample data')
    })
  })

  describe('GET /api/suites/:id', () => {
    it('should return specific test suite', async () => {
      const response = await request(app)
        .get('/api/suites/suite-1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockSampleData.testSuites[0])
    })

    it('should return 404 for non-existent test suite', async () => {
      const response = await request(app)
        .get('/api/suites/non-existent')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Test suite not found')
    })
  })

  describe('POST /api/suites', () => {
    it('should create new test suite', async () => {
      const newTestSuite = {
        name: 'New Test Suite',
        description: 'A new test suite',
        projectId: 'proj-1',
        testType: 'API',
        toolId: 'axios',
        baseUrl: 'https://api.example.com',
        environment: 'development',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            method: 'GET',
            url: '/test',
            expected_status: 200
          }
        ]
      }

      const response = await request(app)
        .post('/api/suites')
        .send(newTestSuite)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Test suite created successfully')
      expect(response.body.data.name).toBe('New Test Suite')
      expect(response.body.data.id).toBeDefined()
      expect(response.body.data.created_at).toBeDefined()
      expect(response.body.data.updated_at).toBeDefined()
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteTestSuite = {
        name: 'Test Suite',
        // Missing projectId and baseUrl
      }

      const response = await request(app)
        .post('/api/suites')
        .send(incompleteTestSuite)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Missing required fields: name, projectId, baseUrl')
    })

    it('should return 500 when file write fails', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error')
      })

      const newTestSuite = {
        name: 'Test Suite',
        projectId: 'proj-1',
        baseUrl: 'https://api.example.com',
        steps: []
      }

      const response = await request(app)
        .post('/api/suites')
        .send(newTestSuite)
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to save test suite')
    })
  })

  describe('PUT /api/suites/:id', () => {
    it('should update existing test suite', async () => {
      const updateData = {
        name: 'Updated Test Suite',
        description: 'Updated description',
        baseUrl: 'https://api.updated.com'
      }

      const response = await request(app)
        .put('/api/suites/suite-1')
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Test suite updated successfully')
      expect(response.body.data.name).toBe('Updated Test Suite')
      expect(response.body.data.description).toBe('Updated description')
      expect(response.body.data.base_url).toBe('https://api.updated.com')
      expect(response.body.data.updated_at).toBeDefined()
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should return 404 for non-existent test suite', async () => {
      const updateData = {
        name: 'Updated Test Suite'
      }

      const response = await request(app)
        .put('/api/suites/non-existent')
        .send(updateData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Test suite not found')
    })

    it('should preserve ID when updating', async () => {
      const updateData = {
        name: 'Updated Test Suite'
      }

      const response = await request(app)
        .put('/api/suites/suite-1')
        .send(updateData)
        .expect(200)

      expect(response.body.data.id).toBe('suite-1')
    })
  })

  describe('DELETE /api/suites/:id', () => {
    it('should delete test suite', async () => {
      const response = await request(app)
        .delete('/api/suites/suite-1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Test suite deleted successfully')
      expect(response.body.data.id).toBe('suite-1')
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should return 404 for non-existent test suite', async () => {
      const response = await request(app)
        .delete('/api/suites/non-existent')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Test suite not found')
    })
  })
})
