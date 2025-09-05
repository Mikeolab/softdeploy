// test-endpoints.js
const axios = require('axios');

async function testAllEndpoints() {
  console.log('🚀 TESTING ALL ENDPOINTS');
  console.log('======================================================================');
  
  const baseUrl = 'https://devops-real-app-staging.onrender.com';
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ TESTING HEALTH CHECK');
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/health`, { timeout: 10000 });
      console.log('✅ Health check successful:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: API Test Suite (Simple)
    console.log('\n2️⃣ TESTING API TEST SUITE');
    try {
      const apiTestSuite = {
        name: "Simple API Test",
        description: "Basic API test",
        testType: "API",
        toolId: "axios",
        baseUrl: "https://jsonplaceholder.typicode.com",
        steps: [
          {
            name: "Get Posts",
            type: "api",
            description: "Get all posts",
            config: {
              method: "GET",
              url: "/posts",
              validation: {
                statusCode: 200,
                responseTime: 5000
              }
            }
          }
        ]
      };
      
      const apiResponse = await axios.post(`${baseUrl}/api/execute-test-suite`, {
        testSuite: apiTestSuite
      }, { timeout: 30000 });
      
      console.log('✅ API test suite response:', apiResponse.status);
      console.log('📊 API test result:', {
        success: apiResponse.data.success,
        totalSteps: apiResponse.data.totalSteps,
        passedSteps: apiResponse.data.passedSteps,
        failedSteps: apiResponse.data.failedSteps,
        totalTime: apiResponse.data.totalTime
      });
      
    } catch (error) {
      console.log('❌ API test suite failed:', error.message);
    }
    
    // Test 3: Quick Test (Cypress)
    console.log('\n3️⃣ TESTING QUICK TEST (CYPRESS)');
    try {
      const cypressScript = `describe('Quick Test', () => {
  it('should visit example.com', () => {
    cy.visit('https://example.com')
    cy.contains('Example Domain').should('be.visible')
  })
})`;

      const quickTestResponse = await axios.post(`${baseUrl}/api/execute-quick-test`, {
        toolId: 'cypress',
        script: cypressScript,
        language: 'javascript',
        fileExtension: '.cy.js'
      }, { timeout: 120000 });

      console.log('✅ Quick Test response:', quickTestResponse.status);
      console.log('📊 Quick Test result:', {
        success: quickTestResponse.data.success,
        summary: quickTestResponse.data.summary,
        duration: quickTestResponse.data.duration,
        tests: quickTestResponse.data.tests
      });

    } catch (error) {
      console.log('❌ Quick Test failed:', error.message);
    }
    
    console.log('\n======================================================================');
    console.log('🎯 ENDPOINT TESTING COMPLETED');
    console.log('======================================================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllEndpoints().catch(console.error);
