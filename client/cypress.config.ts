import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    },
    setupNodeEvents(on, config) {
      // Add JUnit reporter for Jenkins
      on('after:run', (results) => {
        // Generate JUnit XML for Jenkins test trends
        const fs = require('fs');
        const path = require('path');
        
        const junitDir = path.join(__dirname, 'cypress/reports/junit');
        if (!fs.existsSync(junitDir)) {
          fs.mkdirSync(junitDir, { recursive: true });
        }
        
        const junitXml = generateJUnitXML(results);
        fs.writeFileSync(path.join(junitDir, 'cypress-results.xml'), junitXml);
      });
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})

// Generate JUnit XML for Jenkins test trends
function generateJUnitXML(results: any): string {
  const totalTests = results.totalTests || 0;
  const totalPassed = results.totalPassed || 0;
  const totalFailed = results.totalFailed || 0;
  const totalDuration = results.totalDuration || 0;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Cypress Tests" tests="${totalTests}" failures="${totalFailed}" time="${totalDuration / 1000}">
  <properties>
    <property name="browser" value="${results.browserName || 'chrome'}"/>
    <property name="os" value="${results.osName || 'unknown'}"/>
    <property name="cypress-version" value="${results.cypressVersion || 'unknown'}"/>
  </properties>
  ${results.tests?.map((test: any) => `
  <testcase name="${test.title}" classname="${test.file}" time="${test.duration / 1000}">
    ${test.state === 'failed' ? `<failure message="${test.displayError || 'Test failed'}">${test.displayError || 'Test failed'}</failure>` : ''}
  </testcase>`).join('') || ''}
</testsuite>`;
}
