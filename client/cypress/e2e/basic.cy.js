describe('SoftDeploy E2E Tests', () => {
  it('should load the application', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })

  it('should have basic navigation', () => {
    cy.visit('/')
    cy.get('body').should('contain.text', 'SoftDeploy')
  })
})
