const axios = require('axios');

async function testQuickTestEndpoint() {
  console.log('🚀 TESTING QUICK TEST ENDPOINT');
  console.log('======================================================================');
  
  const baseUrl = 'http://localhost:5000';
  
  // Test Cypress Quick Test
  console.log('1️⃣ TESTING CYPRESS QUICK TEST');
  try {
    const cypressScript = `describe('Quick Test', () => {
  it('should visit example.com', () => {
    cy.visit('https://example.com')
    cy.contains('Example Domain').should('be.visible')
  })
})`;

    const response = await axios.post(`${baseUrl}/api/execute-quick-test`, {
      toolId: 'cypress',
      script: cypressScript,
      language: 'javascript',
      fileExtension: '.cy.js'
    }, { timeout: 120000 });

    console.log('✅ Cypress Quick Test response:', response.status);
    console.log('📊 Result:', {
      success: response.data.success,
      summary: response.data.summary,
      duration: response.data.duration,
      tests: response.data.tests
    });

  } catch (error) {
    console.log('❌ Cypress Quick Test failed:', error.message);
  }

  // Test k6 Quick Test
  console.log('\n2️⃣ TESTING K6 QUICK TEST');
  try {
    const k6Script = `import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 2,
  duration: '5s',
};

export default function() {
  let response = http.get('https://httpbin.org/get');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}`;

    const response = await axios.post(`${baseUrl}/api/execute-quick-test`, {
      toolId: 'k6',
      script: k6Script,
      language: 'javascript',
      fileExtension: '.js'
    }, { timeout: 120000 });

    console.log('✅ k6 Quick Test response:', response.status);
    console.log('📊 Result:', {
      success: response.data.success,
      summary: response.data.summary,
      duration: response.data.duration,
      tests: response.data.tests
    });

  } catch (error) {
    console.log('❌ k6 Quick Test failed:', error.message);
  }

  // Test Playwright Quick Test
  console.log('\n3️⃣ TESTING PLAYWRIGHT QUICK TEST');
  try {
    const playwrightScript = `import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});`;

    const response = await axios.post(`${baseUrl}/api/execute-quick-test`, {
      toolId: 'playwright',
      script: playwrightScript,
      language: 'javascript',
      fileExtension: '.spec.js'
    }, { timeout: 120000 });

    console.log('✅ Playwright Quick Test response:', response.status);
    console.log('📊 Result:', {
      success: response.data.success,
      summary: response.data.summary,
      duration: response.data.duration,
      tests: response.data.tests
    });

  } catch (error) {
    console.log('❌ Playwright Quick Test failed:', error.message);
  }

  console.log('\n======================================================================');
  console.log('🎯 QUICK TEST ENDPOINT TESTING COMPLETED');
  console.log('======================================================================');
}

testQuickTestEndpoint().catch(console.error);
