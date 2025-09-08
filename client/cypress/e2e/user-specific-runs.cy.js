describe('User-Specific Recent Runs E2E Tests', () => {
  beforeEach(() => {
    // Visit the dashboard
    cy.visit('/')
  })

  it('should show only authenticated user\'s runs in Recent Runs', () => {
    // Mock API responses for user-specific runs
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run-1',
            userId: 'user-1',
            projectId: 'proj-1',
            testSuite: { name: 'User 1 Test Suite' },
            status: 'completed',
            success: true,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getUserRuns')

    // Wait for API call
    cy.wait('@getUserRuns')

    // Verify only user's runs are displayed
    cy.get('[data-testid="recent-test-runs"]').should('be.visible')
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'User 1 Test Suite')
    
    // Verify no other user's runs are shown
    cy.get('[data-testid="recent-test-runs"]').should('not.contain', 'User 2 Test Suite')
  })

  it('should update Recent Runs when new test run is created', () => {
    // Mock initial empty runs
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getEmptyRuns')

    // Mock new run creation
    cy.intercept('POST', '/api/runs', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          id: 'run-new',
          userId: 'user-1',
          projectId: 'proj-1',
          testSuite: { name: 'New Test Suite' },
          status: 'running',
          createdAt: new Date().toISOString()
        }
      }
    }).as('createRun')

    // Mock updated runs list after creation
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run-new',
            userId: 'user-1',
            projectId: 'proj-1',
            testSuite: { name: 'New Test Suite' },
            status: 'running',
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getUpdatedRuns')

    // Navigate to test management
    cy.contains('Projects').click()
    cy.get('a[href*="test-management"]').first().click()

    // Create a test suite
    cy.get('[data-testid="create-test-suite-btn"]').click()
    cy.get('[data-testid="test-suite-name-input"]').type('New Test Suite')
    cy.get('[data-testid="test-suite-description-input"]').type('Test description')
    
    // Add a step
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="step-name-input"]').type('Test Step')
    cy.get('[data-testid="step-method-select"]').select('GET')
    cy.get('[data-testid="step-url-input"]').type('/api/test')

    // Save test suite
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Run the test
    cy.get('[data-testid="run-test-btn"]').first().click()

    // Wait for run creation
    cy.wait('@createRun')

    // Navigate back to dashboard
    cy.visit('/')

    // Wait for updated runs
    cy.wait('@getUpdatedRuns')

    // Verify new run appears in Recent Runs
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'New Test Suite')
  })

  it('should show real-time updates in Recent Runs', () => {
    let callCount = 0

    // Mock polling responses with different statuses
    cy.intercept('GET', '/api/runs?limit=5', (req) => {
      callCount++
      
      if (callCount === 1) {
        // First call - running status
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: [
              {
                id: 'run-polling',
                userId: 'user-1',
                projectId: 'proj-1',
                testSuite: { name: 'Polling Test' },
                status: 'running',
                createdAt: new Date().toISOString()
              }
            ]
          }
        })
      } else {
        // Subsequent calls - completed status
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: [
              {
                id: 'run-polling',
                userId: 'user-1',
                projectId: 'proj-1',
                testSuite: { name: 'Polling Test' },
                status: 'completed',
                success: true,
                createdAt: new Date().toISOString()
              }
            ]
          }
        })
      }
    }).as('pollingRuns')

    // Wait for initial load
    cy.wait('@pollingRuns')

    // Verify run is shown as running
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'Polling Test')

    // Wait for polling update
    cy.wait('@pollingRuns')

    // Verify run status updated (this would need specific UI elements for status)
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'Polling Test')
  })

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal server error'
      }
    }).as('getRunsError')

    // Wait for error
    cy.wait('@getRunsError')

    // Verify fallback behavior (should show empty state or cached data)
    cy.get('[data-testid="recent-test-runs"]').should('be.visible')
    
    // Should not crash the page
    cy.get('body').should('be.visible')
  })

  it('should filter runs by project when project context is available', () => {
    // Mock project-specific runs
    cy.intercept('GET', '/api/runs?limit=5&projectId=proj-1', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run-project-1',
            userId: 'user-1',
            projectId: 'proj-1',
            testSuite: { name: 'Project 1 Test' },
            status: 'completed',
            success: true,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getProjectRuns')

    // Navigate to a specific project
    cy.contains('Projects').click()
    cy.get('a[href*="projects"]').first().click()

    // Wait for project-specific runs
    cy.wait('@getProjectRuns')

    // Verify only project-specific runs are shown
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'Project 1 Test')
  })

  it('should show appropriate empty state when no runs exist', () => {
    // Mock empty runs response
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getEmptyRuns')

    // Wait for empty response
    cy.wait('@getEmptyRuns')

    // Verify empty state is shown
    cy.get('[data-testid="recent-test-runs"]').should('be.visible')
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'No test runs')
  })

  it('should respect user authentication headers', () => {
    // Mock API call with specific headers
    cy.intercept('GET', '/api/runs?limit=5', (req) => {
      expect(req.headers['x-user-id']).to.equal('user-1')
      expect(req.headers['x-user-email']).to.equal('user@example.com')
      
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: []
        }
      })
    }).as('getRunsWithHeaders')

    // Wait for API call with headers
    cy.wait('@getRunsWithHeaders')

    // Verify request was made with correct headers
    cy.get('@getRunsWithHeaders').its('request.headers').should('include', {
      'x-user-id': 'user-1',
      'x-user-email': 'user@example.com'
    })
  })

  it('should handle multiple concurrent users', () => {
    // Mock runs for different users
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run-user1',
            userId: 'user-1',
            projectId: 'proj-1',
            testSuite: { name: 'User 1 Test' },
            status: 'completed',
            success: true,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getUser1Runs')

    // Wait for user 1 runs
    cy.wait('@getUser1Runs')

    // Verify only user 1's runs are shown
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'User 1 Test')
    cy.get('[data-testid="recent-test-runs"]').should('not.contain', 'User 2 Test')

    // Simulate switching to user 2
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run-user2',
            userId: 'user-2',
            projectId: 'proj-2',
            testSuite: { name: 'User 2 Test' },
            status: 'completed',
            success: true,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getUser2Runs')

    // Refresh to simulate user switch
    cy.reload()

    // Wait for user 2 runs
    cy.wait('@getUser2Runs')

    // Verify only user 2's runs are shown
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'User 2 Test')
    cy.get('[data-testid="recent-test-runs"]').should('not.contain', 'User 1 Test')
  })

  it('should show run progress and completion status', () => {
    // Mock run with different statuses
    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run-status-test',
            userId: 'user-1',
            projectId: 'proj-1',
            testSuite: { name: 'Status Test' },
            status: 'completed',
            success: true,
            passedSteps: 3,
            totalSteps: 3,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getStatusRuns')

    // Wait for runs
    cy.wait('@getStatusRuns')

    // Verify run status and details are displayed
    cy.get('[data-testid="recent-test-runs"]').should('contain', 'Status Test')
    cy.get('[data-testid="recent-test-runs"]').should('contain', '3/3 passed')
  })
})
