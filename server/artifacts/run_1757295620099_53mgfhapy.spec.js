describe('Sample API Tests', () => {
  beforeEach(() => {
    cy.log('Starting test suite: Sample API Tests')
  })

  it('Step 1: Health Check', () => {
    cy.log('Check API health endpoint')
    cy.request({
      method: 'GET',
      url: 'https://api.example.com/health',
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Step 2: User Login', () => {
    cy.log('Test user login endpoint')
    cy.request({
      method: 'POST',
      url: 'https://api.example.com/auth/login',
      headers: {"Content-Type":"application/json"},
      body: {"username":"test","password":"test"},
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

})
