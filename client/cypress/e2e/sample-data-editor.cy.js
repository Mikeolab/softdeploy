describe('Sample Data Editor E2E Tests', () => {
  beforeEach(() => {
    // Visit the sample data editor page
    cy.visit('/sample-data')
  })

  it('should load the sample data editor page', () => {
    cy.get('[data-testid="sample-data-editor"]').should('be.visible')
    cy.get('h1').should('contain', 'Sample Data Editor')
  })

  it('should display tabs for different data types', () => {
    cy.get('[data-testid="data-type-tabs"]').should('be.visible')
    cy.get('[data-testid="tab-users"]').should('contain', '👥 Users')
    cy.get('[data-testid="tab-projects"]').should('contain', '📁 Projects')
    cy.get('[data-testid="tab-testSuites"]').should('contain', '🧪 Test Suites')
    cy.get('[data-testid="tab-testRuns"]').should('contain', '🏃 Test Runs')
  })

  it('should switch between tabs and display data', () => {
    // Test Projects tab
    cy.get('[data-testid="tab-projects"]').click()
    cy.get('[data-testid="projects-table"]').should('be.visible')
    cy.get('[data-testid="add-project-btn"]').should('be.visible')

    // Test Users tab
    cy.get('[data-testid="tab-users"]').click()
    cy.get('[data-testid="users-table"]').should('be.visible')
    cy.get('[data-testid="add-user-btn"]').should('be.visible')
  })

  it('should add a new project', () => {
    cy.get('[data-testid="tab-projects"]').click()
    cy.get('[data-testid="add-project-btn"]').click()

    // Fill in the form
    cy.get('[data-testid="project-name-input"]').type('New Test Project')
    cy.get('[data-testid="project-description-input"]').type('A new test project for E2E testing')
    cy.get('[data-testid="project-environment-input"]').type('development')
    cy.get('[data-testid="project-user-id-input"]').type('user-1')

    // Save the project
    cy.get('[data-testid="save-project-btn"]').click()

    // Verify the project was added
    cy.get('[data-testid="projects-table"]').should('contain', 'New Test Project')
    cy.get('[data-testid="projects-table"]').should('contain', 'A new test project for E2E testing')
  })

  it('should edit an existing project', () => {
    cy.get('[data-testid="tab-projects"]').click()
    
    // Click edit on first project
    cy.get('[data-testid="projects-table"] tbody tr').first().within(() => {
      cy.get('[data-testid="edit-project-btn"]').click()
    })

    // Update the name
    cy.get('[data-testid="project-name-input"]').clear().type('Updated Project Name')
    
    // Save changes
    cy.get('[data-testid="save-project-btn"]').click()

    // Verify the change was saved
    cy.get('[data-testid="projects-table"]').should('contain', 'Updated Project Name')
  })

  it('should delete a project', () => {
    cy.get('[data-testid="tab-projects"]').click()
    
    // Get initial count
    cy.get('[data-testid="projects-table"] tbody tr').then(($rows) => {
      const initialCount = $rows.length

      // Click delete on first project
      cy.get('[data-testid="projects-table"] tbody tr').first().within(() => {
        cy.get('[data-testid="delete-project-btn"]').click()
      })

      // Confirm deletion
      cy.on('window:confirm', () => true)

      // Verify the project was deleted
      cy.get('[data-testid="projects-table"] tbody tr').should('have.length', initialCount - 1)
    })
  })

  it('should add a new test suite', () => {
    cy.get('[data-testid="tab-testSuites"]').click()
    cy.get('[data-testid="add-test-suite-btn"]').click()

    // Fill in the form
    cy.get('[data-testid="test-suite-name-input"]').type('New Test Suite')
    cy.get('[data-testid="test-suite-description-input"]').type('A new test suite for E2E testing')
    cy.get('[data-testid="test-suite-project-id-input"]').type('proj-1')
    cy.get('[data-testid="test-suite-test-type-input"]').type('API')
    cy.get('[data-testid="test-suite-tool-id-input"]').type('postman')
    cy.get('[data-testid="test-suite-base-url-input"]').type('https://api.example.com')

    // Save the test suite
    cy.get('[data-testid="save-test-suite-btn"]').click()

    // Verify the test suite was added
    cy.get('[data-testid="test-suites-table"]').should('contain', 'New Test Suite')
    cy.get('[data-testid="test-suites-table"]').should('contain', 'A new test suite for E2E testing')
  })

  it('should navigate back to dashboard', () => {
    cy.get('[data-testid="back-to-dashboard-btn"]').click()
    cy.url().should('include', '/')
    cy.get('h1').should('contain', 'Dashboard')
  })

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '/api/sample-data/projects', { statusCode: 500, body: { success: false, error: 'Server error' } })
    
    cy.get('[data-testid="tab-projects"]').click()
    
    // Should show error message or fallback to empty state
    cy.get('[data-testid="projects-table"]').should('be.visible')
  })

  it('should persist data changes across page refreshes', () => {
    // Add a new project
    cy.get('[data-testid="tab-projects"]').click()
    cy.get('[data-testid="add-project-btn"]').click()
    cy.get('[data-testid="project-name-input"]').type('Persistent Project')
    cy.get('[data-testid="project-description-input"]').type('This project should persist')
    cy.get('[data-testid="project-environment-input"]').type('production')
    cy.get('[data-testid="project-user-id-input"]').type('user-1')
    cy.get('[data-testid="save-project-btn"]').click()

    // Refresh the page
    cy.reload()

    // Verify the project still exists
    cy.get('[data-testid="tab-projects"]').click()
    cy.get('[data-testid="projects-table"]').should('contain', 'Persistent Project')
  })
})
