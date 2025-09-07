import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'

// Create a simple test app
const app = express()
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

describe('API Health Endpoint', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200)

    expect(response.body.status).toBe('OK')
    expect(response.body.timestamp).toBeDefined()
  })
})