// client/cypress/e2e/invitation-flow.cy.js
describe('Invitation Flow E2E Tests', () => {
  const projectId = 'proj-1';
  const ownerEmail = 'john.doe@example.com';
  const inviteEmail = 'newuser@example.com';

  beforeEach(() => {
    // Intercept API calls
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
          email: inviteEmail,
          projectName: 'E-commerce Platform',
          role: 'member',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }).as('sendInvitation');

    cy.visit(`/projects/${projectId}/members`);
  });

  it('should display project members page', () => {
    cy.contains('Project Members').should('be.visible');
    cy.contains('Team Members').should('be.visible');
    cy.get('[data-testid="invite-member-btn"]').should('be.visible');
  });

  it('should open invite form when invite button is clicked', () => {
    cy.get('[data-testid="invite-member-btn"]').click();
    
    cy.contains('Invite Team Member').should('be.visible');
    cy.get('[data-testid="invite-email-input"]').should('be.visible');
    cy.get('[data-testid="invite-role-select"]').should('be.visible');
    cy.get('[data-testid="send-invite-btn"]').should('be.visible');
  });

  it('should send invitation successfully', () => {
    cy.get('[data-testid="invite-member-btn"]').click();
    
    // Fill form
    cy.get('[data-testid="invite-email-input"]').type(inviteEmail);
    cy.get('[data-testid="invite-role-select"]').select('member');
    
    // Send invitation
    cy.get('[data-testid="send-invite-btn"]').click();
    
    // Should show success message
    cy.contains('Invitation sent to').should('be.visible');
    
    // Form should close
    cy.contains('Invite Team Member').should('not.exist');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="invite-member-btn"]').click();
    
    // Try to send without email
    cy.get('[data-testid="send-invite-btn"]').click();
    
    // Should show validation error
    cy.get('[data-testid="invite-email-input"]').should('have.attr', 'required');
  });

  it('should display existing members with role badges', () => {
    cy.contains(ownerEmail).should('be.visible');
    cy.contains('owner').should('be.visible');
  });

  it('should allow role changes for project owners', () => {
    // Add another member for testing
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
            userEmail: 'member@example.com',
            role: 'member',
            joinedAt: '2024-01-20T14:30:00Z'
          }
        ]
      }
    }).as('getProjectMembersWithMember');

    cy.reload();
    
    // Should show role selector for members
    cy.get('[data-testid="role-select-user-2"]').should('be.visible');
  });

  it('should allow removing members', () => {
    // Add another member for testing
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
            userEmail: 'member@example.com',
            role: 'member',
            joinedAt: '2024-01-20T14:30:00Z'
          }
        ]
      }
    }).as('getProjectMembersWithMember');

    cy.intercept('DELETE', `/api/projects/${projectId}/members/user-2`, {
      statusCode: 200,
      body: {
        success: true,
        message: 'Member removed successfully'
      }
    }).as('removeMember');

    cy.reload();
    
    // Click remove button
    cy.get('[data-testid="remove-member-btn-user-2"]').click();
    
    // Confirm removal
    cy.on('window:confirm', () => true);
    
    // Should show success
    cy.contains('Member removed successfully').should('be.visible');
  });

  it('should handle empty members list', () => {
    cy.intercept('GET', `/api/projects/${projectId}/members`, {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getEmptyMembers');

    cy.reload();
    
    // Should show empty state
    cy.contains('No members yet').should('be.visible');
    cy.contains('Invite First Member').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('POST', '/api/invites', {
      statusCode: 400,
      body: {
        success: false,
        error: 'User is already a member of this project'
      }
    }).as('sendInvitationError');

    cy.get('[data-testid="invite-member-btn"]').click();
    cy.get('[data-testid="invite-email-input"]').type(inviteEmail);
    cy.get('[data-testid="invite-role-select"]').select('member');
    cy.get('[data-testid="send-invite-btn"]').click();
    
    // Should show error message
    cy.contains('User is already a member of this project').should('be.visible');
  });
});
