// Cypress integration for SoftDeploy
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Cypress execution function
async function executeCypressTest(testSuite, executionId) {
  try {
    console.log(`🧪 Executing Cypress test: ${testSuite.name}`);
    
    // Generate Cypress script
    const cypressScript = generateCypressScript(testSuite);
    const testFilePath = path.join(__dirname, 'cypress-tests', `${executionId}.spec.js`);
    
    // Ensure cypress-tests directory exists
    await fs.mkdir(path.join(__dirname, 'cypress-tests'), { recursive: true });
    
    // Write test file
    await fs.writeFile(testFilePath, cypressScript);
    
    // Execute Cypress
    const cypressCommand = `npx cypress run --spec "${testFilePath}" --headless --reporter json`;
    
    return new Promise((resolve, reject) => {
      const child = exec(cypressCommand, { 
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data;
        // Note: broadcast function needs to be passed or made available
        console.log(`Cypress output: ${data.toString()}`);
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data;
        console.log(`Cypress error: ${data.toString()}`);
      });
      
      child.on('close', (code) => {
        // Clean up test file
        fs.unlink(testFilePath).catch(console.error);
        
        const result = {
          success: code === 0,
          output,
          errorOutput,
          exitCode: code,
          executionId
        };
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('Cypress execution error:', error);
    throw error;
  }
}

// Generate Cypress script from test suite
function generateCypressScript(testSuite) {
  let script = `describe('${testSuite.name}', () => {\n`;
  
  testSuite.steps.forEach((step, index) => {
    script += `  it('Step ${index + 1}: ${step.name}', () => {\n`;
    
    switch (step.type) {
      case 'navigation':
        script += `    cy.visit('${step.url}')\n`;
        if (step.waitFor) {
          script += `    cy.wait(${step.waitFor})\n`;
        }
        break;
        
      case 'click':
        script += `    cy.get('${step.selector}').click()\n`;
        break;
        
      case 'type':
        script += `    cy.get('${step.selector}').type('${step.value}')\n`;
        break;
        
      case 'assert':
        script += `    cy.get('${step.selector}').should('${step.assertion}', '${step.expectedValue}')\n`;
        break;
        
      case 'api':
        script += `    cy.request({\n`;
        script += `      method: '${step.method}',\n`;
        script += `      url: '${step.url}',\n`;
        if (step.headers) {
          script += `      headers: ${JSON.stringify(step.headers)},\n`;
        }
        if (step.body) {
          script += `      body: ${JSON.stringify(step.body)},\n`;
        }
        script += `    }).then((response) => {\n`;
        script += `      expect(response.status).to.eq(${step.expectedStatus || 200})\n`;
        script += `    })\n`;
        break;
    }
    
    script += `  })\n`;
  });
  
  script += `})\n`;
  return script;
}

module.exports = {
  executeCypressTest,
  generateCypressScript
};
