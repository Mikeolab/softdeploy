// client/cypress/e2e/complete-user-flow.cy.js
describe('Complete User Flow E2E Tests', () => {
  const projectId = 'proj-1';
  const ownerEmail = 'john.doe@example.com';
  const memberEmail = 'jane.smith@example.com';
  const newUserEmail = 'newuser@example.com';

  beforeEach(() => {
    // Mock all API endpoints for the complete flow
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

    cy.intercept('GET', `/api/projects/${projectId}/members`, {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'membership_1',
            userId: 'user-1',
            userEmail: ownerEmail,
            role: 'owner',
            joinedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'membership_2',
            userId: 'user-2',
            userEmail: memberEmail,
            role: 'member',
            joinedAt: '2024-01-20T14:30:00Z'
          }
        ]
      }
    }).as('getProjectMembers');

    cy.intercept('POST', '/api/invites', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Invitation sent successfully',
        data: {
          id: 'invite_1',
          email: newUserEmail,
          projectName: 'E-commerce Platform',
          role: 'member',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }).as('sendInvitation');

    cy.intercept('GET', '/api/runs?limit=5', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'run_1',
            testSuite: { name: 'Login Flow Tests' },
            status: 'completed',
            executedAt: '2024-01-20T10:00:00Z',
            duration: 45000,
            passedSteps: 5,
            totalSteps: 5
          },
          {
            id: 'run_2',
            testSuite: { name: 'API Endpoint Tests' },
            status: 'completed',
            executedAt: '2024-01-20T09:30:00Z',
            duration: 30000,
            passedSteps: 3,
            totalSteps: 3
          }
        ]
      }
    }).as('getRecentRuns');

    cy.intercept('GET', '/api/sample-data/projects', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'proj-1',
            name: 'E-commerce Platform',
            description: 'Full-stack e-commerce application',
            environment: 'development',
            status: 'active'
          }
        ]
      }
    }).as('getSampleProjects');

    cy.intercept('GET', '/api/sample-data/test-suites', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'suite_1',
            name: 'User Authentication Tests',
            projectId: 'proj-1',
            testType: 'Functional',
            steps: [
              { name: 'Navigate to login page', type: 'navigation' },
              { name: 'Enter credentials', type: 'interaction' },
              { name: 'Verify login success', type: 'assertion' }
            ]
          }
        ]
      }
    }).as('getSampleTestSuites');
  });

  it('should complete the full user flow: login → dashboard → account switching → project management → invitation flow', () => {
    // Step 1: Visit dashboard (simulating logged-in user)
    cy.visit('/dashboard');
    
    // Verify dashboard loads with recent runs
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Recent Test Runs').should('be.visible');
    cy.wait('@getRecentRuns');
    cy.contains('Login Flow Tests').should('be.visible');
    cy.contains('API Endpoint Tests').should('be.visible');

    // Step 2: Test Account Switcher functionality
    cy.get('[data-testid="account-switcher-btn"]').should('be.visible');
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'Personal');
    
    // Open account switcher
    cy.get('[data-testid="account-switcher-btn"]').click();
    
    // Verify Personal section
    cy.contains('Personal').should('be.visible');
    cy.get('[data-testid="personal-context-btn"]').should('be.visible');
    
    // Verify Projects section
    cy.contains('Projects').should('be.visible');
    cy.get('[data-testid="project-context-btn-proj-2"]').should('be.visible');
    cy.contains('member').should('be.visible'); // Role badge
    
    // Switch to project context
    cy.get('[data-testid="project-context-btn-proj-2"]').click();
    
    // Verify context switched
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'TestLab API');

    // Step 3: Navigate to project management
    cy.visit(`/projects/${projectId}`);
    
    // Verify project page loads
    cy.contains('E-commerce Platform').should('be.visible');
    cy.contains('Test Management').should('be.visible');
    cy.contains('Deployments').should('be.visible');
    cy.contains('Members').should('be.visible');

    // Step 4: Test Test Management functionality
    cy.visit(`/projects/${projectId}/test-management`);
    
    // Verify test management page loads
    cy.contains('Test Management').should('be.visible');
    cy.contains('Create Test Suite').should('be.visible');
    
    // Test suite creation form should be pre-populated
    cy.get('[data-testid="suite-name-input"]').should('have.value', 'User Authentication Tests');
    cy.get('[data-testid="project-select"]').should('contain', 'E-commerce Platform');

    // Step 5: Test Members management
    cy.visit(`/projects/${projectId}/members`);
    
    // Verify members page loads
    cy.contains('Project Members').should('be.visible');
    cy.contains('Team Members').should('be.visible');
    cy.get('[data-testid="invite-member-btn"]').should('be.visible');
    
    // Verify existing members are displayed
    cy.contains(ownerEmail).should('be.visible');
    cy.contains('owner').should('be.visible');
    cy.contains(memberEmail).should('be.visible');
    cy.contains('member').should('be.visible');

    // Step 6: Test invitation flow
    cy.get('[data-testid="invite-member-btn"]').click();
    
    // Verify invite form opens
    cy.contains('Invite Team Member').should('be.visible');
    cy.get('[data-testid="invite-email-input"]').should('be.visible');
    cy.get('[data-testid="invite-role-select"]').should('be.visible');
    cy.get('[data-testid="send-invite-btn"]').should('be.visible');
    
    // Fill invitation form
    cy.get('[data-testid="invite-email-input"]').type(newUserEmail);
    cy.get('[data-testid="invite-role-select"]').select('member');
    
    // Send invitation
    cy.get('[data-testid="send-invite-btn"]').click();
    
    // Verify success message
    cy.contains('Invitation sent to').should('be.visible');
    
    // Form should close
    cy.contains('Invite Team Member').should('not.exist');

    // Step 7: Test role management
    cy.get('[data-testid="role-select-user-2"]').should('be.visible');
    cy.get('[data-testid="role-select-user-2"]').select('admin');
    
    // Verify role change (in real app, this would trigger API call)
    cy.get('[data-testid="role-select-user-2"]').should('have.value', 'admin');

    // Step 8: Test invitation acceptance flow
    cy.visit('/accept-invitation/test-token-123');
    
    // Verify invitation accept page loads
    cy.contains('Project Invitation').should('be.visible');
    cy.contains('E-commerce Platform').should('be.visible');
    cy.contains('member').should('be.visible');
    
    // Accept invitation
    cy.get('[data-testid="accept-invitation-btn"]').click();
    
    // Verify success message
    cy.contains('Invitation Accepted!').should('be.visible');
    cy.contains('You\'ve successfully joined E-commerce Platform as a member').should('be.visible');

    // Step 9: Test context persistence
    cy.visit('/dashboard');
    
    // Account switcher should remember the last context
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'TestLab API');
    
    // Switch back to Personal
    cy.get('[data-testid="account-switcher-btn"]').click();
    cy.get('[data-testid="personal-context-btn"]').click();
    
    // Verify context switched back
    cy.get('[data-testid="account-switcher-btn"]').should('contain', 'Personal');

    // Step 10: Test sidebar navigation with different contexts
    cy.visit('/dashboard');
    
    // Switch to project context
    cy.get('[data-testid="account-switcher-btn"]').click();
    cy.get('[data-testid="project-context-btn-proj-2"]').click();
    
    // Navigate to project-specific pages
    cy.contains('TestLab API').should('be.visible');
    cy.contains('Members').should('be.visible');
    
    // Step 11: Test error handling
    cy.intercept('GET', '/api/projects/personal', {
      statusCode: 500,
      body: { success: false, error: 'Internal server error' }
    }).as('getPersonalProjectsError');
    
    cy.reload();
    
    // Should still show account switcher with fallback
    cy.get('[data-testid="account-switcher-btn"]').should('be.visible');
  });

  it('should handle edge cases and error scenarios', () => {
    // Test empty states
    cy.intercept('GET', '/api/projects/invited', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getEmptyInvitedProjects');

    cy.visit('/dashboard');
    cy.get('[data-testid="account-switcher-btn"]').click();
    
    // Should show empty state
    cy.contains('No project invitations yet').should('be.visible');

    // Test invitation errors
    cy.intercept('POST', '/api/invites', {
      statusCode: 400,
      body: { success: false, error: 'User is already a member of this project' }
    }).as('sendInvitationError');

    cy.visit(`/projects/${projectId}/members`);
    cy.get('[data-testid="invite-member-btn"]').click();
    cy.get('[data-testid="invite-email-input"]').type('existing@example.com');
    cy.get('[data-testid="invite-role-select"]').select('member');
    cy.get('[data-testid="send-invite-btn"]').click();
    
    // Should show error message
    cy.contains('User is already a member of this project').should('be.visible');

    // Test invalid invitation token
    cy.visit('/accept-invitation/invalid-token');
    cy.contains('Invalid Invitation').should('be.visible');
    cy.contains('Invalid or expired invitation').should('be.visible');
  });

  it('should verify all navigation links work correctly', () => {
    cy.visit('/dashboard');
    
    // Test main navigation
    cy.contains('Projects').click();
    cy.url().should('include', '/projects');
    
    // Test project-specific navigation
    cy.visit(`/projects/${projectId}`);
    
    cy.contains('Test Management').click();
    cy.url().should('include', '/test-management');
    
    cy.contains('Deployments').click();
    cy.url().should('include', '/deploy');
    
    cy.contains('Members').click();
    cy.url().should('include', '/members');
    
    // Test sidebar navigation
    cy.get('[data-testid="account-switcher-btn"]').click();
    cy.get('[data-testid="project-context-btn-proj-2"]').click();
    
    // Should show project-specific navigation
    cy.contains('TestLab API').should('be.visible');
    cy.contains('Members').should('be.visible');
  });
});
