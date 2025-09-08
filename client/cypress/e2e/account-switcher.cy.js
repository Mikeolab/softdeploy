// client/cypress/e2e/account-switcher.cy.js
describe('Account Switcher E2E Tests', () => {
  const user1Id = 'user-1';
  const user1Email = 'john.doe@example.com';
  const user2Id = 'user-2';
  const user2Email = 'jane.smith@example.com';
  const projectId = 'proj-1';

  beforeEach(() => {
    // Seed data for testing
    cy.request('POST', 'http://localhost:5000/api/invites', {
      projectId: projectId,
      email: user2Email,
      role: 'member'
    }).then(response => {
      expect(response.status).to.eq(201);
    });

    // Intercept API calls
    cy.intercept('GET', '/api/projects/personal', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'proj-1',
            name: 'E-commerce Platform',
            description: 'Full-stack e-commerce application',
            environment: 'development',
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z'
          }
        ]
      }
    }).as('getPersonalProjects');

    cy.intercept('GET', '/api/projects/invited', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'proj-2',
            name: 'TestLab API',
            description: 'RESTful API for test management',
            environment: 'staging',
            status: 'active',
            role: 'member',
            joinedAt: '2024-01-20T14:30:00Z',
            createdAt: '2024-01-16T09:15:00Z',
            updatedAt: '2024-01-20T16:45:00Z'
          }
        ]
      }
    }).as('getInvitedProjects');

    cy.visit('/dashboard');
  });

  it('should display account switcher in sidebar', () => {
    cy.get('[data-testid="account-switcher-btn"]').should('be.visible');
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'Personal');
  });

  it('should open account switcher dropdown when clicked', () => {
    cy.get('[data-testid="account-switcher-btn"]').click();
    
    // Should show Personal section
    cy.contains('Personal').should('be.visible');
    cy.get('[data-testid="personal-context-btn"]').should('be.visible');
    
    // Should show Projects section
    cy.contains('Projects').should('be.visible');
  });

  it('should switch to project context when project is selected', () => {
    cy.get('[data-testid="account-switcher-btn"]').click();
    
    // Click on a project
    cy.get('[data-testid="project-context-btn-proj-2"]').click();
    
    // Account switcher should show the project name
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'TestLab API');
  });

  it('should persist context selection in localStorage', () => {
    cy.get('[data-testid="account-switcher-btn"]').click();
    cy.get('[data-testid="project-context-btn-proj-2"]').click();
    
    // Reload page
    cy.reload();
    
    // Context should be restored
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'TestLab API');
  });

  it('should show role badges for project members', () => {
    cy.get('[data-testid="account-switcher-btn"]').click();
    
    // Should show role badge for project
    cy.get('[data-testid="project-context-btn-proj-2"]').within(() => {
      cy.contains('member').should('be.visible');
    });
  });

  it('should handle empty invited projects gracefully', () => {
    // Intercept with empty data
    cy.intercept('GET', '/api/projects/invited', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getEmptyInvitedProjects');

    cy.reload();
    cy.get('[data-testid="account-switcher-btn"]').click();
    
    // Should show empty state message
    cy.contains('No project invitations yet').should('be.visible');
  });

  it('should update sidebar content when context changes', () => {
    // Switch to project context
    cy.get('[data-testid="account-switcher-btn"]').click();
    cy.get('[data-testid="project-context-btn-proj-2"]').click();
    
    // Sidebar should show project-specific navigation
    cy.contains('TestLab API').should('be.visible');
    cy.contains('Members').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    // Intercept with error
    cy.intercept('GET', '/api/projects/personal', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal server error'
      }
    }).as('getPersonalProjectsError');

    cy.reload();
    
    // Should still show account switcher with fallback
    cy.get('[data-testid="account-switcher-btn"]').should('be.visible');
  });
});
