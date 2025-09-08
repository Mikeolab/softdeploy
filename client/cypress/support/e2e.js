// cypress/support/e2e.js
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  // Hide fetch requests
  const originalFetch = win.fetch
  win.fetch = (...args) => {
    return originalFetch(...args)
  }
})

// Add custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-btn"]').click()
})

Cypress.Commands.add('waitForApi', (url) => {
  cy.intercept('GET', url).as('apiCall')
  cy.wait('@apiCall')
})

Cypress.Commands.add('seedSampleData', () => {
  cy.request('POST', '/api/sample-data/seed')
})

Cypress.Commands.add('createTestSuite', (suiteData) => {
  cy.request('POST', '/api/suites', suiteData)
})

Cypress.Commands.add('createTestRun', (runData) => {
  cy.request('POST', '/api/runs', runData)
})
