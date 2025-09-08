describe('General E2E Test - Executable Demo Runs', () => {
  beforeEach(() => {
    // Visit the home page first
    cy.visit('/')
  })

  it('should load the home page successfully', () => {
    cy.contains('SoftDeploy').should('be.visible')
    cy.url().should('include', '/')
  })

  it('should navigate to projects page', () => {
    cy.contains('Projects').click()
    cy.url().should('include', '/projects')
    cy.contains('Projects').should('be.visible')
  })

  it('should navigate to test management', () => {
    cy.contains('Projects').click()
    cy.url().should('include', '/projects')
    
    // Look for project cards or test management links
    cy.get('body').should('be.visible')
    
    // Try to find any clickable elements that might lead to test management
    cy.get('a, button').should('have.length.greaterThan', 0)
  })

  it('should be able to access test management for a project', () => {
    cy.contains('Projects').click()
    
    // Wait for projects to load
    cy.get('body').should('be.visible')
    
    // Look for project-specific test management links
    cy.get('a[href*="test-management"], button').first().click()
    
    // Should be on a test management page
    cy.url().should('include', 'test-management')
  })

  it('should show test suites if available', () => {
    cy.contains('Projects').click()
    
    // Navigate to test management
    cy.get('a[href*="test-management"]').first().click()
    
    // Look for test suite elements
    cy.get('body').should('contain.text', 'Test')
  })

  it('should be able to create a test suite', () => {
    cy.contains('Projects').click()
    
    // Navigate to test management
    cy.get('a[href*="test-management"]').first().click()
    
    // Look for create test suite button
    cy.get('button').should('contain.text', 'Create')
  })

  it('should handle API calls for test runs', () => {
    // Test the API endpoints directly
    cy.request('GET', '/api/sample-data/projects').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.data).to.be.an('array')
    })

    cy.request('GET', '/api/sample-data/testSuites').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.data).to.be.an('array')
    })
  })

  it('should be able to create a test run via API', () => {
    // First get sample data
    cy.request('GET', '/api/sample-data/testSuites').then((response) => {
      const testSuites = response.body.data
      expect(testSuites.length).to.be.greaterThan(0)
      
      const testSuite = testSuites[0]
      
      // Create a test run
      cy.request('POST', '/api/runs', {
        testSuite: testSuite,
        projectId: 'proj-1',
        userId: 'user-1'
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body.success).to.be.true
        expect(response.body.data.id).to.exist
        expect(response.body.data.status).to.eq('queued')
      })
    })
  })

  it('should be able to check test run status', () => {
    // Create a test run first
    cy.request('GET', '/api/sample-data/testSuites').then((response) => {
      const testSuite = response.body.data[0]
      
      cy.request('POST', '/api/runs', {
        testSuite: testSuite,
        projectId: 'proj-1',
        userId: 'user-1'
      }).then((createResponse) => {
        const runId = createResponse.body.data.id
        
        // Check run status
        cy.request('GET', `/api/runs/${runId}/status`).then((statusResponse) => {
          expect(statusResponse.status).to.eq(200)
          expect(statusResponse.body.success).to.be.true
          expect(statusResponse.body.data.id).to.eq(runId)
          expect(statusResponse.body.data.status).to.exist
        })
      })
    })
  })

  it('should be able to get test run logs', () => {
    // Create a test run first
    cy.request('GET', '/api/sample-data/testSuites').then((response) => {
      const testSuite = response.body.data[0]
      
      cy.request('POST', '/api/runs', {
        testSuite: testSuite,
        projectId: 'proj-1',
        userId: 'user-1'
      }).then((createResponse) => {
        const runId = createResponse.body.data.id
        
        // Wait a bit for the run to start
        cy.wait(2000)
        
        // Get run logs
        cy.request('GET', `/api/runs/${runId}/logs`).then((logsResponse) => {
          expect(logsResponse.status).to.eq(200)
          expect(logsResponse.body.success).to.be.true
          expect(logsResponse.body.data).to.be.an('array')
        })
      })
    })
  })

  it('should be able to list all test runs', () => {
    cy.request('GET', '/api/runs').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.data).to.be.an('array')
    })
  })

  it('should be able to get runs by project', () => {
    cy.request('GET', '/api/runs/project/proj-1').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.data).to.be.an('array')
    })
  })

  it('should handle error cases gracefully', () => {
    // Test non-existent run
    cy.request({
      method: 'GET',
      url: '/api/runs/non-existent',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.success).to.be.false
    })

    // Test invalid run creation
    cy.request({
      method: 'POST',
      url: '/api/runs',
      body: { invalid: 'data' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.success).to.be.false
    })
  })
})
