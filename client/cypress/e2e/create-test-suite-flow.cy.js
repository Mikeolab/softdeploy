describe('Create Test Suite Flow E2E Tests', () => {
  beforeEach(() => {
    // Visit the test management page
    cy.visit('/projects/proj-1/test-management')
  })

  it('should load test suite configuration page', () => {
    // Click on a test folder to access test suite configuration
    cy.get('[data-testid="test-folder"]').first().click()
    
    // Should see the test suite configuration page
    cy.get('h1').should('contain', 'Test Suite Configuration')
    cy.get('[data-testid="create-test-suite-btn"]').should('be.visible')
  })

  it('should open create test suite form', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Should see the create form
    cy.get('h2').should('contain', 'Create New Test Suite')
    cy.get('[data-testid="test-suite-name-input"]').should('be.visible')
    cy.get('[data-testid="test-suite-description-input"]').should('be.visible')
    cy.get('[data-testid="project-select"]').should('be.visible')
    cy.get('[data-testid="environment-select"]').should('be.visible')
    cy.get('[data-testid="base-url-input"]').should('be.visible')
  })

  it('should pre-populate form with sample data', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Form should be pre-populated with sample data
    cy.get('[data-testid="project-select"]').should('not.have.value', '')
    cy.get('[data-testid="environment-select"]').should('not.have.value', '')
    cy.get('[data-testid="base-url-input"]').should('not.have.value', '')
  })

  it('should validate required fields', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Try to save without filling required fields
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should show validation errors
    cy.get('[data-testid="name-error"]').should('be.visible')
    cy.get('[data-testid="base-url-error"]').should('be.visible')
    cy.get('[data-testid="project-error"]').should('be.visible')
    cy.get('[data-testid="steps-error"]').should('be.visible')
  })

  it('should create a new test suite', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Fill in the form
    cy.get('[data-testid="test-suite-name-input"]').type('E2E Test Suite')
    cy.get('[data-testid="test-suite-description-input"]').type('Test suite created via E2E testing')
    
    // Select project (should be pre-populated)
    cy.get('[data-testid="project-select"]').should('not.have.value', '')
    
    // Add a test step
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="step-name-input"]').first().type('Test Step 1')
    cy.get('[data-testid="step-method-select"]').first().select('GET')
    cy.get('[data-testid="step-url-input"]').first().type('/api/test')

    // Save the test suite
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should see success message or redirect
    cy.get('[data-testid="test-suites-list"]').should('contain', 'E2E Test Suite')
  })

  it('should duplicate an existing test suite', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    
    // Wait for test suites to load
    cy.get('[data-testid="test-suites-list"]').should('be.visible')
    
    // Click duplicate on first test suite
    cy.get('[data-testid="duplicate-test-suite-btn"]').first().click()

    // Should open form with duplicated data
    cy.get('h2').should('contain', 'Create New Test Suite')
    cy.get('[data-testid="test-suite-name-input"]').should('contain.value', '(Copy)')
    
    // Modify the name
    cy.get('[data-testid="test-suite-name-input"]').clear().type('Duplicated Test Suite')
    
    // Save
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should see both original and duplicated test suites
    cy.get('[data-testid="test-suites-list"]').should('contain', 'Duplicated Test Suite')
  })

  it('should edit an existing test suite', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    
    // Wait for test suites to load
    cy.get('[data-testid="test-suites-list"]').should('be.visible')
    
    // Click edit on first test suite
    cy.get('[data-testid="edit-test-suite-btn"]').first().click()

    // Should open form with existing data
    cy.get('h2').should('contain', 'Edit Test Suite')
    cy.get('[data-testid="test-suite-name-input"]').should('not.have.value', '')
    
    // Modify the name
    cy.get('[data-testid="test-suite-name-input"]').clear().type('Updated Test Suite')
    
    // Save
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should see updated test suite
    cy.get('[data-testid="test-suites-list"]').should('contain', 'Updated Test Suite')
  })

  it('should show test suite list with correct data', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    
    // Should see test suites list
    cy.get('[data-testid="test-suites-list"]').should('be.visible')
    
    // Each test suite should show relevant information
    cy.get('[data-testid="test-suite-item"]').first().within(() => {
      cy.get('[data-testid="test-suite-name"]').should('be.visible')
      cy.get('[data-testid="test-suite-description"]').should('be.visible')
      cy.get('[data-testid="test-suite-type"]').should('be.visible')
      cy.get('[data-testid="test-suite-steps-count"]').should('be.visible')
      cy.get('[data-testid="test-suite-actions"]').should('be.visible')
    })
  })

  it('should handle network errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '/api/suites', { statusCode: 500, body: { success: false, error: 'Server error' } })
    
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Fill and submit form
    cy.get('[data-testid="test-suite-name-input"]').type('Error Test Suite')
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible')
  })

  it('should persist data across page refreshes', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Create a test suite
    cy.get('[data-testid="test-suite-name-input"]').type('Persistent Test Suite')
    cy.get('[data-testid="test-suite-description-input"]').type('This should persist')
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Refresh the page
    cy.reload()

    // Should still see the test suite
    cy.get('[data-testid="test-suites-list"]').should('contain', 'Persistent Test Suite')
  })

  it('should validate URL format', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Enter invalid URL
    cy.get('[data-testid="base-url-input"]').type('not-a-valid-url')
    cy.get('[data-testid="test-suite-name-input"]').type('Test Suite')
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should show URL validation error
    cy.get('[data-testid="base-url-error"]').should('contain', 'valid URL')
  })

  it('should allow adding multiple test steps', () => {
    cy.get('[data-testid="test-folder"]').first().click()
    cy.get('[data-testid="create-test-suite-btn"]').click()

    // Add multiple steps
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="step-name-input"]').first().type('Step 1')
    
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="step-name-input"]').eq(1).type('Step 2')
    
    cy.get('[data-testid="add-step-btn"]').click()
    cy.get('[data-testid="step-name-input"]').eq(2).type('Step 3')

    // Should see all steps
    cy.get('[data-testid="test-step"]').should('have.length', 3)
    
    // Fill required fields and save
    cy.get('[data-testid="test-suite-name-input"]').type('Multi-Step Test Suite')
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Should see the test suite with 3 steps
    cy.get('[data-testid="test-suites-list"]').should('contain', 'Multi-Step Test Suite')
  })
})
