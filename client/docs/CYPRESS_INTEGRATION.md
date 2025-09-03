# Cypress Integration Guide for SoftDeploy

## Overview
This guide explains how to integrate Cypress testing with SoftDeploy without leaving the application. The system generates Cypress scripts that can be executed directly from within SoftDeploy.

## How It Works

### 1. **Script Generation**
When you select Cypress as your testing tool, SoftDeploy automatically generates Cypress-compatible test scripts based on your test steps.

### 2. **In-App Execution**
The generated scripts can be executed directly within SoftDeploy using a built-in Cypress runner.

### 3. **Real-Time Results**
Test results are displayed in real-time within the SoftDeploy interface.

## Installation & Setup

### Prerequisites
```bash
# Install Cypress in your project
npm install cypress --save-dev

# Install Cypress dependencies
npm install @cypress/webpack-preprocessor --save-dev
```

### SoftDeploy Configuration
1. **Navigate to Test Management** → **Settings** → **Integrations**
2. **Enable Cypress Integration**
3. **Configure Cypress Path**: Set the path to your Cypress installation
4. **Set Project Root**: Point to your project's root directory

## Creating Cypress Tests

### Step-by-Step Process

1. **Select Test Type**: Choose "Functional Testing"
2. **Select Tool**: Choose "External Tools" → "Cypress"
3. **Define Test Steps**:
   - **Navigation**: Specify URLs and wait conditions
   - **Interaction**: Define clicks, typing, and form interactions
   - **Assertion**: Set up element and content validations

### Example Test Flow

```javascript
// Generated Cypress Script
describe('Login Flow Test', () => {
  beforeEach(() => {
    cy.visit('https://your-app.com')
  })

  it('should login successfully', () => {
    cy.get('#email').type('user@example.com')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.url().should('include', '/dashboard')
    cy.get('.welcome-message').should('contain', 'Welcome')
  })
})
```

## Advanced Features

### 1. **Variable Management**
- Extract data from responses: `cy.get('.token').invoke('text').as('authToken')`
- Use variables in subsequent steps: `cy.get('@authToken').then((token) => { ... })`

### 2. **Custom Commands**
SoftDeploy can generate custom Cypress commands for common operations:

```javascript
// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#login-button').click()
})

// Usage in tests
cy.login('user@example.com', 'password123')
```

### 3. **API Testing with Cypress**
```javascript
// API requests within Cypress
cy.request({
  method: 'POST',
  url: '/api/login',
  body: {
    email: 'user@example.com',
    password: 'password123'
  }
}).then((response) => {
  expect(response.status).to.eq(200)
  expect(response.body).to.have.property('token')
})
```

## Execution Methods

### 1. **In-App Execution (Recommended)**
- Click "Execute Test Suite" in SoftDeploy
- Tests run in a headless browser within SoftDeploy
- Real-time results displayed in the interface

### 2. **External Execution**
- Click "Generate Script" to copy the Cypress script
- Paste into your project's Cypress test files
- Run with `npx cypress run` or `npx cypress open`

### 3. **CI/CD Integration**
- Generated scripts can be used in your CI/CD pipeline
- SoftDeploy can trigger external Cypress runs
- Results are reported back to SoftDeploy

## Configuration Options

### Cypress Configuration File
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'https://your-app.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  }
}
```

### SoftDeploy Cypress Settings
- **Browser**: Chrome, Firefox, Edge, Electron
- **Viewport**: Customize screen size
- **Timeout**: Set command and request timeouts
- **Retries**: Configure test retry attempts
- **Screenshots**: Enable/disable failure screenshots

## Best Practices

### 1. **Test Structure**
- Use descriptive test names
- Group related tests in describe blocks
- Keep tests independent and isolated

### 2. **Selectors**
- Prefer data attributes: `cy.get('[data-testid="login-button"]')`
- Avoid brittle selectors like text content
- Use stable CSS classes or IDs

### 3. **Assertions**
- Be specific with assertions
- Use multiple assertions when needed
- Validate both positive and negative cases

### 4. **Performance**
- Use `cy.intercept()` for API mocking
- Minimize network requests in tests
- Use `cy.wait()` sparingly

## Troubleshooting

### Common Issues

1. **Element Not Found**
   - Check if element is visible: `cy.get('.element').should('be.visible')`
   - Wait for element: `cy.get('.element', { timeout: 10000 })`
   - Check if element exists in DOM: `cy.get('.element').should('exist')`

2. **Timing Issues**
   - Use `cy.wait()` for specific conditions
   - Wait for network requests: `cy.wait('@apiCall')`
   - Use `cy.should()` for assertions with built-in waiting

3. **Cross-Origin Issues**
   - Configure `chromeWebSecurity: false` in Cypress config
   - Use `cy.origin()` for cross-origin testing (Cypress 12+)

### Debug Mode
Enable debug mode in SoftDeploy to see:
- Detailed step-by-step execution
- Screenshots at each step
- Network request logs
- Console output

## Integration with Existing Cypress Tests

### Importing Existing Tests
1. **Upload Cypress Files**: Import existing `.spec.js` files
2. **Parse Test Structure**: SoftDeploy analyzes test structure
3. **Convert to Visual Steps**: Convert Cypress commands to visual steps
4. **Edit and Enhance**: Modify tests using SoftDeploy interface

### Exporting Tests
1. **Generate Cypress Script**: Convert visual steps to Cypress code
2. **Download Script**: Save as `.spec.js` file
3. **Integration**: Add to existing Cypress test suite

## Advanced Features

### 1. **Visual Testing**
```javascript
// Visual regression testing
cy.get('.dashboard').should('matchImageSnapshot')
```

### 2. **Network Stubbing**
```javascript
// Mock API responses
cy.intercept('GET', '/api/users', { fixture: 'users.json' })
```

### 3. **Custom Assertions**
```javascript
// Custom assertions
Cypress.Commands.add('shouldHaveClass', (selector, className) => {
  cy.get(selector).should('have.class', className)
})
```

## Monitoring & Reporting

### Real-Time Monitoring
- Live test execution status
- Step-by-step progress indicators
- Error highlighting and suggestions

### Test Reports
- Detailed pass/fail statistics
- Execution time analysis
- Screenshot and video attachments
- Error logs and stack traces

### Integration with SoftDeploy Analytics
- Test execution trends
- Performance metrics
- Failure pattern analysis
- Team productivity insights

## Security Considerations

### Credential Management
- Store test credentials securely
- Use environment variables
- Rotate test accounts regularly

### Test Data
- Use isolated test databases
- Clean up test data after runs
- Avoid using production data

### Network Security
- Use HTTPS for all test URLs
- Validate SSL certificates
- Monitor for security vulnerabilities

This integration provides a seamless way to use Cypress within SoftDeploy while maintaining the flexibility to run tests externally when needed.
