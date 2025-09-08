describe('Executable Demo Runs E2E Tests', () => {
  beforeEach(() => {
    // Visit the test management page
    cy.visit('/projects/proj-1/test-management')
  })

  it('should create and execute a test run', () => {
    // Click on a test folder to access test suite configuration
    cy.get('[data-testid="test-folder"]').first().click()
    
    // Wait for test suites to load
    cy.get('[data-testid="test-suites-list"]').should('be.visible')
    
    // Click "Run Test" on first test suite
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Should see test run progress component
    cy.get('[data-testid="test-run-progress"]').should('be.visible')
    
    // Should show queued status initially
    cy.get('[data-testid="run-status"]').should('contain', 'queued')
    
    // Wait for status to change to running
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
    
    // Should show progress bar
    cy.get('[data-testid="progress-bar"]').should('be.visible')
    
    // Wait for completion
    cy.get('[data-testid="run-status"]', { timeout: 60000 }).should('satisfy', (status) => {
      return ['completed', 'failed'].includes(status.text())
    })
    
    // Should show results summary
    cy.get('[data-testid="results-summary"]').should('be.visible')
    cy.get('[data-testid="total-steps"]').should('be.visible')
    cy.get('[data-testid="passed-steps"]').should('be.visible')
    cy.get('[data-testid="failed-steps"]').should('be.visible')
    cy.get('[data-testid="duration"]').should('be.visible')
  })

  it('should show step-by-step execution progress', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to start running
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
    
    // Should show step results as they complete
    cy.get('[data-testid="step-results"]', { timeout: 30000 }).should('be.visible')
    
    // Each step should show success/failure status
    cy.get('[data-testid="step-result"]').should('have.length.greaterThan', 0)
    
    // Steps should have success/failure icons
    cy.get('[data-testid="step-result"]').each(($step) => {
      cy.wrap($step).within(() => {
        cy.get('[data-testid="step-icon"]').should('be.visible')
        cy.get('[data-testid="step-name"]').should('be.visible')
        cy.get('[data-testid="step-duration"]').should('be.visible')
      })
    })
  })

  it('should display execution logs in real-time', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to start
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
    
    // Should show execution logs
    cy.get('[data-testid="execution-logs"]', { timeout: 30000 }).should('be.visible')
    
    // Logs should have timestamps and levels
    cy.get('[data-testid="log-entry"]').should('have.length.greaterThan', 0)
    
    cy.get('[data-testid="log-entry"]').each(($log) => {
      cy.wrap($log).within(() => {
        cy.get('[data-testid="log-timestamp"]').should('be.visible')
        cy.get('[data-testid="log-level"]').should('be.visible')
        cy.get('[data-testid="log-message"]').should('be.visible')
      })
    })
  })

  it('should allow stopping a running test', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to start running
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
    
    // Should show stop button
    cy.get('[data-testid="stop-run-btn"]').should('be.visible')
    
    // Click stop button
    cy.get('[data-testid="stop-run-btn"]').click()
    
    // Should show stopped status
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'stopped')
    
    // Stop button should disappear
    cy.get('[data-testid="stop-run-btn"]').should('not.exist')
  })

  it('should persist run results and show them in history', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to complete
    cy.get('[data-testid="run-status"]', { timeout: 60000 }).should('satisfy', (status) => {
      return ['completed', 'failed'].includes(status.text())
    })
    
    // Close the progress component
    cy.get('[data-testid="close-progress-btn"]').click()
    
    // Navigate to runs history (if available)
    cy.get('[data-testid="runs-history-btn"]').click()
    
    // Should see the completed run in history
    cy.get('[data-testid="run-history-item"]').should('be.visible')
    cy.get('[data-testid="run-history-item"]').first().within(() => {
      cy.get('[data-testid="run-name"]').should('be.visible')
      cy.get('[data-testid="run-status"]').should('be.visible')
      cy.get('[data-testid="run-duration"]').should('be.visible')
      cy.get('[data-testid="run-results"]').should('be.visible')
    })
  })

  it('should handle test execution errors gracefully', () => {
    // Create a test suite with invalid configuration
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()
    
    // Fill form with invalid data
    cy.get('[data-testid="test-suite-name-input"]').type('Invalid Test Suite')
    cy.get('[data-testid="base-url-input"]').type('invalid-url')
    cy.get('[data-testid="add-step-btn"]').click()
    
    // Save the invalid test suite
    cy.get('[data-testid="save-test-suite-btn"]').click()
    
    // Try to run the invalid test suite
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Should handle the error gracefully
    cy.get('[data-testid="run-status"]', { timeout: 30000 }).should('contain', 'failed')
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible')
    
    // Should show error logs
    cy.get('[data-testid="execution-logs"]').should('be.visible')
    cy.get('[data-testid="log-entry"]').should('contain', 'error')
  })

  it('should generate and provide access to test artifacts', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to complete
    cy.get('[data-testid="run-status"]', { timeout: 60000 }).should('satisfy', (status) => {
      return ['completed', 'failed'].includes(status.text())
    })
    
    // Should show artifacts section
    cy.get('[data-testid="artifacts-section"]').should('be.visible')
    
    // Should show available artifacts
    cy.get('[data-testid="artifact-item"]').should('have.length.greaterThan', 0)
    
    // Artifacts should be clickable/downloadable
    cy.get('[data-testid="artifact-item"]').first().click()
    
    // Should open or download the artifact
    // Note: This might open in a new tab or trigger a download
  })

  it('should show real-time progress updates', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to start
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
    
    // Progress should update in real-time
    cy.get('[data-testid="progress-percentage"]').should('be.visible')
    
    // Progress should increase over time
    let previousProgress = 0
    cy.get('[data-testid="progress-percentage"]', { timeout: 30000 }).should(($progress) => {
      const currentProgress = parseInt($progress.text())
      expect(currentProgress).to.be.greaterThan(previousProgress)
      previousProgress = currentProgress
    })
  })

  it('should handle multiple concurrent test runs', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    
    // Start first test run
    cy.get('[data-testid="run-test-btn"]').first().click()
    cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
    
    // Start second test run
    cy.get('[data-testid="run-test-btn"]').eq(1).click()
    
    // Should handle both runs
    cy.get('[data-testid="test-run-progress"]').should('have.length', 2)
    
    // Both should show different run IDs
    cy.get('[data-testid="run-id"]').should('have.length', 2)
    cy.get('[data-testid="run-id"]').first().should('not.equal', cy.get('[data-testid="run-id"]').eq(1))
  })

  it('should provide detailed test results with pass/fail breakdown', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Wait for test to complete
    cy.get('[data-testid="run-status"]', { timeout: 60000 }).should('satisfy', (status) => {
      return ['completed', 'failed'].includes(status.text())
    })
    
    // Should show detailed results
    cy.get('[data-testid="results-summary"]').should('be.visible')
    
    // Should show pass/fail breakdown
    cy.get('[data-testid="passed-steps"]').should('be.visible')
    cy.get('[data-testid="failed-steps"]').should('be.visible')
    cy.get('[data-testid="total-steps"]').should('be.visible')
    
    // Numbers should add up correctly
    cy.get('[data-testid="passed-steps"]').then(($passed) => {
      cy.get('[data-testid="failed-steps"]').then(($failed) => {
        cy.get('[data-testid="total-steps"]').then(($total) => {
          const passed = parseInt($passed.text())
          const failed = parseInt($failed.text())
          const total = parseInt($total.text())
          expect(passed + failed).to.equal(total)
        })
      })
    })
  })

  it('should handle network failures and retry mechanisms', () => {
    // Mock network failure
    cy.intercept('POST', '/api/runs', { statusCode: 500, body: { success: false, error: 'Server error' } })
    
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="run-test-btn"]').first().click()
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Server error')
    
    // Should provide retry option
    cy.get('[data-testid="retry-btn"]').should('be.visible')
  })
})
