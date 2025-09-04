// Simple test to verify Cypress integration
describe('SoftDeploy Cypress Integration Test', () => {
  it('should visit the homepage', () => {
    cy.visit('http://localhost:5173')
    cy.get('body').should('be.visible')
  })
  
  it('should have a title', () => {
    cy.visit('http://localhost:5173')
    cy.title().should('not.be.empty')
  })
})

