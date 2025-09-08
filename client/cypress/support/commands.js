// cypress/support/commands.js
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to wait for test run to complete
Cypress.Commands.add('waitForTestRun', (runId, timeout = 60000) => {
  cy.get(`[data-testid="run-id"]:contains("${runId}")`, { timeout })
    .parent()
    .find('[data-testid="run-status"]')
    .should('satisfy', (status) => {
      return ['completed', 'failed', 'stopped'].includes(status.text())
    })
})

// Custom command to check test run results
Cypress.Commands.add('checkTestRunResults', (expectedPassed, expectedFailed) => {
  cy.get('[data-testid="passed-steps"]').should('contain', expectedPassed)
  cy.get('[data-testid="failed-steps"]').should('contain', expectedFailed)
})

// Custom command to verify step results
Cypress.Commands.add('verifyStepResults', (expectedSteps) => {
  cy.get('[data-testid="step-result"]').should('have.length', expectedSteps)
  
  cy.get('[data-testid="step-result"]').each(($step, index) => {
    cy.wrap($step).within(() => {
      cy.get('[data-testid="step-icon"]').should('be.visible')
      cy.get('[data-testid="step-name"]').should('be.visible')
      cy.get('[data-testid="step-duration"]').should('be.visible')
    })
  })
})

// Custom command to check execution logs
Cypress.Commands.add('checkExecutionLogs', (expectedLogCount) => {
  cy.get('[data-testid="execution-logs"]').should('be.visible')
  cy.get('[data-testid="log-entry"]').should('have.length.greaterThan', expectedLogCount)
  
  cy.get('[data-testid="log-entry"]').each(($log) => {
    cy.wrap($log).within(() => {
      cy.get('[data-testid="log-timestamp"]').should('be.visible')
      cy.get('[data-testid="log-level"]').should('be.visible')
      cy.get('[data-testid="log-message"]').should('be.visible')
    })
  })
})

// Custom command to verify progress updates
Cypress.Commands.add('verifyProgressUpdates', () => {
  cy.get('[data-testid="progress-bar"]').should('be.visible')
  cy.get('[data-testid="progress-percentage"]').should('be.visible')
  
  // Progress should be a number between 0 and 100
  cy.get('[data-testid="progress-percentage"]').should(($progress) => {
    const percentage = parseInt($progress.text())
    expect(percentage).to.be.at.least(0)
    expect(percentage).to.be.at.most(100)
  })
})

// Custom command to verify artifacts
Cypress.Commands.add('verifyArtifacts', () => {
  cy.get('[data-testid="artifacts-section"]').should('be.visible')
  cy.get('[data-testid="artifact-item"]').should('have.length.greaterThan', 0)
})

// Custom command to create a test suite with steps
Cypress.Commands.add('createTestSuiteWithSteps', (suiteName, steps) => {
  cy.get('[data-testid="create-test-suite-btn"]').click()
  
  cy.get('[data-testid="test-suite-name-input"]').type(suiteName)
  cy.get('[data-testid="test-suite-description-input"]').type(`Test suite: ${suiteName}`)
  
  // Add steps
  steps.forEach((step, index) => {
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="step-name-input"]').eq(index).type(step.name)
    cy.get('[data-testid="step-method-select"]').eq(index).select(step.method)
    cy.get('[data-testid="step-url-input"]').eq(index).type(step.url)
  })
  
  cy.get('[data-testid="save-test-suite-btn"]').click()
  
  // Verify test suite was created
  cy.get('[data-testid="test-suites-list"]').should('contain', suiteName)
})

// Custom command to run a test suite and wait for completion
Cypress.Commands.add('runTestSuiteAndWait', (suiteName) => {
  cy.get('[data-testid="run-test-btn"]').first().click()
  
  // Wait for test run to start
  cy.get('[data-testid="run-status"]', { timeout: 10000 }).should('contain', 'running')
  
  // Wait for completion
  cy.get('[data-testid="run-status"]', { timeout: 60000 }).should('satisfy', (status) => {
    return ['completed', 'failed'].includes(status.text())
  })
  
  // Verify results are displayed
  cy.get('[data-testid="results-summary"]').should('be.visible')
})
